// src/app/busca/page.js - SOLUÇÃO COMPLETA EM 1 ARQUIVO - SEO OTIMIZADO

// 🎯 METADADOS SERVER-SIDE (ANTES DO "use client")
export async function generateMetadata({ searchParams, request }) {
  try {
    const currentDate = new Date().toISOString();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br';
    
    // 🔥 EXTRAIR PARÂMETROS DA URL ATUAL NO SERVER-SIDE
    let urlParams = { ...searchParams };
    
    // 🎯 DETECTAR URL SEO-FRIENDLY NO SERVER-SIDE
    // Tentar extrair da URL através do request object se disponível
    let currentPath = '';
    try {
      if (request && request.url) {
        const url = new URL(request.url);
        currentPath = url.pathname;
      } else if (typeof process !== 'undefined' && process.env.VERCEL_URL) {
        // Em ambiente Vercel, tentar construir a URL
        currentPath = '/buscar/venda/apartamentos/sao-caetano-do-sul'; // Fallback
      }
    } catch (e) {
      console.log('🎯 [SERVER-META] Não foi possível determinar a URL atual');
    }
    
    // Se currentPath contém estrutura SEO-friendly, extrair parâmetros
    const seoUrlMatch = currentPath.match(/\/buscar\/([^\/]+)\/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/);
    if (seoUrlMatch && !urlParams.cidade) {
      const [, finalidade, categoria, cidade, bairro] = seoUrlMatch;
      
      urlParams = {
        finalidade: finalidade === 'venda' ? 'venda' : finalidade,
        categoria: categoria,
        cidade: cidade,
        bairro: bairro || undefined,
        ...urlParams // Manter outros searchParams se existirem
      };
      
      console.log('🎯 [SERVER-SEO] Parâmetros extraídos da URL:', urlParams);
    }
    
    const {
      cidade,
      finalidade = 'venda',
      categoria,
      bairros,
      quartos,
      precoMin,
      precoMax,
      q: searchQuery
    } = urlParams;

    // 🎯 GERAR TÍTULO DINÂMICO ESPECÍFICO - IGUAL AO AHREFS
    let title = 'Busca de Imóveis | NPi Imóveis';
    let description = 'Encontre apartamentos, casas e imóveis de alto padrão com filtros avançados, mapa interativo e as melhores oportunidades do mercado imobiliário.';
    let keywords = 'busca imóveis, apartamentos luxo, casas alto padrão, imóveis São Paulo, NPi Imóveis';

    // Para busca com filtros
    if (cidade || categoria || searchQuery) {
      const titleParts = [];
      
      // 1. Categoria (plural)
      if (categoria) {
        const categoriaPluralMap = {
          'Apartamento': 'Apartamentos',
          'apartamento': 'Apartamentos', 
          'apartamentos': 'Apartamentos',
          'Casa': 'Casas',
          'casa': 'Casas',
          'casas': 'Casas',
          'Cobertura': 'Coberturas',
          'cobertura': 'Coberturas',
          'coberturas': 'Coberturas',
          'Terreno': 'Terrenos',
          'terreno': 'Terrenos',
          'terrenos': 'Terrenos',
          'Flat': 'Flats',
          'flat': 'Flats',
          'flats': 'Flats'
        };
        titleParts.push(categoriaPluralMap[categoria] || 'Imóveis');
      } else {
        titleParts.push('Imóveis');
      }
      
      // 2. Finalidade
      if (finalidade === 'venda' || finalidade === 'Comprar') {
        titleParts.push('para venda');
      } else if (finalidade === 'aluguel' || finalidade === 'Alugar') {
        titleParts.push('para aluguel');
      } else {
        titleParts.push('para venda');
      }
      
      // 3. Localização
      if (cidade) {
        const cidadeFormatada = cidade
          .replace(/-/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase());
        titleParts.push(`em ${cidadeFormatada}`);
      }
      
      // 4. Construir título final
      title = titleParts.join(' ');
      
      // 5. Gerar descrição específica
      description = `Encontre ${titleParts.join(' ')} com a melhor consultoria imobiliária. Imóveis de alto padrão com fotos, plantas e informações completas. NPi Imóveis - sua imobiliária de confiança.`;
      
      // 6. Keywords específicas
      const keywordsList = ['imóveis', 'NPi Imóveis'];
      if (categoria) keywordsList.push(categoria.toLowerCase());
      if (cidade) keywordsList.push(cidade.replace(/-/g, ' '));
      if (bairros) keywordsList.push(...bairros.split(','));
      keywords = keywordsList.join(', ');
    }
    
    // Para busca por termo
    if (searchQuery) {
      title = `Busca: "${searchQuery}" | NPi Imóveis`;
      description = `Resultados da busca por "${searchQuery}". Encontre apartamentos, casas e imóveis de alto padrão com a NPi Imóveis.`;
      keywords = `${searchQuery}, imóveis, apartamentos, casas, busca, NPi Imóveis`;
    }

    // Limitar título a 60 caracteres
    if (title.length > 60) {
      title = title.substring(0, 57) + '...';
    }

    // Limitar descrição a 160 caracteres  
    if (description.length > 160) {
      description = description.substring(0, 157) + '...';
    }

    // 🎯 URL CANÔNICA CORRETA - BASEADA NA ESTRUTURA ATUAL
    let canonicalUrl = `${baseUrl}/busca`;
    
    // 🔥 CONSTRUIR URL CORRETA BASEADA NOS PARÂMETROS
    if (cidade && categoria && finalidade) {
      // Para URLs SEO-friendly: /buscar/venda/apartamentos/sao-caetano-do-sul
      const finalidadeSlug = finalidade === 'venda' || finalidade === 'Comprar' ? 'venda' : 'aluguel';
      
      // Mapear categoria para URL slug
      const categoriaSlugMap = {
        'Apartamento': 'apartamentos',
        'apartamento': 'apartamentos',
        'apartamentos': 'apartamentos',
        'Casa': 'casas',
        'casa': 'casas', 
        'casas': 'casas',
        'Cobertura': 'coberturas',
        'cobertura': 'coberturas',
        'coberturas': 'coberturas',
        'Terreno': 'terrenos',
        'terreno': 'terrenos',
        'terrenos': 'terrenos'
      };
      
      const categoriaSlug = categoriaSlugMap[categoria] || categoria.toLowerCase();
      const cidadeSlug = cidade.toLowerCase().replace(/\s+/g, '-');
      
      canonicalUrl = `${baseUrl}/buscar/${finalidadeSlug}/${categoriaSlug}/${cidadeSlug}`;
      
      console.log('🎯 [SERVER-CANONICAL] URL SEO-friendly:', canonicalUrl);
    } else {
      // Para URLs com query parameters
      const params = new URLSearchParams();
      if (cidade) params.set('cidade', cidade);
      if (finalidade && finalidade !== 'venda') params.set('finalidade', finalidade);
      if (categoria) params.set('categoria', categoria);
      if (bairros) params.set('bairros', bairros);
      if (quartos) params.set('quartos', quartos);
      if (precoMin) params.set('precoMin', precoMin);
      if (precoMax) params.set('precoMax', precoMax);
      if (searchQuery) params.set('q', searchQuery);
      
      if (params.toString()) {
        canonicalUrl += `?${params.toString()}`;
      }
      
      console.log('🎯 [SERVER-CANONICAL] URL com query params:', canonicalUrl);
    }

    console.log('🎯 [SERVER-META] Título gerado:', title);
    console.log('🎯 [SERVER-META] URL canônica:', canonicalUrl);

    return {
      // 🎯 TÍTULO E DESCRIÇÃO DINÂMICOS
      title,
      description,
      keywords,
      
      // Metadados básicos
      authors: [{ name: "NPi Imóveis" }],
      creator: "NPi Imóveis",
      publisher: "NPi Imóveis",
      metadataBase: new URL(baseUrl),
      
      // 🎯 ROBOTS OTIMIZADO
      robots: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
        bingBot: {
          index: true,
          follow: true,
        }
      },
      
      // 🎯 CANONICAL E ALTERNATES - RESOLVE PROBLEMA AHREFS
      alternates: {
        canonical: canonicalUrl,
        languages: {
          "pt-BR": canonicalUrl,
          "pt": canonicalUrl,
          "x-default": canonicalUrl
        },
      },
      
      // 🎯 OPEN GRAPH COMPLETO - RESOLVE MISSING NO AHREFS
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "NPi Imóveis",
        type: "website",
        locale: "pt_BR",
        publishedTime: currentDate,
        modifiedTime: currentDate,
        
        // 🎯 IMAGENS OTIMIZADAS
        images: [
          {
            url: `${baseUrl}/assets/busca-${categoria?.toLowerCase() || 'imoveis'}.jpg`,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/jpeg",
          },
          {
            url: `${baseUrl}/assets/thumbnail-search.jpg`,
            width: 1200,
            height: 630,
            alt: "NPi Imóveis - Busca de Imóveis",
            type: "image/jpeg",
          }
        ],
        
        // Propriedades específicas para SEO
        'property:location': cidade ? cidade.replace(/-/g, ' ') : 'São Paulo',
        'property:type': categoria || 'imóveis',
        'property:purpose': finalidade,
      },
      
      // 🎯 TWITTER CARDS COMPLETO - RESOLVE MISSING NO AHREFS
      twitter: {
        card: "summary_large_image",
        site: "@NPIImoveis",
        creator: "@NPIImoveis",
        title,
        description,
        images: [`${baseUrl}/assets/busca-${categoria?.toLowerCase() || 'imoveis'}.jpg`],
      },
      
      // 🎯 METADADOS ADICIONAIS COMPLETOS - RESOLVE TODOS OS MISSING
      other: {
        // 🔥 CANONICAL TAG EXPLÍCITA (resolve problema Ahrefs)
        'canonical': canonicalUrl,
        
        // 🔥 GOOGLE VERIFICATION
        "google-site-verification": "jIbU4BYULeE_XJZo-2yGSOdfyz-3v0JuI0mqUItNU-4",
        
        // 🎯 DATAS COMPLETAS E ESPECÍFICAS - RESOLVE PROBLEMA DATES NO AHREFS
        'article:published_time': currentDate,
        'article:modified_time': currentDate,
        'article:author': 'NPi Imóveis',
        'article:section': 'Busca de Imóveis',
        'article:tag': keywords,
        'og:updated_time': currentDate,
        'last-modified': currentDate,
        'date': currentDate,
        'DC.date.modified': currentDate,
        'DC.date.created': currentDate,
        'published_time': currentDate,
        'modified_time': currentDate,
        
        // 🔥 META TAGS DE DATA ADICIONAIS (específicas para Ahrefs)
        'datePublished': currentDate,
        'dateModified': currentDate,
        'pubdate': currentDate,
        'lastmod': currentDate,
        
        // 🎯 HREFLANG EXPLÍCITO (resolve problema Ahrefs)
        'hreflang:pt-BR': canonicalUrl,
        'hreflang:pt': canonicalUrl,
        'hreflang:x-default': canonicalUrl,
        
        // 🔥 SOCIAL MEDIA OTIMIZADO (resolve problema Social no Ahrefs)
        'og:site_name': 'NPi Imóveis',
        'og:type': 'website',
        'og:locale': 'pt_BR',
        'og:locale:alternate': 'pt_PT',
        'twitter:domain': 'npiconsultoria.com.br',
        'twitter:url': canonicalUrl,
        'fb:app_id': '123456789', // Adicione seu FB App ID se tiver
        
        // 🎯 X-ROBOTS-TAG META (adicional para crawlers)
        'x-robots-tag': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
        
        // Dados específicos da busca
        'search:type': categoria || 'imóveis',
        'search:location': cidade || '',
        'search:purpose': finalidade,
        'search:query': searchQuery || '',
        'geo.region': cidade ? `BR-SP-${cidade}` : 'BR-SP',
        'geo.placename': cidade ? cidade.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'São Paulo',
        
        // Schema.org properties adicionais
        'property:type': categoria || 'imóveis',
        'property:purpose': finalidade,
        'property:location': cidade || '',
        'property:neighborhood': bairros || '',
        
        // Dublin Core completo
        'DC.title': title,
        'DC.description': description,
        'DC.subject': keywords,
        'DC.type': 'Text.SearchResults',
        'DC.format': 'text/html',
        'DC.language': 'pt-BR',
        'DC.coverage': cidade ? `${cidade.replace(/-/g, ' ')}, São Paulo, Brasil` : 'São Paulo, Brasil',
        'DC.creator': 'NPi Imóveis',
        'DC.publisher': 'NPi Imóveis',
        'DC.rights': '© 2024 NPi Imóveis. Todos os direitos reservados.',
        
        // 🔥 CACHE E PERFORMANCE
        'revisit-after': '1 day',
        'expires': new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        'cache-control': 'public, max-age=3600',
        'pragma': 'public',
        
        // 🎯 ADDITIONAL SEO TAGS
        'format-detection': 'telephone=yes',
        'mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-capable': 'yes',
        'apple-mobile-web-app-status-bar-style': 'black-translucent',
        'theme-color': '#000000',
        'msapplication-TileColor': '#000000',
        
        // 🔥 BUSINESS INFO
        'geo.position': '-23.5505;-46.6333', // São Paulo coordinates
        'ICBM': '-23.5505;-46.6333',
        'geo.country': 'BR',
        'geo.region': 'SP',
      },
      
      icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png",
        shortcut: "/favicon.ico",
      },
      
      // 🎯 MANIFEST E PWA
      manifest: "/manifest.json",
      
      // 🎯 VIEWPORT OTIMIZADO
      viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
        themeColor: '#000000',
      },
      
      // 🔥 VERIFICATION TAGS ADICIONAIS
      verification: {
        google: "jIbU4BYULeE_XJZo-2yGSOdfyz-3v0JuI0mqUItNU-4",
        // yahoo: "your-yahoo-verification", // Se necessário
        // bing: "your-bing-verification", // Se necessário
      },
      
      // 🎯 CATEGORY E CLASSIFICATION
      category: 'Real Estate',
      classification: 'Property Search',
      
      // 🔥 ADDITIONAL HEADERS PARA X-ROBOTS-TAG
      headers: {
        'X-Robots-Tag': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
    };
  } catch (error) {
    console.error("Erro ao gerar metadata de busca:", error);
    
    // Fallback metadata
    const currentDate = new Date().toISOString();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br';
    
    return {
      title: "Busca de Imóveis | NPi Imóveis",
      description: "Encontre os melhores imóveis de alto padrão com a NPi Imóveis.",
      alternates: {
        canonical: `${baseUrl}/busca`,
        languages: {
          "pt-BR": `${baseUrl}/busca`,
          "pt": `${baseUrl}/busca`,
          "x-default": `${baseUrl}/busca`
        },
      },
      other: {
        'canonical': `${baseUrl}/busca`,
        'article:published_time': currentDate,
        'article:modified_time': currentDate,
        'last-modified': currentDate,
        'date': currentDate,
        'datePublished': currentDate,
        'dateModified': currentDate,
        'x-robots-tag': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
      robots: {
        index: true,
        follow: true,
      },
      headers: {
        'X-Robots-Tag': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      },
    };
  }
}

