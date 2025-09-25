// src/app/admin/imoveis/components/filters.js
"use client";

import { getBairrosPorCidade, getImoveisByFilters } from "@/app/services";
import { useEffect, useState, useRef } from "react";

export default function FiltersImoveisAdmin({ onFilter }) {
  // Refs para os dropdowns
  const bairrosRef = useRef(null);
  const situacaoRef = useRef(null);
  const construtoraRef = useRef(null);
  const categoriaRef = useRef(null);
  const statusRef = useRef(null);

  // Estados principais
  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [bairros, setBairros] = useState([]);
  const [bairrosReais, setBairrosReais] = useState([]);
  const [situacoesReais, setSituacoesReais] = useState([]);
  const [construtorasReais, setConstrutorasReais] = useState([]);

  // Estados de seleção (arrays para múltipla escolha)
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState([]);
  const [statusSelecionados, setStatusSelecionados] = useState([]);
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  const [bairrosSelecionados, setBairrosSelecionados] = useState([]);
  const [situacoesSelecionadas, setSituacoesSelecionadas] = useState([]);
  const [construtorasSelecionadas, setConstrutorasSelecionadas] = useState([]);
  const [valorMin, setValorMin] = useState(null);
  const [valorMax, setValorMax] = useState(null);
  const [areaMin, setAreaMin] = useState(null);
  const [areaMax, setAreaMax] = useState(null);

  // Estados de UI para filtros de texto
  const [bairroFilter, setBairroFilter] = useState("");
  const [situacaoFilter, setSituacaoFilter] = useState("");
  const [construtoraFilter, setConstrutoraFilter] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Estados de expansão dos dropdowns
  const [bairrosExpanded, setBairrosExpanded] = useState(false);
  const [situacaoExpanded, setSituacaoExpanded] = useState(false);
  const [construtoraExpanded, setConstrutoraExpanded] = useState(false);
  const [categoriaExpanded, setCategoriaExpanded] = useState(false);
  const [statusExpanded, setStatusExpanded] = useState(false);

  // Estado para outros filtros simples
  const [filters, setFilters] = useState({
    categoria: "",
    status: "",
    situacao: "",
    cadastro: "",
    bairros: "",
    construtora: "",
  });

  // Estados para armazenar mapeamentos localmente
  const [situacoesMapeamento, setSituacoesMapeamento] = useState({});
  const [bairrosMapeamento, setBairrosMapeamento] = useState({});
  const [construtorasMapeamento, setConstrutorasMapeamento] = useState({});

  // Flag para controle de restauração de cache
  const [isRestoringFromCache, setIsRestoringFromCache] = useState(false);

  // Opções hardcoded
  const situacaoOptionsHardcoded = [
    "EM CONSTRUÇÃO",
    "LANÇAMENTO", 
    "PRÉ-LANÇAMENTO",
    "PRONTO NOVO",
    "PRONTO USADO"
  ];

  const statusOptions = [
    "LOCAÇÃO",
    "LOCADO",
    "PENDENTE", 
    "SUSPENSO",
    "VENDA",
    "VENDA E LOCAÇÃO",
    "VENDIDO"
  ];

  // UTILITY FUNCTIONS
  
  // Função auxiliar para capitalização
  const capitalizarNomesProprios = (texto) => {
    if (!texto || typeof texto !== 'string') return texto;
    
    return texto.split(' ').map(palavra => {
      if (palavra.length === 0) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
    }).join(' ');
  };

  // Função de normalização robusta
  const criarChaveNormalizada = (texto) => {
    if (!texto || typeof texto !== 'string') return '';
    
    return texto
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[àáâãä]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n');
  };

  // CACHE FUNCTIONS - Sistema integrado com AdminImoveis
  
  // Função para salvar estado dos filtros no cache completo
  const saveToCompleteCache = () => {
    if (isRestoringFromCache) return; // Evita salvar durante restauração
    
    try {
      const completeState = localStorage.getItem("admin_completeState");
      
      if (completeState) {
        const parsedState = JSON.parse(completeState);
        
        // Atualizar apenas a parte dos filtros
        parsedState.filtersState = {
          categoriasSelecionadas,
          statusSelecionados,
          cidadeSelecionada,
          bairrosSelecionados,
          situacoesSelecionadas,
          construtorasSelecionadas,
          valorMin,
          valorMax,
          areaMin,
          areaMax,
          filters,
          situacoesMapeamento,
          bairrosMapeamento,
          construtorasMapeamento,
          timestamp: new Date().getTime()
        };
        
        localStorage.setItem("admin_completeState", JSON.stringify(parsedState));
        console.log("✅ Estado dos filtros salvo no cache completo");
      }
    } catch (error) {
      console.error("❌ Erro ao salvar estado dos filtros no cache:", error);
    }
  };

  // Função para restaurar estado dos filtros do cache completo
  const restoreFromCompleteCache = () => {
    try {
      const completeState = localStorage.getItem("admin_completeState");
      
      if (completeState) {
        const parsedState = JSON.parse(completeState);
        
        if (parsedState.filtersState) {
          const filterState = parsedState.filtersState;
          
          console.log("🔄 Restaurando estado dos filtros do cache completo...");
          
          setIsRestoringFromCache(true);
          
          // Restaurar todos os estados dos filtros
          setCategoriasSelecionadas(filterState.categoriasSelecionadas || []);
          setStatusSelecionados(filterState.statusSelecionados || []);
          setCidadeSelecionada(filterState.cidadeSelecionada || "");
          setBairrosSelecionados(filterState.bairrosSelecionados || []);
          setSituacoesSelecionadas(filterState.situacoesSelecionadas || []);
          setConstrutorasSelecionadas(filterState.construtorasSelecionadas || []);
          setValorMin(filterState.valorMin);
          setValorMax(filterState.valorMax);
          setAreaMin(filterState.areaMin);
          setAreaMax(filterState.areaMax);
          setFilters(filterState.filters || {});
          setSituacoesMapeamento(filterState.situacoesMapeamento || {});
          setBairrosMapeamento(filterState.bairrosMapeamento || {});
          setConstrutorasMapeamento(filterState.construtorasMapeamento || {});
          
          console.log("✅ Estado dos filtros restaurado do cache completo");
          
          setTimeout(() => setIsRestoringFromCache(false), 1000);
          return true;
        }
      }
      
      // Fallback para cache antigo
      return restoreFiltersFromOldCache();
      
    } catch (error) {
      console.error("❌ Erro ao restaurar filtros do cache completo:", error);
      return restoreFiltersFromOldCache();
    }
  };

  // Função para restaurar do cache antigo (compatibilidade)
  const restoreFiltersFromOldCache = () => {
    try {
      const savedFilters = localStorage.getItem("admin_appliedFilters");
      
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        console.log("🔄 Restaurando do cache antigo (compatibilidade)...");
        
        setIsRestoringFromCache(true);
        
        // Restaurar categorias
        if (parsedFilters.Categoria) {
          if (Array.isArray(parsedFilters.Categoria)) {
            setCategoriasSelecionadas(parsedFilters.Categoria);
          } else if (typeof parsedFilters.Categoria === 'string') {
            setCategoriasSelecionadas([parsedFilters.Categoria]);
          }
        }

        // Restaurar status
        if (parsedFilters.Status) {
          if (Array.isArray(parsedFilters.Status)) {
            setStatusSelecionados(parsedFilters.Status);
          } else if (typeof parsedFilters.Status === 'string') {
            setStatusSelecionados([parsedFilters.Status]);
          }
        }
        
        if (parsedFilters.Ativo) {
          setFilters(prev => ({ ...prev, cadastro: parsedFilters.Ativo }));
        }
        
        if (parsedFilters.Cidade) {
          setCidadeSelecionada(parsedFilters.Cidade);
        }
        
        if (parsedFilters.Situacao) {
          if (Array.isArray(parsedFilters.Situacao)) {
            setSituacoesSelecionadas(parsedFilters.Situacao);
          } else if (typeof parsedFilters.Situacao === 'string') {
            const situacoesArray = parsedFilters.Situacao.split(',').map(s => s.trim());
            setSituacoesSelecionadas(situacoesArray);
          }
        }

        // Restaurar construtoras
        if (parsedFilters.Construtora) {
          if (Array.isArray(parsedFilters.Construtora)) {
            setConstrutorasSelecionadas(parsedFilters.Construtora);
          } else if (typeof parsedFilters.Construtora === 'string') {
            const construtorasArray = parsedFilters.Construtora.split(',').map(c => c.trim());
            setConstrutorasSelecionadas(construtorasArray);
          }
        }
        
        if (parsedFilters.bairros && Array.isArray(parsedFilters.bairros)) {
          setBairrosSelecionados(parsedFilters.bairros);
        }
        
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
        
        setTimeout(() => setIsRestoringFromCache(false), 1000);
        return true;
      }
    } catch (error) {
      console.error('❌ Erro ao restaurar filtros do cache antigo:', error);
    }
    
    setIsRestoringFromCache(false);
    return false;
  };

  // DATA FETCHING - Carregar dados dos filtros
  
  useEffect(() => {
    async function fetchFilterData() {
      try {
        console.log("🔄 Carregando dados dos filtros...");
        
        const catResponse = await getImoveisByFilters("Categoria");
        const cidResponse = await getImoveisByFilters("Cidade");
        const sitResponse = await getImoveisByFilters("Situacao");
        const constResponse = await getImoveisByFilters("Construtora");

        setCategorias(catResponse.data || []);
        setCidades(cidResponse.data || []);
        
        // Processar situações
        if (sitResponse?.data && Array.isArray(sitResponse.data) && sitResponse.data.length > 0) {
          console.log("✅ Processando situações do backend...");
          
          const situacoesBrutas = sitResponse.data.filter(s => s && s.toString().trim() !== '');
          
          if (situacoesBrutas.length === 0) {
            setSituacoesReais(situacaoOptionsHardcoded);
            setSituacoesMapeamento({});
          } else {
            const novoMapeamento = {};
            const situacoesParaUI = new Set();
            
            situacoesBrutas.forEach((situacaoOriginal) => {
              if (situacaoOriginal && situacaoOriginal.toString().trim() !== '') {
                const chaveRobusta = criarChaveNormalizada(situacaoOriginal);
                const chaveSimples = situacaoOriginal.toLowerCase().trim();
                
                if (!novoMapeamento[chaveRobusta]) {
                  novoMapeamento[chaveRobusta] = [];
                }
                
                if (!novoMapeamento[chaveRobusta].includes(situacaoOriginal)) {
                  novoMapeamento[chaveRobusta].push(situacaoOriginal);
                }
                
                if (chaveRobusta !== chaveSimples) {
                  if (!novoMapeamento[chaveSimples]) {
                    novoMapeamento[chaveSimples] = [];
                  }
                  if (!novoMapeamento[chaveSimples].includes(situacaoOriginal)) {
                    novoMapeamento[chaveSimples].push(situacaoOriginal);
                  }
                }
              }
            });
            
            Object.keys(novoMapeamento).forEach(chave => {
              const situacoesGrupo = novoMapeamento[chave];
              
              const versaoMaiuscula = situacoesGrupo.find(s => {
                const somenteLetras = s.replace(/[^A-Za-záàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ\s-]/g, '');
                return somenteLetras === somenteLetras.toUpperCase() && s.trim() !== "";
              });
              
              const situacaoParaUI = versaoMaiuscula || capitalizarNomesProprios(situacoesGrupo[0]) || situacoesGrupo[0];
              
              if (situacaoParaUI && !situacoesParaUI.has(situacaoParaUI)) {
                situacoesParaUI.add(situacaoParaUI);
              }
            });
            
            const situacoesFinais = Array.from(situacoesParaUI).sort();
            
            setSituacoesReais(situacoesFinais);
            setSituacoesMapeamento(novoMapeamento);
            
            console.log(`✅ ${situacoesFinais.length} situações carregadas`);
          }
        } else {
          console.log("⚠️ Usando situações padrão");
          setSituacoesReais(situacaoOptionsHardcoded);
          setSituacoesMapeamento({});
        }

        // Processar construtoras
        if (constResponse?.data && Array.isArray(constResponse.data) && constResponse.data.length > 0) {
          console.log("✅ Processando construtoras do backend...");
          
          const construtorasBrutas = constResponse.data.filter(c => c && c.toString().trim() !== '');
          
          if (construtorasBrutas.length > 0) {
            const novoMapeamentoConst = {};
            const construtorasParaUI = new Set();
            
            construtorasBrutas.forEach((construtoraOriginal) => {
              if (construtoraOriginal && construtoraOriginal.toString().trim() !== '') {
                const chaveRobusta = criarChaveNormalizada(construtoraOriginal);
                const chaveSimples = construtoraOriginal.toLowerCase().trim();
                
                if (!novoMapeamentoConst[chaveRobusta]) {
                  novoMapeamentoConst[chaveRobusta] = [];
                }
                
                if (!novoMapeamentoConst[chaveRobusta].includes(construtoraOriginal)) {
                  novoMapeamentoConst[chaveRobusta].push(construtoraOriginal);
                }
                
                if (chaveRobusta !== chaveSimples) {
                  if (!novoMapeamentoConst[chaveSimples]) {
                    novoMapeamentoConst[chaveSimples] = [];
                  }
                  if (!novoMapeamentoConst[chaveSimples].includes(construtoraOriginal)) {
                    novoMapeamentoConst[chaveSimples].push(construtoraOriginal);
                  }
                }
              }
            });
            
            Object.keys(novoMapeamentoConst).forEach(chave => {
              const construtorasGrupo = novoMapeamentoConst[chave];
              
              const versaoMaiuscula = construtorasGrupo.find(c => {
                const somenteLetras = c.replace(/[^A-Za-záàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ\s-]/g, '');
                return somenteLetras === somenteLetras.toUpperCase() && c.trim() !== "";
              });
              
              const construtoraParaUI = versaoMaiuscula || capitalizarNomesProprios(construtorasGrupo[0]) || construtorasGrupo[0];
              
              if (construtoraParaUI && !construtorasParaUI.has(construtoraParaUI)) {
                construtorasParaUI.add(construtoraParaUI);
              }
            });
            
            const construtorasFinais = Array.from(construtorasParaUI).sort();
            
            setConstrutorasReais(construtorasFinais);
            setConstrutorasMapeamento(novoMapeamentoConst);
            
            console.log(`✅ ${construtorasFinais.length} construtoras carregadas`);
          } else {
            setConstrutorasReais([]);
            setConstrutorasMapeamento({});
          }
        } else {
          console.log("⚠️ Nenhuma construtora encontrada");
          setConstrutorasReais([]);
          setConstrutorasMapeamento({});
        }

        // Após carregar os dados, tentar restaurar do cache
        setTimeout(() => {
          restoreFromCompleteCache();
        }, 500);

      } catch (error) {
        console.error("❌ Erro ao carregar filtros:", error);
        setSituacoesReais(situacaoOptionsHardcoded);
        setSituacoesMapeamento({});
        setConstrutorasReais([]);
        setConstrutorasMapeamento({});
      }
    }
    fetchFilterData();
  }, []);

  // BAIRROS LOADING - Carregar bairros quando cidade muda
  useEffect(() => {
    async function fetchBairros() {
      if (!cidadeSelecionada) {
        setBairros([]);
        setBairrosReais([]);
        setBairrosMapeamento({});
        return;
      }

      try {
        const response = await getBairrosPorCidade(cidadeSelecionada, categoriasSelecionadas[0] || "");
        const bairrosBrutos = response?.data || [];
        
        if (bairrosBrutos.length > 0) {
          const novoMapeamentoBairros = {};
          const bairrosParaUI = new Set();
          
          bairrosBrutos.forEach(bairroOriginal => {
            if (bairroOriginal && bairroOriginal.toString().trim() !== '') {
              const chave = bairroOriginal.toLowerCase().trim();
              
              if (!novoMapeamentoBairros[chave]) {
                novoMapeamentoBairros[chave] = [];
              }
              
              if (!novoMapeamentoBairros[chave].includes(bairroOriginal)) {
                novoMapeamentoBairros[chave].push(bairroOriginal);
              }
            }
          });
          
          Object.keys(novoMapeamentoBairros).forEach(chave => {
            const bairrosGrupo = novoMapeamentoBairros[chave];
            
            const versaoCapitalizada = bairrosGrupo.find(b => 
              b === capitalizarNomesProprios(b)
            );
            
            const melhorVersao = versaoCapitalizada || capitalizarNomesProprios(bairrosGrupo[0]);
            bairrosParaUI.add(melhorVersao);
          });
          
          const bairrosFinais = Array.from(bairrosParaUI).sort();
          
          setBairrosReais(bairrosFinais);
          setBairros(bairrosFinais);
          setBairrosMapeamento(novoMapeamentoBairros);
          
        } else {
          setBairros([]);
          setBairrosReais([]);
          setBairrosMapeamento({});
        }
      } catch (error) {
        console.error("❌ Erro ao buscar bairros:", error);
        setBairros([]);
        setBairrosReais([]);
        setBairrosMapeamento({});
      }
    }
    fetchBairros();
  }, [cidadeSelecionada, categoriasSelecionadas]);

  // AUTO SAVE - Salvar no cache sempre que houver mudanças
  useEffect(() => {
    if (!isRestoringFromCache) {
      const timeoutId = setTimeout(() => {
        saveToCompleteCache();
      }, 500); // Debounce de 500ms
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    categoriasSelecionadas, statusSelecionados, cidadeSelecionada, 
    bairrosSelecionados, situacoesSelecionadas, construtorasSelecionadas,
    valorMin, valorMax, areaMin, areaMax, filters,
    isRestoringFromCache
  ]);

  // CLICK OUTSIDE - Fechar dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (bairrosRef.current && !bairrosRef.current.contains(event.target)) {
        setBairrosExpanded(false);
      }
      if (situacaoRef.current && !situacaoRef.current.contains(event.target)) {
        setSituacaoExpanded(false);
      }
      if (construtoraRef.current && !construtoraRef.current.contains(event.target)) {
        setConstrutoraExpanded(false);
      }
      if (categoriaRef.current && !categoriaRef.current.contains(event.target)) {
        setCategoriaExpanded(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setStatusExpanded(false);
      }
    }

    if (bairrosExpanded || situacaoExpanded || construtoraExpanded || categoriaExpanded || statusExpanded) {
      if (typeof document !== 'undefined') {
        document.addEventListener("mousedown", handleClickOutside);
      }
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [bairrosExpanded, situacaoExpanded, construtoraExpanded, categoriaExpanded, statusExpanded]);

  // FORMATTING FUNCTIONS - Funções para formatação de valores
  
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

  // FILTERING FUNCTIONS - Filtrar arrays para exibição
  
  const categoriasFiltradas = categorias.filter((categoria) =>
    categoria.toLowerCase().includes(categoriaFilter.toLowerCase())
  );

  const statusFiltrados = statusOptions.filter((status) =>
    status.toLowerCase().includes(statusFilter.toLowerCase())
  );

  const bairrosFiltrados = bairrosReais.filter((bairro) =>
    bairro.toLowerCase().includes(bairroFilter.toLowerCase())
  );

  const situacoesFiltradas = situacoesReais.filter((situacao) =>
    situacao.toLowerCase().includes(situacaoFilter.toLowerCase())
  );

  const construtorasFiltradas = construtorasReais.filter((construtora) =>
    construtora.toLowerCase().includes(construtoraFilter.toLowerCase())
  );

  // HANDLERS - Funções de manipulação de seleção
  
  const handleCategoriaChange = (categoria) => {
    if (isRestoringFromCache) return;
    setCategoriasSelecionadas((prev) =>
      prev.includes(categoria) ? prev.filter((c) => c !== categoria) : [...prev, categoria]
    );
  };

  const handleStatusChange = (status) => {
    if (isRestoringFromCache) return;
    setStatusSelecionados((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleBairroChange = (bairro) => {
    if (isRestoringFromCache) return;
    setBairrosSelecionados((prev) =>
      prev.includes(bairro) ? prev.filter((b) => b !== bairro) : [...prev, bairro]
    );
  };

  const handleSituacaoChange = (situacao) => {
    if (isRestoringFromCache) return;
    setSituacoesSelecionadas((prev) => {
      const isSelected = prev.includes(situacao);
      const newSituacoes = isSelected 
        ? prev.filter((s) => s !== situacao) 
        : [...prev, situacao];
      
      return newSituacoes;
    });
  };

  const handleConstrutoraChange = (construtora) => {
    if (isRestoringFromCache) return;
    setConstrutorasSelecionadas((prev) => {
      const isSelected = prev.includes(construtora);
      const newConstrutoras = isSelected 
        ? prev.filter((c) => c !== construtora) 
        : [...prev, construtora];
      
      return newConstrutoras;
    });
  };

  // API NORMALIZATION - Normalizar dados para envio à API
  
  const normalizarSituacaoParaAPI = (situacoesSelecionadas) => {
    if (!Array.isArray(situacoesSelecionadas) || situacoesSelecionadas.length === 0) {
      return undefined;
    }

    const todasVariacoesSituacao = [];
    
    situacoesSelecionadas.forEach((situacaoSelecionada) => {
      const chaveRobusta = criarChaveNormalizada(situacaoSelecionada);
      const chaveSimples = situacaoSelecionada.toLowerCase().trim();
      
      let encontrouVariacoes = false;
      
      if (situacoesMapeamento[chaveRobusta] && situacoesMapeamento[chaveRobusta].length > 0) {
        todasVariacoesSituacao.push(...situacoesMapeamento[chaveRobusta]);
        encontrouVariacoes = true;
      }
      
      if (!encontrouVariacoes && chaveRobusta !== chaveSimples && situacoesMapeamento[chaveSimples] && situacoesMapeamento[chaveSimples].length > 0) {
        todasVariacoesSituacao.push(...situacoesMapeamento[chaveSimples]);
        encontrouVariacoes = true;
      }
      
      if (!encontrouVariacoes) {
        todasVariacoesSituacao.push(situacaoSelecionada);
      }
    });

    const situacoesSemDuplicatas = [...new Set(todasVariacoesSituacao)];
    return situacoesSemDuplicatas;
  };

  const normalizarBairrosParaAPI = (bairrosSelecionados) => {
    if (!Array.isArray(bairrosSelecionados) || bairrosSelecionados.length === 0) {
      return undefined;
    }

    const todasVariacoes = [];
    
    bairrosSelecionados.forEach(bairroSelecionado => {
      const chave = bairroSelecionado.toLowerCase().trim();
      
      if (bairrosMapeamento[chave] && bairrosMapeamento[chave].length > 0) {
        todasVariacoes.push(...bairrosMapeamento[chave]);
      } else {
        todasVariacoes.push(bairroSelecionado);
      }
    });

    return [...new Set(todasVariacoes)];
  };

  const normalizarConstrutoraParaAPI = (construtorasSelecionadas) => {
    if (!Array.isArray(construtorasSelecionadas) || construtorasSelecionadas.length === 0) {
      return undefined;
    }

    const todasVariacoesConstrutora = [];
    
    construtorasSelecionadas.forEach((construtoraSelecionada) => {
      const chaveRobusta = criarChaveNormalizada(construtoraSelecionada);
      const chaveSimples = construtoraSelecionada.toLowerCase().trim();
      
      let encontrouVariacoes = false;
      
      if (construtorasMapeamento[chaveRobusta] && construtorasMapeamento[chaveRobusta].length > 0) {
        todasVariacoesConstrutora.push(...construtorasMapeamento[chaveRobusta]);
        encontrouVariacoes = true;
      }
      
      if (!encontrouVariacoes && chaveRobusta !== chaveSimples && construtorasMapeamento[chaveSimples] && construtorasMapeamento[chaveSimples].length > 0) {
        todasVariacoesConstrutora.push(...construtorasMapeamento[chaveSimples]);
        encontrouVariacoes = true;
      }
      
      if (!encontrouVariacoes) {
        todasVariacoesConstrutora.push(construtoraSelecionada);
      }
    });

    const construtorasSemDuplicatas = [...new Set(todasVariacoesConstrutora)];
    return construtorasSemDuplicatas;
  };

  // MAIN HANDLERS - Aplicar e limpar filtros
  
  const handleFilters = () => {
    const situacaoProcessada = normalizarSituacaoParaAPI(situacoesSelecionadas);
    const construtoraProcessada = normalizarConstrutoraParaAPI(construtorasSelecionadas);
    
    const filtersToApply = {
      Categoria: categoriasSelecionadas.length > 0 ? categoriasSelecionadas : undefined,
      Status: statusSelecionados.length > 0 ? statusSelecionados : undefined,
      Situacao: situacaoProcessada || filters.situacao || undefined,
      Construtora: construtoraProcessada || filters.construtora || undefined,
      Ativo: filters.cadastro,
      Cidade: cidadeSelecionada,
      bairros: normalizarBairrosParaAPI(bairrosSelecionados) || undefined,
      ValorMin: valorMin,
      ValorMax: valorMax,
      AreaMin: areaMin,
      AreaMax: areaMax,
    };

    const filtersForAPI = {};
    Object.keys(filtersToApply).forEach(key => {
      if (filtersToApply[key] !== undefined && filtersToApply[key] !== null && filtersToApply[key] !== '') {
        filtersForAPI[key] = filtersToApply[key];
      }
    });

    console.log("🔍 Aplicando filtros:", filtersForAPI);

    // Salvar no cache antes de aplicar
    saveToCompleteCache();

    if (onFilter) {
      onFilter(filtersToApply);
    }
  };

  const handleClearFilters = () => {
    console.log("🧹 Limpando todos os filtros...");
    
    setIsRestoringFromCache(true);
    
    // Limpar todos os estados
    setFilters({
      categoria: "",
      status: "",
      situacao: "",
      cadastro: "",
      construtora: "",
    });
    setCategoriasSelecionadas([]);
    setStatusSelecionados([]);
    setCidadeSelecionada("");
    setBairrosSelecionados([]);
    setSituacoesSelecionadas([]);
    setConstrutorasSelecionadas([]);
    setCategoriaFilter("");
    setStatusFilter("");
    setBairroFilter("");
    setSituacaoFilter("");
    setConstrutoraFilter("");
    setValorMin(null);
    setValorMax(null);
    setAreaMin(null);
    setAreaMax(null);
    setSituacoesMapeamento({});
    setBairrosMapeamento({});
    setConstrutorasMapeamento({});

    // Limpar todos os caches
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem("admin_completeState");
      localStorage.removeItem("admin_appliedFilters");
      localStorage.removeItem("admin_filterResults");
      localStorage.removeItem("admin_filterPagination");
      localStorage.removeItem("admin_searchTerm");
      localStorage.removeItem("admin_searchResults");
      localStorage.removeItem("admin_searchPagination");
    }
    
    setTimeout(() => setIsRestoringFromCache(false), 500);
    
    if (onFilter) {
      onFilter({});
    }
  };

  return (
    <div className="w-full mt-4 flex flex-col gap-4 border-t py-4">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <SelectFilter
          name="cadastro"
          options={[
            { value: "Sim", label: "Sim" },
            { value: "Não", label: "Não" },
          ]}
          placeholder="Cadastro"
          onChange={(e) => {
            if (!isRestoringFromCache) {
              setFilters({ ...filters, cadastro: e.target.value });
            }
          }}
          value={filters.cadastro}
        />
        
        {/* Dropdown de categoria com múltipla escolha */}
        <div ref={categoriaRef} className="relative">
          <label htmlFor="categoria" className="text-xs text-gray-500 block mb-2">
            Categoria
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Selecionar categorias"
              value={categoriaFilter}
              onChange={(e) => setCategoriaFilter(e.target.value)}
              onClick={() => setCategoriaExpanded(true)}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />

            {categoriasSelecionadas.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {categoriasSelecionadas.length}
              </div>
            )}

            {categoriaExpanded && (
              <div className="absolute z-50 w-full mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto shadow-lg">
                {categoriasFiltradas.length > 0 ? (
                  <>
                    <div className="flex justify-between border-b border-gray-100 px-2 py-1">
                      <button
                        onClick={() => !isRestoringFromCache && setCategoriasSelecionadas(categoriasFiltradas)}
                        className="text-[10px] text-black hover:underline"
                      >
                        Selecionar todos
                      </button>
                      <button
                        onClick={() => !isRestoringFromCache && setCategoriasSelecionadas([])}
                        className="text-[10px] text-black hover:underline"
                      >
                        Limpar todos
                      </button>
                    </div>
                    
                    {categoriasFiltradas.map((categoria, index) => {
                      const isSelected = categoriasSelecionadas.includes(categoria);
                      
                      return (
                        <div 
                          key={`${categoria}-${index}`} 
                          className={`flex items-center px-2 py-1 hover:bg-gray-50 ${
                            isSelected ? 'bg-gray-100' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`categoria-${categoria}-${index}`}
                            checked={isSelected}
                            onChange={() => handleCategoriaChange(categoria)}
                            className="mr-2 h-4 w-4"
                          />
                          <label
                            htmlFor={`categoria-${categoria}-${index}`}
                            className={`text-xs cursor-pointer flex-1 ${
                              isSelected ? 'font-medium text-gray-900' : ''
                            }`}
                          >
                            {categoria}
                          </label>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-2 py-1 text-xs text-gray-500">
                    {categoriaFilter ? "Nenhuma categoria encontrada" : "Carregando categorias..."}
                  </div>
                )}
                <button
                  onClick={() => setCategoriaExpanded(false)}
                  className="text-xs text-black bg-gray-100 w-full py-1 rounded-b-md"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown de status com múltipla escolha */}
        <div ref={statusRef} className="relative">
          <label htmlFor="status" className="text-xs text-gray-500 block mb-2">
            Status
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Selecionar status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              onClick={() => setStatusExpanded(true)}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />

            {statusSelecionados.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {statusSelecionados.length}
              </div>
            )}

            {statusExpanded && (
              <div className="absolute z-50 w-full mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto shadow-lg">
                {statusFiltrados.length > 0 ? (
                  <>
                    <div className="flex justify-between border-b border-gray-100 px-2 py-1">
                      <button
                        onClick={() => !isRestoringFromCache && setStatusSelecionados(statusFiltrados)}
                        className="text-[10px] text-black hover:underline"
                      >
                        Selecionar todos
                      </button>
                      <button
                        onClick={() => !isRestoringFromCache && setStatusSelecionados([])}
                        className="text-[10px] text-black hover:underline"
                      >
                        Limpar todos
                      </button>
                    </div>
                    
                    {statusFiltrados.map((status, index) => {
                      const isSelected = statusSelecionados.includes(status);
                      
                      return (
                        <div 
                          key={`${status}-${index}`} 
                          className={`flex items-center px-2 py-1 hover:bg-gray-50 ${
                            isSelected ? 'bg-gray-100' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`status-${status}-${index}`}
                            checked={isSelected}
                            onChange={() => handleStatusChange(status)}
                            className="mr-2 h-4 w-4"
                          />
                          <label
                            htmlFor={`status-${status}-${index}`}
                            className={`text-xs cursor-pointer flex-1 ${
                              isSelected ? 'font-medium text-gray-900' : ''
                            }`}
                          >
                            {status}
                          </label>
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-2 py-1 text-xs text-gray-500">
                    {statusFilter ? "Nenhum status encontrado" : "Carregando status..."}
                  </div>
                )}
                <button
                  onClick={() => setStatusExpanded(false)}
                  className="text-xs text-black bg-gray-100 w-full py-1 rounded-b-md"
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Dropdown de situação */}
        <div ref={situacaoRef} className="relative">
          <label htmlFor="situacao" className="text-xs text-gray-500 block mb-2">
            Situação
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
                        onClick={() => !isRestoringFromCache && setSituacoesSelecionadas(situacoesFiltradas)}
                        className="text-[10px] text-black hover:underline"
                      >
                        Selecionar todos
                      </button>
                      <button
                        onClick={() => !isRestoringFromCache && setSituacoesSelecionadas([])}
                        className="text-[10px] text-black hover:underline"
                      >
                        Limpar todos
                      </button>
                    </div>
                    
                    {situacoesFiltradas.map((situacao, index) => {
                      const chaveRobusta = criarChaveNormalizada(situacao);
                      const chaveSimples = situacao.toLowerCase().trim();
                      const variacoes = situacoesMapeamento[chaveRobusta] || situacoesMapeamento[chaveSimples] || [];
                      const isSelected = situacoesSelecionadas.includes(situacao);
                      
                      return (
                        <div 
                          key={`${situacao}-${index}`} 
                          className={`flex items-center px-2 py-1 hover:bg-gray-50 ${
                            isSelected ? 'bg-gray-100' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`situacao-${situacao}-${index}`}
                            checked={isSelected}
                            onChange={() => handleSituacaoChange(situacao)}
                            className="mr-2 h-4 w-4"
                          />
                          <label
                            htmlFor={`situacao-${situacao}-${index}`}
                            className={`text-xs cursor-pointer flex-1 flex justify-between ${
                              isSelected ? 'font-medium text-gray-900' : ''
                            }`}
                          >
                            <span>{situacao}</span>
                            {variacoes.length > 1 && (
                              <span className="text-green-500 text-[8px] font-bold" title={`${variacoes.length} variações no banco`}>
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

        {/* Dropdown de construtoras */}
        <div ref={construtoraRef} className="relative">
          <label htmlFor="construtora" className="text-xs text-gray-500 block mb-2">
            Construtora
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Selecionar construtoras"
              value={construtoraFilter}
              onChange={(e) => setConstrutoraFilter(e.target.value)}
              onClick={() => setConstrutoraExpanded(true)}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />

            {construtorasSelecionadas.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {construtorasSelecionadas.length}
              </div>
            )}

            {construtoraExpanded && (
              <div className="absolute z-50 w-full mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto shadow-lg">
                {construtorasFiltradas.length > 0 ? (
                  <>
                    <div className="flex justify-between border-b border-gray-100 px-2 py-1">
                      <button
                        onClick={() => !isRestoringFromCache && setConstrutorasSelecionadas(construtorasFiltradas)}
                        className="text-[10px] text-black hover:underline"
                      >
                        Selecionar todos
                      </button>
                      <button
                        onClick={() => !isRestoringFromCache && setConstrutorasSelecionadas([])}
                        className="text-[10px] text-black hover:underline"
                      >
                        Limpar todos
                      </button>
                    </div>
                    
                    {construtorasFiltradas.map((construtora, index) => {
                      const chaveRobusta = criarChaveNormalizada(construtora);
                      const chaveSimples = construtora.toLowerCase().trim();
                      const variacoes = construtorasMapeamento[chaveRobusta] || construtorasMapeamento[chaveSimples] || [];
                      const isSelected = construtorasSelecionadas.includes(construtora);
                      
                      return (
                        <div 
                          key={`${construtora}-${index}`} 
                          className={`flex items-center px-2 py-1 hover:bg-gray-50 ${
                            isSelected ? 'bg-gray-100' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`construtora-${construtora}-${index}`}
                            checked={isSelected}
                            onChange={() => handleConstrutoraChange(construtora)}
                            className="mr-2 h-4 w-4"
                          />
                          <label
                            htmlFor={`construtora-${construtora}-${index}`}
                            className={`text-xs cursor-pointer flex-1 flex justify-between ${
                              isSelected ? 'font-medium text-gray-900' : ''
                            }`}
                          >
                            <span>{construtora}</span>
                            {variacoes.length > 1 && (
                              <span className="text-green-500 text-[8px] font-bold" title={`${variacoes.length} variações no banco`}>
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
                    {construtoraFilter ? "Nenhuma construtora encontrada" : "Carregando construtoras..."}
                  </div>
                )}
                <button
                  onClick={() => setConstrutoraExpanded(false)}
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
          onChange={(e) => {
            if (!isRestoringFromCache) {
              setCidadeSelecionada(e.target.value);
            }
          }}
          value={cidadeSelecionada}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Dropdown de bairros */}
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
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100"
            />

            {bairrosSelecionados.length > 0 && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {bairrosSelecionados.length}
              </div>
            )}

            {bairrosExpanded && cidadeSelecionada && (
              <div className="absolute z-10 w-full mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto shadow-lg">
                {bairrosFiltrados.length > 0 ? (
                  <>
                    <div className="flex justify-between border-b border-gray-100 px-2 py-1">
                      <button
                        onClick={() => !isRestoringFromCache && setBairrosSelecionados(bairrosFiltrados)}
                        className="text-[10px] text-black hover:underline"
                      >
                        Selecionar todos
                      </button>
                      <button
                        onClick={() => !isRestoringFromCache && setBairrosSelecionados([])}
                        className="text-[10px] text-black hover:underline"
                      >
                        Limpar todos
                      </button>
                    </div>
                    
                    {bairrosFiltrados.map((bairro, index) => {
                      const chave = bairro.toLowerCase().trim();
                      const variacoes = bairrosMapeamento[chave] || [];
                      const isSelected = bairrosSelecionados.includes(bairro);
                      
                      return (
                        <div 
                          key={`${bairro}-${index}`} 
                          className={`flex items-center px-2 py-1 hover:bg-gray-50 ${
                            isSelected ? 'bg-gray-100' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            id={`bairro-${bairro}-${index}`}
                            checked={isSelected}
                            onChange={() => handleBairroChange(bairro)}
                            className="mr-2 h-4 w-4"
                          />
                          <label
                            htmlFor={`bairro-${bairro}-${index}`}
                            className={`text-xs cursor-pointer flex-1 flex justify-between ${
                              isSelected ? 'font-medium text-gray-900' : ''
                            }`}
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
              onChange={(e) => !isRestoringFromCache && setValorMin(converterParaNumero(e.target.value))}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <input
              type="text"
              placeholder="Valor Máximo"
              value={valorMax ? formatarParaReal(valorMax) : ""}
              onChange={(e) => !isRestoringFromCache && setValorMax(converterParaNumero(e.target.value))}
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
                if (!isRestoringFromCache) {
                  const valor = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  setAreaMin(valor ? parseInt(valor, 10) : null);
                }
              }}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
            <input
              type="text"
              placeholder="Área Máxima"
              value={areaMax ? formatarArea(areaMax) : ""}
              onChange={(e) => {
                if (!isRestoringFromCache) {
                  const valor = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                  setAreaMax(valor ? parseInt(valor, 10) : null);
                }
              }}
              className="w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-wrap gap-3 items-center pt-4 border-t">
        <button
          onClick={handleFilters}
          disabled={isRestoringFromCache}
          className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
        >
          Aplicar Filtros
        </button>

        <button
          onClick={handleClearFilters}
          disabled={isRestoringFromCache}
          className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors disabled:bg-gray-400"
        >
          Limpar Filtros
        </button>

        {/* Informações de status */}
        <div className="text-xs text-gray-500 flex items-center gap-4 flex-wrap">
          <span>📊 Situações: {situacoesReais.length}</span>
          <span>🏗️ Construtoras: {construtorasReais.length}</span>
          <span>🗂️ Mapeamentos: {Object.keys(situacoesMapeamento).length}</span>
          {categoriasSelecionadas.length > 0 && (
            <span className="text-green-600 font-medium">
              📁 {categoriasSelecionadas.length} categorias
            </span>
          )}
          {statusSelecionados.length > 0 && (
            <span className="text-red-600 font-medium">
              📋 {statusSelecionados.length} status
            </span>
          )}
          {situacoesSelecionadas.length > 0 && (
            <span className="text-blue-600 font-medium">
              ✅ {situacoesSelecionadas.length} situações
            </span>
          )}
          {construtorasSelecionadas.length > 0 && (
            <span className="text-purple-600 font-medium">
