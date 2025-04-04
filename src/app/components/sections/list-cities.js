"use client";
import { getImoveisByFilters } from "@/app/services";
import useFiltersStore from "@/app/store/filtrosStore";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const cities = [
  {
    name: "São Paulo",
    listings: [
      "Apartamentos à venda em São Paulo",
      "Casas à venda em São Paulo",
      "Studios e kitnets à venda em São Paulo",
      "Casas em condomínio à venda em São Paulo",
    ],
  },
  {
    name: "Rio de Janeiro",
    listings: [
      "Apartamentos à venda em Rio de Janeiro",
      "Casas à venda em Rio de Janeiro",
      "Studios e kitnets à venda em Rio de Janeiro",
      "Casas em condomínio à venda em Rio de Janeiro",
    ],
  },
  {
    name: "Porto Alegre",
    listings: [
      "Apartamentos à venda em Porto Alegre",
      "Casas à venda em Porto Alegre",
      "Studios e kitnets à venda em Porto Alegre",
      "Casas em condomínio à venda em Porto Alegre",
    ],
  },
  {
    name: "Belo Horizonte",
    listings: [
      "Apartamentos à venda em Belo Horizonte",
      "Casas à venda em Belo Horizonte",
      "Studios e kitnets à venda em Belo Horizonte",
      "Casas em condomínio à venda em Belo Horizonte",
    ],
  },
  {
    name: "Campinas",
    listings: [
      "Apartamentos à venda em Campinas",
      "Casas à venda em Campinas",
      "Studios e kitnets à venda em Campinas",
      "Casas em condomínio à venda em Campinas",
    ],
  },
];

export function ListCities() {
  const [activeTab, setActiveTab] = useState("Comprar");
  const [cidades, setCidades] = useState([]);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const aplicarFiltros = useFiltersStore((state) => state.aplicarFiltros);
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
        console.error("Erro ao buscar filtros:", error);
      }
    }

    fetchImoveis();
  }, [setFilters]);

  const handleCidadeClick = (cidade, categoria) => {
    // Atualiza o store com os filtros selecionados
    setFilters({
      cidadeSelecionada: cidade,
      categoriaSelecionada: categoria,
      bairrosSelecionados: [], // Resetar para array vazio
      filtrosBasicosPreenchidos: true,
    });

    // Ativa a busca com os filtros
    aplicarFiltros();

    // Redireciona para a página de busca
    router.push(
      `/busca?cidade=${encodeURIComponent(cidade)}&categoria=${encodeURIComponent(categoria)}`
    );
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

        {/* Botões de alternância */}
        <div className="flex justify-center lg:justify-start space-x-4 my-6">
          <button
            className={`px-6 py-2 rounded-full transition-all duration-300 text-sm ${activeTab === "Comprar"
              ? "bg-black text-white"
              : "bg-white text-gray-700 border border-gray-400"
              }`}
            onClick={() => setActiveTab("Comprar")}
          >
            <span>Comprar</span>
          </button>
          <button
            className={`px-6 py-2 rounded-full transition-all duration-300 text-sm ${activeTab === "Alugar"
              ? "bg-black text-white"
              : "bg-white text-gray-700 border border-gray-400"
              }`}
            onClick={() => setActiveTab("Alugar")}
          >
            <span>Alugar</span>
          </button>
        </div>

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
