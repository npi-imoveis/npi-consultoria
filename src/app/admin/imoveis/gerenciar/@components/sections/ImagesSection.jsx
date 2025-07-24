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
    <section className="bg-white border-2 border-gray-200 rounded-lg p-6">
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

      {/* LAYOUT EXATO DO ORIGINAL - BASEADO NA SUA IMAGEM */}
      {fotosProcessadas.length > 0 ? (
        <div className="space-y-4">
          {fotosProcessadas.map((foto, index) => (
            <div
              key={foto.Codigo}
              className={`border rounded-lg overflow-hidden ${
                foto.Destaque === "Sim"
                  ? "border-yellow-400 bg-yellow-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="flex">
                {/* COLUNA DA ESQUERDA - BOTÕES DE MOVIMENTO */}
                <div className="flex flex-col items-center justify-center p-3 bg-gray-50 border-r border-gray-200">
                  <button
                    type="button"
                    onClick={() => handleReorder(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                    className="p-1 mb-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ⬆
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(index, Math.min(fotosProcessadas.length - 1, index + 1))}
                    disabled={index === fotosProcessadas.length - 1}
                    className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-30 disabled:cursor-not-allowed w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ⬇
                  </button>
                </div>

                {/* COLUNA DO MEIO - POSIÇÃO */}
                <div className="flex items-center justify-center p-4 min-w-12">
                  <span className="font-bold text-lg text-gray-700">
                    {foto.Destaque === "Sim" ? "⭐" : `${index + 1}º`}
                  </span>
                </div>

                {/* COLUNA DA IMAGEM */}
                <div className="flex-shrink-0">
                  <img
                    src={foto.Foto}
                    alt={`Foto ${index + 1}`}
                    className="w-32 h-24 object-cover"
                    loading="lazy"
                  />
                </div>

                {/* COLUNA DE INFORMAÇÕES */}
                <div className="flex-1 p-4">
                  <div className="mb-2">
                    <p className="font-semibold text-gray-900 text-sm">
                      Código: {foto.Codigo}
                    </p>
                    <p className="text-xs text-gray-500">
                      Ordem: {foto.Ordem} | Tipo: {foto.tipoOrdenacao || 'banco'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {foto.Foto && foto.Foto.split('/').pop()}
                    </p>
                  </div>
                </div>

                {/* COLUNA DE AÇÕES - DESTACAR */}
                <div className="flex items-center p-4">
                  <div className="text-sm text-gray-600 mr-3">Destaque</div>
                  <button
                    type="button"
                    onClick={() => setImageAsHighlight && setImageAsHighlight(foto.Codigo)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      foto.Destaque === "Sim"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-gray-100 text-gray-600 hover:bg-yellow-100"
                    }`}
                  >
                    ⭐ Destacar
                  </button>
                </div>

                {/* COLUNA DE AÇÕES - REMOVER */}
                <div className="flex items-center p-4">
                  <button
                    type="button"
                    onClick={() => removeImage && removeImage(foto.Codigo)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm font-medium hover:bg-red-200"
                  >
                    🗑️ Remover
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
