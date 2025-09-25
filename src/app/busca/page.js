// src/app/busca/page.js
"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

import CardImovel, { CardImovelSkeleton } from "../components/ui/card-imovel";
import Pagination from "../components/ui/pagination";
import { Footer } from "../components/ui/footer";
import PropertyFilters from "./components/property-filters";

import { getImoveis, searchImoveis } from "../services";
import useFiltersStore from "../store/filtrosStore";
import useFavoritosStore from "../store/favoritosStore";
import useImovelStore from "../store/imovelStore";
import { gerarUrlSeoFriendly } from "../utils/url-slugs";

// --- NOVO COMPONENTE GOOGLE MAPS ---
import MapOverlay from "./components/map-overlay.jsx"; 

// Importar o novo componente Google Maps integrado
const IntegratedMapWithNoSSR = dynamic(() => import("./components/integrated-map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black" />
        <p className="mt-2 text-gray-700">Carregando mapa...</p>
      </div>
    </div>
  ),
});

/* =========================================================
   PÁGINA
========================================================= */
export default function BuscaImoveis() {
  const router = useRouter();

  // Dados & Stores
  const [imoveis, setImoveis] = useState([]);
  const [filteredImoveis, setFilteredImoveis] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const filtrosAtuais = useFiltersStore((state) => state);
  const filtrosAplicados = useFiltersStore((state) => state.filtrosAplicados);
  const atualizacoesFiltros = useFiltersStore((state) => state.atualizacoesFiltros);

  const { favoritos, getQuantidadeFavoritos } = useFavoritosStore();
  const quantidadeFavoritos = getQuantidadeFavoritos();

  const adicionarVariosImoveisCache = useImovelStore(
    (state) => state.adicionarVariosImoveisCache
  );

  // UI / paginação
  const [ordenacao, setOrdenacao] = useState("relevancia");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 12,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [mostrandoFavoritos, setMostrandoFavoritos] = useState(false);

  // Mobile overlay states
  const [mapOpenMobile, setMapOpenMobile] = useState(false);
  const [filtersMobileOpen, setFiltersMobileOpen] = useState(false);

  const [isBrowser, setIsBrowser] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Estados para integração com o mapa
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [isMapFilterActive, setIsMapFilterActive] = useState(false);

  const effectiveImoveis = useMemo(() => {
    if (!isMapFilterActive) return imoveis;
    if (!Array.isArray(filteredImoveis) || filteredImoveis.length === 0) return imoveis;
    return filteredImoveis;
  }, [filteredImoveis, imoveis, isMapFilterActive]);

  const effectivePagination = useMemo(() => {
    const itemsPerPage = pagination.itemsPerPage || pagination.limit || 12;
    const basePagination = {
      ...pagination,
      itemsPerPage,
      limit: itemsPerPage,
      currentPage,
    };

    if (!isMapFilterActive) {
      return basePagination;
    }

    const totalItems = Array.isArray(filteredImoveis) ? filteredImoveis.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const safeCurrentPage = Math.min(basePagination.currentPage, totalPages);

    return {
      ...basePagination,
      totalItems,
      totalPages,
      currentPage: safeCurrentPage,
    };
  }, [currentPage, filteredImoveis, isMapFilterActive, pagination]);

  const clearMapSelection = useCallback(() => {
    setFilteredImoveis([]);
    setIsMapFilterActive(false);
    setSelectedCluster(null);
    setSelectedProperty(null);
  }, []);

  const mapPropertiesToImoveis = useCallback(
    (properties) => {
      if (!Array.isArray(properties) || properties.length === 0) return [];

      const ids = new Set();
      properties.forEach((property) => {
        [property?.Codigo, property?._id, property?.id, property?.IdImovel]
          .filter((value) => value !== undefined && value !== null && value !== "")
          .forEach((value) => ids.add(String(value)));
      });

      const matches = imoveis.filter((imovel) =>
        [imovel?.Codigo, imovel?._id, imovel?.id, imovel?.IdImovel]
          .filter((value) => value !== undefined && value !== null && value !== "")
          .some((value) => ids.has(String(value)))
      );

      if (matches.length === 0) {
        return properties.filter((item) =>
          [item?.Codigo, item?._id, item?.id, item?.IdImovel]
            .some((value) => value !== undefined && value !== null && value !== "")
        );
      }

      return matches;
    },
    [imoveis]
  );

  const handlePropertySelect = useCallback(
    (property) => {
      if (!property) {
        clearMapSelection();
        return;
      }

      const normalized = mapPropertiesToImoveis([property]);
      const result = normalized.length > 0 ? normalized : [property];

      setSelectedCluster(null);
      setSelectedProperty(result[0] ?? null);
      setFilteredImoveis(result);
      setIsMapFilterActive(true);
    },
    [clearMapSelection, mapPropertiesToImoveis]
  );

  const handleClusterSelect = useCallback(
    (properties) => {
      if (!Array.isArray(properties) || properties.length === 0) {
        clearMapSelection();
        return;
      }

      const normalized = mapPropertiesToImoveis(properties);
      const result = normalized.length > 0 ? normalized : properties;

      setSelectedProperty(null);
      setSelectedCluster(result);
      setFilteredImoveis(result);
      setIsMapFilterActive(true);
    },
    [clearMapSelection, mapPropertiesToImoveis]
  );

  /* ================= META + STRUCTURED DATA ================= */
  const updateStructuredData = (totalItems = 0, imoveisData = []) => {
    if (typeof document === "undefined") return;
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://npiconsultoria.com.br";
    const currentDate = new Date().toISOString();

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const structuredData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "SearchResultsPage",
          "@id": `${baseUrl}/busca#webpage`,
          url:
            typeof window !== "undefined"
              ? window.location.href
              : `${baseUrl}/busca`,
          name: document.title,
          datePublished: currentDate,
          dateModified: currentDate,
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
                image:
                  imovel.Foto1 || `${baseUrl}/assets/default-property.jpg`,
                offers: {
                  "@type": "Offer",
                  price: imovel.ValorNumerico || 0,
                  priceCurrency: "BRL",
                  availability: "https://schema.org/InStock",
                },
                address: {
                  "@type": "PostalAddress",
                  addressLocality: imovel.Cidade || "São Paulo",
                  addressRegion: "SP",
                  addressCountry: "BR",
                },
              },
            })),
          },
        },
      ],
    };

    script.textContent = JSON.stringify(structuredData);
  };

  const updateClientMetaTags = (quantidadeResultados = null) => {
    if (typeof window === "undefined") return;

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://npiconsultoria.com.br";
    const currentDate = new Date().toISOString();
    const fs = useFiltersStore.getState();

    const plural = {
      Apartamento: "Apartamentos",
      Casa: "Casas",
      "Casa Comercial": "Casas comerciais",
      "Casa em Condominio": "Casas em condomínio",
      Cobertura: "Coberturas",
      Flat: "Flats",
      Garden: "Gardens",
      Loft: "Lofts",
      Loja: "Lojas",
      "Prédio Comercial": "Prédios comerciais",
      "Sala Comercial": "Salas comerciais",
      Sobrado: "Sobrados",
      Terreno: "Terrenos",
    };

    const tParts = [];
    if (fs.categoriaSelecionada)
      tParts.push(plural[fs.categoriaSelecionada] || "Imóveis");
    else tParts.push("Imóveis");
    if (fs.finalidade === "Comprar") tParts.push("a venda");
    else if (fs.finalidade === "Alugar") tParts.push("para aluguel");
    if (fs.cidadeSelecionada) tParts.push(`no ${fs.cidadeSelecionada}`);

    const qtd =
      quantidadeResultados !== null ? quantidadeResultados : pagination.totalItems;
    const title = `${tParts.join(" ")}${qtd ? ` ${qtd} imóveis` : ""}`.trim();
    const description = `Especialistas em ${tParts.join(" ")}. NPi`;

    document.title = title;

    const ensureMeta = (attr, value, isProp = false) => {
      const selector = isProp ? `meta[property="${attr}"]` : `meta[name="${attr}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        if (isProp) tag.setAttribute("property", attr);
        else tag.setAttribute("name", attr);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", value);
    };

    ensureMeta("title", title);
    ensureMeta("description", description);
    ensureMeta("og:title", title, true);
    ensureMeta("og:description", description, true);
    ensureMeta("og:type", "website", true);
    ensureMeta("og:site_name", "NPi Imóveis", true);
    ensureMeta("og:updated_time", currentDate, true);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      document.head.appendChild(canonicalLink);
    }
    const canonicalUrl =
      (window?.location?.origin || baseUrl) +
      (window?.location?.pathname || "") +
      (window?.location?.search || "");
    canonicalLink.setAttribute("href", canonicalUrl);
  };

  /* ======================== URL / SEO HELPERS ======================== */
  const normalizarCidade = (cidade) => {
    if (!cidade) return null;
    const m = {
      guaruja: "Guarujá",
      "guarujá": "Guarujá",
      guaruja_: "Guarujá",
      "sao-paulo": "São Paulo",
      "sao_paulo": "São Paulo",
      "santo-andre": "Santo André",
      santos: "Santos",
      "praia-grande": "Praia Grande",
      bertioga: "Bertioga",
      mongagua: "Mongaguá",
      "mongaguá": "Mongaguá",
      ubatuba: "Ubatuba",
      caraguatatuba: "Caraguatatuba",
      "sao-sebastiao": "São Sebastião",
      ilhabela: "Ilhabela",
    };
    const k = cidade.toLowerCase();
    if (m[k]) return m[k];
    return cidade
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
      .trim();
  };

  const extractFromSeoUrl = () => {
    if (typeof window === "undefined") return null;
    const path = window.location.pathname;
    const m = path.match(/\/buscar?\/([^/]+)\/([^/]+)\/([^/]+)(?:\/([^/]+))?/);
    if (!m) return null;

    const [, finalidade, categoria, cidade, bairro] = m;

    const finalidadeStore =
      finalidade === "aluguel" || finalidade === "alugar" || finalidade === "locacao"
        ? "Alugar"
        : "Comprar";

    const singular = {
      apartamentos: "Apartamento",
      casas: "Casa",
      coberturas: "Cobertura",
      terrenos: "Terreno",
      flats: "Flat",
      gardens: "Garden",
      lofts: "Loft",
      lojas: "Loja",
      sobrados: "Sobrado",
    };
    const categoriaStore =
      singular[categoria.toLowerCase()] ||
      categoria.charAt(0).toUpperCase() + categoria.slice(1);

    return {
      finalidade: finalidadeStore,
      categoria: categoriaStore,
      cidade: normalizarCidade(cidade),
      bairro: bairro ? normalizarCidade(bairro) : null,
    };
  };

  const updateUrlFromFilters = () => {
    const s = useFiltersStore.getState();
    if (s.cidadeSelecionada && s.finalidade && s.categoriaSelecionada) {
      const url = gerarUrlSeoFriendly(s);
      router.replace(url);
    } else {
      const params = new URLSearchParams();
      if (s.cidadeSelecionada) params.set("cidade", s.cidadeSelecionada);
      if (s.finalidade) params.set("finalidade", s.finalidade);
      if (s.categoriaSelecionada) params.set("categoria", s.categoriaSelecionada);
      if (s.bairrosSelecionados?.length)
        params.set("bairros", s.bairrosSelecionados.join(","));
      if (s.quartos) params.set("quartos", s.quartos);
      if (s.precoMin) params.set("precoMin", s.precoMin);
      if (s.precoMax) params.set("precoMax", s.precoMax);

      router.replace(params.toString() ? `/busca?${params.toString()}` : "/busca");
    }
  };

  /* ======================== BUSCA ======================== */

  const buildPriceParams = (isRent, min, max) => {
    const out = {};
    const hasMin = min !== null && min !== undefined && min !== "" && Number(min) > 0;
    const hasMax = max !== null && max !== undefined && max !== "" && Number(max) > 0;

    if (!hasMin && !hasMax) return out;

    if (isRent) {
      if (hasMin) {
        out.precoAluguelMin = String(min);
        out.valorAluguelMin = String(min);
        out.aluguelMin = String(min);
        out.precoMinimo = String(min);
      }
      if (hasMax) {
        out.precoAluguelMax = String(max);
        out.valorAluguelMax = String(max);
        out.aluguelMax = String(max);
        out.precoMaximo = String(max);
      }
    } else {
      if (hasMin) {
        out.precoMinimo = String(min);
        out.precoMin = String(min);
        out.valorMin = String(min);
      }
      if (hasMax) {
        out.precoMaximo = String(max);
        out.precoMax = String(max);
        out.valorMax = String(max);
      }
    }
    return out;
  };

  const buscarImoveis = async (comFiltros = false) => {
    if (mostrandoFavoritos) return;

    setIsLoading(true);
    try {
      let params = {};
      if (comFiltros) {
        const s = useFiltersStore.getState();
        const isRent = (s.finalidade || "Comprar") === "Alugar";

        params = {
          categoria: s.categoriaSelecionada || undefined,
          cidade: s.cidadeSelecionada || undefined,
          quartos: s.quartos || undefined,
          banheiros: s.banheiros || undefined,
          vagas: s.vagas || undefined,
        };

        if (Array.isArray(s.bairrosSelecionados) && s.bairrosSelecionados.length > 0) {
          params.bairrosArray = s.bairrosSelecionados;
        }

        if (isRent) {
          params.finalidade = "locacao";
          params.status = "locacao";
          params.tipoNegocio = "locacao";
          params.negocio = "locacao";
          params.modalidade = "locacao";
        } else {
          params.finalidade = "venda";
          params.status = "venda";
          params.tipoNegocio = "venda";
        }

        Object.assign(params, buildPriceParams(isRent, s.precoMin, s.precoMax));

        if (s.areaMin && s.areaMin !== "0") params.areaMinima = s.areaMin;
        if (s.areaMax && s.areaMax !== "0") params.areaMaxima = s.areaMax;

        if (s.abaixoMercado) params.apenasCondominios = true;
        if (s.proximoMetro) params.proximoMetro = true;
      }

      const response = await getImoveis(params, currentPage, 12);

      clearMapSelection();

      if (response && Array.isArray(response.imoveis)) {
        setImoveis(response.imoveis);
        setFilteredImoveis(response.imoveis);
        if (response.imoveis.length > 0) {
          adicionarVariosImoveisCache(response.imoveis);
        }
      } else {
        setImoveis([]);
        setFilteredImoveis([]);
      }

      if (response && response.pagination) {
        const validPagination = {
          totalItems:
            Number(response.pagination.totalItems) ||
            (Array.isArray(response.imoveis) ? response.imoveis.length : 0),
          totalPages: Number(response.pagination.totalPages) || 1,
          currentPage: Number(response.pagination.currentPage) || 1,
          itemsPerPage: Number(response.pagination.itemsPerPage) || 12,
          limit: Number(response.pagination.itemsPerPage) || 12,
        };
        setPagination(validPagination);
        updateStructuredData(validPagination.totalItems, response.imoveis || []);
        setTimeout(() => updateClientMetaTags(validPagination.totalItems), 50);
      } else {
        const totalLocal = Array.isArray(response?.imoveis)
          ? response.imoveis.length
          : 0;
        setPagination((prev) => ({
          ...prev,
          totalItems: totalLocal,
          totalPages: Math.max(1, Math.ceil(totalLocal / 12)),
        }));
        updateStructuredData(totalLocal, response?.imoveis || []);
        setTimeout(() => updateClientMetaTags(totalLocal), 50);
      }
    } catch {
      clearMapSelection();
      setImoveis([]);
      setFilteredImoveis([]);
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

  /* ======================== INITIAL LOAD ======================== */
  useEffect(() => {
    if (!initialLoad) return;
    setIsBrowser(true);

    const seoParams = extractFromSeoUrl();

    const searchParams =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    const cidade = searchParams.get("cidade");
    const finalidade = searchParams.get("finalidade");
    const categoria = searchParams.get("categoria");
    const bairros = searchParams.get("bairros");
    const quartos = searchParams.get("quartos");
    const precoMin = searchParams.get("precoMin");
    const precoMax = searchParams.get("precoMax");
    const searchQuery = searchParams.get("q");

    if (
      seoParams ||
      cidade ||
      finalidade ||
      categoria ||
      bairros ||
      quartos ||
      precoMin ||
      precoMax
    ) {
      const filtrosParaAplicar = {};
      if (seoParams) {
        filtrosParaAplicar.cidadeSelecionada = seoParams.cidade;
        filtrosParaAplicar.finalidade = seoParams.finalidade;
        filtrosParaAplicar.categoriaSelecionada = seoParams.categoria;
        if (seoParams.bairro) filtrosParaAplicar.bairrosSelecionados = [seoParams.bairro];
      } else {
        if (cidade) filtrosParaAplicar.cidadeSelecionada = normalizarCidade(cidade);
        if (finalidade) filtrosParaAplicar.finalidade = finalidade;
        if (categoria) filtrosParaAplicar.categoriaSelecionada = categoria;
        if (bairros) {
          const arr = bairros.split(",").map((b) => b.trim()).filter(Boolean);
          filtrosParaAplicar.bairrosSelecionados = arr;
        }
      }
      if (quartos) filtrosParaAplicar.quartos = parseInt(quartos);
      if (precoMin) filtrosParaAplicar.precoMin = parseFloat(precoMin);
      if (precoMax) filtrosParaAplicar.precoMax = parseFloat(precoMax);

      const store = useFiltersStore.getState();
      store.limparFiltros();
      setTimeout(() => {
        store.setFilters(filtrosParaAplicar);
        store.aplicarFiltros();
        setTimeout(() => {
          buscarImoveis(true);
          setInitialLoad(false);
        }, 80);
      }, 50);
    } else if (searchQuery) {
      setSearchTerm(searchQuery);
      setTimeout(() => {
        handleSearch(searchQuery);
        setInitialLoad(false);
      }, 60);
    } else {
      setTimeout(() => {
        buscarImoveis(false);
        setInitialLoad(false);
      }, 60);
    }

    setTimeout(() => updateClientMetaTags(), 300);
  }, [initialLoad]);

  useEffect(() => {
    if (initialLoad || !filtrosAplicados) return;
    buscarImoveis(true);
  }, [filtrosAplicados, atualizacoesFiltros, initialLoad]);

  useEffect(() => {
    if (initialLoad || currentPage === 1 || isMapFilterActive) return;
    if (mostrandoFavoritos) {
      // Handle favorites pagination if needed
    } else if (filtrosAplicados) {
      buscarImoveis(true);
    } else {
      buscarImoveis(false);
    }
  }, [currentPage, initialLoad, isMapFilterActive]);

  useEffect(() => {
    if (!isBrowser || initialLoad) return;
    const s = useFiltersStore.getState();
    if (s.filtrosAplicados) setTimeout(updateUrlFromFilters, 80);
  }, [atualizacoesFiltros, isBrowser, initialLoad]);

  useEffect(() => {
    if (isBrowser && !isLoading && pagination.totalItems >= 0) {
      setTimeout(() => updateClientMetaTags(pagination.totalItems), 80);
    }
  }, [isBrowser, isLoading, pagination.totalItems]);

  useEffect(() => {
    if (mapOpenMobile) {
      const prev = document.body.style.overflow;
      document.body.dataset.prevOverflow = prev || "";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = document.body.dataset.prevOverflow || "";
      };
    }
  }, [mapOpenMobile]);

  const handlePageChange = (newPage) => {
    const clampedPage = isMapFilterActive
      ? Math.max(1, Math.min(newPage, effectivePagination.totalPages || 1))
      : newPage;

    setCurrentPage(clampedPage);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSearch = async (term) => {
    useFiltersStore.getState().limparFiltros();
    clearMapSelection();

    if (!term || term.trim() === "") {
      buscarImoveis(false);
      return;
    }

  setIsLoading(true);
  clearMapSelection();
    try {
      const response = await searchImoveis(term);
      if (response && response.data) {
        clearMapSelection();
        setImoveis(response.data);
        setFilteredImoveis(response.data);
        const p = {
          totalItems: response.data.length,
          totalPages: Math.ceil(response.data.length / 12),
          currentPage: 1,
          itemsPerPage: 12,
          limit: 12,
        };
        setPagination(p);
        if (Array.isArray(response.data) && response.data.length > 0) {
          adicionarVariosImoveisCache(response.data);
        }
        updateStructuredData(response.data.length, response.data);
        setTimeout(() => updateClientMetaTags(response.data.length), 50);
      } else {
        clearMapSelection();
        setImoveis([]);
        setFilteredImoveis([]);
        updateStructuredData(0, []);
      }
    } catch {
      clearMapSelection();
      setImoveis([]);
      setFilteredImoveis([]);
      updateStructuredData(0, []);
    } finally {
      setIsLoading(false);
    }
  };

  const resetarEstadoBusca = () => {
    setSearchTerm("");
    setCurrentPage(1);
    if (mostrandoFavoritos) setMostrandoFavoritos(false);
    clearMapSelection();
  };

  const renderCards = () => {
    if (isLoading) {
      return Array(12)
        .fill(null)
        .map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="w-full sm:w-1/2 xl:w-[32%] min-w-0 flex-shrink-0"
          >
            <CardImovelSkeleton />
          </div>
        ));
    }

    if (Array.isArray(effectiveImoveis) && effectiveImoveis.length > 0) {
      let arr = [...effectiveImoveis];

      if (ordenacao === "maior_valor") {
        arr.sort((a, b) => {
          const va = a.ValorAntigo ? parseFloat(String(a.ValorAntigo).replace(/\D/g, "")) : 0;
          const vb = b.ValorAntigo ? parseFloat(String(b.ValorAntigo).replace(/\D/g, "")) : 0;
          return vb - va;
        });
      } else if (ordenacao === "menor_valor") {
        arr.sort((a, b) => {
          const va = a.ValorAntigo ? parseFloat(String(a.ValorAntigo).replace(/\D/g, "")) : 0;
          const vb = b.ValorAntigo ? parseFloat(String(b.ValorAntigo).replace(/\D/g, "")) : 0;
          return va - vb;
        });
      }

      if (isMapFilterActive) {
        const startIndex = (effectivePagination.currentPage - 1) * effectivePagination.itemsPerPage;
        const endIndex = startIndex + effectivePagination.itemsPerPage;
        arr = arr.slice(startIndex, endIndex);
      }

      return arr.map((imovel) => {
        const key =
          imovel.Codigo || `imovel-${imovel._id || Math.random().toString(36).slice(2)}`;
        
        // Destacar o card se a propriedade está selecionada
        const isSelected = selectedProperty && 
          (selectedProperty.Codigo === imovel.Codigo || selectedProperty._id === imovel._id);
        
        return (
          <div 
            key={key} 
            className={`w-full sm:w-1/2 xl:w-[32%] min-w-0 flex-shrink-0 transition-all duration-200 ${
              isSelected ? 'ring-2 ring-blue-500 ring-opacity-50 scale-[1.02]' : ''
            }`}
          >
            <CardImovel {...imovel} target="_blank" />
          </div>
        );
      });
    }

    return <p className="text-center w-full py-8">Nenhum imóvel encontrado.</p>;
  };

  const construirTextoFiltros = () => {
    const s = useFiltersStore.getState();
    const qtd = effectivePagination.totalItems || 0;

    const plural = {
      Apartamento: "apartamentos",
      Casa: "casas",
      "Casa Comercial": "casas comerciais",
      "Casa em Condominio": "casas em condomínio",
      Cobertura: "coberturas",
      Flat: "flats",
      Garden: "gardens",
      Loft: "lofts",
      Loja: "lojas",
      "Prédio Comercial": "prédios comerciais",
      "Sala Comercial": "salas comerciais",
      Sobrado: "sobrados",
      Terreno: "terrenos",
    };

    let txt = `${qtd}`;
    if (s.categoriaSelecionada) {
      txt += ` ${plural[s.categoriaSelecionada] || "imóveis"}`;
    } else {
      txt += " imóveis";
    }

    if (s.finalidade) {
      txt += ` ${s.finalidade === "Comprar" ? "a venda" : "para aluguel"}`;
    }

    if (s.bairrosSelecionados?.length) {
      if (s.bairrosSelecionados.length === 1) {
        txt += ` em ${s.bairrosSelecionados[0]}`;
      } else if (s.bairrosSelecionados.length <= 3) {
        txt += ` em ${s.bairrosSelecionados.join(", ")}`;
      } else {
        txt += ` em ${s.bairrosSelecionados.slice(0, 2).join(", ")} e mais ${
          s.bairrosSelecionados.length - 2
        } bairros`;
      }
    } else if (s.cidadeSelecionada) {
      const c = s.cidadeSelecionada.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      txt += ` em ${c}`;
    }

    return txt;
  };

  // Componente interno para evitar problemas de importação
  function MobileActionsBar({ onOpenFilters, onOpenMap, resultsText = "" }) {
    return (
      <div className="sticky top-20 z-[45] bg-white border-b shadow-sm md:hidden">
        <div className="px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-zinc-600 font-semibold truncate">
            {resultsText}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenFilters}
              className="px-3 py-2 rounded-lg text-[12px] font-semibold bg-zinc-200 hover:bg-zinc-300 text-black"
            >
              Filtros
            </button>
            <button
              onClick={onOpenMap}
              className="px-3 py-2 rounded-lg text-[12px] font-semibold bg-black hover:bg-zinc-900 text-white"
            >
              Mapa
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ======================== RENDER ======================== */
  return (
    <>
      {/* DESKTOP (>= md): filtros horizontais fixos */}
      <div className="fixed top-20 left-0 w-full bg-white z-40 shadow-sm border-b px-4 md:px-10 hidden md:block overflow-x-auto">
        <PropertyFilters
          horizontal
          onFilter={resetarEstadoBusca}
          isVisible
          setIsVisible={() => {}}
          onMapSelectionClear={clearMapSelection}
        />
      </div>

      {/* DESKTOP (>= md): layout 50/50 */}
      <div className="hidden md:flex fixed top-28 left-0 w-full h-[calc(100vh-7rem)] overflow-hidden bg-zinc-100">
        {/* Cards */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <div className="flex justify-between items-center gap-2 p-4 border-b border-gray-200 bg-white">
            <div className="flex flex-col">
              <h2 className="text-xs font-bold text-zinc-500">
                {construirTextoFiltros()}
              </h2>
              {isMapFilterActive && (
                <div className="flex items-center justify-between text-xs text-blue-600 mt-1 bg-blue-50 px-2 py-1 rounded">
                  <span>
                    {(() => {
                      const count = filteredImoveis?.length ?? 0;
                      const suffix = count === 1 ? "" : "is";
                      const selectionText =
                        selectedCluster && count !== 1
                          ? " do cluster selecionado"
                          : " selecionado no mapa";

                      return `📍 Mostrando ${count} imóvel${suffix}${selectionText}`;
                    })()}
                  </span>
                  <button
                    onClick={clearMapSelection}
                    className="ml-2 text-red-500 hover:text-red-700 font-bold"
                  >
                    ✕ Mostrar todos
                  </button>
                </div>
              )}
            </div>
            <select
              className="text-xs font-bold text-zinc-500 bg-zinc-100 p-2 rounded-md"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
            >
              <option value="relevancia">Mais relevantes</option>
              <option value="maior_valor">Maior Valor</option>
              <option value="menor_valor">Menor Valor</option>
            </select>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex flex-wrap gap-3">{renderCards()}</div>
            <div className="mt-6 mb-6">
              <Pagination
                pagination={effectivePagination}
                onPageChange={handlePageChange}
              />
            </div>
            <div className="mt-12">
              <Footer />
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="w-1/2 relative h-full">
          <div className="absolute inset-0 right-0 h-full overflow-hidden">
            <IntegratedMapWithNoSSR
              filtros={filtrosAtuais}
              onPropertySelect={handlePropertySelect}
              onClusterSelect={handleClusterSelect}
              selectedCluster={selectedCluster}
              selectedProperty={selectedProperty}
              onClearSelection={clearMapSelection}
            />
          </div>
        </div>
      </div>

      {/* MOBILE (< md): barra ações + filtros off-canvas + lista */}
      <div className="md:hidden flex flex-col h-[100dvh] overflow-hidden bg-zinc-50">
        <MobileActionsBar
          onOpenFilters={() => setFiltersMobileOpen(true)}
          onOpenMap={() => setMapOpenMobile(true)}
          resultsText={construirTextoFiltros()}
        />

        <div className="flex flex-col flex-1 min-h-0">
          <PropertyFilters
            horizontal={false}
            onFilter={resetarEstadoBusca}
            isVisible={filtersMobileOpen}
            setIsVisible={setFiltersMobileOpen}
            onMapSelectionClear={clearMapSelection}
          />

          <div className="pt-2 pb-24 px-3 flex-1 overflow-y-auto min-h-0">
          <div className="flex items-center justify-between gap-2 p-2 rounded-md bg-white border">
            <span className="text-[11px] text-zinc-600 font-semibold">
              {effectivePagination.totalItems || 0} resultados
            </span>
            <select
              className="text-[12px] font-semibold text-zinc-600 bg-zinc-100 p-2 rounded-md"
              value={ordenacao}
              onChange={(e) => setOrdenacao(e.target.value)}
            >
              <option value="relevancia">Mais relevantes</option>
              <option value="maior_valor">Maior Valor</option>
              <option value="menor_valor">Menor Valor</option>
            </select>
          </div>

            <div className="mt-3 flex flex-col gap-6 pb-10">
              <div className="flex flex-wrap gap-3">{renderCards()}</div>

              <Pagination
                pagination={effectivePagination}
                onPageChange={handlePageChange}
              />

              <Footer />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE: overlay do mapa */}
      <MapOverlay
        open={mapOpenMobile}
        onClose={() => setMapOpenMobile(false)}
        filtros={filtrosAtuais}
        onPropertySelect={handlePropertySelect}
        onClusterSelect={handleClusterSelect}
        selectedCluster={selectedCluster}
        selectedProperty={selectedProperty}
        onClearSelection={clearMapSelection}
      />
    </>
  );
}
