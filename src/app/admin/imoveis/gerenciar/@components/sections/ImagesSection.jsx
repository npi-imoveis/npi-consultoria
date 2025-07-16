"use client";

import { memo, useRef } from "react";
import Image from "next/image";
import { PlusCircleIcon, XCircleIcon, PhotoIcon } from "@heroicons/react/24/outline";
import FormSection from "../FormSection";

const ImagesSection = ({
  formData,
  addSingleImage,
  showImageModal,
  updateImage,
  removeImage,
  setImageAsHighlight,
  changeImagePosition,
  validation,
}) => {
  const fileInputRef = useRef(null);
  
  // Handle both array and object formats for backward compatibility
  const photos = Array.isArray(formData.Foto)
  ? formData.Foto
  : Object.keys(formData.Foto || {}).map((key) => formData.Foto[key]);
  
  // 🔍 DEBUG LOGS
  console.log("⚙️ ADMIN - Fotos no form:", formData.Foto);
  console.log("⚙️ ADMIN - Photos processado:", photos);
  console.log("⚙️ ADMIN - Primeiras 3 fotos (ordem do array):", 
    photos.slice(0, 3).map((f, idx) => ({
      posicaoArray: idx + 1,
      codigo: f.Codigo,
      destaque: f.Destaque,
      campoOrdem: f.Ordem,
      url: f.Foto?.substring(0, 30) + '...'
    }))
  );
  
  const photoCount = photos.length;
  const requiredPhotoCount = validation?.requiredPhotoCount || 5;
  const hasEnoughPhotos = photoCount >= requiredPhotoCount;

  return (
    <FormSection title="Imagens">
      <div className="w-full space-y-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-700">Gerenciar Imagens</h3>
            <p className={`text-xs ${hasEnoughPhotos ? "text-green-600" : "text-red-500"}`}>
              {photoCount} de {requiredPhotoCount} fotos necessárias
              {hasEnoughPhotos ? " ✓" : " (mínimo de 5 fotos obrigatório)"}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={addSingleImage}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              <PlusCircleIcon className="w-4 h-4 mr-1" />
              Adicionar URL
            </button>
            <button
              type="button"
              onClick={showImageModal}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-black hover:bg-gray-800"
            >
              <PlusCircleIcon className="w-4 h-4 mr-1" />
              Upload de Imagens
            </button>
          </div>
        </div>

        <style jsx global>{`
          .flash-update {
            background-color: rgba(59, 130, 246, 0.1);
            transition: background-color 0.3s ease;
          }
        `}</style>

        {photoCount > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grid-fotos">
            {photos
              // ✅ CORRETO: Não ordena - usa ordem natural do array (migração)
              .map((image, index) => {
                const uniquePhotoKey = `${image.Foto || ""}-${index}`;

                return (
                  <div key={uniquePhotoKey} className="border p-3 rounded-md">
                    <div className="relative mb-2 h-36 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {image.Foto ? (
                        <Image
                          src={image.Foto}
                          alt={`Imagem ${index + 1}`}
                          width={300}
                          height={200}
                          className="object-contain w-full h-full"
                          unoptimized
                        />
                      ) : (
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      )}
                      <div className="absolute top-0 left-0 bg-black/70 text-white px-2 py-0.5 text-xs font-semibold">
                        Posição: {index + 1}
                      </div>
                      {/* ✅ INDICADOR VISUAL DE DESTAQUE */}
                      {image.Destaque === "Sim" && (
                        <div className="absolute top-0 right-0 bg-green-600 text-white px-2 py-0.5 text-xs font-semibold">
                          ⭐ DESTAQUE
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          URL da Imagem
                        </label>
                        <input
                          type="text"
                          value={image.Foto || ""}
                          onChange={(e) => updateImage(image.Codigo, "Foto", e.target.value)}
                          className="border-2 px-3 py-1 text-zinc-700 w-full text-xs rounded-md focus:outline-none focus:ring-black focus:border-black"
                          placeholder="https://..."
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`destaque-${uniquePhotoKey}`}
                          checked={image.Destaque === "Sim"}
                          onChange={() => setImageAsHighlight(image.Codigo)}
                          className="h-6 w-6 border-gray-300 rounded text-black focus:ring-black"
                        />
                        <label
                          htmlFor={`destaque-${uniquePhotoKey}`}
                          className="text-xs text-gray-700"
                        >
                          Imagem em destaque
                        </label>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeImage(image.Codigo)}
                          className="inline-flex items-center px-2 py-0.5 border border-transparent text-xs font-medium rounded-md text-red-700 hover:bg-red-50"
                        >
                          <XCircleIcon className="w-3 h-3 mr-1" />
                          Remover
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t">
                        <span className="text-xs text-gray-500">Reordenar:</span>
                        <select
                          className="border border-gray-300 rounded text-xs px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-black"
                          value={index + 1}
                          onChange={(e) =>
                            changeImagePosition(image.Codigo, parseInt(e.target.value, 10))
                          }
                        >
                          {[...Array(photoCount)].map((_, i) => (
                            <option key={`position-${uniquePhotoKey}-${i}`} value={i + 1}>
                              {i + 1}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-md">
            <PhotoIcon className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-xs text-gray-500">Nenhuma imagem adicionada ainda.</p>
            <p className="text-xs text-gray-500">Clique em "Adicionar Imagem" para começar.</p>
            <p className="text-xs text-red-500 font-medium mt-2">
              É necessário adicionar pelo menos 5 fotos
            </p>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default memo(ImagesSection);
