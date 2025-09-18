"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";
import useFiltersStore from "@/app/store/filtrosStore";
import { getImoveisByFilters, getBairrosPorCidade } from "@/app/services";

/* ---------------------- Componentes Reutilizáveis ---------------------- */
const InputPreco = ({ placeholder, value, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(
        value
          ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 })
          : ""
      );
    }
  }, [value, isFocused]);

  const handleChange = (e) => {
    const onlyNums = e.target.value.replace(/[^\d]/g, "");
    const num = onlyNums ? parseInt(onlyNums, 10) : null;
    onChange(num);
    setInputValue(onlyNums ? onlyNums : "");
  };

  return (
    <input
      type="text"
      placeholder={placeholder}
      value={inputValue}
      onChange={handleChange}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className="w-full rounded-md border border-gray-300 text-[10px] text-gray-800 font-semibold py-2 pl-3 focus:outline-none focus:ring-1 focus:ring-black"
    />
  );
};

const InputArea = ({ placeholder, value, onChange }) => (
  <div className="relative flex-1">
    <input
      type="number"
      placeholder={placeholder}
      value={value || ""}
      max={999}
      onChange={(e) => onChange(Math.min(999, parseInt(e.target.value || "0")))}
      className="w-full rounded-md border border-gray-300 text-[10px] text-gray-800 font-semibold py-2 pl-3 focus:outline-none focus:ring-1 focus:ring-black"
    />
    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">m²</span>
  </div>
);

const OptionButton = ({ value, selected, onClick }) => (
  <button
    type="button"
    className={`flex items-center justify-center w-16 rounded-lg border px-2 py-1 text-xs transition-colors ${
      selected ? "bg-zinc-200 text-black" : "bg-white text-gray-700 hover:bg-zinc-100"
    }`}
    onClick={() => onClick(value)}
  >
    {value}
  </button>
);

const OptionGroup = ({ label, options, selectedValue, onChange }) => (
  <div className="mb-4">
    <span className="block text-[10px] font-semibold text-gray-800 mb-2">{label}</span>
    <div className="flex gap-2">
      {options.map((option) => (
        <OptionButton key={option} value={option} selected={selectedValue === option} onClick={onChange} />
      ))}
    </div>
  </div>
);

const Separator = () => <hr className="my-4 border-gray-200" />;

