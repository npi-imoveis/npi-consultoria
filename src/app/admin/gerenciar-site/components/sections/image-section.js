"use client";

import { useState, useEffect } from "react";

export default function ImageSection({ onChange, filename, directory }) {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ show: false, type: null, message: null });
  const [previewImage, setPreviewImage] = useState(null);
  const DIRECTORY = directory;

  useEffect(() => {
    setPreviewImage(null);
    fetchImage();
  }, [filename, DIRECTORY]);

  const fetchImage = async () => {
    try {
      const response = await fetch(`/api/upload?directory=${DIRECTORY}`);
      const data = await response.json();
      if (data.success && data.images.length > 0) {
        // Procurar pela imagem específica com o nome do arquivo
        let targetImage;
        if (filename) {
          targetImage = data.images.find((img) => img.includes(filename));
        }
        // Se não encontrar ou filename não for fornecido, pega a primeira imagem
        if (!targetImage && data.images.length > 0) {
          targetImage = data.images[0];
        }

        if (targetImage) {
          setImage(targetImage);
          // Notifica o componente pai sobre a mudança
          if (onChange) {
            onChange({
              target: {
                name: `${DIRECTORY}_image`,
                value: targetImage,
                previewUrl: targetImage,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar imagem:", error);
      showStatusMessage("error", "Erro ao carregar imagem");
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setIsUploading(true);
    showStatusMessage("info", "Enviando imagem...");

    // Cria um preview da imagem
    const fileReader = new FileReader();
    fileReader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    fileReader.readAsDataURL(files[0]);

    try {
      // Se já existe uma imagem, vamos deletá-la primeiro
      if (image) {
        const oldFilename = image.split("/").pop();
        await fetch(`/api/upload?directory=${DIRECTORY}&filename=${oldFilename}`, {
          method: "DELETE",
        });
      }

      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("directory", DIRECTORY);

      // Adicionar o nome personalizado da imagem, se disponível
      if (filename) {
        formData.append("customFilename", filename);
      }

      const response = await fetch("/api/upload", {

        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        showStatusMessage("success", "Imagem enviada com sucesso!");
        setImage(data.path);

        // Notifica o componente pai sobre a mudança
        if (onChange) {
          onChange({
            target: {
              name: `${DIRECTORY}_image`,
              value: data.path,
              previewUrl: data.path,
            },
          });
        }

        // Mantém o preview com a nova URL em vez de limpar
        setPreviewImage(data.path);
      } else {
        showStatusMessage("error", data.error || "Erro ao enviar imagem");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      showStatusMessage("error", "Erro ao enviar imagem");
    } finally {
      setIsUploading(false);
    }
  };

  const showStatusMessage = (type, message) => {
    setStatus({ show: true, type, message });
    setTimeout(() => {
      setStatus({ show: false, type: null, message: null });
    }, 5000);
  };

  // Determina qual imagem mostrar: o preview (se disponível) ou a imagem carregada
  const displayImage = previewImage || image;
  const inputId = `${DIRECTORY}_image_${filename || "default"}_input`;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
            id={inputId}
          />
          <label
            htmlFor={inputId}
            className={`inline-block px-4 py-2 bg-black text-white rounded cursor-pointer transition-colors ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? "Enviando..." : "Upload de Imagem"}
          </label>
        </div>
      </div>

      {status.show && (
        <div
          className={`p-4 rounded-md ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : status.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status.message}
        </div>
      )}

      {displayImage && (
        <div className="relative group">
          <div className="aspect-w-16 aspect-h-9 bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={displayImage}
              alt="Imagem do Conteúdo"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                console.error(`Erro ao carregar imagem: ${displayImage}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
