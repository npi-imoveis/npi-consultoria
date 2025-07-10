//  src/app/busca/page.js

"use client";

import { useEffect, useState } from "react";
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
import { gerarTituloSeoFriendly, gerarDescricaoSeoFriendly, gerarUrlSeoFriendly } from "../utils/url-slugs";
import { useRouter } from "next/navigation";

export default function BuscaImoveis() {
  const [imoveis, setImoveis] = useState([]); // Estado inicial como array
  const [isLoading, setIsLoading] = useState(true); // Estado para controlar o carregamento
  const filtrosAtuais = useFiltersStore((state) => state);
  const filtrosAplicados = useFiltersStore((state) => state.filtrosAplicados);
  const filtrosBasicosPreenchidos = useFiltersStore((state) => state.filtrosBasicosPreenchidos);

  const [searchTerm, setSearchTerm] = useState("");
  // Adicionar estado para ordenação
  const [ordenacao, setOrdenacao] = useState("relevancia");

  // Acessando funções do store de imóveis
  const adicionarVariosImoveisCache = useImovelStore((state) => state.adicionarVariosImoveisCache);

  // Router para atualizar URL
  const router = useRouter();

  // Estado para controlar a visualização de mapa ou lista
  const [mostrandoMapa, setMostrandoMapa] = useState(false);

  // Estado para controlar se estamos mostrando apenas favoritos
  const [mostrandoFavoritos, setMostrandoFavoritos] = useState(false);

  // Estado para evitar hidratação incorreta
  const [isBrowser, setIsBrowser] = useState(false);

  // Obter favoritos da store
  const { favoritos, getQuantidadeFavoritos } = useFavoritosStore();
  const quantidadeFavoritos = getQuantidadeFavoritos();

  // Obter o contador de atualizações de filtros do store
  const atualizacoesFiltros = useFiltersStore((state) => state.atualizacoesFiltros);

  // Função para atualizar título dinâmico
  const updateDynamicTitle = (totalItems = null) => {
    const filtrosAtuais = useFiltersStore.getState();
    
    console.log('🔍 [BUSCA] Debug filtros para título:', {
      cidadeSelecionada: filtrosAtuais.cidadeSelecionada,
      finalidade: filtrosAtuais.finalidade,
      categoriaSelecionada: filtrosAtuais.categoriaSelecionada
    });
    
    // Verificar se há filtros aplicados para gerar título dinâmico
    if (filtrosAtuais.cidadeSelecionada || filtrosAtuais.categoriaSelecionada || filtrosAtuais.finalidade) {
      const tituloSeo = gerarTituloSeoFriendly(filtrosAtuais, null); // Removido totalItems
      document.title = tituloSeo;
      console.log('🔍 [BUSCA] Título dinâmico atualizado:', tituloSeo);
    } else {
      // Título padrão quando não há filtros específicos
      const tituloDefault = 'Busca de Imóveis | NPi Imóveis';
      document.title = tituloDefault;
      console.log('🔍 [BUSCA] Título padrão aplicado:', tituloDefault);
    }
  };

  // Função para atualizar URL quando filtros mudam
  const updateUrlFromFilters = () => {
    const filtrosAtuais = useFiltersStore.getState();
    
    // Verificar se os filtros básicos estão preenchidos para URL amigável
    if (filtrosAtuais.cidadeSelecionada && filtrosAtuais.finalidade && filtrosAtuais.categoriaSelecionada) {
      const urlAmigavel = gerarUrlSeoFriendly(filtrosAtuais);
      console.log('🔍 [BUSCA] Atualizando URL para:', urlAmigavel);
      router.replace(urlAmigavel, { scroll: false });
    }
  };

   // Efeito para marcar quando estamos no navegador
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Efeito para carregar filtros dos parâmetros da URL (URLs amigáveis)
  useEffect(() => {
    if (!isBrowser) return;
    
    const searchParams = new URLSearchParams(window.location.search);
    const cidade = searchParams.get('cidade');
    const finalidade = searchParams.get('finalidade');
    const categoria = searchParams.get('categoria');
    const bairros = searchParams.get('bairros');
    const quartos = searchParams.get('quartos');
    const precoMin = searchParams.get('precoMin');
    const precoMax = searchParams.get('precoMax');
    
    // Se há parâmetros de filtros na URL, aplicá-los
    if (cidade || finalidade || categoria || bairros || quartos || precoMin || precoMax) {
      console.log('🔍 [BUSCA] Carregando filtros dos parâmetros da URL:', {
        cidade, finalidade, categoria, bairros, quartos, precoMin, precoMax
      });
      
      const filtrosStore = useFiltersStore.getState();
      
      // Preparar filtros para aplicar
      const filtrosParaAplicar = {};
      
      if (cidade) filtrosParaAplicar.cidadeSelecionada = cidade;
      if (finalidade) filtrosParaAplicar.finalidade = finalidade;
      if (categoria) filtrosParaAplicar.categoriaSelecionada = categoria;
      if (bairros) {
        const bairrosArray = bairros.split(',').map(b => b.trim()).filter(b => b.length > 0);
        filtrosParaAplicar.bairrosSelecionados = bairrosArray;
      }
      if (quartos) filtrosParaAplicar.quartos = parseInt(quartos);
      if (precoMin) filtrosParaAplicar.precoMin = parseFloat(precoMin);
      if (precoMax) filtrosParaAplicar.precoMax = parseFloat(precoMax);
      
      // Aplicar filtros no store
      filtrosStore.setFilters(filtrosParaAplicar);
      filtrosStore.aplicarFiltros();
      
      // Gerar título dinâmico baseado nos filtros aplicados
      setTimeout(() => {
        updateDynamicTitle();
      }, 100);
    }
  }, [isBrowser]);

  // Efeito para atualizar título e URL quando filtros são aplicados manualmente
  useEffect(() => {
    if (!isBrowser) return;
    
    // Verificar se há filtros aplicados
    const filtrosAtuais = useFiltersStore.getState();
    if (filtrosAtuais.filtrosAplicados) {
      console.log('🔍 [BUSCA] Filtros aplicados detectados, atualizando título e URL...');
      updateDynamicTitle();
      
      // Sempre atualizar URL quando filtros mudam
      updateUrlFromFilters();
    }
  }, [atualizacoesFiltros, isBrowser]);

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
  });

  // Estado para controlar a visibilidade do filtro
  const [filtroVisivel, setFiltroVisivel] = useState(false);

  // Verificar se estamos em um dispositivo mobile
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Estado para controlar a inicialização completa do componente
  const [fullyInitialized, setFullyInitialized] = useState(false);

  // Estado para controlar a visibilidade da interface
  const [uiVisible, setUiVisible] = useState(false);

  // Detectar ambiente de cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Exibir UI somente após inicialização completa
  useEffect(() => {
    if (fullyInitialized) {
      // Pequeno atraso para garantir que tudo foi renderizado corretamente
      const timer = setTimeout(() => {
        setUiVisible(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [fullyInitialized]);

  // Efeito para ajustar a visibilidade do filtro com base no tamanho da tela
  useEffect(() => {
    if (!isClient) return;
    // Em desktop, o filtro deve estar sempre visível por padrão
    // Em mobile, deve estar escondido por padrão
    setFiltroVisivel(!isMobile);
  }, [isClient, isMobile]);

  // Efeito para detectar o tamanho da tela
  useEffect(() => {
    if (!isClient) return;

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Marcar como completamente inicializado após a verificação do tamanho da tela
      setFullyInitialized(true);
    };

    // Verificar tamanho inicial
    checkScreenSize();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener("resize", checkScreenSize);

    // Limpar listener ao desmontar
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isClient]);

  // Função para lidar com a mudança de página
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para buscar imóveis com ou sem filtros
  const buscarImoveis = async (comFiltros = false) => {
    // Se estamos mostrando favoritos, não precisamos buscar do servidor
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
      // Preparar parâmetros de filtro se necessário
      let params = {};

      if (comFiltros) {
        // Obtém os valores mais recentes do store
        const filtrosAtuais = useFiltersStore.getState();

        // Garantir que finalidade seja sempre "Comprar" se não estiver definida
        const finalidade = filtrosAtuais.finalidade || "Comprar";

        params = {
          finalidade: finalidade, // Sempre usa "Comprar" independente do valor no store
          categoria: filtrosAtuais.categoriaSelecionada,
          cidade: filtrosAtuais.cidadeSelecionada,
          quartos: filtrosAtuais.quartos,
          banheiros: filtrosAtuais.banheiros,
          vagas: filtrosAtuais.vagas,
        };

        // Log detalhado dos filtros selecionados

        // Adicionar bairros selecionados se existirem
        if (filtrosAtuais.bairrosSelecionados && filtrosAtuais.bairrosSelecionados.length > 0) {
          params.bairrosArray = filtrosAtuais.bairrosSelecionados;
        }

        // Adiciona filtros de preço se estiverem definidos
        if (filtrosAtuais.precoMin !== null) {
          params.precoMinimo = filtrosAtuais.precoMin;
        }

        if (filtrosAtuais.precoMax !== null) {
          params.precoMaximo = filtrosAtuais.precoMax;
        }

        // Adiciona filtros de área se estiverem definidos
        if (filtrosAtuais.areaMin && filtrosAtuais.areaMin !== "0") {
          params.areaMinima = filtrosAtuais.areaMin;
        }

        if (filtrosAtuais.areaMax && filtrosAtuais.areaMax !== "0") {
          params.areaMaxima = filtrosAtuais.areaMax;
        }

        // Adiciona outros filtros especiais
        if (filtrosAtuais.abaixoMercado) {
          params.apenasCondominios = true;
        }

        if (filtrosAtuais.proximoMetro) {
          params.proximoMetro = true;
        }
      }

      // Buscar imóveis com a função unificada
      const response = await getImoveis(params, currentPage, 12);

      // Verificar se a resposta contém dados válidos
      if (response && response.imoveis) {
        setImoveis(response.imoveis);

        // Armazenar os imóveis no cache da store para uso futuro
        if (Array.isArray(response.imoveis) && response.imoveis.length > 0) {
          adicionarVariosImoveisCache(response.imoveis);
        }
      } else {
        setImoveis([]);
      }

      // Verificar se a resposta contém dados de paginação válidos
      if (response && response.pagination) {
        // Garantir que todos os valores de paginação sejam números válidos
        const validPagination = {
          totalItems: Number(response.pagination.totalItems) || 0,
          totalPages: Number(response.pagination.totalPages) || 1,
          currentPage: Number(response.pagination.currentPage) || 1,
          itemsPerPage: Number(response.pagination.itemsPerPage) || 12,
          limit: Number(response.pagination.itemsPerPage) || 12,
        };
        setPagination(validPagination);
        
        // Atualizar título dinâmico com o número de imóveis encontrados
        updateDynamicTitle(validPagination.totalItems);
      }
    } catch (error) {
      console.error("Erro ao buscar imóveis:", error);
      setImoveis([]);
      // Em caso de erro, definir valores padrão para a paginação
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

  // Função para alternar entre mostrar todos os imóveis ou apenas favoritos
  const toggleFavoritos = () => {
    const novoEstado = !mostrandoFavoritos;
    setMostrandoFavoritos(novoEstado);

    // Resetar a página atual
    setCurrentPage(1);

    if (novoEstado) {
      // Mostrar apenas favoritos
      setImoveis(favoritos);
      setPagination({
        totalItems: favoritos.length,
        totalPages: Math.ceil(favoritos.length / 12),
        currentPage: 1,
        itemsPerPage: 12,
        limit: 12,
      });
    } else {
      // Voltar a mostrar todos os imóveis
      buscarImoveis(filtrosAplicados);
    }
  };

  // Função para buscar imóveis baseado no termo de busca
  const handleSearch = async (term) => {
    // Limpar qualquer filtro aplicado anteriormente
    useFiltersStore.getState().limparFiltros();
    
    // Atualizar título após limpar filtros
    updateDynamicTitle();

    if (!term || term.trim() === "") {
      // Se não houver termo de busca, voltar para a busca normal
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

  // Função para alternar a visibilidade do filtro
  const toggleFiltro = () => {
    setFiltroVisivel(!filtroVisivel);
  };

  // Função para alternar entre visualização de mapa e lista
  const toggleMapa = () => {
    // Só permite alternar se os filtros básicos estiverem preenchidos
    if (filtrosBasicosPreenchidos) {
      setMostrandoMapa(!mostrandoMapa);
    }
  };

  // Função para renderizar os cards de imóveis ou skeletons
  const renderCards = () => {
    if (isLoading) {
      // Renderiza 12 skeletons durante o carregamento
      return Array(12)
        .fill(null)
        .map((_, index) => (
          <div key={`skeleton-${index}`} className="min-w-[250px]">
            <CardImovelSkeleton />
          </div>
        ));
    }

    // Renderiza os imóveis carregados
    if (Array.isArray(imoveis) && imoveis.length > 0) {
      // Aplicar ordenação se necessário
      let imoveisOrdenados = [...imoveis];

      if (ordenacao === "maior_valor") {
        imoveisOrdenados.sort((a, b) => {
          // Converter ValorAntigo para número para comparação
          const valorA = a.ValorAntigo ? parseFloat(a.ValorAntigo.replace(/\D/g, "")) : 0;
          const valorB = b.ValorAntigo ? parseFloat(b.ValorAntigo.replace(/\D/g, "")) : 0;
          return valorB - valorA; // Ordem decrescente
        });
      } else if (ordenacao === "menor_valor") {
        imoveisOrdenados.sort((a, b) => {
          // Converter ValorAntigo para número para comparação
          const valorA = a.ValorAntigo ? parseFloat(a.ValorAntigo.replace(/\D/g, "")) : 0;
          const valorB = b.ValorAntigo ? parseFloat(b.ValorAntigo.replace(/\D/g, "")) : 0;
          return valorA - valorB; // Ordem crescente
        });
      }

      return imoveisOrdenados.map((imovel) => {
        // Garantir que cada imóvel tenha um código único
        const key =
          imovel.Codigo || `imovel-${imovel._id || Math.random().toString(36).substr(2, 9)}`;
        return (
          <div key={key} className="flex-1 min-w-[260px]">
            <CardImovel {...imovel} />
          </div>
        );
      });
    }

    // Caso não tenha imóveis
    return <p className="text-center w-full py-8">Nenhum imóvel encontrado.</p>;
  };

  // Variantes de animação para o conteúdo principal
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

  // Efeito para buscar imóveis quando a página muda ou os filtros são aplicados/removidos
  useEffect(() => {
    // Verificar se há parâmetro de busca na URL apenas para o termo de busca
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get("q");

    setIsLoading(true);

    // Prioridade 1: Mostrar favoritos se estiver nesse modo
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

    // Prioridade 2: Usar filtros se tiverem sido aplicados
    if (filtrosAplicados) {
      // Limpar qualquer termo de busca ao usar filtros
      if (searchTerm) setSearchTerm("");
      buscarImoveis(true);
      return;
    }

    // Prioridade 3: Usar termo de busca da URL ou do estado
    if (searchQuery || searchTerm) {
      const termToSearch = searchQuery || searchTerm;

      // Atualiza o input se veio da URL
      if (searchQuery && searchQuery !== searchTerm) {
        setSearchTerm(searchQuery);
      }

      handleSearch(termToSearch);
      return;
    }

    // Prioridade 4: Busca padrão sem filtros

    buscarImoveis(false);
  }, [filtrosAplicados, atualizacoesFiltros, currentPage, mostrandoFavoritos, favoritos]);

  // Função para construir o texto dos filtros aplicados para exibir na página
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

  // Função para lidar com a mudança de ordenação
  const handleOrdenacaoChange = (e) => {
    setOrdenacao(e.target.value);
  };

  // Função para resetar o estado de busca quando os filtros são aplicados
  const resetarEstadoBusca = () => {
    // Limpar o termo de busca no estado
    setSearchTerm("");

    // Resetar para a primeira página
    setCurrentPage(1);

    // Se estávamos em modo de favoritos, voltar para modo normal
    if (mostrandoFavoritos) {
      setMostrandoFavoritos(false);
    }

    // DESABILITADO: Redirecionamento automático para URL SEO-friendly
    // Mantém o usuário na página de busca normal (/busca) com todos os filtros
    // const filtrosAtuais = useFiltersStore.getState();
    // if (podeUsarUrlSeoFriendly(filtrosAtuais)) {
    //   console.log('Aplicando filtros com URL SEO-friendly');
    //   setTimeout(() => {
    //     navegarComFiltros(filtrosAtuais);
    //   }, 100); // Pequeno delay para garantir que o store foi atualizado
    // }
  };

  return (
    <>
      <section
        className={`bg-zinc-100 pb-32 px-4 sm:px-8 md:px-10 relative ${
          !uiVisible ? "opacity-0" : "opacity-100 transition-opacity duration-300"
        }`}
      >
        {/* Fixed search bar that stays below the header */}
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

                {/* Indicador verde quando os filtros básicos estão preenchidos */}
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
          {/* Container do filtro - tem que ficar acima de tudo */}
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

          {/* Container do conteúdo principal - tem que ficar abaixo do filtro */}
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

            {/* Componente de paginação no final da página */}
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
