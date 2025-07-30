import { useState, useEffect, useRef, useCallback } from "react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { REQUIRED_FIELDS } from "../FieldGroup";
import useImovelStore from "@/app/admin/store/imovelStore";
import { getCorretorById } from "@/app/admin/services/corretor";
import { generateUniqueCode } from "@/app/utils/idgenerate";

// Implementação alternativa do debounce
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateRandomCode = async () => {
  return generateUniqueCode();
};

const MAX_MONETARY_VALUE = 999999999;

const INITIAL_FORM_DATA = {
  Codigo: "",
  CodigoOriginal: "",
  Empreendimento: "",
  TituloSite: "",
  Categoria: "Apartamento",
  Situacao: "PRONTO NOVO",
  Status: "VENDA",
  Slug: "",
  Destacado: "Não",
  Condominio: "Não",
  CondominioDestaque: "Não",
  Ativo: "Sim",
  Construtora: "",
  Endereco: "",
  Numero: "",
  Complemento: "",
  Bairro: "",
  BairroComercial: "",
  Cidade: "",
  UF: "",
  CEP: "",
  Latitude: "",
  Longitude: "",
  Regiao: "",
  AreaPrivativa: "",
  AreaTotal: "",
  Dormitorios: "",
  Suites: "",
  BanheiroSocialQtd: "",
  Vagas: "",
  DataEntrega: "",
  AnoConstrucao: "",
  ValorAntigo: "0",
  ValorAluguelSite: "0",
  ValorCondominio: "0",
  ValorIptu: "0",
  DescricaoUnidades: "",
  DescricaoDiferenciais: "",
  DestaquesDiferenciais: "",
  DestaquesLazer: "",
  DestaquesLocalizacao: "",
  FichaTecnica: "",
  Tour360: "",
  IdCorretor: "",
  Corretor: "",
  EmailCorretor: "",
  CelularCorretor: "",
  Imobiliaria: "",
  Video: null,
  Foto: [],
  isLoadingCEP: false,
  isLoadingCorretor: false,
  cepError: null,
  corretorError: null
};

/*
 * Hook para gerenciar formulário de imóveis
 * 
 * @param {Function} onAutoSave - Callback opcional para salvamento automático após correção de endereço
 *                                Deve retornar Promise<boolean> indicando sucesso/falha do salvamento
 *                                Recebe objeto: { enderecoAntigo, enderecoNovo, motivo }
 * 
 * Exemplo de uso:
 * const { formData, handleChange, ... } = useImovelForm(async (dados) => {
 *   try {
 *     const resultado = await salvarImovel(formData);
 *     return resultado.success;
 *   } catch (error) {
 *     console.error('Erro ao salvar:', error);
 *     return false;
 *   }
 * });
 */
