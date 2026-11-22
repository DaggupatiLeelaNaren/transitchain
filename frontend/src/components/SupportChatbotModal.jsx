
import React, { useState, useEffect, useRef } from 'react';
import { chatService } from '../services/api';

import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Ticket,
  Loader2,
  ChevronDown
} from 'lucide-react';

export default function SupportChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      text: 'Hello! I am your TransitChain AI Assistant. How can I help you navigate Hyderabad today? Ask me about TGSRTC buses, HMRL metro lines, bookings, or journey planning.'
    }
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickPrompts = [
    'How to search a journey?',
    'Tell me about Metro Blue Line',
    'Bus 195W timings',
    'Check my latest booking',
    'Cancellation policy'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim();

    if (!text || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatService.sendMessage({ text });

      const responseData = res.data.data;

      const assistantMsg = {
        id: responseData.messageId || `asst_${Date.now()}`,
        sender: 'assistant',
        text: responseData.text,
        actionPayload: responseData.actionPayload
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'assistant',
          text: "I'm having trouble connecting to the support server right now. Please try again shortly."
        }
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-end sm:p-5 pointer-events-none">

      {/* Chat Window */}
      <section
        role="dialog"
        aria-modal="true"
        aria-label="TransitChain Assistant"
        className="pointer-events-auto w-full sm:w-[410px] h-[90dvh] sm:h-[640px] sm:max-h-[calc(100dvh-2.5rem)] bg-white sm:rounded-[28px] rounded-t-[28px] shadow-2xl shadow-violet-950/25 border border-violet-100 overflow-hidden flex flex-col animate-in fade-in slide-in-from-bottom-5 duration-200"
      >

        {/* Header */}
        <header className="relative overflow-hidden bg-gradient-to-br from-[#21143C] via-[#4C1D95] to-[#6D28D9] px-5 py-5 text-white">
          <div className="absolute -right-12 -top-16 w-44 h-44 rounded-full bg-violet-300/20 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold tracking-tight">
                    TransitChain Assistant
                  </h2>
                  <Sparkles className="w-3.5 h-3.5 text-violet-200" />
                </div>

                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-semibold text-violet-200">
                    Live Transit Knowledge Base
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close assistant"
              className="w-9 h-9 shrink-0 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:bg-white/20 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative z-10 mt-4 rounded-xl bg-white/10 border border-white/10 px-3 py-2.5">
            <p className="text-[11px] text-violet-100 leading-relaxed">
              Ask me about Hyderabad buses, metro routes, journey planning,
              bookings and travel information.
            </p>
          </div>
        </header>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-gradient-to-b from-[#FAF8FF] to-white"
          aria-live="polite"
        >
          {messages.map((message) => {
            const isUser = message.sender === 'user';

            return (
              <div
                key={message.id}
                className={`flex items-end gap-2.5 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="w-8 h-8 shrink-0 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[83%] rounded-2xl px-4 py-3 shadow-sm ${
                    isUser
                      ? 'bg-gradient-to-br from-violet-700 to-purple-600 text-white rounded-br-md'
                      : 'bg-white border border-violet-100 text-slate-700 rounded-bl-md'
                  }`}
                >
                  <p className="text-xs leading-[1.8] whitespace-pre-line break-words">
                    {message.text}
                  </p>

                  {message.actionPayload?.booking && (
                    <div className="mt-3 pt-3 border-t border-violet-100">
                      <div className="flex items-center gap-2 text-emerald-700">
                        <Ticket className="w-4 h-4" />
                        <span className="text-[11px] font-extrabold">
                          Ticket Ready
                        </span>
                      </div>

                      <div className="mt-2 rounded-xl bg-emerald-50 border border-emerald-100 p-3">
                        <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-600">
                          Booking Reference / PNR
                        </p>

                        <p className="text-sm font-extrabold font-mono text-emerald-800 mt-1">
                          {message.actionPayload.booking.bookingReference}
                        </p>
                      </div>
                    </div>
                  )}

                  <p
                    className={`text-[9px] mt-2 ${
                      isUser ? 'text-violet-200' : 'text-slate-400'
                    }`}
                  >
                    {isUser ? 'You' : 'TransitChain Assistant'}
                  </p>
                </div>

                {isUser && (
                  <div className="w-8 h-8 shrink-0 rounded-xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex items-end gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-violet-100 border border-violet-200 flex items-center justify-center text-violet-700">
                <Bot className="w-4 h-4" />
              </div>

              <div className="bg-white border border-violet-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0.3s]" />
                  <span className="text-[10px] text-slate-400 ml-2">
                    Thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-3 bg-white border-t border-violet-100">
          <div className="flex items-center gap-2 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-600" />
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-500">
              Suggested Questions
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="shrink-0 text-[10px] font-semibold bg-violet-50 hover:bg-violet-100 border border-violet-100 hover:border-violet-300 text-violet-700 rounded-full px-3 py-2 transition-all disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 bg-white border-t border-violet-100">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />

              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about routes, bookings, fares..."
                maxLength={1000}
                disabled={loading}
                className="w-full bg-[#F7F5FC] border border-violet-100 rounded-xl pl-10 pr-4 py-3.5 text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100 transition-all disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || loading}
              aria-label="Send message"
              className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-violet-700 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-violet-200 hover:shadow-violet-300 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>

          <p className="text-center text-[9px] text-slate-400 mt-3">
            TransitChain Assistant · Travel smarter, travel better
          </p>
        </div>
      </section>
    </div>
  );
}
