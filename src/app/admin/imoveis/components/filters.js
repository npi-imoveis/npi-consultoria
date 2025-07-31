import { getBairrosPorCidade, getImoveisByFilters } from "@/app/services";
import { useEffect, useState, useRef } from "react";

export default function FiltersImoveisAdmin({ onFilter }) {
  // Refs para os dropdowns
  const bairrosRef = useRef(null);
  const situacaoRef = useRef(null);

  // Estados principais
  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [bairrosReais, setBairrosReais] = useState([]);
  const [situacoesReais, setSituacoesReais] = useState([]);

  // Estados de seleção
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [bairrosSelecionados, setBairrosSelecionados] = useState([]);
  const [situacoesSelecionadas, setSituacoesSelecionadas] = useState([]);
  const [valorMin, setValorMin] = useState(null);
  const [valorMax, setValorMax] = useState(null);
  const [areaMin, setAreaMin] = useState(null);
  const [areaMax, setAreaMax] = useState(null);

  // Estados de UI
  const [bairroFilter, setBairroFilter] = useState("");
  const [situacaoFilter, setSituacaoFilter] = useState("");
  const [bairrosExpanded, setBairrosExpanded] = useState(false);
  const [situacaoExpanded, setSituacaoExpanded] = useState(false);

  // Estado para outros filtros
  const [filters, setFilters] = useState({
    categoria: "",
    status: "",
    situacao: "",
    cadastro: "",
    bairros: "",
  });

  // Opções de situação
  const situacaoOptionsHardcoded = [
    "EM CONSTRUÇÃO",
    "LANÇAMENTO", 
    "PRÉ-LANÇAMENTO",
    "PRONTO NOVO",
    "PRONTO USADO"
  ];

  // Buscar categorias, cidades e situações ao carregar
  useEffect(() => {
    async function fetchFilterData() {
      try {
        console.log("🏗️ Buscando dados dos filtros...");
        
        const [catResponse, cidResponse, sitResponse] = await Promise.all([
          getImoveisByFilters("Categoria"),
          getImoveisByFilters("Cidade"),
          getImoveisByFilters("Situacao")
        ]);

        setCategorias(catResponse.data || []);
        setCidades(cidResponse.data || []);
        
        if (sitResponse?.data && Array.isArray(sitResponse.data) && sitResponse.data.length > 0) {
          // Unificação simples para eliminar duplicatas
          const situacoesBrutas = sitResponse.data.filter(s => s && s.trim() !== '');
          
          console.log("🔍 Situações brutas:", situacoesBrutas);
          
          const situacoesUnicas = [];
          const chavesSeen = new Set();
          
          situacoesBrutas.forEach(sit => {
            const chaveNormalizada = sit.toLowerCase().trim();
            if (!chavesSeen.has(chaveNormalizada)) {
              chavesSeen.add(chaveNormalizada);
              // Usar sempre a versão em MAIÚSCULA
              situacoesUnicas.push(sit.toUpperCase());
            }
          });
          
          console.log("✅ Situações únicas após unificação:", situacoesUnicas);
          setSituacoesReais(situacoesUnicas);
          
          // Mapeamento simples: chave normalizada → todas as variações originais
          window.situacoesMapeamento = {};
          situacoesUnicas.forEach(sitUnica => {
            const chave = sitUnica.toLowerCase().trim();
            const variacoesOriginais = situacoesBrutas.filter(original => 
              original.toLowerCase().trim() === chave
            );
            window.situacoesMapeamento[chave] = variacoesOriginais;
          });
          
        } else {
          console.log("⚠️ Usando situações hardcoded como fallback");
          setSituacoesReais(situacaoOptionsHardcoded);
        }

      } catch (error) {
        console.error("❌ Erro ao buscar filtros:", error);
        console.log("⚠️ Usando todas as opções hardcoded devido ao erro");
        setSituacoesReais(situacaoOptionsHardcoded);
      }
    }
    fetchFilterData();
  }, []);

  // Buscar bairros com unificação case-insensitive
  useEffect(() => {
    async function fetchBairros() {
      if (!cidadeSelecionada) {
        setBairros([]);
        setBairrosReais([]);
        return;
      }

      try {
        const response = await getBairrosPorCidade(cidadeSelecionada, categoriaSelecionada);
        const bairrosBrutos = response?.data || [];
        
        console.log("🏘️ Bairros brutos:", bairrosBrutos);
        
        if (bairrosBrutos.length > 0) {
          // Unificação simples para bairros
          const bairrosUnicos = [];
          const chavesSeen = new Set();
          
          bairrosBrutos.forEach(bairro => {
            if (bairro && bairro.trim() !== '') {
              const chaveNormalizada = bairro.toLowerCase().trim();
              if (!chavesSeen.has(chaveNormalizada)) {
                chavesSeen.add(chaveNormalizada);
                // Usar formato Title Case
                const titleCase = bairro.charAt(0).toUpperCase() + bairro.slice(1).toLowerCase();
                bairrosUnicos.push(titleCase);
              }
            }
          });
          
          console.log("✅ Bairros únicos:", bairrosUnicos);
          setBairrosReais(bairrosUnicos);
          setBairros(bairrosUnicos);
          
          // Mapeamento simples para bairros
          window.bairrosMapeamento = {};
          bairrosUnicos.forEach(bairroUnico => {
            const chave = bairroUnico.toLowerCase().trim();
            const variacoesOriginais = bairrosBrutos.filter(original => 
              original.toLowerCase().trim() === chave
            );
            window.bairrosMapeamento[chave] = variacoesOriginais;
          });
          
        } else {
          setBairros([]);
          setBairrosReais([]);
        }
      } catch (error) {
        console.error("Erro ao buscar bairros:", error);
        setBairros([]);
        setBairrosReais([]);
      }
    }
    fetchBairros();
  }, [cidadeSelecionada, categoriaSelecionada]);

  // useEffect para restaurar filtros do cache
  useEffect(() => {
    const restoreFiltersFromCache = () => {
      try {
        const savedFilters = localStorage.getItem("admin_appliedFilters");
        
        if (savedFilters) {
          const parsedFilters = JSON.parse(savedFilters);
          console.log('[FILTERS CACHE] Restaurando filtros salvos:', parsedFilters);
          
          // Restaurar estados básicos
          if (parsedFilters.Categoria) {
            setCategoriaSelecionada(parsedFilters.Categoria);
            setFilters(prev => ({ ...prev, categoria: parsedFilters.Categoria }));
          }
          
          if (parsedFilters.Status) {
            setFilters(prev => ({ ...prev, status: parsedFilters.Status }));
          }
          
          if (parsedFilters.Ativo) {
            setFilters(prev => ({ ...prev, cadastro: parsedFilters.Ativo }));
          }
          
          if (parsedFilters.Cidade) {
            setCidadeSelecionada(parsedFilters.Cidade);
          }
          
          // Restaurar situações múltiplas
          if (parsedFilters.Situacao) {
            if (Array.isArray(parsedFilters.Situacao)) {
              setSituacoesSelecionadas(parsedFilters.Situacao);
              console.log('[FILTERS CACHE] Situações restauradas:', parsedFilters.Situacao);
            } else if (typeof parsedFilters.Situacao === 'string') {
              // Se vier como string (do backend), converter para array
              const situacoesArray = parsedFilters.Situacao.split(',').map(s => s.trim());
              setSituacoesSelecionadas(situacoesArray);
              console.log('[FILTERS CACHE] Situações convertidas de string:', situacoesArray);
            } else {
              // Situação única (compatibilidade)
              setFilters(prev => ({ ...prev, situacao: parsedFilters.Situacao }));
            }
          }
          
          // Restaurar bairros se existirem
          if (parsedFilters.bairros && Array.isArray(parsedFilters.bairros)) {
            setBairrosSelecionados(parsedFilters.bairros);
          }
          
          // Restaurar valores numéricos
          if (parsedFilters.ValorMin) {
            setValorMin(typeof parsedFilters.ValorMin === 'number' ? parsedFilters.ValorMin : parseFloat(parsedFilters.ValorMin));
          }
          
          if (parsedFilters.ValorMax) {
            setValorMax(typeof parsedFilters.ValorMax === 'number' ? parsedFilters.ValorMax : parseFloat(parsedFilters.ValorMax));
          }
          
          if (parsedFilters.AreaMin) {
            setAreaMin(typeof parsedFilters.AreaMin === 'number' ? parsedFilters.AreaMin : parseInt(parsedFilters.AreaMin));
          }
          
          if (parsedFilters.AreaMax) {
            setAreaMax(typeof parsedFilters.AreaMax === 'number' ? parsedFilters.AreaMax : parseInt(parsedFilters.AreaMax));
          }
          
          console.log('[FILTERS CACHE] Todos os filtros restaurados com sucesso');
        }
      } catch (error) {
        console.error('[FILTERS CACHE] Erro ao restaurar filtros:', error);
      }
    };
    
    // Aguardar um pouco para garantir que os dados das APIs foram carregados
    const timeoutId = setTimeout(restoreFiltersFromCache, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (bairrosRef.current && !bairrosRef.current.contains(event.target)) {
        setBairrosExpanded(false);
      }
      if (situacaoRef.current && !situacaoRef.current.contains(event.target)) {
        setSituacaoExpanded(false);
      }
    }

    if (bairrosExpanded || situacaoExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bairrosExpanded, situacaoExpanded]);

  // Funções utilitárias para formatação
  const formatarParaReal = (valor) => {
    if (valor === null || valor === undefined || valor === 0) return "";
    try {
      return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } catch (e) {
      return String(valor);
    }
  };

  const converterParaNumero = (valorFormatado) => {
    if (!valorFormatado || valorFormatado.trim() === "") return null;
    const valorLimpo = valorFormatado.replace(/[^\d]/g, "");
    return valorLimpo === "" ? null : Number(valorLimpo);
  };

  const formatarArea = (valor) => {
    return valor ? valor.toString() : "";
  };

  const converterAreaParaNumero = (areaFormatada) => {
    if (!areaFormatada || areaFormatada.trim() === "") return null;
    const apenasNumeros = areaFormatada.replace(/[^\d]/g, "");
    if (apenasNumeros === "") return null;
    const numeroLimitado = apenasNumeros.slice(0, 4);
    return parseInt(numeroLimitado, 10) || null;
  };

  // Filtrar bairros usando bairros unificados
  const bairrosFiltrados = bairrosReais.filter((bairro) =>
    bairro.toLowerCase().includes(bairroFilter.toLowerCase())
  );

  // Filtrar situações usando situações reais
  const situacoesFiltradas = situacoesReais.filter((situacao) =>
    situacao.toLowerCase().includes(situacaoFilter.toLowerCase())
  );

  // Funções de manipulação de estado
  const handleBairroChange = (bairro) => {
    setBairrosSelecionados((prev) =>
      prev.includes(bairro) ? prev.filter((b) => b !== bairro) : [...prev, bairro]
    );
  };

  // Handler para situação com debug
  const handleSituacaoChange = (situacao) => {
    setSituacoesSelecionadas((prev) => {
      const isSelected = prev.includes(situacao);
      const newSituacoes = isSelected 
        ? prev.filter((s) => s !== situacao) 
        : [...prev, situacao];
      
      console.log('🔍 [DEBUG SITUAÇÃO] Situação alterada:', situacao);
      console.log('🔍 [DEBUG SITUAÇÃO] Era selecionada?', isSelected);
      console.log('🔍 [DEBUG SITUAÇÃO] Novas situações selecionadas:', newSituacoes);
      
      return newSituacoes;
    });
  };

  // Função para expandir situações de forma simples
  const normalizarSituacaoParaAPI = (situacoesSelecionadas) => {
    if (!Array.isArray(situacoesSelecionadas) || situacoesSelecionadas.length === 0) {
      return undefined;
    }

    const todasVariacoes = [];
    
    situacoesSelecionadas.forEach(sitSelecionada => {
      const chave = sitSelecionada.toLowerCase().trim();
      
      // Buscar no mapeamento
      if (window.situacoesMapeamento && window.situacoesMapeamento[chave]) {
        const variacoes = window.situacoesMapeamento[chave];
        console.log(`🔍 Expandindo "${sitSelecionada}" para:`, variacoes);
        todasVariacoes.push(...variacoes);
      } else {
        console.log(`⚠️ Usando valor original: "${sitSelecionada}"`);
        todasVariacoes.push(sitSelecionada);
      }
    });

    const variacoesUnicas = [...new Set(todasVariacoes)];
    console.log("🚀 Situações finais para API:", variacoesUnicas);

    return variacoesUnicas;
  };

  // Função para expandir bairros de forma simples
  const normalizarBairrosParaAPI = (bairrosSelecionados) => {
    if (!Array.isArray(bairrosSelecionados) || bairrosSelecionados.length === 0) {
      return undefined;
    }

    const todasVariacoes = [];
    
    bairrosSelecionados.forEach(bairroSelecionado => {
      const chave = bairroSelecionado.toLowerCase().trim();
      
      // Buscar no mapeamento
      if (window.bairrosMapeamento && window.bairrosMapeamento[chave]) {
        const variacoes = window.bairrosMapeamento[chave];
        console.log(`🏘️ Expandindo "${bairroSelecionado}" para:`, variacoes);
        todasVariacoes.push(...variacoes);
      } else {
        console.log(`⚠️ Usando valor original do bairro: "${bairroSelecionado}"`);
        todasVariacoes.push(bairroSelecionado);
      }
    });

    const variacoesUnicas = [...new Set(todasVariacoes)];
    console.log("🚀 Bairros finais para API:", variacoesUnicas);

    return variacoesUnicas;
  };

  // handleFilters simplificado com debug mínimo
  const handleFilters = () => {
    console.log("🚨 =========================");
    console.log("🚨 APLICANDO FILTROS");
    console.log("🚨 =========================");
    
    console.log("📋 Filtros aplicados:");
    console.log("  - Situações:", situacoesSelecionadas);
    console.log("  - Bairros:", bairrosSelecionados);

    const filtersToApply = {
      Categoria: filters.categoria || categoriaSelecionada,
      Status: filters.status,
      Situacao: normalizarSituacaoParaAPI(situacoesSelecionadas) || filters.situacao || undefined,
      Ativo: filters.cadastro,
      Cidade: cidadeSelecionada,
      bairros: normalizarBairrosParaAPI(bairrosSelecionados) || undefined,
      ValorMin: valorMin,
      ValorMax: valorMax,
      AreaMin: areaMin,
      AreaMax: areaMax,
    };

    if (situacoesSelecionadas.length > 0) {
      const situacoesExpandidas = normalizarSituacaoParaAPI(situacoesSelecionadas);
      console.log("🚀 Situações que serão enviadas:", situacoesExpandidas);
    }

    if (bairrosSelecionados.length > 0) {
      const bairrosExpandidos = normalizarBairrosParaAPI(bairrosSelecionados);
      console.log("🏘️ Bairros que serão enviados:", bairrosExpandidos);
    }

    console.log("🚨 Filtros enviados para API:", Object.keys(filtersToApply).filter(key => filtersToApply[key] !== undefined));

    if (Array.isArray(filtersToApply.Situacao) && filtersToApply.Situacao.length > 0) {
      console.log("📤 Situações para API:", filtersToApply.Situacao.join(','));
    }

    if (Array.isArray(filtersToApply.bairros) && filtersToApply.bairros.length > 0) {
      console.log("📤 Bairros para API:", filtersToApply.bairros.join(','));
    }

    console.log("🚨 =========================");

    if (onFilter) {
      console.log("📤 Chamando onFilter");
      onFilter(filtersToApply);
    }
  };

  // handleClearFilters simplificado
  const handleClearFilters = () => {
    console.log("🧹 Limpando filtros...");
    
    setFilters({
      categoria: "",
      status: "",
      situacao: "",
      cadastro: "",
    });
    setCategoriaSelecionada("");
    setCidadeSelecionada("");
    setBairrosSelecionados([]);
    setSituacoesSelecionadas([]);
    setBairroFilter("");
    setSituacaoFilter("");
    setValorMin(null);
    setValorMax(null);
    setAreaMin(null);
    setAreaMax(null);

    // Limpar mapeamentos
    if (window.bairrosMapeamento) delete window.bairrosMapeamento;
    if (window.situacoesMapeamento) delete window.situacoesMapeamento;

    if (onFilter) {
      onFilter({});
    }
  };

  return (
    <div className="w-full mt-4 flex flex-col gap-4 border-t py-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <SelectFilter
          name="cadastro"
          options={[
            { value: "Sim", label: "Sim" },
            { value: "Não", label: "Não" },
          ]}
          placeholder="Cadastro"
          onChange={(e) => setFilters({ ...filters, cadastro: e.target.value })}
          value={filters.cadastro}
        />
        
        <SelectFilter
          name="categoria"
          options={categorias.map((cat) => ({ value: cat, label: cat }))}
          placeholder="Categoria"
          onChange={(e) => {
            setCategoriaSelecionada(e.target.value);
            setFilters({ ...filters, categoria: e.target.value });
          }}
          value={filters.categoria || categoriaSelecionada}
        />
        
        <SelectFilter
          name="status"
          options={[
            { value: "LOCAÇÃO", label: "LOCAÇÃO" },
            { value: "LOCADO", label: "LOCADO" },
            { value: "PENDENTE", label: "PENDENTE" },
            { value: "SUSPENSO", label: "SUSPENSO" },
            { value: "VENDA", label: "VENDA" },
            { value: "VENDA E LOCAÇÃO", label: "VENDA E LOCAÇÃO" },
            { value: "VENDIDO", label: "VENDIDO" },
          ]}
          placeholder="Status"
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          value={filters.status}
        />
        
        {/* Multi-select de situação usando situações reais */}
        <div ref={situacaoRef} className="relative">
          <label htmlFor="situacao" className="text-xs text-gray-500 block mb-2">
            situacao
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Selecionar situações"
              value={situacaoFilter}
              onChange={(e) => setSituacaoFilter(e.target.value)}
              onClick={() => setSituacaoExpanded(true)}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />

            {situacoesSelecionadas.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {situacoesSelecionadas.length}
              </div>
            )}

            {situacaoExpanded && (
              <div className="absolute z-50 w-full mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto shadow-lg">
                {situacoesFiltradas.length > 0 ? (
                  <>
                    <div className="flex justify-between border-b border-gray-100 px-2 py-1">
                      <button
                        onClick={() => setSituacoesSelecionadas(situacoesFiltradas)}
                        className="text-[10px] text-black hover:underline"
                      >
                        Selecionar todos
                      </button>
                      <button
                        onClick={() => setSituacoesSelecionadas([])}
                        className="text-[10px] text-black hover:underline"
                      >
                        Limpar todos
                      </button>
                    </div>
                    
                    <div className="px-2 py-1 text-[9px] text-gray-400 border-b border-gray-100">
                      Debug: {situacoesReais.length} situações unificadas ({situacoesFiltradas.length} filtradas)
                    </div>
                    
                    {situacoesFiltradas.map((situacao, index) => (
                      <div key={`${situacao}-${index}`} className="flex items-center px-2 py-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={`situacao-${situacao}-${index}`}
                          checked={situacoesSelecionadas.includes(situacao)}
                          onChange={() => handleSituacaoChange(situacao)}
                          className="mr-2 h-4 w-4"
                        />
                        <label
                          htmlFor={`situacao-${situacao}-${index}`}
                          className="text-xs cursor-pointer flex-1 flex justify-between"
                        >
                          <span>{situacao}</span>
                          {window.situacoesMapeamento && window.situacoesMapeamento[situacao.toLowerCase().trim()] && 
                           window.situacoesMapeamento[situacao.toLowerCase().trim()].length > 1 && (
                            <span className="text-blue-500 text-[8px] font-bold" title={`${window.situacoesMapeamento[situacao.toLowerCase().trim()].length} variações no banco`}>
                              {window.situacoesMapeamento[situacao.toLowerCase().trim()].length}x
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-2 py-1 text-xs text-gray-500">
                    {situacaoFilter ? "Nenhuma situação encontrada" : "Carregando situações..."}
                  </div>
                )}
                <button
                  onClick={() => setSituacaoExpanded(false)}
                  className="text-xs text-black bg-gray-100 w-full py-1 rounded-b-md"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>

        <SelectFilter
          name="cidade"
          options={cidades.map((cidade) => ({ value: cidade, label: cidade }))}
          placeholder="Cidade"
          onChange={(e) => setCidadeSelecionada(e.target.value)}
          value={cidadeSelecionada}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bairros dropdown com pesquisa e seleção múltipla */}
        <div ref={bairrosRef}>
          <label htmlFor="bairros" className="text-xs text-gray-500 block mb-2">
            Bairros
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Selecionar bairros"
              value={bairroFilter}
              onChange={(e) => setBairroFilter(e.target.value)}
              onClick={() => setBairrosExpanded(true)}
              disabled={!cidadeSelecionada}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />

            {bairrosSelecionados.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {bairrosSelecionados.length}
              </div>
            )}

            {bairrosExpanded && cidadeSelecionada && (
              <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto">
                {bairrosFiltrados.length > 0 ? (
                  <>
                    <div className="flex justify-between border-b border-gray-100 px-2 py-1">
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
                    
                    <div className="px-2 py-1 text-[9px] text-gray-400 border-b border-gray-100">
                      Debug: {bairrosReais.length} bairros unificados ({bairrosFiltrados.length} filtrados)
                    </div>
                    
                    {bairrosFiltrados.map((bairro, index) => (
                      <div key={`${bairro}-${index}`} className="flex items-center px-2 py-1 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          id={`bairro-${bairro}-${index}`}
                          checked={bairrosSelecionados.includes(bairro)}
                          onChange={() => handleBairroChange(bairro)}
                          className="mr-2 h-4 w-4"
                        />
                        <label
                          htmlFor={`bairro-${bairro}-${index}`}
                          className="text-xs cursor-pointer flex-1 flex justify-between"
                        >
                          <span>{bairro}</span>
                          {window.bairrosMapeamento && window.bairrosMapeamento[bairro.toLowerCase().trim()] && 
                           window.bairrosMapeamento[bairro.toLowerCase().trim()].length > 1 && (
                            <span className="text-green-500 text-[8px] font-bold" title={`${window.bairrosMapeamento[bairro.toLowerCase().trim()].length} variações no banco`}>
                              {window.bairrosMapeamento[bairro.toLowerCase().trim()].length}x
                            </span>
                          )}
                        </label>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="px-2 py-1 text-xs text-gray-500">
                    {bairroFilter ? "Nenhum bairro encontrado" : "Selecione uma cidade primeiro"}
                  </div>
                )}
                <button
                  onClick={() => setBairrosExpanded(false)}
                  className="text-xs text-black bg-gray-100 w-full py-1 rounded-b-md"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Faixa de Valores */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">Faixa de Valor</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Valor Mínimo"
              value={valorMin ? formatarParaReal(valorMin) : ""}
              onChange={(e) => setValorMin(converterParaNumero(e.target.value))}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <input
              type="text"
              placeholder="Valor Máximo"
              value={valorMax ? formatarParaReal(valorMax) : ""}
              onChange={(e) => setValorMax(converterParaNumero(e.target.value))}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>

        {/* Faixa de Área */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">Área do Imóvel</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Área Mínima"
              value={areaMin ? formatarArea(areaMin) : ""}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                setAreaMin(valor ? parseInt(valor, 10) : null);
              }}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <input
              type="text"
              placeholder="Área Máxima"
              value={areaMax ? formatarArea(areaMax) : ""}
              onChange={(e) => {
                const valor = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                setAreaMax(valor ? parseInt(valor, 10) : null);
              }}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <button
          className="bg-gray-200 font-bold rounded-md text-zinc-600 hover:bg-zinc-300 p-2"
          onClick={handleFilters}
        >
          Filtrar
        </button>
        <button
          className="bg-red-100 font-bold rounded-md text-red-600 hover:bg-red-200 p-2"
          onClick={handleClearFilters}
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

function SelectFilter({ options, name, onChange, value, placeholder }) {
  return (
    <div>
      <label htmlFor={name} className="text-xs text-gray-500 block mb-2">
        {name}
      </label>
      <select
        name={name}
        className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
        onChange={onChange}
        value={value || ""}
      >
        <option value="">{placeholder || `Selecione ${name}`}</option>
        {options.map((option, index) => (
          <option className="text-xs" key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
