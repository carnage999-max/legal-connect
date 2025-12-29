from django.urls import path
from . import views

app_name = 'messaging'

urlpatterns = [
    # Conversations
    path('conversations/', views.ConversationListView.as_view(), name='conversation-list'),
    path('conversations/create/', views.ConversationCreateView.as_view(), name='conversation-create'),
    path('conversations/<uuid:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),

    # Messages
    path('conversations/<uuid:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),
    path('messages/send/', views.MessageCreateView.as_view(), name='message-send'),
    path('messages/<uuid:pk>/', views.MessageDetailView.as_view(), name='message-detail'),

    # Read status
    path('mark-read/', views.MarkAsReadView.as_view(), name='mark-read'),
    path('unread-count/', views.UnreadCountView.as_view(), name='unread-count'),

    # Typing indicator
    path('typing/', views.TypingIndicatorView.as_view(), name='typing'),

    # Matter conversation
    path('matter/<uuid:matter_id>/', views.MatterConversationView.as_view(), name='matter-conversation'),
]
