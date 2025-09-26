// src/app/busca/components/map-overlay.jsx
"use client";
import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// carrega o mapa só quando o overlay abre (sem SSR)
const MapWithNoSSR = dynamic(() => import("./map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
        <p className="mt-2 text-gray-700 text-sm">Carregando mapa…</p>
      </div>
    </div>
  ),
});

export default function MapOverlay({ open, onClose, filtros }) {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);

  // travar scroll + gerenciar foco ao abrir/fechar
  useEffect(() => {
    if (!open) return;
    lastFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow || "";
      lastFocusedRef.current?.focus?.();
    };
  }, [open]);

  // fechar com ESC + foco trap simples
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll(
          'a[href],button,textarea,input,select,[tabindex]:not([tabindex="-1"])'
        );
        const nodes = Array.from(focusables).filter((el) => !el.hasAttribute("disabled"));
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-[60] motion-safe:transition-transform motion-safe:duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-map-title"
      ref={dialogRef}
    >
      {/* backdrop */}
      <button
        aria-label="Fechar mapa"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
      />

      {/* painel */}
      <div
        className="
          absolute inset-x-0 bottom-0 top-0
          bg-white rounded-t-2xl overflow-hidden
          flex flex-col
          h-[100dvh] overscroll-contain
        "
      >
        <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b">
          <h3 id="mobile-map-title" className="text-sm font-bold">Mapa</h3>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            className="px-3 py-2 rounded-md bg-zinc-200 hover:bg-zinc-300 text-xs font-semibold"
          >
            Ver resultados
          </button>
        </div>

        <div className="grow">
          <MapWithNoSSR filtros={filtros} />
        </div>
      </div>
    </div>
  );
}
