"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import useFiltersStore from "@/app/store/filtrosStore";
import { getImoveisByFilters, getBairrosPorCidade } from "@/app/services";

/* =========================
   Utils
========================= */
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
};

/* =========================
   Reusable Inputs
========================= */
const InputPreco = ({ placeholder, value, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const formatarParaReal = useCallback((valor) => {
    if (!valor) return "";
    try {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } catch {
      return String(valor);
    }
  }, []);

  useEffect(() => {
    if (value == null || value === 0) setInputValue("");
    else if (!isFocused) setInputValue(formatarParaReal(value));
  }, [value, isFocused, formatarParaReal]);

  const handleInputChange = (e) => {
    const novoValor = e.target.value;
    setInputValue(novoValor);
    const limpo = novoValor.replace(/[^\d]/g, "");
    onChange(limpo ? Number(limpo) : null);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value != null) setInputValue(String(value).replace(/[^\d]/g, ""));
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value == null) {
      setInputValue("");
    } else {
      let v = value;
      if (v < 0) v = 0;                // sem piso arbitrário
      if (v > 70000000) v = 70000000;  // teto seguro
      onChange(v);
      setInputValue(formatarParaReal(v));
    }
  };

  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className="w-full rounded-md border border-gray-300 text-[10px] text-gray-800 font-semibold py-2 pl-3 focus:outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  );
};

const InputArea = ({ placeholder, value, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) setInputValue(value ? String(value) : "");
  }, [value, isFocused]);

  const onChangeLocal = (e) => {
    const novoValor = e.target.value;
    if (/^\d*$/.test(novoValor) || novoValor === "") {
      setInputValue(novoValor);
      const numero = novoValor === "" ? 0 : Math.min(parseInt(novoValor, 10) || 0, 999);
      onChange(numero);
    }
  };

  return (
    <div className="relative flex-1">
      <input
        type="text"
        placeholder={placeholder}
        value={isFocused ? inputValue : value ? String(value) : ""}
        onChange={onChangeLocal}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="w-full rounded-md border border-gray-300 text-[10px] text-gray-800 font-semibold py-2 pl-3 focus:outline-none focus:ring-1 focus:ring-black"
      />
      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">m²</span>
    </div>
  );
};

const OptionButton = ({ value, selected, onClick }) => {
  const pillBase =
    "flex items-center justify-center w-16 rounded-lg border px-2 py-1 text-xs transition-colors";
  const variant = selected ? "bg-zinc-200 text-black" : "bg-white text-gray-700 hover:bg-zinc-100";
  return (
    <button type="button" className={`${pillBase} ${variant}`} onClick={() => onClick(value)}>
      {value}
    </button>
  );
};

const OptionGroup = ({ label, options, selectedValue, onChange }) => (
  <div className="mb-4">
    <span className="block text-[10px] font-semibold text-gray-800 mb-2">{label}</span>
    <div className="flex gap-2">
      {options.map((option) => (
        <OptionButton
          key={String(option)}
          value={option}
          selected={selectedValue === option}
          onClick={onChange}
        />
      ))}
    </div>
  </div>
);

const Separator = () => <hr className="my-4 border-gray-200" />;

