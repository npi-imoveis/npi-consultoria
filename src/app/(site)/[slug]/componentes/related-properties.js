"use client";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import CardImovel from "@/app/components/ui/card-imovel";

export function ImoveisRelacionados({ imoveisRelacionados }) {
  const carouselRef = useRef(null);
  
  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
    }
  };
  
  return (
    <section className="relative bg-white container mx-auto p-10 mt-4 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-black">Imóveis no mesmo condomínio</h2>
        <span className="text-xs text-zinc-700 font-semibold">Encontrado {imoveisRelacionados.length} {imoveisRelacionados.length === 1 ? "imóvel" : "imóveis"}</span>
      </div>
      <div className="container mx-auto">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black text-white p-2 rounded-full shadow-md z-10"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide no-scrollbar pb-4"
        >
          {!imoveisRelacionados || imoveisRelacionados.length === 0 ? (
            <p className="text-center w-full py-8">Nenhum imóvel relacionado encontrado.</p>
          ) : (
            imoveisRelacionados.map((imovel) => (
              <div key={imovel.Codigo || imovel._id || `imovel-${Math.random()}`} className="min-w-[320px]">
                <CardImovel {...imovel} isLoading={false} target="_blank" />
              </div>
            ))
          )}
        </div>
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-md z-10"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
