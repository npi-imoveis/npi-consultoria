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

  // 🔥 FUNÇÃO DE REORDENAÇÃO CORRIGIDA (MANTENDO A INTERFACE ORIGINAL)
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

  // 📊 ESTATÍSTICAS PARA DEBUG
  const stats = useMemo(() => {
    const temOrdemLocal = localPhotoOrder.length > 0;
    const temOrdemManual = checkManualOrderHelper(formData.Foto || []).hasManualOrder;
    
    console.log('📋 ORDENAÇÃO - Estado atual:', {
      totalFotos: fotosProcessadas.length,
      temOrdemLocal,
      temOrdemManual,
      primeiraFoto: fotosProcessadas[0] ? {
        codigo: fotosProcessadas[0].Codigo,
        Ordem: fotosProcessadas[0].Ordem,
        tipoOrdenacao: fotosProcessadas[0].tipoOrdenacao
      } : null
    });

    return {
      totalFotos: fotosProcessadas.length,
      temOrdemLocal,
      temOrdemManual
    };
  }, [fotosProcessadas, localPhotoOrder, formData.Foto]);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Imagens do Imóvel</h2>
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
                  Você alterou a ordem. Clique em SALVAR para persistir as mudanças.
                </p>
              </div>
            </div>
            <button
              onClick={resetOrder}
              className="text-orange-600 hover:text-orange-800 font-medium text-sm"
            >
              🔄 Resetar Ordem
            </button>
          </div>
        </div>
      )}

      {validation.fotos && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{validation.fotos}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <button
          type="button"
          onClick={() => addSingleImage && addSingleImage()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Adicionar URL
        </button>

        <button
          type="button"
          onClick={() => showImageModal && showImageModal()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          📤 Upload em Lote
        </button>

        <button
          type="button"
          onClick={resetOrder}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {downloadingPhotos ? "⏳ Baixando..." : "⬇️ Baixar Todas"}
        </button>

        <button
          type="button"
          onClick={() => {
            setLocalPhotoOrder([]);
            if (removeAllImages) removeAllImages();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          🗑️ Limpar Tudo
        </button>
      </div>

      {fotosProcessadas.length > 0 ? (
        <div className="space-y-4">
          {fotosProcessadas.map((foto, index) => (
            <div
              key={foto.Codigo}
              className={`flex items-center gap-4 p-4 border rounded-lg ${
                foto.Destaque === "Sim"
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              {/* POSIÇÃO */}
              <div className="flex-shrink-0 w-8 text-center">
                {foto.Destaque === "Sim" ? (
                  <span className="text-yellow-600 font-bold text-lg">⭐</span>
                ) : (
                  <span className="font-semibold text-gray-600">{index + 1}º</span>
                )}
              </div>

              {/* IMAGEM */}
              <div className="flex-shrink-0">
                <img
                  src={foto.Foto}
                  alt={`Foto ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  loading="lazy"
                />
              </div>

              {/* INFO */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Código: {foto.Codigo}
                </p>
                <p className="text-xs text-gray-500">
                  Ordem: {foto.Ordem} | Tipo: {foto.tipoOrdenacao || 'inteligente'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {foto.Foto && foto.Foto.split('/').pop()}
                </p>
              </div>

              {/* CONTROLES DE MOVIMENTO */}
              <div className="flex-shrink-0 flex gap-1">
                <button
                  type="button"
                  onClick={() => handleReorder(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="p-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                  title="Mover para cima"
                >
                  ⬆️
                </button>
                <button
                  type="button"
                  onClick={() => handleReorder(index, Math.min(fotosProcessadas.length - 1, index + 1))}
                  disabled={index === fotosProcessadas.length - 1}
                  className="p-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                  title="Mover para baixo"
                >
                  ⬇️
                </button>
              </div>

              {/* AÇÕES */}
              <div className="flex-shrink-0 flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageAsHighlight && setImageAsHighlight(foto.Codigo)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    foto.Destaque === "Sim"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : "bg-gray-100 text-gray-600 hover:bg-yellow-50"
                  }`}
                >
                  {foto.Destaque === "Sim" ? "✅ Destaque" : "⭐ Destacar"}
                </button>

                <button
                  type="button"
                  onClick={() => updateImage && updateImage(foto.Codigo)}
                  className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                >
                  ✏️ Editar
                </button>

                <button
                  type="button"
                  onClick={() => removeImage && removeImage(foto.Codigo)}
                  className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                >
                  🗑️ Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-4xl mb-4">📷</div>
          <p className="text-gray-600 font-medium">Nenhuma foto adicionada</p>
          <p className="text-gray-500 text-sm mb-4">
            Adicione pelo menos 5 fotos para cadastrar o imóvel
          </p>
          <button
            type="button"
            onClick={() => showImageModal && showImageModal()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Adicionar Primeira Foto
          </button>
        </div>
      )}
    </div>
  );
}
