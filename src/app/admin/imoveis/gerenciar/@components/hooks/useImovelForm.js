import { useState, useEffect, useRef, useCallback } from "react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { REQUIRED_FIELDS } from "../FieldGroup";
import useImovelStore from "@/app/admin/store/imovelStore";
import { getCorretorById } from "@/app/admin/services/corretor";
import { generateUniqueCode } from "@/app/utils/idgenerate";

export const generateRandomCode = async () => {
  return generateUniqueCode();
};

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
  ValorAntigo: "",
  ValorAluguelSite: "",
  ValorCondominio: "",
  ValorIptu: "",
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
};

export const useImovelForm = () => {
  const provider = useRef(new OpenStreetMapProvider());
  const fileInputRef = useRef(null);

  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [displayValues, setDisplayValues] = useState({
    ValorAntigo: "",
    ValorAluguelSite: "",
    ValorCondominio: "",
    ValorIptu: "",
  });

  const [newImovelCode, setNewImovelCode] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [validation, setValidation] = useState({
    isFormValid: false,
    photoCount: 0,
    requiredPhotoCount: 5,
    fieldValidation: {},
  });

  useEffect(() => {
    if (isAutomacao || !formData.Codigo) {
      const loadCode = async () => {
        try {
          const code = await generateRandomCode();
          setNewImovelCode(code);
          setFormData((prev) => ({ ...prev, Codigo: code }));
        } catch (error) {
          console.error("Erro ao gerar código:", error);
          const fallbackCode = `IMV-${Date.now().toString().slice(-6)}`;
          setNewImovelCode(fallbackCode);
          setFormData((prev) => ({ ...prev, Codigo: fallbackCode }));
        }
      };
      loadCode();
    }
  }, [isAutomacao, formData.Codigo]);

  const maskDate = useCallback((value) => {
    if (!value) return "";
    return value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/^(\d{2})(\d)/, "$1/$2")
      .replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
  }, []);

  const formatCurrency = useCallback((value) => {
    const num = Number((value?.toString() || "").replace(/\D/g, "") || 0);
    return isNaN(num) 
      ? "R$ 0,00" 
      : num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }, []);

  const parseCurrency = useCallback((value) => {
    return (value?.toString() || "").replace(/\D/g, "") || "";
  }, []);

  const fetchCoordinates = useCallback(async (address) => {
    if (!address || !address.logradouro || !address.bairro || !address.localidade || !address.uf) {
      return null;
    }

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
  }, []);

  const fetchAddress = useCallback(async (cep) => {
    const cleanCep = (cep || "").replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      if (!response.ok) throw new Error("Erro na resposta da API");
      
      const data = await response.json();
      if (data.erro) return;

      const coords = await fetchCoordinates(data);
      setFormData((prev) => ({
        ...prev,
        Endereco: data.logradouro || prev.Endereco,
        Bairro: data.bairro || prev.Bairro,
        Cidade: data.localidade || prev.Cidade,
        UF: data.uf || prev.UF,
        Latitude: coords?.latitude || prev.Latitude,
        Longitude: coords?.longitude || prev.Longitude,
      }));
    } catch (error) {
      console.error("Erro ao buscar endereço:", error);
    }
  }, [fetchCoordinates]);

  const handleChange = useCallback((e) => {
    if (!e || !e.target) return;
    
    const { name, value } = e.target;
    if (!name || !INITIAL_FORM_DATA.hasOwnProperty(name)) {
      console.warn(`Campo não reconhecido: ${name}`);
      return;
    }

    const specialHandlers = {
      DataEntrega: () => setFormData(prev => ({ ...prev, [name]: maskDate(value) })),

      ValorAntigo: () => {
        const numeric = parseCurrency(value);
        setFormData(prev => ({ ...prev, [name]: numeric }));
        setDisplayValues(prev => ({ ...prev, [name]: formatCurrency(numeric) }));
      },

      ValorAluguelSite: () => {
        const numeric = parseCurrency(value);
        setFormData(prev => ({ ...prev, [name]: numeric }));
        setDisplayValues(prev => ({ ...prev, [name]: formatCurrency(numeric) }));
      },

      ValorCondominio: () => {
        const numeric = parseCurrency(value);
        setFormData(prev => ({ ...prev, [name]: numeric }));
        setDisplayValues(prev => ({ ...prev, [name]: formatCurrency(numeric) }));
      },

      ValorIptu: () => {
        const numeric = parseCurrency(value);
        setFormData(prev => ({ ...prev, [name]: numeric }));
        setDisplayValues(prev => ({ ...prev, [name]: formatCurrency(numeric) }));
      },

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
                }));
              }
            })
            .catch(error => {
              console.error("Erro ao buscar corretor:", error);
            });
        }
      }
    };

    if (specialHandlers[name]) {
      specialHandlers[name]();
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, [maskDate, formatCurrency, parseCurrency, fetchAddress]);

  const addImage = useCallback(() => setShowImageModal(true), []);
  
  const addSingleImage = useCallback((url) => {
    if (!url?.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      Foto: [
        ...(Array.isArray(prev.Foto) ? prev.Foto : []),
        {
          Codigo: `img-${Date.now()}`,
          Foto: url.trim(),
          Destaque: "Nao",
          Ordem: (Array.isArray(prev.Foto) ? prev.Foto.length + 1 : 1)
        }
      ]
    }));
  }, []);

  const updateImage = useCallback((codigo, newUrl) => {
    if (!codigo || !newUrl?.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      Foto: Array.isArray(prev.Foto) 
        ? prev.Foto.map(img => 
            img.Codigo === codigo ? { ...img, Foto: newUrl.trim() } : img
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
            .map((img, idx) => ({
              Codigo: `img-upload-${Date.now()}-${idx}`,
              Foto: img.Foto || img.url,
              Destaque: "Nao",
              Ordem: current.length + idx + 1
            }))
        ]
      };
    });
  }, []);

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
  };
};

export default useImovelForm;
