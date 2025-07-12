"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageSection({ 
  directory, 
  filename, 
  onChange, 
  currentImageUrl = "",
  sectionKey = "" // Nova prop para identificar a seção única
}) {
  const [preview, setPreview] = useState(currentImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState({ show: false, type: null, message: null });

  // Atualiza o preview quando a URL atual muda (importante para múltiplas tabs)
  useEffect(() => {
    setPreview(currentImageUrl);
  }, [currentImageUrl]);

  const showStatusMessage = (type, message) => {
    setUploadStatus({ show: true, type, message });
    setTimeout(() => {
      setUploadStatus({ show: false, type: null, message: null });
    }, 5000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação de tipo de arquivo
    if (!file.type.startsWith("image/")) {
      showStatusMessage("error", "Por favor, selecione apenas arquivos de imagem");
      return;
    }

    // Validação de tamanho (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showStatusMessage("error", "A imagem deve ter no máximo 5MB");
      return;
    }

    setIsUploading(true);

    try {
      // Preview local imediato
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload para o servidor
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      formData.append("filename", filename);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erro ao fazer upload da imagem");
      }

      const data = await response.json();
      
      // Dispara o onChange com a URL da imagem e o campo específico
      if (onChange) {
        const fieldName = sectionKey ? `${sectionKey}.image_url` : "image_url";
        onChange({
          target: {
            name: fieldName,
            value: data.url,
            previewUrl: data.url
          }
        });
      }

      showStatusMessage("success", "Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      showStatusMessage("error", "Erro ao enviar imagem");
      // Reverter preview em caso de erro
      setPreview(currentImageUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview("");
    if (onChange) {
      const fieldName = sectionKey ? `${sectionKey}.image_url` : "image_url";
      onChange({
        target: {
          name: fieldName,
          value: "",
          previewUrl: ""
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Imagem
      </label>
      
      {/* Preview da imagem */}
      {preview && (
        <div className="relative w-full max-w-md">
          <Image
            src={preview}
            alt="Preview"
            width={400}
            height={300}
            className="rounded-lg object-cover w-full h-auto"
            unoptimized
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
            disabled={isUploading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )}

      {/* Input de upload */}
      <div className="flex items-center space-x-4">
        <label className="relative cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <span>{isUploading ? "Enviando..." : preview ? "Trocar imagem" : "Escolher imagem"}</span>
          <input
            type="file"
            className="sr-only"
            accept="image/*"
            onChange={handleImageUpload}
            disabled={isUploading}
            // ID único para evitar conflitos entre múltiplas instâncias
            id={`image-upload-${directory}-${filename}-${sectionKey}`}
          />
        </label>
        
        {isUploading && (
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
        )}
      </div>

      {/* Mensagem de status */}
      {uploadStatus.show && (
        <div className={`p-3 rounded text-sm ${
          uploadStatus.type === "success" 
            ? "bg-green-100 text-green-800" 
            : "bg-red-100 text-red-800"
        }`}>
          {uploadStatus.message}
        </div>
      )}

      <p className="text-sm text-gray-500">
        Formatos aceitos: JPG, PNG, GIF, WebP. Tamanho máximo: 5MB
      </p>
    </div>
  );
}
