"use client";

import { memo, useState, useMemo, useEffect } from "react";
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
  validation,
  onUpdatePhotos
}) => {
  const [downloadingPhotos, setDownloadingPhotos] = useState(false);
  const [localPhotoOrder, setLocalPhotoOrder] = useState(null);
  
  // 🔥 DETECÇÃO MELHORADA DE ORDEM MANUAL
  const hasManualOrder = useMemo(() => {
    if (!formData?.Foto || formData.Foto.length === 0) return false;
    
    // Verificar se TODAS as fotos têm campo ordem definido E são sequenciais
    const todasTemOrdem = formData.Foto.every(foto => 
      typeof foto.ordem === 'number' && foto.ordem >= 0
    );
    
    if (todasTemOrdem) {
      // Verificar se a ordem está sequencial (0, 1, 2, 3...)
      const ordensOrdenadas = [...formData.Foto]
        .sort((a, b) => a.ordem - b.ordem)
        .map(f => f.ordem);
      
      const isSequential = ordensOrdenadas.every((ordem, index) => ordem === index);
      
      console.log('🔍 ORDEM MANUAL CHECK:', {
        todasTemOrdem,
        isSequential,
        ordensOrdenadas,
        hasManualOrder: todasTemOrdem && isSequential
      });
      
      return isSequential;
    }
    
    return false;
  }, [formData?.Foto]);

  // 🎯 ORDENAÇÃO COM PRIORIDADE CLARA
  const sortedPhotos = useMemo(() => {
    if (!Array.isArray(formData?.Foto) || formData.Foto.length === 0) {
      return [];
    }

    console.log('📋 ORDENAÇÃO - Estado atual:', {
      totalFotos: formData.Foto.length,
      temOrdemLocal: !!localPhotoOrder,
      temOrdemManual: hasManualOrder,
      primeiraFoto: formData.Foto[0]
    });

    // 1️⃣ PRIORIDADE: Ordem local (usuário acabou de alterar)
    if (localPhotoOrder) {
      console.log('✅ Usando ordem LOCAL (alteração recente)');
      return localPhotoOrder;
    }

    // 2️⃣ PRIORIDADE: Ordem manual salva no banco
    if (hasManualOrder) {
      console.log('✅ Usando ordem MANUAL do banco');
      const fotosOrdenadas = [...formData.Foto].sort((a, b) => a.ordem - b.ordem);
      return fotosOrdenadas;
    }

    // 3️⃣ PRIORIDADE: Ordem inteligente (padrão)
    try {
      console.log('✅ Usando ordem INTELIGENTE (PhotoSorter)');
      
      const fotosComCodigos = formData.Foto.map((foto, index) => ({
        ...foto,
        codigoOriginal: foto.Codigo || foto.codigo || `temp-${index}`
      }));
      
      // Remover campos de ordem para forçar análise inteligente
      const fotosLimpas = fotosComCodigos.map(foto => {
        const { Ordem, ordem, ORDEM, codigoOriginal, ...fotoLimpa } = foto;
        return { ...fotoLimpa, codigoOriginal };
      });
      
      const fotosOrdenadas = photoSorter.ordenarFotos(fotosLimpas, formData.Codigo || 'temp');
      
      // Adicionar ordem sequencial
      const resultado = fotosOrdenadas.map((foto, index) => ({
        ...foto,
        Codigo: foto.codigoOriginal,
        ordem: index,
        codigoOriginal: undefined
      }));

      return resultado;

    } catch (error) {
      console.error('❌ Erro na ordenação inteligente:', error);
      return [...formData.Foto];
    }
  }, [formData?.Foto, formData?.Codigo, localPhotoOrder, hasManualOrder]);

  // 🔥 FUNÇÃO DE REORDENAÇÃO OTIMIZADA
  const handlePositionChange = async (codigo, newPosition) => {
    const position = parseInt(newPosition);
    const currentIndex = sortedPhotos.findIndex(p => p.Codigo === codigo);
    
    if (isNaN(position) || position < 1 || position > sortedPhotos.length || (position - 1) === currentIndex) {
      return;
    }
    
    console.log('🔄 REORDENAÇÃO iniciada:', {
      codigo,
      posicaoAtual: currentIndex + 1,
      novaPosicao: position,
      totalFotos: sortedPhotos.length
    });
    
    // Criar nova ordem
    const novaOrdem = [...sortedPhotos];
    const fotoMovida = novaOrdem[currentIndex];
    
    // Remover da posição atual e inserir na nova
    novaOrdem.splice(currentIndex, 1);
    novaOrdem.splice(position - 1, 0, fotoMovida);
    
    // Aplicar índices sequenciais
    const novaOrdemComIndices = novaOrdem.map((foto, index) => ({
      ...foto,
      ordem: index // SEMPRE índice 0-based
    }));
    
    // Atualizar estado local imediatamente
    setLocalPhotoOrder(novaOrdemComIndices);
    
    // Propagar para componente pai
    if (typeof onUpdatePhotos === 'function') {
      console.log('📤 Atualizando fotos no componente pai');
      onUpdatePhotos(novaOrdemComIndices);
    }
    
    console.log('✅ Reordenação concluída');
  };

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
      try {
        new URL(imageUrl.trim());
        addSingleImage(imageUrl.trim());
        setLocalPhotoOrder(null); // Reset ordem local
      } catch {
        alert('URL inválida.');
      }
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
          setLocalPhotoOrder(null); // Reset ordem local
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  const handleRemoveImage = (codigo) => {
    removeImage(codigo);
    setLocalPhotoOrder(null); // Reset ordem local
  };

  const handleResetOrder = () => {
    console.log('🔄 Resetando para ordem inteligente...');
    photoSorter.limparCache();
    setLocalPhotoOrder(null);
    
    if (typeof onUpdatePhotos === 'function' && formData?.Foto) {
      // Remover todos os campos de ordem para forçar recálculo
      const fotosSemOrdem = formData.Foto.map(foto => {
        const { ordem, Ordem, ORDEM, ...fotoLimpa } = foto;
        return fotoLimpa;
      });
      onUpdatePhotos(fotosSemOrdem);
    }
  };

  // 🔥 INDICADOR DE STATUS MELHORADO
  const getStatusInfo = () => {
    if (localPhotoOrder) {
      return {
        status: 'local',
        title: '✋ ORDEM PERSONALIZADA (não salva)',
        description: 'Você alterou a ordem. Clique em SALVAR para persistir as mudanças.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-400',
        textColor: 'text-orange-700'
      };
    }
    
    if (hasManualOrder) {
      return {
        status: 'manual',
        title: '💾 ORDEM MANUAL SALVA',
        description: 'Ordem definida manualmente e salva no banco. Use "Resetar Ordem" para voltar à ordem inteligente.',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-400',
        textColor: 'text-blue-700'
      };
    }
    
    return {
      status: 'intelligent',
      title: '🤖 ORDEM INTELIGENTE (PhotoSorter)',
      description: 'Fotos organizadas automaticamente. Use os selects para personalizar a ordem.',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      textColor: 'text-green-700'
    };
  };

  const statusInfo = getStatusInfo();

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
                  onClick={handleResetOrder}
                  className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                  title="Voltar para ordem inteligente"
                >
                  🔄 Resetar Ordem
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

        {/* INDICADOR DE STATUS MELHORADO */}
        <div className={`p-3 rounded-md text-sm border-l-4 ${statusInfo.bgColor} ${statusInfo.borderColor} ${statusInfo.textColor}`}>
          <p><strong>{statusInfo.title}</strong></p>
          <p className="text-xs mt-1">{statusInfo.description}</p>
        </div>

        {sortedPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPhotos.map((photo, index) => (
              <div key={photo.Codigo} className="border rounded-lg overflow-hidden bg-white shadow-sm">
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
                  {/* DEBUG INFO */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                    ordem: {photo.ordem}
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Posição</label>
                      <select
                        value={index + 1}
                        onChange={(e) => handlePositionChange(photo.Codigo, e.target.value)}
                        className="w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      >
                        {photo.Destaque === "Sim" ? "★ Destaque" : "☆ Destacar"}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 truncate">
                    ID: {photo.Codigo}
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
                      onClick={() => handleRemoveImage(photo.Codigo)}
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
