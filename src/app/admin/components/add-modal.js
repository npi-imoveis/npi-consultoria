"use client";

import { useState } from "react";
import Image from "next/image";
import { getImageUploadMetadata, uploadToS3 } from "@/app/utils/s3-upload";

const ImageUploadModal = ({ title = "Upload de Imagens", onClose, onUploadComplete }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const newFiles = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      const updated = [...prev];
      // Release object URL to prevent memory leaks
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadedUrls = [];

      for (const fileData of selectedFiles) {
        const metadata = await getImageUploadMetadata(fileData.file);
        const success = await uploadToS3(metadata);

        if (success) {
          uploadedUrls.push({
            Foto: metadata.fileUrl,
            Destaque: "Nao",
          });
        }
      }

      if (onUploadComplete) {
        onUploadComplete(uploadedUrls);
      }

      handleClose();
    } catch (error) {
      console.error("Erro ao fazer upload das imagens:", error);
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header - Fixo */}
        <div className="flex justify-between items-center border-b p-4 flex-shrink-0">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={handleClose} className="text-gray-600 hover:text-gray-900">
            ✕
          </button>
        </div>

        {/* Content - Com scroll */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Upload area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              <svg
                className="w-12 h-12 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-lg font-semibold">Arraste e solte as imagens aqui</p>
              <p className="text-sm text-gray-500 mb-4">ou</p>
              <label className="px-4 py-2 bg-black rounded-md text-white hover:bg-black/80 cursor-pointer">
                Selecionar arquivos
                <input
                  type="file"
                  className="hidden"
                  onChange={handleChange}
                  accept="image/*"
                  multiple
                />
              </label>
              <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF (max. 10MB)</p>
            </div>
          </div>

          {/* Preview area */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3">Imagens selecionadas</h3>
              <div className="grid grid-cols-3 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="relative h-32 w-full overflow-hidden rounded-lg border border-gray-200">
                      <Image
                        src={file.preview}
                        alt={file.name}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        ></path>
                      </svg>
                    </button>
                    <p className="text-xs mt-1 truncate">{file.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixo */}
        <div className="border-t p-4 flex justify-end gap-3 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            className="px-4 py-2 bg-black rounded-md text-white hover:bg-black/80 disabled:bg-gray-400"
            disabled={selectedFiles.length === 0 || uploading}
          >
            {uploading ? "Enviando..." : "Enviar imagens"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadModal;
