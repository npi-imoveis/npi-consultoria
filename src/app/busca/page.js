// src/app/busca/page.js - SOLUÇÃO COMPLETA SEO + FUNCIONALIDADE EM 1 ARQUIVO

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

// 🎯 FUNÇÕES SEO INLINE
function updateDynamicSEO(filtros, totalItems = 0) {
  if (typeof document === 'undefined') return;
  
  try {
    const currentDate = new Date().toISOString();
    
    // Atualizar título dinâmico
    let title = 'Busca de Imóveis | NPi Imóveis';
    let description = 'Encontre apartamentos, casas e imóveis de alto padrão com a NPi Imóveis.';
    
    if (filtros.cidadeSelecionada || filtros.categoriaSelecionada) {
      title = gerarTituloSeoFriendly(filtros);
      description = gerarDescricaoSeoFriendly(filtros);
    }
    
    // Atualizar título da página
    document.title = title;
    
    // Atualizar meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }
    
    // Atualizar Open Graph tags
    const updateOrCreateMeta = (property, content) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateOrCreateMeta('og:title', title);
    updateOrCreateMeta('og:description', description);
    updateOrCreateMeta('og:url', window.location.href);
    updateOrCreateMeta('og:updated_time', currentDate);
    
    // Atualizar Twitter Cards
    const updateOrCreateTwitterMeta = (name, content) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };
    
    updateOrCreateTwitterMeta('twitter:title', title);
    updateOrCreateTwitterMeta('twitter:description', description);
    
    // Atualizar last-modified
    const lastModified = document.querySelector('meta[http-equiv="last-modified"]');
    if (lastModified) {
      lastModified.setAttribute('content', currentDate);
    } else {
      const newLastModified = document.createElement('meta');
      newLastModified.setAttribute('http-equiv', 'last-modified');
      newLastModified.content = currentDate;
      document.head.appendChild(newLastModified);
    }
    
    // Atualizar Structured Data dinamicamente
    updateStructuredData(totalItems, filtros);
    
    console.log('✅ SEO atualizado dinamicamente:', { title, description, totalItems });
  } catch (error) {
    console.error('❌ Erro ao atualizar SEO:', error);
  }
}

function updateStructuredData(totalItems, filtros) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br';
    const currentDate = new Date().toISOString();
    
    // Buscar script existente ou criar novo
    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    
    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SearchResultsPage",
          "@id": `${baseUrl}/busca#webpage`,
          url: window.location.href,
          name: document.title,
          description: document.querySelector('meta[name="description"]')?.content || '',
          datePublished: currentDate,
          dateModified: currentDate,
          isPartOf: {
            "@type": "WebSite",
            "@id": `${baseUrl}#website`,
            name: "NPi Imóveis",
            url: baseUrl,
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${baseUrl}/busca?q={search_term_string}`
              },
              "query-input": "required name=search_term_string"
            }
          },
          mainEntity: {
            "@type": "ItemList",
            numberOfItems: totalItems
          }
        },
        {
          "@type": "Organization",
          "@id": `${baseUrl}#organization`,
          name: "NPi Imóveis",
          url: baseUrl,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/assets/images/logo-npi.png`,
            width: 300,
            height: 100
          },
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+55-11-99999-9999",
            contactType: "customer service",
            areaServed: "BR",
            availableLanguage: "Portuguese"
          },
          sameAs: [
            "https://www.instagram.com/npiimoveis",
            "https://www.linkedin.com/company/npi-imoveis",
            "https://www.facebook.com/npiimoveis"
          ]
        },
        {
          "@type": "BreadcrumbList",
          "@id": `${window.location.href}#breadcrumb`,
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: baseUrl
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Busca de Imóveis",
              item: `${baseUrl}/busca`
            }
          ]
        }
      ]
    };
    
    script.textContent = JSON.stringify(structuredData);
    console.log('✅ Structured Data atualizado');
  } catch (error) {
    console.error('❌ Erro ao atualizar Structured Data:', error);
  }
}

