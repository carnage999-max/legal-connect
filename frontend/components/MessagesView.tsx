'use client';

import React, { useEffect, useRef } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';

export type MessageItem = { id: number; content: string; sender: 'client' | 'attorney'; sent_at: string };
export type ConversationItem = { id: number; matter_id: number; unread_count: number; last_message_date: string };

/**
 * The conversation list and thread, shared by both portals. State and API
 * calls stay in the page; this only draws them.
 */
export function MessagesView({
  me,
  conversations,
  selected,
  onSelect,
  messages,
  draft,
  onDraft,
  onSend,
  sending,
  error,
}: {
  me: 'client' | 'attorney';
  conversations: ConversationItem[];
  selected: ConversationItem | null;
  onSelect: (c: ConversationItem) => void;
  messages: MessageItem[];
  draft: string;
  onDraft: (v: string) => void;
  onSend: (e: React.FormEvent) => void;
  sending: boolean;
  error?: string;
}) {
  const threadRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view without scrolling the whole page.
  useEffect(() => {
    const el = threadRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, selected?.id]);

  return (
    <div className="grid min-h-[70vh] gap-4 md:grid-cols-[280px_minmax(0,1fr)] lg:h-[calc(100vh-14rem)]">
      <section aria-label="Conversations" className="card flex min-h-0 flex-col overflow-hidden">
        <h2 className="border-b border-hairline px-5 py-4 text-sm font-semibold text-ink">Conversations</h2>
        <ul className="flex flex-1 gap-2 overflow-x-auto p-2 md:block md:space-y-1 md:overflow-y-auto md:overflow-x-hidden">
          {conversations.map((conv) => {
            const on = selected?.id === conv.id;
            return (
              <li key={conv.id} className="flex-none md:flex-auto">
                <button
                  onClick={() => onSelect(conv)}
                  aria-current={on ? 'true' : undefined}
                  className={`flex min-h-14 w-48 items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left transition-colors md:w-full ${
                    on ? 'bg-blue-50' : 'hover:bg-paper'
                  }`}
                >
                  <span className="min-w-0">
                    <span className={`block truncate text-[0.95rem] font-semibold ${on ? 'text-blue-600' : 'text-ink'}`}>Matter #{conv.matter_id}</span>
                    <span className="block text-xs text-mute">{new Date(conv.last_message_date).toLocaleDateString('en-US')}</span>
                  </span>
                  {conv.unread_count > 0 && (
                    <span className="grid h-6 min-w-6 flex-none place-items-center rounded-full bg-[#1e8e3e] px-1.5 text-xs font-bold text-white">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {selected && (
        <section aria-label={`Matter ${selected.matter_id} messages`} className="card flex min-h-[420px] min-w-0 flex-col overflow-hidden">
          <div className="flex items-center gap-3 border-b border-hairline px-5 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600">
              <MessageSquare size={18} />
            </span>
            <h2 className="font-semibold text-ink">Matter #{selected.matter_id}</h2>
          </div>

          {error && (
            <div role="alert" className="border-b border-[#fecdca] bg-[#fef3f2] px-5 py-3 text-sm text-[#912018]">
              {error}
            </div>
          )}

          <div ref={threadRef} className="max-h-[60vh] flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-5 lg:max-h-none" aria-live="polite">
            {messages.length === 0 ? (
              <p className="py-10 text-center text-mute">No messages yet. Say hello below.</p>
            ) : (
              messages.map((msg) => {
                const mine = msg.sender === me;
                return (
                  <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 sm:max-w-[70%] ${
                        mine ? 'rounded-br-md bg-[#1d6fc4] text-white' : 'rounded-bl-md bg-paper text-ink'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                      <p className={`mt-1 text-xs ${mine ? 'text-white/75' : 'text-mute'}`}>{new Date(msg.sent_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <form onSubmit={onSend} className="flex gap-2 border-t border-hairline p-3 sm:p-4">
            <label htmlFor="message-input" className="sr-only">
              Message
            </label>
            <input id="message-input" type="text" value={draft} onChange={(e) => onDraft(e.target.value)} placeholder="Type a message…" className="field flex-1" />
            <button type="submit" disabled={!draft.trim() || sending} className="btn btn-primary w-12 flex-none !px-0" aria-label="Send message">
              {sending ? <Spinner /> : <Send size={18} />}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
