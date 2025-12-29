from rest_framework import generics, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.db.models import Q, Count

from .models import Conversation, Message, MessageReadReceipt, TypingIndicator
from .serializers import (
    ConversationSerializer, ConversationCreateSerializer,
    MessageSerializer, MessageCreateSerializer,
    MarkAsReadSerializer, TypingIndicatorSerializer
)


class ConversationListView(generics.ListAPIView):
    """List conversations for current user."""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user,
            is_active=True
        ).prefetch_related('participants', 'messages').order_by('-last_message_at')


class ConversationCreateView(generics.CreateAPIView):
    """Create a new conversation."""

    serializer_class = ConversationCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class ConversationDetailView(generics.RetrieveAPIView):
    """Get conversation details."""

    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(
            participants=self.request.user
        ).prefetch_related('participants')


class MessageListView(generics.ListAPIView):
    """List messages in a conversation."""

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        conversation_id = self.kwargs['conversation_id']
        return Message.objects.filter(
            conversation_id=conversation_id,
            conversation__participants=self.request.user,
            is_deleted=False
        ).select_related('sender').order_by('created_at')


class MessageCreateView(generics.CreateAPIView):
    """Send a message."""

    serializer_class = MessageCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]


class MessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a message."""

    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(
            sender=self.request.user,
            is_deleted=False
        )

    def perform_update(self, serializer):
        serializer.save(is_edited=True)

    def perform_destroy(self, instance):
        # Soft delete
        instance.is_deleted = True
        instance.content = "[Message deleted]"
        instance.save()


class MarkAsReadView(APIView):
    """Mark messages as read."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = MarkAsReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        now = timezone.now()
        user = request.user

        if serializer.validated_data.get('conversation_id'):
            # Mark all messages in conversation as read
            messages = Message.objects.filter(
                conversation_id=serializer.validated_data['conversation_id'],
                conversation__participants=user,
                is_read=False
            ).exclude(sender=user)

            message_ids = list(messages.values_list('id', flat=True))
            messages.update(is_read=True, read_at=now)

        elif serializer.validated_data.get('message_ids'):
            message_ids = serializer.validated_data['message_ids']
            Message.objects.filter(
                id__in=message_ids,
                conversation__participants=user,
                is_read=False
            ).exclude(sender=user).update(is_read=True, read_at=now)

        # Create read receipts
        for msg_id in message_ids:
            MessageReadReceipt.objects.get_or_create(
                message_id=msg_id,
                user=user
            )

        return Response({'marked_read': len(message_ids)})


class TypingIndicatorView(APIView):
    """Update typing indicator."""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = TypingIndicatorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        conversation_id = serializer.validated_data['conversation_id']
        is_typing = serializer.validated_data['is_typing']

        # Verify user is participant
        if not Conversation.objects.filter(
            id=conversation_id,
            participants=request.user
        ).exists():
            return Response(
                {'detail': 'Not a participant in this conversation.'},
                status=status.HTTP_403_FORBIDDEN
            )

        TypingIndicator.objects.update_or_create(
            conversation_id=conversation_id,
            user=request.user,
            defaults={'is_typing': is_typing}
        )

        return Response({'status': 'ok'})


class UnreadCountView(APIView):
    """Get total unread message count."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False
        ).exclude(sender=request.user).count()

        return Response({'unread_count': count})


class MatterConversationView(APIView):
    """Get or create conversation for a matter."""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, matter_id):
        from apps.matters.models import Matter

        try:
            matter = Matter.objects.get(pk=matter_id)
        except Matter.DoesNotExist:
            return Response(
                {'detail': 'Matter not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if user is involved in this matter
        if request.user != matter.client and (
            not matter.attorney or request.user != matter.attorney.user
        ):
            return Response(
                {'detail': 'You are not involved in this matter.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Get or create conversation
        conversation, created = Conversation.objects.get_or_create(
            matter=matter,
            conversation_type=Conversation.ConversationType.MATTER,
            defaults={'title': matter.title}
        )

        # Ensure participants are added
        conversation.participants.add(matter.client)
        if matter.attorney:
            conversation.participants.add(matter.attorney.user)

        serializer = ConversationSerializer(
            conversation,
            context={'request': request}
        )
        return Response({
            'created': created,
            'conversation': serializer.data
        })
