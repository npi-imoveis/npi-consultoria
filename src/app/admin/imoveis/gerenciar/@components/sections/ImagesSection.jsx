// ImagesSection.jsx - ADMIN COM ORDENAÇÃO INTELIGENTE APRIMORADA
"use client";

import { memo, useState, useMemo } from "react";
import FormSection from "../FormSection";
import Image from "next/image";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { photoSorter } from "@/app/utils/photoSorter"; // 🚀 Nova classe

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
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // 🎯 NOVA LÓGICA: Usar ordenação inteligente
  const { sortedPhotos, debugInfo, metodoUsado } = useMemo(() => {
    if (!Array.isArray(formData?.Foto) || formData.Foto.length === 0) {
      return { sortedPhotos: [], debugInfo: null, metodoUsado: 'Nenhuma foto' };
    }

    try {
      let fotos;
      let metodo;

      if (autoReagroupEnabled) {
        // Usar ordenação inteligente
        fotos = photoSorter.ordenarFotos(formData.Foto, formData.Codigo || 'temp');
        metodo = 'Ordenação Inteligente';
      } else {
        // Modo manual - apenas garantir destaque primeiro
        const fotoDestaque = formData.Foto.find(foto => foto.Destaque === "Sim");
        const outrasFotos = formData.Foto.filter(foto => foto !== fotoDestaque);
        fotos = [
          ...(fotoDestaque ? [fotoDestaque] : []),
          ...outrasFotos
        ];
        metodo = 'Ordem Manual';
      }

      const debug = photoSorter.gerarRelatorio(formData.Foto, formData.Codigo || 'temp');

      return { sortedPhotos: fotos, debugInfo: debug, metodoUsado: metodo };

    } catch (error) {
      console.error('❌ ADMIN: Erro ao ordenar fotos:', error);
      return { 
        sortedPhotos: [...formData.Foto], 
        debugInfo: null, 
        metodoUsado: 'Fallback (erro)' 
      };
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
    setAutoReagroupEnabled(true);
    photoSorter.limparCache(); // Limpar cache para reprocessar
  };

  // 🧠 NOVA FUNCIONALIDADE: Treinar padrões
  const handleTrainPattern = () => {
    const prefix = prompt("Digite o prefixo do novo padrão (ex: iXYZ_):");
    if (prefix?.trim()) {
      const grupo = prompt("Digite o grupo (A-Z):");
      const peso = parseInt(prompt("Digite o peso (número, ex: 70000):") || "70000");
      
      if (grupo?.trim()) {
        photoSorter.adicionarPadrao(prefix.trim(), grupo.trim().toUpperCase(), peso);
        setAutoReagroupEnabled(true); // Reprocessar com novo padrão
        alert(`✅ Padrão "${prefix}" adicionado ao grupo ${grupo}!`);
      }
    }
  };

  // 🔧 NOVA FUNCIONALIDADE: Extrair código da foto
  const extrairCodigoFoto = (url) => {
    if (!url) return '';
    const nomeArquivo = url.split('/').pop();
    return nomeArquivo.replace(/\.(jpg|jpeg|png|gif)$/i, '');
  };

  return (
    <FormSection title="Imagens do Imóvel" className="mb-8">
      <div className="space-y-4">
        {/* 🎛️ CONTROLES PRINCIPAIS */}
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
            <span className="text-xs text-gray-500 ml-3">
              Método: {metodoUsado}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAddImageUrl}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
            >
              + URL
            </button>
            
            <button
              type="button"
              onClick={showImageModal}
              className="px-3 py-1.5 text-sm bg-black hover:bg-gray-800 text-white rounded-md transition-colors"
            >
              📤 Upload Lote
            </button>

            <button
              type="button"
              onClick={() => setShowAdvancedControls(!showAdvancedControls)}
              className="px-3 py-1.5 text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-md transition-colors"
            >
              🔧 Avançado
            </button>
          </div>
        </div>

        {/* 🔧 CONTROLES AVANÇADOS */}
        {showAdvancedControls && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-center">
              <button
                type="button"
                onClick={handleReagroupPhotos}
                className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
                title="Reordenar usando algoritmo inteligente"
              >
                🎯 Ordenação Inteligente
              </button>
              
              <button
                type="button"
                onClick={handleTrainPattern}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                title="Adicionar novo padrão de código"
              >
                🧠 Treinar Padrão
              </button>

              <button
                type="button"
                onClick={() => setShowDebugInfo(!showDebugInfo)}
                className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
              >
                🔍 Debug
              </button>

              {sortedPhotos.length > 0 && (
                <>
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
        )}

        {/* 🔍 DEBUG INFO */}
        {showDebugInfo && debugInfo && (
          <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-lg">
            <div className="font-bold mb-2">🔍 ANÁLISE DE ORDENAÇÃO</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div>📸 Total: {debugInfo.total} fotos</div>
                <div>📈 Cobertura: {(debugInfo.cobertura * 100).toFixed(1)}%</div>
                <div>🎯 Método: {metodoUsado}</div>
              </div>
              <div>
                <div>📊 Grupos detectados:</div>
                {Object.entries(debugInfo.grupos).map(([grupo, count]) => (
                  <div key={grupo} className="ml-2">
                    {grupo}: {count} foto{count > 1 ? 's' : ''}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <div>🔧 Padrões: {debugInfo.padroes.slice(0, 5).join(', ')}</div>
            </div>
          </div>
        )}

        {/* 📊 STATUS DA ORDENAÇÃO */}
        <div className={`p-3 rounded-md text-sm border-l-4 ${
          autoReagroupEnabled 
            ? 'bg-green-50 border-green-400 text-green-700'
            : 'bg-yellow-50 border-yellow-400 text-yellow-700'
        }`}>
          <p>
            <strong>
              {autoReagroupEnabled 
                ? '🎯 Ordenação Inteligente ATIVA' 
                : '✋ Ordem Manual ATIVA'
              }
            </strong>
          </p>
          <p className="text-xs mt-1">
            {autoReagroupEnabled 
              ? '📸 DESTAQUE sempre em 1º + análise inteligente de códigos/MySQL ORDEM. Múltiplos algoritmos para máxima precisão.'
              : '📸 DESTAQUE sempre em 1º + ordem manual. Você controla a sequência usando os campos "Ordem".'
            }
          </p>
        </div>

        {/* 🖼️ GRID DE FOTOS */}
        {sortedPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedPhotos.map((photo, index) => {
              const codigo = extrairCodigoFoto(photo.Foto);
              const analise = photoSorter.analisarCodigoFoto(photo.Foto);
              
              return (
                <div key={`${photo.Codigo}-${index}`} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="relative aspect-video w-full">
                    <Image
                      src={photo.Foto}
                      alt={`Imóvel ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    
                    {/* 🏷️ BADGES DE STATUS */}
                    {photo.Destaque === "Sim" && (
                      <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        ⭐ DESTAQUE
                      </span>
                    )}
                    
                    {showDebugInfo && (
                      <span className="absolute top-2 right-2 bg-black bg-opacity-80 text-green-400 text-xs px-2 py-1 rounded font-mono">
                        {analise.grupo}
                      </span>
                    )}
                  </div>

                  <div className="p-3 space-y-3">
                    {/* 🎛️ CONTROLES DE POSIÇÃO */}
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
                        <label className="block text-xs text-gray-500 mb-1">Destaque</label>
                        <button
                          onClick={() => setImageAsHighlight(photo.Codigo)}
                          className={`w-full p-1.5 text-sm rounded-md transition-colors ${
                            photo.Destaque === "Sim"
                              ? "bg-yellow-500 text-white font-bold"
                              : "bg-gray-100 hover:bg-gray-200"
                          }`}
                        >
                          {photo.Destaque === "Sim" ? "★ Destaque" : "☆ Tornar Destaque"}
                        </button>
                      </div>
                    </div>

                    {/* 🔍 INFO TÉCNICA */}
                    <div className="text-xs text-gray-500">
                      <div className="truncate" title={codigo}>
                        📁 {codigo}
                      </div>
                      {showDebugInfo && (
                        <div className="mt-1 font-mono">
                          🎯 Grupo: {analise.grupo} | Peso: {analise.peso}
                        </div>
                      )}
                    </div>

                    {/* 🛠️ AÇÕES */}
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
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500">Nenhuma imagem cadastrada</p>
            <p className="text-sm text-gray-400 mt-1">
              Utilize os botões acima para adicionar imagens
            </p>
          </div>
        )}

        {/* ⚠️ AVISO DE VALIDAÇÃO */}
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