/* =========================
   Main Component
========================= */
export default function PropertyFilters({
  onFilter,
  isVisible,
  setIsVisible,
  horizontal = false,
}) {
  const isClient = useIsClient();

  // Store
  const setFilters = useFiltersStore((s) => s.setFilters);
  const limparFiltros = useFiltersStore((s) => s.limparFiltros);
  const aplicarFiltros = useFiltersStore((s) => s.aplicarFiltros);

  // Dados dinâmicos
  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [bairros, setBairros] = useState([]);

  // Seleções
  const [finalidade, setFinalidade] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [bairrosSelecionados, setBairrosSelecionados] = useState([]);
  const [quartosSelecionados, setQuartosSelecionados] = useState(null);
  const [banheirosSelecionados, setBanheirosSelecionados] = useState(null);
  const [vagasSelecionadas, setVagasSelecionadas] = useState(null);

  // Numéricos
  const [precoMin, setPrecoMin] = useState(null);
  const [precoMax, setPrecoMax] = useState(null);
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(0);

  // Flags
  const [abaixoMercado, setAbaixoMercado] = useState(false);
  const [proximoMetro, setProximoMetro] = useState(false);

  // Bairros UI
  const [bairroFilter, setBairroFilter] = useState("");
  const [bairrosExpanded, setBairrosExpanded] = useState(false);
  const bairrosRef = useRef(null);

  // Dropdowns desktop
  const [finalidadeExpanded, setFinalidadeExpanded] = useState(false);
  const [tipoExpanded, setTipoExpanded] = useState(false);
  const [cidadeExpanded, setCidadeExpanded] = useState(false);
  const [quartosExpanded, setQuartosExpanded] = useState(false);
  const [vagasExpanded, setVagasExpanded] = useState(false);
  const finalidadeRef = useRef(null);
  const tipoRef = useRef(null);
  const cidadeRef = useRef(null);
  const quartosRef = useRef(null);
  const vagasRef = useRef(null);

  // Altura do header fixo da página
  const [headerOffset, setHeaderOffset] = useState(0);

  /* ====== Data fetch ====== */
  useEffect(() => {
    (async () => {
      try {
        const cat = await getImoveisByFilters("Categoria");
        const categoriasList = cat?.data || [];
        setCategorias(categoriasList);

        const cid = await getImoveisByFilters("Cidade");
        const cidadesList = cid?.data || [];
        setCidades(cidadesList);

        setFilters({ categorias: categoriasList, cidades: cidadesList, bairros: [] });
      } catch (e) {
        console.error("Erro ao buscar filtros:", e);
      }
    })();
  }, [setFilters]);

  useEffect(() => {
    (async () => {
      if (!cidadeSelecionada) {
        setBairros([]);
        setFilters({ bairros: [] });
        return;
      }
      try {
        const res = await getBairrosPorCidade(cidadeSelecionada, categoriaSelecionada);
        const bairrosList = res?.data || [];
        setBairros(bairrosList);
        setFilters({ bairros: bairrosList });
      } catch (e) {
        console.error("Erro ao buscar bairros:", e);
        setBairros([]);
      }
    })();
  }, [cidadeSelecionada, categoriaSelecionada, setFilters]);

  // Hidratar estados do store
  useEffect(() => {
    const s = useFiltersStore.getState();
    if (s.finalidade) setFinalidade(s.finalidade);
    if (s.categoriaSelecionada) setCategoriaSelecionada(s.categoriaSelecionada);
    if (s.cidadeSelecionada) setCidadeSelecionada(s.cidadeSelecionada);
    if (s.bairrosSelecionados?.length) setBairrosSelecionados(s.bairrosSelecionados);
    if (s.quartos) setQuartosSelecionados(s.quartos);
    if (s.banheiros) setBanheirosSelecionados(s.banheiros);
    if (s.vagas) setVagasSelecionadas(s.vagas);

    const asNum = (v) => (typeof v === "string" && v != null ? parseInt(v, 10) : v);
    if (s.precoMin !== undefined) setPrecoMin(asNum(s.precoMin));
    if (s.precoMax !== undefined) setPrecoMax(asNum(s.precoMax));
    if (s.areaMin) setAreaMin(asNum(s.areaMin) || 0);
    if (s.areaMax) setAreaMax(asNum(s.areaMax) || 0);
    if (s.abaixoMercado) setAbaixoMercado(s.abaixoMercado);
    if (s.proximoMetro) setProximoMetro(s.proximoMetro);
  }, []);

  /* ====== Outside click ====== */
  useEffect(() => {
    let registered = false;
    let timer = null;
    const handleOutside = (event) => {
      const target = event.target;
      if (bairrosRef.current && !bairrosRef.current.contains(target)) setBairrosExpanded(false);
      if (finalidadeRef.current && !finalidadeRef.current.contains(target)) setFinalidadeExpanded(false);
      if (tipoRef.current && !tipoRef.current.contains(target)) setTipoExpanded(false);
      if (cidadeRef.current && !cidadeRef.current.contains(target)) setCidadeExpanded(false);
      if (quartosRef.current && !quartosRef.current.contains(target)) setQuartosExpanded(false);
      if (vagasRef.current && !vagasRef.current.contains(target)) setVagasExpanded(false);
    };

    if (bairrosExpanded || finalidadeExpanded || tipoExpanded || cidadeExpanded || quartosExpanded || vagasExpanded) {
      timer = setTimeout(() => {
        document.addEventListener("pointerdown", handleOutside, { passive: true });
        registered = true;
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (registered) document.removeEventListener("pointerdown", handleOutside);
    };
  }, [bairrosExpanded, finalidadeExpanded, tipoExpanded, cidadeExpanded, quartosExpanded, vagasExpanded]);

  /* ====== BLOQUEIO DE SCROLL (MOBILE) ====== */
  useEffect(() => {
    if (!isClient) return;
    const isMobileViewport = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    if (!isMobileViewport) return;

    const root = document.documentElement;
    const body = document.body;

    const prev = {
      rootOverflowX: root.style.overflowX,
      bodyOverflowX: body.style.overflowX,
      rootTouch: root.style.touchAction,
      bodyTouch: body.style.touchAction,
      rootOBX: root.style.overscrollBehaviorX,
      bodyOBX: body.style.overscrollBehaviorX,
    };

    root.style.overflowX = "hidden";
    body.style.overflowX = "hidden";
    root.style.touchAction = "pan-y";
    body.style.touchAction = "pan-y";
    root.style.overscrollBehaviorX = "none";
    body.style.overscrollBehaviorX = "none";

    return () => {
      root.style.overflowX = prev.rootOverflowX;
      body.style.overflowX = prev.bodyOverflowX;
      root.style.touchAction = prev.rootTouch;
      body.style.touchAction = prev.bodyTouch;
      root.style.overscrollBehaviorX = prev.rootOBX;
      body.style.overscrollBehaviorX = prev.bodyOBX;
    };
  }, [isClient]);

  // Lock do body quando overlay aberto
  useEffect(() => {
    if (!isClient || !isVisible) return;
    const isMobileViewport =
      typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    if (!isMobileViewport) return;

    const scrollY = window.scrollY || window.pageYOffset || 0;

    const prev = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      document.body.style.overflow = prev.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isClient, isVisible]);

  // Medir header fixo externo
  useEffect(() => {
    if (!isClient || !isVisible) return;
    const selectors = [".fixed.top-20", "[data-app-header]", "header[role='banner']", ".site-header"];
    let foundRect = null;
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const r = el.getBoundingClientRect();
        if (r && r.bottom >= 0) {
          foundRect = r;
          break;
        }
      }
    }
    setHeaderOffset(foundRect ? Math.ceil(foundRect.bottom) : 0);
  }, [isClient, isVisible]);

  /* ====== Helpers ====== */
  const bairrosFiltrados = bairros.filter((b) =>
    b.toLowerCase().includes(bairroFilter.toLowerCase())
  );

  const handleCategoriaChange = (e) => setCategoriaSelecionada(e.target.value);

  const handleCidadeChange = (e) => {
    setCidadeSelecionada(e.target.value);
    setBairrosSelecionados([]);
    setBairroFilter("");
  };

  const handleBairroChange = (bairro) => {
    setBairrosSelecionados((prev) =>
      prev.includes(bairro) ? prev.filter((x) => x !== bairro) : [...prev, bairro]
    );
  };

  const handlePrecoChange = (value, setter) => setter(value);
  const handleAreaChange = (value, setter) => setter(Math.min(value || 0, 999));

  const handleFinalidadeChange = (e) => {
    const v = e.target.value === "comprar" ? "Comprar" : e.target.value === "alugar" ? "Alugar" : "";
    setFinalidade(v);
    // zera preços ao trocar finalidade (evita herdar filtros da outra modalidade)
    setPrecoMin(null);
    setPrecoMax(null);
  };

  const fecharMobile = () => setIsVisible?.(false);

  const handleAplicarFiltros = () => {
    const filtrosBasicosPreenchidos = !!(categoriaSelecionada && cidadeSelecionada && finalidade);

    const precoMinFinal = precoMin && precoMin > 0 ? precoMin : null;
    const precoMaxFinal = precoMax && precoMax > 0 ? precoMax : null;

    const areaMinFinal = Math.min(areaMin || 0, 999);
    const areaMaxFinal = Math.min(areaMax || 0, 999);

    const bairrosProcessados = [];
    bairrosSelecionados.forEach((b) => {
      if (typeof b === "string" && b.includes(",")) {
        b.split(",").map((p) => p.trim()).filter(Boolean).forEach((p) => bairrosProcessados.push(p));
      } else bairrosProcessados.push(b);
    });

    // 🔧 CHAVE: manter sempre precoMin/precoMax (mesma API para venda e aluguel)
    setFilters({
      finalidade,
      categoriaSelecionada,
      cidadeSelecionada,
      bairrosSelecionados: bairrosProcessados,
      quartos: quartosSelecionados,
      banheiros: banheirosSelecionados,
      vagas: vagasSelecionadas,

      precoMin: precoMinFinal != null ? String(precoMinFinal) : null,
      precoMax: precoMaxFinal != null ? String(precoMaxFinal) : null,
      precoMinimo: precoMinFinal != null ? String(precoMinFinal) : null,
      precoMaximo: precoMaxFinal != null ? String(precoMaxFinal) : null,

      areaMin: areaMinFinal ? String(areaMinFinal) : "0",
      areaMax: areaMaxFinal ? String(areaMaxFinal) : "0",
      areaMinima: areaMinFinal > 0 ? String(areaMinFinal) : null,
      areaMaxima: areaMaxFinal > 0 ? String(areaMaxFinal) : null,

      abaixoMercado,
      proximoMetro,
      filtrosBasicosPreenchidos,
    });

    aplicarFiltros();
    onFilter?.();
    fecharMobile();
  };

  const handleLimparFiltros = () => {
    limparFiltros();
    setFinalidade("");
    setCategoriaSelecionada("");
    setCidadeSelecionada("");
    setBairrosSelecionados([]);
    setQuartosSelecionados(null);
    setBanheirosSelecionados(null);
    setVagasSelecionadas(null);
    setPrecoMin(null);
    setPrecoMax(null);
    setAreaMin(0);
    setAreaMax(0);
    setAbaixoMercado(false);
    setProximoMetro(false);
    setBairroFilter("");
    onFilter?.();
  };

  /* =========================
     Desktop (horizontal) – render fixo
  ========================= */
  const computeDropdownStyle = (ref, width = 160) => {
    if (!ref.current) return {};
    const rect = ref.current.getBoundingClientRect();
    const left =
      typeof window === "undefined"
        ? rect.left
        : Math.min(rect.left, Math.max(8, window.innerWidth - width - 8));
    const top = rect.bottom + 4;
    return { top, left, width };
  };

  const DesktopBar = (
    <div className={`bg-white py-4 w-full border-b ${horizontal ? "" : "hidden"}`}>
      <div className="max-w-full mx-auto px-2">
        <div className="flex items-center">
          <div
            className="flex items-end gap-2 overflow-x-auto scrollbar-hide flex-1"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {/* Finalidade */}
            <div className="flex flex-col relative hidden md:block" ref={finalidadeRef}>
              <label className="text-[10px] font-medium text-gray-600 mb-1">Finalidade</label>
              <button
                type="button"
                onClick={() => setFinalidadeExpanded((v) => !v)}
                className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[92px] flex-shrink-0 text-left"
              >
                {finalidade || "Selecionar"}
              </button>
              <div
                className={`fixed z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg ${!finalidadeExpanded ? "hidden" : ""}`}
                style={{ ...computeDropdownStyle(finalidadeRef, 140) }}
              >
                {["", "Comprar", "Alugar"].map((op) => (
                  <div
                    key={op || "selecionar"}
                    className="px-2 py-2 hover:bg-gray-50 cursor-pointer text-[11px]"
                    onClick={() => {
                      setFinalidade(op);
                      setPrecoMin(null);
                      setPrecoMax(null);
                      setFinalidadeExpanded(false);
                    }}
                  >
                    {op || "Selecionar"}
                  </div>
                ))}
              </div>
            </div>

            {/* Tipo */}
            <div className="flex flex-col relative hidden md:block" ref={tipoRef}>
              <label className="text-[10px] font-medium text-gray-600 mb-1">Tipo</label>
              <button
                type="button"
                onClick={() => setTipoExpanded((v) => !v)}
                className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[114px] flex-shrink-0 text-left"
              >
                {categoriaSelecionada || "Todos"}
              </button>
              <div
                className={`fixed z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto ${!tipoExpanded ? "hidden" : ""}`}
                style={{ ...computeDropdownStyle(tipoRef, 180) }}
              >
                {["", ...categorias].map((c) => (
                  <div
                    key={c || "todos"}
                    className="px-2 py-2 hover:bg-gray-50 cursor-pointer text-[11px]"
                    onClick={() => {
                      setCategoriaSelecionada(c);
                      setTipoExpanded(false);
                    }}
                  >
                    {c || "Todos"}
                  </div>
                ))}
              </div>
            </div>

            {/* Cidade */}
            <div className="flex flex-col relative hidden md:block" ref={cidadeRef}>
              <label className="text-[10px] font-medium text-gray-600 mb-1">Cidade</label>
              <button
                type="button"
                onClick={() => setCidadeExpanded((v) => !v)}
                className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[114px] flex-shrink-0 text-left"
              >
                {cidadeSelecionada || "Todas"}
              </button>
              <div
                className={`fixed z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto ${!cidadeExpanded ? "hidden" : ""}`}
                style={{ ...computeDropdownStyle(cidadeRef, 180) }}
              >
                {["", ...cidades].map((c) => (
                  <div
                    key={c || "todas"}
                    className="px-2 py-2 hover:bg-gray-50 cursor-pointer text-[11px]"
                    onClick={() => {
                      setCidadeSelecionada(c);
                      setCidadeExpanded(false);
                      setBairrosSelecionados([]);
                      setBairroFilter("");
                    }}
                  >
                    {c || "Todas"}
                  </div>
                ))}
              </div>
            </div>

            {/* Ações (desktop) */}
            <div className="hidden md:flex gap-2 items-end ml-2">
              <button
                onClick={handleAplicarFiltros}
                className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 focus:outline-none whitespace-nowrap flex-shrink-0 border border-black"
              >
                Aplicar
              </button>
              <button
                onClick={handleLimparFiltros}
                className="px-4 py-2 text-sm bg-gray-100 text-black hover:bg-gray-200 focus:outline-none whitespace-nowrap flex-shrink-0 border border-gray-300"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  /* =========================
     Mobile / padrão (off-canvas)
  ========================= */
  return (
    <>
      {/* Desktop bar (oculta em mobile) */}
      <div className="hidden md:block">{DesktopBar}</div>

      {/* Backdrop */}
      {isVisible && (
        <div
          className="fixed inset-0 bg-black/60 z-[9998] md:hidden"
          onClick={() => setIsVisible?.(false)}
          aria-hidden="true"
        />
      )}

      {/* Off-canvas */}
      <div
        className={[
          "md:hidden fixed inset-x-0 bottom-0 z-[9999] max-h-[85vh] bg-white text-black rounded-t-2xl shadow-sm transition-transform duration-300",
          isVisible ? "translate-y-0" : "translate-y-full",
        ].join(" ")}
        style={{ WebkitOverflowScrolling: "touch" }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header sticky — respeita a altura do header da página */}
        <div
          className="sticky bg-white z-10 py-2 px-4 border-b"
          style={{ top: headerOffset }}
        >
          <div className="flex items-center justify-between">
            <h1 className="font-bold text-sm">Filtros Rápidos</h1>
            <button
              onClick={() => setIsVisible?.(false)}
              className="flex items-center justify-center bg-zinc-200 font-bold text-xs py-2 px-4 rounded-md hover:bg-gray-100"
            >
              Ver resultados
            </button>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex flex-col max-h-[calc(85vh-56px)]">
          <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
            {/* Finalidade */}
            <div className="my-1">
              <span className="block text-[10px] font-semibold text-gray-800 mb-1 mt-2">
                Finalidade
              </span>
              <select
                className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black"
                value={finalidade === "Comprar" ? "comprar" : finalidade === "Alugar" ? "alugar" : ""}
                onChange={handleFinalidadeChange}
              >
                <option value="">Selecione a finalidade</option>
                <option value="comprar">Comprar</option>
                <option value="alugar">Alugar</option>
              </select>

              {/* Tipo */}
              <span className="block text-[10px] font-semibold text-gray-800 mb-1 mt-2">
                Tipo de imóvel
              </span>
              <select
                className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black"
                value={categoriaSelecionada}
                onChange={handleCategoriaChange}
              >
                <option value="">Todos os imóveis</option>
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Cidade */}
              <span className="block text-[10px] font-semibold text-gray-800 mb-1 mt-2">Cidade</span>
              <select
                className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black"
                value={cidadeSelecionada}
                onChange={handleCidadeChange}
              >
                <option value="">Todas as cidades</option>
                {cidades.map((c) => (
                  <option className="text-xs" key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Bairros (multi) */}
              <div className="mt-2" ref={bairrosRef}>
                <span className="block text-[10px] font-semibold text-gray-800 mb-1">Bairros</span>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      bairrosSelecionados.length > 0
                        ? bairrosSelecionados.length === 1
                          ? bairrosSelecionados[0]
                          : bairrosSelecionados.length <= 2
                            ? bairrosSelecionados.join(", ")
                            : `${bairrosSelecionados[0]}, +${bairrosSelecionados.length - 1}`
                        : "Selecionar bairros"
                    }
                    value={bairroFilter}
                    onChange={(e) => setBairroFilter(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black mb-1"
                    onClick={() => setBairrosExpanded(true)}
                    disabled={!cidadeSelecionada}
                  />

                  {bairrosSelecionados.length > 0 && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white text-[10px] rounded-full w-5 h-5 grid place-items-center">
                      {bairrosSelecionados.length}
                    </div>
                  )}

                  <div
                    className={`mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto ${
                      !cidadeSelecionada || !bairrosExpanded ? "hidden" : ""
                    }`}
                  >
                    {bairrosFiltrados.length > 0 && (
                      <div className="flex justify-between border-b border-gray-100 px-2 py-1 sticky top-0 bg-white">
                        <button
                          onClick={() => setBairrosSelecionados(bairrosFiltrados)}
                          className="text-[10px] text-black hover:underline"
                        >
                          Selecionar todos
                        </button>
                        <button
                          onClick={() => setBairrosSelecionados([])}
                          className="text-[10px] text-black hover:underline"
                        >
                          Limpar todos
                        </button>
                      </div>
                    )}

                    {bairrosFiltrados.length ? (
                      bairrosFiltrados.map((b) => (
                        <label
                          key={b}
                          className={`flex items-center px-2 py-1 hover:bg-gray-50 cursor-pointer ${
                            bairrosSelecionados.includes(b) ? "bg-gray-100" : ""
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mr-2 h-4 w-4"
                            checked={bairrosSelecionados.includes(b)}
                            onChange={() => handleBairroChange(b)}
                          />
                          <span className={`text-xs flex-1 ${bairrosSelecionados.includes(b) ? "font-semibold" : ""}`}>
                            {b}
                          </span>
                          {bairrosSelecionados.includes(b) && <span className="text-green-600 text-sm">✓</span>}
                        </label>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-gray-500">
                        {bairroFilter ? "Nenhum bairro encontrado" : "Selecione uma cidade primeiro"}
                      </div>
                    )}
                  </div>

                  {bairrosExpanded && (
                    <button
                      onClick={() => setBairrosExpanded(false)}
                      className="text-xs text-black bg-gray-100 w-full py-1 rounded-b-md"
                    >
                      Fechar
                    </button>
                  )}
                </div>

                {bairrosSelecionados.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {bairrosSelecionados.map((b) => (
                      <span key={b} className="bg-gray-100 rounded-full px-2 py-1 text-[10px] flex items-center">
                        {b}
                        <button onClick={() => handleBairroChange(b)} className="ml-1 text-gray-500 hover:text-black">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <OptionGroup label="Quartos" options={[1, 2, 3, "4+"]} selectedValue={quartosSelecionados} onChange={setQuartosSelecionados} />
            {/* <OptionGroup label="Banheiros" options={[1,2,3,"4+"]} selectedValue={banheirosSelecionados} onChange={setBanheirosSelecionados} /> */}
            <OptionGroup label="Vagas" options={[1, 2, 3, "4+"]} selectedValue={vagasSelecionadas} onChange={setVagasSelecionadas} />

            <Separator />

            <div className="mb-2">
              <span className="block text-[10px] font-semibold text-gray-800 mb-2">Preço</span>
              <div className="flex gap-2">
                <InputPreco placeholder="R$ 10.000" value={precoMin} onChange={(v) => handlePrecoChange(v, setPrecoMin)} />
                <InputPreco placeholder="R$ 70.000.000" value={precoMax} onChange={(v) => handlePrecoChange(v, setPrecoMax)} />
              </div>
            </div>

            <Separator />

            <div className="mb-2">
              <span className="block text-[10px] font-semibold text-gray-800 mb-2">Área do imóvel</span>
              <div className="flex gap-2">
                <InputArea placeholder="0 m²" value={areaMin} onChange={(v) => handleAreaChange(v, setAreaMin)} />
                <InputArea placeholder="999 m²" value={areaMax} onChange={(v) => handleAreaChange(v, setAreaMax)} />
              </div>
            </div>
          </div>

          {/* Barra de ações sticky */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 z-10 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
            <button
              onClick={handleAplicarFiltros}
              className="w-full bg-black text-white px-4 py-3 rounded-md mb-2 text-xs"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleLimparFiltros}
              className="w-full bg-zinc-300/80 text-black px-4 py-3 rounded-md text-xs"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      {/* FAB - Abrir filtros (mobile) */}
      {!isVisible && (
        <button
          type="button"
          onClick={() => setIsVisible?.(true)}
          className="md:hidden fixed left-1/2 -translate-x-1/2 z-[9996] rounded-full bg-black text-white px-5 py-3 shadow-lg"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 24px)" }}
          aria-label="Abrir filtros"
        >
          Abrir filtros
        </button>
      )}

      {/* Styles globais mínimos e seguros */}
      <style jsx global>{`
        @media (max-width: 767px) {
          html, body {
            overflow-x: hidden;
            overscroll-behavior-x: none;
            touch-action: pan-y;
          }
          .leaflet-container {
            touch-action: auto !important;
          }
        }
      `}</style>
    </>
  );
}