/* ---------------------- Componente Principal ---------------------- */
export default function PropertyFilters({ onFilter, isVisible, setIsVisible }) {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [uiVisible, setUiVisible] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [bairros, setBairros] = useState([]);

  const setFilters = useFiltersStore((s) => s.setFilters);
  const aplicarFiltros = useFiltersStore((s) => s.aplicarFiltros);
  const limparFiltros = useFiltersStore((s) => s.limparFiltros);

  const [finalidade, setFinalidade] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [bairrosSelecionados, setBairrosSelecionados] = useState([]);
  const [quartosSelecionados, setQuartosSelecionados] = useState(null);
  const [vagasSelecionadas, setVagasSelecionadas] = useState(null);
  const [precoMin, setPrecoMin] = useState(null);
  const [precoMax, setPrecoMax] = useState(null);
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(0);

  const bairrosRef = useRef(null);
  const finalidadeRef = useRef(null);
  const tipoRef = useRef(null);
  const cidadeRef = useRef(null);
  const quartosRef = useRef(null);
  const vagasRef = useRef(null);

  const [bairrosExpanded, setBairrosExpanded] = useState(false);
  const [finalidadeExpanded, setFinalidadeExpanded] = useState(false);
  const [tipoExpanded, setTipoExpanded] = useState(false);
  const [cidadeExpanded, setCidadeExpanded] = useState(false);
  const [quartosExpanded, setQuartosExpanded] = useState(false);
  const [vagasExpanded, setVagasExpanded] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    const timer = setTimeout(() => setUiVisible(true), 100);
    return () => clearTimeout(timer);
  }, [isClient]);

  /* --- clique fora corrigido --- */
  useEffect(() => {
    let registered = false;
    let timer = null;
    const handleOutside = (e) => {
      const t = e.target;
      if (bairrosRef.current && !bairrosRef.current.contains(t)) setBairrosExpanded(false);
      if (finalidadeRef.current && !finalidadeRef.current.contains(t)) setFinalidadeExpanded(false);
      if (tipoRef.current && !tipoRef.current.contains(t)) setTipoExpanded(false);
      if (cidadeRef.current && !cidadeRef.current.contains(t)) setCidadeExpanded(false);
      if (quartosRef.current && !quartosRef.current.contains(t)) setQuartosExpanded(false);
      if (vagasRef.current && !vagasRef.current.contains(t)) setVagasExpanded(false);
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

  const handleAplicar = () => {
    setFilters({
      finalidade,
      categoriaSelecionada,
      cidadeSelecionada,
      bairrosSelecionados,
      quartos: quartosSelecionados,
      vagas: vagasSelecionadas,
      precoMin,
      precoMax,
      areaMin,
      areaMax,
    });
    aplicarFiltros();
    if (onFilter) onFilter();
    if (isClient && isMobile && setIsVisible) setIsVisible(false);
  };

  const handleLimpar = () => {
    limparFiltros();
    setFinalidade("");
    setCategoriaSelecionada("");
    setCidadeSelecionada("");
    setBairrosSelecionados([]);
    setQuartosSelecionados(null);
    setVagasSelecionadas(null);
    setPrecoMin(null);
    setPrecoMax(null);
    setAreaMin(0);
    setAreaMax(0);
    if (onFilter) onFilter();
  };

  const opcoes = [1, 2, 3, "4+"];

  return (
    <>
      {isClient && isMobile && isVisible && (
        <div className="fixed inset-0 bg-black/60 z-[9998]" onClick={() => setIsVisible(false)} aria-hidden="true" />
      )}

      <div
        className={[
          "bg-white text-black rounded-t-2xl sm:rounded-lg shadow-sm w-full overflow-y-auto scrollbar-hide transition-transform duration-300",
          isClient && isMobile
            ? isVisible
              ? "fixed inset-x-0 bottom-0 z-[9999] max-h-[85vh] translate-y-0"
              : "fixed inset-x-0 bottom-0 z-[9999] max-h-[85vh] translate-y-full"
            : "relative",
        ].join(" ")}
        style={{ display: !uiVisible ? "none" : "block" }}
      >
        <div className="w-full p-4 sm:p-6">
          <h1 className="font-bold text-sm sm:text-base">Filtros Rápidos</h1>

          <Separator />

          <OptionGroup label="Quartos" options={opcoes} selectedValue={quartosSelecionados} onChange={setQuartosSelecionados} />
          <OptionGroup label="Vagas" options={opcoes} selectedValue={vagasSelecionadas} onChange={setVagasSelecionadas} />

          <Separator />

          <div className="mb-4">
            <span className="block text-[10px] font-semibold text-gray-800 mb-2">Preço</span>
            <div className="flex gap-2">
              <InputPreco placeholder="R$ 65.000" value={precoMin} onChange={setPrecoMin} />
              <InputPreco placeholder="R$ 65.000.000" value={precoMax} onChange={setPrecoMax} />
            </div>
          </div>

          <div className="mb-4">
            <span className="block text-[10px] font-semibold text-gray-800 mb-2">Área</span>
            <div className="flex gap-2">
              <InputArea placeholder="0 m²" value={areaMin} onChange={setAreaMin} />
              <InputArea placeholder="999 m²" value={areaMax} onChange={setAreaMax} />
            </div>
          </div>

          <div className={`${isClient && isMobile ? "fixed bottom-0 left-0 right-0 w-full px-4 py-4 bg-white border-t border-gray-200 shadow-lg z-[9999]" : "sticky bottom-0 bg-white pt-3 pb-1 z-10"}`}>
            <button onClick={handleAplicar} className="w-full bg-black text-white px-4 py-3 rounded-md mb-2 text-xs sm:text-sm">
              Aplicar Filtros
            </button>
            <button onClick={handleLimpar} className="w-full bg-zinc-300/80 text-black px-4 py-3 rounded-md text-xs sm:text-sm">
              Limpar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
