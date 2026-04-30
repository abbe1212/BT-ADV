/**
 * useModalFocus
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides two accessibility behaviours for modal dialogs:
 *
 *  1. Escape key → calls onClose()
 *  2. Focus trap → Tab / Shift+Tab cycle stays inside the modal container
 *
 * Usage:
 *   const modalRef = useModalFocus({ isOpen, onClose });
 *   <div ref={modalRef} role="dialog" aria-modal="true" ...>
 *
 * The ref should be attached to the *inner* modal panel (the visible card),
 * not the backdrop overlay.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useRef } from "react";

interface UseModalFocusOptions {
  isOpen: boolean;
  onClose: () => void;
}

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

export function useModalFocus({ isOpen, onClose }: UseModalFocusOptions) {
  const modalRef = useRef<HTMLDivElement>(null);

  // ── Escape key dismissal ────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // ── Focus trap ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    // Move initial focus into the modal
    const firstFocusable = modalRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTORS);
    firstFocusable?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !modalRef.current) return;

      const focusable = Array.from(
        modalRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      ).filter((el) => !el.closest("[aria-hidden='true']"));

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  return modalRef;
}
