"use client";

import { useState, useEffect } from "react";

export default function LogosParceirosSection({ form, onChange }) {
  const [logos, setLogos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState({ show: false, type: null, message: null });
  const DIRECTORY = "parceiros";

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const response = await fetch(`/api/admin/upload?directory=${DIRECTORY}`);
      const data = await response.json();
      if (data.success) {
        setLogos(data.images);
      }
    } catch (error) {
      console.error("Erro ao carregar logos:", error);
      showStatusMessage("error", "Erro ao carregar logos");
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setIsUploading(true);
    showStatusMessage("info", "Enviando logo...");

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("directory", DIRECTORY);

      const response = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        showStatusMessage("success", "Logo enviado com sucesso!");
        fetchLogos(); // Atualiza a lista de logos
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
        fetchLogos(); // Atualiza a lista de logos
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
            className={`inline-block px-4 py-2 bg-black text-white rounded cursor-pointer transition-colors ${
              isUploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isUploading ? "Enviando..." : "Upload de Logo"}
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
              : status.type === "warning"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-blue-100 text-blue-800"
          }`}
        >
          {status.message}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {logos.map((logoUrl, index) => (
          <div key={index} className="relative group">
            <div className="aspect-w-16 aspect-h-9 bg-gray-50 rounded-lg overflow-hidden">
              <img
                src={logoUrl}
                alt={`Logo ${index + 1}`}
                className="w-full h-full object-contain p-2"
                onError={(e) => {
                  e.target.onerror = null;
                  console.error(`Erro ao carregar imagem: ${logoUrl}`);
                }}
              />
            </div>
            <button
              onClick={() => handleDelete(logoUrl.split("/").pop())}
              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
          </div>
        ))}
      </div>
    </div>
  );
}
