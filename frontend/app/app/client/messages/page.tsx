'use client';
import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { Mail, Send, Loader } from 'lucide-react';
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

export default function ClientMessagesPage(): React.ReactNode {
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

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex items-center justify-center p-12">
          <Loader size={32} className="animate-spin" />
        </div>
      </ClientLayout>
    );
  }

  if (conversations.length === 0) {
    return (
      <ClientLayout>
        <div className="text-center py-12">
          <Mail size={48} className="mx-auto mb-4 text-lctextsecondary" />
          <h1 className="text-2xl font-semibold mb-2">No conversations yet</h1>
          <p className="text-lctextsecondary">Start a matter to begin communicating with your attorney.</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="h-full flex gap-6">
        {/* Conversations List */}
        <div className="w-72 bg-white border border-lcborder rounded-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-lcborder">
            <h2 className="font-semibold text-lctextprimary">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 text-left border-b border-lcborder hover:bg-gray-50 transition ${
                  selectedConversation?.id === conv.id ? 'bg-lcaccentclient/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lctextprimary">Matter #{conv.matter_id}</span>
                  {conv.unread_count > 0 && (
                    <span className="bg-lcaccentclient text-white text-xs rounded-full px-2 py-1">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-lctextsecondary mt-1">{new Date(conv.last_message_date).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        {selectedConversation && (
          <div className="flex-1 bg-white border border-lcborder rounded-lg flex flex-col">
            <div className="p-4 border-b border-lcborder">
              <h3 className="font-semibold text-lctextprimary">Matter #{selectedConversation.matter_id}</h3>
            </div>

            {error && <div className="bg-red-50 border-b border-red-200 text-red-700 p-3">{error}</div>}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-lctextsecondary py-8">No messages yet</div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === 'client'
                          ? 'bg-lcaccentclient text-white'
                          : 'bg-gray-100 text-lctextprimary'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'client' ? 'text-white/70' : 'text-lctextsecondary'}`}>
                        {new Date(msg.sent_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-lcborder flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-lcborder rounded-lg focus:outline-none focus:ring-2 focus:ring-lcaccentclient"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-lcaccentclient text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
