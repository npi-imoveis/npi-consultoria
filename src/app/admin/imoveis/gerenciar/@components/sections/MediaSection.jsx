"use client";

import { memo } from 'react';
import FormSection from '../FormSection';

const MediaSection = ({ formData, displayValues, onChange }) => {
  
  // 🎯 Valores atuais dos campos
  const tour360Value = displayValues?.Tour360 || formData?.Tour360 || "";
  const videoIdValue = formData?.Video?.["1"]?.Video || "";

  // 🚀 Handler para Tour 360
  const handleTour360Change = (e) => {
    if (typeof onChange === 'function') {
      onChange("Tour360", e.target.value);
    }
  };

  // 🚀 Handler para Video ID com extrator inteligente
  const handleVideoIdChange = (e) => {
    const value = e.target.value;
    
    // Extrator de ID do YouTube (aceita URL ou ID)
    const extractYouTubeId = (input) => {
      if (!input) return '';
      
      // Se não tem youtube.com/youtu.be, assumir que já é ID
      if (!input.includes('youtube.com') && !input.includes('youtu.be')) {
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
        if (match) return match[1];
      }
      
      return input;
    };

    const cleanId = extractYouTubeId(value);
    
    if (typeof onChange === 'function') {
      // Estrutura aninhada correta
      const videoData = {
        ...formData?.Video,
        "1": {
          ...formData?.Video?.["1"],
          Video: cleanId
        }
      };
      
      onChange("Video", videoData);
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
          {videoIdValue && videoIdValue.length > 5 && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
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
