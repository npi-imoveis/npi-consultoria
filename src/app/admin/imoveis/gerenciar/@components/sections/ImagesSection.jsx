// ImagesSection.jsx - VERSÃO CORRIGIDA
"use client";

import { memo, useState, useMemo } from "react";
import FormSection from "../FormSection";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { photoSorter } from "@/app/utils/photoSorter";

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

  // 🎯 MAPEAMENTO PARA PRESERVAR CÓDIGOS ORIGINAIS
  const sortedPhotos = useMemo(() => {
    if (!Array.isArray(formData?.Foto) || formData.Foto.length === 0) {
      return [];
    }

    try {
      console.log('📝 ADMIN: Iniciando ordenação com photoSorter...');
      
      if (!autoReagroupEnabled) {
        // MODO MANUAL: Retornar fotos na ordem original sem processar
        console.log('📝 ADMIN: Modo manual ativo - mantendo ordem original');
        return [...formData.Foto];
      }

      // 🎯 PRESERVAR CÓDIGOS ORIGINAIS antes do photoSorter
      const fotosComCodigosOriginais = formData.Foto.map((foto, index) => ({
        ...foto,
        codigoOriginal: foto.Codigo || foto.codigo || `temp-${index}` // Backup do código original
      }));
      
      // Forçar photoSorter a usar SEMPRE Análise Inteligente (ignorar campo ORDEM)
      const fotosTemp = fotosComCodigosOriginais.map(foto => {
        const { Ordem, ordem, ORDEM, ...fotoSemOrdem } = foto;
        return fotoSemOrdem;
      });
      
      // USAR photoSorter.ordenarFotos() 
      const fotosOrdenadas = photoSorter.ordenarFotos(fotosTemp, formData.Codigo || 'temp');
      
      console.log('📝 ADMIN: photoSorter.ordenarFotos() executado com sucesso!');
      
      // 🔥 RESTAURAR CÓDIGOS ORIGINAIS após o photoSorter
      const resultado = fotosOrdenadas.map((foto) => ({
        ...foto,
        Codigo: foto.codigoOriginal, // Restaurar código original
        codigoOriginal: undefined // Limpar campo temporário
      }));

      console.log('✅ ADMIN: Ordenação finalizada com códigos preservados:', {
        totalFotos: resultado.length,
        primeira: resultado[0]?.Foto?.split('/').pop()?.substring(0, 30) + '...',
        codigoPrimeira: resultado[0]?.Codigo,
        metodo: 'photoSorter.ordenarFotos() - CÓDIGOS PRESERVADOS'
      });

      return resultado;

    } catch (error) {
      console.error('❌ ADMIN: Erro ao usar photoSorter:', error);
      
      // Fallback seguro - retornar dados originais
      return [...formData.Foto];
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

  // 🔥 FIX: Melhorar função de adicionar URL
  const handleAddImageUrl = () => {
    try {
      const imageUrl = prompt("Digite a URL da imagem:");
      if (imageUrl?.trim()) {
        console.log('📝 ADMIN: Adicionando imagem via URL:', imageUrl.trim());
        
        // Verificar se a URL é válida
        try {
          new URL(imageUrl.trim());
          addSingleImage(imageUrl.trim());
          console.log('✅ ADMIN: Imagem via URL adicionada com sucesso');
        } catch (urlError) {
          alert('URL inválida. Por favor, digite uma URL válida.');
          console.error('❌ ADMIN: URL inválida:', urlError);
        }
      }
    } catch (error) {
      console.error('❌ ADMIN: Erro ao adicionar imagem via URL:', error);
      alert('Erro ao adicionar imagem. Tente novamente.');
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

  // 🔥 FIX: Melhorar função de mudança de posição
  const handlePositionChange = (codigo, newPosition) => {
    try {
      const position = parseInt(newPosition);
      if (!isNaN(position) && position > 0 && position <= sortedPhotos.length) {
        console.log('📝 ADMIN: Mudando posição manualmente:', { codigo, position });
        
        // Desabilitar reagrupamento automático quando usuário reordena manualmente
        setAutoReagroupEnabled(false);
        changeImagePosition(codigo, position);
        
        console.log('✅ ADMIN: Posição alterada com sucesso');
      }
    } catch (error) {
      console.error('❌ ADMIN: Erro ao alterar posição:', error);
      alert('Erro ao alterar posição. Tente novamente.');
    }
  };

  // 🔥 FIX: Melhorar função de remoção
  const handleRemoveImage = (codigo, index) => {
    try {
      console.log('📝 ADMIN: Removendo imagem:', { codigo, index });
      
      // Confirmar remoção
      const confirmar = window.confirm('Tem certeza que deseja remover esta imagem?');
      if (confirmar) {
        removeImage(codigo);
        console.log('✅ ADMIN: Imagem removida com sucesso');
      }
    } catch (error) {
      console.error('❌ ADMIN: Erro ao remover imagem:', error);
      alert('Erro ao remover imagem. Tente novamente.');
    }
  };

  const handleReagroupPhotos = () => {
    console.log('🔄 ADMIN: Limpando cache do photoSorter e reordenando...');
    try {
      photoSorter.limparCache(); // Limpar cache igual ao frontend
      setAutoReagroupEnabled(true);
      console.log('✅ ADMIN: Reagrupamento ativado');
    } catch (error) {
      console.error('❌ ADMIN: Erro ao reagrupar:', error);
    }
  };

  // 🔥 FIX: Função para alternar entre modo manual e automático
  const toggleReagroupMode = () => {
    setAutoReagroupEnabled(!autoReagroupEnabled);
    if (!autoReagroupEnabled) {
      // Se estava em manual e vai para automático, limpar cache
      photoSorter.limparCache();
    }
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
              title="Adicionar imagem via URL"
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
                  onClick={toggleReagroupMode}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    autoReagroupEnabled
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                  title={autoReagroupEnabled 
                    ? "Clicar para ativar modo manual" 
                    : "Clicar para ativar ordenação inteligente"
                  }
                >
                  {autoReagroupEnabled ? '🔄 Ordem Inteligente' : '✋ Ordem Manual'}
                </button>
                
                {autoReagroupEnabled && (
                  <button
                    type="button"
                    onClick={handleReagroupPhotos}
                    className="px-3 py-1.5 text-sm bg-purple-400 hover:bg-purple-500 text-white rounded-md transition-colors"
                    title="Reprocessar ordenação inteligente"
                  >
                    🔄 Reprocessar
                  </button>
                )}
                
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
                  title="Remover todas as imagens"
                >
                  🗑️ Limpar Tudo
                </button>
              </>
            )}
          </div>
        </div>

        {/* INDICADOR VISUAL MELHORADO */}
        <div className={`p-3 rounded-md text-sm border-l-4 ${
          autoReagroupEnabled 
            ? 'bg-green-50 border-green-400 text-green-700'
            : 'bg-orange-50 border-orange-400 text-orange-700'
        }`}>
          <p>
            <strong>
              🎯 ADMIN: {autoReagroupEnabled 
                ? '✅ Ordenação Inteligente ATIVA (usando photoSorter)' 
                : '✋ Modo Manual ATIVO (você controla a ordem)'
              }
            </strong>
          </p>
          <p className="text-xs mt-1">
            {autoReagroupEnabled 
              ? '📸 DESTAQUE sempre em 1º + análise inteligente automática. Códigos originais preservados!'
              : '📸 DESTAQUE sempre em 1º + você pode arrastar e alterar a ordem manualmente. Use os selects de posição.'
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
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}°
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">
                        Posição {!autoReagroupEnabled && '(Manual)'}
                      </label>
                      <select
                        value={index + 1}
                        onChange={(e) => handlePositionChange(photo.Codigo, e.target.value)}
                        disabled={autoReagroupEnabled}
                        className={`w-full p-1.5 text-sm border rounded-md transition-colors ${
                          autoReagroupEnabled 
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                            : 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        title={autoReagroupEnabled 
                          ? "Desative a ordenação inteligente para alterar manualmente" 
                          : "Alterar posição da foto na galeria"
                        }
                      >
                        {[...Array(sortedPhotos.length)].map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {i + 1}°
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Destaque</label>
                      <button
                        onClick={() => setImageAsHighlight(photo.Codigo)}
                        className={`w-full p-1.5 text-sm rounded-md transition-colors ${
                          photo.Destaque === "Sim"
                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        }`}
                        title="Definir como foto principal"
                      >
                        {photo.Destaque === "Sim" ? "★ Destaque" : "☆ Destacar"}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 truncate" title={`Código: ${photo.Codigo}`}>
                    ID: {photo.Codigo || 'N/A'}
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleImageUpload(photo.Codigo)}
                      className="flex-1 py-1.5 text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors"
                      title="Substituir esta imagem"
                    >
                      🔄 Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(photo.Codigo, index)}
                      className="flex-1 py-1.5 text-sm bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors"
                      title="Remover esta imagem"
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
