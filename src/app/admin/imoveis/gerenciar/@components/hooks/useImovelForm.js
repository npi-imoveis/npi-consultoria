"use client";

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
        setFormData((prev) => {
          if (prev.Codigo && prev.Codigo !== code) {
            return prev;
          }
          return {
            ...prev,
            Codigo: code,
          };
        });
      };
      fetchCode();
    }
  }, [isAutomacao]);

  useEffect(() => {
    if (formData.CEP && formData.CEP.length >= 8) {
      fetchAddressByCep(formData.CEP);
    }
  }, [formData.CEP]);

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
    if (formData.Empreendimento || formData.TermoSeo) {
      let slug;

      if (isAutomacao && formData.TermoSeo) {
        slug = formatterSlug(formData.TermoSeo);
      } else {
        slug = formatterSlug(formData.Empreendimento);
      }
      // Only update if the slug has actually changed
      if (slug !== formData.Slug) {
        setFormData((prev) => ({
          ...prev,
          Slug: slug,
        }));
      }
    }
  }, [formData.Empreendimento, formData.TermoSeo, formData.Slug]);

  useEffect(() => {
    const fetchCorretor = async () => {
      try {
        if (formData.Codigo && !isAutomacao) {
          const response = await getCorretorById(formData.Codigo);
          if (response.data) {
            setFormData((prev) => ({
              ...prev,
              Corretor: response.data.nome,
              EmailCorretor: response.data.email,
              CelularCorretor: response.data.celular,
            }));
          } else {
            setFormData((prev) => ({
              ...prev,
              Corretor: "",
              EmailCorretor: "",
              CelularCorretor: "",
            }));
          }
        }
      } catch (error) {
        console.error("Erro ao buscar corretor:", error);
      }
    };

    fetchCorretor();
  }, [formData.Codigo]);

  const maskDateBR = useCallback((value) => {
    // Remove tudo que não for número
    let v = value.replace(/\D/g, "");
    // Adiciona a barra após o dia
    if (v.length > 2) v = v.replace(/^(\d{2})(\d)/, "$1/$2");
    // Adiciona a barra após o mês
    if (v.length > 5) v = v.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
    // Limita a 10 caracteres (dd/mm/yyyy)
    return v.slice(0, 10);
  }, []);

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

  // ✅ FUNÇÃO CORRIGIDA: addSingleImage - SEM campo Ordem
  const addSingleImage = useCallback(() => {
    console.log("⚙️ ADMIN - Adicionando nova imagem");
    const newImageCode = Date.now().toString();
    setFormData((prevData) => {
      const newPhoto = {
        Codigo: newImageCode,
        Destaque: "Nao",
        Foto: "",
        isUploading: false,
        // ✅ REMOVIDO: Campo Ordem - usa posição natural do array
      };

      const updatedFotos = Array.isArray(prevData.Foto) ? [...prevData.Foto, newPhoto] : [newPhoto];
      
      console.log("⚙️ ADMIN - Photos após adicionar:", updatedFotos);

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

      console.log("⚙️ ADMIN - Photos após update:", updatedFotos);

      return {
        ...prevData,
        Foto: updatedFotos,
      };
    });
  }, []);

  // ✅ FUNÇÃO CORRIGIDA: removeImage - SEM reordenação
  const removeImage = useCallback((codigo) => {
    if (!window.confirm("Tem certeza que deseja remover esta imagem?")) return;

    console.log("⚙️ ADMIN - Removendo imagem:", codigo);
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      const updatedFotos = prevData.Foto.filter((photo) => photo.Codigo !== codigo);
      
      console.log("⚙️ ADMIN - Photos após remover:", updatedFotos);

      return {
        ...prevData,
        Foto: updatedFotos,
      };
    });
  }, []);

  // Função para definir uma imagem como destaque
  const setImageAsHighlight = useCallback((codigo) => {
    console.log("⚙️ ADMIN - Definindo destaque:", codigo);
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      const updatedFotos = prevData.Foto.map((photo) => ({
        ...photo,
        Destaque: photo.Codigo === codigo ? "Sim" : "Nao",
      }));

      console.log("⚙️ ADMIN - Photos após definir destaque:", updatedFotos);

      return {
        ...prevData,
        Foto: updatedFotos,
      };
    });
  }, []);

  // ✅ FUNÇÃO CORRIGIDA: changeImagePosition - move no array sem mexer em campo Ordem
  const changeImagePosition = useCallback((codigo, newPosition) => {
    console.log("⚙️ ADMIN - Mudando posição:", codigo, "para posição:", newPosition);
    setFormData((prevData) => {
      if (!Array.isArray(prevData.Foto)) return prevData;

      const currentIndex = prevData.Foto.findIndex((photo) => photo.Codigo === codigo);
      if (currentIndex === -1 || currentIndex === newPosition - 1) return prevData;

      // Criar novo array com item movido
      const newFotos = [...prevData.Foto];
      const [movedPhoto] = newFotos.splice(currentIndex, 1);
      newFotos.splice(newPosition - 1, 0, movedPhoto);

      console.log("⚙️ ADMIN - Photos após mover posição:", newFotos);

      return {
        ...prevData,
        Foto: newFotos,
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

  // ✅ FUNÇÃO CORRIGIDA: handleImagesUploaded - SEM campo Ordem
  const handleImagesUploaded = (novasImagens) => {
    if (!novasImagens || !Array.isArray(novasImagens) || novasImagens.length === 0) {
      return;
    }

    console.log("⚙️ ADMIN - Upload de imagens:", novasImagens);
    setFormData((prevData) => {
      const fotosExistentes = Array.isArray(prevData.Foto) ? [...prevData.Foto] : [];

      const novasFotos = novasImagens.map((image, index) => ({
        Codigo: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        Foto: image.Foto,
        Destaque: "Nao",
        // ✅ REMOVIDO: Campo Ordem - usa posição natural do array
      }));

      const resultado = [...fotosExistentes, ...novasFotos];
      console.log("⚙️ ADMIN - Photos após upload:", resultado);

      return {
        ...prevData,
        Foto: resultado,
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
    setImageAsHighlight,
    changeImagePosition,
    validation,
    generateRandomCode,
    handleImagesUploaded,
  };
};

export default useImovelForm;
