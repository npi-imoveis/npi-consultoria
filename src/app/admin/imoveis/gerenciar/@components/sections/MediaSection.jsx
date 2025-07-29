"use client";

import { memo, useState, useEffect } from 'react';
import FormSection from '../FormSection';

const MediaSection = ({ formData, displayValues, onChange }) => {
  
  // 🎯 Estados locais sincronizados com formData (evita interferência)
  const [localTour360, setLocalTour360] = useState('');
  const [localVideoId, setLocalVideoId] = useState('');
  const [isInitialized, setIsInitialized] = useState(false); // ✅ CORRIGIDO: Nome da função

  // 🔄 Sincronizar com props quando mudarem (mas só uma vez)
  useEffect(() => {
    if (!isInitialized) {
      const tour360Value = displayValues?.Tour360 || formData?.Tour360 || '';
      const videoIdValue = formData?.Video?.["1"]?.Video || '';
      
      setLocalTour360(tour360Value);
      setLocalVideoId(videoIdValue);
      setIsInitialized(true);
      
      console.log('🔄 MediaSection inicializado:', { tour360Value, videoIdValue });
    }
  }, [formData, displayValues, isInitialized]);

  // 🚀 Handler para Tour 360 - Atualiza local E pai
  const handleTour360Change = (e) => {
    const value = e.target.value;
    
    // 1. Atualização LOCAL imediata (garante responsividade)
    setLocalTour360(value);
    
    // 2. Atualização no COMPONENTE PAI (com debounce/batch)
    if (typeof onChange === 'function') {
      try {
        onChange("Tour360", value);
      } catch (error) {
        console.error('Erro ao atualizar Tour360:', error);
      }
    }
  };

  // ✅ CORRIGIDO: Handler para Video ID completo e funcional
  const handleVideoIdChange = (e) => {
    const value = e.target.value;
    console.log('🎬 handleVideoIdChange chamado:', value);
    
    // Extrator de ID do YouTube (aceita URL ou ID)
    const extractYouTubeId = (input) => {
      if (!input) return '';
      
      console.log('🎬 Extraindo ID de:', input);
      
      // Se não tem youtube.com/youtu.be, assumir que já é ID
      if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
        console.log('🎬 Assumindo que é ID direto:', input);
        return input;
      }
      
      // Extrair ID de URLs
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
        /(?:youtu\.be\/)([^&\n?#]+)/,
        /(?:youtube\.com\/embed\/)([^&\n?#]+)/
      ];
      
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) {
          console.log('🎬 ID extraído com pattern:', match[1]);
          return match[1];
        }
      }
      
      console.log('🎬 Nenhum pattern funcionou, usando input original:', input);
      return input;
    };

    const cleanId = extractYouTubeId(value);
    console.log('🎬 ID limpo extraído:', cleanId);
    
    // 1. Atualização LOCAL imediata
    setLocalVideoId(cleanId); // ✅ CORRIGIDO: Era setVideoIdValue
    
    // 2. Atualização no COMPONENTE PAI
    if (typeof onChange === 'function') {
      try {
        // ✅ CORRIGIDO: Estrutura simplificada e correta
        const videoData = {
          "1": {
            Video: cleanId
          }
        };
        
        console.log('🎬 MediaSection criando videoData:', videoData);
        console.log('🎬 Chamando onChange com:', "Video", videoData);
        console.log('🎬 onChange é função?', typeof onChange === 'function');
        
        onChange("Video", videoData);
        
        console.log('🎬 onChange executado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao atualizar Video:', error);
      }
    } else {
      console.error('❌ onChange não é uma função:', typeof onChange);
    }
  };

  return (
    <FormSection title="Mídia">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tour 360° */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link do Tour Virtual 360°
          </label>
          <input
            type="text"
            value={localTour360}
            onChange={handleTour360Change}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors"
            placeholder="https://..."
          />
        </div>

        {/* Vídeo YouTube */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID do Vídeo (YouTube)
          </label>
          <input
            type="text"
            value={localVideoId}
            onChange={handleVideoIdChange} // ✅ CONECTADO ao handler corrigido
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors"
            placeholder="Ex: mdcsckJg7rc ou URL completa"
          />
          
          {/* Preview do vídeo */}
          {localVideoId && localVideoId.length > 5 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <div className="relative aspect-video w-full max-w-xs">
                <iframe
                  src={`https://www.youtube.com/embed/${localVideoId}`}
                  className="w-full h-full rounded border"
                  frameBorder="0"
                  allowFullScreen
                  title="Preview do YouTube"
                />
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Dica */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          💡 <strong>Dica:</strong> Para o vídeo do YouTube, você pode colar a URL completa ou apenas o ID.
        </p>
      </div>
    </FormSection>
  );
};

export default memo(MediaSection);
