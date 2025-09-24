// src/app/busca/components/mobile-actions-bar.jsx
"use client";

export default function MobileActionsBar({
  onOpenFilters,
  onOpenMap,
  resultsText = "",
  favoritesButton = null,
}) {
  return (
    <div className="md:hidden sticky top-20 z-[45] bg-white border-b shadow-sm">
      <div className="px-3 py-2 flex items-center justify-between gap-2">
        <span className="text-[11px] text-zinc-600 font-semibold truncate">
          {resultsText}
        </span>

        <div className="flex items-center gap-2 shrink-0">
          {favoritesButton}
          <button
            onClick={onOpenFilters}
            className="px-3 py-2 rounded-lg text-[12px] font-semibold bg-zinc-200 hover:bg-zinc-300 text-black"
          >
            Filtros
          </button>
          <button
            onClick={onOpenMap}
            className="px-3 py-2 rounded-lg text-[12px] font-semibold bg-black hover:bg-zinc-900 text-white"
          >
            Mapa
          </button>
        </div>
      </div>
    </div>
  );
}
