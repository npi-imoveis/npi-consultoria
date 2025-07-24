"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { photoSorter } from "@/app/utils/photoSorter";

// 🔍 FUNÇÃO HELPER FORA DO COMPONENTE (SEM HOOKS)
function checkManualOrderHelper(fotos) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return { hasManualOrder: false, todasTemOrdem: false, isSequential: false };
  }

  const todasTemOrdem = fotos.every(foto => 
    (foto.Ordem !== undefined && foto.Ordem !== null) || 
    (foto.ordem !== undefined && foto.ordem !== null)
  );

  if (!todasTemOrdem) {
    return { hasManualOrder: false, todasTemOrdem: false, isSequential: false };
  }

  const ordens = fotos.map(foto => {
    const ordem = foto.Ordem !== undefined ? foto.Ordem : foto.ordem;
    return typeof ordem === 'number' ? ordem : parseInt(ordem) || 0;
  }).sort((a, b) => a - b);

  const isSequential = ordens.every((ordem, index) => ordem === index);
  const hasManualOrder = todasTemOrdem && isSequential;

  console.log('🔍 ORDEM MANUAL CHECK:', {
    todasTemOrdem,
    isSequential,
    ordensOrdenadas: ordens.slice(0, 5),
    hasManualOrder
  });

  return { hasManualOrder, todasTemOrdem, isSequential };
}

