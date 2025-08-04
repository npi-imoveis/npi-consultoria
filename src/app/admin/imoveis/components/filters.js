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

  // Opções de situação hardcoded
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

  // useEffect para situações
  useEffect(() => {
    async function fetchFilterData() {
      try {
        console.log("🔄 Carregando dados dos filtros...");
        
        const catResponse = await getImoveisByFilters("Categoria");
        const cidResponse = await getImoveisByFilters("Cidade");
        const sitResponse = await getImoveisByFilters("Situacao");

        setCategorias(catResponse.data || []);
        setCidades(cidResponse.data || []);
        
        if (sitResponse?.data && Array.isArray(sitResponse.data) && sitResponse.data.length > 0) {
          console.log("✅ Processando situações do backend...");
          
          const situacoesBrutas = sitResponse.data.filter(s => s && s.toString().trim() !== '');
          
          if (situacoesBrutas.length === 0) {
            setSituacoesReais(situacaoOptionsHardcoded);
            setSituacoesMapeamento({});
            return;
          }

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
          
          console.log(`✅ ${situacoesFinais.length} situações carregadas com sucesso`);
          
        } else {
          console.log("⚠️ Usando situações padrão");
          setSituacoesReais(situacaoOptionsHardcoded);
          setSituacoesMapeamento({});
        }

      } catch (error) {
        console.error("❌ Erro ao carregar filtros:", error);
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
        console.error("❌ Erro ao buscar bairros:", error);
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
        console.error('Erro ao restaurar filtros do cache:', error);
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
      
      return newSituacoes;
    });
  };

  // Função de normalização para API
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

  // handleFilters
  const handleFilters = () => {
    const situacaoProcessada = normalizarSituacaoParaAPI(situacoesSelecionadas);
    
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

    console.log("Aplicando filtros:", filtersForAPI);

    if (onFilter) {
      onFilter(filtersToApply);
    }
  };

  // handleClearFilters
  const handleClearFilters = () => {
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

    // Limpar cache
    localStorage.removeItem("admin_appliedFilters");
    localStorage.removeItem("admin_filterResults");
    localStorage.removeItem("admin_filterPagination");
    localStorage.removeItem("admin_searchTerm");
    localStorage.removeItem("admin_searchResults");
    localStorage.removeItem("admin_searchPagination");
    
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

        {/* Informações de status */}
        <div className="text-xs text-gray-500 flex items-center gap-4 flex-wrap">
          <span>📊 Situações: {situacoesReais.length}</span>
          <span>🗂️ Mapeamentos: {Object.keys(situacoesMapeamento).length}</span>
          {situacoesSelecionadas.length > 0 && (
            <span className="text-blue-600 font-medium">
              ✅ {situacoesSelecionadas.length} selecionadas
            </span>
          )}
          {bairrosSelecionados.length > 0 && (
            <span className="text-green-600 font-medium">
              🏘️ {bairrosSelecionados.length} bairros
            </span>
          )}
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
