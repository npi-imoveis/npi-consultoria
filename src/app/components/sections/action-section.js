"use client";

import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useFiltersStore from "@/app/store/filtrosStore";

export function ActionSection() {
  const router = useRouter();
  const setFilters = useFiltersStore(state => state.setFilters);
  const aplicarFiltros = useFiltersStore(state => state.aplicarFiltros);

  const handleSearchLuxuryCondos = () => {
    // Limpar filtros anteriores
    useFiltersStore.getState().limparFiltros();

    // Definir os novos filtros para imóveis entre 4 e 10 milhões
    setFilters({
      finalidade: "VENDA",
      precoMin: 400000000,
      precoMax: 1000000000,
      categoriaSelecionada: "Apartamento",
      cidadeSelecionada: "São Paulo"
    });

    // Aplicar os filtros
    aplicarFiltros();

    // Navegar para a página de busca
    router.push("/busca");
  };

  const handleSearchHighEnd = () => {
    // Limpar filtros anteriores
    useFiltersStore.getState().limparFiltros();

    // Definir os novos filtros para imóveis acima de 10 milhões
    setFilters({
      finalidade: "VENDA",
      precoMin: 1000000000,
      categoriaSelecionada: "Apartamento",
      cidadeSelecionada: "São Paulo"
    });

    // Aplicar os filtros
    aplicarFiltros();

    // Navegar para a página de busca
    router.push("/busca");
  };

  return (
    <section className="flex justify-center items-center">
      <div className="container mx-auto flex flex-col lg:flex-row gap-2 py-16">
        <div className="relative w-full lg:w-[66%] h-[400px] overflow-hidden group">
          <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
            <Image
              src="/assets/images/acao-home.jpg"
              alt="Imóveis de luxo"
              fill
              style={{ objectFit: "cover" }}
              quality={90}
              unoptimized
            />
          </div>

          {/* Overlay com opacidade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/90"></div>
          <div className="relative z-10 flex flex-col justify-start h-full p-10 text-start lg:text-left">
            <div className="text-white flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <p className="text-sm font-semibold mb-2">Condomínios de luxo</p>
                <p className="font-bold text-lg md:text-xl uppercase">
                  Os melhores condomínios de alto padrão <br />
                  entre 4 e 10 milhões.
                </p>
              </div>
              {/* Botão com ícone de seta */}
              <button onClick={handleSearchLuxuryCondos}>
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-[#8B6F4B] text-white rounded-full shadow-md hover:bg-[#d8b887] transition-colors">
                  <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Segunda seção com imagem de fundo */}
        <div className="relative w-full lg:w-[33%] h-[400px] overflow-hidden group">
          <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-110">
            <Image
              src="/assets/images/fasano.jpg"
              alt="Imóveis de alto padrão"
              fill
              style={{ objectFit: "cover" }}
              quality={90}
              unoptimized
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/80"></div>

          <div className="relative z-10 flex flex-col justify-start h-full p-10 text-start lg:text-left">
            <div className="text-white flex flex-col lg:flex-row items-center justify-between">
              <div className="mb-4 lg:mb-0">
                <p className="text-sm font-semibold mb-2">Imóveis exclusivos</p>
                <p className="font-bold text-lg md:text-xl uppercase">
                  Imóveis de alto padrão <br />acima de 10 milhões.
                </p>
              </div>
              {/* Botão com ícone de seta */}
              <button onClick={handleSearchHighEnd}>
                <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-[#8B6F4B] text-white rounded-full shadow-md hover:bg-[#d8b887] transition-colors">
                  <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
