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

  // ✅ ADICIONADO: Estado para armazenar mapeamentos localmente (mais confiável que window)
  const [situacoesMapeamento, setSituacoesMapeamento] = useState({});
  const [bairrosMapeamento, setBairrosMapeamento] = useState({});

  // Opções de situação
  const situacaoOptionsHardcoded = [
    "EM CONSTRUÇÃO",
    "LANÇAMENTO", 
    "PRÉ-LANÇAMENTO",
    "PRONTO NOVO",
    "PRONTO USADO"
  ];

  // ✅ CORRIGIDO: Buscar categorias, cidades e situações com lógica de mapeamento corrigida
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
          const situacoesBrutas = sitResponse.data.filter(s => s && s.trim() !== '');
          
          console.log("🔍 [SITUAÇÃO] Situações brutas do backend:", situacoesBrutas);
          
          // ✅ LÓGICA CORRIGIDA: Criar mapeamento consistente
          const mapeamentoTemp = {};
          const situacoesUnicasSet = new Set();
          
          // Primeira passada: identificar situações únicas e criar mapeamento
          situacoesBrutas.forEach(situacaoOriginal => {
            const chaveNormalizada = situacaoOriginal.toLowerCase().trim();
            
            // Inicializar array se não existir
            if (!mapeamentoTemp[chaveNormalizada]) {
              mapeamentoTemp[chaveNormalizada] = [];
            }
            
            // Adicionar a situação original ao mapeamento
            if (!mapeamentoTemp[chaveNormalizada].includes(situacaoOriginal)) {
              mapeamentoTemp[chaveNormalizada].push(situacaoOriginal);
            }
            
            // Adicionar versão unificada (primeira letra maiúscula, resto minúscula)
            const situacaoUnificada = situacaoOriginal.charAt(0).toUpperCase() + situacaoOriginal.slice(1).toLowerCase();
            situacoesUnicasSet.add(situacaoUnificada);
          });
          
          const situacoesUnicas = Array.from(situacoesUnicasSet).sort();
          
          console.log("✅ [SITUAÇÃO] Situações únicas criadas:", situacoesUnicas);
          console.log("🗺️ [SITUAÇÃO] Mapeamento criado:", mapeamentoTemp);
          
          setSituacoesReais(situacoesUnicas);
          setSituacoesMapeamento(mapeamentoTemp);
          
        } else {
          console.log("⚠️ [SITUAÇÃO] Usando situações hardcoded como fallback");
          setSituacoesReais(situacaoOptionsHardcoded);
          setSituacoesMapeamento({});
        }

      } catch (error) {
        console.error("❌ Erro ao buscar filtros:", error);
        setSituacoesReais(situacaoOptionsHardcoded);
        setSituacoesMapeamento({});
      }
    }
    fetchFilterData();
  }, []);

  // ✅ CORRIGIDO: Buscar bairros com lógica de mapeamento corrigida
  useEffect(() => {
    async function fetchBairros() {
      if (!cidadeSelecionada) {
        setBairros([]);
        setBairrosReais([]);
        setBairrosMapeamento({});
        return;
      }

      try {
        const response = await getBairrosPorCidade(cidadeSelecionada, categoriaSelecionada);
        const bairrosBrutos = response?.data || [];
        
        console.log("🏘️ [BAIRROS] Bairros brutos:", bairrosBrutos);
        
        if (bairrosBrutos.length > 0) {
          // ✅ LÓGICA CORRIGIDA: Criar mapeamento consistente para bairros
          const mapeamentoTempBairros = {};
          const bairrosUnicosSet = new Set();
          
          bairrosBrutos.forEach(bairroOriginal => {
            if (bairroOriginal && bairroOriginal.trim() !== '') {
              const chaveNormalizada = bairroOriginal.toLowerCase().trim();
              
              // Inicializar array se não existir
              if (!mapeamentoTempBairros[chaveNormalizada]) {
                mapeamentoTempBairros[chaveNormalizada] = [];
              }
              
              // Adicionar o bairro original ao mapeamento
              if (!mapeamentoTempBairros[chaveNormalizada].includes(bairroOriginal)) {
                mapeamentoTempBairros[chaveNormalizada].push(bairroOriginal);
              }
              
              // Criar versão unificada (Title Case)
              const bairroUnificado = bairroOriginal.charAt(0).toUpperCase() + bairroOriginal.slice(1).toLowerCase();
              bairrosUnicosSet.add(bairroUnificado);
            }
          });
          
          const bairrosUnicos = Array.from(bairrosUnicosSet).sort();
          
          console.log("✅ [BAIRROS] Bairros únicos:", bairrosUnicos);
          console.log("🗺️ [BAIRROS] Mapeamento criado:", mapeamentoTempBairros);
          
          setBairrosReais(bairrosUnicos);
          setBairros(bairrosUnicos);
          setBairrosMapeamento(mapeamentoTempBairros);
          
        } else {
          setBairros([]);
          setBairrosReais([]);
          setBairrosMapeamento({});
        }
      } catch (error) {
        console.error("❌ [BAIRROS] Erro ao buscar bairros:", error);
        setBairros([]);
        setBairrosReais([]);
        setBairrosMapeamento({});
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
      
      console.log('🔍 [SITUAÇÃO] Situação alterada:', situacao);
      console.log('🔍 [SITUAÇÃO] Era selecionada?', isSelected);
      console.log('🔍 [SITUAÇÃO] Novas situações selecionadas:', newSituacoes);
      
      return newSituacoes;
    });
  };

  // ✅ FUNÇÃO PRINCIPAL CORRIGIDA: Normalizar situações para API
  const normalizarSituacaoParaAPI = (situacoesSelecionadas) => {
    if (!Array.isArray(situacoesSelecionadas) || situacoesSelecionadas.length === 0) {
      console.log('🔍 [API SITUAÇÃO] Nenhuma situação selecionada');
      return undefined;
    }

    console.log('🚀 [API SITUAÇÃO] Iniciando normalização das situações:', situacoesSelecionadas);
    console.log('🗺️ [API SITUAÇÃO] Mapeamento disponível:', situacoesMapeamento);

    const todasVariacoes = [];
    
    situacoesSelecionadas.forEach(sitSelecionada => {
      const chaveNormalizada = sitSelecionada.toLowerCase().trim();
      
      console.log(`🔍 [API SITUAÇÃO] Processando "${sitSelecionada}" -> chave: "${chaveNormalizada}"`);
      
      // Buscar no mapeamento usando a chave normalizada
      if (situacoesMapeamento[chaveNormalizada] && situacoesMapeamento[chaveNormalizada].length > 0) {
        const variacoes = situacoesMapeamento[chaveNormalizada];
        console.log(`✅ [API SITUAÇÃO] Encontradas ${variacoes.length} variações para "${sitSelecionada}":`, variacoes);
        todasVariacoes.push(...variacoes);
      } else {
        console.log(`⚠️ [API SITUAÇÃO] Mapeamento não encontrado para "${sitSelecionada}", usando valor original`);
        todasVariacoes.push(sitSelecionada);
      }
    });

    // Remover duplicatas
    const variacoesUnicas = [...new Set(todasVariacoes)];
    
    console.log("🎯 [API SITUAÇÃO] Situações finais após normalização:", variacoesUnicas);
    console.log("📊 [API SITUAÇÃO] Total: Selecionadas =", situacoesSelecionadas.length, "| Expandidas =", variacoesUnicas.length);

    return variacoesUnicas;
  };

  // ✅ FUNÇÃO CORRIGIDA: Normalizar bairros para API
  const normalizarBairrosParaAPI = (bairrosSelecionados) => {
    if (!Array.isArray(bairrosSelecionados) || bairrosSelecionados.length === 0) {
      console.log('🏘️ [API BAIRROS] Nenhum bairro selecionado');
      return undefined;
    }

    console.log('🚀 [API BAIRROS] Iniciando normalização dos bairros:', bairrosSelecionados);
    console.log('🗺️ [API BAIRROS] Mapeamento disponível:', bairrosMapeamento);

    const todasVariacoes = [];
    
    bairrosSelecionados.forEach(bairroSelecionado => {
      const chaveNormalizada = bairroSelecionado.toLowerCase().trim();
      
      console.log(`🔍 [API BAIRROS] Processando "${bairroSelecionado}" -> chave: "${chaveNormalizada}"`);
      
      // Buscar no mapeamento usando a chave normalizada
      if (bairrosMapeamento[chaveNormalizada] && bairrosMapeamento[chaveNormalizada].length > 0) {
        const variacoes = bairrosMapeamento[chaveNormalizada];
        console.log(`✅ [API BAIRROS] Encontradas ${variacoes.length} variações para "${bairroSelecionado}":`, variacoes);
        todasVariacoes.push(...variacoes);
      } else {
        console.log(`⚠️ [API BAIRROS] Mapeamento não encontrado para "${bairroSelecionado}", usando valor original`);
        todasVariacoes.push(bairroSelecionado);
      }
    });

    // Remover duplicatas
    const variacoesUnicas = [...new Set(todasVariacoes)];
    
    console.log("🎯 [API BAIRROS] Bairros finais após normalização:", variacoesUnicas);
    
    return variacoesUnicas;
  };

  // ✅ FUNÇÃO PRINCIPAL CORRIGIDA: handleFilters com debug otimizado
  const handleFilters = () => {
    console.log("🚨 ================================");
    console.log("🚨 APLICANDO FILTROS CORRIGIDOS");
    console.log("🚨 ================================");
    
    console.log("📋 Estado atual dos filtros:");
    console.log("  - Situações selecionadas:", situacoesSelecionadas);
    console.log("  - Bairros selecionados:", bairrosSelecionados);
    console.log("  - Mapeamento situações disponível:", Object.keys(situacoesMapeamento).length > 0);
    console.log("  - Mapeamento bairros disponível:", Object.keys(bairrosMapeamento).length > 0);

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

    // Remover campos undefined para clareza
    const filtersForAPI = {};
    Object.keys(filtersToApply).forEach(key => {
      if (filtersToApply[key] !== undefined && filtersToApply[key] !== null && filtersToApply[key] !== '') {
        filtersForAPI[key] = filtersToApply[key];
      }
    });

    console.log("📤 FILTROS FINAIS ENVIADOS PARA API:");
    console.log(JSON.stringify(filtersForAPI, null, 2));

    if (Array.isArray(filtersForAPI.Situacao)) {
      console.log("🎯 SITUAÇÕES COMO STRING PARA API:", filtersForAPI.Situacao.join(','));
    }

    if (Array.isArray(filtersForAPI.bairros)) {
      console.log("🏘️ BAIRROS COMO STRING PARA API:", filtersForAPI.bairros.join(','));
    }

    console.log("🚨 ================================");

    if (onFilter) {
      console.log("📡 Executando callback onFilter...");
      onFilter(filtersToApply);
    } else {
      console.error("❌ Callback onFilter não encontrado!");
    }
  };

  // handleClearFilters simplificado
  const handleClearFilters = () => {
    console.log("🧹 Limpando todos os filtros...");
    
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

    // Limpar mapeamentos locais
    setSituacoesMapeamento({});
    setBairrosMapeamento({});

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
        
        {/* ✅ DROPDOWN DE SITUAÇÃO CORRIGIDO */}
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
                      Debug: {situacoesReais.length} situações ({Object.keys(situacoesMapeamento).length} mapeadas)
                    </div>
                    
                    {situacoesFiltradas.map((situacao, index) => {
                      const chaveNormalizada = situacao.toLowerCase().trim();
                      const variacoes = situacoesMapeamento[chaveNormalizada] || [];
                      
                      return (
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
                            {variacoes.length > 1 && (
                              <span className="text-blue-500 text-[8px] font-bold" title={`${variacoes.length} variações: ${variacoes.join(', ')}`}>
                                {variacoes.length}x
                              </span>
                            )}
                          </label>
                        </div>
                      );
                    })}
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
        {/* ✅ DROPDOWN DE BAIRROS CORRIGIDO */}
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
                      Debug: {bairrosReais.length} bairros ({Object.keys(bairrosMapeamento).length} mapeados)
                    </div>
                    
                    {bairrosFiltrados.map((bairro, index) => {
                      const chaveNormalizada = bairro.toLowerCase().trim();
                      const variacoes = bairrosMapeamento[chaveNormalizada] || [];
                      
                      return (
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
                            {variacoes.length > 1 && (
                              <span className="text-green-500 text-[8px] font-bold" title={`${variacoes.length} variações: ${variacoes.join(', ')}`}>
                                {variacoes.length}x
                              </span>
                            )}
                          </label>
                        </div>
                      );
                    })}
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
