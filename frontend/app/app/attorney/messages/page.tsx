'use client';
import { useEffect, useState } from 'react';
import { AttorneyLayout } from '@/components/AttorneyLayout';
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

  if (loading) {
    return (
      <AttorneyLayout>
        <div className="flex items-center justify-center p-12">
          <Loader size={32} className="animate-spin" />
        </div>
      </AttorneyLayout>
    );
  }

  if (conversations.length === 0) {
    return (
      <AttorneyLayout>
        <div className="text-center py-12">
          <Mail size={48} className="mx-auto mb-4 text-lctextattorney-secondary" />
          <h1 className="text-2xl font-semibold mb-2">No conversations yet</h1>
          <p className="text-lctextattorney-secondary">Messages will appear here when clients contact you.</p>
        </div>
      </AttorneyLayout>
    );
  }

  return (
    <AttorneyLayout>
      <div className="h-full flex gap-6">
        {/* Conversations List */}
        <div className="w-72 bg-lcbgattorney rounded-lg overflow-hidden flex flex-col border border-lcborder-attorney">
          <div className="p-4 border-b border-lcborder-attorney">
            <h2 className="font-semibold text-lctextattorney-primary">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 text-left border-b border-lcborder-attorney hover:bg-lcbgattorney-secondary transition ${
                  selectedConversation?.id === conv.id ? 'bg-lcaccentattorney/10' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-lctextattorney-primary">Matter #{conv.matter_id}</span>
                  {conv.unread_count > 0 && (
                    <span className="bg-lcaccentattorney text-white text-xs rounded-full px-2 py-1">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-xs text-lctextattorney-secondary mt-1">{new Date(conv.last_message_date).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        {selectedConversation && (
          <div className="flex-1 bg-lcbgattorney rounded-lg flex flex-col border border-lcborder-attorney">
            <div className="p-4 border-b border-lcborder-attorney">
              <h3 className="font-semibold text-lctextattorney-primary">Matter #{selectedConversation.matter_id}</h3>
            </div>

            {error && <div className="bg-red-50 border-b border-red-200 text-red-700 p-3">{error}</div>}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-lctextattorney-secondary py-8">No messages yet</div>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'attorney' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        msg.sender === 'attorney'
                          ? 'bg-lcaccentattorney text-white'
                          : 'bg-lcbgattorney-secondary text-lctextattorney-primary'
                      }`}
                    >
                      <p>{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.sender === 'attorney' ? 'text-white/70' : 'text-lctextattorney-secondary'}`}>
                        {new Date(msg.sent_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-lcborder-attorney flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-lcborder-attorney rounded-lg focus:outline-none focus:ring-2 focus:ring-lcaccentattorney bg-lcbgattorney-secondary text-lctextattorney-primary"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-lcaccentattorney text-white rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
              >
                {sending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        )}
      </div>
    </AttorneyLayout>
  );
}
