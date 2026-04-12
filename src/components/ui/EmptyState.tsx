'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  /** A Lucide icon component to display. e.g. `ImageIcon`, `Inbox`, `Users` */
  icon: LucideIcon;
  /** Primary heading text */
  title: string;
  /** Supporting description */
  description?: string;
  /** Arabic title for bilingual support */
  titleAr?: string;
  /** Label for the optional action button */
  actionLabel?: string;
  /** Called when the action button is clicked */
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  titleAr,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#0A1F33] rounded-2xl border border-[#14304A] p-16 text-center flex flex-col items-center"
    >
      {/* Icon circle */}
      <div className="w-20 h-20 bg-[#061520] rounded-full flex items-center justify-center mb-6 ring-1 ring-[#14304A]">
        <Icon className="w-9 h-9 text-[#14304A]" strokeWidth={1.5} />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
      {titleAr && (
        <p className="text-base font-bold text-white/50 mb-3 font-['Cairo']">{titleAr}</p>
      )}

      {/* Description */}
      {description && (
        <p className="text-sm text-white/40 max-w-xs leading-relaxed mb-6">{description}</p>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-[#FFEE34] text-[#00203C] rounded-lg font-bold hover:bg-white transition-colors shadow-[0_0_15px_rgba(255,238,52,0.2)]"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
