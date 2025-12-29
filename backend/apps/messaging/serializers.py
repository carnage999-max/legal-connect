from rest_framework import serializers
from django.utils import timezone

from .models import Conversation, Message, MessageReadReceipt


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages."""

    sender_name = serializers.CharField(source='sender.full_name', read_only=True)
    sender_avatar = serializers.ImageField(source='sender.avatar', read_only=True)
    is_own = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            'id', 'conversation', 'sender', 'sender_name', 'sender_avatar',
            'message_type', 'content', 'file', 'file_name', 'file_size', 'file_type',
            'is_read', 'is_edited', 'is_deleted', 'reply_to',
            'created_at', 'updated_at', 'read_at', 'is_own'
        ]
        read_only_fields = [
            'id', 'sender', 'is_read', 'is_edited',
            'created_at', 'updated_at', 'read_at'
        ]

    def get_is_own(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.sender_id == request.user.id
        return False


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages."""

    class Meta:
        model = Message
        fields = ['conversation', 'message_type', 'content', 'file', 'reply_to']

    def validate_conversation(self, value):
        request = self.context.get('request')
        if not value.participants.filter(id=request.user.id).exists():
            raise serializers.ValidationError(
                "You are not a participant in this conversation."
            )
        return value

    def create(self, validated_data):
        validated_data['sender'] = self.context['request'].user

        # Handle file upload
        if 'file' in validated_data and validated_data['file']:
            file = validated_data['file']
            validated_data['file_name'] = file.name
            validated_data['file_size'] = file.size
            validated_data['file_type'] = file.content_type

            # Determine message type from file
            if file.content_type.startswith('image/'):
                validated_data['message_type'] = Message.MessageType.IMAGE
            elif file.content_type.startswith('audio/'):
                validated_data['message_type'] = Message.MessageType.VOICE
            else:
                validated_data['message_type'] = Message.MessageType.FILE

        return super().create(validated_data)


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations."""

    participants = serializers.SerializerMethodField()
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    matter_title = serializers.CharField(source='matter.title', read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id', 'matter', 'matter_title', 'conversation_type',
            'title', 'participants', 'is_active',
            'last_message', 'unread_count',
            'created_at', 'last_message_at'
        ]

    def get_participants(self, obj):
        return [
            {
                'id': str(p.id),
                'name': p.full_name,
                'avatar': p.avatar.url if p.avatar else None,
                'user_type': p.user_type
            }
            for p in obj.participants.all()
        ]

    def get_last_message(self, obj):
        last_msg = obj.messages.order_by('-created_at').first()
        if last_msg:
            return {
                'id': str(last_msg.id),
                'content': last_msg.content[:100] if last_msg.content else '',
                'message_type': last_msg.message_type,
                'sender_name': last_msg.sender.full_name if last_msg.sender else 'System',
                'created_at': last_msg.created_at
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.messages.filter(
                is_read=False
            ).exclude(sender=request.user).count()
        return 0


class ConversationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a conversation."""

    participant_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Conversation
        fields = ['matter', 'conversation_type', 'title', 'participant_ids']

    def create(self, validated_data):
        participant_ids = validated_data.pop('participant_ids', [])
        request = self.context['request']

        conversation = Conversation.objects.create(**validated_data)

        # Add current user as participant
        conversation.participants.add(request.user)

        # Add other participants
        from django.contrib.auth import get_user_model
        User = get_user_model()
        for pid in participant_ids:
            try:
                user = User.objects.get(id=pid)
                conversation.participants.add(user)
            except User.DoesNotExist:
                pass

        # If matter-related, add client and attorney
        if validated_data.get('matter'):
            matter = validated_data['matter']
            conversation.participants.add(matter.client)
            if matter.attorney:
                conversation.participants.add(matter.attorney.user)

        return conversation


class MarkAsReadSerializer(serializers.Serializer):
    """Serializer for marking messages as read."""

    message_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False
    )
    conversation_id = serializers.UUIDField(required=False)

    def validate(self, data):
        if not data.get('message_ids') and not data.get('conversation_id'):
            raise serializers.ValidationError(
                "Either message_ids or conversation_id must be provided."
            )
        return data


class TypingIndicatorSerializer(serializers.Serializer):
    """Serializer for typing indicator updates."""

    conversation_id = serializers.UUIDField()
    is_typing = serializers.BooleanField()