export const useImovelForm = (onAutoSave) => {
  const provider = useRef(new OpenStreetMapProvider());
  const fileInputRef = useRef(null);
  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

  // 🎯 REFS PARA CONTROLE DE PROTEÇÃO
  const correcaoEnderecoExecutada = useRef(false);
  const ultimaMudancaFotos = useRef(0);
  const ultimoSalvamentoLocalStorage = useRef(0);

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [displayValues, setDisplayValues] = useState({
    ValorAntigo: "R$ 0",
    ValorAluguelSite: "R$ 0",
    ValorCondominio: "R$ 0",
    ValorIptu: "R$ 0",
  });

  const [newImovelCode, setNewImovelCode] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [validation, setValidation] = useState({
    isFormValid: false,
    photoCount: 0,
    requiredPhotoCount: 5,
    fieldValidation: {},
  });

  // Funções de formatação monetária SEM decimais
  const formatCurrency = useCallback((value) => {
    const num = typeof value === 'string' 
      ? parseInt(value.replace(/\D/g, ''), 10) 
      : Math.floor(Number(value || 0));

    return isNaN(num) 
      ? "R$ 0" 
      : num.toLocaleString("pt-BR", { 
          style: "currency", 
          currency: "BRL",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0
        });
  }, []);

  const parseCurrency = useCallback((value) => {
    const digitsOnly = (value?.toString() || "").replace(/\D/g, '');
    const intValue = parseInt(digitsOnly || "0", 10);
    const safeValue = Math.min(Math.max(intValue, 0), MAX_MONETARY_VALUE);
    
    return isNaN(safeValue) ? "0" : safeValue.toString();
  }, []);

  const formatCurrencyInput = useCallback((value) => {
    const digitsOnly = (value?.toString() || "").replace(/\D/g, '');
    const intValue = parseInt(digitsOnly || "0", 10);
    
    return intValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }, []);

  // ✅ FUNÇÃO UTILITÁRIA: Mostrar notificações visuais
  const mostrarNotificacao = useCallback((titulo, subtitulo, tipo = 'success') => {
    if (typeof window === 'undefined') return;
    
    const cores = {
      success: '#10b981',
      warning: '#f59e0b', 
      info: '#3b82f6',
      error: '#ef4444'
    };
    
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed; 
        top: 20px; 
        right: 20px; 
        background: ${cores[tipo]}; 
        color: white; 
        padding: 12px 20px; 
        border-radius: 8px; 
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        font-size: 14px;
        font-weight: 500;
        max-width: 400px;
        animation: slideInRight 0.3s ease-out;
      ">
        ${titulo}
        ${subtitulo ? `<div style="font-size: 12px; opacity: 0.9; margin-top: 4px;">${subtitulo}</div>` : ''}
      </div>
      <style>
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      </style>
    `;
    
    document.body.appendChild(notification.firstElementChild);
    
    // Remover notificação após 5 segundos
    setTimeout(() => {
      const notif = document.querySelector('[style*="position: fixed"][style*="top: 20px"][style*="right: 20px"]');
      if (notif) {
        notif.style.animation = 'slideOutRight 0.3s ease-in forwards';
        setTimeout(() => notif.remove(), 300);
      }
    }, 5000);
  }, []);

  // ✅ NOVA FUNÇÃO: Detectar e corrigir endereços incompletos da migração
  const corrigirEnderecoIncompleto = useCallback(async (endereco, cep, autoSave = false) => {
    // 🛡️ PROTEÇÃO 1: Não executar mais de uma vez
    if (correcaoEnderecoExecutada.current) {
      console.log('🛡️ CORREÇÃO CEP: Já executada anteriormente - pulando');
      return false;
    }
    
    // 🛡️ PROTEÇÃO 2: Não executar se fotos foram alteradas recentemente (últimos 15 segundos)
    const tempoDesdeUltimaMudanca = Date.now() - ultimaMudancaFotos.current;
    if (ultimaMudancaFotos.current > 0 && tempoDesdeUltimaMudanca < 15000) {
      console.log('🛡️ CORREÇÃO CEP: Fotos alteradas recentemente - pulando para preservar mudanças manuais');
      return false;
    }
    
    if (!endereco || !cep) {
      console.log('🛡️ CORREÇÃO CEP: Endereço ou CEP inválido');
      return false;
    }
    
    console.log('🔧 CORREÇÃO CEP: Iniciando análise...', { endereco, cep });
    
    // Marcar como executada ANTES de começar
    correcaoEnderecoExecutada.current = true;
    
    // Lista de prefixos válidos de logradouro
    const prefixosValidos = [
      'rua', 'avenida', 'alameda', 'travessa', 'praça', 'largo', 'rodovia',
      'estrada', 'via', 'quadra', 'setor', 'conjunto', 'vila', 'jardim',
      'parque', 'residencial', 'condomínio', 'loteamento'
    ];
    
    // Verificar se o endereço já tem um prefixo válido
    const enderecoLower = endereco.toLowerCase().trim();
    const temPrefixo = prefixosValidos.some(prefixo => 
      enderecoLower.startsWith(prefixo + ' ')
    );
    
    // Se já tem prefixo, não precisa corrigir
    if (temPrefixo) {
      console.log('✅ CORREÇÃO CEP: Endereço já está completo:', endereco);
      return false;
    }
    
    // Se não tem prefixo, consultar ViaCEP para corrigir
    console.log('🔧 CORREÇÃO CEP: Endereço incompleto detectado:', endereco, '- CEP:', cep);
    
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      console.log('❌ CORREÇÃO CEP: CEP inválido');
      return false;
    }
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) return false;
      
      const data = await response.json();
      if (data.erro || !data.logradouro) return false;
      
      // Verificar se o endereço da API é diferente e mais completo
      if (data.logradouro && data.logradouro.toLowerCase() !== enderecoLower) {
        console.log('✅ CORREÇÃO CEP: Endereço corrigido:', endereco, '→', data.logradouro);
        
        // Buscar coordenadas para o endereço corrigido
        let coords = null;
        try {
          const query = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`;
          const results = await provider.current.search({ query });
          coords = results[0] ? { 
            latitude: results[0].y?.toString() || "", 
            longitude: results[0].x?.toString() || "" 
          } : null;
        } catch (error) {
          console.error("CORREÇÃO CEP: Erro ao buscar coordenadas:", error);
        }
        
        // 🎯 ATUALIZAÇÃO SUPER ESPECÍFICA - APENAS CAMPOS DE ENDEREÇO
        setFormData(prevFormData => {
          console.log('🔧 CORREÇÃO CEP: Atualizando APENAS campos de endereço...');
          console.log('🔧 CORREÇÃO CEP: Fotos ANTES:', prevFormData.Foto?.length);
          console.log('🔧 CORREÇÃO CEP: Primeira foto ANTES:', prevFormData.Foto?.[0]?.Codigo?.substring(0, 15));
          
          const updated = {
            ...prevFormData, // ✅ MANTER TUDO EXATAMENTE COMO ESTÁ
            // Atualizar APENAS campos específicos de endereço
            Endereco: data.logradouro,
            Bairro: data.bairro || prevFormData.Bairro,
            Cidade: data.localidade || prevFormData.Cidade,
            UF: data.uf || prevFormData.UF,
            Latitude: coords?.latitude || prevFormData.Latitude,
            Longitude: coords?.longitude || prevFormData.Longitude
            // ✅ CRÍTICO: NÃO TOCAR EM MAIS NADA - especialmente Foto, Video, etc.
          };
          
          console.log('🔧 CORREÇÃO CEP: Fotos DEPOIS:', updated.Foto?.length);
          console.log('🔧 CORREÇÃO CEP: Primeira foto DEPOIS:', updated.Foto?.[0]?.Codigo?.substring(0, 15));
          console.log('🔧 CORREÇÃO CEP: Arrays são idênticos?', prevFormData.Foto === updated.Foto);
          
          return updated;
        });
        
        // ✅ SALVAMENTO AUTOMÁTICO MELHORADO
        if (autoSave && typeof onAutoSave === 'function') {
          setTimeout(async () => {
            console.log('💾 CORREÇÃO CEP: Iniciando salvamento automático...');
            
            try {
              const resultado = await onAutoSave({
                enderecoAntigo: endereco,
                enderecoNovo: data.logradouro,
                motivo: 'correção automática de endereço incompleto'
              });
              
              if (resultado) {
                mostrarNotificacao(`✅ Endereço corrigido e salvo automaticamente!`, `${endereco} → ${data.logradouro}`, 'success');
              } else {
                mostrarNotificacao(`⚠️ Endereço corrigido, mas falha ao salvar`, `Por favor, salve manualmente`, 'warning');
              }
            } catch (error) {
              console.error('CORREÇÃO CEP: Erro no salvamento automático:', error);
              mostrarNotificacao(`⚠️ Endereço corrigido, mas falha ao salvar`, `Por favor, salve manualmente`, 'warning');
            }
          }, 3000); // 🎯 3 segundos para garantir que formData foi atualizado
        } else if (autoSave) {
          // Se não há callback, apenas mostrar que foi corrigido
          setTimeout(() => {
            mostrarNotificacao(`✅ Endereço corrigido automaticamente!`, `${endereco} → ${data.logradouro}`, 'info');
          }, 1000);
        }
        
        return true; // Indica que foi corrigido
      }
    } catch (error) {
      console.error('CORREÇÃO CEP: Erro ao corrigir endereço:', error);
    }
    
    return false;
  }, [mostrarNotificacao, onAutoSave]);

  // Inicialização do formulário
  useEffect(() => {
    const initializeForm = async () => {
      console.log('🚀 INICIALIZAÇÃO: Iniciando formulário...', { 
        isAutomacao, 
        codigoImovel: imovelSelecionado?.Codigo,
        timestamp: new Date().toISOString()
      });

      try {
        // Caso 1: Imóvel de automação (sempre gerar novo código)
        if (isAutomacao) {
          const newCode = await generateRandomCode();
          setNewImovelCode(newCode);
          setFormData(prev => ({
            ...prev,
            ...imovelSelecionado,
            Codigo: newCode,
            CodigoOriginal: ''
          }));
          return;
        }

        // Caso 2: Edição de imóvel existente (manter código original)
        if (imovelSelecionado?.Codigo && !isAutomacao) {
          console.log('📝 INICIALIZAÇÃO: Carregando imóvel existente:', imovelSelecionado.Codigo);
          console.log('📸 INICIALIZAÇÃO: Fotos do imóvel:', imovelSelecionado.Foto?.length || 0);
          console.log('📸 INICIALIZAÇÃO: Primeira foto:', imovelSelecionado.Foto?.[0]?.Codigo?.substring(0, 15));
          console.log('📸 INICIALIZAÇÃO: Ordem das fotos:', imovelSelecionado.Foto?.map(f => ({ C: f.Codigo?.substring(0, 10), O: f.Ordem })));
          
          setFormData(prev => ({
            ...prev,
            ...imovelSelecionado,
            CodigoOriginal: imovelSelecionado.Codigo
          }));
          
          setDisplayValues({
            ValorAntigo: formatCurrencyInput(imovelSelecionado.ValorAntigo?.toString() || "0"),
            ValorAluguelSite: formatCurrencyInput(imovelSelecionado.ValorAluguelSite?.toString() || "0"),
            ValorCondominio: formatCurrencyInput(imovelSelecionado.ValorCondominio?.toString() || "0"),
            ValorIptu: formatCurrencyInput(imovelSelecionado.ValorIptu?.toString() || "0")
          });
          
          // ✅ CORREÇÃO AUTOMÁTICA COM DELAY E PROTEÇÃO TOTAL
          if (imovelSelecionado.Endereco && imovelSelecionado.CEP) {
            console.log('⏰ INICIALIZAÇÃO: Agendando correção de endereço em 8 segundos...');
            setTimeout(() => {
              console.log('🔧 INICIALIZAÇÃO: Executando correção de endereço...');
              console.log('🔧 INICIALIZAÇÃO: Fotos no momento da correção:', formData.Foto?.length);
              corrigirEnderecoIncompleto(imovelSelecionado.Endereco, imovelSelecionado.CEP, true);
            }, 8000); // 🎯 8 segundos para garantir inicialização completa
          }
          
          return;
        }

        // Caso 3: Novo imóvel (gerar novo código)
        if (!imovelSelecionado) {
          const newCode = await generateRandomCode();
          setNewImovelCode(newCode);
          setFormData(prev => ({
            ...prev,
            Codigo: newCode,
            CodigoOriginal: newCode
          }));
        }
      } catch (error) {
        console.error("INICIALIZAÇÃO: Erro ao inicializar formulário:", error);
      }
    };

    // Reset das refs quando muda o imóvel
    correcaoEnderecoExecutada.current = false;
    ultimaMudancaFotos.current = 0;
    ultimoSalvamentoLocalStorage.current = 0;

    initializeForm();
  }, [isAutomacao, imovelSelecionado?.Codigo, formatCurrencyInput, corrigirEnderecoIncompleto]);

  // ✅ SALVAMENTO NO LOCALSTORAGE OTIMIZADO COM PROTEÇÃO
  useEffect(() => {
    if (!formData.Codigo) return;
    
    // Debounce para evitar salvamentos excessivos
    const timer = setTimeout(() => {
      try {
        const agora = Date.now();
        
        // Evitar salvamentos muito frequentes (mínimo 2 segundos entre salvamentos)
        if (agora - ultimoSalvamentoLocalStorage.current < 2000) {
          return;
        }
        
        localStorage.setItem('imovelFormDraft', JSON.stringify(formData));
        ultimoSalvamentoLocalStorage.current = agora;
        
        console.log('💾 LOCALSTORAGE: Draft salvo', { 
          codigo: formData.Codigo?.substring(0, 10), 
          fotos: formData.Foto?.length || 0,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.error('❌ LOCALSTORAGE: Erro ao salvar draft:', error);
      }
    }, 1500); // 1.5 segundos de debounce
    
    return () => clearTimeout(timer);
  }, [formData]);

  // Funções auxiliares
  const maskDate = useCallback((value) => {
    if (!value) return "";
    return value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/^(\d{2})(\d)/, "$1/$2")
      .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
  }, []);

  const debouncedFetchCoordinates = useCallback(
    debounce(async (address) => {
      if (!address) return null;
      
      try {
        const query = `${address.logradouro}, ${address.bairro}, ${address.localidade}, ${address.uf}`;
        const results = await provider.current.search({ query });
        return results[0] ? { 
          latitude: results[0].y?.toString() || "", 
          longitude: results[0].x?.toString() || "" 
        } : null;
      } catch (error) {
        console.error("Erro ao buscar coordenadas:", error);
        return null;
      }
    }, 500),
    []
  );

  const fetchAddress = useCallback(async (cep) => {
    const cleanCep = (cep || "").replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    setFormData(prev => ({ ...prev, isLoadingCEP: true, cepError: null }));

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) throw new Error("Erro na resposta da API");
      
      const data = await response.json();
      if (data.erro) {
        setFormData(prev => ({ 
          ...prev, 
          cepError: "CEP não encontrado",
          isLoadingCEP: false 
        }));
        return;
      }

      const coords = await debouncedFetchCoordinates(data);
      setFormData(prev => ({
        ...prev,
        Endereco: data.logradouro || prev.Endereco,
        Bairro: data.bairro || prev.Bairro,
        Cidade: data.localidade || prev.Cidade,
        UF: data.uf || prev.UF,
        Latitude: coords?.latitude || prev.Latitude,
        Longitude: coords?.longitude || prev.Longitude,
        isLoadingCEP: false,
        cepError: null
      }));
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
      setFormData(prev => ({ 
        ...prev, 
        cepError: "Falha ao consultar CEP",
        isLoadingCEP: false 
      }));
    }
  }, [debouncedFetchCoordinates]);

  // ✅ FUNÇÃO handleChange CORRIGIDA - ACEITA AMBOS OS FORMATOS
  const handleChange = useCallback((fieldOrEvent, valueOrUndefined) => {
    console.log('🔄 handleChange chamado:', { field: typeof fieldOrEvent === 'string' ? fieldOrEvent : fieldOrEvent?.target?.name, timestamp: Date.now() });
    
    // ✅ DETECTAR se é chamada direta (field, value) ou evento (e.target)
    let name, value;
    
    if (typeof fieldOrEvent === 'string' && valueOrUndefined !== undefined) {
      // 🎯 CHAMADA DIRETA: onChange("Video", videoData)
      name = fieldOrEvent;
      value = valueOrUndefined;
    } else if (fieldOrEvent?.target) {
      // 🎯 EVENTO: onChange(e) onde e.target.name e e.target.value
      name = fieldOrEvent.target.name;
      value = fieldOrEvent.target.value;
    } else {
      console.error('❌ handleChange: formato inválido:', { fieldOrEvent, valueOrUndefined });
      return;
    }

    // 🎯 MARCAR TIMESTAMP PARA CAMPOS IMPORTANTES (especialmente fotos/vídeo)
    if (name === 'Foto' || name === 'Video') {
      ultimaMudancaFotos.current = Date.now();
      console.log('📸 handleChange: Mudança em mídia detectada - timestamp atualizado');
    }

    // Debug específico para Video
    if (name === "Video") {
      console.log('🎥 PROCESSANDO VIDEO no handleChange:');
      console.log('🎥 Value recebido:', value);
      console.log('🎥 Tipo do value:', typeof value);
      console.log('🎥 Value é objeto?', typeof value === 'object' && value !== null);
      console.log('🎥 Keys do value:', value ? Object.keys(value) : 'N/A');
    }

    // ✅ SE FOR CAMPO VIDEO, ATUALIZAR COM VALIDAÇÃO DE REMOÇÃO
    if (name === "Video") {
      console.log('🎥 Atualizando Video diretamente no formData');
      
      // ✅ LÓGICA: Se value é falsy, vazio ou objeto vazio, setar como null
      let processedValue = value;
      
      // Verificar se o vídeo está sendo removido
      if (!value || 
          value === "" || 
          value === null || 
          value === undefined ||
          (typeof value === 'object' && value !== null && Object.keys(value).length === 0) ||
          (typeof value === 'object' && value !== null && !value.url && !value.provider && !value.videoId)) {
        processedValue = null;
        console.log('🎥 Video sendo REMOVIDO - setando como null');
      }
      
      setFormData(prev => {
        const updated = { ...prev, Video: processedValue };
        console.log('🎥 FormData Video ANTES:', prev.Video);
        console.log('🎥 FormData Video DEPOIS:', updated.Video);
        return updated;
      });
      console.log('🎥 Video atualizado com sucesso!');
      return;
    }

    // Tratamento específico para campos numéricos
    const numericFields = ['Dormitorios', 'Suites', 'Vagas', 'BanheiroSocialQtd'];
    if (numericFields.includes(name)) {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      return;
    }

    // Campos monetários
    const monetaryFields = ['ValorAntigo', 'ValorAluguelSite', 'ValorCondominio', 'ValorIptu'];
    if (monetaryFields.includes(name)) {
      const numericValue = parseCurrency(value);
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      setDisplayValues(prev => ({ 
        ...prev, 
        [name]: formatCurrencyInput(value) 
      }));
      return;
    }

    // Handlers especiais
    const specialHandlers = {
      DataEntrega: () => setFormData(prev => ({ ...prev, [name]: maskDate(value) })),
      CEP: () => {
        const formattedCEP = value.replace(/\D/g, "").slice(0, 8);
        setFormData(prev => ({ ...prev, [name]: formattedCEP }));
        if (formattedCEP.length === 8) fetchAddress(formattedCEP);
      },
      Empreendimento: () => {
        setFormData(prev => ({ 
          ...prev, 
          [name]: value, 
          Slug: formatterSlug(value) || prev.Slug 
        }));
      },
      IdCorretor: () => {
        setFormData(prev => ({
          ...prev,
          [name]: value,
          Corretor: "",
          EmailCorretor: "",
          CelularCorretor: "",
          Imobiliaria: "",
          isLoadingCorretor: true,
          corretorError: null
        }));

        if (value?.trim()) {
          getCorretorById(value.trim())
            .then(corretor => {
              if (corretor) {
                setFormData(prev => ({
                  ...prev,
                  Corretor: corretor.Nome || "",
                  EmailCorretor: corretor.Email || "",
                  CelularCorretor: corretor.Celular || "",
                  Imobiliaria: corretor.Imobiliaria || "",
                  isLoadingCorretor: false
                }));
              }
            })
            .catch(error => {
              console.error("Erro ao buscar corretor:", error);
              setFormData(prev => ({
                ...prev,
                corretorError: "Corretor não encontrado",
                isLoadingCorretor: false
              }));
            });
        }
      }
    };

    // Verifica se é um campo especial
    if (specialHandlers[name]) {
      specialHandlers[name]();
      return;
    }

    // Caso padrão para todos os outros campos
    setFormData(prev => ({ ...prev, [name]: value }));
  }, [maskDate, fetchAddress, parseCurrency, formatCurrencyInput]);

  // Funções de manipulação de imagens
  const addImage = useCallback(() => setShowImageModal(true), []);
  
  const addSingleImage = useCallback((url) => {
    if (!url?.trim()) return;

    ultimaMudancaFotos.current = Date.now(); // 🎯 Marcar mudança

    const cleanUrl = (() => {
      try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith("/_next/image")) {
          const innerUrl = parsed.searchParams.get("url");
          return decodeURIComponent(innerUrl || url);
        }
        return url;
      } catch {
        return url;
      }
    })();

    setFormData(prev => {
      const currentFotos = Array.isArray(prev.Foto) ? prev.Foto : [];
      const newFoto = {
        Codigo: `img-${Date.now()}`,
        Foto: cleanUrl.trim(),
        Destaque: "Nao",
        Ordem: currentFotos.length + 1
      };
      
      console.log('📸 addSingleImage: Adicionando foto', { 
        codigo: newFoto.Codigo.substring(0, 15), 
        ordem: newFoto.Ordem,
        totalAntes: currentFotos.length,
        totalDepois: currentFotos.length + 1
      });
      
      return {
        ...prev,
        Foto: [...currentFotos, newFoto]
      };
    });
  }, []);

  const updateImage = useCallback((codigo, newUrl) => {
    if (!codigo || !newUrl?.trim()) return;
    
    ultimaMudancaFotos.current = Date.now(); // 🎯 Marcar mudança
    
    setFormData(prev => ({
      ...prev,
      Foto: Array.isArray(prev.Foto) 
        ? prev.Foto.map(img => 
            img.Codigo === codigo ? { ...img, Foto: newUrl.trim() } : img
          )
        : []
    }));

    console.log('📸 updateImage: Foto atualizada', { codigo: codigo.substring(0, 15) });
  }, []);

  const removeImage = useCallback((codigo) => {
    if (!codigo) return;
    
    ultimaMudancaFotos.current = Date.now(); // 🎯 Marcar mudança
    
    setFormData(prev => {
      const fotosFiltered = Array.isArray(prev.Foto)
        ? prev.Foto.filter(img => img.Codigo !== codigo)
        : [];
      
      // Reordenar após remoção
      const fotosReordenadas = fotosFiltered.map((img, i) => ({ ...img, Ordem: i + 1 }));
      
      console.log('📸 removeImage: Foto removida e lista reordenada', { 
        codigoRemovido: codigo.substring(0, 15),
        totalAntes: prev.Foto?.length || 0,
        totalDepois: fotosReordenadas.length
      });
      
      return {
        ...prev,
        Foto: fotosReordenadas
      };
    });
  }, []);

  const removeAllImages = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!confirm("⚠️ Tem certeza que deseja remover TODAS as imagens?")) return;
    if (!confirm("🚨 Esta ação é irreversível! Confirmar remoção total?")) return;
    
    ultimaMudancaFotos.current = Date.now(); // 🎯 Marcar mudança
    
    setFormData(prev => {
      console.log('📸 removeAllImages: Todas as fotos removidas', { totalAntes: prev.Foto?.length || 0 });
      return { ...prev, Foto: [] };
    });
  }, []);

  const setImageAsHighlight = useCallback((codigo) => {
    if (!codigo) return;
    
    ultimaMudancaFotos.current = Date.now(); // 🎯 Marcar mudança
    
    setFormData(prev => ({
      ...prev,
      Foto: Array.isArray(prev.Foto)
        ? prev.Foto.map(img => ({
            ...img,
            Destaque: img.Codigo === codigo ? "Sim" : "Nao"
          }))
        : []
    }));

    console.log('📸 setImageAsHighlight: Foto marcada como destaque', { codigo: codigo.substring(0, 15) });
  }, []);

  // ✅ FUNÇÃO changeImagePosition COMPLETAMENTE CORRIGIDA COM PROTEÇÃO TOTAL
  const changeImagePosition = useCallback((codigo, newPos) => {
    console.log('🔄 MUDANÇA DE POSIÇÃO INICIADA:', {
      timestamp: new Date().toISOString(),
      codigo: codigo?.substring(0, 15),
      newPos,
      formDataFotosAtual: formData.Foto?.length
    });

    if (!codigo || !Number.isInteger(newPos) || newPos < 1) {
      console.error('❌ MUDANÇA DE POSIÇÃO: Parâmetros inválidos', { codigo, newPos });
      return;
    }
    
    // 🎯 MARCAR TIMESTAMP DA ÚLTIMA MUDANÇA DE FOTOS
    ultimaMudancaFotos.current = Date.now();
    console.log('📸 changeImagePosition: Timestamp de mudança atualizado');
    
    setFormData(prev => {
      if (!Array.isArray(prev.Foto)) {
        console.error('❌ MUDANÇA DE POSIÇÃO: prev.Foto não é array', prev.Foto);
        return prev;
      }
      
      console.log('📸 MUDANÇA DE POSIÇÃO: Estado ANTES:', {
        totalFotos: prev.Foto.length,
        fotos: prev.Foto.map(f => ({ 
          Codigo: f.Codigo?.substring(0, 10), 
          Ordem: f.Ordem, 
          Nome: f.Foto?.split('/').pop()?.substring(0, 15) 
        }))
      });
      
      // Ordenar por Ordem atual antes de manipular
      const sorted = [...prev.Foto].sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0));
      const currentIdx = sorted.findIndex(img => img.Codigo === codigo);
      
      if (currentIdx === -1) {
        console.error('❌ MUDANÇA DE POSIÇÃO: Foto não encontrada', { 
          codigo: codigo.substring(0, 15), 
          disponíveis: sorted.map(f => f.Codigo?.substring(0, 10))
        });
        return prev;
      }

      // Remover foto da posição atual
      const [moved] = sorted.splice(currentIdx, 1);
      
      // Ajustar nova posição dentro dos limites
      const adjustedPos = Math.min(Math.max(newPos, 1), sorted.length + 1);
      
      // Inserir na nova posição
      sorted.splice(adjustedPos - 1, 0, moved);
      
      // Reordenar todas as fotos com nova sequência
      const newFotos = sorted.map((img, idx) => ({ ...img, Ordem: idx + 1 }));
      
      console.log('✅ MUDANÇA DE POSIÇÃO: Estado DEPOIS:', {
        totalFotos: newFotos.length,
        fotoMovida: { 
          codigo: moved.Codigo?.substring(0, 10), 
          posicaoAntiga: currentIdx + 1, 
          posicaoNova: adjustedPos 
        },
        fotos: newFotos.map(f => ({ 
          Codigo: f.Codigo?.substring(0, 10), 
          Ordem: f.Ordem, 
          Nome: f.Foto?.split('/').pop()?.substring(0, 15) 
        }))
      });
      
      const updated = { ...prev, Foto: newFotos };
      
      // 🎯 SALVAR NO LOCALSTORAGE IMEDIATAMENTE APÓS MUDANÇA DE POSIÇÃO
      setTimeout(() => {
        try {
          localStorage.setItem('imovelFormDraft', JSON.stringify(updated));
          console.log('💾 changeImagePosition: Draft salvo no localStorage imediatamente');
        } catch (error) {
          console.error('❌ changeImagePosition: Erro ao salvar draft:', error);
        }
      }, 200);
      
      return updated;
    });
    
    console.log('✅ MUDANÇA DE POSIÇÃO: Processo finalizado com sucesso');
  }, [formData.Foto]);

  const handleImagesUploaded = useCallback((images = []) => {
    if (!Array.isArray(images)) return;
    
    ultimaMudancaFotos.current = Date.now(); // 🎯 Marcar mudança
    
    setFormData(prev => {
      const current = Array.isArray(prev.Foto) ? prev.Foto : [];
      const newImages = images
        .filter(img => img?.Foto || img?.url)
        .map((img, idx) => ({
          Codigo: `img-upload-${Date.now()}-${idx}`,
          Foto: img.Foto || img.url,
          Destaque: "Nao",
          Ordem: current.length + idx + 1
        }));
      
      console.log('📸 handleImagesUploaded: Fotos adicionadas', { 
        novasImagens: newImages.length,
        totalAntes: current.length,
        totalDepois: current.length + newImages.length
      });
      
      return {
        ...prev,
        Foto: [...current, ...newImages]
      };
    });
  }, []);

  // Validação do formulário
  useEffect(() => {
    const fieldValidation = {};
    let isValid = true;

    REQUIRED_FIELDS.forEach((field) => {
      if (!INITIAL_FORM_DATA.hasOwnProperty(field)) {
        console.warn(`Campo obrigatório não encontrado: ${field}`);
        return;
      }
      
      const value = formData[field];
      const valid = (typeof value === 'string' && value.trim() !== '') || 
                    (typeof value === 'number' && !isNaN(value)) || 
                    (Array.isArray(value) && value.length > 0);
      
      fieldValidation[field] = valid;
      if (!valid) isValid = false;
    });

    const photoCount = Array.isArray(formData.Foto) ? formData.Foto.length : 0;
    const hasEnoughPhotos = photoCount >= validation.requiredPhotoCount;

    setValidation(prev => ({
      ...prev,
      isFormValid: isValid && hasEnoughPhotos,
      photoCount,
      fieldValidation,
    }));
  }, [formData, validation.requiredPhotoCount]);

  // Reset do formulário
  const resetForm = useCallback((keepCode = false) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('imovelFormDraft');
    }
    
    // Reset das refs
    correcaoEnderecoExecutada.current = false;
    ultimaMudancaFotos.current = 0;
    ultimoSalvamentoLocalStorage.current = 0;
    
    setFormData(prev => ({
      ...INITIAL_FORM_DATA,
      Codigo: keepCode ? prev.Codigo : "",
      Video: null,
    }));
    
    setDisplayValues({
      ValorAntigo: "R$ 0",
      ValorAluguelSite: "R$ 0",
      ValorCondominio: "R$ 0",
      ValorIptu: "R$ 0",
    });
    
    if (!keepCode) {
      generateRandomCode().then(code => {
        setNewImovelCode(code);
        setFormData(prev => ({ ...prev, Codigo: code, Video: null }));
      });
    }

    console.log('🔄 resetForm: Formulário resetado', { keepCode });
  }, []);

  return {
    formData,
    setFormData,
    displayValues,
    setDisplayValues,
    handleChange,
    newImovelCode,
    fileInputRef,
    showImageModal,
    setShowImageModal,
    addImage,
    addSingleImage,
    updateImage,
    removeImage,
    removeAllImages,
    setImageAsHighlight,
    changeImagePosition, // ✅ Função completamente corrigida
    validation,
    handleImagesUploaded,
    resetForm,
    formatCurrency,
    parseCurrency,
    formatCurrencyInput,
    corrigirEnderecoIncompleto // ✅ Função exposta para uso manual se necessário
  };
};

