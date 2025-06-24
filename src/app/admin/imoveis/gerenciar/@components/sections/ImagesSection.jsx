"use client";

const ImagesSection = ({ 
  formData, 
  addSingleImage, 
  showImageModal, 
  updateImage, 
  removeImage, 
  removeAllImages, // Receba a prop aqui
  downloadAllPhotos, // Receba a prop aqui
  downloadingPhotos, // Receba a prop aqui
  setImageAsHighlight, 
  changeImagePosition, 
  validation 
}) => {
  console.log('ImagesSection props:', { removeAllImages, downloadAllPhotos, downloadingPhotos });
  // ... restante do seu código
};

import { memo } from "react";
import FormSection from "../FormSection";
import Image from "next/image";

const ImagesSection = ({
  formData,
  addSingleImage,
  showImageModal,
  updateImage,
  removeImage,
  removeAllImages,
  downloadAllPhotos, // Nova prop adicionada
  downloadingPhotos, // Estado do download
  setImageAsHighlight,
  changeImagePosition,
  validation,
}) => {
  const handleAddImageUrl = () => {
    const imageUrl = prompt("Digite a URL da imagem:");
    if (imageUrl && imageUrl.trim() !== "") {
      addSingleImage(imageUrl.trim());
    }
  };

  const handleImageUpload = (codigo) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          updateImage(codigo, e.target.result);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handlePositionChange = (codigo, newPosition) => {
    const position = parseInt(newPosition);
    if (!isNaN(position) && position > 0 && position <= formData.Foto.length) {
      changeImagePosition(codigo, position);
    }
  };

  // Ordenar fotos por ordem
  const sortedPhotos = formData.Foto
    ? [...formData.Foto].sort((a, b) => {
        const orderA = a.Ordem || formData.Foto.findIndex((p) => p.Codigo === a.Codigo) + 1;
        const orderB = b.Ordem || formData.Foto.findIndex((p) => p.Codigo === b.Codigo) + 1;
        return orderA - orderB;
      })
    : [];

  return (
    <FormSection title="Imagens do Imóvel">
      <div className="space-y-4">
        {/* Contador e botões de ação */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">
              {validation.photoCount} de {validation.requiredPhotoCount} fotos obrigatórias
            </span>
            {validation.photoCount < validation.requiredPhotoCount && (
              <span className="text-red-500 ml-2">
                (Faltam {validation.requiredPhotoCount - validation.photoCount} fotos)
              </span>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Adicionar URL
            </button>
            <button
              type="button"
              onClick={showImageModal}
              className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-black/80"
            >
              Upload de Imagens
            </button>
            
            {/* Botão para baixar todas as fotos */}
            {formData.Foto && formData.Foto.length > 0 && (
              <button
                type="button"
                onClick={downloadAllPhotos}
                disabled={downloadingPhotos}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
                title="Baixar todas as fotos em um arquivo ZIP"
              >
                {downloadingPhotos ? (
                  <>
                    <span className="inline-block animate-spin mr-1">⏳</span>
                    Baixando...
                  </>
                ) : (
                  <>
                    📥 Baixar Todas
                  </>
                )}
              </button>
            )}
            
            {/* Botão para excluir todas as fotos */}
            {formData.Foto && formData.Foto.length > 0 && (
              <button
                type="button"
                onClick={removeAllImages}
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-medium"
                title="Excluir todas as fotos (dupla confirmação)"
              >
                🗑️ Excluir Todas
              </button>
            )}
          </div>
        </div>

        {/* Grid de imagens */}
        {sortedPhotos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPhotos.map((photo, index) => (
              <div key={photo.Codigo} className="border rounded-lg p-3 space-y-2">
                {/* Imagem */}
                <div className="relative h-48 w-full overflow-hidden rounded border">
                  <Image
                    src={photo.Foto}
                    alt={`Foto ${index + 1}`}
                    fill
                    style={{ objectFit: "cover" }}
                    className="rounded"
                  />
                  {photo.Destaque === "Sim" && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                      DESTAQUE
                    </div>
                  )}
                </div>

                {/* Controles */}
                <div className="space-y-2">
                  {/* Posição e destaque */}
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Posição</label>
                      <select
                        value={photo.Ordem || index + 1}
                        onChange={(e) => handlePositionChange(photo.Codigo, e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                      >
                        {Array.from({ length: sortedPhotos.length }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-600 mb-1">Destaque</label>
                      <button
                        type="button"
                        onClick={() => setImageAsHighlight(photo.Codigo)}
                        className={`w-full px-2 py-1 text-sm rounded ${
                          photo.Destaque === "Sim"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {photo.Destaque === "Sim" ? "★ Destaque" : "☆ Destacar"}
                      </button>
                    </div>
                  </div>

                  {/* Botões de ação */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleImageUpload(photo.Codigo)}
                      className="flex-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    >
                      Substituir
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(photo.Codigo)}
                      className="flex-1 px-2 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma imagem adicionada ainda.</p>
            <p className="text-sm">Use os botões acima para adicionar imagens.</p>
          </div>
        )}

        {/* Aviso sobre fotos obrigatórias */}
        {validation.photoCount < validation.requiredPhotoCount && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">
              <strong>Atenção:</strong> São necessárias pelo menos {validation.requiredPhotoCount} fotos para
              publicar o imóvel.
            </p>
          </div>
        )}

        {/* Informações sobre o download */}
        {formData.Foto && formData.Foto.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>💡 Dica:</strong> Use o botão "Baixar Todas" para fazer download de todas as fotos em um arquivo ZIP organizado.
              {formData.Codigo && (
                <span className="block mt-1">
                  Arquivo será nomeado como: <code className="bg-blue-100 px-1 rounded">{formData.Codigo}_fotos.zip</code>
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default memo(ImagesSection);
