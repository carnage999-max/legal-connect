import uuid
from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Conversation(models.Model):
    """A conversation between two or more users."""

    class ConversationType(models.TextChoices):
        MATTER = 'matter', _('Matter Related')
        DIRECT = 'direct', _('Direct Message')
        SUPPORT = 'support', _('Support')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Related matter (optional)
    matter = models.ForeignKey(
        'matters.Matter',
        on_delete=models.CASCADE,
        null=True, blank=True,
        related_name='conversations'
    )

    conversation_type = models.CharField(
        max_length=20,
        choices=ConversationType.choices,
        default=ConversationType.MATTER
    )

    # Participants
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations'
    )

    # Metadata
    title = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_message_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('conversation')
        verbose_name_plural = _('conversations')
        ordering = ['-last_message_at', '-created_at']

    def __str__(self):
        if self.matter:
            return f"Conversation: {self.matter.title}"
        return f"Conversation: {self.id}"

    @property
    def unread_count(self):
        """This should be called with a user context."""
        return 0  # Implemented in view


class Message(models.Model):
    """A message within a conversation."""

    class MessageType(models.TextChoices):
        TEXT = 'text', _('Text')
        FILE = 'file', _('File')
        IMAGE = 'image', _('Image')
        VOICE = 'voice', _('Voice Note')
        SYSTEM = 'system', _('System Message')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_messages'
    )

    # Message content
    message_type = models.CharField(
        max_length=20,
        choices=MessageType.choices,
        default=MessageType.TEXT
    )
    content = models.TextField(blank=True)

    # File attachment
    file = models.FileField(upload_to='message_files/', blank=True, null=True)
    file_name = models.CharField(max_length=255, blank=True)
    file_size = models.PositiveIntegerField(null=True, blank=True)
    file_type = models.CharField(max_length=100, blank=True)

    # Status
    is_read = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

    # Reply to another message
    reply_to = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='replies'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = _('message')
        verbose_name_plural = _('messages')
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender} at {self.created_at}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update conversation's last_message_at
        self.conversation.last_message_at = self.created_at
        self.conversation.save(update_fields=['last_message_at', 'updated_at'])


class MessageReadReceipt(models.Model):
    """Track when users read messages."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message = models.ForeignKey(
        Message,
        on_delete=models.CASCADE,
        related_name='read_receipts'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='message_read_receipts'
    )
    read_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = _('message read receipt')
        verbose_name_plural = _('message read receipts')
        unique_together = ['message', 'user']

    def __str__(self):
        return f"{self.user} read message at {self.read_at}"


class TypingIndicator(models.Model):
    """Track typing status for real-time updates."""

    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name='typing_indicators'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='typing_indicators'
    )
    is_typing = models.BooleanField(default=False)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['conversation', 'user']

    def __str__(self):
        status = "typing" if self.is_typing else "not typing"
        return f"{self.user} is {status}"
