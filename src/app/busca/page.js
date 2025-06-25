"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import CardImovel, { CardImovelSkeleton } from "../components/ui/card-imovel";
import Pagination from "../components/ui/pagination";
import Map from "./components/map";
import {
  AdjustmentsHorizontalIcon,
  MapIcon,
  HeartIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import PropertyFilters from "./components/property-filters";
import { getImoveis, searchImoveis } from "../services";
import useFiltersStore from "../store/filtrosStore";
import useFavoritosStore from "../store/favoritosStore";
import useImovelStore from "../store/imovelStore";

// Função para decodificar slugs (ex: "sao-paulo" → "São Paulo")
const decodificarSlug = (slug) => {
  if (!slug) return null;
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function BuscaImoveis() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Decodificar parâmetros da URL amigável
  const segments = pathname.split('/').filter(segment => segment);
  const [finalidadeSlug, tipoSlug, cidadeSlug, bairroSlug, empreendimentoSlug] = 
    segments.slice(1); // Ignora o primeiro segmento ("busca")
  
  const finalidade = decodificarSlug(finalidadeSlug) || "Comprar";
  const tipo = decodificarSlug(tipoSlug);
  const cidade = decodificarSlug(cidadeSlug);
  const bairro = decodificarSlug(bairroSlug);
  const empreendimento = decodificarSlug(empreendimentoSlug);
  
  // Busca textual tradicional (?q=...)
  const querySearch = searchParams.get("q");

  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const filtrosAtuais = useFiltersStore((state) => state);
  const filtrosAplicados = useFiltersStore((state) => state.filtrosAplicados);
  const filtrosBasicosPreenchidos = useFiltersStore((state) => state.filtrosBasicosPreenchidos);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const aplicarFiltros = useFiltersStore((state) => state.aplicarFiltros);
  const limparFiltros = useFiltersStore((state) => state.limparFiltros);

  const [searchTerm, setSearchTerm] = useState("");
  const [ordenacao, setOrdenacao] = useState("relevancia");
  const adicionarVariosImoveisCache = useImovelStore((state) => state.adicionarVariosImoveisCache);
  const [mostrandoMapa, setMostrandoMapa] = useState(false);
  const [mostrandoFavoritos, setMostrandoFavoritos] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const { favoritos, getQuantidadeFavoritos } = useFavoritosStore();
  const quantidadeFavoritos = getQuantidadeFavoritos();
  const atualizacoesFiltros = useFiltersStore((state) => state.atualizacoesFiltros);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
  });
  const [filtroVisivel, setFiltroVisivel] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [fullyInitialized, setFullyInitialized] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);

  useEffect(() => {
    document.title = "NPi Imóveis - Busca de Imóveis de Alto Padrão";

    const metaDesc = document.querySelector("meta[name='description']");
    if (metaDesc) {
      metaDesc.setAttribute("content", "Encontre imóveis de alto padrão perfeito para você");
    } else {
      const meta = document.createElement("meta");
      meta.name = "description";
      meta.content = "Encontre imóveis de alto padrão perfeito para você";
      document.head.appendChild(meta);
    }
  }, []);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (fullyInitialized) {
      const timer = setTimeout(() => {
        setUiVisible(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [fullyInitialized]);

  useEffect(() => {
    if (!isClient) return;
    setFiltroVisivel(!isMobile);
  }, [isClient, isMobile]);

  useEffect(() => {
    if (!isClient) return;

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      setFullyInitialized(true);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isClient]);

  // Aplicar filtros da URL amigável ao carregar a página
  useEffect(() => {
    if ((cidade || tipo) && fullyInitialized) {
      limparFiltros();
      setFilters({
        finalidade,
        categoriaSelecionada: tipo,
        cidadeSelecionada: cidade,
        bairrosSelecionados: bairro ? [bairro] : [],
        empreendimentoSelecionado: empreendimento,
        filtrosBasicosPreenchidos: true,
      });
      aplicarFiltros();
    }
  }, [cidade, tipo, bairro, empreendimento, fullyInitialized]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const buscarImoveis = async (comFiltros = false) => {
    if (mostrandoFavoritos) {
      setImoveis(favoritos);
      setPagination({
        totalItems: favoritos.length,
        totalPages: Math.ceil(favoritos.length / 12),
        currentPage: 1,
        itemsPerPage: 12,
        limit: 12,
      });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let params = {};

      if (comFiltros) {
        const filtrosAtuais = useFiltersStore.getState();
        const finalidade = filtrosAtuais.finalidade || "Comprar";

        params = {
          finalidade,
          categoria: filtrosAtuais.categoriaSelecionada,
          cidade: filtrosAtuais.cidadeSelecionada,
          quartos: filtrosAtuais.quartos,
          banheiros: filtrosAtuais.banheiros,
          vagas: filtrosAtuais.vagas,
        };

        if (filtrosAtuais.bairrosSelecionados && filtrosAtuais.bairrosSelecionados.length > 0) {
          params.bairrosArray = filtrosAtuais.bairrosSelecionados;
        }

        if (filtrosAtuais.precoMin !== null) {
          params.precoMinimo = filtrosAtuais.precoMin;
        }

        if (filtrosAtuais.precoMax !== null) {
          params.precoMaximo = filtrosAtuais.precoMax;
        }

        if (filtrosAtuais.areaMin && filtrosAtuais.areaMin !== "0") {
          params.areaMinima = filtrosAtuais.areaMin;
        }

        if (filtrosAtuais.areaMax && filtrosAtuais.areaMax !== "0") {
          params.areaMaxima = filtrosAtuais.areaMax;
        }

        if (filtrosAtuais.abaixoMercado) {
          params.apenasCondominios = true;
        }

        if (filtrosAtuais.proximoMetro) {
          params.proximoMetro = true;
        }
      }

      const response = await getImoveis(params, currentPage, 12);

      if (response && response.imoveis) {
        setImoveis(response.imoveis);
        if (Array.isArray(response.imoveis) && response.imoveis.length > 0) {
          adicionarVariosImoveisCache(response.imoveis);
        }
      } else {
        setImoveis([]);
      }

      if (response && response.pagination) {
        const validPagination = {
          totalItems: Number(response.pagination.totalItems) || 0,
          totalPages: Number(response.pagination.totalPages) || 1,
          currentPage: Number(response.pagination.currentPage) || 1,
          itemsPerPage: Number(response.pagination.itemsPerPage) || 12,
          limit: Number(response.pagination.itemsPerPage) || 12,
        };
        setPagination(validPagination);
      }
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      setImoveis([]);
      setPagination({
        totalItems: 0,
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 12,
        limit: 12,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavoritos = () => {
    const novoEstado = !mostrandoFavoritos;
    setMostrandoFavoritos(novoEstado);
    setCurrentPage(1);

    if (novoEstado) {
      setImoveis(favoritos);
      setPagination({
        totalItems: favoritos.length,
        totalPages: Math.ceil(favoritos.length / 12),
        currentPage: 1,
        itemsPerPage: 12,
        limit: 12,
      });
    } else {
      buscarImoveis(filtrosAplicados);
    }
  };

  const handleSearch = async (term) => {
    useFiltersStore.getState().limparFiltros();

    if (!term || term.trim() === "") {
      buscarImoveis(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchImoveis(term);
      if (response && response.data) {
        setImoveis(response.data);
        setPagination({
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / 12),
          currentPage: 1,
          itemsPerPage: 12,
          limit: 12,
        });

        if (Array.isArray(response.data) && response.data.length > 0) {
          adicionarVariosImoveisCache(response.data);
        }
      } else {
        setImoveis([]);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setImoveis([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFiltro = () => {
    setFiltroVisivel(!filtroVisivel);
  };

  const toggleMapa = () => {
    if (filtrosBasicosPreenchidos) {
      setMostrandoMapa(!mostrandoMapa);
    }
  };

  // Função para gerar URL amigável com base nos filtros
  const gerarUrlAmigavel = () => {
    const filtrosAtuais = useFiltersStore.getState();
    
    // Função para criar slugs (ex: "São Paulo" → "sao-paulo")
    const criarSlug = (texto) => {
      return texto
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-");
    };

    const partes = [];
    
    // Finalidade (sempre "comprar" para seu caso)
    partes.push("comprar");
    
    // Tipo de imóvel
    if (filtrosAtuais.categoriaSelecionada) {
      partes.push(criarSlug(filtrosAtuais.categoriaSelecionada));
    } else {
      partes.push("todos");
    }
    
    // Cidade
    if (filtrosAtuais.cidadeSelecionada) {
      partes.push(criarSlug(filtrosAtuais.cidadeSelecionada));
    } else {
      partes.push("todas-cidades");
    }
    
    // Bairro (opcional)
    if (filtrosAtuais.bairrosSelecionados?.[0]) {
      partes.push(criarSlug(filtrosAtuais.bairrosSelecionados[0]));
    }
    
    // Empreendimento (opcional)
    if (filtrosAtuais.empreendimentoSelecionado) {
      partes.push(criarSlug(filtrosAtuais.empreendimentoSelecionado));
    }
    
    return `/busca/${partes.join("/")}`;
  };

  // Atualizar URL quando os filtros mudarem
  useEffect(() => {
    if (filtrosAplicados) {
      const novaUrl = gerarUrlAmigavel();
      router.replace(novaUrl, { scroll: false });
    }
  }, [filtrosAplicados, atualizacoesFiltros]);

  const renderCards = () => {
    if (isLoading) {
      return Array(12)
        .fill(null)
        .map((_, index) => (
          <div key={`skeleton-${index}`} className="min-w-[250px]">
            <CardImovelSkeleton />
          </div>
        ));
    }

    if (Array.isArray(imoveis) && imoveis.length > 0) {
      let imoveisOrdenados = [...imoveis];

      if (ordenacao === "maior_valor") {
        imoveisOrdenados.sort((a, b) => {
          const valorA = a.ValorAntigo ? parseFloat(a.ValorAntigo.replace(/\D/g, "")) : 0;
          const valorB = b.ValorAntigo ? parseFloat(b.ValorAntigo.replace(/\D/g, "")) : 0;
          return valorB - valorA;
        });
      } else if (ordenacao === "menor_valor") {
        imoveisOrdenados.sort((a, b) => {
          const valorA = a.ValorAntigo ? parseFloat(a.ValorAntigo.replace(/\D/g, "")) : 0;
          const valorB = b.ValorAntigo ? parseFloat(b.ValorAntigo.replace(/\D/g, "")) : 0;
          return valorA - valorB;
        });
      }

      return imoveisOrdenados.map((imovel) => {
        const key =
          imovel.Codigo || `imovel-${imovel._id || Math.random().toString(36).substr(2, 9)}`;
        return (
          <div key={key} className="flex-1 min-w-[260px]">
            <CardImovel {...imovel} />
          </div>
        );
      });
    }

    return <p className="text-center w-full py-8">Nenhum imóvel encontrado.</p>;
  };

  const contentVariants = {
    expanded: {
      marginLeft: 0,
      width: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
    collapsed: {
      marginLeft: 0,
      width: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Efeito principal para buscar imóveis
  useEffect(() => {
    const searchQuery = querySearch || searchParams.get("q");

    setIsLoading(true);

    if (mostrandoFavoritos) {
      setImoveis(favoritos);
      setPagination({
        totalItems: favoritos.length,
        totalPages: Math.ceil(favoritos.length / 12),
        currentPage: 1,
        itemsPerPage: 12,
        limit: 12,
      });
      setIsLoading(false);
      return;
    }

    if (filtrosAplicados) {
      if (searchTerm) setSearchTerm("");
      buscarImoveis(true);
      return;
    }

    if (searchQuery || searchTerm) {
      const termToSearch = searchQuery || searchTerm;

      if (searchQuery && searchQuery !== searchTerm) {
        setSearchTerm(searchQuery);
      }

      handleSearch(termToSearch);
      return;
    }

    buscarImoveis(false);
  }, [filtrosAplicados, atualizacoesFiltros, currentPage, mostrandoFavoritos, favoritos, querySearch]);

  const construirTextoFiltros = () => {
    const filtrosAtuais = useFiltersStore.getState();
    const filtros = [];

    if (filtrosAtuais.cidadeSelecionada) {
      filtros.push(filtrosAtuais.cidadeSelecionada);
    }

    if (filtrosAtuais.bairrosSelecionados && filtrosAtuais.bairrosSelecionados.length > 0) {
      if (filtrosAtuais.bairrosSelecionados.length === 1) {
        filtros.push(filtrosAtuais.bairrosSelecionados[0]);
      } else {
        filtros.push(`${filtrosAtuais.bairrosSelecionados.length} bairros`);
      }
    }

    if (filtrosAtuais.categoriaSelecionada) {
      filtros.push(filtrosAtuais.categoriaSelecionada);
    }

    return filtros.join(" - ");
  };

  const handleOrdenacaoChange = (e) => {
    setOrdenacao(e.target.value);
  };

  const resetarEstadoBusca = () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (mostrandoFavoritos) {
      setMostrandoFavoritos(false);
    }
  };

  return (
    <>
      <section
        className={`bg-zinc-100 pb-32 px-4 sm:px-8 md:px-10 relative ${
          !uiVisible ? "opacity-0" : "opacity-100 transition-opacity duration-300"
        }`}
      >
        <div
          className={`fixed top-20 left-0 right-0 ${
            filtroVisivel ? "z-[999997]" : "z-40"
          } bg-white px-4 sm:px-6 md:px-10 py-4 md:py-6 shadow-sm`}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 w-full mx-auto">
            <div className="grid grid-cols-2 items-center gap-2 w-full md:w-[300px]">
              {isMobile && (
                <button
                  onClick={toggleFiltro}
                  className={`flex items-center justify-center gap-1 sm:gap-2 ${
                    filtroVisivel ? "bg-black text-white" : "bg-zinc-200 text-black"
                  } font-bold px-2 sm:px-4 py-2 rounded-lg hover:bg-zinc-200/40 transition-colors`}
                >
                  <AdjustmentsHorizontalIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs">{filtroVisivel ? "Fechar Filtros" : "Filtros"}</span>
                </button>
              )}
              <button
                onClick={toggleMapa}
                disabled={!filtrosBasicosPreenchidos}
                className={`flex items-center justify-center gap-1 sm:gap-2 ${
                  mostrandoMapa
                    ? "bg-black text-white"
                    : filtrosBasicosPreenchidos
                    ? "bg-zinc-200 text-black hover:bg-zinc-200/40 transition-colors"
                    : "bg-zinc-300 text-gray-500 cursor-not-allowed"
                } font-bold px-2 sm:px-4 py-2 rounded-lg relative`}
              >
                {mostrandoMapa ? (
                  <>
                    <ListBulletIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs">Lista</span>
                  </>
                ) : (
                  <>
                    <MapIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="text-xs">Mapa</span>
                  </>
                )}

                {filtrosBasicosPreenchidos && !mostrandoMapa && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></span>
                )}
              </button>
            </div>
            <div className="relative w-full mt-2 md:mt-0 md:w-[600px]">
              <div className="absolute inset-y-0 left-2 sm:left-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
              <input
                type="text"
                placeholder="Digite código, endereço, cidade ou condomínio..."
                className="w-full rounded-md border-2 border-gray-100 text-xs bg-white pl-8 sm:pl-10 pr-24 sm:pr-36 py-2.5 focus:outline-none focus:ring-1 focus:ring-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(searchTerm);
                  }
                }}
              />
              <button
                onClick={() => handleSearch(searchTerm)}
                className="absolute inset-y-0 right-0 px-3 sm:px-4 py-2 bg-black text-white rounded-r-md hover:bg-gray-800 text-xs transition-colors flex items-center justify-center"
              >
                Buscar
              </button>
            </div>

            <div className="mt-2 md:mt-0">
              <button
                onClick={toggleFavoritos}
                className={`flex items-center gap-1 sm:gap-2 ${
                  mostrandoFavoritos ? "bg-red-500 text-white" : "bg-zinc-200 text-black"
                } font-bold px-3 sm:px-4 py-2 rounded-lg hover:bg-red-400 transition-colors relative`}
              >
                <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-xs">Favoritos</span>
                {isBrowser && quantidadeFavoritos > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {quantidadeFavoritos}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="pt-80 sm:pt-72 md:pt-44 flex flex-col md:flex-row gap-4 md:gap-6 pb-10 relative">
          <div
            className={`${
              !fullyInitialized
                ? "hidden"
                : isMobile
                ? filtroVisivel
                  ? "block"
                  : "hidden"
                : "block"
            } w-full md:w-[300px] sticky top-40 self-start overflow-y-auto scrollbar-hide h-fit max-h-[calc(100vh-200px)] z-[50] transition-all duration-300`}
          >
            <PropertyFilters
              onFilter={resetarEstadoBusca}
              isVisible={filtroVisivel}
              setIsVisible={setFiltroVisivel}
            />
          </div>

          <div className="flex-1 flex flex-col min-h-[60vh] z-0">
            {mostrandoMapa ? (
              <div className="relative w-full mt-2" style={{ height: "calc(100vh - 160px)" }}>
                <Map filtros={filtrosAtuais} />
              </div>
            ) : (
              <div className="w-full z-0">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 sm:gap-0 mb-4">
                  <h3 className="text-xs font-bold text-zinc-500">{construirTextoFiltros()}</h3>
                  <select
                    className="text-xs font-bold text-zinc-500 bg-zinc-100 p-2 rounded-md w-full sm:w-auto"
                    value={ordenacao}
                    onChange={handleOrdenacaoChange}
                  >
                    <option value="relevancia">Mais relevantes</option>
                    <option value="maior_valor">Maior Valor</option>
                    <option value="menor_valor">Menor Valor</option>
                  </select>
                </div>

                <div className="flex flex-wrap gap-3 overflow-hidden z-0">{renderCards()}</div>
              </div>
            )}

            {!mostrandoMapa && (
              <div className="mt-6 mb-6">
                <Pagination pagination={pagination} onPageChange={handlePageChange} />
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
