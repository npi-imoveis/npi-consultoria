"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { formatarMoedaParaNumero } from "@/app/utils/formatter-number";
import JSZip from "jszip"; // Importar JSZip
import { saveAs } from "file-saver"; // Para salvar o arquivo

const useImovelForm = (initialData = {}) => {
  const [formData, setFormData] = useState({
    Titulo: "",
    Descricao: "",
    TipoImovel: "Apartamento",
    Finalidade: "VENDA",
    ValorVenda: 0, // Inicializado como número
    ValorAluguel: 0, // Inicializado como número
    ValorCondominio: 0, // Inicializado como número
    ValorIPTU: 0, // Inicializado como número
    AreaUtil: 0,
    AreaTotal: 0,
    Quartos: 0,
    Suites: 0,
    Banheiros: 0,
    VagasGaragem: 0,
    AnoConstrucao: "",
    Status: "Disponivel",
    Endereco: "",
    Numero: "",
    Complemento: "",
    Bairro: "",
    Cidade: "",
    Estado: "",
    CEP: "",
    Latitude: "",
    Longitude: "",
    Destaque: "Nao",
    Ativo: "Sim",
    DataCadastro: new Date().toISOString().split("T")[0],
    Corretor: "",
    Imobiliaria: "",
    Observacoes: "",
    Foto: [],
    Caracteristicas: [],
    Proximidades: [],
    InformacoesAdicionais: [],
    ...initialData,
  });

  const [validation, setValidation] = useState({
    Titulo: true,
    Descricao: true,
    TipoImovel: true,
    Finalidade: true,
    ValorVenda: true,
    ValorAluguel: true,
    ValorCondominio: true,
    ValorIPTU: true,
    AreaUtil: true,
    AreaTotal: true,
    Quartos: true,
    Suites: true,
    Banheiros: true,
    VagasGaragem: true,
    AnoConstrucao: true,
    Status: true,
    Endereco: true,
    Numero: true,
    Bairro: true,
    Cidade: true,
    Estado: true,
    CEP: true,
    Corretor: true,
    Imobiliaria: true,
    Foto: true,
  });

  const fileInputRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [downloadingPhotos, setDownloadingPhotos] = useState(false); // Estado para controlar o download

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData((prevData) => ({
        ...prevData,
        ...initialData,
        // Garante que os campos de valor sejam números ao carregar dados existentes
        ValorVenda: formatarMoedaParaNumero(initialData.ValorVenda),
        ValorAluguel: formatarMoedaParaNumero(initialData.ValorAluguel),
        ValorCondominio: formatarMoedaParaNumero(initialData.ValorCondominio),
        ValorIPTU: formatarMoedaParaNumero(initialData.ValorIPTU),
      }));
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Lógica para campos de valor (moeda)
    if (["ValorVenda", "ValorAluguel", "ValorCondominio", "ValorIPTU"].includes(name)) {
      // Remove tudo que não for número ou vírgula, e depois substitui vírgula por ponto
      const cleanedValue = value.replace(/[^0-9,]/g, "").replace(",", ".");
      setFormData((prevData) => ({
        ...prevData,
        [name]: parseFloat(cleanedValue) || 0, // Converte para float, ou 0 se for inválido
      }));
    } else if (type === "checkbox") {
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked ? "Sim" : "Nao",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
    setValidation((prev) => ({ ...prev, [name]: true }));
  };

  const handleCaracteristicaChange = (selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      Caracteristicas: selectedOptions.map((option) => option.value),
    }));
  };

  const handleProximidadeChange = (selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      Proximidades: selectedOptions.map((option) => option.value),
    }));
  };

  const handleInformacoesAdicionaisChange = (selectedOptions) => {
    setFormData((prevData) => ({
      ...prevData,
      InformacoesAdicionais: selectedOptions.map((option) => option.value),
    }));
  };

  const addImage = () => {
    fileInputRef.current.click();
  };

  const handleImagesUploaded = (uploadedImages) => {
    setFormData((prevData) => ({
      ...prevData,
      Foto: [...prevData.Foto, ...uploadedImages],
    }));
    setShowImageModal(false);
  };

  const addSingleImage = (newImage) => {
    setFormData((prevData) => ({
      ...prevData,
      Foto: [...prevData.Foto, newImage],
    }));
  };

  const updateImage = (index, updatedImage) => {
    setFormData((prevData) => {
      const newPhotos = [...prevData.Foto];
      newPhotos[index] = updatedImage;
      return { ...prevData, Foto: newPhotos };
    });
  };

  const removeImage = (imageUrlToRemove) => {
    setFormData((prevData) => ({
      ...prevData,
      Foto: prevData.Foto.filter((photo) => photo.Foto !== imageUrlToRemove),
    }));
  };

  const removeAllImages = () => {
    if (window.confirm("Tem certeza que deseja remover TODAS as fotos?")) {
      if (window.confirm("Esta é uma ação irreversível. Confirme novamente para remover todas as fotos.")) {
        setFormData((prevData) => ({
          ...prevData,
          Foto: [],
        }));
        toast.success("Todas as fotos foram removidas!");
      }
    }
  };

  const setImageAsHighlight = (imageUrl) => {
    setFormData((prevData) => ({
      ...prevData,
      Foto: prevData.Foto.map((photo) =>
        photo.Foto === imageUrl
          ? { ...photo, Destaque: "Sim" }
          : { ...photo, Destaque: "Nao" }
      ),
    }));
  };

  const changeImagePosition = (fromIndex, toIndex) => {
    setFormData((prevData) => {
      const newPhotos = [...prevData.Foto];
      const [movedPhoto] = newPhotos.splice(fromIndex, 1);
      newPhotos.splice(toIndex, 0, movedPhoto);
      return { ...prevData, Foto: newPhotos };
    });
  };

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setFormData(prevData => ({ ...prevData, CodigoImovel: result }));
  };

  const downloadAllPhotos = async () => {
    if (formData.Foto.length === 0) {
      toast.info("Não há fotos para baixar.");
      return;
    }

    setDownloadingPhotos(true);
    const zip = new JSZip();
    const folderName = formData.CodigoImovel ? `fotos_${formData.CodigoImovel}` : "fotos_imovel";
    const imgFolder = zip.folder(folderName);

    try {
      for (let i = 0; i < formData.Foto.length; i++) {
        const photo = formData.Foto[i];
        const imageUrl = photo.Foto; // URL da imagem
        const imageName = `${formData.CodigoImovel || "imovel"}_foto_${(i + 1).toString().padStart(2, '0')}.jpg`;

        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Erro ao baixar a imagem ${imageName}: ${response.statusText}`);
        }
        const blob = await response.blob();
        imgFolder.file(imageName, blob);
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
      toast.success("Download das fotos concluído!");
    } catch (error) {
      console.error("Erro ao baixar ou compactar fotos:", error);
      toast.error("Erro ao baixar as fotos. Tente novamente.");
    } finally {
      setDownloadingPhotos(false);
    }
  };

  const validateForm = () => {
    const newValidation = { ...validation };
    let isValid = true;

    // Campos de texto obrigatórios
    const requiredFields = [
      "Titulo",
      "Descricao",
      "TipoImovel",
      "Finalidade",
      "Endereco",
      "Numero",
      "Bairro",
      "Cidade",
      "Estado",
      "CEP",
      "Corretor",
      "Imobiliaria",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field] || String(formData[field]).trim() === "") {
        newValidation[field] = false;
        isValid = false;
      }
    });

    // Campos numéricos obrigatórios (se aplicável, ajuste conforme sua regra de negócio)
    const numericFields = [
      "ValorVenda",
      "ValorAluguel",
      "ValorCondominio",
      "ValorIPTU",
      "AreaUtil",
      "AreaTotal",
      "Quartos",
      "Suites",
      "Banheiros",
      "VagasGaragem",
    ];

    numericFields.forEach((field) => {
      // Verifica se o campo é numérico e maior ou igual a zero (se for um campo de valor)
      if (isNaN(formData[field]) || formData[field] < 0) {
        newValidation[field] = false;
        isValid = false;
      }
    });

    // Validação de fotos (mínimo 5 fotos)
    if (!formData.Foto || formData.Foto.length < 5) {
      newValidation.Foto = false;
      isValid = false;
      toast.error("É necessário adicionar pelo menos 5 fotos.");
    }

    setValidation(newValidation);
    return isValid;
  };

  return {
    formData,
    setFormData,
    handleChange,
    handleCaracteristicaChange,
    handleProximidadeChange,
    handleInformacoesAdicionaisChange,
    addSingleImage,
    updateImage,
    removeImage,
    removeAllImages, // Adicionado
    downloadAllPhotos, // Adicionado
    downloadingPhotos, // Adicionado
    setImageAsHighlight,
    changeImagePosition,
    validateForm,
    validation,
    generateRandomCode,
    fileInputRef,
    showImageModal,
    setShowImageModal,
    addImage,
    handleImagesUploaded,
  };
};

export default useImovelForm;
