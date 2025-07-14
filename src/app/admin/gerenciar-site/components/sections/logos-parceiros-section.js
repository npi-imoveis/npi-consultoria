"use client";

import { useState, useEffect } from "react";

export default function LogosParceirosSection({ form, onChange }) {
  const [logos, setLogos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ show: false, type: null, message: null });
  const [isLoading, setIsLoading] = useState(true);
  const DIRECTORY = "parceiros";

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/upload?directory=${DIRECTORY}`);
      const data = await response.json();
      
      if (data.success) {
        // Filtra apenas URLs válidas e remove duplicatas
        const validLogos = data.images.filter(logo => 
          logo && typeof logo === 'string' && logo.trim() !== ''
        );
        setLogos(validLogos);
        console.log('Logos carregados:', validLogos);
      } else {
        console.error('Erro na resposta da API:', data);
        showStatusMessage("error", "Erro ao carregar logos");
      }
    } catch (error) {
      console.error("Erro ao carregar logos:", error);
      showStatusMessage("error", "Erro ao carregar logos");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    // Validação do arquivo
    const file = files[0];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      showStatusMessage("error", "Tipo de arquivo não permitido. Use JPG, PNG, GIF ou WebP.");
      return;
    }

    if (file.size > maxSize) {
      showStatusMessage("error", "Arquivo muito grande. Máximo 5MB.");
      return;
    }

    setIsUploading(true);
    showStatusMessage("info", "Enviando logo...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", DIRECTORY);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        showStatusMessage("success", "Logo enviado com sucesso!");
        await fetchLogos(); // Recarrega a lista
        
        // Limpa o input
        e.target.value = '';
      } else {
        showStatusMessage("error", data.error || "Erro ao enviar logo");
      }
    } catch (error) {
      console.error("Erro no upload:", error);
      showStatusMessage("error", "Erro ao enviar logo");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (filename) => {
    if (!confirm("Tem certeza que deseja deletar este logo?")) return;

    try {
      const response = await fetch(
        `/api/admin/upload?directory=${DIRECTORY}&filename=${filename}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();
      if (data.success) {
        if (data.warning) {
          showStatusMessage(
            "warning",
            `${data.message} - Nota: Em produção, arquivos não são fisicamente removidos devido às limitações da Vercel.`
          );
        } else {
          showStatusMessage("success", data.message || "Logo deletado com sucesso!");
        }
        await fetchLogos(); // Recarrega a lista
      } else {
        showStatusMessage("error", data.error || "Erro ao deletar logo");
      }
    } catch (error) {
      console.error("Erro ao deletar:", error);
      showStatusMessage("error", "Erro ao deletar logo");
    }
  };

  const showStatusMessage = (type, message) => {
    setStatus({ show: true, type, message });
    setTimeout(() => {
      setStatus({ show: false, type: null, message: null });
    }, 5000);
  };

  const getFilenameFromUrl = (url) => {
    if (!url) return '';
    return url.split('/').pop() || '';
  };

  return (
    <div className="space-y-6">
      {/* Header com botão de upload */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Logos dos Parceiros
          </h3>
          <p className="text-sm text-gray-600">
            Faça upload dos logos das empresas parceiras que aparecerão na home.
          </p>
        </div>
        
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={isUploading}
            className="hidden"
            id="logoInput"
          />
          <label
            htmlFor="logoInput"
            className={`inline-flex items-center px-4 py-2 bg-black text-white rounded cursor-pointer transition-colors hover:bg-gray-800 ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enviando...
              </>
            ) : (
              "Upload de Logo"
            )}
          </label>
        </div>
      </div>

      {/* Status message */}
      {status.show && (
        <div
          className={`p-4 rounded-md ${
            status.type === "success"
              ? "bg-green-100 text-green-800"
              : status.type === "error"
              ? "bg-red-100 text-red-800"
              : status.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <svg className="animate-spin h-8 w-8 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2 text-gray-600">Carregando logos...</span>
        </div>
      )}

      {/* Grid de logos */}
      {!isLoading && (
        <div>
          {logos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum logo encontrado</h3>
              <p className="mt-1 text-sm text-gray-500">Faça upload do primeiro logo dos seus parceiros.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {logos.map((logoUrl, index) => (
                <div key={`${logoUrl}-${index}`} className="relative group">
                  <div className="aspect-w-16 aspect-h-9 bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <img
                      src={logoUrl}
                      alt={`Logo ${index + 1}`}
                      className="w-full h-full object-contain p-3"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-logo.png'; // fallback
                        console.error(`Erro ao carregar imagem: ${logoUrl}`);
                      }}
                      onLoad={() => {
                        console.log(`Logo carregado com sucesso: ${logoUrl}`);
                      }}
                    />
                  </div>
                  
                  {/* Botão de deletar */}
                  <button
                    onClick={() => handleDelete(getFilenameFromUrl(logoUrl))}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    title="Deletar logo"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  
                  {/* URL preview no hover (para debug) */}
                  <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity truncate">
                    {getFilenameFromUrl(logoUrl)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info adicional */}
      {logos.length > 0 && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>Total de logos:</strong> {logos.length}
          <br />
          <strong>Dica:</strong> Para que os logos apareçam na home, certifique-se de que o componente da home está buscando logos do diretório "parceiros".
        </div>
      )}
    </div>
  );
}
