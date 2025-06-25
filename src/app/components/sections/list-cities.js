"use client";
import { getImoveisByFilters } from "@/app/services";
import useFiltersStore from "@/app/store/filtrosStore";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export function ListCities() {
  // Lista estática de cidades
  const cidades = [
    "São Paulo",
    "Guarujá",
    "São José dos Campos",
    "Bertioga",
    "São Caetano do Sul",
    "Paulínia",
    "Campinas",
    "Santo André",
    "Santana de Parnaíba",
    "Porto Feliz",
  ];

  const carouselRef = useRef(null);
  const router = useRouter();
  const setFilters = useFiltersStore((state) => state.setFilters);
  const aplicarFiltros = useFiltersStore((state) => state.aplicarFiltros);
  const limparFiltros = useFiltersStore((state) => state.limparFiltros);

  // Função para gerar slugs
  const gerarSlug = (texto) => {
    return texto
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-");
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      carouselRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
    }
  };

  // Função de clique com ajuste na finalidade
  const handleCidadeClick = (cidade, tipo) => {
    limparFiltros();
    setFilters({
      finalidade: "Comprar", // AJUSTE AQUI ("Comprar" em vez de "VENDA")
      categoriaSelecionada: tipo,
      cidadeSelecionada: cidade,
      filtrosBasicosPreenchidos: true,
    });
    aplicarFiltros();
    router.push(`/busca/comprar/${gerarSlug(tipo)}/${gerarSlug(cidade)}`);
  };

  return (
    <section className="bg-zinc-100 min-h-[500px] py-16 px-6 lg:px-0">
      <div className="container mx-auto">
        <h2 className="text-lg sm:text-xl font-bold mb-6 uppercase text-center lg:text-left">
          Onde você quiser, tem um <br className="hidden sm:block" /> imóvel de luxo para você!
        </h2>

        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide no-scrollbar pb-4"
        >
          {cidades.map((cidade, index) => (
            <div key={index} className="w-[220px] flex-shrink-0">
              <h3 className="text-lg font-bold text-black mb-2">{cidade}</h3>
              <ul className="text-left">
                {["Apartamento", "Casa", "Sala Comercial"].map((tipo, idx) => (
                  <li key={idx} className="text-gray-700 mb-1 text-xs">
                    <button
                      onClick={() => handleCidadeClick(cidade, tipo)}
                      className="hover:text-[#8B6F48] transition-colors text-left w-full"
                    >
                      {`${tipo} para comprar em ${cidade}`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => scroll("left")}
            className="bg-black text-white p-2 rounded-full shadow-md hover:bg-gray-800 transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="bg-black text-white p-2 rounded-full shadow-md hover:bg-gray-800 transition-colors"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}
