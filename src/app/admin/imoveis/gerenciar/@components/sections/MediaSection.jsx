"use client";

import { memo } from 'react';
import FormSection from '../FormSection';

const MediaSection = ({ formData, displayValues, onChange }) => {
  
  // 🎯 Handlers específicos para cada campo
  const handleTour360Change = (e) => {
    onChange("Tour360", e.target.value);
  };

  const handleVideoIdChange = (e) => {
    const value = e.target.value;
    
    // 🚀 EXTRATOR INTELIGENTE: Aceita URL ou ID
    const extractYouTubeId = (input) => {
      if (!input) return '';
      
      // Se já é só o ID (sem youtube.com), manter
      if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
        return input;
      }
      
      // Extrair ID de URLs do YouTube
      const patterns = [
        /(?:youtube\.com\/watch\?v=)([^&\n?#]+)/,
        /(?:youtu\.be\/)([^&\n?#]+)/,
        /(?:youtube\.com\/embed\/)([^&\n?#]+)/
      ];
      
      for (const pattern of patterns) {
        const match = input.match(pattern);
        if (match) return match[1];
      }
      
      return input; // Fallback: retornar como está
    };

    const videoId = extractYouTubeId(value);
    
    // 🔥 ESTRUTURA CORRETA para vídeo aninhado
    const videoData = {
      ...formData.Video,
      "1": {
        ...formData.Video?.["1"],
        Video: videoId
      }
    };
    
    onChange("Video", videoData);
  };

  // 🎯 Valores atuais dos campos
  const tour360Value = displayValues?.Tour360 || formData?.Tour360 || "";
  const videoIdValue = formData?.Video?.["1"]?.Video || "";

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
            value={tour360Value}
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
            value={videoIdValue}
            onChange={handleVideoIdChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       transition-colors"
            placeholder="Ex: mdcsckJg7rc ou URL completa"
          />
          
          {/* Preview do vídeo */}
          {videoIdValue && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <div className="relative aspect-video w-full max-w-xs">
                <iframe
                  src={`https://www.youtube.com/embed/${videoIdValue}`}
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

      {/* Dicas de uso */}
      <div className="mt-4 p-3 bg-blue-50 rounded-md">
        <p className="text-sm text-blue-700">
          💡 <strong>Dica:</strong> Para o vídeo do YouTube, você pode colar a URL completa 
          (ex: https://www.youtube.com/watch?v=mdcsckJg7rc) ou apenas o ID (mdcsckJg7rc).
        </p>
      </div>
    </FormSection>
  );
};

export default memo(MediaSection);
