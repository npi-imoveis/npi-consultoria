"use client";

import { memo } from 'react';
import FormSection from '../FormSection';

const MediaSection = ({ formData, displayValues, onChange }) => {
  
  // 🎯 Valores atuais - usando EXATAMENTE como os outros campos
  const tour360Value = displayValues?.Tour360 || formData?.Tour360 || "";
  const videoIdValue = formData?.Video?.["1"]?.Video || "";

  // 🔧 Handler para Tour 360 - SIMPLES e compatível
  const handleTour360Change = (e) => {
    if (typeof onChange === 'function') {
      onChange("Tour360", e.target.value);
    }
  };

  // 🔧 Handler para Video ID - SIMPLES e compatível
  const handleVideoIdChange = (e) => {
    const value = e.target.value;
    
    // Extrator simples do YouTube
    const extractId = (input) => {
      if (!input) return '';
      if (!input.includes('youtube')) return input;
      
      const match = input.match(/(?:v=|\/embed\/|youtu\.be\/)([^&\n?#]+)/);
      return match ? match[1] : input;
    };

    const cleanId = extractId(value);
    
    if (typeof onChange === 'function') {
      // Usar estrutura EXATA do FieldGroup original
      onChange("Video.1.Video", cleanId);
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
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: mdcsckJg7rc ou URL completa"
          />
          
          {/* Preview simples */}
          {videoIdValue && videoIdValue.length > 5 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <div className="relative aspect-video w-full max-w-xs">
                <iframe
                  src={`https://www.youtube.com/embed/${videoIdValue}`}
                  className="w-full h-full rounded border"
                  frameBorder="0"
                  allowFullScreen
                  title="Preview"
                />
              </div>
            </div>
          )}
        </div>

      </div>
    </FormSection>
  );
};

export default memo(MediaSection);
