// ImagesSection.jsx - VERSÃO FINAL USANDO EXATAMENTE O MESMO photoSorter DO FRONTEND
"use client";

import { memo, useState, useMemo } from "react";
import FormSection from "../FormSection";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { photoSorter } from "@/app/utils/photoSorter"; // 🎯 MESMA CLASSE DO FRONTEND QUE FUNCIONA!

const ImagesSection = memo(({
  formData,
  addSingleImage,
  showImageModal,
  updateImage,
  removeImage,
  removeAllImages,
  setImageAsHighlight,
  changeImagePosition,
  validation
}) => {
  const [downloadingPhotos, setDownloadingPhotos] = useState(false);
  const [autoReagroupEnabled, setAutoReagroupEnabled] = useState(true);

  // 🎯 USAR EXATAMENTE A MESMA LÓGICA DO FRONTEND QUE FUNCIONA PERFEITAMENTE
  const sortedPhotos = useMemo(() => {
    if (!Array.isArray(formData?.Foto) || formData.Foto.length === 0) {
      return [];
    }

    try {
      console.log('📝 ADMIN: Iniciando ordenação com photoSorter...');
      
      // 🎯 FORÇAR photoSorter a usar SEMPRE Análise Inteligente (ignorar campo ORDEM)
      const fotosTemp = formData.Foto.map(foto => {
        // Remover campos ORDEM para forçar análise inteligente
        const { Ordem, ordem, ORDEM, ...fotoSemOrdem } = foto;
        return fotoSemOrdem;
      });
      
      // EXATAMENTE IGUAL AO FRONTEND - usar photoSorter.ordenarFotos() 
      // Mas sem campo ORDEM para garantir que use Análise Inteligente
      const fotosOrdenadas = photoSorter.ordenarFotos(fotosTemp, formData.Codigo || 'temp');
      
      console.log('📝 ADMIN: photoSorter.ordenarFotos() executado com sucesso!');
      
      // EXATAMENTE IGUAL AO FRONTEND - mapear códigos únicos  
      const resultado = fotosOrdenadas.map((foto, index) => ({
        ...foto,
        Codigo: `${formData.Codigo || 'temp'}-foto-${index}`,
      }));

      console.log('✅ ADMIN: Ordenação finalizada usando photoSorter:', {
        totalFotos: resultado.length,
        primeira: resultado[0]?.Foto?.split('/').pop()?.substring(0, 30) + '...',
        metodo: 'photoSorter.ordenarFotos() - IGUAL AO FRONTEND'
      });

      return resultado;

    } catch (error) {
      console.error('❌ ADMIN: Erro ao usar photoSorter:', error);
      
      // Fallback seguro - IGUAL AO FRONTEND
      return [...formData.Foto].map((foto, index) => ({
        ...foto,
        Codigo: `${formData.Codigo || 'temp'}-foto-${index}`,
      }));
    }
  }, [formData?.Foto, formData?.Codigo, autoReagroupEnabled]);

  const baixarTodasImagens = async (imagens = []) => {
    if (!Array.isArray(imagens)) return;

    setDownloadingPhotos(true);
    const zip = new JSZip();
    const pasta = zip.folder("imagens");

    for (const [i, img] of imagens.entries()) {
      try {
        const cleanUrl = (() => {
          try {
            const parsed = new URL(img.Foto);
            if (parsed.pathname.startsWith("/_next/image")) {
              const inner = parsed.searchParams.get("url");
              return decodeURIComponent(inner || img.Foto);
            }
            return img.Foto;
          } catch {
            return img.Foto;
          }
        })();

        const response = await fetch(cleanUrl);
        if (!response.ok) continue;

        const blob = await response.blob();
        const nome = `imagem-${i + 1}.jpg`;
        pasta?.file(nome, blob);
      } catch (err) {
        console.error(`Erro ao baixar imagem ${i + 1}:`, err);
      }
    }

    try {
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "imagens.zip");
    } catch (zipError) {
      console.error("Erro ao gerar zip:", zipError);
    }

    setDownloadingPhotos(false);
  };

  const handleAddImageUrl = () => {
    const imageUrl = prompt("Digite a URL da imagem:");
    if (imageUrl?.trim()) {
      addSingleImage(imageUrl.trim());
    }
  };

  const handleImageUpload = (codigo) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e) => {
      const file = e.target.files?.[0];
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
    if (!isNaN(position) && position > 0 && position <= sortedPhotos.length) {
      // Desabilitar reagrupamento automático quando usuário reordena manualmente
      setAutoReagroupEnabled(false);
      changeImagePosition(codigo, position);
    }
  };

  const handleReagroupPhotos = () => {
    console.log('🔄 ADMIN: Limpando cache do photoSorter e reordenando...');
    setAutoReagroupEnabled(true);
    photoSorter.limparCache(); // Limpar cache igual ao frontend
  };

  return (
    <FormSection title="Imagens do Imóvel" className="mb-8">
      <div className="space-y-4">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <div className="text-sm">
            <span className="font-medium text-gray-700">
              {validation.photoCount}/{validation.requiredPhotoCount} fotos
            </span>
            {validation.photoCount < validation.requiredPhotoCount && (
              <span className="text-red-500 ml-2">
                (Mínimo {validation.requiredPhotoCount})
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              + Adicionar URL
            </button>
            <button
              type="button"
              onClick={showImageModal}
              className="px-3 py-1.5 text-sm bg-black hover:bg-gray-800 text-white rounded-md transition-colors"
            >
              📤 Upload em Lote
            </button>

            {sortedPhotos.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleReagroupPhotos}
                  className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                  title="Reordenar usando photoSorter - MESMA lógica do frontend que funciona"
                >
                  🔄 Ordem Híbrida
                </button>
                <button
                  type="button"
                  onClick={() => baixarTodasImagens(sortedPhotos)}
                  disabled={downloadingPhotos}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    downloadingPhotos
                      ? 'bg-blue-300 text-white cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {downloadingPhotos ? 'Baixando...' : '⬇️ Baixar Todas'}
                </button>
                <button
                  type="button"
                  onClick={removeAllImages}
                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  🗑️ Limpar Tudo
                </button>
              </>
            )}
          </div>
        </div>

        {/* INDICADOR VISUAL - MOSTRA QUE ESTÁ USANDO photoSorter */}
        <div className={`p-3 rounded-md text-sm border-l-4 ${
          autoReagroupEnabled 
            ? 'bg-green-50 border-green-400 text-green-700'
            : 'bg-yellow-50 border-yellow-400 text-yellow-700'
        }`}>
          <p>
            <strong>
              🎯 ADMIN USANDO photoSorter - {autoReagroupEnabled 
                ? '✅ Ordenação inteligente ATIVA (igual frontend)' 
                : '✋ Modo manual ATIVO'
              }
            </strong>
          </p>
          <p className="text-xs mt-1">
            {autoReagroupEnabled 
              ? '📸 DESTAQUE sempre em 1º + análise inteligente com photoSorter.ordenarFotos() - MESMA classe do frontend que funciona perfeitamente!'
              : '📸 DESTAQUE sempre em 1º + ordem manual. Você está controlando a sequência.'
            }
          </p>
        </div>

        {sortedPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPhotos.map((photo, index) => (
              <div key={`${photo.Codigo}-${index}`} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                <div className="relative aspect-video w-full">
                  <Image
                    src={photo.Foto}
                    alt={`Imóvel ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {photo.Destaque === "Sim" && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                      DESTAQUE
                    </span>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Ordem</label>
                      <select
                        value={index + 1}
                        onChange={(e) => handlePositionChange(photo.Codigo, e.target.value)}
                        className="w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        title="Alterar posição da foto na galeria"
                      >
                        {[...Array(sortedPhotos.length)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}°
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Ação</label>
                      <button
                        onClick={() => setImageAsHighlight(photo.Codigo)}
                        className={`w-full p-1.5 text-sm rounded-md transition-colors ${
                          photo.Destaque === "Sim"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-100 hover:bg-gray-200"
                        }`}
                      >
                        {photo.Destaque === "Sim" ? "★ Destaque" : "☆ Tornar Destaque"}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 truncate" title={photo.Foto?.split('/').pop()?.replace(/\.(jpg|jpeg|png|gif)$/i, '')}>
                    Código: {photo.Foto?.split('/').pop()?.replace(/\.(jpg|jpeg|png|gif)$/i, '') || 'N/A'}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleImageUpload(photo.Codigo)}
                      className="flex-1 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                    >
                      🔄 Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(photo.Codigo)}
                      className="flex-1 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors"
                    >
                      ✖ Remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Nenhuma imagem cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">
              Utilize os botões acima para adicionar imagens
            </p>
          </div>
        )}

        {validation.photoCount < validation.requiredPhotoCount && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
            <p className="text-yellow-700 text-sm">
              ⚠️ Adicione pelo menos {validation.requiredPhotoCount} fotos para publicar
            </p>
          </div>
        )}
      </div>
    </FormSection>
  );
});

ImagesSection.displayName = "ImagesSection";
export default ImagesSection;
