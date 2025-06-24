"use client";

import { memo } from "react";
import FormSection from "../FormSection";
import Image from "next/image";

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
  // Função simplificada para excluir todas as fotos
  const handleRemoveAllImages = () => {
    // Primeira confirmação
    if (!window.confirm(
      "⚠️ ATENÇÃO: Tem certeza que deseja excluir TODAS as fotos deste imóvel?"
    )) {
      return;
    }

    // Segunda confirmação
    if (!window.confirm(
      "🚨 CONFIRMAÇÃO FINAL: Esta ação é IRREVERSÍVEL! Todas as fotos serão permanentemente excluídas. Deseja continuar?"
    )) {
      return;
    }

    // Limpar todas as fotos usando setFormData diretamente
    if (typeof setFormData !== 'undefined') {
      setFormData((prevData) => ({
        ...prevData,
        Foto: [],
      }));
    } else {
      // Fallback: remover uma por uma
      if (formData.Foto && Array.isArray(formData.Foto)) {
        formData.Foto.forEach((photo) => {
          removeImage(photo.Codigo);
        });
      }
    }

    alert("✅ Todas as fotos foram excluídas com sucesso!");
  };

  // Função simplificada para baixar todas as fotos (individualmente)
  const handleDownloadAllPhotos = async () => {
    if (!formData.Foto || formData.Foto.length === 0) {
      alert("Não há fotos para baixar!");
      return;
    }

    // Confirmar ação
    if (!window.confirm(
      `Deseja baixar todas as ${formData.Foto.length} fotos? Elas serão baixadas individualmente.`
    )) {
      return;
    }

    try {
      // Ordenar fotos por ordem
      const sortedPhotos = [...formData.Foto].sort((a, b) => {
        const orderA = a.Ordem || formData.Foto.findIndex((p) => p.Codigo === a.Codigo) + 1;
        const orderB = b.Ordem || formData.Foto.findIndex((p) => p.Codigo === b.Codigo) + 1;
        return orderA - orderB;
      });

      // Nome base para os arquivos
      const imovelCode = formData.Codigo || "imovel";
      
      // Baixar cada foto individualmente
      for (let i = 0; i < sortedPhotos.length; i++) {
        const photo = sortedPhotos[i];
        try {
          const response = await fetch(photo.Foto);
          if (response.ok) {
            const blob = await response.blob();
            
            // Determinar extensão da imagem
            const contentType = response.headers.get('content-type') || '';
            let extension = '.jpg';
            if (contentType.includes('png')) extension = '.png';
            else if (contentType.includes('gif')) extension = '.gif';
            else if (contentType.includes('webp')) extension = '.webp';

            // Nome do arquivo: codigo_foto_01.jpg, codigo_foto_02.jpg, etc.
            const photoNumber = String(i + 1).padStart(2, '0');
            const fileName = `${imovelCode}_foto_${photoNumber}${extension}`;
            
            // Criar link de download
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Pequena pausa entre downloads para não sobrecarregar
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error(`Erro ao baixar foto ${i + 1}:`, error);
        }
      }

      alert(`✅ Download concluído! ${sortedPhotos.length} fotos foram baixadas.`);
      
    } catch (error) {
      console.error("Erro ao baixar fotos:", error);
      alert("Erro ao baixar as fotos. Tente novamente.");
    }
  };

  return (
    <FormSection title="Fotos do Imóvel" highlight={validation?.photoCount < 5}>
      <div className="space-y-4">
        {/* Informações sobre fotos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                Fotos cadastradas: {formData.Foto?.length || 0}
              </p>
              <p className="text-xs text-blue-600">
                Mínimo necessário: 5 fotos
              </p>
            </div>
            {(formData.Foto?.length || 0) >= 5 && (
              <div className="text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              const url = prompt("Digite a URL da imagem:");
              if (url && url.trim()) {
                addSingleImage(url.trim());
              }
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 text-sm"
          >
            🔗 Adicionar URL
          </button>

          <button
            type="button"
            onClick={showImageModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm"
          >
            📤 Upload de Imagens
          </button>

          {/* Botão Baixar Todas as Fotos */}
          {formData.Foto && formData.Foto.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadAllPhotos}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 text-sm"
            >
              📥 Baixar Todas
            </button>
          )}

          {/* Botão Excluir Todas as Fotos */}
          {formData.Foto && formData.Foto.length > 0 && (
            <button
              type="button"
              onClick={handleRemoveAllImages}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 text-sm"
            >
              🗑️ Excluir Todas
            </button>
          )}
        </div>

        {/* Dica informativa */}
        {formData.Foto && formData.Foto.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700">
              💡 <strong>Dica:</strong> O botão "Baixar Todas" fará o download individual de cada foto com nomes organizados (codigo_foto_01.jpg, codigo_foto_02.jpg, etc.). O botão "Excluir Todas" remove todas as fotos após dupla confirmação.
            </p>
          </div>
        )}

        {/* Lista de fotos */}
        {formData.Foto && formData.Foto.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {formData.Foto
              .sort((a, b) => {
                const orderA = a.Ordem || formData.Foto.findIndex((p) => p.Codigo === a.Codigo) + 1;
                const orderB = b.Ordem || formData.Foto.findIndex((p) => p.Codigo === b.Codigo) + 1;
                return orderA - orderB;
              })
              .map((photo, index) => (
                <div key={photo.Codigo} className="relative group border rounded-lg overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={photo.Foto}
                      alt={`Foto ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-300 group-hover:scale-105"
                    />
                    {photo.Destaque === "Sim" && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold">
                        DESTAQUE
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Foto {photo.Ordem || index + 1}
                      </span>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => setImageAsHighlight(photo.Codigo)}
                          className={`px-2 py-1 rounded text-xs ${
                            photo.Destaque === "Sim"
                              ? "bg-yellow-500 text-white"
                              : "bg-gray-200 text-gray-700 hover:bg-yellow-500 hover:text-white"
                          }`}
                        >
                          ⭐
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newUrl = prompt("Nova URL da imagem:", photo.Foto);
                            if (newUrl && newUrl.trim() && newUrl !== photo.Foto) {
                              updateImage(photo.Codigo, newUrl.trim());
                            }
                          }}
                          className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => removeImage(photo.Codigo)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <select
                        value={photo.Ordem || index + 1}
                        onChange={(e) => changeImagePosition(photo.Codigo, parseInt(e.target.value))}
                        className="text-xs border border-gray-300 rounded px-1 py-1 flex-1"
                      >
                        {Array.from({ length: formData.Foto.length }, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Posição {i + 1}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Mensagem quando não há fotos */}
        {(!formData.Foto || formData.Foto.length === 0) && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500 mb-4">Nenhuma foto cadastrada</p>
            <p className="text-sm text-gray-400">
              Use os botões acima para adicionar fotos ao imóvel
            </p>
          </div>
        )}
      </div>
    </FormSection>
  );
};

export default memo(ImagesSection);

