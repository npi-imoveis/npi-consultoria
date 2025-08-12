// src/app/busca/page.js - SOLUÇÃO COMPLETA EM 1 ARQUIVO - SEO OTIMIZADO

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

  // 🎯 FUNÇÃO PARA ATUALIZAR STRUCTURED DATA DINAMICAMENTE
  const updateStructuredData = (totalItems = 0, imoveisData = []) => {
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
              numberOfItems: totalItems,
              itemListElement: imoveisData.slice(0, 10).map((imovel, index) => ({
                "@type": "ListItem",
                position: index + 1,
                item: {
                  "@type": "RealEstateAgent",
                  name: imovel.NomeImovel || `Imóvel ${imovel.Codigo}`,
                  url: `${baseUrl}/imovel/${imovel.Codigo}`,
                  image: imovel.Foto1 || `${baseUrl}/assets/default-property.jpg`,
                  description: imovel.Observacoes?.substring(0, 200) || `Imóvel código ${imovel.Codigo}`,
                  offers: {
                    "@type": "Offer",
                    price: imovel.ValorNumerico || 0,
                    priceCurrency: "BRL",
                    availability: "https://schema.org/InStock"
                  },
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: imovel.Cidade || "São Paulo",
                    addressRegion: "SP",
                    addressCountry: "BR"
                  }
                }
              }))
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
          }
        ]
      };
      
      script.textContent = JSON.stringify(structuredData);
      console.log('✅ Structured Data atualizado:', { totalItems, imoveisCount: imoveisData.length });
    } catch (error) {
      console.error('❌ Erro ao atualizar Structured Data:', error);
    }
  };

  // 🎯 FUNÇÃO PARA ATUALIZAR TÍTULO COM QUANTIDADE (AGORA INTEGRADA NO TÍTULO PRINCIPAL)
  const updateTitleWithCount = (totalItems = 0) => {
    try {
      // A quantidade agora já está integrada na função updateClientMetaTags
      // Esta função mantida para compatibilidade, mas a lógica principal foi movida
      updateClientMetaTags(totalItems);
      console.log('🎯 [TITLE] Título atualizado com quantidade:', document.title);
    } catch (error) {
      console.error('❌ Erro ao atualizar título:', error);
    }
  };

  // 🔥 FUNÇÃO PARA ATUALIZAR META TAGS DINAMICAMENTE BASEADO NOS FILTROS ATUAIS
  const updateClientMetaTags = (quantidadeResultados = null) => {
    try {
      const currentDate = new Date().toISOString();
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br';
      
      // 🎯 OBTER FILTROS ATUAIS DO STORE
      const filtrosAtuais = useFiltersStore.getState();
      
      // 🔥 DEBUG PARA VERIFICAR FINALIDADE
      console.log('🎯 [META-TAGS] Filtros atuais completos:', filtrosAtuais);
      console.log('🎯 [META-TAGS] Finalidade detectada:', filtrosAtuais.finalidade);
      console.log('🎯 [META-TAGS] URL atual:', window.location.pathname);
      console.log('🎯 [META-TAGS] Quantidade recebida:', quantidadeResultados);
      
      let title = 'NPi Consultoria - Imóveis de Alto Padrão'; // Título padrão
      let description = 'Especialistas em imóveis de alto padrão. Encontre apartamentos, casas e terrenos exclusivos com a melhor consultoria imobiliária.';
      let keywords = 'busca imóveis, apartamentos luxo, casas alto padrão, imóveis São Paulo, NPi Imóveis';
      let canonicalUrl = `${baseUrl}/busca`;

      // 🔥 GERAR TÍTULO DINÂMICO BASEADO NOS FILTROS APLICADOS
      if (filtrosAtuais.cidadeSelecionada || filtrosAtuais.categoriaSelecionada || filtrosAtuais.finalidade) {
        const titleParts = [];
        const descriptionParts = [];
        
        // 1. Categoria (plural para título, normal para descrição)
        let categoriaPlural = 'Imóveis';
        if (filtrosAtuais.categoriaSelecionada) {
          const categoriaPluralMap = {
            'Apartamento': 'Apartamentos',
            'Casa': 'Casas',
            'Casa Comercial': 'Casas comerciais',
            'Casa em Condominio': 'Casas em condomínio',
            'Cobertura': 'Coberturas',
            'Flat': 'Flats',
            'Garden': 'Gardens',
            'Loft': 'Lofts',
            'Loja': 'Lojas',
            'Prédio Comercial': 'Prédios comerciais',
            'Sala Comercial': 'Salas comerciais',
            'Sobrado': 'Sobrados',
            'Terreno': 'Terrenos'
          };
          categoriaPlural = categoriaPluralMap[filtrosAtuais.categoriaSelecionada] || 'Imóveis';
          titleParts.push(categoriaPlural);
          descriptionParts.push(categoriaPlural.toLowerCase());
        } else {
          titleParts.push('Imóveis');
          descriptionParts.push('imóveis');
        }
        
        // 2. Finalidade (para descrição e título)
        let finalidadeTexto = '';
        let finalidadeTitulo = '';
        
        // 🔥 MAPEAMENTO ROBUSTO DA FINALIDADE
        console.log('🎯 [FINALIDADE] Valor atual no store:', filtrosAtuais.finalidade);
        
        if (filtrosAtuais.finalidade === 'Comprar' || filtrosAtuais.finalidade === 'venda') {
          finalidadeTexto = 'a venda';
          finalidadeTitulo = 'Venda';
        } else if (filtrosAtuais.finalidade === 'Alugar' || filtrosAtuais.finalidade === 'aluguel') {
          finalidadeTexto = 'para aluguel';
          finalidadeTitulo = 'Aluguel';
        }
        
        console.log('🎯 [FINALIDADE] Mapeamento:', {
          storeValue: filtrosAtuais.finalidade,
          finalidadeTexto,
          finalidadeTitulo
        });
        
        if (finalidadeTexto) {
          descriptionParts.push(finalidadeTexto);
        }
        
        // 3. Localização
        if (filtrosAtuais.cidadeSelecionada) {
          const cidadeFormatada = filtrosAtuais.cidadeSelecionada
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
          titleParts.push(`no ${cidadeFormatada}`);
          descriptionParts.push(cidadeFormatada);
        }
        
        // 4. Finalidade no título (após localização)
        if (finalidadeTitulo) {
          titleParts.push(finalidadeTitulo);
        }
        
        // 5. Bairros específicos (só na descrição)
        if (filtrosAtuais.bairrosSelecionados && filtrosAtuais.bairrosSelecionados.length > 0) {
          if (filtrosAtuais.bairrosSelecionados.length === 1) {
            descriptionParts.push(`- ${filtrosAtuais.bairrosSelecionados[0]}`);
          } else if (filtrosAtuais.bairrosSelecionados.length <= 2) {
            descriptionParts.push(`- ${filtrosAtuais.bairrosSelecionados.join(', ')}`);
          }
        }
        
        // 🎯 CONSTRUIR TÍTULO NO NOVO FORMATO: "Apartamentos no Guarujá Venda 54 imóveis"
        // Usar quantidade passada por parâmetro ou do estado pagination
        const quantidadeAtual = quantidadeResultados !== null ? quantidadeResultados : (pagination?.totalItems || 0);
        if (quantidadeAtual > 0) {
          title = `${titleParts.join(' ')} ${quantidadeAtual} imóveis`;
        } else {
          title = `${titleParts.join(' ')}`;
        }
        
        console.log('🎯 [TÍTULO] Partes do título:', titleParts);
        console.log('🎯 [TÍTULO] Título final:', title);
        
        // 🎯 CONSTRUIR DESCRIÇÃO: "Especialistas em apartamentos a venda Guarujá. NPi"
        description = `Especialistas em ${descriptionParts.join(' ')}. NPi`;
        
        console.log('🎯 [DESCRIÇÃO] Partes da descrição:', descriptionParts);
        console.log('🎯 [DESCRIÇÃO] Descrição final:', description);
        
        // 🎯 CONSTRUIR URL CANÔNICA
        const urlAtual = window.location.pathname;
        
        // 🔥 SE JÁ ESTAMOS NUMA URL SEO-FRIENDLY (/buscar/...), USAR ELA COMO CANONICAL
        if (urlAtual.startsWith('/buscar/') && urlAtual.split('/').length >= 5) {
          // Já é uma URL SEO-friendly, usar a URL atual como canonical
          canonicalUrl = window.location.origin + urlAtual;
          console.log('🎯 [URL-CANONICAL] URL SEO detectada, usando atual como canonical:', canonicalUrl);
        } else if (filtrosAtuais.cidadeSelecionada && filtrosAtuais.categoriaSelecionada && filtrosAtuais.finalidade) {
          // Gerar URL SEO-friendly
          let finalidadeSlug = 'venda'; // Default
          
          // 🔥 MAPEAMENTO ROBUSTO STORE → URL
          if (filtrosAtuais.finalidade === 'Comprar' || filtrosAtuais.finalidade === 'venda') {
            finalidadeSlug = 'venda';
          } else if (filtrosAtuais.finalidade === 'Alugar' || filtrosAtuais.finalidade === 'aluguel') {
            finalidadeSlug = 'aluguel';
          }
          
          console.log('🎯 [URL-SLUG] Finalidade store → slug:', filtrosAtuais.finalidade, '→', finalidadeSlug);
          
          const categoriaSlugMap = {
            'Apartamento': 'apartamentos',
            'Casa': 'casas',
            'Cobertura': 'coberturas',
            'Terreno': 'terrenos',
            'Flat': 'flats',
            'Garden': 'gardens',
            'Loft': 'lofts',
            'Loja': 'lojas',
            'Sobrado': 'sobrados'
          };
          const categoriaSlug = categoriaSlugMap[filtrosAtuais.categoriaSelecionada] || filtrosAtuais.categoriaSelecionada.toLowerCase();
          const cidadeSlug = filtrosAtuais.cidadeSelecionada.toLowerCase().replace(/\s+/g, '-');
          
          canonicalUrl = `${baseUrl}/buscar/${finalidadeSlug}/${categoriaSlug}/${cidadeSlug}`;
          console.log('🎯 [URL-CANONICAL] URL SEO gerada:', canonicalUrl);
        } else {
          // Usar URL atual como fallback
          canonicalUrl = window.location.origin + window.location.pathname + (window.location.search || '');
          console.log('🎯 [URL-CANONICAL] Usando URL atual como fallback:', canonicalUrl);
        }
        
        console.log('🎯 [TÍTULO DINÂMICO]:', title);
        console.log('🎯 [FILTROS ATUAIS]:', filtrosAtuais);
      }

      // 🔥 FORÇAR ATUALIZAÇÃO DO TÍTULO
      document.title = title;
      
      // Remover qualquer meta title existente e criar novo
      const existingTitleMeta = document.querySelector('meta[name="title"]');
      if (existingTitleMeta) {
        existingTitleMeta.remove();
      }
      
      const titleMeta = document.createElement('meta');
      titleMeta.setAttribute('name', 'title');
      titleMeta.setAttribute('content', title);
      document.head.appendChild(titleMeta);
      
      // Atualizar/criar meta tags restantes
      const metaTags = [
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { name: 'date', content: currentDate },
        { name: 'last-modified', content: currentDate },
        { name: 'datePublished', content: currentDate },
        { name: 'dateModified', content: currentDate },
        { property: 'article:published_time', content: currentDate },
        { property: 'article:modified_time', content: currentDate },
        { property: 'og:updated_time', content: currentDate },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'NPi Imóveis' },
        { property: 'og:locale', content: 'pt_BR' },
        { property: 'og:image', content: `${baseUrl}/assets/busca-imoveis.jpg` },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: title },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@NPIImoveis' },
        { name: 'twitter:creator', content: '@NPIImoveis' },
        { name: 'twitter:image', content: `${baseUrl}/assets/busca-imoveis.jpg` },
        { name: 'twitter:image:alt', content: title },
        { name: 'DC.date.created', content: currentDate },
        { name: 'DC.date.modified', content: currentDate },
        { name: 'x-robots-tag', content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
      ];
      
      // Atualizar meta tags
      metaTags.forEach(tag => {
        const selector = tag.name ? `meta[name="${tag.name}"]` : `meta[property="${tag.property}"]`;
        let existingTag = document.querySelector(selector);
        
        if (!existingTag) {
          existingTag = document.createElement('meta');
          if (tag.name) existingTag.setAttribute('name', tag.name);
          if (tag.property) existingTag.setAttribute('property', tag.property);
          document.head.appendChild(existingTag);
        }
        
        existingTag.setAttribute('content', tag.content);
      });
      
      // 🔥 VERIFICAR E ATUALIZAR CANONICAL LINK
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalLink);
        console.log('🎯 [CANONICAL] Link canonical criado');
      } else {
        console.log('🎯 [CANONICAL] Link canonical já existe, atualizando');
      }
      
      // 🔥 FORÇAR ATUALIZAÇÃO DA URL CANONICAL
      canonicalLink.setAttribute('href', canonicalUrl);
      console.log('🎯 [CANONICAL] URL canonical definida:', canonicalUrl);
      console.log('🎯 [CANONICAL] URL atual da página:', window.location.href);
      
      // Adicionar hreflang
      let hreflangPtBr = document.querySelector('link[rel="alternate"][hreflang="pt-BR"]');
      if (!hreflangPtBr) {
        hreflangPtBr = document.createElement('link');
        hreflangPtBr.setAttribute('rel', 'alternate');
        hreflangPtBr.setAttribute('hreflang', 'pt-BR');
        document.head.appendChild(hreflangPtBr);
      }
      hreflangPtBr.setAttribute('href', canonicalUrl);
      
      console.log('✅ Meta tags SEO atualizadas:', { title, canonicalUrl });
      
      // 🔥 VERIFICAÇÃO FINAL PARA CANONICAL
      const urlAtual = window.location.href;
      if (canonicalUrl !== urlAtual) {
        console.log('⚠️ [CANONICAL] URL canonical diferente da atual:');
        console.log('   - URL atual:', urlAtual);
        console.log('   - URL canonical:', canonicalUrl);
        console.log('   - Isso pode causar "Non-canonical" no Ahrefs');
      } else {
        console.log('✅ [CANONICAL] URL canonical igual à atual - OK!');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar meta tags:', error);
    }
  };

  // 🎯 FUNÇÃO PARA EXTRAIR PARÂMETROS DE URL SEO-FRIENDLY
  const extractFromSeoUrl = () => {
    const path = window.location.pathname;
    
    // Detectar padrão: /buscar/venda/apartamentos/guaruja
    const seoUrlMatch = path.match(/\/buscar?\/([^\/]+)\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/);
    
    if (seoUrlMatch) {
      const [, finalidade, categoria, cidade, bairro] = seoUrlMatch;
      
      console.log('🎯 [SEO-URL] URL detectada:', { finalidade, categoria, cidade, bairro });
      
      // 🔥 MAPEAMENTO CORRETO: URL → STORE
      let finalidadeStore = 'Comprar'; // Default
      if (finalidade === 'venda') {
        finalidadeStore = 'Comprar';
      } else if (finalidade === 'aluguel') {
        finalidadeStore = 'Alugar';
      }
      
      console.log('🎯 [SEO-URL] Finalidade mapeada:', finalidade, '→', finalidadeStore);
      
      return {
        finalidade: finalidadeStore,
        categoria: categoria,
        cidade: cidade.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        bairro: bairro ? bairro.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : null
      };
    }
    
    return null;
  };

  // Função para atualizar URL quando filtros mudam
  const updateUrlFromFilters = () => {
    const filtrosAtuais = useFiltersStore.getState();
    
    console.log('🔍 [BUSCA] Atualizando URL:', filtrosAtuais);
    console.log('🔍 [BUSCA] Finalidade atual:', filtrosAtuais.finalidade);
    
    if (filtrosAtuais.cidadeSelecionada && filtrosAtuais.finalidade && filtrosAtuais.categoriaSelecionada) {
      const urlAmigavel = gerarUrlSeoFriendly(filtrosAtuais);
      console.log('🔍 [BUSCA] URL SEO-friendly gerada:', urlAmigavel);
      router.push(urlAmigavel, { scroll: false });
    } else {
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
      console.log('🔍 [BUSCA] URL com params gerada:', urlComParams);
      router.push(urlComParams, { scroll: false });
    }
  };

  // Efeito para marcar quando estamos no navegador
  useEffect(() => {
    setIsBrowser(true);
    // 🔥 DELAY INICIAL PARA GARANTIR CARREGAMENTO COMPLETO
    setTimeout(() => {
      updateClientMetaTags();
      console.log('🎯 [INICIAL] Meta tags atualizadas no carregamento inicial');
    }, 500);
  }, []);

  // Efeito para atualizar meta tags quando URL muda
  useEffect(() => {
    if (isBrowser) {
      // 🔥 DELAY PARA GARANTIR QUE A PÁGINA CARREGOU COMPLETAMENTE
      setTimeout(() => {
        updateClientMetaTags();
        console.log('🎯 [URL-MUDOU] Meta tags atualizadas após mudança de URL');
      }, 200);
    }
  }, [isBrowser]);

  // 🔥 EFEITO PARA GARANTIR ATUALIZAÇÃO APÓS CARREGAR DADOS E APLICAR FILTROS
  useEffect(() => {
    if (isBrowser && !isLoading) {
      // 🔥 DELAY MAIOR PARA GARANTIR QUE TODOS OS DADOS ESTEJAM CARREGADOS
      setTimeout(() => {
        updateClientMetaTags();
        
        // Log para debug
        console.log('🎯 [DEBUG] Título atual:', document.title);
        console.log('🎯 [DEBUG] Filtros aplicados:', filtrosAplicados);
        console.log('🎯 [DEBUG] URL atual:', window.location.href);
        console.log('🎯 [DEBUG] Pagination:', pagination);
      }, 400);
    }
  }, [isBrowser, isLoading, filtrosAplicados]);

  // Efeito adicional para atualizar quando filtros mudam
  useEffect(() => {
    if (isBrowser && (filtrosAplicados || searchTerm)) {
      // 🔥 DELAY MAIOR PARA EVITAR MÚLTIPLAS CHAMADAS
      setTimeout(() => {
        updateClientMetaTags();
        console.log('🎯 [FILTROS-APLICADOS] Meta tags atualizadas');
      }, 250);
    }
  }, [filtrosAplicados, atualizacoesFiltros, searchTerm, isBrowser]);

  // 🔥 EFEITO PARA ATUALIZAR TÍTULO QUANDO FILTROS ESPECÍFICOS MUDAM
  useEffect(() => {
    if (isBrowser) {
      // 🔥 DELAY MAIOR PARA EVITAR CONFLITOS
      setTimeout(() => {
        updateClientMetaTags();
        console.log('🎯 [FILTROS MUDARAM] Atualizando título após mudança de filtros...'); 
      }, 300);
    }
  }, [
    filtrosAtuais.cidadeSelecionada,
    filtrosAtuais.categoriaSelecionada, 
    filtrosAtuais.finalidade,
    filtrosAtuais.bairrosSelecionados,
    isBrowser
  ]);

  // Efeito para carregar filtros dos parâmetros da URL
  useEffect(() => {
    if (!isBrowser) return;
    
    // 1. Tentar extrair de URL SEO-friendly primeiro
    const seoParams = extractFromSeoUrl();
    
    // 2. Tentar extrair de query parameters
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
    if (seoParams || cidade || finalidade || categoria || bairros || quartos || precoMin || precoMax) {
      const filtrosStore = useFiltersStore.getState();
      const filtrosParaAplicar = {};
      
      // Priorizar parâmetros SEO-friendly
      if (seoParams) {
        filtrosParaAplicar.cidadeSelecionada = seoParams.cidade.toLowerCase().replace(/ /g, '-');
        filtrosParaAplicar.finalidade = seoParams.finalidade;
        
        // 🎯 MAPEAMENTO CATEGORIA PLURAL → SINGULAR
        const categoriaSingularMap = {
          'apartamentos': 'Apartamento',
          'casas': 'Casa',
          'coberturas': 'Cobertura',
          'terrenos': 'Terreno',
          'flats': 'Flat',
          'gardens': 'Garden',
          'lofts': 'Loft',
          'lojas': 'Loja',
          'sobrados': 'Sobrado'
        };
        
        const categoriaUrl = seoParams.categoria.toLowerCase();
        filtrosParaAplicar.categoriaSelecionada = categoriaSingularMap[categoriaUrl] || 
          seoParams.categoria.charAt(0).toUpperCase() + seoParams.categoria.slice(1);
        
        if (seoParams.bairro) {
          filtrosParaAplicar.bairrosSelecionados = [seoParams.bairro];
        }
      } else {
        // Usar query parameters como fallback
        if (cidade) filtrosParaAplicar.cidadeSelecionada = cidade;
        if (finalidade) filtrosParaAplicar.finalidade = finalidade;
        if (categoria) filtrosParaAplicar.categoriaSelecionada = categoria;
        if (bairros) {
          const bairrosArray = bairros.split(',').map(b => b.trim()).filter(b => b.length > 0);
          filtrosParaAplicar.bairrosSelecionados = bairrosArray;
        }
      }
      
      // Parâmetros adicionais sempre vêm de query string
      if (quartos) filtrosParaAplicar.quartos = parseInt(quartos);
      if (precoMin) filtrosParaAplicar.precoMin = parseFloat(precoMin);
      if (precoMax) filtrosParaAplicar.precoMax = parseFloat(precoMax);
      
      // Aplicar filtros no store
      filtrosStore.setFilters(filtrosParaAplicar);
      filtrosStore.aplicarFiltros();
    }
    
    // Se há query de busca, definir no estado
    if (searchQuery) {
      setSearchTerm(searchQuery);
    }
  }, [isBrowser]);

  // Efeito para atualizar URL quando filtros são aplicados manualmente
  useEffect(() => {
    if (!isBrowser) return;
    
    const filtrosAtuais = useFiltersStore.getState();
    if (filtrosAtuais.filtrosAplicados) {
      setTimeout(() => {
        updateUrlFromFilters();
      }, 50);
    }
  }, [atualizacoesFiltros, isBrowser]);

  // Detectar ambiente de cliente e tamanho da tela
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
      
      // 🎯 ATUALIZAR SEO
      updateStructuredData(favoritos.length, favoritos);
      setTimeout(() => {
        updateClientMetaTags(favoritos.length);
        console.log('🎯 [FAVORITOS] Meta tags atualizadas com quantidade:', favoritos.length);
      }, 200);
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
        updateStructuredData(validPagination.totalItems, response.imoveis || []);
        
        // 🔥 AGUARDAR UM POUCO ANTES DE ATUALIZAR META TAGS PARA GARANTIR QUE PAGINATION ESTEJA SETADO
        setTimeout(() => {
          updateClientMetaTags(validPagination.totalItems);
          console.log('🎯 [BUSCAR] Meta tags atualizadas com quantidade:', validPagination.totalItems);
        }, 200);
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
      
      updateStructuredData(0, []);
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
      
      updateStructuredData(favoritos.length, favoritos);
      setTimeout(() => {
        updateClientMetaTags(favoritos.length);
        console.log('🎯 [TOGGLE-FAVORITOS] Meta tags atualizadas com quantidade:', favoritos.length);
      }, 200);
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
        
        updateStructuredData(response.data.length, response.data);
        setTimeout(() => {
          updateClientMetaTags(response.data.length);
          console.log('🎯 [SEARCH] Meta tags atualizadas com quantidade:', response.data.length);
        }, 200);
      } else {
        setImoveis([]);
        updateStructuredData(0, []);
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setImoveis([]);
      updateStructuredData(0, []);
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
      // 🔥 MAPEAMENTO CONSISTENTE DA FINALIDADE
      let finalidadeTexto = '';
      if (filtrosAtuais.finalidade === 'Comprar' || filtrosAtuais.finalidade === 'venda') {
        finalidadeTexto = 'a venda';
      } else if (filtrosAtuais.finalidade === 'Alugar' || filtrosAtuais.finalidade === 'aluguel') {
        finalidadeTexto = 'para aluguel';
      }
      
      if (finalidadeTexto) {
        texto += ` ${finalidadeTexto}`;
      }
      
      console.log('🎯 [TEXTO-FILTROS] Finalidade:', filtrosAtuais.finalidade, '→', finalidadeTexto);
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
      const cidadeFormatada = filtrosAtuais.cidadeSelecionada
        .replace(/-/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
      texto += ` em ${cidadeFormatada}`;
    }

    // 🔥 ATUALIZAR TÍTULO QUANDO QUANTIDADE MUDAR (COM DELAY PARA EVITAR CONFLITOS)
    if (isBrowser && quantidade >= 0) {
      setTimeout(() => {
        updateClientMetaTags(quantidade);
        console.log('🎯 [QUANTIDADE] Atualizando título com quantidade:', quantidade);
      }, 100);
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
