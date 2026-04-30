"use client";

import React, { useState, useCallback } from "react";
import { Mail, Search, Clock, Trash2, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import type { ContactMessage } from "@/lib/supabase/types";
import { markMessageAsRead, deleteMessage } from "@/actions/messages";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";

interface MessagesPageProps {
  initialMessages: ContactMessage[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MessagesPage({ initialMessages }: MessagesPageProps) {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages);
  const [activeTab, setActiveTab] = useState("all");
  const [activeMessageId, setActiveMessageId] = useState<string | null>(
    initialMessages.length > 0 ? initialMessages[0].id : null
  );
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const { confirm } = useConfirm();

  const isAdmin = true;
  const unreadCount = messages.filter(m => !m.is_read).length;

  // Real-time subscription for contact messages
  useRealtimeSubscription<ContactMessage>({
    table: 'contact_messages',
    onInsert: useCallback((newMessage: ContactMessage) => {
      setMessages(prev => [newMessage, ...prev]);
    }, []),
    onUpdate: useCallback((updatedMessage: ContactMessage) => {
      setMessages(prev => prev.map(m => m.id === updatedMessage.id ? updatedMessage : m));
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setMessages(prev => prev.filter(m => m.id !== id));
      setActiveMessageId(prev => prev === id ? null : prev);
    }, []),
  });

  // Helper to add/remove loading state
  const setLoading = (id: string, isLoading: boolean) => {
    setLoadingIds(prev => {
      const next = new Set(prev);
      if (isLoading) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  // Mark as read handler
  const handleMarkAsRead = async (message: ContactMessage) => {
    if (message.is_read) return;
    setLoading(message.id, true);
    const { error } = await markMessageAsRead(message.id, true);
    setLoading(message.id, false);
    if (error) {
      toast.error(`Failed to mark message as read: ${error}`);
    } else {
      toast.success("Message marked as read");
    }
  };

  // Delete handler
  const handleDelete = async (message: ContactMessage) => {
    const isConfirmed = await confirm({
      title: "Delete Message",
      message: `Are you sure you want to delete this message from ${message.name}? This action cannot be undone.`,
      confirmText: "Delete",
      isDestructive: true,
    });
    if (!isConfirmed) return;
    setLoading(message.id, true);
    const { error } = await deleteMessage(message.id);
    setLoading(message.id, false);
    if (error) {
      toast.error(`Failed to delete message: ${error}`);
    } else {
      toast.success("Message deleted");
    }
  };

  const filteredMessages = messages.filter(m => {
    if (activeTab === "unread") return !m.is_read;
    if (activeTab === "read") return m.is_read;
    return true;
  });

  const activeMessage = messages.find(m => m.id === activeMessageId);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <div className="text-xs text-white/50 mb-1 flex items-center gap-2">
            <span>Admin Dashboard</span>
            <span>/</span>
            <span className="text-white/80">Messages</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-3">
            Contact Messages / الرسائل
            {unreadCount > 0 && (
              <span className="bg-yellow text-navy text-xs px-2 py-0.5 rounded-full">{unreadCount} New</span>
            )}
          </h2>
        </div>
      </div>

      <div className="flex-1 bg-surface rounded-2xl border border-border-input overflow-hidden flex shadow-xl">
        
        {/* Left Panel: List — hidden on mobile when detail is open */}
        <div className={`w-full lg:w-[35%] lg:min-w-[320px] bg-surface-deep border-r border-border-input flex flex-col h-full ${mobileShowDetail ? 'hidden lg:flex' : 'flex'}`}>
          {/* Search & Filters */}
          <div className="p-4 border-b border-border-input space-y-4">
            <div className="relative group">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-[#020F1C] text-sm text-white border border-border-input rounded-lg pl-9 pr-4 py-2.5 focus:outline-none focus:border-yellow transition-all"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'unread', 'read'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 text-xs font-bold rounded-full capitalize transition-colors ${
                    activeTab === tab 
                      ? "bg-yellow text-navy" 
                      : "bg-surface text-white/50 hover:text-white border border-border-input"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#FFEE34] scrollbar-track-transparent">
            {filteredMessages.length > 0 ? (
              <div className="divide-y divide-[#14304A]">
                {filteredMessages.map(msg => (
                  <button 
                    key={msg.id}
                    onClick={() => { setActiveMessageId(msg.id); setMobileShowDetail(true); }}
                    className={`w-full text-left p-4 transition-colors relative flex gap-3 ${
                      activeMessageId === msg.id ? "bg-surface" : "hover:bg-surface/50"
                    }`}
                  >
                    {/* Unread indicator */}
                    {!msg.is_read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow" />
                    )}
                    <div className="mt-1">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${!msg.is_read ? 'bg-yellow text-navy' : 'bg-border-input text-white/50'}`}>
                        {msg.name.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className={`text-sm truncate ${!msg.is_read ? 'font-bold text-white' : 'text-white/80'}`}>{msg.name}</span>
                        <span className="text-[10px] text-white/40 flex-shrink-0 ml-2">{formatDateShort(msg.created_at)}</span>
                      </div>
                      <p className={`text-xs mb-1 truncate ${!msg.is_read ? 'text-white/90 font-medium' : 'text-white/60'}`}>
                        {msg.message.substring(0, 60)}...
                      </p>
                      <p className="text-xs text-white/40 line-clamp-1">{msg.message}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-white/40">
                <Mail className="w-12 h-12 mb-3 opacity-20" />
                <p>لا توجد رسائل الم المحددة</p>
                <p className="text-xs mt-1">No messages found matching criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel: Detail — hidden on mobile when list is shown */}
        <div className={`flex-1 bg-surface flex flex-col h-full ${mobileShowDetail ? 'flex' : 'hidden lg:flex'}`}>
          {activeMessage ? (
            <>
              {/* Detail Header */}
              <div className="p-4 md:p-6 border-b border-border-input bg-surface-deep/50 sticky top-0 flex justify-between items-start gap-4">
                <div className="flex gap-3 md:gap-4 items-start">
                  {/* Back button — mobile only */}
                  <button
                    className="lg:hidden mt-1 p-1 -ml-1 text-white/50 hover:text-white transition-colors flex-shrink-0"
                    onClick={() => setMobileShowDetail(false)}
                    aria-label="Back to messages"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 rounded-full bg-border-input flex items-center justify-center text-xl font-bold text-yellow flex-shrink-0">
                    {activeMessage.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg md:text-2xl font-bold text-white leading-tight">{activeMessage.name}</h2>
                    <div className="flex items-center gap-4 mt-1 text-sm text-white/60">
                      <a href={`mailto:${activeMessage.email}`} className="hover:text-yellow transition-colors">{activeMessage.email}</a>
                      {activeMessage.phone && (
                        <>
                          <span className="w-1 h-1 bg-white/20 rounded-full" />
                          <a href={`tel:${activeMessage.phone}`} className="hover:text-yellow transition-colors">{activeMessage.phone}</a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2 text-xs text-white/50 bg-[#020F1C] px-3 py-1.5 rounded-lg border border-border-input">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(activeMessage.created_at)}</span>
                  </div>
                  <div className="flex gap-2">
                    {!activeMessage.is_read && (
                      <button 
                        onClick={() => handleMarkAsRead(activeMessage)}
                        disabled={loadingIds.has(activeMessage.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-yellow bg-yellow/10 hover:bg-yellow/20 border border-yellow/30 px-3 py-1.5 rounded transition-colors disabled:opacity-50"
                      >
                        {loadingIds.has(activeMessage.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        Mark as Read
                      </button>
                    )}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(activeMessage)}
                        disabled={loadingIds.has(activeMessage.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 px-3 py-1.5 rounded transition-colors disabled:opacity-50" 
                        title="Super Admin Only"
                      >
                        {loadingIds.has(activeMessage.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Detail Body */}
              <div className="p-8 flex-1 overflow-y-auto whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-['Cairo']">
                <h3 className="text-lg font-bold text-white mb-6 border-b border-border-input pb-4">Message</h3>
                {activeMessage.message}
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-white/40">
              <div className="w-24 h-24 bg-surface-deep rounded-full flex items-center justify-center mb-4">
                <Mail className="w-10 h-10 text-border-input" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1">اختر رسالة لعرضها</h3>
              <p>Select a message from the list to read</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
