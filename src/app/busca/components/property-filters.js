"use client";

import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState, useRef } from "react";
import useFiltersStore from "@/app/store/filtrosStore";
import { getImoveisByFilters, getBairrosPorCidade } from "@/app/services";

// Componente de Input Numérico reutilizável
const InputNumerico = ({ placeholder, value, onChange }) => {
  // Estado local para controlar o valor durante a digitação
  const [inputValue, setInputValue] = useState("");
  // Estado para rastrear se o input está em foco
  const [isFocused, setIsFocused] = useState(false);

  // Efeito para atualizar o input quando o valor externo muda
  useEffect(() => {
    if (value === null || value === undefined) {
      setInputValue("");
    } else if (!isFocused) {
      // Só formata se não estiver com foco
      setInputValue(formatarParaReal(value));
    }
  }, [value, isFocused]);

  // Função para formatar o valor para real brasileiro
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
      console.error("Erro ao formatar valor:", e);
      return String(valor);
    }
  };

  // Função para converter string formatada para número
  const converterParaNumero = (valorFormatado) => {
    if (!valorFormatado || valorFormatado.trim() === "") return null;

    // Remove qualquer caractere que não seja dígito
    const valorLimpo = valorFormatado.replace(/[^\d]/g, "");
    if (valorLimpo === "") return null;

    const numero = Number(valorLimpo);
    return numero;
  };

  // Função para validar os limites do valor
  const validarLimites = (numero) => {
    if (numero === null) return null;
    if (numero < 65000) return 65000;
    if (numero > 65000000) return 65000000;
    return numero;
  };

  // Função para lidar com a mudança do input
  const handleInputChange = (e) => {
    const novoValor = e.target.value;

    // Permitimos a digitação de qualquer texto durante a edição
    setInputValue(novoValor);

    // Convertemos para número sem validar limites ainda
    const numero = converterParaNumero(novoValor);
    onChange(numero); // Passamos o valor numérico para o componente pai
  };

  // Função para lidar com o evento de foco
  const handleFocus = () => {
    setIsFocused(true);

    // Quando o usuário clica no campo, podemos mostrar apenas os números para facilitar a edição
    if (value !== null) {
      const numeroString = String(value).replace(/[^\d]/g, "");
      setInputValue(numeroString);
    }
  };

  // Função para lidar com o evento de perda de foco
  const handleBlur = () => {
    setIsFocused(false);

    // Quando o usuário terminar de digitar (perder o foco), aplicamos a validação de limites
    if (value !== null) {
      const valorValidado = validarLimites(value);
      onChange(valorValidado);
      setInputValue(formatarParaReal(valorValidado));
    } else {
      setInputValue("");
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

// Componente de Checkbox reutilizável
const Checkbox = ({ id, label, showInfo = false, checked, onChange }) => (
  <div className="flex items-center mb-4">
    <span htmlFor={id} className="text-[10px] font-semibold text-gray-800 flex-1">
      {label}
    </span>
    {showInfo && <InformationCircleIcon className="w-4 h-4 text-gray-400 mr-2" />}
    <input
      id={id}
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-gray-200 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-black"
    />
  </div>
);

// Componente de Botão de Opção reutilizável
const OptionButton = ({ value, selected, onClick }) => {
  const pillBase =
    "flex items-center justify-center w-16 rounded-lg border px-2 py-1 text-xs transition-colors";
  const variantClasses = selected
    ? "bg-zinc-200 text-black "
    : "bg-white text-gray-700 hover:bg-zinc-100";

  return (
    <button
      type="button"
      className={`${pillBase} ${variantClasses}`}
      onClick={() => onClick(value)}
    >
      {value}
    </button>
  );
};

// Componente de Grupo de Opções reutilizável
const OptionGroup = ({ label, options, selectedValue, onChange }) => (
  <div className="mb-4">
    <span className="block text-[10px] font-semibold text-gray-800 mb-2">{label}</span>
    <div className="flex gap-2">
      {options.map((option) => (
        <OptionButton
          key={option}
          value={option}
          selected={selectedValue === option}
          onClick={onChange}
        />
      ))}
    </div>
  </div>
);

// Componente de Grupo de Inputs reutilizável
const InputGroup = ({
  label,
  placeholderMin,
  placeholderMax,
  valueMin,
  valueMax,
  onChangeMin,
  onChangeMax,
}) => (
  <div className="mb-4">
    <span className="block text-[10px] font-semibold text-gray-800 mb-2">{label}</span>
    <div className="flex gap-2">
      <InputNumerico placeholder={placeholderMin} value={valueMin} onChange={onChangeMin} />
      <InputNumerico placeholder={placeholderMax} value={valueMax} onChange={onChangeMax} />
    </div>
  </div>
);

// Componente de Separador reutilizável
const Separator = () => <hr className="my-4 border-gray-200" />;

// Componente de Botão reutilizável
const Button = ({ label, primary = false, onClick }) => {
  const baseClasses = "w-full block font-semibold py-2 px-4 rounded-full transition-colors text-sm";
  const variantClasses = primary
    ? "bg-black text-white hover:bg-black/80"
    : "bg-gray-200 text-gray-800 hover:bg-gray-300";

  return (
    <button type="button" className={`${baseClasses} ${variantClasses}`} onClick={onClick}>
      <span>{label}</span>
    </button>
  );
};

// Componente de Input Numérico modificado para preço (valores entre 65.000 e 65.000.000)
const InputPreco = ({ placeholder, value, onChange }) => {
  // Estado local para controlar o valor durante a digitação
  const [inputValue, setInputValue] = useState("");
  // Estado para rastrear se o input está em foco
  const [isFocused, setIsFocused] = useState(false);

  // Efeito para atualizar o input quando o valor externo muda
  useEffect(() => {
    if (value === null || value === undefined || value === 0) {
      setInputValue("");
    } else if (!isFocused) {
      // Só formata se não estiver com foco
      setInputValue(formatarParaReal(value));
    }
  }, [value, isFocused]);

  // Função para formatar o valor para real brasileiro
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
      console.error("Erro ao formatar valor:", e);
      return String(valor);
    }
  };

  // Função para lidar com a mudança do input
  const handleInputChange = (e) => {
    const novoValor = e.target.value;

    // Remove qualquer caractere que não seja dígito
    const apenasNumeros = novoValor.replace(/[^\d]/g, "");

    // Converter para número (ou null se vazio)
    const numero = apenasNumeros === "" ? null : parseInt(apenasNumeros, 10);

    // Atualiza o valor no estado pai
    onChange(numero);

    // Formata o valor para exibição
    if (numero === null) {
      setInputValue("");
    } else {
      // Durante a digitação, formata como moeda brasileira
      setInputValue(formatarParaReal(numero));
    }
  };

  // Função para lidar com o evento de foco
  const handleFocus = () => {
    setIsFocused(true);

    // Quando o usuário clica no campo, mostramos o valor formatado
    if (value !== null && value > 0) {
      setInputValue(formatarParaReal(value));
    } else {
      setInputValue("");
    }
  };

  // Função para validar ao perder o foco
  const handleBlur = () => {
    setIsFocused(false);

    if (value === null || value === 0) {
      setInputValue("");
    } else {
      // Validação de limites quando perde o foco
      let valorValidado = value;
      if (value < 65000) valorValidado = 65000;
      if (value > 65000000) valorValidado = 65000000;

      // Atualiza o valor e formata
      onChange(valorValidado);
      setInputValue(formatarParaReal(valorValidado));
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

// Componente de Input Numérico modificado para área (máximo 3 dígitos)
const InputArea = ({ placeholder, value, onChange }) => {
  // Estado local para controlar o valor durante a digitação
  const [inputValue, setInputValue] = useState("");
  // Estado para rastrear se o input está em foco
  const [isFocused, setIsFocused] = useState(false);

  // Efeito para atualizar o input quando o valor externo muda
  useEffect(() => {
    if (value === null || value === undefined || value === 0) {
      setInputValue("");
    } else if (!isFocused) {
      setInputValue(String(value));
    }
  }, [value, isFocused]);

  // Função para lidar com a mudança do input
  const handleInputChange = (e) => {
    const novoValor = e.target.value;

    // Validação básica: permitir apenas números
    if (/^\d*$/.test(novoValor) || novoValor === "") {
      setInputValue(novoValor);

      // Converter para número (ou zero se vazio)
      const numero = novoValor === "" ? 0 : parseInt(novoValor, 10);
      onChange(numero);
    }
  };

  // Função para lidar com o evento de foco
  const handleFocus = () => {
    setIsFocused(true);

    // Quando o campo recebe foco, mostramos apenas o valor numérico (sem "m²")
    if (value > 0) {
      setInputValue(String(value));
    } else {
      setInputValue("");
    }
  };

  // Função para validar ao perder o foco
  const handleBlur = () => {
    setIsFocused(false);

    // Limita a 3 dígitos quando o usuário termina a digitação
    if (value > 999) {
      onChange(999);
      setInputValue("999");
    } else if (value === 0 || inputValue === "") {
      setInputValue("");
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
      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[10px] text-gray-500">
        m²
      </span>
    </div>
  );
};

export default function PropertyFilters({ onFilter, isVisible, setIsVisible, horizontal = false }) {
  // Estado para controlar se estamos no navegador (client-side)
  const [isClient, setIsClient] = useState(false);

  // Estado para detectar se estamos em mobile
  const [isMobile, setIsMobile] = useState(false);

  // Estado para armazenar a altura do header
  const [headerHeight, setHeaderHeight] = useState(150);

  // Estado para controlar a inicialização completa do componente
  const [fullyInitialized, setFullyInitialized] = useState(false);

  // Estado para controlar a visibilidade da interface
  const [uiVisible, setUiVisible] = useState(false);

  // Detectar ambiente de cliente para evitar problemas de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [bairros, setBairros] = useState([]);
  const setFilters = useFiltersStore((state) => state.setFilters);
  const limparFiltros = useFiltersStore((state) => state.limparFiltros);
  const aplicarFiltros = useFiltersStore((state) => state.aplicarFiltros);

  // Estados para os valores selecionados
  const [finalidade, setFinalidade] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState("");
  // Alterando para array para suportar múltipla seleção
  const [bairrosSelecionados, setBairrosSelecionados] = useState([]);
  const [quartosSelecionados, setQuartosSelecionados] = useState(null);
  const [banheirosSelecionados, setBanheirosSelecionados] = useState(null);
  const [vagasSelecionadas, setVagasSelecionadas] = useState(null);

  // Estados para preço
  const [precoMin, setPrecoMin] = useState(null);
  const [precoMax, setPrecoMax] = useState(null);

  // Estados para área
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(0);

  // Estados para checkboxes
  const [abaixoMercado, setAbaixoMercado] = useState(false);
  const [proximoMetro, setProximoMetro] = useState(false);

  // Estado para controlar a pesquisa no campo de bairros
  const [bairroFilter, setBairroFilter] = useState("");
  // Estado para controlar se a lista de bairros está expandida
  const [bairrosExpanded, setBairrosExpanded] = useState(false);
  // Referência para o componente de bairros
  const bairrosRef = useRef(null);

  // Estados para controlar os modais dos outros campos
  const [finalidadeExpanded, setFinalidadeExpanded] = useState(false);
  const [tipoExpanded, setTipoExpanded] = useState(false);
  const [cidadeExpanded, setCidadeExpanded] = useState(false);
  const [quartosExpanded, setQuartosExpanded] = useState(false);
  const [vagasExpanded, setVagasExpanded] = useState(false);
  
  // Referências para os componentes dos modais
  const finalidadeRef = useRef(null);
  const tipoRef = useRef(null);
  const cidadeRef = useRef(null);
  const quartosRef = useRef(null);
  const vagasRef = useRef(null);

  // Efeito para lidar com cliques fora dos dropdowns/modais
  useEffect(() => {
    function handleClickOutside(event) {
      if (bairrosRef.current && !bairrosRef.current.contains(event.target)) {
        setBairrosExpanded(false);
      }
      if (finalidadeRef.current && !finalidadeRef.current.contains(event.target)) {
        setFinalidadeExpanded(false);
      }
      if (tipoRef.current && !tipoRef.current.contains(event.target)) {
        setTipoExpanded(false);
      }
      if (cidadeRef.current && !cidadeRef.current.contains(event.target)) {
        setCidadeExpanded(false);
      }
      if (quartosRef.current && !quartosRef.current.contains(event.target)) {
        setQuartosExpanded(false);
      }
      if (vagasRef.current && !vagasRef.current.contains(event.target)) {
        setVagasExpanded(false);
      }
    }

    // Adiciona listener quando qualquer dropdown estiver aberto
    if (bairrosExpanded || finalidadeExpanded || tipoExpanded || cidadeExpanded || quartosExpanded || vagasExpanded) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [bairrosExpanded, finalidadeExpanded, tipoExpanded, cidadeExpanded, quartosExpanded, vagasExpanded]);

  useEffect(() => {
    async function fetchImoveis() {
      try {
        const cat = await getImoveisByFilters("Categoria");
        const categoriasList = cat.data || [];
        setCategorias(categoriasList);

        const cid = await getImoveisByFilters("Cidade");
        const cidadesList = cid.data || [];
        setCidades(cidadesList);

        // Atualiza o store com as categorias e cidades
        setFilters({
          categorias: categoriasList,
          cidades: cidadesList,
          bairros: [], // Mantém os bairros vazios por enquanto
        });
      } catch (error) {
        console.error("Erro ao buscar filtros:", error);
      }
    }

    fetchImoveis();
  }, [setFilters]);

  // Efeito para carregar bairros quando uma cidade é selecionada
  useEffect(() => {
    async function fetchBairros() {
      if (cidadeSelecionada) {
        try {
          // Usar a função de serviço específica para bairros por cidade que agora aceita categoria
          const response = await getBairrosPorCidade(cidadeSelecionada, categoriaSelecionada);

          if (response && response.data) {
            // Extrair a lista de bairros da resposta
            const bairrosList = response.data || [];

            // Atualiza os bairros locais e no store
            setBairros(bairrosList);
            setFilters({
              bairros: bairrosList,
            });
          } else {
            console.error("Formato de resposta inválido para bairros:", response);
            setBairros([]);
          }
        } catch (error) {
          console.error("Erro ao buscar bairros:", error);
          setBairros([]);
        }
      } else {
        // Limpa bairros se nenhuma cidade estiver selecionada
        setBairros([]);
        setFilters({
          bairros: [],
        });
      }
    }

    fetchBairros();
  }, [cidadeSelecionada, categoriaSelecionada, setFilters]);

  // Sincroniza os estados locais com o store quando o componente é montado
  useEffect(() => {
    // Obtém os valores atuais do store
    const storeValues = useFiltersStore.getState();

    // Atualiza os estados locais com os valores do store
    if (storeValues.finalidade) setFinalidade(storeValues.finalidade);
    if (storeValues.categoriaSelecionada) setCategoriaSelecionada(storeValues.categoriaSelecionada);
    if (storeValues.cidadeSelecionada) setCidadeSelecionada(storeValues.cidadeSelecionada);
    if (storeValues.bairrosSelecionados && storeValues.bairrosSelecionados.length > 0)
      setBairrosSelecionados(storeValues.bairrosSelecionados);
    if (storeValues.quartos) setQuartosSelecionados(storeValues.quartos);
    if (storeValues.banheiros) setBanheirosSelecionados(storeValues.banheiros);
    if (storeValues.vagas) setVagasSelecionadas(storeValues.vagas);

    // Para preço, converte string para número se necessário
    if (storeValues.precoMin !== undefined) {
      const precoMinValor =
        typeof storeValues.precoMin === "string" && storeValues.precoMin !== null
          ? parseInt(storeValues.precoMin, 10)
          : storeValues.precoMin;
      setPrecoMin(precoMinValor);
    }

    if (storeValues.precoMax !== undefined) {
      const precoMaxValor =
        typeof storeValues.precoMax === "string" && storeValues.precoMax !== null
          ? parseInt(storeValues.precoMax, 10)
          : storeValues.precoMax;
      setPrecoMax(precoMaxValor);
    }

    // Para área, verifica se deve converter para número
    if (storeValues.areaMin) {
      const areaMinValor =
        typeof storeValues.areaMin === "string"
          ? parseInt(storeValues.areaMin, 10)
          : storeValues.areaMin;
      setAreaMin(isNaN(areaMinValor) ? 0 : areaMinValor);
    }
    if (storeValues.areaMax) {
      const areaMaxValor =
        typeof storeValues.areaMax === "string"
          ? parseInt(storeValues.areaMax, 10)
          : storeValues.areaMax;
      setAreaMax(isNaN(areaMaxValor) ? 0 : areaMaxValor);
    }

    if (storeValues.abaixoMercado) setAbaixoMercado(storeValues.abaixoMercado);
    if (storeValues.proximoMetro) setProximoMetro(storeValues.proximoMetro);
  }, []);

  // Efeito para detectar o tamanho da tela
  useEffect(() => {
    if (!isClient) return;

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      // Marcar como completamente inicializado após a verificação do tamanho da tela
      setFullyInitialized(true);
    };

    // Verificar tamanho inicial
    checkScreenSize();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener("resize", checkScreenSize);

    // Limpar listener ao desmontar
    return () => window.removeEventListener("resize", checkScreenSize);
  }, [isClient]);

  // Efeito para medir a altura correta do header e controlar o overflow
  useEffect(() => {
    if (isMobile && isVisible) {
      // Tentativa de encontrar o elemento do header para medir sua altura real
      const headerElement = document.querySelector(".fixed.top-20");
      if (headerElement) {
        const headerRect = headerElement.getBoundingClientRect();
        const topPosition = headerRect.bottom;
        setHeaderHeight(topPosition);
      }

      // Impedir rolagem do body quando o filtro está aberto em mobile
      document.body.style.overflow = "hidden";
    } else {
      // Restaurar rolagem quando o filtro está fechado ou em desktop
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, isVisible]);

  // Exibir UI somente após inicialização completa
  useEffect(() => {
    if (fullyInitialized) {
      // Pequeno atraso para garantir que tudo foi renderizado corretamente
      const timer = setTimeout(() => {
        setUiVisible(true);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [fullyInitialized]);

  // Handlers para atualizar o store quando o usuário selecionar uma opção
  const handleCategoriaChange = (e) => {
    const categoria = e.target.value;
    setCategoriaSelecionada(categoria);
    // Não atualiza o store aqui, apenas o estado local
  };

  const handleCidadeChange = (e) => {
    const cidade = e.target.value;
    setCidadeSelecionada(cidade);
    // Reseta o bairro selecionado quando a cidade muda
    setBairrosSelecionados([]);
    setBairroFilter("");
    // Não atualiza o store aqui, apenas o estado local
  };

  // Handler para bairro - alterado para lidar com múltipla seleção
  const handleBairroChange = (bairro) => {
    setBairrosSelecionados((prev) => {
      // Se o bairro já estiver selecionado, remove
      if (prev.includes(bairro)) {
        return prev.filter((b) => b !== bairro);
      }
      // Caso contrário, adiciona à lista
      return [...prev, bairro];
    });
  };

  // Função para filtrar bairros com base na pesquisa
  const bairrosFiltrados = bairros.filter((bairro) =>
    bairro.toLowerCase().includes(bairroFilter.toLowerCase())
  );

  // Handlers para atualizar o store quando o usuário selecionar quartos, banheiros ou vagas
  const handleQuartosChange = (value) => {
    setQuartosSelecionados(value);
    // Não atualiza o store aqui, apenas o estado local
  };

  const handleBanheirosChange = (value) => {
    setBanheirosSelecionados(value);
    // Não atualiza o store aqui, apenas o estado local
  };

  const handleVagasChange = (value) => {
    setVagasSelecionadas(value);
    // Não atualiza o store aqui, apenas o estado local
  };

  // Validação e formatação para área (máximo 3 dígitos)
  const handleAreaChange = (value, setter) => {
    // Limita a 3 dígitos e converte para número
    const valorLimitado = value <= 999 ? value : 999;
    setter(valorLimitado);
  };

  // Validação e formatação para preço
  const handlePrecoChange = (value, setter) => {
    setter(value);
  };

  // Opções para os grupos de seleção
  const opcoes = [1, 2, 3, "4+"];

  // Handler para finalidade
  const handleFinalidadeChange = (e) => {
    const novaFinalidade = e.target.value === "comprar" ? "Comprar" : "Alugar";
    setFinalidade(novaFinalidade);
  };

  // Handler para aplicar os filtros
  const handleAplicarFiltros = () => {
    // Verifica se tanto a categoria quanto a cidade foram selecionadas
    const filtrosBasicosPreenchidos = categoriaSelecionada && cidadeSelecionada && finalidade;

    // Validação final dos valores de preço
    const precoMinFinal = precoMin !== null && precoMin > 0 ? precoMin : null;
    const precoMaxFinal = precoMax !== null && precoMax > 0 ? precoMax : null;

    // Validação final dos valores de área
    const areaMinFinal = areaMin > 999 ? 999 : areaMin;
    const areaMaxFinal = areaMax > 999 ? 999 : areaMax;

    // Garantir que cada bairro é uma string individual (sem vírgulas)
    const bairrosProcessados = [];
    bairrosSelecionados.forEach((bairro) => {
      if (typeof bairro === "string" && bairro.includes(",")) {
        // Dividir a string e adicionar cada parte como um bairro separado
        const partes = bairro
          .split(",")
          .map((parte) => parte.trim())
          .filter(Boolean);
        partes.forEach((parte) => bairrosProcessados.push(parte));
      } else {
        // Adicionar o bairro normalmente
        bairrosProcessados.push(bairro);
      }
    });

    const storeValues = {
      // Valores de texto (valores atuais, mesmo que não alterados)
      finalidade,
      categoriaSelecionada,
      cidadeSelecionada,
      bairrosSelecionados: bairrosProcessados, // Usar os bairros processados

      // Contagens (valores atuais, mesmo que não alterados)
      quartos: quartosSelecionados,
      banheiros: banheirosSelecionados,
      vagas: vagasSelecionadas,

      // Preços (valores atuais, mesmo que não alterados)
      precoMin: precoMinFinal !== null ? precoMinFinal.toString() : null,
      precoMax: precoMaxFinal !== null ? precoMaxFinal.toString() : null,
      precoMinimo: precoMinFinal !== null ? precoMinFinal.toString() : null,
      precoMaximo: precoMaxFinal !== null ? precoMaxFinal.toString() : null,

      // Áreas (valores atuais, mesmo que não alterados)
      areaMin: areaMinFinal ? areaMinFinal.toString() : "0",
      areaMax: areaMaxFinal ? areaMaxFinal.toString() : "0",
      areaMinima: areaMinFinal > 0 ? areaMinFinal.toString() : null,
      areaMaxima: areaMaxFinal > 0 ? areaMaxFinal.toString() : null,

      // Checkboxes (valores atuais, mesmo que não alterados)
      abaixoMercado,
      proximoMetro,

      // Flags
      filtrosBasicosPreenchidos,
    };

    // Atualiza o store com TODOS os valores atuais do componente
    setFilters(storeValues);

    // Após definir os valores, explicitamente ativa os filtros (aumentando o contador)
    aplicarFiltros();

    // Resetar a página para 1 quando aplicar filtros
    if (onFilter) onFilter();

    if (isClient && isMobile && setIsVisible) {
      setIsVisible(false);
    }
  };
  // Handler para limpar os filtros
  const handleLimparFiltros = () => {
    // Limpa o store
    limparFiltros();

    // Limpa os estados locais
    setCategoriaSelecionada("");
    setCidadeSelecionada("");
    setBairrosSelecionados([]);
    setQuartosSelecionados(null);
    setBanheirosSelecionados(null);
    setVagasSelecionadas(null);
    setPrecoMin(null);
    setPrecoMax(null);
    setAreaMin(0);
    setAreaMax(0);
    setAbaixoMercado(false);
    setProximoMetro(false);
    setBairroFilter("");

    // Limpar outros estados na página principal
    if (onFilter) onFilter();
  };

  // Layout horizontal estilo QuintoAndar - usando todo o espaço
  if (horizontal) {
    // Ref para o container de scroll
    const scrollRef = useRef(null);

    return (
      <div className="bg-white py-4 w-full border-b">
        <div className="max-w-full mx-auto px-2">
          <div className="flex items-center">
            {/* Container de filtros usando todo o espaço */}
            <div 
              ref={scrollRef}
              className="flex items-end gap-2 overflow-x-auto scrollbar-hide flex-1"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {/* Finalidade */}
              <div className="flex flex-col relative" ref={finalidadeRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Finalidade</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Selecionar"
                    value={finalidade || ""}
                    onClick={() => setFinalidadeExpanded(true)}
                    readOnly
                    className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[92px] flex-shrink-0"
                  />
                  
                  {/* Modal de seleção */}
                  <div
                    className={`fixed z-[9999] mt-1 bg-white border border-gray-300 rounded shadow-lg w-32 ${
                      !finalidadeExpanded ? "hidden" : ""
                    }`}
                    style={{
                      top: finalidadeRef.current ? finalidadeRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                      left: finalidadeRef.current ? finalidadeRef.current.getBoundingClientRect().left : 'auto'
                    }}
                  >
                    {/* Lista de opções */}
                    {["", "Comprar", "Alugar"].map((opcao) => (
                      <div key={opcao} 
                        className="px-2 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setFinalidade(opcao);
                          setFinalidadeExpanded(false);
                        }}
                      >
                        <label className="text-[11px] cursor-pointer flex-1">
                          {opcao || "Selecionar"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tipo */}
              <div className="flex flex-col relative" ref={tipoRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Tipo</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Todos"
                    value={categoriaSelecionada || ""}
                    onClick={() => setTipoExpanded(true)}
                    readOnly
                    className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[114px] flex-shrink-0"
                  />
                  
                  {/* Modal de seleção */}
                  <div
                    className={`fixed z-[9999] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto w-40 ${
                      !tipoExpanded ? "hidden" : ""
                    }`}
                    style={{
                      top: tipoRef.current ? tipoRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                      left: tipoRef.current ? tipoRef.current.getBoundingClientRect().left : 'auto'
                    }}
                  >
                    {/* Lista de opções */}
                    {["", ...categorias].map((categoria) => (
                      <div key={categoria || 'todos'} 
                        className="px-2 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setCategoriaSelecionada(categoria);
                          setTipoExpanded(false);
                        }}
                      >
                        <label className="text-[11px] cursor-pointer flex-1">
                          {categoria || "Todos"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cidade */}
              <div className="flex flex-col relative" ref={cidadeRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Cidade</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Todas"
                    value={cidadeSelecionada || ""}
                    onClick={() => setCidadeExpanded(true)}
                    readOnly
                    className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[114px] flex-shrink-0"
                  />
                  
                  {/* Modal de seleção */}
                  <div
                    className={`fixed z-[9999] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto w-40 ${
                      !cidadeExpanded ? "hidden" : ""
                    }`}
                    style={{
                      top: cidadeRef.current ? cidadeRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                      left: cidadeRef.current ? cidadeRef.current.getBoundingClientRect().left : 'auto'
                    }}
                  >
                    {/* Lista de opções */}
                    {["", ...cidades].map((cidade) => (
                      <div key={cidade || 'todas'} 
                        className="px-2 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setCidadeSelecionada(cidade);
                          setCidadeExpanded(false);
                          // Reseta o bairro selecionado quando a cidade muda
                          setBairrosSelecionados([]);
                          setBairroFilter("");
                        }}
                      >
                        <label className="text-[11px] cursor-pointer flex-1">
                          {cidade || "Todas"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bairro - Com modal para múltipla seleção */}
              <div className="flex flex-col relative" ref={bairrosRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Bairro</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder={
                      bairrosSelecionados.length > 0
                        ? bairrosSelecionados.length === 1
                          ? bairrosSelecionados[0]
                          : bairrosSelecionados.length <= 2
                            ? bairrosSelecionados.join(', ')
                            : `${bairrosSelecionados[0]} +${bairrosSelecionados.length - 1}`
                        : "Todos"
                    }
                    value={bairroFilter}
                    onChange={(e) => setBairroFilter(e.target.value)}
                    onClick={() => setBairrosExpanded(true)}
                    disabled={!cidadeSelecionada}
                    className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[120px] flex-shrink-0"
                    readOnly={!bairrosExpanded}
                  />
                  
                  {/* Contador de bairros selecionados */}
                  {bairrosSelecionados.length > 0 && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">
                      {bairrosSelecionados.length}
                    </div>
                  )}

                  {/* Modal de seleção múltipla - FORA DO OVERFLOW */}
                  <div
                    className={`fixed z-[9999] mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-48 overflow-y-auto w-80 ${
                      !cidadeSelecionada || !bairrosExpanded ? "hidden" : ""
                    }`}
                    style={{
                      top: bairrosRef.current ? bairrosRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                      left: bairrosRef.current ? bairrosRef.current.getBoundingClientRect().left : 'auto'
                    }}
                  >
                    {/* Controles superiores */}
                    <div className="flex justify-between items-center p-2 border-b border-gray-100 bg-gray-50">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setBairrosSelecionados(bairrosFiltrados)}
                          className="text-[10px] text-black hover:text-gray-600"
                        >
                          Selecionar todos
                        </button>
                        <button
                          onClick={() => setBairrosSelecionados([])}
                          className="text-[10px] text-black hover:text-gray-600"
                        >
                          Limpar todos
                        </button>
                      </div>
                      <button
                        onClick={() => setBairrosExpanded(false)}
                        className="text-[10px] text-gray-600 hover:text-black px-2 py-1 border border-gray-300 rounded"
                      >
                        Fechar
                      </button>
                    </div>

                    {/* Lista de bairros */}
                    {bairrosFiltrados.length > 0 ? (
                      bairrosFiltrados.map((bairro) => (
                        <div key={bairro} className={`flex items-center px-2 py-1 hover:bg-gray-50 ${bairrosSelecionados.includes(bairro) ? 'bg-gray-100' : ''}`}>
                          <input
                            type="checkbox"
                            id={`bairro-horizontal-${bairro}`}
                            checked={bairrosSelecionados.includes(bairro)}
                            onChange={() => handleBairroChange(bairro)}
                            className="mr-2 h-3 w-3 text-black border-gray-300 rounded"
                          />
                          <label
                            htmlFor={`bairro-horizontal-${bairro}`}
                            className={`text-[11px] cursor-pointer flex-1 ${bairrosSelecionados.includes(bairro) ? 'font-semibold' : ''}`}
                          >
                            {bairro}
                          </label>
                          {bairrosSelecionados.includes(bairro) && (
                            <span className="text-green-600 text-xs">✓</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-3 text-[11px] text-gray-500 text-center">
                        {bairroFilter ? "Nenhum bairro encontrado" : "Selecione uma cidade primeiro"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Quartos */}
              <div className="flex flex-col relative" ref={quartosRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Quartos</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Todos"
                    value={quartosSelecionados || ""}
                    onClick={() => setQuartosExpanded(true)}
                    readOnly
                    className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[70px] flex-shrink-0"
                  />
                  
                  {/* Modal de seleção */}
                  <div
                    className={`fixed z-[9999] mt-1 bg-white border border-gray-300 rounded shadow-lg w-28 ${
                      !quartosExpanded ? "hidden" : ""
                    }`}
                    style={{
                      top: quartosRef.current ? quartosRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                      left: quartosRef.current ? quartosRef.current.getBoundingClientRect().left : 'auto'
                    }}
                  >
                    {/* Lista de opções */}
                    {["", "1", "2", "3", "4+"].map((opcao) => (
                      <div key={opcao || 'todos'} 
                        className="px-2 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setQuartosSelecionados(opcao === "" ? null : opcao);
                          setQuartosExpanded(false);
                        }}
                      >
                        <label className="text-[11px] cursor-pointer flex-1">
                          {opcao || "Todos"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banheiros - COMENTADO TEMPORARIAMENTE */}
              {/* <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Banheiros</label>
                <select
                  className="px-3 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[95px] flex-shrink-0"
                  value={banheirosSelecionados || ""}
                  onChange={(e) => {
                    setBanheirosSelecionados(e.target.value === "" ? null : e.target.value);
                  }}
                >
                  <option value="">Todos</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div> */}

              {/* Vagas */}
              <div className="flex flex-col relative" ref={vagasRef}>
                <label className="text-[10px] font-medium text-gray-600 mb-1">Vagas</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Todas"
                    value={vagasSelecionadas || ""}
                    onClick={() => setVagasExpanded(true)}
                    readOnly
                    className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[70px] flex-shrink-0"
                  />
                  
                  {/* Modal de seleção */}
                  <div
                    className={`fixed z-[9999] mt-1 bg-white border border-gray-300 rounded shadow-lg w-28 ${
                      !vagasExpanded ? "hidden" : ""
                    }`}
                    style={{
                      top: vagasRef.current ? vagasRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                      left: vagasRef.current ? vagasRef.current.getBoundingClientRect().left : 'auto'
                    }}
                  >
                    {/* Lista de opções */}
                    {["", "1", "2", "3", "4+"].map((opcao) => (
                      <div key={opcao || 'todas'} 
                        className="px-2 py-2 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setVagasSelecionadas(opcao === "" ? null : opcao);
                          setVagasExpanded(false);
                        }}
                      >
                        <label className="text-[11px] cursor-pointer flex-1">
                          {opcao || "Todas"}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preço Mínimo */}
              <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Preço mín</label>
                <input
                  type="text"
                  placeholder="R$ 65.000"
                  value={precoMin ? `R$ ${precoMin.toLocaleString('pt-BR')}` : ""}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d]/g, '');
                    setPrecoMin(valor ? parseInt(valor) : null);
                  }}
                  className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[115px] flex-shrink-0"
                />
              </div>

              {/* Preço Máximo */}
              <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Preço máx</label>
                <input
                  type="text"
                  placeholder="R$ 65.000.000"
                  value={precoMax ? `R$ ${precoMax.toLocaleString('pt-BR')}` : ""}
                  onChange={(e) => {
                    const valor = e.target.value.replace(/[^\d]/g, '');
                    setPrecoMax(valor ? parseInt(valor) : null);
                  }}
                  className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[115px] flex-shrink-0"
                />
              </div>

              {/* Área Mínima */}
              <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Área mín</label>
                <input
                  type="number"
                  placeholder="0 m²"
                  value={areaMin || ""}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value) || 0;
                    setAreaMin(valor > 999 ? 999 : valor);
                  }}
                  max="999"
                  className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[75px] flex-shrink-0"
                />
              </div>

              {/* Área Máxima */}
              <div className="flex flex-col">
                <label className="text-[10px] font-medium text-gray-600 mb-1">Área máx</label>
                <input
                  type="number"
                  placeholder="999 m²"
                  value={areaMax || ""}
                  onChange={(e) => {
                    const valor = parseInt(e.target.value) || 0;
                    setAreaMax(valor > 999 ? 999 : valor);
                  }}
                  max="999"
                  className="px-2 py-2 text-xs bg-white border border-gray-300 cursor-pointer hover:border-gray-400 focus:border-black focus:outline-none w-[75px] flex-shrink-0"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-2 items-end ml-2">
                <button
                  onClick={handleAplicarFiltros}
                  className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 focus:outline-none whitespace-nowrap font-medium flex-shrink-0 border border-black"
                >
                  Aplicar
                </button>

                <button
                  onClick={handleLimparFiltros}
                  className="px-4 py-2 text-sm bg-gray-100 text-black hover:bg-gray-200 focus:outline-none whitespace-nowrap flex-shrink-0 border border-gray-300"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop para garantir que nada fique visível atrás do filtro - cobertura total da tela */}
      {isClient && isMobile && isVisible && (
        <div
          className="fixed inset-0 bg-black/70 z-[999998]"
          onClick={() => setIsVisible(false)}
          style={{ top: 0 }}
        />
      )}
      <div
        className={`bg-white text-black rounded-lg shadow-sm w-full overflow-y-auto scrollbar-hide ${
          isClient && isMobile && isVisible ? "fixed inset-0 z-[999999]" : ""
        } transition-all duration-300`}
        style={{
          top: isClient && isMobile && isVisible ? `${headerHeight}px` : "auto",
          height: isClient && isMobile && isVisible ? `calc(100vh - ${headerHeight}px)` : "auto",
          maxHeight:
            isClient && isMobile ? `calc(100vh - ${headerHeight}px)` : "calc(100vh - 200px)",
          // Ocultar completamente até que a inicialização esteja completa para evitar flash durante hidratação
          display: !uiVisible ? "none" : "block",
        }}
      >
        <div className="w-full p-4 sm:p-6">
          {/* Tipo de imóvel */}
          <div className="flex justify-between items-center sticky top-0 bg-white z-10 py-2">
            <h1 className="font-bold text-sm sm:text-base">Filtros Rápidos</h1>
            {isClient && isMobile && (
              <button
                onClick={() => setIsVisible(!isVisible)}
                className="flex items-center justify-center bg-zinc-200 font-bold text-xs py-2 px-4 rounded-md hover:bg-gray-100"
              >
                Ver resultados
              </button>
            )}
          </div>

          <div className="my-3 sm:my-4">
            <span className="block text-[10px] font-semibold text-gray-800 mb-1 mt-2">
              Finalidade
            </span>
            <select
              className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={finalidade === "Comprar" ? "comprar" : finalidade === "Alugar" ? "alugar" : ""}
              onChange={handleFinalidadeChange}
            >
              <option value="">Selecione a finalidade</option>
              <option value="comprar">Comprar</option>
              <option value="alugar">Alugar</option>
            </select>

            <span className="block text-[10px] font-semibold text-gray-800 mb-1 mt-2">
              Tipo de imóvel
            </span>
            <select
              className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={categoriaSelecionada}
              onChange={handleCategoriaChange}
            >
              <option value="">Todos os imóveis</option>
              {categorias.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria}
                </option>
              ))}
            </select>
            <span className="block text-[10px] font-semibold text-gray-800 mb-1 mt-2">Cidade</span>
            <select
              className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black"
              value={cidadeSelecionada}
              onChange={handleCidadeChange}
            >
              <option value="" className="text-xs">
                Todas as cidades
              </option>
              {cidades.map((cidade) => (
                <option className="text-xs" key={cidade} value={cidade}>
                  {cidade}
                </option>
              ))}
            </select>

            {/* Área de bairros com múltipla seleção */}
            <div className="mt-2" ref={bairrosRef}>
              <span className="block text-[10px] font-semibold text-gray-800 mb-1">Bairros</span>
              <div className="relative">
                <input
                  type="text"
                  placeholder={
                    bairrosSelecionados.length > 0
                      ? bairrosSelecionados.length === 1
                        ? bairrosSelecionados[0]
                        : bairrosSelecionados.length <= 2
                          ? bairrosSelecionados.join(', ')
                          : `${bairrosSelecionados[0]}, +${bairrosSelecionados.length - 1}`
                      : "Selecionar bairros"
                  }
                  value={bairroFilter}
                  onChange={(e) => setBairroFilter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white text-xs p-2 focus:outline-none focus:ring-1 focus:ring-black mb-1"
                  onClick={() => setBairrosExpanded(true)}
                  disabled={!cidadeSelecionada}
                />

                {/* Contador de bairros selecionados */}
                {bairrosSelecionados.length > 0 && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                    {bairrosSelecionados.length}
                  </div>
                )}

                {/* Área de checkboxes para bairros */}
                <div
                  className={`mt-1 border border-gray-200 rounded-md bg-white max-h-40 overflow-y-auto ${
                    !cidadeSelecionada || !bairrosExpanded ? "hidden" : ""
                  }`}
                >
                  {/* Botões de selecionar todos/limpar todos */}
                  {bairrosFiltrados.length > 0 && (
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
                  )}

                  {bairrosFiltrados.length > 0 ? (
                    bairrosFiltrados.map((bairro) => (
                      <div key={bairro} className={`flex items-center px-2 py-1 hover:bg-gray-50 ${bairrosSelecionados.includes(bairro) ? 'bg-gray-100' : ''}`}>
                        <input
                          type="checkbox"
                          id={`bairro-${bairro}`}
                          checked={bairrosSelecionados.includes(bairro)}
                          onChange={() => handleBairroChange(bairro)}
                          className="mr-2 h-4 w-4"
                        />
                        <label
                          htmlFor={`bairro-${bairro}`}
                          className={`text-xs cursor-pointer flex-1 ${bairrosSelecionados.includes(bairro) ? 'font-semibold' : ''}`}
                        >
                          {bairro}
                        </label>
                        {bairrosSelecionados.includes(bairro) && (
                          <span className="text-green-600 text-sm">✓</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="px-2 py-1 text-xs text-gray-500">
                      {bairroFilter ? "Nenhum bairro encontrado" : "Selecione uma cidade primeiro"}
                    </div>
                  )}
                </div>

                {/* Botão para fechar a lista expandida em mobile */}
                {bairrosExpanded && (
                  <button
                    onClick={() => setBairrosExpanded(false)}
                    className="text-xs text-black bg-gray-100 w-full py-1 rounded-b-md"
                  >
                    Fechar
                  </button>
                )}
              </div>

              {/* Lista de bairros selecionados */}
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
          </div>

          <Separator />

          {/* Grupos de opções */}
          <OptionGroup
            label="Quartos"
            options={opcoes}
            selectedValue={quartosSelecionados}
            onChange={handleQuartosChange}
          />
          {/* Banheiros - COMENTADO TEMPORARIAMENTE */}
          {/* <OptionGroup
            label="Banheiros"
            options={opcoes}
            selectedValue={banheirosSelecionados}
            onChange={handleBanheirosChange}
          /> */}
          <OptionGroup
            label="Vagas"
            options={opcoes}
            selectedValue={vagasSelecionadas}
            onChange={handleVagasChange}
          />

          <Separator />

          {/* Grupos de inputs */}
          <div className="mb-4">
            <span className="block text-[10px] font-semibold text-gray-800 mb-2">Preço</span>
            <div className="flex gap-2">
              <InputPreco
                placeholder="R$ 65.000"
                value={precoMin}
                onChange={(valor) => handlePrecoChange(valor, setPrecoMin)}
              />
              <InputPreco
                placeholder="R$ 65.000.000"
                value={precoMax}
                onChange={(valor) => handlePrecoChange(valor, setPrecoMax)}
              />
            </div>
          </div>

          {/* Checkboxes */}
          {/* <Checkbox
            id="abaixoMercado"
            label="Apenas condomínios"
            showInfo={true}
            checked={abaixoMercado}
            onChange={setAbaixoMercado}
          /> */}

          <Separator />

          {/* Área com limite de 3 dígitos */}
          <div className="mb-4">
            <span className="block text-[10px] font-semibold text-gray-800 mb-2">
              Área do imóvel
            </span>
            <div className="flex gap-2">
              <InputArea
                placeholder="0 m²"
                value={areaMin}
                onChange={(valor) => handleAreaChange(valor, setAreaMin)}
              />
              <InputArea
                placeholder="0 m²"
                value={areaMax}
                onChange={(valor) => handleAreaChange(valor, setAreaMax)}
              />
            </div>
          </div>

          {/* <Checkbox
            id="proximoMetro"
            label="Próximo ao metrô/trem"
            checked={proximoMetro}
            onChange={setProximoMetro}
          /> */}

          {/* Botões */}
          <div
            className={`${
              isClient && isMobile
                ? "fixed bottom-0 left-0 right-0 w-full px-4 py-4 bg-white border-t border-gray-200 shadow-lg z-[999999]"
                : "sticky bottom-0 bg-white pt-3 pb-1 z-10"
            }`}
          >
            <div className={isClient && isMobile ? "pb-safe" : ""}>
              <button
                onClick={handleAplicarFiltros}
                className="w-full bg-black shadow-md text-white px-4 py-3 rounded-md mb-2 text-xs sm:text-sm"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={handleLimparFiltros}
                className="w-full bg-zinc-300/80 shadow-md text-black px-4 py-3 rounded-md text-xs sm:text-sm"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
