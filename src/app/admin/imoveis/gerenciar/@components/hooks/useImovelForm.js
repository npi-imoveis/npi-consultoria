"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { REQUIRED_FIELDS } from "../FieldGroup";
import useImovelStore from "@/app/admin/store/imovelStore";
import { getCorretorById } from "@/app/admin/services/corretor";

// Export the generateRandomCode function so it can be reused
export const generateRandomCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const useImovelForm = () => {
  const provider = new OpenStreetMapProvider();
  const fileInputRef = useRef(null);

  // Access the store to check for Automacao flag
  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

  const [formData, setFormData] = useState({
    Codigo: "",
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
    Imobiliaria: "",
    EmailCorretor: "",
    CelularCorretor: "",
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
    if (isAutomacao) {
      const code = generateRandomCode();
      setNewImovelCode(code);
      // Forçar a atualização do formData.Codigo
      setFormData((prev) => {
        // Se o código já existe e é diferente, não atualizar
        if (prev.Codigo && prev.Codigo !== code) {
          return prev;
        }
        return {
          ...prev,
          Codigo: code,
        };
      });
    }
  }, [isAutomacao]);

  // Ensure formData.Codigo is always synced with newImovelCode
  useEffect(() => {
    if (isAutomacao && newImovelCode && (!formData.Codigo || formData.Codigo !== newImovelCode)) {
      setFormData((prev) => ({
        ...prev,
        Codigo: newImovelCode,
      }));
    }
  }, [newImovelCode, formData.Codigo, isAutomacao]);

  // Ensure Slug is always generated from Empreendimento
  useEffect(() => {
    if (formData.Empreendimento) {
      const slug = formatterSlug(formData.Empreendimento);
      // Only update if the slug has actually changed
      if (slug !== formData.Slug) {
        setFormData((prev) => ({
          ...prev,
          Slug: slug,
        }));
      }
    }
  }, [formData.Empreendimento, formData.Slug]);

  useEffect(() => {
    const fetchCorretor = async () => {
      if (formData.Codigo && !isAutomacao) {
        const response = await getCorretorById(formData.Codigo);
        if (response.success) {
          setFormData((prev) => ({
            ...prev,
            Corretor: response.data.nome,
            EmailCorretor: response.data.email,
            CelularCorretor: response.data.celular,
          }));
        } else {
          // Se não encontrar o corretor, mantém os dados atuais
          console.log("Corretor não encontrado para o código:", formData.Codigo);
        }
      }
    };

    fetchCorretor();
  }, [formData.Codigo]);

  // Função para formatar valores monetários
  const formatarParaReal = useCallback((valor) => {
    if (valor === null || valor === undefined || valor === "") return "";

    // Remove qualquer caractere não numérico
    const apenasNumeros = String(valor).replace(/\D/g, "");

    // Converte para número e formata
    try {
      const numero = parseInt(apenasNumeros, 10);
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
            BairroComercial: data.bairro || prevData.Bairro, // Preenche BairroComercial com o mesmo valor do Bairro
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
      }
      // Tratamento especial para o campo de vídeo
      else if (name === "Video.1.Video") {
        setFormData((prevData) => ({
          ...prevData,
          Video: {
            ...(prevData.Video || {}),
            1: {
              ...(prevData.Video?.[1] || {}),
              Codigo: prevData.Video?.[1]?.Codigo || "1",
              Destaque: prevData.Video?.[1]?.Destaque || "Nao",
              Tipo: "youtube",
              Video: value,
              VideoCodigo: prevData.Video?.[1]?.VideoCodigo || "1",
            },
          },
        }));
      } else {
        setFormData((prevData) => {
          // Se o campo alterado for Empreendimento, gerar o slug automaticamente
          if (name === "Empreendimento") {
            return {
              ...prevData,
              [name]: value,
              Slug: formatterSlug(value),
            };
          }

          // Se o campo alterado for CEP, buscar o endereço
          if (name === "CEP" && value.length >= 8) {
            // Permite executar apenas quando tiver 8 ou mais caracteres
            fetchAddressByCep(value);
          }

          return {
            ...prevData,
            [name]: value,
          };
        });
      }
    },
    [extrairNumeros, formatarParaReal, fetchAddressByCep]
  );

  // Função para adicionar imagens via modal
  const addImage = useCallback(() => {
    setShowImageModal(true);
  }, []);

  // Função para adicionar uma imagem manualmente
  const addSingleImage = useCallback(() => {
    const newImageCode = Date.now().toString(); // Gera um código único baseado no timestamp
    setFormData((prevData) => {
      const newPhoto = {
        Codigo: newImageCode,
        Destaque: "Nao",
        Foto: "", // URL da imagem será adicionada pelo usuário
        isUploading: false,
        Ordem: Array.isArray(prevData.Foto) ? prevData.Foto.length + 1 : 1,
      };

      // Handle both array and empty cases
      const updatedFotos = Array.isArray(prevData.Foto) ? [...prevData.Foto, newPhoto] : [newPhoto];

      return {
        ...prevData,
        Foto: updatedFotos,
      };
    });
  }, []);

  // Função para atualizar uma imagem específica
  const updateImage = useCallback((codigo, field, value) => {
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      const updatedFotos = prevData.Foto.map((photo) =>
        photo.Codigo === codigo ? { ...photo, [field]: value } : photo
      );

      return {
        ...prevData,
        Foto: updatedFotos,
      };
    });
  }, []);

  // Função para remover uma imagem
  const removeImage = useCallback((codigo) => {
    if (!window.confirm("Tem certeza que deseja remover esta imagem?")) return;

    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      // Filter out the photo with the given codigo
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

  // Função para definir uma imagem como destaque
  const setImageAsHighlight = useCallback((fotoUrl) => {
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      const updatedFotos = prevData.Foto.map((photo) => ({
        ...photo,
        Destaque: photo.Foto === fotoUrl ? "Sim" : "Nao",
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
    setImageAsHighlight,
    changeImagePosition,
    validation,
    generateRandomCode,
  };
};

export default useImovelForm;