// 🎯 COMPONENTE PRINCIPAL COM SEO INTEGRADO
export default function BuscaImoveis() {
  const [imoveis, setImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const filtrosAtuais = useFiltersStore((state) => state);
  const filtrosAplicados = useFiltersStore((state) => state.filtrosAplicados);
  const filtrosBasicosPreenchidos = useFiltersStore((state) => state.filtrosBasicosPreenchidos);

  const [searchTerm, setSearchTerm] = useState("");
  const [ordenacao, setOrdenacao] = useState("relevancia");

  const adicionarVariosImoveisCache = useImovelStore((state) => state.adicionarVariosImoveisCache);

  const router = useRouter();

  const [mostrandoMapa, setMostrandoMapa] = useState(false);
  const [mostrandoFavoritos, setMostrandoFavoritos] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);

  const { favoritos, getQuantidadeFavoritos } = useFavoritosStore();
  const quantidadeFavoritos = getQuantidadeFavoritos();

  const atualizacoesFiltros = useFiltersStore((state) => state.atualizacoesFiltros);

  // Estados para paginação
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

  // 🎯 EFEITO PARA INICIALIZAR SEO ESTÁTICO NO MOUNT
  useEffect(() => {
    if (typeof document === 'undefined') return;
    
    // Adicionar meta tags SEO básicas se não existirem
    const addMetaIfNotExists = (attribute, value, content) => {
      const selector = attribute === 'name' ? `meta[name="${value}"]` : `meta[property="${value}"]`;
      if (!document.querySelector(selector)) {
        const meta = document.createElement('meta');
        meta.setAttribute(attribute, value);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };
    
    const currentDate = new Date().toISOString();
    
    // Meta tags básicas
    addMetaIfNotExists('name', 'description', 'Encontre apartamentos, casas e imóveis de alto padrão com filtros avançados, mapa interativo e as melhores oportunidades do mercado imobiliário.');
    addMetaIfNotExists('name', 'keywords', 'busca imóveis, apartamentos luxo, casas alto padrão, imóveis São Paulo, NPi Imóveis');
    addMetaIfNotExists('name', 'robots', 'index, follow, max-snippet:-1, max-video-preview:-1, max-image-preview:large');
    
    // Open Graph
    addMetaIfNotExists('property', 'og:title', 'Busca de Imóveis de Luxo | NPi Imóveis');
    addMetaIfNotExists('property', 'og:description', 'Encontre apartamentos, casas e imóveis de alto padrão com filtros avançados, mapa interativo e as melhores oportunidades do mercado imobiliário.');
    addMetaIfNotExists('property', 'og:type', 'website');
    addMetaIfNotExists('property', 'og:url', window.location.href);
    addMetaIfNotExists('property', 'og:site_name', 'NPi Imóveis');
    addMetaIfNotExists('property', 'og:locale', 'pt_BR');
    addMetaIfNotExists('property', 'og:image', `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}/assets/busca-imoveis-seo.jpg`);
    addMetaIfNotExists('property', 'og:published_time', currentDate);
    addMetaIfNotExists('property', 'og:modified_time', currentDate);
    addMetaIfNotExists('property', 'og:updated_time', currentDate);
    
    // Twitter Cards
    addMetaIfNotExists('name', 'twitter:card', 'summary_large_image');
    addMetaIfNotExists('name', 'twitter:site', '@NPIImoveis');
    addMetaIfNotExists('name', 'twitter:creator', '@NPIImoveis');
    addMetaIfNotExists('name', 'twitter:title', 'Busca de Imóveis de Luxo | NPi Imóveis');
    addMetaIfNotExists('name', 'twitter:description', 'Encontre apartamentos, casas e imóveis de alto padrão com filtros avançados, mapa interativo e as melhores oportunidades do mercado imobiliário.');
    addMetaIfNotExists('name', 'twitter:image', `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}/assets/busca-imoveis-seo.jpg`);
    
    // Datas - RESOLVE PROBLEMA AHREFS
    addMetaIfNotExists('name', 'article:published_time', currentDate);
    addMetaIfNotExists('name', 'article:modified_time', currentDate);
    addMetaIfNotExists('name', 'article:author', 'NPi Imóveis');
    addMetaIfNotExists('name', 'article:section', 'Busca de Imóveis');
    addMetaIfNotExists('name', 'last-modified', currentDate);
    addMetaIfNotExists('name', 'date', currentDate);
    
    // Adicionar canonical se não existir
    if (!document.querySelector('link[rel="canonical"]')) {
      const canonical = document.createElement('link');
      canonical.rel = 'canonical';
      canonical.href = window.location.href;
      document.head.appendChild(canonical);
    }
    
    // Inicializar Structured Data
    updateStructuredData(0, {});
    
    console.log('✅ SEO básico inicializado');
  }, []);

  // Função para atualizar título dinâmico
  const updateDynamicTitle = (totalItems = null) => {
    const filtrosAtuais = useFiltersStore.getState();
    updateDynamicSEO(filtrosAtuais, totalItems || pagination.totalItems);
  };

  // Função para atualizar URL quando filtros mudam
  const updateUrlFromFilters = () => {
    const filtrosAtuais = useFiltersStore.getState();
    
    console.log('🔍 [BUSCA] Atualizando URL com filtros:', {
      cidadeSelecionada: filtrosAtuais.cidadeSelecionada,
      finalidade: filtrosAtuais.finalidade,
      categoriaSelecionada: filtrosAtuais.categoriaSelecionada,
      bairrosSelecionados: filtrosAtuais.bairrosSelecionados,
      quartos: filtrosAtuais.quartos
    });
    
    // Verificar se os filtros básicos estão preenchidos para URL amigável
    if (filtrosAtuais.cidadeSelecionada && filtrosAtuais.finalidade && filtrosAtuais.categoriaSelecionada) {
      const urlAmigavel = gerarUrlSeoFriendly(filtrosAtuais);
      console.log('🔍 [BUSCA] Atualizando URL para:', urlAmigavel);
      
      router.push(urlAmigavel, { scroll: false });
    } else {
      console.log('🔍 [BUSCA] Filtros básicos não estão completos, mantendo /busca');
      
      const params = new URLSearchParams();
      if (filtrosAtuais.cidadeSelecionada) params.set('cidade', filtrosAtuais.cidadeSelecionada);
      if (filtrosAtuais.finalidade) params.set('finalidade', filtrosAtuais.finalidade);
      if (filtrosAtuais.categoriaSelecionada) params.set('categoria', filtrosAtuais.categoriaSelecionada);
      if (filtrosAtuais.bairrosSelecionados && filtrosAtuais.bairrosSelecionados.length > 0) {
        params.set('bairros', filtrosAtuais.bairrosSelecionados.join(','));
      }
      if (filtrosAtuais.quartos) params.set('quartos', filtrosAtuais.quartos);
      if (filtrosAtuais.precoMin) params.set('precoMin', filtrosAtuais.precoMin);
      if (filtrosAtuais.precoMax) params.set('precoMax', filtrosAtuais.precoMax);
      
      const urlComParams = params.toString() ? `/busca?${params.toString()}` : '/busca';
      router.push(urlComParams, { scroll: false });
      
      // Atualizar canonical com nova URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) {
        canonical.href = `${window.location.origin}${urlComParams}`;
      }
    }
  };

  // Efeito para marcar quando estamos no navegador
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Efeito para carregar filtros dos parâmetros da URL
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
    const searchQuery = searchParams.get('q');
    
    // Se há parâmetros de filtros na URL, aplicá-los
    if (cidade || finalidade || categoria || bairros || quartos || precoMin || precoMax) {
      console.log('🔍 [BUSCA] Carregando filtros dos parâmetros da URL:', {
        cidade, finalidade, categoria, bairros, quartos, precoMin, precoMax
      });
      
      const filtrosStore = useFiltersStore.getState();
      
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
      
      filtrosStore.setFilters(filtrosParaAplicar);
      filtrosStore.aplicarFiltros();
      
      setTimeout(() => {
        updateDynamicTitle();
      }, 100);
    }
    
    // Se há query de busca, definir no estado
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [isBrowser]);

  // Efeito para atualizar título e URL quando filtros são aplicados manualmente
  useEffect(() => {
    if (!isBrowser) return;
    
    const filtrosAtuais = useFiltersStore.getState();
    if (filtrosAtuais.filtrosAplicados) {
      console.log('🔍 [BUSCA] Filtros aplicados detectados, atualizando título e URL...');
      updateDynamicTitle();
      
      setTimeout(() => {
        updateUrlFromFilters();
      }, 50);
    }
  }, [atualizacoesFiltros, isBrowser]);

  // Detectar ambiente de cliente
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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Função para buscar imóveis com ou sem filtros
  const buscarImoveis = async (comFiltros = false) => {
    if (mostrandoFavoritos) {
      setImoveis(favoritos);
      const paginationData = {
        totalItems: favoritos.length,
        totalPages: Math.ceil(favoritos.length / 12),
        currentPage: 1,
        itemsPerPage: 12,
        limit: 12,
      };
      setPagination(paginationData);
      setIsLoading(false);
      
      // 🎯 ATUALIZAR SEO COM RESULTADOS
      updateDynamicSEO(useFiltersStore.getState(), favoritos.length);
      return;
    }

    setIsLoading(true);
    try {
      let params = {};

      if (comFiltros) {
        const filtrosAtuais = useFiltersStore.getState();
        const finalidade = filtrosAtuais.finalidade || "Comprar";

        params = {
          finalidade: finalidade,
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
        
        // 🎯 ATUALIZAR SEO COM RESULTADOS
        updateDynamicSEO(useFiltersStore.getState(), validPagination.totalItems);
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
      
      // 🎯 ATUALIZAR SEO PARA ERRO
      updateDynamicSEO(useFiltersStore.getState(), 0);
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
      const paginationData = {
        totalItems: favoritos.length,
        totalPages: Math.ceil(favoritos.length / 12),
        currentPage: 1,
        itemsPerPage: 12,
        limit: 12,
      };
      setPagination(paginationData);
      
      // 🎯 ATUALIZAR SEO
      updateDynamicSEO(useFiltersStore.getState(), favoritos.length);
    } else {
      buscarImoveis(filtrosAplicados);
    }
  };

  const handleSearch = async (term) => {
    useFiltersStore.getState().limparFiltros();
    updateDynamicTitle();

    if (!term || term.trim() === "") {
      buscarImoveis(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await searchImoveis(term);
      if (response && response.data) {
        setImoveis(response.data);
        const paginationData = {
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / 12),
          currentPage: 1,
          itemsPerPage: 12,
          limit: 12,
        };
        setPagination(paginationData);

        if (Array.isArray(response.data) && response.data.length > 0) {
          adicionarVariosImoveisCache(response.data);
        }
        
        // 🎯 ATUALIZAR SEO
        updateDynamicSEO({ searchTerm: term }, response.data.length);
      } else {
        setImoveis([]);
        updateDynamicSEO({ searchTerm: term }, 0);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setImoveis([]);
      updateDynamicSEO({ searchTerm: term }, 0);
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

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const searchQuery = searchParams.get("q");

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
  }, [filtrosAplicados, atualizacoesFiltros, currentPage, mostrandoFavoritos, favoritos]);

  const construirTextoFiltros = () => {
    const filtrosAtuais = useFiltersStore.getState();
    
    let texto = '';
    
    const quantidade = pagination.totalItems || 0;
    texto += `${quantidade}`;
    
    if (filtrosAtuais.categoriaSelecionada) {
      const categoriaPluralMap = {
        'Apartamento': 'apartamentos',
        'Casa': 'casas',
        'Casa Comercial': 'casas comerciais',
        'Casa em Condominio': 'casas em condomínio',
        'Cobertura': 'coberturas',
        'Flat': 'flats',
        'Garden': 'gardens',
        'Loft': 'lofts',
        'Loja': 'lojas',
        'Prédio Comercial': 'prédios comerciais',
        'Sala Comercial': 'salas comerciais',
        'Sobrado': 'sobrados',
        'Terreno': 'terrenos'
      };
      const categoriaPlural = categoriaPluralMap[filtrosAtuais.categoriaSelecionada] || 'imóveis';
      texto += ` ${categoriaPlural}`;
    } else {
      texto += ' imóveis';
    }
    
    if (filtrosAtuais.finalidade) {
      const finalidadeTexto = filtrosAtuais.finalidade === 'Comprar' ? 'à venda' : 'para venda';
      texto += ` ${finalidadeTexto}`;
    }
    
    if (filtrosAtuais.bairrosSelecionados && filtrosAtuais.bairrosSelecionados.length > 0) {
      if (filtrosAtuais.bairrosSelecionados.length === 1) {
        texto += ` em ${filtrosAtuais.bairrosSelecionados[0]}`;
      } else if (filtrosAtuais.bairrosSelecionados.length <= 3) {
        texto += ` em ${filtrosAtuais.bairrosSelecionados.join(', ')}`;
      } else {
        texto += ` em ${filtrosAtuais.bairrosSelecionados.slice(0, 2).join(', ')} e mais ${filtrosAtuais.bairrosSelecionados.length - 2} bairros`;
      }
    } else if (filtrosAtuais.cidadeSelecionada) {
      texto += ` em ${filtrosAtuais.cidadeSelecionada}`;
    }

    return texto || 'Busca de imóveis';
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
                  <h2 className="text-xs font-bold text-zinc-500">{construirTextoFiltros()}</h2>
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
