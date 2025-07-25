"use client";

import { memo, useState, useMemo, useEffect, useCallback } from "react";
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
  const [isReordering, setIsReordering] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  // 🔥 APENAS para imóveis vendidos: manter estado seguro das fotos
  const [safePhotosState, setSafePhotosState] = useState(null);
  
  const isImovelVendido = formData?.Status === "VENDIDO";
  
  // 🔥 DETECÇÃO CRÍTICA CORRIGIDA: Verificar se há ordem manual REAL
  const hasManualOrder = useMemo(() => {
    if (!formData?.Foto || formData.Foto.length === 0) return false;
    
    const todasTemOrdem = formData.Foto.every(foto => {
      const temOrdemMaiuscula = typeof foto.Ordem === 'number' && foto.Ordem >= 0;
      const temOrdemMinuscula = typeof foto.ordem === 'number' && foto.ordem >= 0;
      const temTipoBanco = foto.tipoOrdenacao === 'banco';
      const temTipoManual = foto.tipoOrdenacao === 'manual';
      
      return temOrdemMaiuscula || temOrdemMinuscula || temTipoBanco || temTipoManual;
    });
    
    if (!todasTemOrdem) return false;
    
    const temTipoValido = formData.Foto.some(foto => 
      foto.tipoOrdenacao === 'banco' || 
      foto.tipoOrdenacao === 'manual'
    );
    
    if (temTipoValido) {
      return true;
    }
    
    const ordens = formData.Foto.map(foto => {
      const ordem = foto.Ordem !== undefined ? foto.Ordem : foto.ordem;
      return typeof ordem === 'number' ? ordem : 0;
    }).sort((a, b) => a - b);

    const hasValidOrders = ordens.length > 0 && ordens.every(ordem => ordem >= 0);
    const todasIguais = ordens.every(ordem => ordem === ordens[0]);
    
    const resultado = hasValidOrders && !todasIguais;
    
    return resultado || temTipoValido;
  }, [formData?.Foto]);

  // 🎯 ORDENAÇÃO COM PROTEÇÃO SIMPLES PARA VENDIDOS
  const sortedPhotos = useMemo(() => {
    if (!Array.isArray(formData?.Foto) || formData.Foto.length === 0) {
      return [];
    }

    // 🔥 PROTEÇÃO SIMPLES: Se imóvel vendido e todas fotos estão destacadas, corrigir
    if (isImovelVendido && formData.Foto.length > 1) {
      const fotosComDestaque = formData.Foto.filter(f => f.Destaque === "Sim");
      
      if (fotosComDestaque.length === formData.Foto.length) {
        console.log('🔧 Corrigindo: todas fotos destacadas em imóvel vendido');
        
        // Usar estado seguro se disponível
        if (safePhotosState && safePhotosState.length === formData.Foto.length) {
          return safePhotosState;
        }
        
        // Senão, corrigir mantendo apenas a primeira como destaque
        const fotosCorrigidas = formData.Foto.map((foto, index) => ({
          ...foto,
          Destaque: index === 0 ? "Sim" : "Nao"
        }));
        
        setSafePhotosState(fotosCorrigidas);
        return fotosCorrigidas;
      }
    }

    // 1️⃣ PRIORIDADE: Ordem local
    if (localPhotoOrder && !isReordering && !isRemoving) {
      if (isImovelVendido) {
        setSafePhotosState([...localPhotoOrder]);
      }
      return localPhotoOrder;
    }

    // 2️⃣ PRIORIDADE: Ordem manual salva
    if (hasManualOrder) {
      const fotosOrdenadas = [...formData.Foto].sort((a, b) => {
        const ordemA = a.Ordem !== undefined ? a.Ordem : (a.ordem !== undefined ? a.ordem : 999);
        const ordemB = b.Ordem !== undefined ? b.Ordem : (b.ordem !== undefined ? b.ordem : 999);
        return ordemA - ordemB;
      });
      
      if (isImovelVendido) {
        setSafePhotosState([...fotosOrdenadas]);
      }
      
      return fotosOrdenadas;
    }

    // 3️⃣ PhotoSorter
    try {
      photoSorter.limparCache();
      
      const fotosComCodigos = formData.Foto.map((foto, index) => ({
        ...foto,
        codigoOriginal: foto.Codigo || foto.codigo || `temp-${index}`
      }));
      
      const fotosLimpas = fotosComCodigos.map(foto => {
        const { Ordem, ordem, ORDEM, codigoOriginal, ...fotoLimpa } = foto;
        return { ...fotoLimpa, codigoOriginal };
      });
      
      const fotosOrdenadas = photoSorter.ordenarFotos(fotosLimpas, formData.Codigo || 'temp');
      
      const resultado = fotosOrdenadas.map((foto, index) => ({
        ...foto,
        Codigo: foto.codigoOriginal,
        Ordem: index,
        ordem: undefined,
        codigoOriginal: undefined
      }));

      if (isImovelVendido) {
        setSafePhotosState([...resultado]);
      }

      return resultado;

    } catch (error) {
      console.error('❌ Erro no PhotoSorter:', error);
      return [...formData.Foto];
    }
  }, [formData?.Foto, formData?.Codigo, localPhotoOrder, hasManualOrder, isReordering, isRemoving, isImovelVendido, safePhotosState]);

  useEffect(() => {
    if (formData?.Foto && localPhotoOrder && !isReordering && !isRemoving) {
      const formDataOrdens = formData.Foto.map(f => f.Ordem).join(',');
      const localOrdens = localPhotoOrder.map(f => f.Ordem).join(',');
      
      if (formDataOrdens !== localOrdens) {
        setLocalPhotoOrder(null);
      }
    }
  }, [formData?.Foto, localPhotoOrder, isReordering, isRemoving]);

  // 🔥 REORDENAÇÃO SIMPLES
  const handlePositionChange = async (codigo, newPosition) => {
    const position = parseInt(newPosition);
    const currentIndex = sortedPhotos.findIndex(p => p.Codigo === codigo);
    
    if (isNaN(position) || position < 1 || position > sortedPhotos.length || (position - 1) === currentIndex) {
      return;
    }
    
    setIsReordering(true);
    
    try {
      photoSorter.limparCache();
      
      const fotosParaReordenar = localPhotoOrder || [...sortedPhotos];
      const novaOrdem = [...fotosParaReordenar];
      const fotoMovida = novaOrdem[currentIndex];
      
      novaOrdem.splice(currentIndex, 1);
      novaOrdem.splice(position - 1, 0, fotoMovida);
      
      const novaOrdemComIndices = novaOrdem.map((foto, index) => ({
        ...foto,
        Ordem: index,
        ordem: undefined,
        tipoOrdenacao: 'manual'
      }));
      
      setLocalPhotoOrder(novaOrdemComIndices);
      
      if (isImovelVendido) {
        setSafePhotosState([...novaOrdemComIndices]);
      }
      
      setTimeout(() => {
        if (typeof onUpdatePhotos === 'function') {
          onUpdatePhotos(novaOrdemComIndices);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro na reordenação:', error);
    } finally {
      setTimeout(() => {
        setIsReordering(false);
      }, 500);
    }
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
        setLocalPhotoOrder(null);
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
          setLocalPhotoOrder(null);
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  // 🔥 REMOÇÃO SIMPLES COM PROTEÇÃO BÁSICA
  const handleRemoveImage = async (codigo) => {
    // Para imóveis vendidos, não permitir remover se for a última foto
    if (isImovelVendido && sortedPhotos.length <= 1) {
      alert('Não é possível remover a última foto de um imóvel vendido.');
      return;
    }
    
    setIsRemoving(true);
    
    try {
      const fotosAtuais = localPhotoOrder || [...sortedPhotos];
      
      const fotosAposRemocao = fotosAtuais
        .filter(foto => foto.Codigo !== codigo)
        .map((foto, index) => ({
          ...foto,
          Ordem: index,
          tipoOrdenacao: 'manual'
        }));
      
      // Para imóveis vendidos, garantir que sempre tenha uma foto destaque
      if (isImovelVendido && fotosAposRemocao.length > 0) {
        const fotosComDestaque = fotosAposRemocao.filter(f => f.Destaque === "Sim");
        
        if (fotosComDestaque.length === 0) {
          fotosAposRemocao[0].Destaque = "Sim";
        }
        
        setSafePhotosState([...fotosAposRemocao]);
      }
      
      setLocalPhotoOrder(fotosAposRemocao);
      removeImage(codigo);
      
      setTimeout(() => {
        if (typeof onUpdatePhotos === 'function') {
          onUpdatePhotos(fotosAposRemocao);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro na remoção:', error);
      removeImage(codigo);
      setLocalPhotoOrder(null);
    } finally {
      setTimeout(() => {
        setIsRemoving(false);
      }, 300);
    }
  };

  // 🔥 DESTACAR FOTO SIMPLES
  const handleSetImageAsHighlight = async (codigo) => {
    try {
      const fotosAtuais = safePhotosState || localPhotoOrder || [...sortedPhotos];
      
      // Aplicar destaque apenas na foto selecionada
      const fotosComNovoDestaque = fotosAtuais.map(foto => ({
        ...foto,
        Destaque: foto.Codigo === codigo ? "Sim" : "Nao"
      }));
      
      setLocalPhotoOrder(fotosComNovoDestaque);
      
      if (isImovelVendido) {
        setSafePhotosState([...fotosComNovoDestaque]);
      }
      
      setImageAsHighlight(codigo);
      
      setTimeout(() => {
        if (typeof onUpdatePhotos === 'function') {
          onUpdatePhotos(fotosComNovoDestaque);
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Erro ao definir destaque:', error);
      setImageAsHighlight(codigo);
    }
  };

  const handleResetOrder = () => {
    photoSorter.limparCache();
    setLocalPhotoOrder(null);
    setIsReordering(false);
    setIsRemoving(false);
    
    if (isImovelVendido) {
      setSafePhotosState(null);
    }
    
    if (typeof onUpdatePhotos === 'function' && formData?.Foto) {
      const fotosSemOrdem = formData.Foto.map(foto => {
        const { ordem, Ordem, ORDEM, tipoOrdenacao, ...fotoLimpa } = foto;
        return fotoLimpa;
      });
      
      onUpdatePhotos(fotosSemOrdem);
    }
  };

  // Status visual simples
  const getStatusInfo = () => {
    if (isRemoving) {
      return {
        status: 'removing',
        title: '🗑️ REMOVENDO FOTO...',
        description: 'Processando remoção e reorganizando fotos.',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-400',
        textColor: 'text-orange-700'
      };
    }
    
    if (isReordering) {
      return {
        status: 'reordering',
        title: '🔄 REORDENANDO...',
        description: 'Processando alteração da ordem das fotos.',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-400',
        textColor: 'text-yellow-700'
      };
    }
    
    if (localPhotoOrder) {
      return {
        status: 'local',
        title: '✋ ORDEM ALTERADA (não salva)',
        description: 'Você alterou a ordem. As mudanças serão salvas no próximo submit.',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-400',
        textColor: 'text-amber-700'
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
      description: 'Fotos organizadas automaticamente pelo sistema inteligente.',
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
              disabled={isReordering || isRemoving}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isReordering || isRemoving
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              + Adicionar URL
            </button>
            
            <button
              type="button"
              onClick={showImageModal}
              disabled={isReordering || isRemoving}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                isReordering || isRemoving
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              📤 Upload em Lote
            </button>

            {sortedPhotos.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleResetOrder}
                  disabled={isReordering || isRemoving}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isReordering || isRemoving
                      ? 'bg-purple-300 text-purple-500 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                  title="Voltar para ordem inteligente"
                >
                  🔄 Resetar Ordem
                </button>
                
                <button
                  type="button"
                  onClick={() => baixarTodasImagens(sortedPhotos)}
                  disabled={downloadingPhotos || isReordering || isRemoving}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    downloadingPhotos || isReordering || isRemoving
                      ? 'bg-blue-300 text-white cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {downloadingPhotos ? 'Baixando...' : '⬇️ Baixar Todas'}
                </button>
                
                <button
                  type="button"
                  onClick={removeAllImages}
                  disabled={isReordering || isRemoving}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isReordering || isRemoving
                      ? 'bg-red-300 text-red-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  🗑️ Limpar Tudo
                </button>
              </>
            )}
          </div>
        </div>

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
                    priority={index < 3}
                  />
                  {photo.Destaque === "Sim" && (
                    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                      DESTAQUE
                    </span>
                  )}
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {index + 1}°
                  </div>
                  {process.env.NODE_ENV === 'development' && (
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                      Ordem: {photo.Ordem !== undefined ? photo.Ordem : photo.ordem}
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Posição</label>
                      <select
                        value={index + 1}
                        onChange={(e) => handlePositionChange(photo.Codigo, e.target.value)}
                        disabled={isReordering || isRemoving}
                        className={`w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isReordering || isRemoving ? 'bg-gray-100 cursor-not-allowed' : ''
                        }`}
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
                        onClick={() => handleSetImageAsHighlight(photo.Codigo)}
                        disabled={isReordering || isRemoving}
                        className={`w-full p-1.5 text-sm rounded-md transition-colors ${
                          isReordering || isRemoving
                            ? 'bg-gray-100 cursor-not-allowed text-gray-400'
                            : photo.Destaque === "Sim"
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
                      disabled={isReordering || isRemoving}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                        isReordering || isRemoving
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      🔄 Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(photo.Codigo)}
                      disabled={isReordering || isRemoving}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                        isReordering || isRemoving
                          ? 'bg-red-100 text-red-400 cursor-not-allowed'
                          : 'bg-red-50 hover:bg-red-100 text-red-700'
                      }`}
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
