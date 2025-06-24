import { useState, useEffect, useRef, useCallback } from "react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { REQUIRED_FIELDS } from "../FieldGroup";
import useImovelStore from "@/app/admin/store/imovelStore";
import { getCorretorById } from "@/app/admin/services/corretor";
import { generateUniqueCode } from "@/app/utils/idgenerate";

// Export the generateRandomCode function so it can be reused
export const generateRandomCode = async () => {
  const code = await generateUniqueCode();
  return code;
};

export const useImovelForm = () => {
  const provider = new OpenStreetMapProvider();
  const fileInputRef = useRef(null);

  // Access the store to check for Automacao flag
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
    Video: "",
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

  // Generate random code on init only if in Automacao mode
  useEffect(() => {
    if (isAutomacao || !formData.Codigo) {
      const fetchCode = async () => {
        const code = await generateRandomCode();
        setNewImovelCode(code);
        setFormData((prevData) => ({
          ...prevData,
          Codigo: code,
        }));
      };
      fetchCode();
    }
  }, [isAutomacao, formData.Codigo]);

  // Função para mascarar data no formato brasileiro
  const maskDateBR = useCallback((value) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Aplica a máscara DD/MM/AAAA
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  }, []);

  // Função para formatar valores monetários
  const formatarParaReal = useCallback((valor) => {
    if (!valor) return "";

    try {
      // Remove caracteres não numéricos
      const numero = parseFloat(valor.toString().replace(/\D/g, ""));
      if (isNaN(numero)) return "";

      return numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
    } catch (e) {
      console.error("Erro ao formatar valor:", e);
      return String(valor);
    }
  }, []);

  // Função para extrair somente os números (remove formatação)
  const extrairNumeros = useCallback((valorFormatado) => {
    if (!valorFormatado) return "";
    return valorFormatado.replace(/\D/g, "");
  }, []);

  // Função para buscar coordenadas usando OpenStreetMap
  const fetchCoordinates = useCallback(
    async (address) => {
      try {
        const searchQuery = `${address.logradouro}, ${address.bairro}, ${address.localidade} - ${address.uf}, ${address.cep}, Brasil`;
        const results = await provider.search({ query: searchQuery });

        if (results && results.length > 0) {
          const { y: lat, x: lng } = results[0];
          return { latitude: lat, longitude: lng };
        }
        return null;
      } catch (error) {
        console.error("Erro ao buscar coordenadas:", error);
        return null;
      }
    },
    [provider]
  );

  // Função para buscar endereço pelo CEP
  const fetchAddressByCep = useCallback(
    async (cep) => {
      // Remove caracteres não numéricos
      const cleanCep = cep.replace(/\D/g, "");

      // Verifica se o CEP tem 8 dígitos
      if (cleanCep.length !== 8) return;

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();

        if (!data.erro) {
          // Buscar coordenadas após obter o endereço
          const coordinates = await fetchCoordinates(data);

          setFormData((prevData) => ({
            ...prevData,
            Endereco: data.logradouro || prevData.Endereco,
            Bairro: data.bairro || prevData.Bairro,
            Cidade: data.localidade || prevData.Cidade,
            UF: data.uf || prevData.UF,
            Regiao: data.regiao || prevData.Regiao,
            Latitude: coordinates?.latitude?.toString() || prevData.Latitude,
            Longitude: coordinates?.longitude?.toString() || prevData.Longitude,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    },
    [fetchCoordinates]
  );

  // Handle field changes
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      if (name === "DataEntrega") {
        const maskedValue = maskDateBR(value);
        setFormData((prevData) => ({
          ...prevData,
          [name]: maskedValue,
        }));
        return;
      }

      // Tratamento especial para campos monetários
      if (["ValorAntigo", "ValorAluguelSite", "ValorCondominio", "ValorIptu"].includes(name)) {
        // Armazena o valor não formatado no formData
        const valorNumerico = extrairNumeros(value);
        setFormData((prevData) => ({
          ...prevData,
          [name]: valorNumerico,
        }));

        // Atualiza o valor formatado para exibição
        setDisplayValues((prevValues) => ({
          ...prevValues,
          [name]: formatarParaReal(valorNumerico),
        }));
        return;
      }

      // Tratamento especial para CEP
      if (name === "CEP") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
        }));

        // Buscar endereço se CEP estiver completo
        if (value.replace(/\D/g, "").length === 8) {
          fetchAddressByCep(value);
        }
        return;
      }

      // Tratamento especial para Empreendimento (gerar slug automaticamente)
      if (name === "Empreendimento") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
          Slug: formatterSlug(value),
        }));
        return;
      }

      // Tratamento especial para IdCorretor
      if (name === "IdCorretor") {
        setFormData((prevData) => ({
          ...prevData,
          [name]: value,
          Corretor: "",
          EmailCorretor: "",
          CelularCorretor: "",
          Imobiliaria: "",
        }));

        // Buscar dados do corretor se ID for válido
        if (value && value.trim() !== "") {
          getCorretorById(value)
            .then((corretor) => {
              if (corretor) {
                setFormData((prevData) => ({
                  ...prevData,
                  Corretor: corretor.Nome || "",
                  EmailCorretor: corretor.Email || "",
                  CelularCorretor: corretor.Celular || "",
                  Imobiliaria: corretor.Imobiliaria || "",
                }));
              }
            })
            .catch((error) => {
              console.error("Erro ao buscar corretor:", error);
            });
        }
        return;
      }

      // Tratamento padrão para outros campos
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    [maskDateBR, extrairNumeros, formatarParaReal, fetchAddressByCep]
  );

  // Função para adicionar uma nova imagem
  const addImage = useCallback(() => {
    setShowImageModal(true);
  }, []);

  // Função para adicionar uma única imagem
  const addSingleImage = useCallback((imageUrl) => {
    if (!imageUrl || imageUrl.trim() === "") return;

    const newImage = {
      Codigo: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      Foto: imageUrl.trim(),
      Destaque: "Nao",
      Ordem: (formData.Foto?.length || 0) + 1,
    };

    setFormData((prevData) => ({
      ...prevData,
      Foto: Array.isArray(prevData.Foto) ? [...prevData.Foto, newImage] : [newImage],
    }));
  }, [formData.Foto]);

  // Função para atualizar uma imagem existente
  const updateImage = useCallback((codigo, newImageUrl) => {
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      const updatedFotos = prevData.Foto.map((photo) =>
        photo.Codigo === codigo ? { ...photo, Foto: newImageUrl } : photo
      );

      return {
        ...prevData,
        Foto: updatedFotos,
      };
    });
  }, []);

  // Função para remover uma imagem
  const removeImage = useCallback((codigo) => {
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      const updatedFotos = prevData.Foto.filter((photo) => photo.Codigo !== codigo);

      // Update the order of remaining photos
      const reorderedFotos = updatedFotos.map((photo, index) => ({
        ...photo,
        Ordem: index + 1,
      }));

      return {
        ...prevData,
        Foto: reorderedFotos,
      };
    });
  }, []);

  // Função para excluir TODAS as imagens
  const removeAllImages = useCallback(() => {
    // Primeira confirmação
    if (typeof window !== 'undefined' && !window.confirm(
      "⚠️ ATENÇÃO: Tem certeza que deseja excluir TODAS as fotos deste imóvel?"
    )) {
      return;
    }

    // Segunda confirmação
    if (typeof window !== 'undefined' && !window.confirm(
      "🚨 CONFIRMAÇÃO FINAL: Esta ação é IRREVERSÍVEL! Todas as fotos serão permanentemente excluídas. Deseja continuar?"
    )) {
      return;
    }

    // Limpar todas as fotos
    setFormData((prevData) => ({
      ...prevData,
      Foto: [],
    }));

    // Feedback visual (opcional - pode ser implementado com toast/notification)
    console.log("✅ Todas as fotos foram excluídas com sucesso!");
  }, []);

  // Função para definir uma imagem como destaque
  const setImageAsHighlight = useCallback((codigo) => {
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      const updatedFotos = prevData.Foto.map((photo) => ({
        ...photo,
        Destaque: photo.Codigo === codigo ? "Sim" : "Nao",
      }));

      return {
        ...prevData,
        Foto: updatedFotos,
      };
    });
  }, []);

  // Função para alterar a posição da imagem
  const changeImagePosition = useCallback((codigo, newPosition) => {
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      // Sort photos by their order
      const sortedPhotos = [...prevData.Foto].sort((a, b) => {
        const orderA = a.Ordem || prevData.Foto.findIndex((p) => p.Codigo === a.Codigo) + 1;
        const orderB = b.Ordem || prevData.Foto.findIndex((p) => p.Codigo === b.Codigo) + 1;
        return orderA - orderB;
      });

      // Find current index of the photo
      const currentIndex = sortedPhotos.findIndex((photo) => photo.Codigo === codigo);
      if (currentIndex === -1 || currentIndex === newPosition - 1) return prevData;

      // Create a new array with the photo in the new position
      const movedPhoto = sortedPhotos.splice(currentIndex, 1)[0];
      sortedPhotos.splice(newPosition - 1, 0, movedPhoto);

      // Update all orders
      const reorderedPhotos = sortedPhotos.map((photo, index) => ({
        ...photo,
        Ordem: index + 1,
      }));

      return {
        ...prevData,
        Foto: reorderedPhotos,
      };
    });
  }, []);

  // Validate the form
  useEffect(() => {
    // Validate required fields
    const fieldValidation = {};
    let allFieldsValid = true;

    REQUIRED_FIELDS.forEach((fieldName) => {
      const isValid = formData[fieldName] && formData[fieldName].trim() !== "";
      fieldValidation[fieldName] = isValid;
      if (!isValid) allFieldsValid = false;
    });

    // Validate photos
    const photoCount = formData.Foto ? formData.Foto.length : 0;
    const hasEnoughPhotos = photoCount >= 5;

    setValidation({
      isFormValid: allFieldsValid && hasEnoughPhotos,
      photoCount,
      requiredPhotoCount: 5,
      fieldValidation,
    });
  }, [formData]);

  const handleImagesUploaded = (novasImagens) => {
    if (!novasImagens || !Array.isArray(novasImagens) || novasImagens.length === 0) {
      return; // Não fazer nada se não receber imagens
    }

    setFormData((prevData) => {
      // Criar array existente ou vazio se não existir
      const fotosExistentes = Array.isArray(prevData.Foto) ? [...prevData.Foto] : [];

      // Para cada imagem nova, criar um objeto com estrutura correta
      const novasFotos = novasImagens.map((image, index) => ({
        Codigo: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        Foto: image.Foto,
        Destaque: "Nao",
        Ordem: fotosExistentes.length + index + 1, // Garantir que fique após as existentes
      }));

      // Retornar state atualizado com ARRAY concatenado
      return {
        ...prevData,
        Foto: [...fotosExistentes, ...novasFotos],
      };
    });
  };

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
    removeAllImages, // Nova função adicionada
    setImageAsHighlight,
    changeImagePosition,
    validation,
    generateRandomCode,
    handleImagesUploaded,
  };
};

export default useImovelForm;
