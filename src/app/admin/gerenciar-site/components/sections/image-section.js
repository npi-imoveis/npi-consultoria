"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageSection({ directory, filename, onChange }) {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Carregar imagem existente com cache busting
  useEffect(() => {
    if (filename && directory) {
      console.log(`🔄 Carregando imagem: ${directory}/${filename}`); // Debug
      // ✅ Cache busting automático
      const timestamp = Date.now();
      setImageUrl(`https://[seu-blob-url]/${directory}/${filename}?v=${timestamp}`);
      
      // ✅ Fallback para uploads locais (se ainda existirem)
      setTimeout(() => {
        setImageUrl(`/uploads/${directory}/${filename}?v=${timestamp}`);
      }, 100);
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
      
      // ✅ FORÇAR o filename específico
      if (filename) {
        formData.append("customFilename", filename);
        console.log(`🔥 Upload para: ${directory}/${filename}`); // Debug
      }

      // ✅ Usar a nova API do Vercel Blob
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📤 Resposta do upload:", data); // Debug

      if (data.success) {
        // ✅ Verificar se foi salvo com o nome correto
        console.log(`✅ Imagem salva como: ${data.filename}`);
        
        // ✅ Cache busting na URL retornada
        setImageUrl(data.path);
        
        // Notificar component pai
        if (onChange) {
          onChange({
            target: {
              name: `${directory}_${filename.replace('.jpg', '')}`, // historia_01, historia_02, etc
              value: data.pathWithoutCache || data.path,
            }
          });
        }

        // ✅ Força atualização extra após 200ms
        setTimeout(() => {
          const newTimestamp = Date.now();
          setImageUrl(`${data.pathWithoutCache || data.blobUrl}?v=${newTimestamp}`);
        }, 200);

      } else {
        setError(data.error || "Erro no upload");
        console.error("❌ Erro no upload:", data);
      }
    } catch (err) {
      console.error("❌ Erro no upload:", err);
      setError("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Upload de Imagem - {filename}
      </label>
      
      {/* Preview da imagem */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
        {imageUrl ? (
          <div className="relative w-full h-48">
            <Image
              src={imageUrl}
              alt={`Upload ${directory}/${filename}`}
              fill
              className="object-cover rounded"
              unoptimized={true} // ✅ Evita cache do Next.js
              onError={() => {
                console.log("Erro ao carregar imagem, tentando recarregar...");
                // Tenta novamente com novo timestamp
                const retryTimestamp = Date.now();
                setImageUrl(`/uploads/${directory}/${filename}?v=${retryTimestamp}`);
              }}
            />
            
            {/* Indicador de carregamento */}
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                <div className="text-white font-semibold">Enviando...</div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="mt-2">Clique para fazer upload</p>
            <p className="text-xs text-gray-400">{filename}</p>
          </div>
        )}
      </div>

      {/* Input de upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
      />

      {/* Mensagens de erro */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          ❌ {error}
        </div>
      )}

      {/* Botão para forçar reload (debug) */}
      {imageUrl && !isUploading && (
        <button
          onClick={() => {
            const refreshTimestamp = Date.now();
            setImageUrl(`/uploads/${directory}/${filename}?v=${refreshTimestamp}`);
          }}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          🔄 Recarregar imagem
        </button>
      )}
    </div>
  );
}