export default useImovelForm;

/*
 * ✅ CHANGELOG DAS CORREÇÕES IMPLEMENTADAS:
 * 
 * 1. 🛡️ PROTEÇÃO TOTAL contra correção de endereço interferindo nas fotos
 *    - Refs para controlar execução única e timestamps
 *    - Proteção de 15 segundos após mudanças manuais
 *    - Logs detalhados para debug
 * 
 * 2. 🔧 changeImagePosition COMPLETAMENTE REESCRITA
 *    - Validação rigorosa de parâmetros
 *    - Logs detalhados do processo
 *    - Salvamento imediato no localStorage
 *    - Preservação total da ordem definida pelo usuário
 * 
 * 3. 📸 TODAS as funções de manipulação de fotos atualizadas
 *    - Timestamp tracking para proteção
 *    - Logs detalhados para debug
 *    - Preservação da integridade dos dados
 * 
 * 4. 💾 LOCALSTORAGE otimizado
 *    - Debounce inteligente
 *    - Proteção contra salvamentos excessivos
 *    - Salvamento imediato após mudanças críticas
 * 
 * 5. 🎥 handleChange melhorado
 *    - Suporte para chamadas diretas e eventos
 *    - Tratamento especial para Video
 *    - Timestamp tracking para campos importantes
 * 
 * 6. 📊 SISTEMA DE LOGS completo
 *    - Debug detalhado em todas as operações
 *    - Rastreamento de timestamps
 *    - Validação de estados
 */
