"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { photoSorter } from "@/app/utils/photoSorter";

// 🔍 FUNÇÃO HELPER FORA DO COMPONENTE (SEM HOOKS)
function checkManualOrderHelper(fotos) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return { hasManualOrder: false, todasTemOrdem: false, isSequential: false };
  }

  // Verificar se todas têm campo Ordem ou ordem
  const todasTemOrdem = fotos.every(foto => 
    (foto.Ordem !== undefined && foto.Ordem !== null) || 
    (foto.ordem !== undefined && foto.ordem !== null)
  );

  if (!todasTemOrdem) {
    return { hasManualOrder: false, todasTemOrdem: false, isSequential: false };
  }

  // Extrair ordens e verificar se é sequencial
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
  // 🔥 ESTADOS
  const [localPhotoOrder, setLocalPhotoOrder] = useState([]);
  const [isManualReorder, setIsManualReorder] = useState(false);

  // 🔥 PROCESSAR FOTOS - USAR FUNÇÃO HELPER
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
      // Preservar ordem manual do banco, ordenando por campo Ordem
      return [...formData.Foto].sort((a, b) => {
        const ordemA = a.Ordem !== undefined ? a.Ordem : (a.ordem !== undefined ? a.ordem : 999);
        const ordemB = b.Ordem !== undefined ? b.Ordem : (b.ordem !== undefined ? b.ordem : 999);
        return ordemA - ordemB;
      });
    }

    console.log('🤖 Aplicando ordem INTELIGENTE');
    // Aplicar ordem inteligente e adicionar campo Ordem
    const fotosOrdenadas = photoSorter.ordenarFotos(formData.Foto, formData.Codigo);
    return fotosOrdenadas.map((foto, index) => ({
      ...foto,
      Ordem: index,
      tipoOrdenacao: 'inteligente'
    }));
  }, [formData.Foto, localPhotoOrder]);

  // 🔥 FUNÇÃO DE REORDENAÇÃO
  const movePhoto = useCallback((fromIndex, toIndex) => {
    console.log('🔄 MOVENDO FOTO:', {
      de: fromIndex,
      para: toIndex,
      totalFotos: fotosProcessadas.length
    });

    const fotosParaReordenar = localPhotoOrder.length > 0 ? [...localPhotoOrder] : [...fotosProcessadas];
    
    // Validação dos índices
    if (fromIndex < 0 || fromIndex >= fotosParaReordenar.length || 
        toIndex < 0 || toIndex >= fotosParaReordenar.length) {
      console.warn('❌ Índices inválidos para reordenação');
      return;
    }

    // Reordenação imutável
    const newArray = [...fotosParaReordenar];
    const [movedItem] = newArray.splice(fromIndex, 1);
    newArray.splice(toIndex, 0, movedItem);

    // Atualizar campo Ordem
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
    setIsManualReorder(true);

    if (onUpdatePhotos) {
      console.log('📤 Atualizando fotos no componente pai IMEDIATAMENTE');
      onUpdatePhotos(fotosComNovaOrdem);
    }

    console.log('✅ Reordenação concluída');
  }, [fotosProcessadas, localPhotoOrder, onUpdatePhotos]);

  // 🔥 RESET DA ORDEM
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
    setIsManualReorder(false);

    if (onUpdatePhotos) {
      onUpdatePhotos(fotosComOrdem);
    }
  }, [formData.Foto, formData.Codigo, onUpdatePhotos]);

  // 🔥 OUTRAS FUNÇÕES
  const baixarTodasFotos = useCallback(() => {
    if (onUpdatePhotos) {
      onUpdatePhotos(fotosProcessadas);
    }
    if (downloadAllPhotos) {
      downloadAllPhotos();
    }
  }, [fotosProcessadas, onUpdatePhotos, downloadAllPhotos]);

  const limparTodasFotos = useCallback(() => {
    setLocalPhotoOrder([]);
    setIsManualReorder(false);
    if (removeAllImages) {
      removeAllImages();
    }
  }, [removeAllImages]);

  // 📊 ESTATÍSTICAS SIMPLES
  const totalFotos = fotosProcessadas.length;
  const temOrdemLocal = localPhotoOrder.length > 0;

  return (
    <div className="space-y-6">
      {/* HEADER DA SEÇÃO */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Imagens do Imóvel
        </h2>
        <div className="text-sm text-gray-500">
          {totalFotos}/5 fotos
        </div>
      </div>

      {/* ALERTAS E STATUS */}
      {isManualReorder && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
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

      {/* MENSAGEM DE VALIDAÇÃO */}
      {validation?.fotos && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{validation.fotos}</p>
        </div>
      )}

      {/* BOTÕES DE AÇÃO */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => addSingleImage && addSingleImage()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          + Adicionar URL
        </button>
        
        <button
          type="button"
          onClick={() => showImageModal && showImageModal()}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          📤 Upload em Lote
        </button>

        <button
          type="button"
          onClick={resetOrder}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          🔄 Resetar Ordem
        </button>

        <button
          type="button"
          onClick={baixarTodasFotos}
          disabled={downloadingPhotos}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
        >
          {downloadingPhotos ? "⏳ Baixando..." : "⬇️ Baixar Todas"}
        </button>

        <button
          type="button"
          onClick={limparTodasFotos}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2"
        >
          🗑️ Limpar Tudo
        </button>
      </div>

      {/* LISTA DE FOTOS COM BOTÕES */}
      {fotosProcessadas.length > 0 && (
        <div className="space-y-4">
          {fotosProcessadas.map((foto, index) => (
            <div
              key={foto.Codigo}
              className={`border rounded-lg p-4 bg-white shadow-sm ${
                foto.Destaque === "Sim" ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center gap-4">
                {/* BOTÕES DE MOVIMENTO */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(index, Math.max(0, index - 1))}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                  >
                    ⬆️
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(index, Math.min(fotosProcessadas.length - 1, index + 1))}
                    disabled={index === fotosProcessadas.length - 1}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed rounded"
                  >
                    ⬇️
                  </button>
                </div>

                {/* POSIÇÃO */}
                <div className="text-sm font-medium text-gray-600 min-w-[50px]">
                  {foto.Destaque === "Sim" ? (
                    <span className="text-yellow-600 font-bold">⭐ DESTAQUE</span>
                  ) : (
                    `${index + 1}º`
                  )}
                </div>

                {/* PREVIEW DA IMAGEM */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                  <img 
                    src={foto.Foto} 
                    alt={`Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                {/* INFO DA FOTO */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    Código: {foto.Codigo}
                  </div>
                  <div className="text-xs text-gray-500">
                    Ordem: {foto.Ordem !== undefined ? foto.Ordem : 'N/A'} | 
                    Tipo: {foto.tipoOrdenacao || 'inteligente'}
                  </div>
                  {foto.Foto && (
                    <div className="text-xs text-gray-400 truncate">
                      {foto.Foto.split('/').pop()}
                    </div>
                  )}
                </div>

                {/* MOVIMENTAÇÃO RÁPIDA */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => movePhoto(index, 0)}
                    disabled={index === 0}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed rounded text-center"
                  >
                    ⏫
                  </button>
                  <button
                    type="button"
                    onClick={() => movePhoto(index, fotosProcessadas.length - 1)}
                    disabled={index === fotosProcessadas.length - 1}
                    className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed rounded text-center"
                  >
                    ⏬
                  </button>
                </div>

                {/* AÇÕES */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageAsHighlight && setImageAsHighlight(foto.Codigo)}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      foto.Destaque === "Sim"
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                    }`}
                  >
                    {foto.Destaque === "Sim" ? "✅ Destaque" : "⭐ Destacar"}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeImage && removeImage(foto.Codigo)}
                    className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    🗑️ Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MENSAGEM QUANDO NÃO HÁ FOTOS */}
      {fotosProcessadas.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-4xl mb-4">📷</div>
          <p className="text-gray-600 font-medium">Nenhuma foto adicionada</p>
          <p className="text-gray-500 text-sm mb-4">
            Adicione pelo menos 5 fotos para cadastrar o imóvel
          </p>
          <button
            type="button"
            onClick={() => showImageModal && showImageModal()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Adicionar Primeira Foto
          </button>
        </div>
      )}
    </div>
  );
}
