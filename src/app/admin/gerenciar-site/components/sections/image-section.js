"use client";
import { useState, useEffect } from "react";

export default function ImageSection({ directory, filename, onChange }) {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  // Debug: Sempre mostrar qual filename está sendo usado
  console.log(`🎯 ImageSection renderizado - Directory: ${directory}, Filename: ${filename}`);

  useEffect(() => {
    if (filename && directory) {
      const timestamp = Date.now();
      // Tenta carregar a imagem existente
      setImageUrl(`/uploads/${directory}/${filename}?v=${timestamp}`);
    }
  }, [directory, filename]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log(`🚀 Iniciando upload para: ${directory}/${filename}`);
    
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      formData.append("customFilename", filename); // SEMPRE força o filename

      console.log("📦 FormData enviado:", {
        directory,
        customFilename: filename,
        fileSize: file.size,
        fileName: file.name
      });

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("📥 Resposta da API:", data);

      if (data.success) {
        console.log(`✅ SUCESSO! Arquivo salvo como: ${data.filename}`);
        console.log(`🔗 URL: ${data.path}`);
        
        // Atualizar imagem imediatamente
        setImageUrl(data.path);
        
        // Notificar component pai
        if (onChange) {
          onChange({
            target: {
              name: `historia_imagem_${filename.replace('.jpg', '')}`, // historia_imagem_01, historia_imagem_02, etc
              value: data.pathWithoutCache || data.path,
            }
          });
        }

        // Força refresh extra
        setTimeout(() => {
          setImageUrl(`${data.pathWithoutCache || data.blobUrl}?v=${Date.now()}`);
        }, 300);

      } else {
        console.error("❌ Erro na API:", data);
        setError(data.error || "Erro no upload");
      }
    } catch (err) {
      console.error("❌ Erro geral:", err);
      setError("Erro ao fazer upload da imagem");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Upload de Imagem - {filename}
        </h3>
        <div className="text-xs text-gray-500">
          Pasta: {directory} | Arquivo: {filename}
        </div>
      </div>
      
      {/* Preview da imagem */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
        {imageUrl ? (
          <div className="relative w-full h-48">
            <img
              src={imageUrl}
              alt={`${directory}/${filename}`}
              className="w-full h-full object-cover rounded"
              onError={() => {
                console.log(`❌ Erro ao carregar: ${imageUrl}`);
                const retryUrl = `/uploads/${directory}/${filename}?v=${Date.now()}`;
                setImageUrl(retryUrl);
              }}
              onLoad={() => {
                console.log(`✅ Imagem carregada: ${imageUrl}`);
              }}
            />
            
            {isUploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                <div className="text-white font-semibold">
                  Enviando {filename}...
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">📷</div>
            <p>Clique para fazer upload</p>
            <p className="text-xs mt-1 font-mono">{filename}</p>
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

      {/* Status */}
      <div className="text-xs">
        {isUploading && <div className="text-blue-600">📤 Enviando para {filename}...</div>}
        {error && <div className="text-red-600 bg-red-50 p-2 rounded">❌ {error}</div>}
      </div>

      {/* Debug info */}
      <details className="text-xs text-gray-500">
        <summary>Debug Info</summary>
        <div className="mt-2 p-2 bg-gray-100 rounded font-mono">
          <div>Directory: {directory}</div>
          <div>Filename: {filename}</div>
          <div>Current URL: {imageUrl}</div>
        </div>
      </details>
    </div>
  );
}
