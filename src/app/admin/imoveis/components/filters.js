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
  const [bairrosReais, setBairrosReais] = useState([]); // ✅ ADICIONADO: Bairros unificados
  const [situacoesReais, setSituacoesReais] = useState([]); // ✅ ADICIONADO: Situações do banco

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

  // ✅ ADICIONADO: Opções de situação HARDCODED (fallback)
  const situacaoOptionsHardcoded = [
    "EM CONSTRUÇÃO",
    "LANÇAMENTO", 
    "PRÉ-LANÇAMENTO",
    "PRONTO NOVO",
    "PRONTO USADO"
  ];

  // ✅ MODIFICADO: Buscar situações reais da API com unificação case-insensitive
  useEffect(() => {
    async function fetchFilterData() {
      try {
        console.log("🏗️ Buscando dados dos filtros...");
        
        const [catResponse, cidResponse, sitResponse] = await Promise.all([
          getImoveisByFilters("Categoria"),
          getImoveisByFilters("Cidade"),
          getImoveisByFilters("Situacao") // ✅ ADICIONADO: Buscar situações reais
        ]);

        setCategorias(catResponse.data || []);
        setCidades(cidResponse.data || []);
        
        // ✅ ADICIONADO: Debug das situações do banco com unificação inteligente
        console.log("🏗️ Situações brutas do banco de dados:", sitResponse?.data || []);
        console.log("🏗️ Situações hardcoded:", situacaoOptionsHardcoded);
        
        if (sitResponse?.data && Array.isArray(sitResponse.data) && sitResponse.data.length > 0) {
          // ✅ UNIFICAÇÃO CASE-INSENSITIVE: Agrupar por equivalência e usar versão em maiúscula
          const situacoesBrutas = sitResponse.data.filter(s => s && s.trim() !== '');
          
          // Agrupar por equivalência case-insensitive
          const gruposSituacoes = {};
          situacoesBrutas.forEach(sit => {
            const chave = sit.toLowerCase().trim();
            if (!gruposSituacoes[chave]) {
              gruposSituacoes[chave] = [];
            }
            gruposSituacoes[chave].push(sit);
          });
          
          // Usar a versão em maiúscula como representante (ou primeira encontrada)
          const situacoesUnificadas = Object.keys(gruposSituacoes).map(chave => {
            const variantes = gruposSituacoes[chave];
            // Priorizar versão em maiúscula, depois primeira encontrada
            const representante = variantes.find(v => v === v.toUpperCase()) || variantes[0];
            return representante;
          });
          
          console.log("📊 UNIFICAÇÃO CASE-INSENSITIVE:");
          Object.keys(gruposSituacoes).forEach(chave => {
            const variantes = gruposSituacoes[chave];
            if (variantes.length > 1) {
              console.log(`  - "${chave}": ${variantes.length} variações →`, variantes);
            }
          });
          
          console.log("✅ Situações unificadas:", situacoesUnificadas);
          setSituacoesReais(situacoesUnificadas);
          
          // ✅ SALVAR MAPEAMENTO: Para busca posterior
          window.situacoesMapeamento = gruposSituacoes;
          
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

  // ✅ MODIFICADO: Buscar bairros com unificação case-insensitive
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
        
        console.log("🏘️ Bairros brutos do banco:", bairrosBrutos);
        
        if (bairrosBrutos.length > 0) {
          // ✅ UNIFICAÇÃO CASE-INSENSITIVE: Agrupar por equivalência
          const gruposBairros = {};
          bairrosBrutos.forEach(bairro => {
            if (bairro && bairro.trim() !== '') {
              const chave = bairro.toLowerCase().trim();
              if (!gruposBairros[chave]) {
                gruposBairros[chave] = [];
              }
              gruposBairros[chave].push(bairro);
            }
          });
          
          // Usar a versão com primeira letra maiúscula como representante
          const bairrosUnificados = Object.keys(gruposBairros).map(chave => {
            const variantes = gruposBairros[chave];
            // Priorizar formato Title Case, depois primeira encontrada
            const representante = variantes.find(v => 
              v === v.charAt(0).toUpperCase() + v.slice(1).toLowerCase()
            ) || variantes[0];
            return representante;
          });
          
          console.log("📊 UNIFICAÇÃO BAIRROS CASE-INSENSITIVE:");
          Object.keys(gruposBairros).forEach(chave => {
            const variantes = gruposBairros[chave];
            if (variantes.length > 1) {
              console.log(`  - "${chave}": ${variantes.length} variações →`, variantes);
            }
          });
          
          console.log("✅ Bairros unificados:", bairrosUnificados);
          setBairrosReais(bairrosUnificados);
          setBairros(bairrosUnificados); // Para compatibilidade
          
          // ✅ SALVAR MAPEAMENTO: Para busca posterior
          window.bairrosMapeamento = gruposBairros;
          
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

  // ✅ ADICIONADO: useEffect para restaurar filtros do cache
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
          
          // ✅ RESTAURAR SITUAÇÕES MÚLTIPLAS
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

  // ✅ MODIFICADO: Fechar dropdowns ao clicar fora
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

  // Funções utilitárias para formatação (MANTER TODAS)
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
    // Retornar apenas o número inteiro, sem formatação
    return valor ? valor.toString() : "";
  };

  const converterAreaParaNumero = (areaFormatada) => {
    if (!areaFormatada || areaFormatada.trim() === "") return null;

    // Permitir apenas números inteiros (remover qualquer caractere não numérico)
    const apenasNumeros = areaFormatada.replace(/[^\d]/g, "");

    if (apenasNumeros === "") return null;

    // Limitar a 4 dígitos máximo e converter para número
    const numeroLimitado = apenasNumeros.slice(0, 4);
    return parseInt(numeroLimitado, 10) || null;
  };

  // ✅ MODIFICADO: Filtrar bairros usando bairros unificados
  const bairrosFiltrados = bairrosReais.filter((bairro) =>
    bairro.toLowerCase().includes(bairroFilter.toLowerCase())
  );

  // ✅ MODIFICADO: Filtrar situações usando situações reais
  const situacoesFiltradas = situacoesReais.filter((situacao) =>
    situacao.toLowerCase().includes(situacaoFilter.toLowerCase())
  );

  // Funções de manipulação de estado
  const handleBairroChange = (bairro) => {
    setBairrosSelecionados((prev) =>
      prev.includes(bairro) ? prev.filter((b) => b !== bairro) : [...prev, bairro]
    );
  };

  // ✅ ADICIONADO: Função para expandir bairros selecionados para todas as variações
  const normalizarBairrosParaAPI = (bairrosSelecionados) => {
    if (!Array.isArray(bairrosSelecionados) || bairrosSelecionados.length === 0) {
      return undefined;
    }

    // ✅ EXPANSÃO INTELIGENTE: Para cada bairro selecionado, incluir TODAS as variações
    const todasVariacoes = [];
    
    bairrosSelecionados.forEach(bairroSelecionado => {
      const chaveNormalizada = bairroSelecionado.toLowerCase().trim();
      
      // Buscar no mapeamento salvo
      if (window.bairrosMapeamento && window.bairrosMapeamento[chaveNormalizada]) {
        const variacoes = window.bairrosMapeamento[chaveNormalizada];
        console.log(`🏘️ Expandindo bairro "${bairroSelecionado}" para:`, variacoes);
        todasVariacoes.push(...variacoes);
      } else {
        // Fallback: buscar manualmente nos bairros reais
        const variacoesEncontradas = bairrosReais.filter(bairroReal => 
          bairroReal && bairroReal.toLowerCase().trim() === chaveNormalizada
        );
        
        if (variacoesEncontradas.length > 0) {
          console.log(`🏘️ Variações de bairro encontradas para "${bairroSelecionado}":`, variacoesEncontradas);
          todasVariacoes.push(...variacoesEncontradas);
        } else {
          console.log(`⚠️ Nenhuma variação de bairro encontrada para "${bairroSelecionado}", usando valor original`);
          todasVariacoes.push(bairroSelecionado);
        }
      }
    });

    // Remover duplicatas finais
    const variacoesUnicas = [...new Set(todasVariacoes)];

    console.log("🚀 EXPANSÃO BAIRROS PARA API:");
    console.log("  - Selecionados pelo usuário:", bairrosSelecionados);
    console.log("  - Expandidos para todas as variações:", variacoesUnicas);
    console.log("  - Total de variações de bairros que serão buscadas:", variacoesUnicas.length);

    return variacoesUnicas;
  };
  const normalizarSituacaoParaAPI = (situacoesSelecionadas) => {
    if (!Array.isArray(situacoesSelecionadas) || situacoesSelecionadas.length === 0) {
      return undefined;
    }

    // ✅ EXPANSÃO INTELIGENTE: Para cada situação selecionada, incluir TODAS as variações
    const todasVariacoes = [];
    
    situacoesSelecionadas.forEach(sitSelecionada => {
      const chaveNormalizada = sitSelecionada.toLowerCase().trim();
      
      // Buscar no mapeamento salvo
      if (window.situacoesMapeamento && window.situacoesMapeamento[chaveNormalizada]) {
        const variacoes = window.situacoesMapeamento[chaveNormalizada];
        console.log(`🔍 Expandindo "${sitSelecionada}" para:`, variacoes);
        todasVariacoes.push(...variacoes);
      } else {
        // Fallback: buscar manualmente nas situações reais
        const variacoesEncontradas = situacoesReais.filter(sitReal => 
          sitReal && sitReal.toLowerCase().trim() === chaveNormalizada
        );
        
        if (variacoesEncontradas.length > 0) {
          console.log(`🔍 Variações encontradas para "${sitSelecionada}":`, variacoesEncontradas);
          todasVariacoes.push(...variacoesEncontradas);
        } else {
          console.log(`⚠️ Nenhuma variação encontrada para "${sitSelecionada}", usando valor original`);
          todasVariacoes.push(sitSelecionada);
        }
      }
    });

    // Remover duplicatas finais
    const variacoesUnicas = [...new Set(todasVariacoes)];

    console.log("🚀 EXPANSÃO FINAL PARA API:");
    console.log("  - Selecionadas pelo usuário:", situacoesSelecionadas);
    console.log("  - Expandidas para todas as variações:", variacoesUnicas);
    console.log("  - Total de variações que serão buscadas:", variacoesUnicas.length);

    return variacoesUnicas;
  };

  // ✅ ADICIONADO: Handler para situação com debug
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

  // ✅ MODIFICADO: handleFilters com debug extremamente detalhado
  const handleFilters = () => {
    console.log("🚨 =========================");
    console.log("🚨 DEBUG FILTROS - INÍCIO");
    console.log("🚨 =========================");
    
    // Debug detalhado dos estados
    console.log("📋 Estados atuais:");
    console.log("  - Bairros selecionados:", bairrosSelecionados);
    console.log("  - Bairros reais disponíveis:", bairrosReais);
    console.log("  - Situações selecionadas:", situacoesSelecionadas);
    console.log("  - Situações reais disponíveis:", situacoesReais);
    console.log("  - Filters state:", filters);

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

    console.log("🔍 DEBUG SITUAÇÃO DETALHADO:");
    console.log("  - situacoesSelecionadas.length:", situacoesSelecionadas.length);
    console.log("  - situacoesSelecionadas:", situacoesSelecionadas);
    console.log("  - Tipo de situacoesSelecionadas:", typeof situacoesSelecionadas);
    console.log("  - É array?", Array.isArray(situacoesSelecionadas));
    
    if (situacoesSelecionadas.length > 0) {
      console.log("  - Situações individuais:");
      situacoesSelecionadas.forEach((sit, index) => {
        console.log(`    ${index}: "${sit}" (tipo: ${typeof sit}, length: ${sit.length})`);
        
        // ✅ ADICIONADO: Mostrar quantas variações cada situação terá
        const chaveNormalizada = sit.toLowerCase().trim();
        if (window.situacoesMapeamento && window.situacoesMapeamento[chaveNormalizada]) {
          const variacoes = window.situacoesMapeamento[chaveNormalizada];
          console.log(`      └─ Será expandida para ${variacoes.length} variações:`, variacoes);
        }
      });
      
      // ✅ ADICIONADO: Preview da expansão final
      const situacoesExpandidas = normalizarSituacaoParaAPI(situacoesSelecionadas);
      console.log("🚀 PREVIEW DA EXPANSÃO SITUAÇÕES:");
      console.log("  - Situações selecionadas:", situacoesSelecionadas);
      console.log("  - Após expansão (enviado para API):", situacoesExpandidas);
      console.log("  - Quantidade total:", situacoesExpandidas?.length || 0);
    }

    // ✅ ADICIONADO: Debug detalhado para bairros
    console.log("🏘️ DEBUG BAIRROS DETALHADO:");
    console.log("  - bairrosSelecionados.length:", bairrosSelecionados.length);
    console.log("  - bairrosSelecionados:", bairrosSelecionados);
    
    if (bairrosSelecionados.length > 0) {
      console.log("  - Bairros individuais:");
      bairrosSelecionados.forEach((bairro, index) => {
        console.log(`    ${index}: "${bairro}" (tipo: ${typeof bairro}, length: ${bairro.length})`);
        
        // ✅ ADICIONADO: Mostrar quantas variações cada bairro terá
        const chaveNormalizada = bairro.toLowerCase().trim();
        if (window.bairrosMapeamento && window.bairrosMapeamento[chaveNormalizada]) {
          const variacoes = window.bairrosMapeamento[chaveNormalizada];
          console.log(`      └─ Será expandido para ${variacoes.length} variações:`, variacoes);
        }
      });
      
      // ✅ ADICIONADO: Preview da expansão final para bairros
      const bairrosExpandidos = normalizarBairrosParaAPI(bairrosSelecionados);
      console.log("🚀 PREVIEW DA EXPANSÃO BAIRROS:");
      console.log("  - Bairros selecionados:", bairrosSelecionados);
      console.log("  - Após expansão (enviado para API):", bairrosExpandidos);
      console.log("  - Quantidade total:", bairrosExpandidos?.length || 0);
    }

    console.log("🚨 FILTROS FINAIS que serão enviados:");
    Object.keys(filtersToApply).forEach(key => {
      const value = filtersToApply[key];
      console.log(`  - ${key}:`, value, `(tipo: ${typeof value})`);
      if (Array.isArray(value)) {
        console.log(`    └─ Array com ${value.length} itens:`, value);
      }
    });

    // ✅ MODIFICADO: Simulação de como será convertido no backend com expansão
    if (Array.isArray(filtersToApply.Situacao) && filtersToApply.Situacao.length > 0) {
      const situacaoParaAPI = filtersToApply.Situacao.join(',');
      console.log("🔄 CONVERSÃO SITUAÇÕES PARA API:");
      console.log(`  - Array expandido:`, filtersToApply.Situacao);
      console.log(`  - String para API: "${situacaoParaAPI}"`);
      console.log(`  - Comprimento da string:`, situacaoParaAPI.length);
      console.log(`  - Quantidade de variações:`, filtersToApply.Situacao.length);
      
      // ✅ ADICIONADO: Explicação do que acontecerá
      console.log("💡 EXPLICAÇÃO SITUAÇÕES:");
      console.log("  - O backend receberá TODAS as variações de maiúscula/minúscula");
      console.log("  - Isso garantirá que imóveis cadastrados em qualquer formato sejam encontrados");
      console.log("  - Ex: 'LANÇAMENTO' + 'lançamento' + 'Lançamento' = todos os imóveis");
    }

    // ✅ ADICIONADO: Debug para conversão de bairros
    if (Array.isArray(filtersToApply.bairros) && filtersToApply.bairros.length > 0) {
      const bairrosParaAPI = filtersToApply.bairros.join(',');
      console.log("🔄 CONVERSÃO BAIRROS PARA API:");
      console.log(`  - Array expandido:`, filtersToApply.bairros);
      console.log(`  - String para API: "${bairrosParaAPI}"`);
      console.log(`  - Comprimento da string:`, bairrosParaAPI.length);
      console.log(`  - Quantidade de variações:`, filtersToApply.bairros.length);
      
      console.log("💡 EXPLICAÇÃO BAIRROS:");
      console.log("  - O backend receberá TODAS as variações de maiúscula/minúscula de bairros");
      console.log("  - Ex: 'Centro' + 'CENTRO' + 'centro' = todos os imóveis do centro");
    }

    console.log("🚨 =========================");
    console.log("🚨 DEBUG FILTROS - FIM");
    console.log("🚨 =========================");

    if (onFilter) {
      console.log("📤 Chamando onFilter com os parâmetros acima");
      onFilter(filtersToApply);
    }
  };

  // ✅ MODIFICADO: handleClearFilters para incluir bairros unificados
  const handleClearFilters = () => {
    console.log("🧹 Limpando todos os filtros (incluindo bairros e situações unificados)...");
    
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

    // ✅ LIMPAR MAPEAMENTOS
    if (window.bairrosMapeamento) {
      delete window.bairrosMapeamento;
    }
    if (window.situacoesMapeamento) {
      delete window.situacoesMapeamento;
    }

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
        
        {/* ✅ MODIFICADO: Multi-select de situação usando situações reais */}
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
                    
                    {/* ✅ ADICIONADO: Debug info no dropdown */}
                    <div className="px-2 py-1 text-[9px] text-gray-400 border-b border-gray-100">
                      Debug: {situacoesReais.length} situações ({situacoesFiltradas.length} filtradas)
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
                          {/* ✅ ADICIONADO: Mostrar se é duplicata */}
                          {situacoesReais.filter(s => s === situacao).length > 1 && (
                            <span className="text-red-500 text-[8px] font-bold">
                              DUP
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
        {/* Bairros dropdown com pesquisa e seleção múltipla (MANTER EXATAMENTE IGUAL) */}
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
                    
                    {/* ✅ ADICIONADO: Debug info no dropdown de bairros */}
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
                          {/* ✅ ADICIONADO: Mostrar quantas variações tem no banco */}
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

          {bairrosSelecionados.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {bairrosSelecionados.map((bairro) => (
                <div
                  key={bairro}
                  className="bg-gray-100 rounded-full px-2 py-1 text-[10px] flex items-center"
                >
                  {bairro}
                  <button
                    onClick={() => handleBairroChange(bairro)}
                    className="ml-1 text-gray-500 hover:text-black"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Faixa de Valores (MANTER EXATAMENTE IGUAL) */}
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

        {/* Faixa de Área (MANTER EXATAMENTE IGUAL) */}
        <div>
          <label className="text-xs text-gray-500 block mb-2">Área do Imóvel</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Área Mínima"
              value={areaMin ? formatarArea(areaMin) : ""}
              onChange={(e) => {
                // Aplicar validação de números inteiros diretamente
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
                // Aplicar validação de números inteiros diretamente
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
