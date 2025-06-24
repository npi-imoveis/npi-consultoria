// useImovelForm.js (corrigido)

import { useState, useEffect, useRef, useCallback } from "react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { REQUIRED_FIELDS } from "../FieldGroup";
import useImovelStore from "@/app/admin/store/imovelStore";
import { getCorretorById } from "@/app/admin/services/corretor";
import { generateUniqueCode } from "@/app/utils/idgenerate";

export const generateRandomCode = async () => {
  const code = await generateUniqueCode();
  return code;
};

export const useImovelForm = () => {
  const provider = new OpenStreetMapProvider();
  const fileInputRef = useRef(null);

  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

  const [formData, setFormData] = useState({ ... }); // Reduzido por brevidade
  const [displayValues, setDisplayValues] = useState({ ... });
  const [newImovelCode, setNewImovelCode] = useState("");
  const [showImageModal, setShowImageModal] = useState(false);
  const [validation, setValidation] = useState({ ... });

  useEffect(() => {
    if (isAutomacao || !formData.Codigo) {
      const fetchCode = async () => {
        const code = await generateRandomCode();
        setNewImovelCode(code);
        setFormData((prevData) => ({
          ...prevData,
          Codigo: code,
          Foto: [], // Zera as imagens ao iniciar para automação
        }));
      };
      fetchCode();
    }
  }, [isAutomacao, formData.Codigo]);

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
      Foto: [...(prevData.Foto || []), newImage],
    }));
  }, [formData.Foto]);

  const updateImage = useCallback((codigo, newImageUrl) => {
    setFormData((prevData) => {
      const updatedFotos = (prevData.Foto || []).map((photo) =>
        photo.Codigo === codigo ? { ...photo, Foto: newImageUrl } : photo
      );
      return { ...prevData, Foto: updatedFotos };
    });
  }, []);

  const handleImagesUploaded = (novasImagens) => {
    if (!novasImagens || !Array.isArray(novasImagens)) return;
    setFormData((prevData) => {
      const fotosExistentes = [...(prevData.Foto || [])];
      const novasFotos = novasImagens.map((image, index) => ({
        Codigo: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        Foto: image.Foto,
        Destaque: "Nao",
        Ordem: fotosExistentes.length + index + 1,
      }));
      return { ...prevData, Foto: [...fotosExistentes, ...novasFotos] };
    });
  };

  return {
    formData,
    setFormData,
    addSingleImage,
    updateImage,
    handleImagesUploaded,
    showImageModal,
    setShowImageModal,
    ... // outros retornos omitidos para brevidade
  };
};

export default useImovelForm;
