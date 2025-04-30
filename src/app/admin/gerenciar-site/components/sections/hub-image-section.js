"use client";

import { useState, useEffect } from "react";

export default function HubImageSection({ onChange, name, filename }) {
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ show: false, type: null, message: null });
  const DIRECTORY = "sobre_hub";

  useEffect(() => {
    fetchImage();
  }, []);

  const fetchImage = async () => {
    try {
      const response = await fetch(`/api/admin/upload?directory=${DIRECTORY}`);
      const data = await response.json();
      if (data.success) {
        // Procura a imagem específica pelo nome do arquivo
        const targetImage = data.images.find((img) => img.endsWith(filename));
        if (targetImage) {
          setImage(targetImage);
          // Notifica o componente pai sobre a mudança
          if (onChange) {
            onChange({
              target: {
                name: name,
                value: targetImage,
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

    try {
      // Se já existe uma imagem com o nome específico, vamos deletá-la primeiro
      if (image) {
        await fetch(`/api/admin/upload?directory=${DIRECTORY}&filename=${filename}`, {
          method: "DELETE",
        });
      }

      // Preparar o arquivo com o nome específico
      const file = files[0];
      const extension = file.name.split(".").pop();
      const newFile = new File([file], filename, { type: file.type });

      const formData = new FormData();
      formData.append("file", newFile);
      formData.append("directory", DIRECTORY);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        showStatusMessage("success", "Imagem enviada com sucesso!");
        fetchImage(); // Atualiza a imagem
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
            id={`hubImage_${name}`}
          />
          <label
            htmlFor={`hubImage_${name}`}
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

      {image && (
        <div className="relative group">
          <div className="aspect-w-16 aspect-h-9 bg-gray-50 rounded-lg overflow-hidden">
            <img
              src={image}
              alt={`Imagem ${name}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                console.error(`Erro ao carregar imagem: ${image}`);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
