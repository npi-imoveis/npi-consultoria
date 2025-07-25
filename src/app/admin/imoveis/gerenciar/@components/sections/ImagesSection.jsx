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
  const [isReordering, setIsReordering] = useState(false); // 🔥 NOVO estado para controlar reordenação
  
  // 🔥 DETECÇÃO CRÍTICA CORRIGIDA: Verificar se há ordem manual REAL
  const hasManualOrder = useMemo(() => {
    if (!formData?.Foto || formData.Foto.length === 0) return false;
    
    // 🚀 CORREÇÃO: Verificar múltiplos indicadores de ordem manual
    const todasTemOrdem = formData.Foto.every(foto => {
      const temOrdemMaiuscula = typeof foto.Ordem === 'number' && foto.Ordem >= 0;
      const temOrdemMinuscula = typeof foto.ordem === 'number' && foto.ordem >= 0;
      const temTipoBanco = foto.tipoOrdenacao === 'banco';
      const temTipoManual = foto.tipoOrdenacao === 'manual';
      
      return temOrdemMaiuscula || temOrdemMinuscula || temTipoBanco || temTipoManual;
    });
    
    if (!todasTemOrdem) return false;
    
    // 🔥 NOVA LÓGICA: Se tem tipo banco/manual, é válido automaticamente
    const temTipoValido = formData.Foto.some(foto => 
      foto.tipoOrdenacao === 'banco' || 
      foto.tipoOrdenacao === 'manual'
    );
    
    if (temTipoValido) {
      console.log('📸 Ordem manual detectada por tipo (banco/manual)');
      return true;
    }
    
    // Verificação tradicional para compatibilidade
    const ordens = formData.Foto.map(foto => {
      const ordem = foto.Ordem !== undefined ? foto.Ordem : foto.ordem;
      return typeof ordem === 'number' ? ordem : 0;
    }).sort((a, b) => a - b);

    const hasValidOrders = ordens.length > 0 && ordens.every(ordem => ordem >= 0);
    const todasIguais = ordens.every(ordem => ordem === ordens[0]);
    
    const resultado = hasValidOrders && !todasIguais;
    
    console.log('🔍 VERIFICAÇÃO DE ORDEM MANUAL COMPLETA:', {
      totalFotos: formData.Foto.length,
      todasTemOrdem,
      temTipoValido,
      ordensValidas: hasValidOrders,
      todasIguais,
      ordens: ordens.slice(0, 5),
      tipos: formData.Foto.slice(0, 3).map(f => f.tipoOrdenacao),
      hasManualOrder: resultado || temTipoValido
    });
    
    return resultado || temTipoValido;
  }, [formData?.Foto]);

  // 🎯 ORDENAÇÃO COM PROTEÇÃO CONTRA PHOTOSORTER (CORRIGIDA)
  const sortedPhotos = useMemo(() => {
    if (!Array.isArray(formData?.Foto) || formData.Foto.length === 0) {
      return [];
    }

    console.group('📋 ORDENAÇÃO - Decisão do Sistema');
    console.log('Estado:', {
      totalFotos: formData.Foto.length,
      temOrdemLocal: !!localPhotoOrder,
      temOrdemManual: hasManualOrder,
      isReordering, // 🔥 Log estado de reordenação
      primeiras3Ordens: formData.Foto.slice(0, 3).map(f => f.ordem || f.Ordem)
    });

    // 1️⃣ PRIORIDADE MÁXIMA: Ordem local (usuário acabou de alterar)
    if (localPhotoOrder && !isReordering) {
      console.log('✅ Usando ORDEM LOCAL (alteração em tempo real)');
      console.groupEnd();
      return localPhotoOrder;
    }

    // 2️⃣ PRIORIDADE ALTA: Ordem manual salva
    if (hasManualOrder) {
      console.log('✅ Usando ORDEM MANUAL SALVA (protegida do PhotoSorter)');
      
      // 🔥 CORREÇÃO: Ordenar por campo Ordem ou ordem (dar prioridade ao Ordem maiúsculo)
      const fotosOrdenadas = [...formData.Foto].sort((a, b) => {
        const ordemA = a.Ordem !== undefined ? a.Ordem : (a.ordem !== undefined ? a.ordem : 999);
        const ordemB = b.Ordem !== undefined ? b.Ordem : (b.ordem !== undefined ? b.ordem : 999);
        return ordemA - ordemB;
      });
      
      console.groupEnd();
      return fotosOrdenadas;
    }

    // 3️⃣ ÚLTIMO RECURSO: Ordem inteligente (PhotoSorter)
    try {
      console.log('✅ Aplicando ORDEM INTELIGENTE (PhotoSorter)');
      
      // 🔥 IMPORTANTE: Limpar cache do PhotoSorter antes
      photoSorter.limparCache();
      
      const fotosComCodigos = formData.Foto.map((foto, index) => ({
        ...foto,
        codigoOriginal: foto.Codigo || foto.codigo || `temp-${index}`
      }));
      
      // 🔥 CRÍTICO: Remover TODOS os campos de ordem para forçar PhotoSorter
      const fotosLimpas = fotosComCodigos.map(foto => {
        const { Ordem, ordem, ORDEM, codigoOriginal, ...fotoLimpa } = foto;
        return { ...fotoLimpa, codigoOriginal };
      });
      
      const fotosOrdenadas = photoSorter.ordenarFotos(fotosLimpas, formData.Codigo || 'temp');
      
      // 🚀 CORREÇÃO: Restaurar códigos e adicionar campo Ordem (maiúsculo) consistente
      const resultado = fotosOrdenadas.map((foto, index) => ({
        ...foto,
        Codigo: foto.codigoOriginal,
        Ordem: index, // ← CAMPO PADRONIZADO (maiúsculo)
        ordem: undefined, // ← Remover campo conflitante
        codigoOriginal: undefined
      }));

      console.log('📊 PhotoSorter aplicado:', resultado.length, 'fotos ordenadas');
      console.groupEnd();
      return resultado;

    } catch (error) {
      console.error('❌ Erro no PhotoSorter:', error);
      console.groupEnd();
      return [...formData.Foto];
    }
  }, [formData?.Foto, formData?.Codigo, localPhotoOrder, hasManualOrder, isReordering]);

  // 🔥 USEEFFECT PARA LIMPAR ESTADO LOCAL QUANDO formData MUDA EXTERNAMENTE
  useEffect(() => {
    if (formData?.Foto && localPhotoOrder && !isReordering) {
      // Verificar se as ordens do formData são diferentes do estado local
      const formDataOrdens = formData.Foto.map(f => f.Ordem).join(',');
      const localOrdens = localPhotoOrder.map(f => f.Ordem).join(',');
      
      if (formDataOrdens !== localOrdens) {
        console.log('📸 FormData mudou externamente - limpando estado local');
        setLocalPhotoOrder(null);
      }
    }
  }, [formData?.Foto, localPhotoOrder, isReordering]);

  // 🔥 REORDENAÇÃO CORRIGIDA DEFINITIVAMENTE
  const handlePositionChange = async (codigo, newPosition) => {
    const position = parseInt(newPosition);
    const currentIndex = sortedPhotos.findIndex(p => p.Codigo === codigo);
    
    if (isNaN(position) || position < 1 || position > sortedPhotos.length || (position - 1) === currentIndex) {
      return;
    }
    
    console.group('🔄 REORDENAÇÃO MANUAL INICIADA');
    console.log('Foto:', codigo);
    console.log('De:', currentIndex + 1, '→ Para:', position);
    
    // 🚀 BLOQUEAR MÚLTIPLAS REORDENAÇÕES SIMULTÂNEAS
    setIsReordering(true);
    
    try {
      // 🔥 LIMPAR CACHE DO PHOTOSORTER IMEDIATAMENTE
      photoSorter.limparCache();
      
      // 🚀 CRÍTICO: Criar nova ordem IMUTÁVEL baseada no sortedPhotos atual
      const fotosParaReordenar = localPhotoOrder || [...sortedPhotos];
      const novaOrdem = [...fotosParaReordenar];
      const fotoMovida = novaOrdem[currentIndex];
      
      // Reordenar array de forma imutável
      novaOrdem.splice(currentIndex, 1);
      novaOrdem.splice(position - 1, 0, fotoMovida);
      
      // 🔥 CRÍTICO: Aplicar campo Ordem (maiúsculo) em TODAS as fotos
      const novaOrdemComIndices = novaOrdem.map((foto, index) => ({
        ...foto,
        Ordem: index, // ← CAMPO PADRONIZADO (maiúsculo)
        ordem: undefined, // ← Remover campo conflitante
        tipoOrdenacao: 'manual' // ← Marcar como manual
      }));
      
      console.log('📊 Nova ordem aplicada:', novaOrdemComIndices.map((f, i) => `${i}: ${f.Ordem}`));
      
      // 🔥 ATUALIZAR ESTADO LOCAL PRIMEIRO
      setLocalPhotoOrder(novaOrdemComIndices);
      
      // 🔥 PROPAGAR PARA COMPONENTE PAI COM DELAY PARA EVITAR CONFLITOS
      setTimeout(() => {
        if (typeof onUpdatePhotos === 'function') {
          console.log('📤 Propagando para componente pai...');
          console.log('📊 Dados enviados:', {
            total: novaOrdemComIndices.length,
            ordensSequencia: novaOrdemComIndices.map(f => f.Ordem).join(','),
            primeiras3: novaOrdemComIndices.slice(0, 3).map(f => ({ codigo: f.Codigo, Ordem: f.Ordem }))
          });
          
          onUpdatePhotos(novaOrdemComIndices);
        }
      }, 100);
      
      console.log('✅ Reordenação manual concluída');
      
    } catch (error) {
      console.error('❌ Erro na reordenação:', error);
    } finally {
      // 🚀 DESBLOQUEAR APÓS UM PEQUENO DELAY
      setTimeout(() => {
        setIsReordering(false);
      }, 500);
    }
    
    console.groupEnd();
  };

  // 🔥 FUNÇÃO PARA RESETAR ESTADO LOCAL (chamada externamente se necessário)
  const resetLocalOrder = useCallback(() => {
    console.log('🧹 Resetando ordem local');
    setLocalPhotoOrder(null);
    setIsReordering(false);
  }, []);

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

  const handleRemoveImage = (codigo) => {
    removeImage(codigo);
    setLocalPhotoOrder(null);
  };

  const handleResetOrder = () => {
    console.group('🔄 RESET PARA ORDEM INTELIGENTE');
    console.log('Limpando cache do PhotoSorter...');
    
    // Limpar todos os estados
    photoSorter.limparCache();
    setLocalPhotoOrder(null);
    setIsReordering(false);
    
    if (typeof onUpdatePhotos === 'function' && formData?.Foto) {
      // 🔥 CRÍTICO: Remover TODOS os campos de ordem para forçar PhotoSorter
      const fotosSemOrdem = formData.Foto.map(foto => {
        const { ordem, Ordem, ORDEM, tipoOrdenacao, ...fotoLimpa } = foto;
        return fotoLimpa;
      });
      
      console.log('📤 Enviando fotos sem ordem para forçar recálculo...');
      onUpdatePhotos(fotosSemOrdem);
    }
    
    console.log('✅ Reset concluído');
    console.groupEnd();
  };

  // 🎨 STATUS VISUAL MELHORADO
  const getStatusInfo = () => {
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
                  disabled={isReordering}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isReordering
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
                  disabled={downloadingPhotos || isReordering}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    downloadingPhotos || isReordering
                      ? 'bg-blue-300 text-white cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {downloadingPhotos ? 'Baixando...' : '⬇️ Baixar Todas'}
                </button>
                
                <button
                  type="button"
                  onClick={removeAllImages}
                  disabled={isReordering}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isReordering
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

        {/* 🔥 INDICADOR DE STATUS MELHORADO */}
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
                  {/* DEBUG: Mostrar ordem */}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                    Ordem: {photo.Ordem !== undefined ? photo.Ordem : photo.ordem}
                  </div>
                </div>

                <div className="p-3 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-xs text-gray-500 mb-1">Posição</label>
                      <select
                        value={index + 1}
                        onChange={(e) => handlePositionChange(photo.Codigo, e.target.value)}
                        disabled={isReordering} // 🔥 DESABILITAR DURANTE REORDENAÇÃO
                        className={`w-full p-1.5 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          isReordering ? 'bg-gray-100 cursor-not-allowed' : ''
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
                        onClick={() => setImageAsHighlight(photo.Codigo)}
                        disabled={isReordering}
                        className={`w-full p-1.5 text-sm rounded-md transition-colors ${
                          isReordering
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
                      disabled={isReordering}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                        isReordering
                          ? 'bg-blue-100 text-blue-400 cursor-not-allowed'
                          : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      }`}
                    >
                      🔄 Trocar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(photo.Codigo)}
                      disabled={isReordering}
                      className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${
                        isReordering
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
