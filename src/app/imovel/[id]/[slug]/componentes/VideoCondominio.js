"use client";
import { useState } from "react";
import { getYoutubeEmbedUrl } from "@/app/utils/youtube-extractor";

export default function VideoCondominio({ imovel }) {
  // ✅ CORREÇÃO ROBUSTA: Melhor detecção de vídeo removido
  const getVideoId = () => {
    console.log('🎥 VideoCondominio - Debug imovel.Video:', imovel?.Video);
    console.log('🎥 VideoCondominio - Tipo:', typeof imovel?.Video);
    console.log('🎥 VideoCondominio - É null?', imovel?.Video === null);
    console.log('🎥 VideoCondominio - É undefined?', imovel?.Video === undefined);
    
    // ✅ VERIFICAÇÃO MAIS ROBUSTA
    if (!imovel?.Video) {
      console.log('🎥 VideoCondominio - Vídeo ausente (!imovel?.Video)');
      return null;
    }
    
    if (imovel.Video === null) {
      console.log('🎥 VideoCondominio - Vídeo é null');
      return null;
    }
    
    if (typeof imovel.Video !== 'object') {
      console.log('🎥 VideoCondominio - Vídeo não é objeto');
      return null;
    }
    
    if (Object.keys(imovel.Video).length === 0) {
      console.log('🎥 VideoCondominio - Vídeo é objeto vazio');
      return null;
    }

    try {
      // Tentar extrair o ID do vídeo do objeto Video
      const firstVideoValue = Object.values(imovel.Video)[0];
      console.log('🎥 VideoCondominio - firstVideoValue:', firstVideoValue);
      
      if (!firstVideoValue) {
        console.log('🎥 VideoCondominio - firstVideoValue é falsy');
        return null;
      }
      
      const videoId = firstVideoValue?.Video || firstVideoValue?.url || firstVideoValue?.videoId || null;
      console.log('🎥 VideoCondominio - videoId extraído:', videoId);
      
      // ✅ VERIFICAÇÃO ADICIONAL: Se videoId é string vazia ou só espaços
      if (!videoId || (typeof videoId === 'string' && videoId.trim() === '')) {
        console.log('🎥 VideoCondominio - videoId vazio ou inválido');
        return null;
      }
      
      return videoId;
    } catch (error) {
      console.error("🎥 VideoCondominio - Erro ao extrair ID do vídeo:", error);
      return null;
    }
  };

  const id = getVideoId();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [video, setVideo] = useState(null);

  // ✅ DEBUG: Log final
  console.log('🎥 VideoCondominio - ID final:', id);
  console.log('🎥 VideoCondominio - Vai renderizar?', !!id);

  // ✅ Se não há vídeo válido, não renderizar NADA
  if (!id) {
    console.log('🎥 VideoCondominio - Não renderizando (sem ID válido)');
    return null;
  }

  const loadVideo = () => {
    setVideoLoaded(true);
    const v = getYoutubeEmbedUrl(id);
    setVideo(v);
  };

  // ✅ Só renderiza se há vídeo válido
  console.log('🎥 VideoCondominio - Renderizando componente com ID:', id);
  
  return (
    <div className="bg-white container mx-auto p-4 md:p-10 mt-4 border-t-2">
      <h2 className="text-xl font-bold text-black" id="video">
        Vídeo {imovel.Empreendimento}
      </h2>
      <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mt-8">
        {videoLoaded ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={video.embed}
            title={`Vídeo do empreendimento ${imovel.Empreendimento}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          ></iframe>
        ) : (
          <div
            onClick={loadVideo}
            className="absolute top-0 left-0 w-full h-full cursor-pointer"
            aria-label="Carregar vídeo"
          >
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                  className="w-8 h-8"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <img
              src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
              alt={`Thumbnail do vídeo ${imovel.Empreendimento}`}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              loading="lazy"
              onError={(e) => {
                e.target.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
