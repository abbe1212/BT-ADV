"use client";

import React, { useState, useCallback } from "react";
import { Plus, Image as ImageIcon, X, Search } from "lucide-react";
import Image from "next/image";
import type { Work } from "@/lib/supabase/types";
import { deleteWork } from "@/actions/works";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { toast } from "sonner";
import { useConfirm } from "@/providers/ConfirmProvider";
import { EmptyState } from "@/components/ui/EmptyState";
import { PaginationControls } from "@/components/admin/bookings/PaginationControls";
import { WorkModal } from "./WorkModal";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import { Trash2, Edit2, Loader2, Video } from "lucide-react";

// Categories for filter dropdown
const CATEGORIES = ["TV Commercial", "Digital Ad", "Music Video", "Reel Campaign"] as const;

interface WorksPageProps {
  initialWorks: Work[];
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
}

/**
 * WorksPage — orchestrator component.
 *
 * Responsibilities:
 * - Displaying the Works grid with filter/search controls.
 * - Managing real-time subscriptions to keep local state fresh.
 * - Delegating create/edit to <WorkModal />.
 * - Handling delete (with useConfirm).
 * - URL-driven pagination and filtering.
 *
 * NOT responsible for form state — that lives in WorkModal.
 */
export function WorksPage({ initialWorks, totalCount = 0, currentPage = 1, pageSize = 20 }: WorksPageProps) {
  const [works, setWorks] = useState(initialWorks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<Work | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localSearch, setLocalSearch] = useState('');

  const debouncedSearch = useDebounce(localSearch, 400);
  const { confirm } = useConfirm();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  React.useEffect(() => { setWorks(initialWorks); }, [initialWorks]);

  // Push filter changes to URL (triggers server re-fetch)
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  // Debounced search → URL
  React.useEffect(() => {
    handleFilterChange('search', debouncedSearch);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Real-time subscription for live updates
  useRealtimeSubscription<Work>({
    table: 'works',
    onInsert: useCallback((newWork: Work) => {
      setWorks(prev => [newWork, ...prev].sort((a, b) => a.order_index - b.order_index));
    }, []),
    onUpdate: useCallback((updatedWork: Work) => {
      setWorks(prev => prev.map(w => w.id === updatedWork.id ? updatedWork : w));
    }, []),
    onDelete: useCallback(({ id }: { id: string }) => {
      setWorks(prev => prev.filter(w => w.id !== id));
    }, []),
  });

  // Modal handlers
  const openCreate = () => { setEditingWork(null); setIsModalOpen(true); };
  const openEdit   = (work: Work) => { setEditingWork(work); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingWork(null); };

  const handleDelete = async (work: Work) => {
    const confirmed = await confirm({
      title: 'Delete Work',
      message: `Are you sure you want to delete "${work.title_ar}"? This action cannot be undone.`,
      confirmText: 'Delete',
      isDestructive: true,
    });
    if (!confirmed) return;

    setDeletingId(work.id);
    const { error } = await deleteWork(work.id);
    setDeletingId(null);

    if (error) {
      toast.error(`Failed to delete: ${error}`);
    } else {
      toast.success('Work deleted successfully');
    }
  };

  return (
    <div className="space-y-6">

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Manage Works</h2>
          <p className="text-sm text-white/50">إدارة الأعمال والمشاريع</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-yellow text-navy hover:bg-white transition-colors px-6 py-2.5 rounded-lg font-bold shadow-[0_0_15px_rgba(255,238,52,0.3)]"
        >
          <Plus className="w-5 h-5" />
          <span>Add New Work</span>
        </button>
      </div>

      {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
      <div className="bg-surface p-3 rounded-xl border border-border-input flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px] max-w-xs group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-yellow transition-colors" />
          <input
            type="text"
            value={localSearch}
            onChange={e => setLocalSearch(e.target.value)}
            placeholder="Search works…"
            className="w-full bg-surface-deep text-sm text-white border border-border-input rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-yellow focus:ring-1 focus:ring-yellow transition-all"
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category filter */}
        <select
          value={searchParams.get('category') || ''}
          onChange={e => handleFilterChange('category', e.target.value)}
          className="bg-surface-deep text-sm text-white/80 border border-border-input rounded-lg px-3 py-2 focus:outline-none focus:border-yellow appearance-none cursor-pointer hover:bg-[#0d2538]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Result count */}
        <span className="text-xs text-white/40 ml-auto">
          {totalCount > 0 ? `${totalCount} work${totalCount !== 1 ? 's' : ''}` : ''}
        </span>
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {works.length > 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map(work => (
              <WorkCard
                key={work.id}
                work={work}
                isDeletingThisCard={deletingId === work.id}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalCount > pageSize && (
            <div className="bg-surface rounded-xl border border-border-input overflow-hidden">
              <PaginationControls
                currentPage={currentPage}
                pageSize={pageSize}
                totalCount={totalCount}
                onPageChange={p => handleFilterChange('page', String(p))}
              />
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No works added yet"
          titleAr="لا توجد أعمال مضافة"
          description="Create your first portfolio piece to showcase your agency's work."
          actionLabel="Add New Work"
          onAction={openCreate}
        />
      )}

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      <WorkModal
        work={editingWork}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

// ─── WorkCard (private sub-component) ──────────────────────────────────────────

interface WorkCardProps {
  work: Work;
  isDeletingThisCard: boolean;
  onEdit: (work: Work) => void;
  onDelete: (work: Work) => void;
}

function WorkCard({ work, isDeletingThisCard, onEdit, onDelete }: WorkCardProps) {
  return (
    <div
      className={`bg-surface rounded-xl border border-border-input overflow-hidden group ${
        isDeletingThisCard ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      <div className="aspect-video relative bg-[#020F1C] flex items-center justify-center">
        {work.image_url ? (
          <Image src={work.image_url} alt={work.title_en || work.title_ar} fill className="object-cover" />
        ) : (
          <ImageIcon className="w-10 h-10 text-border-input group-hover:text-yellow/20 transition-colors" />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-surface/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
          <button
            onClick={() => onEdit(work)}
            aria-label="Edit work"
            className="w-10 h-10 rounded-full bg-yellow text-navy flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(work)}
            aria-label="Delete work"
            className="w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
          >
            {isDeletingThisCard
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Trash2  className="w-4 h-4" />
            }
          </button>
          {work.video_url && (
            <a
              href={work.video_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Watch video"
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:scale-110 transition-transform"
            >
              <Video className="w-4 h-4" />
            </a>
          )}
        </div>

        {work.featured && (
          <div className="absolute top-3 right-3 bg-yellow text-navy text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            Featured
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-bold text-yellow tracking-wider uppercase">{work.category}</span>
          <span className="text-xs text-white/40">{work.year}</span>
        </div>
        <h3 className="text-lg font-bold text-white leading-tight mb-1">{work.title_ar}</h3>
        <p className="text-sm text-white/60">{work.title_en}</p>
      </div>
    </div>
  );
}
