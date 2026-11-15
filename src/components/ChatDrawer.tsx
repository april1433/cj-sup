import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldCheck, Sparkles, Image, CheckCheck, Phone, ChevronLeft, RefreshCw } from 'lucide-react';
import { Conversation, Message, UserProfile } from '../types';
import { fetchMessages, sendMessage, fetchConversations } from '../lib/supabase';

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  activeConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  user,
  activeConversation,
  onSelectConversation,
}) => {
  if (!isOpen) return null;

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load user's conversations
  const loadConversations = async () => {
    if (!user) return;
    try {
      const list = await fetchConversations(user);
      setConversations(list);
      if (!activeConversation && list.length > 0) {
        onSelectConversation(list[0]);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  // Load messages whenever active conversation changes
  const loadMessages = async () => {
    if (!activeConversation) return;
    try {
      setLoading(true);
      const msgs = await fetchMessages(activeConversation.id);
      setMessages(msgs);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [activeConversation]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for simulated live messages in demo mode
  useEffect(() => {
    const handleLiveMessage = (e: any) => {
      const newMsg = e.detail as Message;
      if (activeConversation && newMsg.conversation_id === activeConversation.id) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };
    window.addEventListener('ivault_message_received', handleLiveMessage);
    return () => window.removeEventListener('ivault_message_received', handleLiveMessage);
  }, [activeConversation]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !activeConversation || !user) return;

    setInputText('');

    const isStaffUser = user.role === 'staff' || user.role === 'admin';

    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: activeConversation.id,
      sender_id: user.id,
      sender_name: isStaffUser ? 'Store Staff' : user.full_name,
      sender_avatar: user.avatar_url,
      message_text: text,
      is_staff: isStaffUser,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      await sendMessage({
        conversation_id: activeConversation.id,
        sender_id: user.id,
        sender_name: isStaffUser ? `${user.full_name} (Staff)` : user.full_name,
        sender_avatar: user.avatar_url,
        message_text: text,
        is_staff: isStaffUser,
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slideLeft">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 apple-glass flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Phone className="w-5 h-5" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-sm text-gray-900">iVault Specialist Desk</h3>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] text-emerald-600 font-medium">
              Verified Staff Online • Fast Reply
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition"
          aria-label="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Attached iPhone Banner Context */}
      {activeConversation?.iphone_preview && (
        <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-3 text-xs">
          <img
            src={activeConversation.iphone_preview.image}
            alt={activeConversation.iphone_preview.model}
            className="w-10 h-10 object-contain bg-white rounded-lg p-0.5 border border-gray-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="font-bold text-gray-900 block truncate">
              {activeConversation.iphone_preview.model} ({activeConversation.iphone_preview.storage})
            </span>
            <span className="text-gray-500 text-[11px]">
              {activeConversation.iphone_preview.color} • <strong className="text-blue-600">${activeConversation.iphone_preview.price}</strong>
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
            Subject
          </span>
        </div>
      )}

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8f8fa]">
        {loading && messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-gray-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 px-4 text-xs text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">Welcome to iVault Store Chat</p>
            <p>Type a message below to inquire, reserve a phone, or ask about trade-in pricing.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Name label */}
                <span className="text-[10px] text-gray-400 mb-0.5 px-1 flex items-center gap-1">
                  {msg.is_staff && <ShieldCheck className="w-3 h-3 text-blue-600 inline" />}
                  {msg.sender_name}
                </span>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs leading-relaxed whitespace-pre-wrap ${
                    isMe
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : msg.is_staff
                      ? 'bg-white text-gray-900 border border-gray-200/90 rounded-bl-xs'
                      : 'bg-gray-200 text-gray-900 rounded-bl-xs'
                  }`}
                >
                  {msg.message_text}
                </div>

                {/* Timestamp */}
                <span className="text-[9px] text-gray-400 mt-0.5 px-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions Chips */}
      <div className="p-2 border-t border-gray-100 bg-white overflow-x-auto flex gap-1.5 scrollbar-none text-[11px]">
        <button
          onClick={() => handleQuickQuestion('Is this iPhone still available?')}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
        >
          Available?
        </button>
        <button
          onClick={() => handleQuickQuestion("What's the best cash price for this?")}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
        >
          Best Price?
        </button>
        <button
          onClick={() => handleQuickQuestion('Can you hold/reserve this for me today?')}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
        >
          Hold / Reserve
        </button>
        <button
          onClick={() => handleQuickQuestion('Where can we meet or pick up?')}
          className="whitespace-nowrap px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
        >
          Location
        </button>
      </div>

      {/* Message Input Box */}
      <div className="p-3 bg-white border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to staff..."
            className="flex-1 px-4 py-2.5 rounded-full border border-gray-300 text-xs bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white flex items-center justify-center transition active:scale-95 shrink-0"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
