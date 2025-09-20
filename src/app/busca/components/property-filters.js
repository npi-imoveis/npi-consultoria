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

const useIsMobile = () => {
  const isClient = useIsClient();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (!isClient) return;
    let raf = 0;
    const onResize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setIsMobile(window.innerWidth < 768));
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [isClient]);

  return isMobile;
};

/* =========================
   Helpers de finalidade (UI ↔ token)
========================= */
const labelFinalidade = (v) => (v === "venda" ? "Comprar" : v === "locacao" ? "Alugar" : "");
const toTokenFinalidade = (v) => {
  if (!v) return "";
  const x = v.toLowerCase();
  if (x === "comprar" || x === "venda") return "venda";
  if (x === "alugar" || x === "locacao" || x === "locação") return "locacao";
  return "";
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
      // sem piso, só um teto de segurança bem alto
      let v = value;
      if (v < 0) v = 0;
      if (v > 700000000) v = 700000000;
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
  const isMobile = useIsMobile();

  // Ref para scroll container desktop
  const scrollRef = useRef(null);

  const [uiVisible, setUiVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setUiVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Store
  const setFilters = useFiltersStore((s) => s.setFilters);
  const limparFiltros = useFiltersStore((s) => s.limparFiltros);
  const aplicarFiltros = useFiltersStore((s) => s.aplicarFiltros);

  // Dados dinâmicos
  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [bairros, setBairros] = useState([]);

  // Seleções
  const [finalidade, setFinalidade] = useState(""); // tokens: "venda" | "locacao"
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

  // Hidratar estados do store (normaliza finalidade)
  useEffect(() => {
    const s = useFiltersStore.getState();
    if (s.finalidade) setFinalidade(toTokenFinalidade(s.finalidade));
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

  /* ====== Outside click (mobile/desktop) with 1-tick delay ====== */
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
        if (typeof document !== "undefined") {
          document.addEventListener("pointerdown", handleOutside, { passive: true });
          registered = true;
        }
      }, 0);
    }
    return () => {
      if (timer) clearTimeout(timer);
      if (registered && typeof document !== "undefined") {
        document.removeEventListener("pointerdown", handleOutside);
      }
    };
  }, [bairrosExpanded, finalidadeExpanded, tipoExpanded, cidadeExpanded, quartosExpanded, vagasExpanded]);

  /* ====== Helpers ====== */
  const opcoes = [1, 2, 3, "4+"];

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

  const isControlled = typeof isVisible === "boolean" && typeof setIsVisible === "function";
  const visible = isControlled ? isVisible : true;

  const handleAplicarFiltros = () => {
    const filtrosBasicosPreenchidos = !!(categoriaSelecionada && cidadeSelecionada && finalidade);

    const precoMinFinal = precoMin != null && precoMin >= 0 ? precoMin : null;
    const precoMaxFinal = precoMax != null && precoMax >= 0 ? precoMax : null;

    const areaMinFinal = Math.min(areaMin || 0, 999);
    const areaMaxFinal = Math.min(areaMax || 0, 999);

    const bairrosProcessados = [];
    bairrosSelecionados.forEach((b) => {
      if (typeof b === "string" && b.includes(",")) {
        b.split(",").map((p) => p.trim()).filter(Boolean).forEach((p) => bairrosProcessados.push(p));
      } else bairrosProcessados.push(b);
    });

    setFilters({
      finalidade, // "venda" | "locacao"
      categoriaSelecionada,
      cidadeSelecionada,
      bairrosSelecionados: bairrosProcessados,
      quartos: quartosSelecionados,
      banheiros: banheirosSelecionados,
      vagas: vagasSelecionadas,

      // Mantém sempre os mesmos nomes de campos (cards e mapa passam a se alinhar)
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
    if (isControlled) setIsVisible(false);
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
     Desktop (horizontal) — apenas no desktop!
  ========================= */
  if (horizontal && !isMobile) {
    const computeDropdownStyle = (ref, width = 160) => {
      if (typeof window === "undefined" || !ref?.current) return {};
      const rect = ref.current.getBoundingClientRect();
      const left = Math.min(rect.left, Math.max(8, window.innerWidth - width - 8));
      const top = rect.bottom + 4;
      return { top, left, width, position: "fixed" };
    };

    return (
      <div className="bg-white py-4 w-full border-b">
        <div className="max-w-full mx-auto px-2">
          <div className="flex items-center">
            <div
              ref={scrollRef}
              className="flex items-end gap-2 overflow-x-auto scrollbar-hide flex-1"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {/* Finalidade */}
              <div className="flex flex-col relative" ref={finalidadeRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Finalidade</label>
                <button
                  type="button"
                  onClick={() => setFinalidadeExpanded((v) => !v)}
                  className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[92px] flex-shrink-0 text-left"
                >
                  {labelFinalidade(finalidade) || "Selecionar"}
                </button>
                <div
                  className={`z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg ${!finalidadeExpanded ? "hidden" : ""}`}
                  style={{ ...computeDropdownStyle(finalidadeRef, 160) }}
                >
                  {["", "venda", "locacao"].map((op) => (
                    <div
                      key={op || "selecionar"}
                      className="px-2 py-2 hover:bg-gray-50 cursor-pointer text-[11px]"
                      onClick={() => {
                        setFinalidade(op);
                        setFinalidadeExpanded(false);
                      }}
                    >
                      {op === "" ? "Selecionar" : labelFinalidade(op)}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipo */}
              <div className="flex flex-col relative" ref={tipoRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Tipo</label>
                <button
                  type="button"
                  onClick={() => setTipoExpanded((v) => !v)}
                  className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[114px] flex-shrink-0 text-left"
                >
                  {categoriaSelecionada || "Todos"}
                </button>
                <div
                  className={`z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto ${!tipoExpanded ? "hidden" : ""}`}
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
              <div className="flex flex-col relative" ref={cidadeRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Cidade</label>
                <button
                  type="button"
                  onClick={() => setCidadeExpanded((v) => !v)}
                  className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[114px] flex-shrink-0 text-left"
                >
                  {cidadeSelecionada || "Todas"}
                </button>
                <div
                  className={`z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto ${!cidadeExpanded ? "hidden" : ""}`}
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

              {/* Bairro (multi) */}
              <div className="flex flex-col relative" ref={bairrosRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Bairro</label>
                <button
                  type="button"
                  onClick={() => setBairrosExpanded((v) => !v)}
                  className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[140px] flex-shrink-0 text-left relative"
                >
                  {bairrosSelecionados.length > 0
                    ? bairrosSelecionados.length === 1
                      ? bairrosSelecionados[0]
                      : bairrosSelecionados.length <= 2
                      ? bairrosSelecionados.join(", ")
                      : `${bairrosSelecionados[0]} +${bairrosSelecionados.length - 1}`
                    : "Todos"}
                  {bairrosSelecionados.length > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white text-[9px] rounded-full w-4 h-4 grid place-items-center">
                      {bairrosSelecionados.length}
                    </span>
                  )}
                </button>
                <div
                  className={`z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto w-80 ${
                    !cidadeSelecionada || !bairrosExpanded ? "hidden" : ""
                  }`}
                  style={{ ...computeDropdownStyle(bairrosRef, 320) }}
                >
                  <div className="flex items-center gap-2 p-2 border-b bg-gray-50 sticky top-0">
                    <input
                      value={bairroFilter}
                      onChange={(e) => setBairroFilter(e.target.value)}
                      placeholder="Buscar bairro…"
                      className="flex-1 border rounded px-2 py-1 text-[11px] outline-none"
                    />
                    <button
                      className="text-[10px] px-2 py-1 border rounded hover:bg-gray-100"
                      onClick={() => setBairrosSelecionados(bairrosFiltrados)}
                    >
                      Selecionar todos
                    </button>
                    <button
                      className="text-[10px] px-2 py-1 border rounded hover:bg-gray-100"
                      onClick={() => setBairrosSelecionados([])}
                    >
                      Limpar
                    </button>
                  </div>

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
                          className="mr-2 h-3 w-3"
                          checked={bairrosSelecionados.includes(b)}
                          onChange={() => handleBairroChange(b)}
                        />
                        <span className={`text-[11px] flex-1 ${bairrosSelecionados.includes(b) ? "font-semibold" : ""}`}>
                          {b}
                        </span>
                        {bairrosSelecionados.includes(b) && <span className="text-green-600 text-xs">✓</span>}
                      </label>
                    ))
                  ) : (
                    <div className="px-2 py-3 text-[11px] text-gray-500 text-center">
                      {bairroFilter ? "Nenhum bairro encontrado" : "Selecione uma cidade primeiro"}
                    </div>
                  )}
                </div>
              </div>

              {/* Quartos */}
              <div className="flex flex-col relative" ref={quartosRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Quartos</label>
                <button
                  type="button"
                  onClick={() => setQuartosExpanded((v) => !v)}
                  className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[70px] flex-shrink-0 text-left"
                >
                  {quartosSelecionados ?? "Todos"}
                </button>
                <div
                  className={`z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg w-28 ${
                    !quartosExpanded ? "hidden" : ""
                  }`}
                  style={{ ...computeDropdownStyle(quartosRef, 112) }}
                >
                  {["", "1", "2", "3", "4+"].map((op) => (
                    <div
                      key={op || "todos"}
                      className="px-2 py-2 hover:bg-gray-50 cursor-pointer text-[11px]"
                      onClick={() => {
                        setQuartosSelecionados(op === "" ? null : op);
                        setQuartosExpanded(false);
                      }}
                    >
                      {op || "Todos"}
                    </div>
                  ))}
                </div>
              </div>

              {/* Vagas */}
              <div className="flex flex-col relative" ref={vagasRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Vagas</label>
                <button
                  type="button"
                  onClick={() => setVagasExpanded((v) => !v)}
                  className="px-2 py-2 text-xs bg-white border border-gray-300 hover:border-gray-400 focus:border-black focus:outline-none w-[70px] flex-shrink-0 text-left"
                >
                  {vagasSelecionadas ?? "Todas"}
                </button>
                <div
                  className={`z-[60] mt-1 bg-white border border-gray-300 rounded shadow-lg w-28 ${
                    !vagasExpanded ? "hidden" : ""
                  }`}
                  style={{ ...computeDropdownStyle(vagasRef, 112) }}
                >
                  {["", "1", "2", "3", "4+"].map((op) => (
                    <div
                      key={op || "todas"}
                      className="px-2 py-2 hover:bg-gray-50 cursor-pointer text-[11px]"
                      onClick={() => {
                        setVagasSelecionadas(op === "" ? null : op);
                        setVagasExpanded(false);
                      }}
                    >
                      {op || "Todas"}
                    </div>
                  ))}
                </div>
              </div>

              {/* Preço mín/máx */}
              <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Preço mín</label>
                <InputPreco
                  placeholder="R$ 0"
                  value={precoMin}
                  onChange={(v) => handlePrecoChange(v, setPrecoMin)}
                />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Preço máx</label>
                <InputPreco
                  placeholder="R$ 700.000.000"
                  value={precoMax}
                  onChange={(v) => handlePrecoChange(v, setPrecoMax)}
                />
              </div>

              {/* Área mín/máx */}
              <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Área mín</label>
                <InputArea placeholder="0 m²" value={areaMin} onChange={(v) => handleAreaChange(v, setAreaMin)} />
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Área máx</label>
                <InputArea placeholder="999 m²" value={areaMax} onChange={(v) => handleAreaChange(v, setAreaMax)} />
              </div>

              {/* Ações */}
              <div className="flex gap-2 items-end ml-2">
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
  }

  /* =========================
     Mobile / padrão (off-canvas com fallback inline)
  ========================= */
  return (
    <>
      {/* BOTÃO FLUTUANTE para abrir os filtros quando controlado e fechado */}
      {isClient && isMobile && isControlled && !visible && (
        <button
          type="button"
          onClick={() => setIsVisible(true)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9997] bg-black text-white px-5 py-3 rounded-full shadow-lg text-sm font-semibold"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 12px)" }}
        >
          Abrir filtros
        </button>
      )}

      {/* Backdrop quando painel aberto */}
      {isClient && isMobile && isControlled && visible && (
        <div
          className="fixed inset-0 bg-black/60 z-[9998]"
          onClick={() => setIsVisible(false)}
          aria-hidden="true"
        />
      )}

      {/* Painel */}
      <div
        className={[
          "bg-white text-black rounded-t-2xl sm:rounded-lg shadow-sm w-full overflow-y-auto scrollbar-hide transition-transform duration-300",
          isClient && isMobile
            ? (isControlled
                ? (visible
                    ? "fixed inset-x-0 bottom-0 z-[9999] max-h-[85vh] translate-y-0"
                    : "fixed inset-x-0 bottom-0 z-[9999] max-h-[85vh] translate-y-full")
                : "relative")
            : "relative"
        ].join(" ")}
        style={{
          display: !uiVisible ? "none" : "block",
          paddingBottom:
            isClient && isMobile && isControlled
              ? "calc(env(safe-area-inset-bottom) + 88px)"
              : undefined,
        }}
        role={isClient && isMobile && isControlled ? "dialog" : undefined}
        aria-modal={isClient && isMobile && isControlled ? true : undefined}
      >
        <div className="w-full p-4 sm:p-6">
          {/* Header */}
          <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-2">
            <h1 className="font-bold text-sm sm:text-base">Filtros Rápidos</h1>
            {isClient && isMobile && isControlled && (
              <button
                onClick={() => setIsVisible(false)}
                className="flex items-center justify-center bg-zinc-200 font-bold text-xs py-2 px-4 rounded-md hover:bg-gray-100"
              >
                Ver resultados
              </button>
            )}
          </div>

          {/* Finalidade */}
          <div className="my-3 sm:my-4">
            <span className="block text-[10px] font-semibold text-gray-800 mb-1 mt-2">
              Finalidade
            </span>
            <select
              className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={finalidade || ""}
              onChange={(e) => setFinalidade(e.target.value)}  // "venda" | "locacao"
            >
              <option value="">Selecione a finalidade</option>
              <option value="venda">Comprar</option>
              <option value="locacao">Alugar</option>
            </select>

            {/* Tipo */}
            <span className="block text-[10px] font-semibold text-gray-800 mb-1 mt-2">
              Tipo de imóvel
            </span>
            <select
              className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
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

          <OptionGroup label="Quartos" options={opcoes} selectedValue={quartosSelecionados} onChange={setQuartosSelecionados} />
          {/* <OptionGroup label="Banheiros" options={opcoes} selectedValue={banheirosSelecionados} onChange={setBanheirosSelecionados} /> */}
          <OptionGroup label="Vagas" options={opcoes} selectedValue={vagasSelecionadas} onChange={setVagasSelecionadas} />

          <Separator />

          <div className="mb-4">
            <span className="block text-[10px] font-semibold text-gray-800 mb-2">Preço</span>
            <div className="flex gap-2">
              <InputPreco placeholder="R$ 0" value={precoMin} onChange={(v) => handlePrecoChange(v, setPrecoMin)} />
              <InputPreco placeholder="R$ 700.000.000" value={precoMax} onChange={(v) => handlePrecoChange(v, setPrecoMax)} />
            </div>
          </div>

          <Separator />

          <div className="mb-4">
            <span className="block text-[10px] font-semibold text-gray-800 mb-2">Área do imóvel</span>
            <div className="flex gap-2">
              <InputArea placeholder="0 m²" value={areaMin} onChange={(v) => handleAreaChange(v, setAreaMin)} />
              <InputArea placeholder="999 m²" value={areaMax} onChange={(v) => handleAreaChange(v, setAreaMax)} />
            </div>
          </div>

          <div
            className={
              isClient && isMobile && isControlled
                ? "fixed bottom-0 left-0 right-0 w-full px-4 py-4 bg-white border-t border-gray-200 shadow-lg z-[9999]"
                : "sticky bottom-0 bg-white pt-3 pb-1 z-10"
            }
            style={{
              paddingBottom: isClient && isMobile && isControlled ? "calc(env(safe-area-inset-bottom) + 16px)" : undefined,
            }}
          >
            <button
              onClick={handleAplicarFiltros}
              className="w-full bg-black shadow-md text-white px-4 py-3 rounded-md mb-2 text-xs sm:text-sm"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleLimparFiltros}
              className="w-full bg-zinc-300/80 shadow-md text-black px-4 py-3 rounded-md text-xs sm:text-sm"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
