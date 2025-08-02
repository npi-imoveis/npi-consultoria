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

  // ✅ Estados para armazenar mapeamentos localmente
  const [situacoesMapeamento, setSituacoesMapeamento] = useState({});
  const [bairrosMapeamento, setBairrosMapeamento] = useState({});

  // 🔬 Estado para investigação completa
  const [investigandoSituacoes, setInvestigandoSituacoes] = useState(false);

  // ✅ CORRIGIDO: Opções de situação SEM "Pronto para morar"
  const situacaoOptionsHardcoded = [
    "EM CONSTRUÇÃO",
    "LANÇAMENTO", 
    "PRÉ-LANÇAMENTO",
    "PRONTO NOVO",
    "PRONTO USADO"
  ];

  // ✅ Função auxiliar para capitalização
  const capitalizarNomesProprios = (texto) => {
    if (!texto || typeof texto !== 'string') return texto;
    
    return texto.split(' ').map(palavra => {
      if (palavra.length === 0) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
    }).join(' ');
  };

  // ✅ MELHORADO: Função de normalização de chave mais robusta
  const criarChaveNormalizada = (situacao) => {
    if (!situacao || typeof situacao !== 'string') return '';
    
    return situacao
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ') // Múltiplos espaços para um só
      .replace(/[àáâãä]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n');
  };

  // 🔬 INVESTIGAÇÃO COMPLETA: Analisa TODOS os campos
  const investigarTodosCampos = async () => {
    setInvestigandoSituacoes(true);
    console.log("🔬 ===== INVESTIGAÇÃO COMPLETA: TODOS OS CAMPOS =====");
    
    try {
      console.log("📡 Buscando dados brutos de múltiplas páginas...");
      
      const paginas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      let todosImoveis = [];
      
      for (const pagina of paginas) {
        try {
          console.log(`📄 Carregando página ${pagina}...`);
          
          const response = await fetch(`/api/admin/imoveis?page=${pagina}&limit=30`);
          const dados = await response.json();
          
          if (dados && dados.data && Array.isArray(dados.data)) {
            todosImoveis.push(...dados.data);
            console.log(`   ✅ Página ${pagina}: ${dados.data.length} imóveis`);
          } else {
            console.log(`   ❌ Página ${pagina}: sem dados`);
          }
          
          if (!dados.data || dados.data.length === 0) {
            console.log(`   🏁 Fim dos dados na página ${pagina}`);
            break;
          }
          
        } catch (error) {
          console.log(`   ⚠️ Erro na página ${pagina}:`, error.message);
        }
      }
      
      console.log(`📊 TOTAL COLETADO: ${todosImoveis.length} imóveis`);
      
      if (todosImoveis.length === 0) {
        console.log("❌ Nenhum imóvel coletado da API");
        return;
      }
      
      // Análise específica do campo Situação
      console.log("🔍 ===== ANÁLISE DETALHADA CAMPO SITUAÇÃO =====");
      
      const estatisticasSituacao = {
        total: todosImoveis.length,
        comSituacao: 0,
        semSituacao: 0,
        nullOuUndefined: 0,
        vazio: 0
      };
      
      const situacoesEncontradas = new Map();
      const exemplosPorSituacao = new Map();
      
      todosImoveis.forEach((imovel, i) => {
        const situacao = imovel.Situacao;
        const codigo = imovel.Codigo || imovel.codigo || `sem-codigo-${i}`;
        
        if (situacao === null || situacao === undefined) {
          estatisticasSituacao.nullOuUndefined++;
          estatisticasSituacao.semSituacao++;
        } else if (situacao === '' || (typeof situacao === 'string' && situacao.trim() === '')) {
          estatisticasSituacao.vazio++;
          estatisticasSituacao.semSituacao++;
        } else {
          estatisticasSituacao.comSituacao++;
          
          const situacaoStr = String(situacao).trim();
          
          if (situacoesEncontradas.has(situacaoStr)) {
            situacoesEncontradas.set(situacaoStr, situacoesEncontradas.get(situacaoStr) + 1);
          } else {
            situacoesEncontradas.set(situacaoStr, 1);
            exemplosPorSituacao.set(situacaoStr, []);
          }
          
          const exemplos = exemplosPorSituacao.get(situacaoStr);
          if (exemplos.length < 3) {
            exemplos.push(codigo);
          }
        }
      });
      
      console.log(`📊 ESTATÍSTICAS SITUAÇÃO:`);
      console.log(`   Total: ${estatisticasSituacao.total}`);
      console.log(`   Com Situação: ${estatisticasSituacao.comSituacao} (${((estatisticasSituacao.comSituacao/estatisticasSituacao.total)*100).toFixed(1)}%)`);
      console.log(`   Sem Situação: ${estatisticasSituacao.semSituacao} (${((estatisticasSituacao.semSituacao/estatisticasSituacao.total)*100).toFixed(1)}%)`);
      console.log(`   - NULL/Undefined: ${estatisticasSituacao.nullOuUndefined}`);
      console.log(`   - Vazio: ${estatisticasSituacao.vazio}`);
      
      // Mostrar todas as situações encontradas
      const situacoesOrdenadas = Array.from(situacoesEncontradas.entries()).sort((a, b) => b[1] - a[1]);
      
      console.log(`\n🎯 SITUAÇÕES ENCONTRADAS NO BANCO: ${situacoesOrdenadas.length}`);
      situacoesOrdenadas.forEach(([situacao, count], index) => {
        const exemplos = exemplosPorSituacao.get(situacao);
        const percentual = ((count/estatisticasSituacao.comSituacao)*100).toFixed(1);
        console.log(`   ${index + 1}. "${situacao}" → ${count}x (${percentual}%) - Ex: ${exemplos.join(', ')}`);
      });
      
      // Comparar com interface
      console.log(`\n🔍 COMPARAÇÃO COM INTERFACE:`);
      console.log(`   Situações na interface: ${situacoesReais.length}`);
      console.log(`   Situações no banco: ${situacoesEncontradas.size}`);
      
      const situacoesDaInterface = new Set(situacoesReais.map(s => criarChaveNormalizada(s)));
      const situacoesOcultas = [];
      
      situacoesOrdenadas.forEach(([situacao, count]) => {
        const chaveNormalizada = criarChaveNormalizada(situacao);
        if (!situacoesDaInterface.has(chaveNormalizada)) {
          situacoesOcultas.push({ situacao, count });
        }
      });
      
      if (situacoesOcultas.length > 0) {
        console.log(`🚨 SITUAÇÕES OCULTAS NA INTERFACE:`);
        
        let totalOcultos = 0;
        situacoesOcultas.forEach(({situacao, count}, i) => {
          totalOcultos += count;
          const exemplos = exemplosPorSituacao.get(situacao);
          console.log(`   ${i + 1}. "${situacao}" → ${count}x - Ex: ${exemplos.join(', ')}`);
        });
        
        const estimativa = Math.round((5553 * totalOcultos) / estatisticasSituacao.comSituacao);
        console.log(`💡 Estimativa de imóveis ocultos: ${estimativa}`);
        
        if (estimativa >= 50) {
          console.log(`🎯 BINGO! ${estimativa} imóveis ocultos explicam os 57 faltando!`);
          console.log(`🔧 SOLUÇÃO: Adicionar "${situacoesOcultas.map(v => v.situacao).join('", "')}" aos filtros`);
        }
      } else {
        console.log(`✅ Todas as situações do banco estão na interface`);
      }
      
      // Análise de imóveis sem situação
      if (estatisticasSituacao.semSituacao > 0) {
        const estimativaSemSituacao = Math.round((5553 * estatisticasSituacao.semSituacao) / estatisticasSituacao.total);
        console.log(`\n🚨 IMÓVEIS SEM SITUAÇÃO:`);
        console.log(`   Na amostra: ${estatisticasSituacao.semSituacao}`);
        console.log(`   Estimativa total: ${estimativaSemSituacao}`);
        
        if (estimativaSemSituacao >= 50) {
          console.log(`🎯 POSSÍVEL CAUSA DOS 57 IMÓVEIS FALTANDO!`);
          console.log(`💡 SOLUÇÃO: Incluir imóveis com Situação NULL/vazia nos filtros`);
        }
      }
      
    } catch (error) {
      console.error("❌ Erro na investigação completa:", error);
    } finally {
      setInvestigandoSituacoes(false);
    }
    
    console.log("🔬 ===== FIM INVESTIGAÇÃO COMPLETA =====");
  };

  // ✅ MELHORADO: useEffect para situações com lógica mais robusta
  useEffect(() => {
    async function fetchFilterData() {
      try {
        console.log("🚨 ===== DEBUG SITUAÇÃO - VERSÃO ULTRA INCLUSIVA =====");
        
        const [catResponse, cidResponse, sitResponse] = await Promise.all([
          getImoveisByFilters("Categoria"),
          getImoveisByFilters("Cidade"),
          getImoveisByFilters("Situacao")
        ]);

        setCategorias(catResponse.data || []);
        setCidades(cidResponse.data || []);
        
        if (sitResponse?.data && Array.isArray(sitResponse.data) && sitResponse.data.length > 0) {
          const situacoesBrutas = sitResponse.data.filter(s => s && s.toString().trim() !== '');
          
          console.log("📥 [SITUAÇÃO] Situações BRUTAS recebidas do backend:");
          situacoesBrutas.forEach((sit, i) => {
            console.log(`   ${i}: "${sit}" (tipo: ${typeof sit})`);
          });
          
          console.log("🔄 [SITUAÇÃO] Aplicando lógica ULTRA INCLUSIVA...");
          
          const novoMapeamento = {};
          const situacoesParaUI = new Set();
          
          // ✅ NOVO: Criar mapeamento mais robusto com diferentes estratégias de normalização
          situacoesBrutas.forEach((situacaoOriginal, index) => {
            if (situacaoOriginal && situacaoOriginal.toString().trim() !== '') {
              // Estratégia 1: Chave normalizada robusta
              const chaveRobusta = criarChaveNormalizada(situacaoOriginal);
              
              // Estratégia 2: Chave simples (fallback)
              const chaveSimples = situacaoOriginal.toLowerCase().trim();
              
              console.log(`   ${index}: "${situacaoOriginal}" → chave robusta: "${chaveRobusta}" | chave simples: "${chaveSimples}"`);
              
              // Usar a chave robusta como principal
              if (!novoMapeamento[chaveRobusta]) {
                novoMapeamento[chaveRobusta] = [];
                console.log(`     ✅ Nova chave robusta criada: "${chaveRobusta}"`);
              }
              
              if (!novoMapeamento[chaveRobusta].includes(situacaoOriginal)) {
                novoMapeamento[chaveRobusta].push(situacaoOriginal);
                console.log(`     ✅ Situação "${situacaoOriginal}" adicionada à chave robusta "${chaveRobusta}"`);
              }
              
              // ✅ NOVO: Também mapear pela chave simples (para compatibilidade)
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
          
          console.log("📊 [SITUAÇÃO] Mapeamento criado:");
          Object.keys(novoMapeamento).forEach(chave => {
            console.log(`   "${chave}" → [${novoMapeamento[chave].join(', ')}] (${novoMapeamento[chave].length} variações)`);
          });
          
          // ✅ CRIAR SITUAÇÕES PARA UI: Uma por grupo, priorizando versões maiúsculas
          Object.keys(novoMapeamento).forEach(chave => {
            const situacoesGrupo = novoMapeamento[chave];
            
            // Priorizar versões maiúsculas/capitalizadas
            const versaoMaiuscula = situacoesGrupo.find(s => {
              const somenteLetras = s.replace(/[^A-Za-záàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ\s-]/g, '');
              return somenteLetras === somenteLetras.toUpperCase() && s.trim() !== "";
            });
            
            const situacaoParaUI = versaoMaiuscula || capitalizarNomesProprios(situacoesGrupo[0]) || situacoesGrupo[0];
            
            if (situacaoParaUI && !situacoesParaUI.has(situacaoParaUI)) {
              console.log(`   ✅ Adicionando à UI: "${situacaoParaUI}"`);
              situacoesParaUI.add(situacaoParaUI);
            }
          });
          
          const situacoesFinais = Array.from(situacoesParaUI).sort();
          
          console.log("🎨 [SITUAÇÃO] Situações FINAIS para interface:");
          situacoesFinais.forEach((sit, i) => {
            console.log(`   ${i}: "${sit}"`);
          });
          
          console.log("💾 [SITUAÇÃO] Salvando estados...");
          setSituacoesReais(situacoesFinais);
          setSituacoesMapeamento(novoMapeamento);
          
          console.log("🚨 ===== DEBUG SITUAÇÃO - SUCESSO (ULTRA INCLUSIVA) =====");
          
        } else {
          console.log("⚠️ [SITUAÇÃO] Sem dados do backend, usando hardcoded");
          setSituacoesReais(situacaoOptionsHardcoded);
          setSituacoesMapeamento({});
        }

      } catch (error) {
        console.error("❌ [SITUAÇÃO] ERRO:", error);
        setSituacoesReais(situacaoOptionsHardcoded);
        setSituacoesMapeamento({});
      }
    }
    fetchFilterData();
  }, []);

  // ✅ MANTIDO: useEffect para bairros (funcionando corretamente)
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
          
          if (parsedFilters.Situacao) {
            if (Array.isArray(parsedFilters.Situacao)) {
              setSituacoesSelecionadas(parsedFilters.Situacao);
            } else if (typeof parsedFilters.Situacao === 'string') {
              const situacoesArray = parsedFilters.Situacao.split(',').map(s => s.trim());
              setSituacoesSelecionadas(situacoesArray);
            } else {
              setFilters(prev => ({ ...prev, situacao: parsedFilters.Situacao }));
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
        }
      } catch (error) {
        console.error('[FILTERS CACHE] Erro ao restaurar filtros:', error);
      }
    };
    
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

  // Filtrar bairros e situações
  const bairrosFiltrados = bairrosReais.filter((bairro) =>
    bairro.toLowerCase().includes(bairroFilter.toLowerCase())
  );

  const situacoesFiltradas = situacoesReais.filter((situacao) =>
    situacao.toLowerCase().includes(situacaoFilter.toLowerCase())
  );

  // Handlers de manipulação
  const handleBairroChange = (bairro) => {
    setBairrosSelecionados((prev) =>
      prev.includes(bairro) ? prev.filter((b) => b !== bairro) : [...prev, bairro]
    );
  };

  const handleSituacaoChange = (situacao) => {
    setSituacoesSelecionadas((prev) => {
      const isSelected = prev.includes(situacao);
      const newSituacoes = isSelected 
        ? prev.filter((s) => s !== situacao) 
        : [...prev, situacao];
      
      console.log('🔍 [SITUAÇÃO UI] Situação alterada:', situacao);
      console.log('🔍 [SITUAÇÃO UI] Novas situações selecionadas:', newSituacoes);
      
      return newSituacoes;
    });
  };

  // ✅ MELHORADO: Função de normalização ultra robusta
  const normalizarSituacaoParaAPI = (situacoesSelecionadas) => {
    console.log("🔓 ===== SITUAÇÃO API (VERSÃO ULTRA ROBUSTA) =====");
    
    if (!Array.isArray(situacoesSelecionadas) || situacoesSelecionadas.length === 0) {
      console.log('❌ [API SITUAÇÃO] Nenhuma situação selecionada');
      return undefined;
    }

    console.log('📋 [API SITUAÇÃO] Situações selecionadas na UI:', situacoesSelecionadas);
    console.log('📋 [API SITUAÇÃO] Total selecionadas:', situacoesSelecionadas.length);
    
    const todasVariacoesSituacao = [];
    
    situacoesSelecionadas.forEach((situacaoSelecionada, index) => {
      // ✅ NOVO: Usar múltiplas estratégias de chave
      const chaveRobusta = criarChaveNormalizada(situacaoSelecionada);
      const chaveSimples = situacaoSelecionada.toLowerCase().trim();
      
      console.log(`🔍 [API SITUAÇÃO] [${index}] Processando: "${situacaoSelecionada}"`);
      console.log(`   Chave robusta: "${chaveRobusta}"`);
      console.log(`   Chave simples: "${chaveSimples}"`);
      
      let encontrouVariacoes = false;
      
      // Tentar com chave robusta primeiro
      if (situacoesMapeamento[chaveRobusta] && situacoesMapeamento[chaveRobusta].length > 0) {
        console.log(`✅ [API SITUAÇÃO] [${index}] MAPEAMENTO ROBUSTO ENCONTRADO: ${situacoesMapeamento[chaveRobusta].length} variações`);
        console.log(`   Variações: [${situacoesMapeamento[chaveRobusta].join(', ')}]`);
        
        todasVariacoesSituacao.push(...situacoesMapeamento[chaveRobusta]);
        encontrouVariacoes = true;
      }
      
      // Se não encontrou com chave robusta, tentar com chave simples
      if (!encontrouVariacoes && chaveRobusta !== chaveSimples && situacoesMapeamento[chaveSimples] && situacoesMapeamento[chaveSimples].length > 0) {
        console.log(`✅ [API SITUAÇÃO] [${index}] MAPEAMENTO SIMPLES ENCONTRADO: ${situacoesMapeamento[chaveSimples].length} variações`);
        console.log(`   Variações: [${situacoesMapeamento[chaveSimples].join(', ')}]`);
        
        todasVariacoesSituacao.push(...situacoesMapeamento[chaveSimples]);
        encontrouVariacoes = true;
      }
      
      // Se ainda não encontrou, incluir o valor original
      if (!encontrouVariacoes) {
        console.log(`⚠️ [API SITUAÇÃO] [${index}] SEM MAPEAMENTO - incluindo valor original: "${situacaoSelecionada}"`);
        todasVariacoesSituacao.push(situacaoSelecionada);
      }
    });

    // Remover duplicatas mantendo ordem
    const situacoesSemDuplicatas = [...new Set(todasVariacoesSituacao)];
    
    console.log("🎯 [API SITUAÇÃO] RESULTADO ULTRA ROBUSTO:");
    console.log("   Situações na UI:", situacoesSelecionadas.length);
    console.log("   Variações totais encontradas:", todasVariacoesSituacao.length);
    console.log("   Após remoção de duplicatas:", situacoesSemDuplicatas.length);
    console.log("   Multiplicador:", (situacoesSemDuplicatas.length / situacoesSelecionadas.length).toFixed(2), ":1");
    console.log("   Situações finais:", situacoesSemDuplicatas);
    console.log("🔓 ===== SITUAÇÃO API (VERSÃO ULTRA ROBUSTA) - FIM =====");
    
    return situacoesSemDuplicatas;
  };

  // ✅ MANTIDO: Normalizar bairros para API (funcionando)
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

  // handleFilters com debug aprimorado
  const handleFilters = () => {
    console.log("🚨 ================================");
    console.log("🚨 APLICANDO FILTROS - VERSÃO ULTRA ROBUSTA");
    console.log("🚨 ================================");
    
    console.log("📋 [FILTROS] Situações selecionadas na interface:", situacoesSelecionadas);
    console.log("📋 [FILTROS] Total de situações selecionadas:", situacoesSelecionadas.length);
    console.log("📋 [FILTROS] Chaves no mapeamento:", Object.keys(situacoesMapeamento).length);
    
    const situacaoProcessada = normalizarSituacaoParaAPI(situacoesSelecionadas);
    console.log("🧪 [FILTROS] RESULTADO da normalizarSituacaoParaAPI:", situacaoProcessada);
    
    if (situacoesSelecionadas.length > 0 && situacaoProcessada) {
      const multiplicador = situacaoProcessada.length / situacoesSelecionadas.length;
      console.log("📊 [FILTROS] ANÁLISE DE EXPANSÃO:");
      console.log(`   Situações na UI: ${situacoesSelecionadas.length}`);
      console.log(`   Situações para API: ${situacaoProcessada.length}`);
      console.log(`   Fator de expansão: ${multiplicador.toFixed(2)}x`);
      
      if (multiplicador > 2.0) {
        console.log(`💡 [FILTROS] ALTA EXPANSÃO: ${multiplicador.toFixed(2)}x deve recuperar os 57 imóveis faltando!`);
      } else if (multiplicador < 1.5) {
        console.log(`⚠️ [FILTROS] BAIXA EXPANSÃO: ${multiplicador.toFixed(2)}x pode não ser suficiente`);
      }
    }
    
    const filtersToApply = {
      Categoria: filters.categoria || categoriaSelecionada,
      Status: filters.status,
      Situacao: situacaoProcessada || filters.situacao || undefined,
      Ativo: filters.cadastro,
      Cidade: cidadeSelecionada,
      bairros: normalizarBairrosParaAPI(bairrosSelecionados) || undefined,
      ValorMin: valorMin,
      ValorMax: valorMax,
      AreaMin: areaMin,
      AreaMax: areaMax,
    };

    // Remover campos undefined
    const filtersForAPI = {};
    Object.keys(filtersToApply).forEach(key => {
      if (filtersToApply[key] !== undefined && filtersToApply[key] !== null && filtersToApply[key] !== '') {
        filtersForAPI[key] = filtersToApply[key];
      }
    });

    console.log("📤 FILTROS FINAIS ENVIADOS PARA API:");
    console.log(JSON.stringify(filtersForAPI, null, 2));

    if (filtersForAPI.Situacao) {
      console.log("🎯 SITUAÇÃO EXPANDIDA ENVIADA:", filtersForAPI.Situacao);
      console.log("🎯 TOTAL DE VARIAÇÕES:", Array.isArray(filtersForAPI.Situacao) ? filtersForAPI.Situacao.length : 1);
    }

    console.log("🚨 ================================");

    if (onFilter) {
      onFilter(filtersToApply);
    }
  };

  // ✅ MANTIDO: handleClearFilters
  const handleClearFilters = () => {
    console.log("🧹 [CLEAR] Iniciando limpeza completa dos filtros...");
    
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
    setSituacoesMapeamento({});
    setBairrosMapeamento({});

    console.log("🧹 [CLEAR] Limpando cache do localStorage...");
    localStorage.removeItem("admin_appliedFilters");
    localStorage.removeItem("admin_filterResults");
    localStorage.removeItem("admin_filterPagination");
    localStorage.removeItem("admin_searchTerm");
    localStorage.removeItem("admin_searchResults");
    localStorage.removeItem("admin_searchPagination");
    
    console.log("🔄 [CLEAR] Aplicando filtros vazios...");
    if (onFilter) {
      onFilter({});
    }
    
    console.log("✅ [CLEAR] Limpeza completa finalizada!");
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
        
        {/* ✅ DROPDOWN DE SITUAÇÃO ULTRA ROBUSTO */}
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
                      🚀 ULTRA ROBUSTO: {situacoesReais.length} situações ({Object.keys(situacoesMapeamento).length} chaves mapeadas)
                    </div>
                    
                    {situacoesFiltradas.map((situacao, index) => {
                      // Tentar ambas as chaves
                      const chaveRobusta = criarChaveNormalizada(situacao);
                      const chaveSimples = situacao.toLowerCase().trim();
                      const variacoes = situacoesMapeamento[chaveRobusta] || situacoesMapeamento[chaveSimples] || [];
                      
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
                              <span className="text-green-500 text-[8px] font-bold" title={`ULTRA: ${variacoes.length} variações: ${variacoes.join(', ')}`}>
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
        {/* ✅ DROPDOWN DE BAIRROS MANTIDO */}
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
                      Debug: {bairrosReais.length} bairros ({Object.keys(bairrosMapeamento).length} chaves mapeadas)
                    </div>
                    
                    {bairrosFiltrados.map((bairro, index) => {
                      const chave = bairro.toLowerCase().trim();
                      const variacoes = bairrosMapeamento[chave] || [];
                      
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

      {/* 🎯 BOTÕES DE AÇÃO OTIMIZADOS */}
      <div className="flex flex-wrap gap-3 items-center pt-4 border-t">
        <button
          onClick={handleFilters}
          className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
        >
          Aplicar Filtros
        </button>

        <button
          onClick={handleClearFilters}
          className="px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
        >
          Limpar Filtros
        </button>

        {/* 🔬 BOTÃO DE INVESTIGAÇÃO MANTIDO */}
        <button
          onClick={investigarTodosCampos}
          disabled={investigandoSituacoes}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            investigandoSituacoes
              ? 'bg-yellow-300 text-yellow-800 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600'
          }`}
        >
          {investigandoSituacoes ? '🔍 Investigando...' : '🔍 Investigar Todos os Campos'}
        </button>

        {/* 📊 INFORMAÇÕES DE DEBUG ATUALIZADAS */}
        <div className="text-xs text-gray-500 flex items-center gap-4 flex-wrap">
          <span>🎯 Situações: {situacoesReais.length}</span>
          <span>🗂️ Mapeamentos: {Object.keys(situacoesMapeamento).length}</span>
          {situacoesSelecionadas.length > 0 && (
            <span className="text-blue-600 font-medium">
              ✅ {situacoesSelecionadas.length} selecionadas
            </span>
          )}
          <span className="text-red-600 text-[10px]">
            ⚠️ 57 imóveis ainda faltando (5553 - 5496)
          </span>
          <span className="text-green-600 text-[10px] font-bold">
            🚀 VERSÃO ULTRA ROBUSTA
          </span>
        </div>
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
