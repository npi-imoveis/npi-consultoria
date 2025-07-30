"use client";
import { useState } from "react";
import { getYoutubeEmbedUrl } from "@/app/utils/youtube-extractor";

export default function VideoCondominio({ imovel }) {
  // ✅ CORREÇÃO 1: Melhor lógica para extrair ID do vídeo
  const getVideoId = () => {
    // Se Video é null, undefined ou objeto vazio, retornar null
    if (!imovel?.Video || 
        imovel.Video === null || 
        typeof imovel.Video !== 'object' ||
        Object.keys(imovel.Video).length === 0) {
      return null;
    }

    try {
      // Tentar extrair o ID do vídeo do objeto Video
      const firstVideoValue = Object.values(imovel.Video)[0];
      return firstVideoValue?.Video || firstVideoValue?.url || firstVideoValue?.videoId || null;
    } catch (error) {
      console.error("Erro ao extrair ID do vídeo:", error);
      return null;
    }
  };

  const id = getVideoId();
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [video, setVideo] = useState(null);

  // ✅ CORREÇÃO 2: Se não há vídeo, não renderizar NADA
  if (!id) {
    return null;
  }

  const loadVideo = () => {
    setVideoLoaded(true);
    const v = getYoutubeEmbedUrl(id);
    setVideo(v);
  };

  // ✅ CORREÇÃO 3: Só renderiza se há vídeo válido
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
