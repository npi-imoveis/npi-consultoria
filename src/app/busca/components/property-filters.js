"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
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
    if (!limpo) onChange(null);
    else onChange(Number(limpo));
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (value != null) setInputValue(String(value).replace(/[^\d]/g, ""));
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value == null) setInputValue("");
    else {
      let v = value;
      if (v < 65000) v = 65000;
      if (v > 65000000) v = 65000000;
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
        const bairrosList = res?.data
