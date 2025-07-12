"use client";
import { useState, useEffect } from "react";

export default function ImageSection({ directory, filename, onChange }) {
  const [imageUrl, setImageUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [imageExists, setImageExists] = useState(false);

  useEffect(() => {
    if (filename && directory) {
      console.log(`🔄 Verificando imagem: ${directory}/${filename}`);
      // ✅ Não tenta carregar automaticamente - evita loop
      setImageExists(false);
    }
  }, [directory, filename]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log(`🚀 Upload para: ${directory}/${filename}`);
    console.log(`📄 Arquivo selecionado:`, {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    setIsUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", directory);
      formData.append("customFilename", filename);

      console.log(`📦 FormData sendo enviado:`, {
        directory: directory,
        customFilename: filename,
        fileInfo: `${file.name} (${file.size} bytes)`
      });

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      console.log(`📡 Response status: ${response.status}`);
      
      const data = await response.json();
      console.log("📥 Resposta completa:", data);

      if (data.success) {
        console.log(`✅ Sucesso: ${data.filename}`);
        console.log(`🔗 URL gerada: ${data.path}`);
        
        setImageUrl(data.path);
        setImageExists(true);
        
        if (onChange) {
          onChange({
            target: {
              name: directory,
              value: data.pathWithoutCache || data.path,
            }
          });
        }

      } else {
        console.error("❌ Erro na resposta:", data);
        setError(`API Error: ${data.error} ${data.details ? '- ' + data.details : ''}`);
      }
    } catch (err) {
      console.error("❌ Erro de conexão:", err);
      setError(`Erro de conexão: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ✅ Função para tentar carregar imagem existente (manual)
  const tryLoadExistingImage = () => {
    const timestamp = Date.now();
    const testUrl = `/uploads/${directory}/${filename}?v=${timestamp}`;
    
    // Criar img para testar se existe
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Imagem encontrada: ${testUrl}`);
      setImageUrl(testUrl);
      setImageExists(true);
    };
    img.onerror = () => {
      console.log(`❌ Imagem não encontrada: ${testUrl}`);
      setImageExists(false);
    };
    img.src = testUrl;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Upload de Imagem - {filename}
        </h3>
        <div className="text-xs text-gray-500">
          {directory}/{filename}
        </div>
      </div>
      
      {/* Preview da imagem */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[200px] flex items-center justify-center">
        {imageUrl && imageExists ? (
          <div className="relative w-full h-48">
            <img
              src={imageUrl}
              alt={`${directory}/${filename}`}
              className="w-full h-full object-cover rounded"
              onError={() => {
                console.log(`❌ Erro ao carregar: ${imageUrl}`);
                setImageExists(false);
                // ✅ NÃO tenta recarregar automaticamente - evita loop
              }}
              onLoad={() => {
                console.log(`✅ Imagem carregada: ${imageUrl}`);
                setImageExists(true);
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
            <p>Nenhuma imagem</p>
            <p className="text-xs mt-1 font-mono">{filename}</p>
            
            {/* Botão para tentar carregar imagem existente */}
            <button
              onClick={tryLoadExistingImage}
              className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
            >
              🔍 Verificar se existe imagem
            </button>
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
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
          ❌ {error}
        </div>
      )}

      {isUploading && (
        <div className="text-blue-600 text-sm">
          📤 Enviando para Vercel Blob...
        </div>
      )}

      {/* Info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <div>📁 Pasta: <code>{directory}</code></div>
        <div>📄 Arquivo: <code>{filename}</code></div>
        <div>🔗 Status: {imageExists ? "✅ Carregada" : "❌ Não encontrada"}</div>
      </div>
    </div>
  );
}
