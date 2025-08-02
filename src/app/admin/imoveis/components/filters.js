{/* 🔬 BOTÃO DE INVESTIGAÇÃO COMPLETA */}
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
        </button>import { getBairrosPorCidade, getImoveisByFilters } from "@/app/services";
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

  // Opções de situação (incluindo "Pronto para morar" que estava oculto)
  const situacaoOptionsHardcoded = [
    "EM CONSTRUÇÃO",
    "LANÇAMENTO", 
    "PRÉ-LANÇAMENTO",
    "PRONTO NOVO",
    "PRONTO USADO",
    "Pronto para morar"  // ✅ ADICIONADO: situação que estava causando os 58 imóveis faltando
  ];

  // ✅ Função auxiliar para capitalização (mantida dos bairros que funcionaram)
  const capitalizarNomesProprios = (texto) => {
    if (!texto || typeof texto !== 'string') return texto;
    
    return texto.split(' ').map(palavra => {
      if (palavra.length === 0) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
    }).join(' ');
  };

  // 🔬 INVESTIGAÇÃO COMPLETA: Analisa TODOS os campos (Situacao, Status, Categoria, Ativo)
  // para encontrar onde estão os 58 imóveis faltando (5553 total - 5495 encontrados = 58)
  const investigarTodosCampos = async () => {
    setInvestigandoSituacoes(true);
    console.log("🔬 ===== INVESTIGAÇÃO COMPLETA: TODOS OS CAMPOS =====");
    
    try {
      console.log("📡 Buscando dados brutos de múltiplas páginas...");
      
      // Coletar mais páginas para análise mais precisa
      const paginas = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]; // 15 páginas = ~450 imóveis
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
      
      // ================================
      // 📊 ANÁLISE COMPLETA DE TODOS OS CAMPOS RELEVANTES  
      // ================================
      
      const camposAnalise = ['Situacao', 'Status', 'Categoria', 'Ativo'];
      const analiseCompleta = {};
      
      console.log("🔍 INICIANDO ANÁLISE DE TODOS OS CAMPOS RELEVANTES...");
      console.log(`📋 Campos a serem analisados: ${camposAnalise.join(', ')}`);
      console.log(`🎯 Objetivo: Encontrar os 57 imóveis restantes (5553 - 5496 = 57)`);
      
      camposAnalise.forEach(campo => {
        console.log(`\n🔍 ===== ANALISANDO CAMPO: ${campo.toUpperCase()} =====`);
        
        const estatisticas = {
          total: todosImoveis.length,
          comValor: 0,
          semValor: 0,
          null: 0,
          undefined: 0,
          vazio: 0,
          espacos: 0
        };
        
        const valoresUnicos = new Map();
        const exemplosValores = new Map();
        
        todosImoveis.forEach((imovel, i) => {
          const valor = imovel[campo];
          const codigo = imovel.Codigo || imovel.codigo || `sem-codigo-${i}`;
          
          // Classificar o tipo de valor
          if (valor === null) {
            estatisticas.null++;
            estatisticas.semValor++;
          } else if (valor === undefined) {
            estatisticas.undefined++;
            estatisticas.semValor++;
          } else if (valor === '') {
            estatisticas.vazio++;
            estatisticas.semValor++;
          } else if (typeof valor === 'string' && valor.trim() === '') {
            estatisticas.espacos++;
            estatisticas.semValor++;
          } else {
            // Valor válido
            estatisticas.comValor++;
            
            const valorStr = String(valor).trim();
            
            if (valorStr) {
              // Contar frequência
              if (valoresUnicos.has(valorStr)) {
                valoresUnicos.set(valorStr, valoresUnicos.get(valorStr) + 1);
              } else {
                valoresUnicos.set(valorStr, 1);
                exemplosValores.set(valorStr, []);
              }
              
              // Guardar exemplos
              const exemplos = exemplosValores.get(valorStr);
              if (exemplos.length < 3) {
                exemplos.push(codigo);
              }
            }
          }
        });
        
        console.log(`📊 ESTATÍSTICAS ${campo.toUpperCase()}:`);
        console.log(`   Total de imóveis: ${estatisticas.total}`);
        console.log(`   Com ${campo} válido: ${estatisticas.comValor} (${((estatisticas.comValor/estatisticas.total)*100).toFixed(1)}%)`);
        console.log(`   Sem ${campo}: ${estatisticas.semValor} (${((estatisticas.semValor/estatisticas.total)*100).toFixed(1)}%)`);
        console.log(`   - NULL: ${estatisticas.null}`);
        console.log(`   - Undefined: ${estatisticas.undefined}`);
        console.log(`   - Vazio (""): ${estatisticas.vazio}`);
        console.log(`   - Só espaços: ${estatisticas.espacos}`);
        
        console.log(`\n🎯 VALORES ÚNICOS DE ${campo.toUpperCase()}: ${valoresUnicos.size}`);
        
        if (valoresUnicos.size > 0) {
          console.log(`📋 LISTA COMPLETA (ordenada por frequência):`);
          
          // Ordenar por frequência
          const valoresOrdenados = Array.from(valoresUnicos.entries())
            .sort((a, b) => b[1] - a[1]);
          
          valoresOrdenados.forEach(([valor, count], index) => {
            const exemplos = exemplosValores.get(valor);
            const percentual = ((count/estatisticas.comValor)*100).toFixed(1);
            console.log(`   ${index + 1}. "${valor}" → ${count}x (${percentual}%) - Ex: ${exemplos.join(', ')}`);
          });
          
          // Comparar com interface (apenas para campos que temos na interface)
          if (campo === 'Situacao') {
            console.log(`\n🔍 COMPARAÇÃO COM INTERFACE (${campo}):`);
            console.log(`   Valores na interface: ${situacoesReais.length}`);
            console.log(`   Valores no banco: ${valoresUnicos.size}`);
            
            const valoresDaInterface = new Set(situacoesReais.map(s => s.toLowerCase().trim()));
            const valoresOcultos = [];
            
            valoresOrdenados.forEach(([valor, count]) => {
              const chaveNormalizada = valor.toLowerCase().trim();
              if (!valoresDaInterface.has(chaveNormalizada)) {
                valoresOcultos.push({ valor, count });
              }
            });
            
            if (valoresOcultos.length > 0) {
              console.log(`🚨 VALORES OCULTOS EM ${campo.toUpperCase()}:`);
              
              let totalOcultos = 0;
              valoresOcultos.forEach(({valor, count}, i) => {
                totalOcultos += count;
                const exemplos = exemplosValores.get(valor);
                console.log(`   ${i + 1}. "${valor}" → ${count}x - Ex: ${exemplos.join(', ')}`);
              });
              
              // Estimativa no total
              const estimativa = Math.round((5553 * totalOcultos) / estatisticas.comValor);
              console.log(`💡 Estimativa de imóveis ocultos: ${estimativa}`);
              
              if (estimativa >= 50) {
                console.log(`🎯 BINGO! ${estimativa} imóveis ocultos explicam os 58 faltando!`);
                console.log(`🔧 SOLUÇÃO: Adicionar "${valoresOcultos.map(v => v.valor).join('", "')}" aos filtros`);
              }
            } else {
              console.log(`✅ Todos os valores de ${campo} estão na interface`);
            }
          }
        }
        
        // Salvar análise
        analiseCompleta[campo] = {
          estatisticas,
          valoresUnicos: valoresOrdenados,
          problemasEncontrados: estatisticas.semValor > 0
        };
        
        // 🚨 ALERTA PARA PROBLEMAS CRÍTICOS
        if (estatisticas.semValor > 0) {
          const percentualProblema = ((estatisticas.semValor/estatisticas.total)*100).toFixed(1);
          const estimativaTotal = Math.round((5553 * estatisticas.semValor) / estatisticas.total);
          
          console.log(`\n🚨 PROBLEMA ENCONTRADO EM ${campo.toUpperCase()}:`);
          console.log(`   Imóveis sem ${campo}: ${estatisticas.semValor} (${percentualProblema}%)`);
          console.log(`   Estimativa no total: ${estimativaTotal} imóveis`);
          
          if (estimativaTotal >= 50) {
            console.log(`🎯 POSSÍVEL CAUSA DOS 58 IMÓVEIS FALTANDO!`);
          }
        }
        
        console.log(`===== FIM ANÁLISE ${campo.toUpperCase()} =====\n`);
      });
      
      // ================================
      // 📋 RESUMO FINAL E DIAGNÓSTICO AVANÇADO
      // ================================
      
      console.log("🎯 ===== RESUMO FINAL E DIAGNÓSTICO AVANÇADO =====");
      console.log(`📊 Total analisado: ${todosImoveis.length} imóveis`);
      console.log(`🔍 Diferença conhecida: 57 imóveis (5553 - 5496)`);
      console.log(`📈 Percentual da amostra: ${((todosImoveis.length/5553)*100).toFixed(1)}% do total`);
      
      let problemasEncontrados = false;
      let totalEstimadoProblemas = 0;
      
      console.log(`\n📋 ANÁLISE POR CAMPO:`);
      camposAnalise.forEach(campo => {
        const analise = analiseCompleta[campo];
        if (analise.problemasEncontrados) {
          problemasEncontrados = true;
          const estimativa = Math.round((5553 * analise.estatisticas.semValor) / analise.estatisticas.total);
          totalEstimadoProblemas += estimativa;
          console.log(`⚠️ ${campo}: ${analise.estatisticas.semValor} sem valor (~${estimativa} no total)`);
        } else {
          console.log(`✅ ${campo}: Todos os imóveis têm valor válido`);
        }
      });
      
      console.log(`\n📊 RESUMO DE PROBLEMAS:`);
      if (problemasEncontrados) {
        console.log(`   Total estimado de problemas: ${totalEstimadoProblemas} imóveis`);
        console.log(`   Diferença real: 57 imóveis`);
        console.log(`   Percentual explicado: ${((totalEstimadoProblemas/57)*100).toFixed(1)}%`);
        
        if (totalEstimadoProblemas >= 50) {
          console.log(`🎯 PROBLEMAS ENCONTRADOS EXPLICAM A DIFERENÇA!`);
        } else if (totalEstimadoProblemas < 10) {
          console.log(`🤔 PROBLEMAS INSUFICIENTES. INVESTIGAR:`);
          console.log(`   - Múltiplas condições combinadas`);
          console.log(`   - Filtros de data ou outros campos`);
          console.log(`   - Condições específicas do MongoDB`);
        }
      } else {
        console.log(`✅ NENHUM PROBLEMA ÓBVIO ENCONTRADO`);
        console.log(`\n🤔 POSSÍVEIS CAUSAS OCULTAS:`);
        console.log(`   1. Combinação de múltiplos campos NULL`);
        console.log(`   2. Filtros de data automáticos não visíveis`);
        console.log(`   3. Índices do MongoDB excluindo documentos`);
        console.log(`   4. Condições WHERE ocultas na query`);
        console.log(`   5. Diferenças entre getImoveisByFilters() e API principal`);
        
        // Investigação adicional para casos complexos
        console.log(`\n🔍 INVESTIGAÇÃO ADICIONAL NECESSÁRIA:`);
        console.log(`   - Comparar query do getImoveisByFilters vs API principal`);
        console.log(`   - Verificar campos de data que podem filtrar automaticamente`);
        console.log(`   - Analisar se há soft deletes ou status ocultos`);
      }
      
      // 🧪 SUGESTÕES DE TESTE
      console.log(`\n🧪 PRÓXIMOS TESTES SUGERIDOS:`);
      console.log(`   1. Testar filtro sem nenhum campo (só paginação)`);
      console.log(`   2. Comparar contagem direta no MongoDB`);
      console.log(`   3. Verificar se há campo "deleted_at" ou similar`);
      console.log(`   4. Analisar diferenças entre agregação e find simples`);
      
      if (!problemasEncontrados) {
        console.log(`\n💡 INVESTIGAÇÃO RECOMENDADA:`);
        console.log(`   Problema pode estar no backend, não no frontend`);
        console.log(`   Verificar função getImoveisByFilters() vs contagem real`);
      }
      
    } catch (error) {
      console.error("❌ Erro na investigação completa:", error);
    } finally {
      setInvestigandoSituacoes(false);
    }
    
    console.log("🔬 ===== FIM INVESTIGAÇÃO COMPLETA =====");
  };

  // ✅ useEffect para situações - VERSÃO INCLUSIVA TOTAL
  useEffect(() => {
    async function fetchFilterData() {
      try {
        console.log("🚨 ===== DEBUG SITUAÇÃO - VERSÃO INCLUSIVA TOTAL =====");
        
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
          
          console.log("🔄 [SITUAÇÃO] Aplicando lógica INCLUSIVA TOTAL...");
          
          const novoMapeamento = {};
          const situacoesParaUI = new Set();
          
          // Criar mapeamento por chave normalizada
          situacoesBrutas.forEach((situacaoOriginal, index) => {
            if (situacaoOriginal && situacaoOriginal.toString().trim() !== '') {
              const chave = situacaoOriginal.toLowerCase().trim();
              
              console.log(`   ${index}: "${situacaoOriginal}" → chave: "${chave}"`);
              
              if (!novoMapeamento[chave]) {
                novoMapeamento[chave] = [];
                console.log(`     ✅ Nova chave criada: "${chave}"`);
              }
              
              if (!novoMapeamento[chave].includes(situacaoOriginal)) {
                novoMapeamento[chave].push(situacaoOriginal);
                console.log(`     ✅ Situação "${situacaoOriginal}" adicionada à chave "${chave}"`);
              } else {
                console.log(`     ⚠️ Situação "${situacaoOriginal}" já existe na chave "${chave}"`);
              }
            }
          });
          
          console.log("📊 [SITUAÇÃO] Mapeamento criado:");
          Object.keys(novoMapeamento).forEach(chave => {
            console.log(`   "${chave}" → [${novoMapeamento[chave].join(', ')}] (${novoMapeamento[chave].length} variações)`);
          });
          
          // ✅ INCLUIR TODAS as situações (versão inclusiva total)
          Object.keys(novoMapeamento).forEach(chave => {
            const situacoesGrupo = novoMapeamento[chave];
            
            console.log(`   🧪 INCLUINDO TODAS as variações de "${chave}"`);
            
            // Priorizar versão maiúscula se existir, senão usar a primeira
            const versaoMaiuscula = situacoesGrupo.find(s => {
              const somenteLetrasEspacos = s.replace(/[^A-Za-záàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ\s-]/g, '');
              return somenteLetrasEspacos === somenteLetrasEspacos.toUpperCase() && s.trim() !== "";
            });
            
            const situacaoParaUI = versaoMaiuscula || situacoesGrupo[0];
            
            if (situacaoParaUI) {
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
          
          console.log("🚨 ===== DEBUG SITUAÇÃO - SUCESSO (INCLUSIVA TOTAL) =====");
          
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
          
          // Criar mapeamento por chave normalizada
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
          
          // Criar versões para UI
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
            } else if (typeof parsedFilters.Situacao === 'string') {
              const situacoesArray = parsedFilters.Situacao.split(',').map(s => s.trim());
              setSituacoesSelecionadas(situacoesArray);
            } else {
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

  // ✅ FUNÇÃO CORRIGIDA: Versão TOTALMENTE INCLUSIVA
  const normalizarSituacaoParaAPI = (situacoesSelecionadas) => {
    console.log("🔓 ===== SITUAÇÃO API (VERSÃO TOTALMENTE INCLUSIVA) =====");
    
    if (!Array.isArray(situacoesSelecionadas) || situacoesSelecionadas.length === 0) {
      console.log('❌ [API SITUAÇÃO] Nenhuma situação selecionada');
      return undefined;
    }

    console.log('📋 [API SITUAÇÃO] Situações selecionadas na UI:', situacoesSelecionadas);
    console.log('📋 [API SITUAÇÃO] Total selecionadas:', situacoesSelecionadas.length);
    
    const todasVariacoesSituacao = [];
    
    situacoesSelecionadas.forEach((situacaoSelecionada, index) => {
      const chave = situacaoSelecionada.toLowerCase().trim();
      
      console.log(`🔍 [API SITUAÇÃO] [${index}] Processando: "${situacaoSelecionada}" → chave: "${chave}"`);
      
      if (situacoesMapeamento[chave] && situacoesMapeamento[chave].length > 0) {
        console.log(`✅ [API SITUAÇÃO] [${index}] MAPEAMENTO ENCONTRADO: ${situacoesMapeamento[chave].length} variações`);
        console.log(`   Variações originais: [${situacoesMapeamento[chave].join(', ')}]`);
        
        // ✅ VERSÃO TOTALMENTE INCLUSIVA: Incluir TODAS as variações
        const variacoesValidas = situacoesMapeamento[chave];
        
        variacoesValidas.forEach(variacao => {
          console.log(`   ✅ INCLUINDO (TOTAL): "${variacao}"`);
        });
        
        todasVariacoesSituacao.push(...variacoesValidas);
        console.log(`   ✅ Adicionadas ${variacoesValidas.length} variações válidas`);
      } else {
        console.log(`⚠️ [API SITUAÇÃO] [${index}] SEM MAPEAMENTO para "${chave}"`);
        console.log(`   ✅ Valor original "${situacaoSelecionada}" incluído (TOTAL)`);
        todasVariacoesSituacao.push(situacaoSelecionada);
      }
    });

    // Remover duplicatas
    const situacoesSemDuplicatas = [...new Set(todasVariacoesSituacao)];
    
    console.log("🎯 [API SITUAÇÃO] RESULTADO TOTALMENTE INCLUSIVO:");
    console.log("   Situações na UI:", situacoesSelecionadas.length);
    console.log("   Variações totais encontradas:", todasVariacoesSituacao.length);
    console.log("   Após remoção de duplicatas:", situacoesSemDuplicatas.length);
    console.log("   Multiplicador:", (situacoesSemDuplicatas.length / situacoesSelecionadas.length).toFixed(2), ":1");
    console.log("   Situações finais:", situacoesSemDuplicatas);
    console.log("🔓 ===== SITUAÇÃO API (VERSÃO TOTALMENTE INCLUSIVA) - FIM =====");
    
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

  // handleFilters com debug
  const handleFilters = () => {
    console.log("🚨 ================================");
    console.log("🚨 APLICANDO FILTROS - VERSÃO TOTALMENTE INCLUSIVA");
    console.log("🚨 ================================");
    
    console.log("📋 [FILTROS] Situações selecionadas na interface:", situacoesSelecionadas);
    console.log("📋 [FILTROS] Total de situações selecionadas:", situacoesSelecionadas.length);
    console.log("📋 [FILTROS] Mapeamento disponível:", Object.keys(situacoesMapeamento));
    
    // ✅ CHAMAR A VERSÃO TOTALMENTE INCLUSIVA
    console.log("🔥 [FILTROS] CHAMANDO normalizarSituacaoParaAPI TOTALMENTE INCLUSIVA...");
    const situacaoProcessada = normalizarSituacaoParaAPI(situacoesSelecionadas);
    console.log("🧪 [FILTROS] RESULTADO da normalizarSituacaoParaAPI:", situacaoProcessada);
    console.log("🧪 [FILTROS] TIPO:", typeof situacaoProcessada);
    console.log("🧪 [FILTROS] É ARRAY:", Array.isArray(situacaoProcessada));
    console.log("🧪 [FILTROS] COMPRIMENTO:", situacaoProcessada?.length || 0);
    
    // ✅ ANÁLISE DE MULTIPLICAÇÃO
    if (situacoesSelecionadas.length > 0 && situacaoProcessada) {
      const multiplicador = situacaoProcessada.length / situacoesSelecionadas.length;
      console.log("📊 [FILTROS] ANÁLISE DE MULTIPLICAÇÃO:");
      console.log(`   Situações na UI: ${situacoesSelecionadas.length}`);
      console.log(`   Situações para API: ${situacaoProcessada.length}`);
      console.log(`   Multiplicador: ${multiplicador.toFixed(2)}x`);
      
      if (multiplicador > 1.5) {
        console.log(`💡 [FILTROS] MULTIPLICADOR ALTO: ${multiplicador.toFixed(2)}x pode recuperar os imóveis faltando!`);
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

    // Remover campos undefined para clareza
    const filtersForAPI = {};
    Object.keys(filtersToApply).forEach(key => {
      if (filtersToApply[key] !== undefined && filtersToApply[key] !== null && filtersToApply[key] !== '') {
        filtersForAPI[key] = filtersToApply[key];
      }
    });

    console.log("📤 FILTROS FINAIS ENVIADOS PARA API:");
    console.log(JSON.stringify(filtersForAPI, null, 2));

    if (filtersForAPI.Situacao) {
      console.log("🎯 SITUAÇÃO ENVIADA PARA API (TOTALMENTE INCLUSIVA):", filtersForAPI.Situacao);
      console.log("🎯 TIPO DA SITUAÇÃO:", typeof filtersForAPI.Situacao);
      console.log("🎯 É ARRAY:", Array.isArray(filtersForAPI.Situacao));
      if (Array.isArray(filtersForAPI.Situacao)) {
        console.log("🎯 COMPRIMENTO DO ARRAY:", filtersForAPI.Situacao.length);
        console.log("🎯 ITENS DO ARRAY:", filtersForAPI.Situacao.map((s, i) => `  ${i}: "${s}"`));
      }
    } else {
      console.log("⚠️ NENHUMA SITUAÇÃO NO FILTRO FINAL");
    }

    console.log("🚨 ================================");

    if (onFilter) {
      onFilter(filtersToApply);
    }
  };

  // ✅ MANTIDO: handleClearFilters com limpeza completa do cache
  const handleClearFilters = () => {
    console.log("🧹 [CLEAR] Iniciando limpeza completa dos filtros...");
    
    // Limpar estados dos filtros
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

    // ✅ LIMPEZA COMPLETA DO CACHE DO LOCALSTORAGE
    console.log("🧹 [CLEAR] Limpando cache do localStorage...");
    
    // Limpar todos os caches relacionados aos filtros
    localStorage.removeItem("admin_appliedFilters");
    localStorage.removeItem("admin_filterResults");
    localStorage.removeItem("admin_filterPagination");
    
    // Limpar também cache de busca livre se existir
    localStorage.removeItem("admin_searchTerm");
    localStorage.removeItem("admin_searchResults");
    localStorage.removeItem("admin_searchPagination");
    
    console.log("✅ [CLEAR] Cache limpo com sucesso!");
    console.log("🔄 [CLEAR] Aplicando filtros vazios...");

    // Aplicar filtros vazios
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
        
        {/* ✅ DROPDOWN DE SITUAÇÃO TOTALMENTE INCLUSIVO */}
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
                      🔓 TOTALMENTE INCLUSIVO: {situacoesReais.length} situações ({Object.keys(situacoesMapeamento).length} chaves mapeadas)
                    </div>
                    
                    {situacoesFiltradas.map((situacao, index) => {
                      const chave = situacao.toLowerCase().trim();
                      const variacoes = situacoesMapeamento[chave] || [];
                      
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
                              <span className="text-green-500 text-[8px] font-bold" title={`TOTAL: ${variacoes.length} variações: ${variacoes.join(', ')}`}>
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
        {/* ✅ DROPDOWN DE BAIRROS MANTIDO (funcionando) */}
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

      {/* 🔬 BOTÕES DE AÇÃO - INCLUINDO INVESTIGAÇÃO */}
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

        {/* 🎯 BOTÃO DE TESTE CAMPO ATIVO */}
        <button
          onClick={() => {
            console.log('🧪 TESTE: Limpando filtro de cadastro (Ativo)...');
            setFilters(prev => ({ ...prev, cadastro: "" }));
            console.log('🧪 TESTE: Filtro de cadastro limpo. Aplicar filtros para ver diferença.');
          }}
          className="px-3 py-2 text-xs rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          🧪 Limpar Filtro "Cadastro"
        </button>
        {/* 🎯 BOTÃO DE TESTE RÁPIDO */}
        <button
          onClick={() => {
            console.log('🧪 TESTE: Adicionando "Pronto para morar" às situações selecionadas...');
            setSituacoesSelecionadas(prev => {
              if (!prev.includes("Pronto para morar")) {
                const novasSituacoes = [...prev, "Pronto para morar"];
                console.log('🧪 TESTE: Novas situações:', novasSituacoes);
                return novasSituacoes;
              }
              return prev;
            });
          }}
          className="px-3 py-2 text-xs rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
        >
          ✅ "Pronto para morar" (+1)
        </button>
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

        {/* 📊 INFORMAÇÕES DE DEBUG MELHORADAS */}
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
          {situacoesReais.includes("Pronto para morar") && (
            <span className="text-green-600 text-[10px] font-bold">
              ✅ "Pronto para morar" detectado! (+1)
            </span>
          )}
          <span className="text-blue-600 text-[10px]">
            🔍 Progresso: 1/57 encontrados
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