export default function ImagesSection({
  formData,
  addSingleImage,
  showImageModal,
  updateImage,
  removeImage,
  removeAllImages,
  downloadAllPhotos,
  downloadingPhotos,
  setImageAsHighlight,
  changeImagePosition,
  validation,
  onUpdatePhotos,
}) {
  // 🔥 ESTADOS CRÍTICOS PARA ORDEM MANUAL
  const [localPhotoOrder, setLocalPhotoOrder] = useState([]);

  // 🔥 PROCESSAR FOTOS COM ORDEM INTELIGENTE OU MANUAL
  const fotosProcessadas = useMemo(() => {
    if (!formData.Foto || !Array.isArray(formData.Foto)) return [];

    // Se há ordem local (reordenação manual), usar ela
    if (localPhotoOrder.length > 0) {
      console.log('✅ Usando ordem LOCAL (alteração recente)');
      return localPhotoOrder;
    }

    // Verificar se fotos têm ordem manual salva no banco
    const temOrdemManual = checkManualOrderHelper(formData.Foto);
    
    if (temOrdemManual.hasManualOrder) {
      console.log('✅ Usando ordem MANUAL do banco');
      return [...formData.Foto].sort((a, b) => {
        const ordemA = a.Ordem !== undefined ? a.Ordem : (a.ordem !== undefined ? a.ordem : 999);
        const ordemB = b.Ordem !== undefined ? b.Ordem : (b.ordem !== undefined ? b.ordem : 999);
        return ordemA - ordemB;
      });
    }

    console.log('🤖 Aplicando ordem INTELIGENTE');
    const fotosOrdenadas = photoSorter.ordenarFotos(formData.Foto, formData.Codigo);
    return fotosOrdenadas.map((foto, index) => ({
      ...foto,
      Ordem: index,
      tipoOrdenacao: 'inteligente'
    }));
  }, [formData.Foto, localPhotoOrder]);

  // 🔥 FUNÇÃO DE REORDENAÇÃO CORRIGIDA
  const handleReorder = useCallback((startIndex, endIndex) => {
    console.log('🔄 REORDENAÇÃO iniciada:', {
      posicaoAtual: startIndex,
      novaPosicao: endIndex,
      totalFotos: fotosProcessadas.length
    });

    const fotosParaReordenar = localPhotoOrder.length > 0 ? [...localPhotoOrder] : [...fotosProcessadas];
    
    // 🔥 REORDENAÇÃO IMUTÁVEL
    const newArray = [...fotosParaReordenar];
    const [movedItem] = newArray.splice(startIndex, 1);
    newArray.splice(endIndex, 0, movedItem);

    // 🚀 CRITICAL: ATUALIZAR CAMPO ORDEM BASEADO NA NOVA POSIÇÃO
    const fotosComNovaOrdem = newArray.map((foto, index) => ({
      ...foto,
      Ordem: index,
      ordem: undefined,
      tipoOrdenacao: 'manual'
    }));

    console.log('📊 Ordens após reordenação:', fotosComNovaOrdem.slice(0, 5).map(f => ({ 
      codigo: f.Codigo, 
      Ordem: f.Ordem 
    })));

    setLocalPhotoOrder(fotosComNovaOrdem);

    // 🔥 ATUALIZAR COMPONENTE PAI IMEDIATAMENTE
    if (onUpdatePhotos) {
      console.log('📤 Atualizando fotos no componente pai IMEDIATAMENTE');
      onUpdatePhotos(fotosComNovaOrdem);
    }

    console.log('✅ Reordenação concluída');
  }, [fotosProcessadas, localPhotoOrder, onUpdatePhotos]);

  // 🔥 RESET DA ORDEM MANUAL
  const resetOrder = useCallback(() => {
    console.log('🔄 Resetando para ordem inteligente');
    
    if (!formData.Foto || !Array.isArray(formData.Foto)) return;

    const fotosOrdenadas = photoSorter.ordenarFotos(formData.Foto, formData.Codigo);
    const fotosComOrdem = fotosOrdenadas.map((foto, index) => ({
      ...foto,
      Ordem: index,
      ordem: undefined,
      tipoOrdenacao: 'inteligente'
    }));

    setLocalPhotoOrder([]);

    if (onUpdatePhotos) {
      onUpdatePhotos(fotosComOrdem);
    }
  }, [formData.Foto, formData.Codigo, onUpdatePhotos]);

  const stats = useMemo(() => ({
    totalFotos: fotosProcessadas.length,
    temOrdemLocal: localPhotoOrder.length > 0
  }), [fotosProcessadas.length, localPhotoOrder.length]);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Imagens do Imóvel</h2>
        <span className="text-sm text-gray-500">{stats.totalFotos}/5 fotos</span>
      </div>

      {/* ALERTA DE ORDEM PERSONALIZADA */}
      {stats.temOrdemLocal && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-orange-600 mr-3">🔄</div>
              <div>
                <p className="text-orange-800 font-medium">ORDEM PERSONALIZADA (não salva)</p>
                <p className="text-orange-600 text-sm">
                  Você alterou a ordem das fotos. As mudanças são aplicadas automaticamente. Use "Resetar Ordem" para voltar à ordem inteligente.
                </p>
              </div>
            </div>
            <button
              onClick={resetOrder}
              className="bg-[#8B6F48] text-white px-4 py-2 rounded-md hover:bg-[#8B6F48]/80 font-medium text-sm"
            >
              🔄 Resetar Ordem
            </button>
          </div>
        </div>
      )}

      {validation?.fotos && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{validation.fotos}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() => addSingleImage && addSingleImage()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
        >
          + Adicionar URL
        </button>

        <button
          type="button"
          onClick={() => showImageModal && showImageModal()}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium"
        >
          📤 Upload em Lote
        </button>

        <button
          type="button"
          onClick={resetOrder}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 font-medium"
        >
          🔄 Resetar Ordem
        </button>

        <button
          type="button"
          onClick={() => {
            if (onUpdatePhotos) onUpdatePhotos(fotosProcessadas);
            if (downloadAllPhotos) downloadAllPhotos();
          }}
          disabled={downloadingPhotos}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
        >
          {downloadingPhotos ? "⏳ Baixando..." : "⬇️ Baixar Todas"}
        </button>

        <button
          type="button"
          onClick={() => {
            setLocalPhotoOrder([]);
            if (removeAllImages) removeAllImages();
          }}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium"
        >
          🗑️ Limpar Tudo
        </button>
      </div>

      {/* GALERIA COM FOTOS GRANDES - LAYOUT ORIGINAL */}
      {fotosProcessadas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fotosProcessadas.map((foto, index) => (
            <div
              key={foto.Codigo}
              className={`relative bg-white rounded-lg border-2 overflow-hidden shadow-lg ${
                foto.Destaque === "Sim"
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200"
              }`}
            >
              {/* IMAGEM GRANDE */}
              <div className="relative aspect-video">
                <img
                  src={foto.Foto}
                  alt={`Foto ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                
                {/* POSIÇÃO NO CANTO SUPERIOR ESQUERDO */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm font-bold">
                  {foto.Destaque === "Sim" ? "⭐" : `${index + 1}º`}
                </div>

                {/* BOTÕES DE MOVIMENTO NO CANTO SUPERIOR DIREITO */}
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={() => handleReorder(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                    className="bg-black bg-opacity-70 text-white p-1 rounded hover:bg-opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para cima"
                  >
                    ⬆️
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(index, Math.min(fotosProcessadas.length - 1, index + 1))}
                    disabled={index === fotosProcessadas.length - 1}
                    className="bg-black bg-opacity-70 text-white p-1 rounded hover:bg-opacity-90 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Mover para baixo"
                  >
                    ⬇️
                  </button>
                </div>
              </div>

              {/* INFORMAÇÕES E CONTROLES */}
              <div className="p-4">
                <div className="mb-3">
                  <p className="font-semibold text-gray-900 text-sm">
                    Código: {foto.Codigo}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ordem: {foto.Ordem} | Tipo: {foto.tipoOrdenacao || 'inteligente'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {foto.Foto && foto.Foto.split('/').pop()}
                  </p>
                </div>

                {/* SELETOR DE POSIÇÃO */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Posição
                  </label>
                  <select
                    value={index + 1}
                    onChange={(e) => {
                      const newPosition = parseInt(e.target.value) - 1;
                      if (newPosition !== index) {
                        handleReorder(index, newPosition);
                      }
                    }}
                    className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    {Array.from({ length: fotosProcessadas.length }, (_, i) => (
                      <option key={i} value={i + 1}>
                        {i + 1}º
                      </option>
                    ))}
                  </select>
                </div>

                {/* CONTROLE DE DESTAQUE */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Destaque
                  </label>
                  <button
                    type="button"
                    onClick={() => setImageAsHighlight && setImageAsHighlight(foto.Codigo)}
                    className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
                      foto.Destaque === "Sim"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                        : "bg-gray-100 text-gray-600 hover:bg-yellow-50 border border-gray-300"
                    }`}
                  >
                    {foto.Destaque === "Sim" ? "⭐ Destacar" : "⭐ Destacar"}
                  </button>
                </div>

                {/* AÇÕES */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => updateImage && updateImage(foto.Codigo)}
                    className="flex-1 px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                  >
                    🔄 Trocar
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage && removeImage(foto.Codigo)}
                    className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                  >
                    ❌ Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-6xl mb-4">📷</div>
          <p className="text-gray-600 font-medium text-lg">Nenhuma foto adicionada</p>
          <p className="text-gray-500 text-sm mb-6">
            Adicione pelo menos 5 fotos para cadastrar o imóvel
          </p>
          <button
            type="button"
            onClick={() => showImageModal && showImageModal()}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Adicionar Primeira Foto
          </button>
        </div>
      )}
    </section>
  );
}
