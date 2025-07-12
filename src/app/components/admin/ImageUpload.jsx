"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageUpload({ directory, filename, onChange }) {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Carregar imagem existente
  useEffect(() => {
    if (filename) {
      // ✅ Cache busting na imagem inicial
      setImageUrl(`/uploads/${directory}/${filename}?v=${Date.now()}`);
    }
  }, [directory, filename]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      
      if (filename) {
        formData.append("customFilename", filename);
      }

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // ✅ API já retorna com cache busting
        setImageUrl(data.path);
        
        // Notificar component pai
        if (onChange) {
          onChange({
            target: {
              name: directory,
              value: data.pathWithoutCache, // Salva sem cache no banco
              previewUrl: data.path, // Usa com cache para preview
            }
          });
        }

        // ✅ Força atualização extra após 100ms (para garantir)
        setTimeout(() => {
          setImageUrl(`${data.pathWithoutCache}?v=${Date.now()}`);
        }, 100);

      } else {
        setError(data.error || "Erro no upload");
      }
    } catch (err) {
      console.error("Erro no upload:", err);
      setError("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview da imagem */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        {imageUrl ? (
          <div className="relative w-full h-48">
            <Image
              src={imageUrl}
              alt={`Upload ${directory}`}
              fill
              className="object-cover rounded"
              unoptimized={true} // ✅ Evita cache do Next.js
              onError={() => {
                console.log("Erro ao carregar imagem, tentando novamente...");
                // Tenta novamente com novo timestamp
                setImageUrl(`/uploads/${directory}/${filename}?v=${Date.now()}`);
              }}
            />
            
            {/* Indicador de carregamento */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                <div className="text-white">Carregando...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-48 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p className="mt-2">Nenhuma imagem</p>
            </div>
          </div>
        )}
      </div>

      {/* Input de upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload de Imagem
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
        />
      </div>

      {/* Mensagens de erro */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
          {error}
        </div>
      )}

      {/* Botão para forçar reload (debug) */}
      {imageUrl && !isUploading && (
        <button
          onClick={() => setImageUrl(`/uploads/${directory}/${filename}?v=${Date.now()}`)}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          🔄 Recarregar imagem
        </button>
      )}
    </div>
  );
}
