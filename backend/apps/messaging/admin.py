from django.contrib import admin
from .models import Conversation, Message, MessageReadReceipt


class MessageInline(admin.TabularInline):
    model = Message
    extra = 0
    readonly_fields = ('sender', 'message_type', 'content', 'created_at')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'matter', 'conversation_type', 'is_active', 'created_at', 'last_message_at')
    list_filter = ('conversation_type', 'is_active', 'created_at')
    search_fields = ('matter__title', 'title')
    filter_horizontal = ('participants',)
    readonly_fields = ('id', 'created_at', 'updated_at', 'last_message_at')
    inlines = [MessageInline]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'message_type', 'is_read', 'created_at')
    list_filter = ('message_type', 'is_read', 'is_deleted', 'created_at')
    search_fields = ('content', 'sender__email')
    readonly_fields = ('id', 'created_at', 'updated_at', 'read_at')


@admin.register(MessageReadReceipt)
class MessageReadReceiptAdmin(admin.ModelAdmin):
    list_display = ('message', 'user', 'read_at')
    list_filter = ('read_at',)
    search_fields = ('user__email',)
    readonly_fields = ('message', 'user', 'read_at')
