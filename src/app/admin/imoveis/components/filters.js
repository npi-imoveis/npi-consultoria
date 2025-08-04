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

  // Estados para armazenar mapeamentos localmente
  const [situacoesMapeamento, setSituacoesMapeamento] = useState({});
  const [bairrosMapeamento, setBairrosMapeamento] = useState({});

  // Estado para investigação completa
  const [investigandoSituacoes, setInvestigandoSituacoes] = useState(false);

  // 🎯 NOVO: Estado para busca dos 57 imóveis
  const [buscandoImoveis57, setBuscandoImoveis57] = useState(false);

  // Opções de situação hardcoded (sem "Pronto para morar")
  const situacaoOptionsHardcoded = [
    "EM CONSTRUÇÃO",
    "LANÇAMENTO", 
    "PRÉ-LANÇAMENTO",
    "PRONTO NOVO",
    "PRONTO USADO"
  ];

  // Função auxiliar para capitalização
  const capitalizarNomesProprios = (texto) => {
    if (!texto || typeof texto !== 'string') return texto;
    
    return texto.split(' ').map(palavra => {
      if (palavra.length === 0) return palavra;
      return palavra.charAt(0).toUpperCase() + palavra.slice(1).toLowerCase();
    }).join(' ');
  };

  // Função de normalização robusta
  const criarChaveNormalizada = (situacao) => {
    if (!situacao || typeof situacao !== 'string') return '';
    
    return situacao
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

  // 🎯 NOVA FUNÇÃO: Encontrar os 57 imóveis sem situação - VERSÃO DEFINITIVA
  const encontrarOs57ImoveisPerdidos = async () => {
    setBuscandoImoveis57(true);
    console.log('🎯 ===== MISSÃO DEFINITIVA: ENCONTRAR OS 57 IMÓVEIS PERDIDOS =====');
    
    try {
      let todosImoveis = [];
      let pagina = 1;
      const LIMITE_POR_PAGINA = 100;
      
      console.log('📡 Fase 1: Coletando TODOS os imóveis da base (sem filtros)...');
      
      // Buscar TODOS os imóveis sem nenhum filtro
      while (true) {
        try {
          console.log(`📄 Carregando página ${pagina}...`);
          
          const response = await fetch(`/api/admin/imoveis?page=${pagina}&limit=${LIMITE_POR_PAGINA}`);
          const dados = await response.json();
          
          if (dados?.data && Array.isArray(dados.data) && dados.data.length > 0) {
            todosImoveis.push(...dados.data);
            console.log(`   ✅ Página ${pagina}: ${dados.data.length} imóveis (Total acumulado: ${todosImoveis.length})`);
            
            // Se retornou menos que o limite, chegamos ao fim
            if (dados.data.length < LIMITE_POR_PAGINA) {
              console.log(`   🏁 Última página detectada (${dados.data.length} < ${LIMITE_POR_PAGINA})`);
              break;
            }
            
            pagina++;
            
            // Segurança: máximo 100 páginas
            if (pagina > 100) {
              console.log('⚠️ Limite de segurança atingido (100 páginas)');
              break;
            }
            
          } else {
            console.log(`   🏁 Sem mais dados na página ${pagina}`);
            break;
          }
          
        } catch (error) {
          console.error(`❌ Erro na página ${pagina}:`, error);
          break;
        }
      }
      
      console.log(`📊 TOTAL COLETADO: ${todosImoveis.length} imóveis`);
      
      if (todosImoveis.length === 0) {
        console.error('❌ ERRO CRÍTICO: Nenhum imóvel foi coletado da API');
        return;
      }
      
      // Verificar se bate com os 5553 esperados
      if (todosImoveis.length === 5553) {
        console.log('✅ PERFEITO: Coletados exatamente os 5553 imóveis esperados!');
      } else if (todosImoveis.length > 5553) {
        console.log(`⚠️ ATENÇÃO: Coletados ${todosImoveis.length} imóveis (${todosImoveis.length - 5553} a mais que esperado)`);
      } else {
        console.log(`⚠️ ATENÇÃO: Coletados apenas ${todosImoveis.length} imóveis (faltam ${5553 - todosImoveis.length})`);
      }
      
      console.log('🔍 Fase 2: Analisando campo SITUAÇÃO em busca dos problemáticos...');
      
      const imoveisSemSituacao = [];
      const estatisticas = {
        total: todosImoveis.length,
        comSituacao: 0,
        semSituacao: 0,
        casos: {
          null: 0,
          undefined: 0,
          stringVazia: 0,
          apenasEspacos: 0,
          tipoIncorreto: 0
        }
      };
      
      todosImoveis.forEach((imovel, index) => {
        const situacao = imovel.Situacao;
        const codigo = imovel.Codigo || imovel.codigo || `ERRO-SEM-CODIGO-${index}`;
        
        let temSituacaoValida = true;
        let tipoProblemaSituacao = '';
        
        // Verificar todos os casos problemáticos
        if (situacao === null) {
          temSituacaoValida = false;
          tipoProblemaSituacao = 'NULL';
          estatisticas.casos.null++;
        } else if (situacao === undefined) {
          temSituacaoValida = false;
          tipoProblemaSituacao = 'UNDEFINED';
          estatisticas.casos.undefined++;
        } else if (situacao === '') {
          temSituacaoValida = false;
          tipoProblemaSituacao = 'STRING_VAZIA';
          estatisticas.casos.stringVazia++;
        } else if (typeof situacao === 'string' && situacao.trim() === '') {
          temSituacaoValida = false;
          tipoProblemaSituacao = 'APENAS_ESPACOS';
          estatisticas.casos.apenasEspacos++;
        } else if (typeof situacao !== 'string') {
          temSituacaoValida = false;
          tipoProblemaSituacao = `TIPO_INCORRETO_${typeof situacao}`;
          estatisticas.casos.tipoIncorreto++;
        }
        
        if (temSituacaoValida) {
          estatisticas.comSituacao++;
        } else {
          estatisticas.semSituacao++;
          
          imoveisSemSituacao.push({
            codigo: codigo,
            situacao: situacao,
            tipoProblemaSituacao: tipoProblemaSituacao,
            categoria: imovel.Categoria || 'N/A',
            cidade: imovel.Cidade || 'N/A',
            status: imovel.Status || 'N/A',
            bairro: imovel.Bairro || 'N/A',
            valor: imovel.Valor || 'N/A',
            area: imovel.Area || 'N/A'
          });
        }
      });
      
      console.log('🎯 ===== RESULTADOS DA ANÁLISE =====');
      console.log(`📊 Total de imóveis analisados: ${estatisticas.total}`);
      console.log(`✅ Com situação válida: ${estatisticas.comSituacao} (${((estatisticas.comSituacao/estatisticas.total)*100).toFixed(2)}%)`);
      console.log(`❌ SEM situação válida: ${estatisticas.semSituacao} (${((estatisticas.semSituacao/estatisticas.total)*100).toFixed(2)}%)`);
      
      console.log(`\n📋 DETALHAMENTO DOS PROBLEMAS ENCONTRADOS:`);
      console.log(`   🔴 NULL: ${estatisticas.casos.null} imóveis`);
      console.log(`   🔴 UNDEFINED: ${estatisticas.casos.undefined} imóveis`);
      console.log(`   🔴 STRING VAZIA (""): ${estatisticas.casos.stringVazia} imóveis`);
      console.log(`   🔴 APENAS ESPAÇOS: ${estatisticas.casos.apenasEspacos} imóveis`);
      console.log(`   🔴 TIPO INCORRETO: ${estatisticas.casos.tipoIncorreto} imóveis`);
      
      // MOMENTO DA VERDADE!
      console.log(`\n🎯 ===== MOMENTO DA VERDADE =====`);
      console.log(`🔢 ESPERADO: 57 imóveis sem situação (baseado na diferença 5553 - 5496)`);
      console.log(`🔢 ENCONTRADO: ${estatisticas.semSituacao} imóveis sem situação`);
      
      if (estatisticas.semSituacao === 57) {
        console.log(`✅ 🎉 BINGO ABSOLUTO! Encontramos exatamente os 57 imóveis problemáticos!`);
        console.log(`🎯 Esta É a causa dos imóveis perdidos nos filtros!`);
      } else if (estatisticas.semSituacao > 57) {
        console.log(`⚠️ Encontramos ${estatisticas.semSituacao - 57} imóveis a mais que o esperado`);
        console.log(`💡 Pode haver casos adicionais não contabilizados`);
      } else {
        console.log(`🤔 Encontramos ${57 - estatisticas.semSituacao} imóveis a menos que o esperado`);
        console.log(`💡 Pode haver outros problemas além da falta de situação`);
      }
      
      if (imoveisSemSituacao.length > 0) {
        console.log(`\n🚨 ===== CÓDIGOS DOS IMÓVEIS SEM SITUAÇÃO =====`);
        console.log('═'.repeat(100));
        
        // Agrupar por tipo de problema para melhor visualização
        const porTipoProblema = {};
        imoveisSemSituacao.forEach(imovel => {
          if (!porTipoProblema[imovel.tipoProblemaSituacao]) {
            porTipoProblema[imovel.tipoProblemaSituacao] = [];
          }
          porTipoProblema[imovel.tipoProblemaSituacao].push(imovel);
        });
        
        Object.keys(porTipoProblema).forEach(tipo => {
          const imoveis = porTipoProblema[tipo];
          console.log(`\n🔴 ${tipo} (${imoveis.length} imóveis):`);
          
          imoveis.forEach((imovel, i) => {
            console.log(`   ${i + 1}. ${imovel.codigo} | ${imovel.categoria} | ${imovel.cidade} | ${imovel.status} | R$ ${imovel.valor} | ${imovel.area}m²`);
          });
          
          const codigos = imoveis.map(i => i.codigo);
          console.log(`   📋 CÓDIGOS ${tipo}: ${codigos.join(', ')}`);
        });
        
        // LISTA FINAL PARA CORREÇÃO MANUAL
        console.log(`\n🎯 ===== LISTA FINAL PARA CORREÇÃO MANUAL =====`);
        console.log('═'.repeat(100));
        
        const todosCodigosProblemáticos = imoveisSemSituacao.map(i => i.codigo);
        console.log(`📋 TOTAL DE CÓDIGOS PROBLEMÁTICOS: ${todosCodigosProblemáticos.length}`);
        console.log(`📋 CÓDIGOS COMPLETOS: ${todosCodigosProblemáticos.join(', ')}`);
        
        // COMANDOS SQL PARA CORREÇÃO
        console.log(`\n💾 ===== COMANDOS SQL PARA CORREÇÃO =====`);
        console.log('═'.repeat(100));
        
        // Opção 1: Definir como 'PRONTO USADO' (mais comum para imóveis sem situação)
        console.log('-- OPÇÃO 1: Definir todos como PRONTO USADO (recomendado)');
        console.log(`UPDATE imoveis SET Situacao = 'PRONTO USADO' WHERE Codigo IN ('${todosCodigosProblemáticos.join("', '")}');`);
        
        // Opção 2: Definir como 'SEM SITUAÇÃO' para identificação posterior
        console.log('\n-- OPÇÃO 2: Marcar temporariamente como SEM SITUAÇÃO');
        console.log(`UPDATE imoveis SET Situacao = 'SEM SITUAÇÃO' WHERE Codigo IN ('${todosCodigosProblemáticos.join("', '")}');`);
        
        // Opção 3: Comandos individuais por tipo de problema
        console.log('\n-- OPÇÃO 3: Comandos específicos por tipo de problema:');
        Object.keys(porTipoProblema).forEach(tipo => {
          const codigos = porTipoProblema[tipo].map(i => i.codigo);
          console.log(`-- ${tipo} (${codigos.length} imóveis):`);
          console.log(`UPDATE imoveis SET Situacao = 'PRONTO USADO' WHERE Codigo IN ('${codigos.join("', '")}');`);
        });
        
        // Estatísticas por categoria/cidade para definir melhor estratégia
        console.log(`\n📊 ===== ANÁLISE ESTRATÉGICA PARA MELHOR CORREÇÃO =====`);
        
        const porCategoria = {};
        const porCidade = {};
        const porStatus = {};
        
        imoveisSemSituacao.forEach(imovel => {
          // Por categoria
          if (!porCategoria[imovel.categoria]) {
            porCategoria[imovel.categoria] = 0;
          }
          porCategoria[imovel.categoria]++;
          
          // Por cidade
          if (!porCidade[imovel.cidade]) {
            porCidade[imovel.cidade] = 0;
          }
          porCidade[imovel.cidade]++;
          
          // Por status
          if (!porStatus[imovel.status]) {
            porStatus[imovel.status] = 0;
          }
          porStatus[imovel.status]++;
        });
        
        console.log('📊 Distribuição por CATEGORIA:');
        Object.entries(porCategoria)
          .sort(([,a], [,b]) => b - a)
          .forEach(([categoria, count]) => {
            const percentual = ((count / imoveisSemSituacao.length) * 100).toFixed(1);
            console.log(`   ${categoria}: ${count} imóveis (${percentual}%)`);
          });
        
        console.log('\n📊 Distribuição por CIDADE:');
        Object.entries(porCidade)
          .sort(([,a], [,b]) => b - a)
          .forEach(([cidade, count]) => {
            const percentual = ((count / imoveisSemSituacao.length) * 100).toFixed(1);
            console.log(`   ${cidade}: ${count} imóveis (${percentual}%)`);
          });
        
        console.log('\n📊 Distribuição por STATUS:');
        Object.entries(porStatus)
          .sort(([,a], [,b]) => b - a)
          .forEach(([status, count]) => {
            const percentual = ((count / imoveisSemSituacao.length) * 100).toFixed(1);
            console.log(`   ${status}: ${count} imóveis (${percentual}%)`);
          });
        
        // Tentar copiar para clipboard
        console.log(`\n📋 ===== TENTANDO COPIAR PARA CLIPBOARD =====`);
        try {
          const textoParaCopiar = `CÓDIGOS DOS ${imoveisSemSituacao.length} IMÓVEIS SEM SITUAÇÃO:\n${todosCodigosProblemáticos.join(', ')}`;
          
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(textoParaCopiar);
            console.log('✅ Lista de códigos copiada para clipboard com sucesso!');
          } else {
            console.log('⚠️ Clipboard API não disponível - copie manualmente do console');
          }
        } catch (error) {
          console.log('❌ Erro ao copiar para clipboard:', error.message);
          console.log('💡 Copie manualmente a lista de códigos acima');
        }
        
        // Retornar dados para uso programático se necessário
        return {
          total: estatisticas.total,
          comSituacao: estatisticas.comSituacao,
          semSituacao: estatisticas.semSituacao,
          codigos: todosCodigosProblemáticos,
          detalhes: imoveisSemSituacao,
          porTipo: porTipoProblema,
          porCategoria,
          porCidade,
          porStatus
        };
        
      } else {
        console.log(`\n✅ SURPREENDENTE: Nenhum imóvel sem situação encontrado!`);
        console.log(`🤔 Isso significa que o problema dos 57 imóveis deve estar em outro lugar:`);
        console.log(`   1. Filtros ocultos no backend`);
        console.log(`   2. Lógica de agregação/agrupamento`);
        console.log(`   3. Problemas em outros campos (não só Situação)`);
        console.log(`   4. Cache ou sincronização de dados`);
        
        return {
          total: estatisticas.total,
          comSituacao: estatisticas.comSituacao,
          semSituacao: 0,
          codigos: [],
          observacao: 'Nenhum problema de situação encontrado'
        };
      }
      
    } catch (error) {
      console.error('❌ ERRO CRÍTICO na análise:', error);
      console.error('Stack trace:', error.stack);
    } finally {
      setBuscandoImoveis57(false);
    }
    
    console.log('🎯 ===== FIM DA MISSÃO: ENCONTRAR OS 57 IMÓVEIS PERDIDOS =====');
  };

  // Investigação completa
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
      
      const situacoesOrdenadas = Array.from(situacoesEncontradas.entries()).sort((a, b) => b[1] - a[1]);
      
      console.log(`\n🎯 SITUAÇÕES ENCONTRADAS NO BANCO: ${situacoesOrdenadas.length}`);
      situacoesOrdenadas.forEach(([situacao, count], index) => {
        const exemplos = exemplosPorSituacao.get(situacao);
        const percentual = ((count/estatisticasSituacao.comSituacao)*100).toFixed(1);
        console.log(`   ${index + 1}. "${situacao}" → ${count}x (${percentual}%) - Ex: ${exemplos.join(', ')}`);
      });
      
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
        situacoesOcultas.forEach(({situacao, count}) => {
          totalOcultos += count;
          const exemplos = exemplosPorSituacao.get(situacao);
          console.log(`   "${situacao}" → ${count}x - Ex: ${exemplos.join(', ')}`);
        });
        
        const estimativa = Math.round((5553 * totalOcultos) / estatisticasSituacao.comSituacao);
        console.log(`💡 Estimativa de imóveis ocultos: ${estimativa}`);
        
        if (estimativa >= 50) {
          console.log(`🎯 BINGO! ${estimativa} imóveis ocultos explicam os 57 perdidos!`);
        }
      } else {
        console.log(`✅ Todas as situações do banco estão na interface`);
      }
      
    } catch (error) {
      console.error("❌ Erro na investigação completa:", error);
    } finally {
      setInvestigandoSituacoes(false);
    }
    
    console.log("🔬 ===== FIM INVESTIGAÇÃO COMPLETA =====");
  };

  // useEffect para situações
  useEffect(() => {
    async function fetchFilterData() {
      try {
        console.log("🚨 ===== DEBUG SITUAÇÃO - VERSÃO ULTRA INCLUSIVA =====");
        console.log("🔄 Iniciando chamadas para getImoveisByFilters...");
        
        console.log("📡 Chamando getImoveisByFilters('Categoria')...");
        const catResponse = await getImoveisByFilters("Categoria");
        console.log("📡 Categoria response:", catResponse);
        
        console.log("📡 Chamando getImoveisByFilters('Cidade')...");
        const cidResponse = await getImoveisByFilters("Cidade");
        console.log("📡 Cidade response:", cidResponse);
        
        console.log("📡 Chamando getImoveisByFilters('Situacao')...");
        const sitResponse = await getImoveisByFilters("Situacao");
        console.log("📡 SITUAÇÃO response completa:", sitResponse);
        console.log("📡 SITUAÇÃO response.data:", sitResponse?.data);
        console.log("📡 SITUAÇÃO response.data type:", typeof sitResponse?.data);
        console.log("📡 SITUAÇÃO response.data isArray:", Array.isArray(sitResponse?.data));

        setCategorias(catResponse.data || []);
        setCidades(cidResponse.data || []);
        
        console.log("🔍 Verificando resposta de Situacao...");
        console.log("   sitResponse existe?", !!sitResponse);
        console.log("   sitResponse.data existe?", !!sitResponse?.data);
        console.log("   sitResponse.data é array?", Array.isArray(sitResponse?.data));
        console.log("   sitResponse.data.length:", sitResponse?.data?.length);
        
        if (sitResponse?.data && Array.isArray(sitResponse.data) && sitResponse.data.length > 0) {
          console.log("✅ [SITUAÇÃO] Dados encontrados - processando...");
          
          const situacoesBrutas = sitResponse.data.filter(s => s && s.toString().trim() !== '');
          
          console.log("📥 [SITUAÇÃO] Situações BRUTAS recebidas do backend:");
          situacoesBrutas.forEach((sit, i) => {
            console.log(`   ${i}: "${sit}" (tipo: ${typeof sit})`);
          });
          
          if (situacoesBrutas.length === 0) {
            console.log("⚠️ [SITUAÇÃO] Nenhuma situação válida após filtro");
            setSituacoesReais(situacaoOptionsHardcoded);
            setSituacoesMapeamento({});
            return;
          }

          console.log("🔄 [SITUAÇÃO] Aplicando lógica ULTRA INCLUSIVA...");
          
          const novoMapeamento = {};
          const situacoesParaUI = new Set();
          
          console.log("🔍 [SITUAÇÃO] Procurando por variações de 'Pronto Novo':");
          const variacoesProntoNovo = situacoesBrutas.filter(s => 
            s.toLowerCase().includes('pronto') && s.toLowerCase().includes('novo')
          );
          console.log("   Variações encontradas:", variacoesProntoNovo);
          
          situacoesBrutas.forEach((situacaoOriginal, index) => {
            if (situacaoOriginal && situacaoOriginal.toString().trim() !== '') {
              const chaveRobusta = criarChaveNormalizada(situacaoOriginal);
              const chaveSimples = situacaoOriginal.toLowerCase().trim();
              
              console.log(`   ${index}: "${situacaoOriginal}" → chave robusta: "${chaveRobusta}" | chave simples: "${chaveSimples}"`);
              
              if (!novoMapeamento[chaveRobusta]) {
                novoMapeamento[chaveRobusta] = [];
                console.log(`     ✅ Nova chave robusta criada: "${chaveRobusta}"`);
              }
              
              if (!novoMapeamento[chaveRobusta].includes(situacaoOriginal)) {
                novoMapeamento[chaveRobusta].push(situacaoOriginal);
                console.log(`     ✅ Situação "${situacaoOriginal}" adicionada à chave robusta "${chaveRobusta}"`);
              }
              
              if (chaveRobusta !== chaveSimples) {
                if (!novoMapeamento[chaveSimples]) {
                  novoMapeamento[chaveSimples] = [];
                }
                if (!novoMapeamento[chaveSimples].includes(situacaoOriginal)) {
                  novoMapeamento[chaveSimples].push(situacaoOriginal);
                  console.log(`     ✅ Situação "${situacaoOriginal}" também mapeada com chave simples "${chaveSimples}"`);
                }
              }
            }
          });
          
          console.log("📊 [SITUAÇÃO] Mapeamento criado:");
          Object.keys(novoMapeamento).forEach(chave => {
            console.log(`   "${chave}" → [${novoMapeamento[chave].join(', ')}] (${novoMapeamento[chave].length} variações)`);
          });
          
          const chavesProntoNovo = Object.keys(novoMapeamento).filter(chave => 
            chave.includes('pronto') && chave.includes('novo')
          );
          console.log("🎯 [SITUAÇÃO] Chaves para 'Pronto Novo':", chavesProntoNovo);
          
          Object.keys(novoMapeamento).forEach(chave => {
            const situacoesGrupo = novoMapeamento[chave];
            
            const versaoMaiuscula = situacoesGrupo.find(s => {
              const somenteLetras = s.replace(/[^A-Za-záàâãéèêíìîóòôõúùûçÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ\s-]/g, '');
              return somenteLetras === somenteLetras.toUpperCase() && s.trim() !== "";
            });
            
            const situacaoParaUI = versaoMaiuscula || capitalizarNomesProprios(situacoesGrupo[0]) || situacoesGrupo[0];
            
            if (situacaoParaUI && !situacoesParaUI.has(situacaoParaUI)) {
              console.log(`   ✅ Adicionando à UI: "${situacaoParaUI}" (representa: [${situacoesGrupo.join(', ')}])`);
              situacoesParaUI.add(situacaoParaUI);
            }
          });
          
          const situacoesFinais = Array.from(situacoesParaUI).sort();
          
          console.log("🎨 [SITUAÇÃO] Situações FINAIS para interface:");
          situacoesFinais.forEach((sit, i) => {
            console.log(`   ${i}: "${sit}"`);
          });
          
          console.log("💾 [SITUAÇÃO] Salvando estados...");
          console.log("   situacoesFinais.length:", situacoesFinais.length);
          console.log("   Object.keys(novoMapeamento).length:", Object.keys(novoMapeamento).length);
          
          setSituacoesReais(situacoesFinais);
          setSituacoesMapeamento(novoMapeamento);
          
          console.log("🚨 ===== DEBUG SITUAÇÃO - SUCESSO (ULTRA INCLUSIVA) =====");
          
        } else {
          console.log("⚠️ [SITUAÇÃO] Sem dados do backend, usando hardcoded");
          console.log("   Motivo:", !sitResponse ? "sitResponse falsy" : 
                     !sitResponse.data ? "sitResponse.data falsy" : 
                     !Array.isArray(sitResponse.data) ? "não é array" : 
                     "array vazio");
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

  // useEffect para bairros
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

  // Função de normalização para API
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
      const chaveRobusta = criarChaveNormalizada(situacaoSelecionada);
      const chaveSimples = situacaoSelecionada.toLowerCase().trim();
      
      console.log(`🔍 [API SITUAÇÃO] [${index}] Processando: "${situacaoSelecionada}"`);
      console.log(`   Chave robusta: "${chaveRobusta}"`);
      console.log(`   Chave simples: "${chaveSimples}"`);
      
      let encontrouVariacoes = false;
      
      if (situacoesMapeamento[chaveRobusta] && situacoesMapeamento[chaveRobusta].length > 0) {
        console.log(`✅ [API SITUAÇÃO] [${index}] MAPEAMENTO ROBUSTO ENCONTRADO: ${situacoesMapeamento[chaveRobusta].length} variações`);
        console.log(`   Variações: [${situacoesMapeamento[chaveRobusta].join(', ')}]`);
        
        todasVariacoesSituacao.push(...situacoesMapeamento[chaveRobusta]);
        encontrouVariacoes = true;
      }
      
      if (!encontrouVariacoes && chaveRobusta !== chaveSimples && situacoesMapeamento[chaveSimples] && situacoesMapeamento[chaveSimples].length > 0) {
        console.log(`✅ [API SITUAÇÃO] [${index}] MAPEAMENTO SIMPLES ENCONTRADO: ${situacoesMapeamento[chaveSimples].length} variações`);
        console.log(`   Variações: [${situacoesMapeamento[chaveSimples].join(', ')}]`);
        
        todasVariacoesSituacao.push(...situacoesMapeamento[chaveSimples]);
        encontrouVariacoes = true;
      }
      
      if (!encontrouVariacoes) {
        console.log(`⚠️ [API SITUAÇÃO] [${index}] SEM MAPEAMENTO - incluindo valor original: "${situacaoSelecionada}"`);
        todasVariacoesSituacao.push(situacaoSelecionada);
      }
    });

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

  // Normalizar bairros para API
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
      
      if (multiplicador > 1.5) {
        console.log(`💡 [FILTROS] ALTA EXPANSÃO: ${multiplicador.toFixed(2)}x deve recuperar os 57 imóveis perdidos!`);
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

  // handleClearFilters
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
        
        {/* Dropdown de situação */}
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

      {/* Botões de ação */}
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

        {/* 🎯 NOVO BOTÃO: Encontrar os 57 imóveis perdidos */}
        <button
          onClick={encontrarOs57ImoveisPerdidos}
          disabled={buscandoImoveis57}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors shadow-lg border-2 ${
            buscandoImoveis57
              ? 'bg-yellow-400 text-yellow-800 border-yellow-600 cursor-not-allowed'
              : 'bg-red-600 text-white border-red-700 hover:bg-red-700'
          }`}
        >
          {buscandoImoveis57 ? '🔍 Analisando 5553 imóveis...' : '🎯 ENCONTRAR OS 57 IMÓVEIS PERDIDOS'}
        </button>

        {/* 🚫 BOTÃO PARA LISTAR IMÓVEIS SEM SITUAÇÃO */}
        <button
          onClick={async () => {
            console.log('🚫 ===== LISTANDO IMÓVEIS SEM SITUAÇÃO DEFINIDA =====');
            
            try {
              console.log('📡 Coletando TODOS os imóveis para análise de situação...');
              
              let todosImoveis = [];
              let pagina = 1;
              const limite = 50;
              
              while (true) {
                try {
                  console.log(`📄 Carregando página ${pagina}...`);
                  
                  const response = await fetch(`/api/admin/imoveis?page=${pagina}&limit=${limite}`);
                  const dados = await response.json();
                  
                  if (dados?.data && dados.data.length > 0) {
                    todosImoveis.push(...dados.data);
                    console.log(`   ✅ Página ${pagina}: ${dados.data.length} imóveis (total: ${todosImoveis.length})`);
                    
                    if (dados.data.length < limite) {
                      console.log(`   🏁 Última página detectada (${dados.data.length} < ${limite})`);
                      break;
                    }
                    
                    pagina++;
                    
                    if (pagina > 200) {
                      console.log('⚠️ Limite de segurança atingido (200 páginas)');
                      break;
                    }
                    
                  } else {
                    console.log(`   🏁 Sem mais dados na página ${pagina}`);
                    break;
                  }
                  
                } catch (error) {
                  console.log(`   ⚠️ Erro na página ${pagina}:`, error.message);
                  break;
                }
              }
              
              console.log(`📊 TOTAL COLETADO: ${todosImoveis.length} imóveis`);
              
              if (todosImoveis.length === 0) {
                console.log('❌ Nenhum imóvel coletado');
                return;
              }
              
              const imoveisSemSituacao = [];
              const estatisticas = {
                total: todosImoveis.length,
                comSituacao: 0,
                semSituacao: 0,
                null: 0,
                undefined: 0,
                vazio: 0,
                apenasEspacos: 0,
                outrosProblemas: 0
              };
              
              todosImoveis.forEach((imovel, i) => {
                const situacao = imovel.Situacao;
                const codigo = imovel.Codigo || `sem-codigo-${i}`;
                
                let temProblema = false;
                let tipoProblema = '';
                
                if (situacao === null) {
                  estatisticas.null++;
                  estatisticas.semSituacao++;
                  temProblema = true;
                  tipoProblema = 'NULL';
                } else if (situacao === undefined) {
                  estatisticas.undefined++;
                  estatisticas.semSituacao++;
                  temProblema = true;
                  tipoProblema = 'UNDEFINED';
                } else if (situacao === '') {
                  estatisticas.vazio++;
                  estatisticas.semSituacao++;
                  temProblema = true;
                  tipoProblema = 'VAZIO';
                } else if (typeof situacao === 'string' && situacao.trim() === '') {
                  estatisticas.apenasEspacos++;
                  estatisticas.semSituacao++;
                  temProblema = true;
                  tipoProblema = 'APENAS_ESPACOS';
                } else if (typeof situacao !== 'string') {
                  estatisticas.outrosProblemas++;
                  estatisticas.semSituacao++;
                  temProblema = true;
                  tipoProblema = `TIPO_${typeof situacao}`.toUpperCase();
                } else {
                  estatisticas.comSituacao++;
                }
                
                if (temProblema) {
                  imoveisSemSituacao.push({
                    codigo: codigo,
                    situacao: situacao,
                    tipo: typeof situacao,
                    problema: tipoProblema,
                    categoria: imovel.Categoria || 'N/A',
                    cidade: imovel.Cidade || 'N/A',
                    status: imovel.Status || 'N/A'
                  });
                }
              });
              
              console.log('🎯 ===== RESULTADOS DA ANÁLISE =====');
              console.log(`📊 Total de imóveis analisados: ${estatisticas.total}`);
              console.log(`✅ Com situação válida: ${estatisticas.comSituacao} (${((estatisticas.comSituacao/estatisticas.total)*100).toFixed(1)}%)`);
              console.log(`❌ SEM situação: ${estatisticas.semSituacao} (${((estatisticas.semSituacao/estatisticas.total)*100).toFixed(1)}%)`);
              
              console.log(`\n📋 DETALHAMENTO DOS PROBLEMAS:`);
              console.log(`   🔴 NULL: ${estatisticas.null}`);
              console.log(`   🔴 UNDEFINED: ${estatisticas.undefined}`);  
              console.log(`   🔴 VAZIO (""): ${estatisticas.vazio}`);
              console.log(`   🔴 APENAS ESPAÇOS: ${estatisticas.apenasEspacos}`);
              console.log(`   🔴 OUTROS TIPOS: ${estatisticas.outrosProblemas}`);
              
              if (imoveisSemSituacao.length > 0) {
                console.log(`\n🚨 CÓDIGOS DOS IMÓVEIS SEM SITUAÇÃO (${imoveisSemSituacao.length}):`);
                console.log('=' .repeat(60));
                
                const grupos = {
                  'NULL': [],
                  'UNDEFINED': [],
                  'VAZIO': [],
                  'APENAS_ESPACOS': [],
                  'OUTROS': []
                };
                
                imoveisSemSituacao.forEach(item => {
                  const grupo = grupos[item.problema] || grupos['OUTROS'];
                  grupo.push(item);
                });
                
                Object.keys(grupos).forEach(tipoProblema => {
                  const items = grupos[tipoProblema];
                  if (items.length > 0) {
                    console.log(`\n🔴 ${tipoProblema} (${items.length} imóveis):`);
                    
                    items.forEach((item, i) => {
                      console.log(`   ${i + 1}. Código: ${item.codigo} | Categoria: ${item.categoria} | Cidade: ${item.cidade} | Status: ${item.status}`);
                    });
                    
                    const codigos = items.map(item => item.codigo);
                    console.log(`   📋 Códigos (${codigos.length}): ${codigos.join(', ')}`);
                  }
                });
                
                console.log(`\n📋 ===== LISTA COMPLETA PARA CORREÇÃO MANUAL =====`);
                const todosCodigosSemSituacao = imoveisSemSituacao.map(item => item.codigo);
                console.log(`CÓDIGOS (${todosCodigosSemSituacao.length}): ${todosCodigosSemSituacao.join(', ')}`);
                
                console.log(`\n💾 ===== COMANDOS SQL PARA CORREÇÃO =====`);
                console.log(`-- Definir situação padrão para imóveis sem situação`);
                console.log(`UPDATE imoveis SET Situacao = 'PRONTO USADO' WHERE Codigo IN ('${todosCodigosSemSituacao.join("', '")}');`);
                
                const percentualSemSituacao = (estatisticas.semSituacao / estatisticas.total) * 100;
                const estimativaTotal = (5553 * estatisticas.semSituacao) / estatisticas.total;
                
                console.log(`\n📊 ===== ESTIMATIVA DE IMPACTO =====`);
                console.log(`📈 Percentual sem situação: ${percentualSemSituacao.toFixed(2)}%`);
                console.log(`🎯 Estimativa no total (5553): ${Math.round(estimativaTotal)} imóveis`);
                
                if (Math.round(estimativaTotal) >= 50) {
                  console.log(`🎯 🚨 BINGO! Esta pode ser a causa dos 57 imóveis perdidos!`);
                  console.log(`💡 SOLUÇÃO: Definir situação para estes imóveis ou incluí-los nos filtros`);
                } else {
                  console.log(`🤔 Estimativa baixa. Pode haver outros problemas além da falta de situação.`);
                }
                
              } else {
                console.log(`\n✅ PERFEITO! Todos os imóveis têm situação definida`);
                console.log(`🤔 O problema dos 57 imóveis perdidos deve estar em outro lugar`);
              }
              
            } catch (error) {
              console.error('❌ Erro na análise de situações:', error);
            }
            
            console.log('🚫 ===== FIM LISTAGEM IMÓVEIS SEM SITUAÇÃO =====');
          }}
          className="px-3 py-2 text-xs rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-bold"
        >
          🚫 Listar Imóveis SEM Situação
        </button>

        {/* 🔄 BOTÃO PARA COMPARAÇÃO DIRETA */}
        <button
          onClick={async () => {
            console.log('🔄 ===== COMPARAÇÃO DIRETA: TODOS vs FILTRADOS =====');
            
            try {
              console.log('📡 Etapa 1: Buscando TODOS os imóveis (sem filtro)...');
              
              let todosImoveis = [];
              let pagina = 1;
              
              while (true) {
                try {
                  const response = await fetch(`/api/admin/imoveis?page=${pagina}&limit=50`);
                  const dados = await response.json();
                  
                  if (dados?.data && dados.data.length > 0) {
                    todosImoveis.push(...dados.data);
                    console.log(`   📄 Página ${pagina}: ${dados.data.length} imóveis (total: ${todosImoveis.length})`);
                    
                    if (dados.data.length < 50) break;
                    pagina++;
                    if (pagina > 150) break;
                  } else {
                    break;
                  }
                } catch (error) {
                  console.log(`   ❌ Erro na página ${pagina}:`, error.message);
                  break;
                }
              }
              
              console.log(`📊 TOTAL SEM FILTRO: ${todosImoveis.length} imóveis`);
              
              if (todosImoveis.length === 0) {
                console.log('❌ Não foi possível coletar imóveis');
                return;
              }
              
              console.log('📡 Etapa 2: Aplicando filtros das 5 situações...');
              
              const situacoesParaFiltro = normalizarSituacaoParaAPI(situacoesSelecionadas.length > 0 ? situacoesSelecionadas : [
                'EM CONSTRUÇÃO', 'LANÇAMENTO', 'PRONTO NOVO', 'PRONTO USADO', 'PRÉ-LANÇAMENTO'
              ]);
              
              console.log('🎯 Situações que serão filtradas:', situacoesParaFiltro);
              
              const imovelsFiltrados = todosImoveis.filter(imovel => {
                const situacao = imovel.Situacao;
                
                if (!situacao) return false;
                
                return situacoesParaFiltro.includes(situacao);
              });
              
              console.log(`📊 TOTAL COM FILTRO: ${imovelsFiltrados.length} imóveis`);
              
              const imoveisNaoFiltrados = todosImoveis.filter(imovel => {
                const situacao = imovel.Situacao;
                
                if (!situacao || situacao === null || situacao === undefined || situacao === '') {
                  return true;
                }
                
                return !situacoesParaFiltro.includes(situacao);
              });
              
              console.log('🎯 ===== RESULTADO DA COMPARAÇÃO =====');
              console.log(`📊 Total de imóveis no banco: ${todosImoveis.length}`);
              console.log(`📊 Imóveis que passam no filtro: ${imovelsFiltrados.length}`);
              console.log(`📊 Imóveis que NÃO passam no filtro: ${imoveisNaoFiltrados.length}`);
              console.log(`📊 Diferença calculada: ${todosImoveis.length - imovelsFiltrados.length}`);
              console.log(`📊 Diferença real observada: 57 (5553 - 5496)`);
              
              if (imoveisNaoFiltrados.length > 0) {
                console.log(`\n🚨 IMÓVEIS QUE NÃO PASSAM NO FILTRO:`);
                console.log('=' .repeat(70));
                
                const porSituacao = new Map();
                
                imoveisNaoFiltrados.forEach(imovel => {
                  const situacao = imovel.Situacao;
                  let chave = '';
                  
                  if (situacao === null) chave = '🔴 NULL';
                  else if (situacao === undefined) chave = '🔴 UNDEFINED';
                  else if (situacao === '') chave = '🔴 VAZIO';
                  else if (typeof situacao === 'string' && situacao.trim() === '') chave = '🔴 APENAS_ESPACOS';
                  else chave = `📝 "${situacao}"`;
                  
                  if (!porSituacao.has(chave)) {
                    porSituacao.set(chave, []);
                  }
                  
                  porSituacao.get(chave).push({
                    codigo: imovel.Codigo,
                    categoria: imovel.Categoria || 'N/A',
                    cidade: imovel.Cidade || 'N/A',
                    status: imovel.Status || 'N/A'
                  });
                });
                
                Array.from(porSituacao.entries())
                  .sort((a, b) => b[1].length - a[1].length)
                  .forEach(([situacao, imoveis]) => {
                    console.log(`\n📍 ${situacao} (${imoveis.length} imóveis):`);
                    
                    const codigos = imoveis.map(i => i.codigo);
                    console.log(`   📋 Códigos: ${codigos.slice(0, 20).join(', ')}${codigos.length > 20 ? ` (e mais ${codigos.length - 20})` : ''}`);
                    
                    console.log(`   📊 Exemplos:`);
                    imoveis.slice(0, 3).forEach((imovel, i) => {
                      console.log(`      ${i + 1}. ${imovel.codigo} | ${imovel.categoria} | ${imovel.cidade} | ${imovel.status}`);
                    });
                    
                    const estimativa = Math.round((5553 * imoveis.length) / todosImoveis.length);
                    console.log(`   🎯 Estimativa no total (5553): ${estimativa} imóveis`);
                  });
                
                console.log(`\n📋 ===== CÓDIGOS COMPLETOS DOS IMÓVEIS PERDIDOS =====`);
                const todosCodigosPerdidos = imoveisNaoFiltrados.map(i => i.Codigo).filter(Boolean);
                console.log(`CÓDIGOS PERDIDOS (${todosCodigosPerdidos.length}): ${todosCodigosPerdidos.join(', ')}`);
                
                console.log(`\n💾 ===== COMANDOS SQL PARA CORREÇÃO =====`);
                
                porSituacao.forEach((imoveis, situacao) => {
                  const codigos = imoveis.map(i => i.codigo).filter(Boolean);
                  
                  if (situacao.includes('NULL') || situacao.includes('UNDEFINED') || situacao.includes('VAZIO')) {
                    console.log(`-- Corrigir ${situacao} (${codigos.length} imóveis):`);
                    console.log(`UPDATE imoveis SET Situacao = 'PRONTO USADO' WHERE Codigo IN ('${codigos.join("', '")}');`);
                  } else {
                    console.log(`-- Verificar ${situacao} (${codigos.length} imóveis):`);
                    console.log(`-- Códigos: ${codigos.join(', ')}`);
                    console.log(`-- Considerar incluir no mapeamento ou corrigir grafia`);
                  }
                });
                
                const totalEstimadoPerdidos = Math.round((5553 * imoveisNaoFiltrados.length) / todosImoveis.length);
                console.log(`\n🎯 ===== VERIFICAÇÃO FINAL =====`);
                console.log(`📊 Total estimado de imóveis perdidos: ${totalEstimadoPerdidos}`);
                console.log(`📊 Diferença real observada: 57`);
                
                if (Math.abs(totalEstimadoPerdidos - 57) <= 10) {
                  console.log(`✅ 🎯 BINGO! A estimativa (${totalEstimadoPerdidos}) está muito próxima da diferença real (57)!`);
                  console.log(`💡 ESTES são os imóveis que estão causando a diferença!`);
                } else {
                  console.log(`🤔 Diferença entre estimativa (${totalEstimadoPerdidos}) e real (57) = ${Math.abs(totalEstimadoPerdidos - 57)}`);
                  console.log(`💡 Pode haver outros fatores além das situações analisadas`);
                }
                
              } else {
                console.log(`\n✅ PERFEITO! Todos os imóveis passaram no filtro`);
                console.log(`🤔 A diferença de 57 deve estar em outro lugar`);
              }
              
            } catch (error) {
              console.error('❌ Erro na comparação:', error);
            }
            
            console.log('🔄 ===== FIM COMPARAÇÃO DIRETA =====');
          }}
          className="px-3 py-2 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors font-bold"
        >
          🔄 Comparação TODOS vs FILTRADOS
        </button>

        {/* 📋 BOTÃO PARA LISTAR CÓDIGOS COM SITUAÇÕES ATÍPICAS */}
        <button
          onClick={async () => {
            console.log('📋 ===== LISTANDO CÓDIGOS COM SITUAÇÕES ATÍPICAS =====');
            
            try {
              console.log('📡 Coletando amostra para análise de situações atípicas...');
              
              let todosImoveis = [];
              const maxPaginas = 30;
              
              for (let pagina = 1; pagina <= maxPaginas; pagina++) {
                try {
                  const response = await fetch(`/api/admin/imoveis?page=${pagina}&limit=30`);
                  const dados = await response.json();
                  
                  if (dados?.data && dados.data.length > 0) {
                    todosImoveis.push(...dados.data);
                    console.log(`   📄 Página ${pagina}: ${dados.data.length} imóveis (total: ${todosImoveis.length})`);
                  } else {
                    console.log(`   🏁 Sem dados na página ${pagina}, parando...`);
                    break;
                  }
                } catch (error) {
                  console.log(`   ⚠️ Erro na página ${pagina}:`, error.message);
                  break;
                }
              }
              
              console.log(`📊 Total coletado: ${todosImoveis.length} imóveis`);
              
              if (todosImoveis.length === 0) {
                console.log('❌ Nenhum imóvel coletado');
                return;
              }
              
              const situacoesPadrao = new Set([
                'EM CONSTRUÇÃO', 'LANÇAMENTO', 'PRONTO NOVO', 
                'PRONTO USADO', 'PRÉ-LANÇAMENTO'
              ]);
              
              const situacoesAtipicas = new Map();
              const codigosAtipicos = [];
              
              todosImoveis.forEach((imovel, i) => {
                const situacao = imovel.Situacao;
                const codigo = imovel.Codigo || `sem-codigo-${i}`;
                
                let isAtipica = false;
                let categoria = '';
                
                if (situacao === null || situacao === undefined) {
                  isAtipica = true;
                  categoria = situacao === null ? 'NULL' : 'UNDEFINED';
                } else if (situacao === '') {
                  isAtipica = true;
                  categoria = 'VAZIO';
                } else if (typeof situacao === 'string') {
                  const situacaoLimpa = situacao.trim();
                  
                  if (situacaoLimpa === '') {
                    isAtipica = true;
                    categoria = 'APENAS_ESPACOS';
                  } else if (!situacoesPadrao.has(situacaoLimpa)) {
                    isAtipica = true;
                    categoria = `SITUACAO_DIFERENTE: "${situacaoLimpa}"`;
                  }
                } else {
                  isAtipica = true;
                  categoria = `TIPO_INCORRETO: ${typeof situacao}`;
                }
                
                if (isAtipica) {
                  if (!situacoesAtipicas.has(categoria)) {
                    situacoesAtipicas.set(categoria, []);
                  }
                  situacoesAtipicas.get(categoria).push(codigo);
                  
                  codigosAtipicos.push({
                    codigo: codigo,
                    situacao: situacao,
                    categoria: categoria,
                    tipo: typeof situacao,
                    imovelCategoria: imovel.Categoria || 'N/A',
                    cidade: imovel.Cidade || 'N/A',
                    status: imovel.Status || 'N/A'
                  });
                }
              });
              
              console.log('🎯 ===== RESULTADOS DA ANÁLISE DE SITUAÇÕES ATÍPICAS =====');
              console.log(`📊 Total analisado: ${todosImoveis.length} imóveis`);
              console.log(`📊 Situações atípicas encontradas: ${codigosAtipicos.length}`);
              console.log(`📊 Percentual atípico: ${((codigosAtipicos.length/todosImoveis.length)*100).toFixed(1)}%`);
              
              const estimativa = Math.round((5553 * codigosAtipicos.length) / todosImoveis.length);
              console.log(`📊 Estimativa no total (5553): ${estimativa} imóveis`);
              
              if (situacoesAtipicas.size > 0) {
                console.log(`\n🚨 SITUAÇÕES ATÍPICAS ENCONTRADAS:`);
                console.log('=' .repeat(80));
                
                Array.from(situacoesAtipicas.entries())
                  .sort((a, b) => b[1].length - a[1].length)
                  .forEach(([categoria, codigos]) => {
                    const estimativaCategoria = Math.round((5553 * codigos.length) / todosImoveis.length);
                    
                    console.log(`\n📍 ${categoria}`);
                    console.log(`   📊 Quantidade na amostra: ${codigos.length}`);
                    console.log(`   📊 Estimativa total: ${estimativaCategoria} imóveis`);
                    console.log(`   📋 Códigos: ${codigos.slice(0, 15).join(', ')}${codigos.length > 15 ? ` (e mais ${codigos.length - 15})` : ''}`);
                  });
                
                console.log(`\n📋 ===== LISTA COMPLETA DE CÓDIGOS ATÍPICOS =====`);
                const todosCodigosAtipicos = codigosAtipicos.map(item => item.codigo);
                console.log(`CÓDIGOS ATÍPICOS (${todosCodigosAtipicos.length}): ${todosCodigosAtipicos.join(', ')}`);
                
                console.log(`\n📊 ===== ANÁLISE DE IMPACTO =====`);
                
                if (estimativa >= 50) {
                  console.log(`🎯 🚨 ALTO IMPACTO: ${estimativa} imóveis podem explicar os 57 perdidos!`);
                  console.log(`💡 AÇÕES RECOMENDADAS:`);
                  console.log(`   1. Corrigir situações no banco de dados`);
                  console.log(`   2. Ou incluir essas variações no mapeamento`);
                  console.log(`   3. Ou criar filtro que inclua situações NULL/atípicas`);
                } else if (estimativa >= 20) {
                  console.log(`⚠️ IMPACTO MODERADO: ${estimativa} imóveis contribuem parcialmente`);
                  console.log(`💡 Verificar se há outros problemas além das situações atípicas`);
                } else {
                  console.log(`ℹ️ BAIXO IMPACTO: ${estimativa} imóveis - problema pode estar em outro lugar`);
                }
                
              } else {
                console.log(`\n✅ EXCELENTE! Nenhuma situação atípica encontrada na amostra`);
                console.log(`🤔 O problema dos 57 imóveis deve estar em:`);
                console.log(`   1. Filtros ocultos no backend`);
                console.log(`   2. Outras páginas não analisadas`);
                console.log(`   3. Lógica de agregação/agrupamento`);
              }
              
            } catch (error) {
              console.error('❌ Erro na análise de situações atípicas:', error);
            }
            
            console.log('📋 ===== FIM LISTAGEM SITUAÇÕES ATÍPICAS =====');
          }}
          className="px-3 py-2 text-xs rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors"
        >
          📋 Listar Situações Atípicas
        </button>

        {/* 🔍 BOTÃO DE INVESTIGAÇÃO ORIGINAL */}
        <button
          onClick={investigarTodosCampos}
          disabled={investigandoSituacoes}
          className={`px-4 py-2 text-sm rounded-lg transition-colors ${
            investigandoSituacoes
              ? 'bg-yellow-300 text-yellow-800 cursor-not-allowed'
              : 'bg-gray-600 text-white hover:bg-gray-700'
          }`}
        >
          {investigandoSituacoes ? '🔍 Investigando...' : '🔍 Investigação Original'}
        </button>

        {/* Informações de debug */}
        <div className="text-xs text-gray-500 flex items-center gap-4 flex-wrap">
          <span>🎯 Situações: {situacoesReais.length}</span>
          <span>🗂️ Mapeamentos: {Object.keys(situacoesMapeamento).length}</span>
          {situacoesSelecionadas.length > 0 && (
            <span className="text-blue-600 font-medium">
              ✅ {situacoesSelecionadas.length} selecionadas
            </span>
          )}
          <span className="text-red-600 text-[11px] font-bold">
            🚨 57 imóveis perdidos (5553 - 5496)
          </span>
          <span className="text-green-600 text-[10px]">
            🔧 Status: {Object.keys(situacoesMapeamento).length > 0 ? 'Mapeamento ATIVO' : 'Mapeamento VAZIO'}
          </span>
        </div>
        
        <div className="text-xs italic text-gray-400 mt-2">
          💡 Use o botão <strong>🎯 ENCONTRAR OS 57 IMÓVEIS PERDIDOS</strong> para identificar todos os códigos problemáticos
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
