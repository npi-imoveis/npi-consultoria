Boa tarde!

O erro `400 (Bad Request)` que você está recebendo na requisição `_next/image` indica que a URL que está sendo passada para o componente de otimização de imagem do Next.js já é uma URL otimizada pelo Next.js, ou seja, está havendo um "aninhamento" de URLs de otimização.

O Next.js espera que você forneça a URL **original** da imagem (por exemplo, a URL do S3), e ele mesmo se encarrega de transformá-la em uma URL otimizada (`_next/image?url=...`). Quando você passa uma URL que já é `_next/image?url=...` para ele, ele tenta otimizar novamente, resultando em uma URL inválida e no erro 400.

A solução é garantir que, ao adicionar ou atualizar as fotos no seu `formData`, você esteja sempre armazenando a URL **original** da imagem, e não uma URL já processada pelo Next.js.

Para isso, você pode criar uma função auxiliar que "desaninha" essas URLs, extraindo a URL original, e usá-la nas funções `addSingleImage`, `updateImage` e `handleImagesUploaded`.

Aqui está a função e como aplicá-la ao seu código:

```javascript
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
  Video: {},
  Foto: [],
  isLoadingCEP: false,
  isLoadingCorretor: false,
  cepError: null,
  corretorError: null
};

export const useImovelForm = () => {
  const provider = useRef(new OpenStreetMapProvider());
  const fileInputRef = useRef(null);
  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

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

  // Inicialização do formulário
  useEffect(() => {
    const initializeForm = async () => {
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
        console.error("Erro ao inicializar formulário:", error);
      }
    };

    initializeForm();
  }, [isAutomacao, imovelSelecionado?.Codigo, formatCurrencyInput]);

  useEffect(() => {
    if (!formData.Codigo) return;
    
    const timer = setTimeout(() => {
      localStorage.setItem('imovelFormDraft', JSON.stringify(formData));
    }, 500);
    
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

  }, [debouncedFetchCoordinates]);

  // O handleChange vem logo em seguida...
  const handleChange = useCallback((e) => {
  if (!e || !e.target) return;
  
  const { name, value } = e.target;

  // Tratamento específico para campos numéricos
    const numericFields = ['Dormitorios', 'Suites', 'Vagas', 'BanheiroSocialQtd'];
    if (numericFields.includes(name)) {
    const numericValue = value.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [name]: numericValue }));
    return;
  }

  // Handler específico para campos numéricos (Dormitórios, Suítes, Vagas)
  const handleNumericField = (fieldName, fieldValue) => {
    const numericValue = fieldValue.replace(/\D/g, '');
    setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
  };

  // Verifica se é um campo numérico
  if (numericFields.includes(name)) {
    handleNumericField(name, value);
    return; // Sai da função após processar
  }

  // Handlers para campos monetários
  const handleMonetaryField = (fieldName, fieldValue) => {
    const numericValue = parseCurrency(fieldValue);
    setFormData(prev => ({ ...prev, [fieldName]: numericValue }));
    setDisplayValues(prev => ({ 
      ...prev, 
      [fieldName]: formatCurrencyInput(fieldValue) 
    }));
  };

  // Campos monetários
  const monetaryFields = ['ValorAntigo', 'ValorAluguelSite', 'ValorCondominio', 'ValorIptu'];

  // Verifica se é um campo monetário
  if (monetaryFields.includes(name)) {
    handleMonetaryField(name, value);
    return; // Sai da função após processar
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
    return; // Sai da função após processar
  }

  // Caso padrão para todos os outros campos
  setFormData(prev => ({ ...prev, [name]: value }));
}, [maskDate, fetchAddress, parseCurrency, formatCurrencyInput]);
  // Funções de manipulação de imagens
  const addImage = useCallback(() => setShowImageModal(true), []);
  
  const addSingleImage = useCallback((url) => {
  if (!url?.trim()) return;
  
  // Limpeza robusta da URL
  let cleanUrl;
  try {
    cleanUrl = decodeURIComponent(url)
      .split('?')[0]  // Remove query params
      .trim()
      .replace(/\s+/g, ''); // Remove todos os espaços
  } catch {
    cleanUrl = url.split('?')[0].trim(); // Fallback se decode falhar
  }

  setFormData(prev => ({
    ...prev,
    Foto: [
      ...(Array.isArray(prev.Foto) ? prev.Foto : []),
      {
        Codigo: `img-${Date.now()}`,
        Foto: cleanUrl,
        Destaque: "Nao",
        Ordem: (Array.isArray(prev.Foto) ? prev.Foto.length + 1 : 1)
      }
    ]
  }));
}, []);

  const updateImage = useCallback((codigo, newUrl) => {
  if (!codigo || !newUrl?.trim()) return;
  
  // Mesma lógica de limpeza
  let cleanUrl;
  try {
    cleanUrl = decodeURIComponent(newUrl)
      .split('?')[0]
      .trim()
      .replace(/\s+/g, '');
  } catch {
    cleanUrl = newUrl.split('?')[0].trim();
  }

  setFormData(prev => ({
    ...prev,
    Foto: Array.isArray(prev.Foto) 
      ? prev.Foto.map(img => 
          img.Codigo === codigo ? { ...img, Foto: cleanUrl } : img
        )
      : []
  }));
}, []);

  const removeImage = useCallback((codigo) => {
    if (!codigo) return;
    
    setFormData(prev => ({
      ...prev,
      Foto: Array.isArray(prev.Foto)
        ? prev.Foto
            .filter(img => img.Codigo !== codigo)
            .map((img, i) => ({ ...img, Ordem: i + 1 }))
        : []
    }));
  }, []);

  const removeAllImages = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!confirm("⚠️ Tem certeza que deseja remover TODAS as imagens?")) return;
    if (!confirm("🚨 Esta ação é irreversível! Confirmar remoção total?")) return;
    
    setFormData(prev => ({ ...prev, Foto: [] }));
  }, []);

  const setImageAsHighlight = useCallback((codigo) => {
    if (!codigo) return;
    
    setFormData(prev => ({
      ...prev,
      Foto: Array.isArray(prev.Foto)
        ? prev.Foto.map(img => ({
            ...img,
            Destaque: img.Codigo === codigo ? "Sim" : "Nao"
          }))
        : []
    }));
  }, []);

  const changeImagePosition = useCallback((codigo, newPos) => {
    if (!codigo || !Number.isInteger(newPos) || newPos < 1) return;
    
    setFormData(prev => {
      if (!Array.isArray(prev.Foto)) return prev;
      
      const sorted = [...prev.Foto].sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0));
      const currentIdx = sorted.findIndex(img => img.Codigo === codigo);
      if (currentIdx === -1) return prev;

      const [moved] = sorted.splice(currentIdx, 1);
      const adjustedPos = Math.min(Math.max(newPos, 1), sorted.length + 1);
      sorted.splice(adjustedPos - 1, 0, moved);
      
      return {
        ...prev,
        Foto: sorted.map((img, idx) => ({ ...img, Ordem: idx + 1 }))
      };
    });
  }, []);

  const handleImagesUploaded = useCallback((images = []) => {
  if (!Array.isArray(images)) return;
  
  setFormData(prev => {
    const current = Array.isArray(prev.Foto) ? prev.Foto : [];
    return {
      ...prev,
      Foto: [
        ...current,
        ...images
          .filter(img => img?.Foto || img?.url)
          .map((img, idx) => {
            const imageUrl = img.Foto || img.url;
            let cleanUrl;
            try {
              cleanUrl = decodeURIComponent(imageUrl)
                .split('?')[0]
                .trim()
                .replace(/\s+/g, '');
            } catch {
              cleanUrl = imageUrl.split('?')[0].trim();
            }
            
            return {
              Codigo: `img-upload-${Date.now()}-${idx}`,
              Foto: cleanUrl,
              Destaque: "Nao",
              Ordem: current.length + idx + 1
            };
          })
      ]
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
    
    setFormData(prev => ({
      ...INITIAL_FORM_DATA,
      Codigo: keepCode ? prev.Codigo : "",
    }));
    
    setDisplayValues({
      ValorAntigo: "R$ 0,00",
      ValorAluguelSite: "R$ 0,00",
      ValorCondominio: "R$ 0,00",
      ValorIptu: "R$ 0,00",
    });
    
    if (!keepCode) {
      generateRandomCode().then(code => {
        setNewImovelCode(code);
        setFormData(prev => ({ ...prev, Codigo: code }));
      });
    }
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
    changeImagePosition,
    validation,
    handleImagesUploaded,
    resetForm,
    formatCurrency,
    parseCurrency,
    formatCurrencyInput
  };
};

export default useImovelForm;