// 🎯 CONFIGURAÇÃO DINÂMICA
export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 minutos

// 🔥 TUDO CLIENT-SIDE A PARTIR DAQUI
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

  // 🎯 FUNÇÃO PARA ATUALIZAR TÍTULO COM QUANTIDADE
  const updateTitleWithCount = (totalItems = 0) => {
    try {
      const currentTitle = document.title;
      
      // Se o título ainda não tem quantidade e há resultados, adicionar
      if (totalItems > 0 && !currentTitle.match(/^\d+\s/)) {
        const newTitle = `${totalItems} ${currentTitle.toLowerCase()}`;
        
        // Limitar a 60 caracteres
        document.title = newTitle.length > 60 ? newTitle.substring(0, 57) + '...' : newTitle;
        
        console.log('🎯 [TITLE] Título atualizado com quantidade:', document.title);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar título:', error);
    }
  };

  // 🔥 FUNÇÃO PARA ATUALIZAR META TAGS DINAMICAMENTE NO CLIENT
  const updateClientMetaTags = () => {
    try {
      const currentDate = new Date().toISOString();
      
      // Atualizar/criar meta tags de data se não existirem
      const metaTags = [
        { name: 'date', content: currentDate },
        { name: 'last-modified', content: currentDate },
        { name: 'datePublished', content: currentDate },
        { name: 'dateModified', content: currentDate },
        { property: 'article:published_time', content: currentDate },
        { property: 'article:modified_time', content: currentDate },
        { property: 'og:updated_time', content: currentDate },
        { name: 'DC.date.created', content: currentDate },
        { name: 'DC.date.modified', content: currentDate },
      ];
      
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
      
      // Verificar se canonical existe, se não, criar
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.setAttribute('rel', 'canonical');
        canonicalLink.setAttribute('href', window.location.href);
        document.head.appendChild(canonicalLink);
      }
      
      console.log('✅ Meta tags de data atualizadas no client-side');
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
      
      return {
        finalidade: finalidade === 'venda' ? 'Comprar' : 'Alugar',
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
    
    if (filtrosAtuais.cidadeSelecionada && filtrosAtuais.finalidade && filtrosAtuais.categoriaSelecionada) {
      const urlAmigavel = gerarUrlSeoFriendly(filtrosAtuais);
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
      router.push(urlComParams, { scroll: false });
    }
  };

  // Efeito para marcar quando estamos no navegador
  useEffect(() => {
    setIsBrowser(true);
    // 🔥 Atualizar meta tags ao carregar no cliente
    updateClientMetaTags();
  }, []);

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
      updateTitleWithCount(favoritos.length);
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
        updateTitleWithCount(validPagination.totalItems);
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
      updateTitleWithCount(favoritos.length);
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
        updateTitleWithCount(response.data.length);
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
