// 🧪 TESTE ISOLADO - Cole isso TEMPORARIAMENTE no seu componente pai

"use client";

import { memo, useState } from 'react';
import FormSection from '../FormSection';

const MediaSectionIsolated = () => {
  const [tour360, setTour360] = useState('');
  const [videoId, setVideoId] = useState('');
  
  return (
    <FormSection title="Mídia - TESTE ISOLADO">
      
      <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
        <p className="text-red-700 font-bold">🧪 TESTE ISOLADO</p>
        <p className="text-sm">Se conseguir digitar aqui, o problema é interferência de outros componentes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tour 360° */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Link do Tour Virtual 360°
          </label>
          <input
            type="text"
            value={tour360}
            onChange={(e) => {
              console.log('🎯 TESTE: Tour360 digitando:', e.target.value);
              setTour360(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://..."
          />
          <p className="text-xs text-green-600 mt-1">
            ✅ Digitação funcionando: "{tour360}"
          </p>
        </div>

        {/* Vídeo YouTube */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ID do Vídeo (YouTube)
          </label>
          <input
            type="text"
            value={videoId}
            onChange={(e) => {
              console.log('🎯 TESTE: VideoId digitando:', e.target.value);
              setVideoId(e.target.value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: mdcsckJg7rc"
          />
          <p className="text-xs text-green-600 mt-1">
            ✅ Digitação funcionando: "{videoId}"
          </p>
        </div>

      </div>

      <div className="mt-4 p-3 bg-green-50 rounded-md">
        <p className="text-sm text-green-700">
          <strong>TESTE:</strong> Se conseguir digitar aqui mas não no MediaSection normal, 
          o problema é interferência de outros componentes ou do estado compartilhado.
        </p>
      </div>

    </FormSection>
  );
};

export default memo(MediaSectionIsolated);
