"use client";
import dynamic from "next/dynamic";
import { useEffect } from "react";

// --- CORREÇÃO ---
// Importa o componente centralizado
const MapWithNoSSR = dynamic(() => import("../components/maps/MapWithDetails"), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100"><p>Carregando mapa…</p></div>,
});

export default function MapOverlay({ open, onClose, filtros }) {
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; };
  }, [open]);

  return (
    <div className={[ "md:hidden fixed inset-0 z-[9999] transition-transform duration-300", open ? "translate-y-0" : "translate-y-full" ].join(" ")} aria-hidden={!open} role="dialog" aria-modal={open ? "true" : "false"}>
      <div className="absolute inset-0 bg-black/55" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-x-0 bottom-0 top-0 bg-white rounded-t-2xl overflow-hidden flex flex-col">
        <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b">
          <h3 className="text-sm font-bold">Mapa</h3>
          <button onClick={onClose} className="px-3 py-2 rounded-md bg-zinc-200 hover:bg-zinc-300 text-xs font-semibold">Ver resultados</button>
        </div>
        <div className="grow">
          {/* --- CORREÇÃO --- */}
          <MapWithNoSSR filtros={filtros} />
        </div>
      </div>
    </div>
  );
}
