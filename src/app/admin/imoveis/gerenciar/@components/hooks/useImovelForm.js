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


// ImagesSection.js (corrigido)

import { memo } from "react";
import FormSection from "../FormSection";
import Image from "next/image";

const ImagesSection = ({
  formData,
  addSingleImage,
  showImageModal,
  updateImage,
  removeImage,
  setImageAsHighlight,
  changeImagePosition,
  validation,
}) => {
  return (
    <FormSection title="Fotos do Imóvel" highlight={validation?.photoCount < 5}>
      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-800">
            Fotos cadastradas: {formData.Foto?.length || 0}
          </p>
          <p className="text-xs text-blue-600">Mínimo necessário: 5 fotos</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={() => {
            const url = prompt("Digite a URL da imagem:");
            if (url && url.trim()) addSingleImage(url.trim());
          }} className="bg-green-600 text-white px-4 py-2 rounded-md">
            🔗 Adicionar URL
          </button>

          <button type="button" onClick={showImageModal} className="bg-blue-600 text-white px-4 py-2 rounded-md">
            📤 Upload de Imagens
          </button>
        </div>

        {formData.Foto?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.Foto.sort((a, b) => (a.Ordem || 0) - (b.Ordem || 0)).map((photo, i) => (
              <div key={photo.Codigo} className="border rounded-lg">
                <div className="relative h-48 w-full">
                  <Image src={photo.Foto} alt={`Foto ${i + 1}`} fill style={{ objectFit: "cover" }} />
                </div>
                <div className="p-2 flex justify-between">
                  <span>Foto {photo.Ordem || i + 1}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setImageAsHighlight(photo.Codigo)}>⭐</button>
                    <button onClick={() => {
                      const nova = prompt("Nova URL:", photo.Foto);
                      if (nova && nova !== photo.Foto) updateImage(photo.Codigo, nova);
                    }}>✏️</button>
                    <button onClick={() => removeImage(photo.Codigo)}>🗑️</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">Nenhuma foto cadastrada</div>
        )}
      </div>
    </FormSection>
  );
};

export default memo(ImagesSection);
