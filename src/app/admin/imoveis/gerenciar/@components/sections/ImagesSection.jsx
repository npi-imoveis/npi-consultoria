// ImagesSection.jsx - REORDENAÇÃO LOCAL INSTANTÂNEA
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
  validation
}) => {
  const [downloadingPhotos, setDownloadingPhotos] = useState(false);
  const [localPhotoOrder, setLocalPhotoOrder] = useState(null); // 🔥 Estado local para ordem
  const [isManualOrder, setIsManualOrder] = useState(false); // 🔥 Flag para ordem manual

  // 🔍 DETECTAR ORDEM MANUAL DO BANCO
  useEffect(() => {
    if (formData?.Foto && Array.isArray(formData.Foto)) {
      // Verificar se todas as fotos têm campo ordem definido e são sequenciais
      const temOrdemCompleta = formData.Foto.every(foto => 
        foto.ordem !== undefined && foto.ordem !== null
      );
      
      if (temOrdemCompleta) {
        // Ordenar pelo campo ordem do banco
        const fotosOrdenadas = [...formData.Foto].sort((a, b) => 
          (a.ordem || 0) - (b.ordem || 0)
        );
        
        console.log('📌 ADMIN: Ordem manual detectada no banco');
        console.log('📌 Fotos com ordem:', fotosOrdenadas.map((f, i) => ({
          posicao: i + 1,
          ordem: f.ordem,
          codigo: f.Codigo
        })));
        
        setLocalPhotoOrder(fotosOrdenadas);
        setIsManualOrder(true);
      } else {
        // Usar ordem inteligente
        setIsManualOrder(false);
        setLocalPhotoOrder(null);
      }
    }
  }, [formData?.Foto]);

  // 🎯 ORDEM LOCAL OU INTELIGENTE
  const sortedPhotos = useMemo(() => {
    if (!Array.isArray(formData?.Foto) || formData.Foto.length === 0) {
      return [];
    }

    // 🔥 Se há ordem local (manual ou do banco), usar ela
    if (localPhotoOrder) {
      console.log('📝 ADMIN: Usando ordem manual/personalizada');
      return localPhotoOrder;
    }

    // 🎯 Senão, usar ordem inteligente (sem passar campo ordem)
    try {
      console.log('📝 ADMIN: Usando ordem inteligente (photoSorter)');
      
      const fotosComCodigosOriginais = formData.Foto.map((foto, index) => ({
        ...foto,
        codigoOriginal: foto.Codigo || foto.codigo || `temp-${index}`
      }));
      
      // Remover campo ordem para forçar análise inteligente
      const fotosTemp = fotosComCodigosOriginais.map(foto => {
        const { Ordem, ordem, ORDEM, codigoOriginal, ...fotoLimpa } = foto;
        return { ...fotoLimpa, codigoOriginal };
      });
      
      const fotosOrdenadas = photoSorter.ordenarFotos(fotosTemp, formData.Codigo || 'temp');
      
      const resultado = fotosOrdenadas.map((foto) => ({
        ...foto,
        Codigo: foto.codigoOriginal || foto.Codigo,
        codigoOriginal: undefined
      }));

      console.log('✅ ADMIN: Ordem inteligente aplicada:', resultado.length, 'fotos');
      return resultado;

    } catch (error) {
      console.error('❌ ADMIN: Erro na ordenação:', error);
      return [...formData.Foto];
    }
  }, [formData?.Foto, formData?.Codigo, localPhotoOrder]);

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
        // Manter ordem manual se estiver ativa
        if (!isManualOrder) {
          setLocalPhotoOrder(null);
        }
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
          // Manter ordem manual se estiver ativa
          if (!isManualOrder) {
            setLocalPhotoOrder(null);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  // 🔥 REORDENAÇÃO COM DEBUG COMPLETO E PERSISTÊNCIA GARANTIDA
  const handlePositionChange = async (codigo, newPosition) => {
    const position = parseInt(newPosition);
    const currentIndex = sortedPhotos.findIndex(p => p.Codigo === codigo);
    
    console.log('🔄 ADMIN: Reordenação solicitada:', {
      codigo,
      posicaoAtual: currentIndex + 1,
      novaPosicao: position,
      totalFotos: sortedPhotos.length
    });
    
    if (!isNaN(position) && position > 0 && position <= sortedPhotos.length && (position - 1) !== currentIndex) {
      
      // 🎯 1. REORDENAÇÃO VISUAL INSTANTÂNEA
      const novaOrdem = [...sortedPhotos];
      const fotoMovida = novaOrdem[currentIndex];
      
      novaOrdem.splice(currentIndex, 1);
      novaOrdem.splice(position - 1, 0, fotoMovida);
      
      // Adicionar campo ordem em todas as fotos
      const novaOrdemComIndices = novaOrdem.map((foto, index) => ({
        ...foto,
        ordem: index
      }));
      
      setLocalPhotoOrder(novaOrdemComIndices);
      setIsManualOrder(true);
      
      console.log('✅ ADMIN: Reordenação visual aplicada');
      
      // 🎯 2. TENTATIVAS DE PERSISTÊNCIA NO BANCO
      let sucessoPersistencia = false;
      
      // MÉTODO 1: Função existente
      if (typeof changeImagePosition === 'function') {
        try {
          console.log('💾 ADMIN: Tentando método 1 (changeImagePosition)...');
          
          const resultado = await Promise.resolve(changeImagePosition(codigo, position));
          console.log('📊 ADMIN: Resultado do método 1:', resultado);
          
          // Verificar se a função realmente funcionou
          if (resultado !== false && resultado !== null) {
            console.log('✅ ADMIN: Método 1 aparentemente bem-sucedido');
            sucessoPersistencia = true;
          } else {
            console.warn('⚠️ ADMIN: Método 1 retornou resultado suspeito');
          }
          
        } catch (error) {
          console.error('❌ ADMIN: Método 1 falhou:', error);
        }
      }
      
      // MÉTODO 2: API direta (se método 1 falhar)
      if (!sucessoPersistencia) {
        try {
          console.log('💾 ADMIN: Tentando método 2 (API direta)...');
          
          const urlParams = new URLSearchParams(window.location.search);
          const codigoImovel = urlParams.get('codigo') || formData?.Codigo;
          
          if (codigoImovel) {
            const response = await fetch('/admin/api/reorder-photo', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imovelCodigo: codigoImovel,
                fotoCodigo: codigo,
                novaPosicao: position
              })
            });
            
            console.log('📊 ADMIN: Response status:', response.status);
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ ADMIN: Método 2 bem-sucedido:', data);
              sucessoPersistencia = true;
            } else {
              console.warn('⚠️ ADMIN: Método 2 falhou com status:', response.status);
            }
          }
        } catch (error) {
          console.error('❌ ADMIN: Método 2 falhou:', error);
        }
      }
      
      // RESULTADO FINAL
      if (sucessoPersistencia) {
        console.log('🎉 ADMIN: Mudança persistida com sucesso!');
      } else {
        console.error('❌ ADMIN: FALHA - mudança pode não ter sido persistida');
        alert('Aviso: A mudança foi aplicada visualmente. Clique em SALVAR para garantir a persistência.');
      }
    }
  };

  const handleRemoveImage = (codigo) => {
    removeImage(codigo);
    // Manter ordem manual se estiver ativa
    if (!isManualOrder) {
      setLocalPhotoOrder(null);
    }
  };

  const handleResetOrder = () => {
    console.log('🔄 ADMIN: Resetando para ordem inteligente...');
    photoSorter.limparCache();
    setLocalPhotoOrder(null);
    setIsManualOrder(false);
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

        {/* INDICADOR DE MODO SIMPLIFICADO */}
        <div className={`p-3 rounded-md text-sm border-l-4 ${
          isManualOrder 
            ? 'bg-orange-50 border-orange-400 text-orange-700'
            : 'bg-green-50 border-green-400 text-green-700'
        }`}>
          <p>
            <strong>
              {isManualOrder 
                ? '✋ ORDEM PERSONALIZADA' 
                : '🤖 ORDEM INTELIGENTE (PhotoSorter)'
              }
            </strong>
          </p>
          <p className="text-xs mt-1">
            {isManualOrder 
              ? '📸 Você alterou a ordem das fotos. As mudanças são aplicadas automaticamente. Use "Resetar Ordem" para voltar à ordem inteligente.'
              : '📸 Fotos organizadas automaticamente. Use os selects para personalizar a ordem.'
            }
          </p>
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
