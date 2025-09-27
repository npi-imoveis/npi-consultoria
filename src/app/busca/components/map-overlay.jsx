// src/app/busca/components/map-overlay.jsx
"use client";
import { useEffect } from "react";
import dynamic from "next/dynamic";

// Usar o novo componente Google Maps integrado
const IntegratedMapWithNoSSR = dynamic(() => import("./integrated-map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
        <p className="mt-2 text-gray-700 text-sm">Carregando mapa…</p>
      </div>
    </div>
  ),
});

export default function MapOverlay({
  open,
  onClose,
  filtros,
  imoveis,
  isLoadingResultados,
  onPropertySelect,
  onClusterSelect,
  selectedCluster,
  selectedProperty,
  onClearSelection,
}) {
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="md:hidden fixed inset-0 z-[9999] transition-transform duration-300 translate-y-0"
      aria-hidden={!open}
      role="dialog"
      aria-modal={open ? "true" : "false"}
    >
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/55"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* painel */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-white rounded-t-2xl overflow-hidden flex flex-col">
        {/* header */}
        <div className="shrink-0 px-4 py-3 flex items-center justify-between border-b">
          <h3 className="text-sm font-bold">Mapa</h3>
          <button
            onClick={() => {
              onClearSelection?.();
              onClose();
            }}
            className="px-3 py-2 rounded-md bg-zinc-200 hover:bg-zinc-300 text-xs font-semibold"
          >
            Ver resultados
          </button>
        </div>

        {/* mapa ocupa todo o restante */}
        <div className="grow relative">
          {/* Botão flutuante Ver resultados - posicionado no topo do mapa */}
          <button
            onClick={onClose}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/95 backdrop-blur border border-gray-300 text-black px-4 py-2 rounded-full text-base font-semibold shadow-md hover:bg-white transition-colors"
          >
            Ver resultados
          </button>

          <IntegratedMapWithNoSSR
            filtros={filtros}
            imoveis={imoveis}
            isLoadingResultados={isLoadingResultados}
            onPropertySelect={(property) => {
              console.log("🏠 Mobile - Propriedade selecionada:", property);
              onPropertySelect?.(property);
              // Fechar overlay após seleção para ver o resultado
              onClose();
            }}
            onClusterSelect={(cluster) => {
              console.log("🔍 Mobile - Cluster selecionado:", cluster);
              onClusterSelect?.(cluster);
              // Fechar overlay após seleção para ver o resultado
              onClose();
            }}
            selectedCluster={selectedCluster}
            selectedProperty={selectedProperty}
            onClearSelection={onClearSelection}
          />
        </div>
      </div>
    </div>
  );
}
