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

export const useImovelForm = () => {
  const provider = useRef(new OpenStreetMapProvider());
  const fileInputRef = useRef(null);

  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

  const [formData, setFormData] = useState({
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
  });

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

  // Geração de código ao iniciar
  useEffect(() => {
    if (isAutomacao || !formData.Codigo) {
      const loadCode = async () => {
        const code = await generateRandomCode();
        setNewImovelCode(code);
        setFormData((prev) => ({ ...prev, Codigo: code }));
      };
      loadCode();
    }
  }, [isAutomacao, formData.Codigo]);

  // Utilitários
  const maskDate = useCallback((value) => 
    value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2").replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3"), []);

  const formatCurrency = useCallback((value) => {
    const num = Number(value?.toString().replace(/\D/g, "") || 0);
    return num.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }, []);

  const parseCurrency = useCallback((value) => 
    value?.toString().replace(/\D/g, "") || "", []);

  // Busca de coordenadas
  const fetchCoordinates = useCallback(async (address) => {
    try {
      const query = `${address.logradouro}, ${address.bairro}, ${address.localidade}, ${address.uf}`;
      const results = await provider.current.search({ query });
      return results[0] ? { latitude: results[0].y, longitude: results[0].x } : null;
    } catch (error) {
      console.error("Erro nas coordenadas:", error);
      return null;
    }
  }, []);

  // Busca por CEP
  const fetchAddress = useCallback(async (cep) => {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (data.erro) return;

      const coords = await fetchCoordinates(data);
      setFormData((prev) => ({
        ...prev,
        Endereco: data.logradouro || prev.Endereco,
        Bairro: data.bairro || prev.Bairro,
        Cidade: data.localidade || prev.Cidade,
        UF: data.uf || prev.UF,
        Latitude: coords?.latitude?.toString() || prev.Latitude,
        Longitude: coords?.longitude?.toString() || prev.Longitude,
      }));
    } catch (error) {
      console.error("Erro no CEP:", error);
    }
  }, [fetchCoordinates]);

  // Handler genérico de campos
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    // Campos especiais
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
        setFormData(prev => ({ ...prev, [name]: value }));
        if (value.replace(/\D/g, "").length === 8) fetchAddress(value);
      },

      Empreendimento: () => {
        setFormData(prev => ({ ...prev, [name]: value, Slug: formatterSlug(value) }));
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
          getCorretorById(value)
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
            .catch(console.error);
        }
      }
    };

    if (specialHandlers[name]) {
      specialHandlers[name]();
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, [maskDate, formatCurrency, parseCurrency, fetchAddress]);

  // Manipulação de imagens
  const addImage = useCallback(() => setShowImageModal(true), []);
  
  const addSingleImage = useCallback((url) => {
    if (!url?.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      Foto: [
        ...(prev.Foto || []),
        {
          Codigo: `img-${Date.now()}`,
          Foto: url.trim(),
          Destaque: "Nao",
          Ordem: (prev.Foto?.length || 0) + 1,
        }
      ]
    }));
  }, []);

  const updateImage = useCallback((codigo, newUrl) => {
    setFormData(prev => ({
      ...prev,
      Foto: (prev.Foto || []).map(img => 
        img.Codigo === codigo ? { ...img, Foto: newUrl } : img
      )
    }));
  }, []);

  const removeImage = useCallback((codigo) => {
    setFormData(prev => ({
      ...prev,
      Foto: (prev.Foto || [])
        .filter(img => img.Codigo !== codigo)
        .map((img, i) => ({ ...img, Ordem: i + 1 }))
    }));
  }, []);

  const removeAllImages = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (!confirm("⚠️ Tem certeza que deseja remover TODAS as imagens?")) return;
    if (!confirm("🚨 Esta ação é irreversível! Confirmar remoção total?")) return;
    
    setFormData(prev => ({ ...prev, Foto: [] }));
  }, []);

  const setImageAsHighlight = useCallback((codigo) => {
    setFormData(prev => ({
      ...prev,
      Foto: (prev.Foto || []).map(img => ({
        ...img,
        Destaque: img.Codigo === codigo ? "Sim" : "Nao"
      }))
    }));
  }, []);

  const changeImagePosition = useCallback((codigo, newPos) => {
    setFormData(prev => {
      if (!Array.isArray(prev.Foto)) return prev;
      
      const sorted = [...prev.Foto].sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0));
      const currentIdx = sorted.findIndex(img => img.Codigo === codigo);
      if (currentIdx === -1) return prev;

      const [moved] = sorted.splice(currentIdx, 1);
      sorted.splice(newPos - 1, 0, moved);
      
      return {
        ...prev,
        Foto: sorted.map((img, idx) => ({ ...img, Ordem: idx + 1 }))
      };
    });
  }, []);

  const handleImagesUploaded = useCallback((images = []) => {
    if (!Array.isArray(images)) return;
    
    setFormData(prev => {
      const current = prev.Foto || [];
      return {
        ...prev,
        Foto: [
          ...current,
          ...images.map((img, idx) => ({
            Codigo: `img-upload-${Date.now()}-${idx}`,
            Foto: img.Foto || img.url,
            Destaque: "Nao",
            Ordem: current.length + idx + 1
          }))
        ]
      };
    });
  }, []);

  // Validação do formulário
  useEffect(() => {
    const fieldValidation = {};
    let isValid = true;

    REQUIRED_FIELDS.forEach((field) => {
      const valid = Boolean(formData[field]?.toString().trim());
      fieldValidation[field] = valid;
      if (!valid) isValid = false;
    });

    const photoCount = Array.isArray(formData.Foto) ? formData.Foto.length : 0;
    const hasEnoughPhotos = photoCount >= validation.requiredPhotoCount;

    setValidation({
      isFormValid: isValid && hasEnoughPhotos,
      photoCount,
      requiredPhotoCount: 5,
      fieldValidation,
    });
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
