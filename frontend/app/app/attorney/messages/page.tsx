'use client';
import { useEffect, useState } from 'react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
import { Mail } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/ui/Page';
import { MessagesView } from '@/components/MessagesView';
import { DashboardLoadingSkeleton } from '@/components/DashboardLoadingSkeleton';
import { apiGet, apiPost } from '@/lib/api';

interface Message {
  id: number;
  content: string;
  sender: 'client' | 'attorney';
  sent_at: string;
}

interface Conversation {
  id: number;
  matter_id: number;
  unread_count: number;
  last_message_date: string;
}

export default function AttorneyMessagesPage(): React.ReactNode {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadConversations() {
      try {
        const res = await apiGet('/api/v1/messaging/conversations/');
        setConversations(res?.results || []);
        if (res?.results?.length > 0) {
          setSelectedConversation(res.results[0]);
        }
      } catch (e) {
        setError('Failed to load conversations');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, []);

  useEffect(() => {
    if (!selectedConversation) return;

    async function loadMessages() {
      try {
        const res = await apiGet(`/api/v1/messaging/conversations/${selectedConversation!.id}/messages/`);
        setMessages(res?.results || []);
      } catch (e) {
        console.error(e);
      }
    }
    loadMessages();
  }, [selectedConversation]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      await apiPost('/api/v1/messaging/messages/', {
        conversation_id: selectedConversation.id,
        content: newMessage,
      });
      setNewMessage('');

      // Reload messages
      const res = await apiGet(`/api/v1/messaging/conversations/${selectedConversation.id}/messages/`);
      setMessages(res?.results || []);
    } catch (e) {
      setError('Failed to send message');
      console.error(e);
    } finally {
      setSending(false);
    }
  }

  return (
    <AttorneyLayout>
      <PageHeader title="Messages" description="Secure conversations about your matters." />
      {loading ? (
        <DashboardLoadingSkeleton />
      ) : conversations.length === 0 ? (
        <EmptyState icon={Mail} title="No conversations yet" text="Messages will appear here when clients contact you." />
      ) : (
        <MessagesView
          me="attorney"
          conversations={conversations}
          selected={selectedConversation}
          onSelect={setSelectedConversation}
          messages={messages}
          draft={newMessage}
          onDraft={setNewMessage}
          onSend={handleSendMessage}
          sending={sending}
          error={error}
        />
      )}
    </AttorneyLayout>
  );
}
