import React from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import type { ContactMessage } from "@/lib/supabase/types";

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

export function RecentMessagesWidget({ messages }: { messages: ContactMessage[] }) {
  return (
    <div className="bg-[#0A1F33] rounded-xl border border-[#14304A] p-5">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-lg font-bold text-white mb-1">Recent Messages</h2>
          <p className="text-xs text-white/50 uppercase tracking-wide">الرسائل الأخيرة</p>
        </div>
        <Link href="/admin/messages" className="text-sm text-[#FFEE34] hover:underline font-semibold">
          View All
        </Link>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-white/50">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="relative p-4 rounded-lg bg-[#061520] border border-[#14304A] hover:border-[#FFEE34]/30 transition-colors cursor-pointer group">
              {msg.is_read === false && (
                <div className="absolute top-4 left-3 w-2 h-2 rounded-full bg-[#FFEE34] shadow-[0_0_8px_#FFEE34]" />
              )}
              <div className={`pl-4 ${msg.is_read && 'pl-0'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-white group-hover:text-[#FFEE34] transition-colors">{msg.name}</h4>
                  <span className="text-xs text-white/40">{formatTimeAgo(msg.created_at)}</span>
                </div>
                <p className="text-xs text-white/50 mb-2">{msg.email}</p>
                <p className="text-sm text-white/80 line-clamp-1">{msg.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
