"use client";
import { getImoveisByFilters } from "@/app/services";
import useFiltersStore from "@/app/store/filtrosStore";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";


export function ListCities() {
  const [activeTab, setActiveTab] = useState("Comprar");
  const [cidades, setCidades] = useState([]);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const aplicarFiltros = useFiltersStore((state) => state.aplicarFiltros);
  const limparFiltros = useFiltersStore((state) => state.limparFiltros);
  const router = useRouter();
  const carouselRef = useRef(null);

  useEffect(() => {
    async function fetchImoveis() {
      try {
        const cid = await getImoveisByFilters("Cidade");
        const cidadesList = cid.data || [];
        setCidades(cidadesList);

        // Atualiza o store com as categorias e cidades
        setFilters({
          cidades: cidadesList,
        });
      } catch (error) {

      }
    }

    fetchImoveis();
  }, [setFilters]);



  const handleCidadeClick = (cidade, categoria) => {
    // Limpar filtros existentes primeiro para garantir estado limpo
    limparFiltros();

    // Atualiza o store com os filtros selecionados
    setFilters({
      cidadeSelecionada: cidade,
      categoriaSelecionada: categoria,
      finalidade: "VENDA", // Sempre envia "Comprar" como padrão
      bairrosSelecionados: [], // Resetar para array vazio
      filtrosBasicosPreenchidos: true,
    });

    // Ativa a busca com os filtros
    aplicarFiltros();

    // Redireciona para a página de busca sem parâmetros na URL
    router.push(`/busca`);
  };

  const getActionText = () => {
    return activeTab === "Comprar" ? "para comprar" : "para alugar";
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300; // Ajuste conforme necessário
      carouselRef.current.scrollLeft += direction === "left" ? -scrollAmount : scrollAmount;
    }
  };

  return (
    <section className="bg-zinc-100 min-h-[500px] py-16 px-6 lg:px-0">
      <div className="container mx-auto">
        {/* Título */}
        <h2 className="text-lg sm:text-xl font-bold mb-6 uppercase text-center lg:text-left">
          Onde você quiser, tem um <br className="hidden sm:block" /> imóvel de luxo para você!
        </h2>



        {/* Lista de cidades - Slider */}
        <div
          ref={carouselRef}
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide no-scrollbar pb-4"
        >
          {cidades.map((cidade, index) => (
            <div key={index} className="w-[200px] flex-shrink-0">
              <h3 className="text-lg font-bold text-black mb-2">{cidade}</h3>
              <ul className="text-left">
                <li className="text-gray-700 mb-1 text-xs">
                  <button
                    onClick={() => handleCidadeClick(cidade, "Apartamento")}
                    className="hover:text-[#8B6F48] transition-colors text-left w-full"
                  >
                    Apartamentos {getActionText()} em {cidade}
                  </button>
                </li>
                <li className="text-gray-700 mb-1 text-xs">
                  <button
                    onClick={() => handleCidadeClick(cidade, "Casa")}
                    className="hover:text-[#8B6F48] transition-colors text-left w-full"
                  >
                    Casas {getActionText()} em {cidade}
                  </button>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Botões de navegação */}
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
