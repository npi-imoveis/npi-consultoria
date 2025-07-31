"use client";
import { useState } from "react";
import { getYoutubeEmbedUrl } from "@/app/utils/youtube-extractor";

export default function VideoCondominio({ imovel }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [video, setVideo] = useState(null);

  // 🎥 FUNÇÃO ULTRA-ROBUSTA: Extrair ID do vídeo
  const getVideoId = () => {
    console.log('🎥 VideoCondominio - Debug completo:');
    console.log('🎥 imovel:', imovel);
    console.log('🎥 imovel.Video:', imovel?.Video);
    console.log('🎥 Tipo de imovel.Video:', typeof imovel?.Video);
    console.log('🎥 imovel.Video === null:', imovel?.Video === null);
    console.log('🎥 imovel.Video === undefined:', imovel?.Video === undefined);
    
    // ✅ VERIFICAÇÃO 1: imovel não existe
    if (!imovel) {
      console.log('🎥 RETORNO: null (imovel não existe)');
      return null;
    }
    
    // ✅ VERIFICAÇÃO 2: imovel.Video não existe ou é falsy
    if (!imovel.Video) {
      console.log('🎥 RETORNO: null (imovel.Video é falsy)');
      return null;
    }
    
    // ✅ VERIFICAÇÃO 3: imovel.Video é explicitamente null
    if (imovel.Video === null) {
      console.log('🎥 RETORNO: null (imovel.Video é null)');
      return null;
    }
    
    // ✅ VERIFICAÇÃO 4: imovel.Video é explicitamente undefined
    if (imovel.Video === undefined) {
      console.log('🎥 RETORNO: null (imovel.Video é undefined)');
      return null;
    }
    
    // ✅ VERIFICAÇÃO 5: imovel.Video é string vazia
    if (imovel.Video === "") {
      console.log('🎥 RETORNO: null (imovel.Video é string vazia)');
      return null;
    }
    
    // ✅ VERIFICAÇÃO 6: imovel.Video é boolean false
    if (imovel.Video === false) {
      console.log('🎥 RETORNO: null (imovel.Video é false)');
      return null;
    }
    
    // ✅ VERIFICAÇÃO 7: imovel.Video não é objeto
    if (typeof imovel.Video !== 'object') {
      console.log('🎥 RETORNO: null (imovel.Video não é objeto, é:', typeof imovel.Video);
      return null;
    }
    
    // ✅ VERIFICAÇÃO 8: imovel.Video é array (não esperado)
    if (Array.isArray(imovel.Video)) {
      console.log('🎥 RETORNO: null (imovel.Video é array, não esperado)');
      return null;
    }
    
    // ✅ VERIFICAÇÃO 9: imovel.Video é objeto vazio
    const videoKeys = Object.keys(imovel.Video);
    if (videoKeys.length === 0) {
      console.log('🎥 RETORNO: null (imovel.Video é objeto vazio)');
      return null;
    }
    
    console.log('🎥 imovel.Video tem keys:', videoKeys);
    
    // ✅ EXTRAÇÃO ROBUSTA: Tentar extrair ID do vídeo
    try {
      let videoId = null;
      
      // MÉTODO 1: Tentar extrair do primeiro valor do objeto
      const videoValues = Object.values(imovel.Video);
      console.log('🎥 Valores do objeto Video:', videoValues);
      
      if (videoValues.length > 0) {
        const firstValue = videoValues[0];
        console.log('🎥 Primeiro valor:', firstValue);
        
        if (firstValue && typeof firstValue === 'object') {
          // Se o primeiro valor é um objeto, tentar extrair propriedades
          videoId = firstValue.Video || firstValue.url || firstValue.videoId || firstValue.id;
          console.log('🎥 ID extraído do objeto interno:', videoId);
        } else if (firstValue && typeof firstValue === 'string') {
          // Se o primeiro valor é uma string, usar diretamente
          videoId = firstValue;
          console.log('🎥 ID extraído como string direta:', videoId);
        }
      }
      
      // MÉTODO 2: Se não encontrou, tentar propriedades diretas
      if (!videoId) {
        videoId = imovel.Video.Video || imovel.Video.url || imovel.Video.videoId || imovel.Video.id;
        console.log('🎥 ID extraído das propriedades diretas:', videoId);
      }
      
      // ✅ VERIFICAÇÃO FINAL: Validar se o videoId é válido
      if (!videoId) {
        console.log('🎥 RETORNO: null (videoId não encontrado)');
        return null;
      }
      
      if (typeof videoId !== 'string') {
        console.log('🎥 RETORNO: null (videoId não é string, é:', typeof videoId, ')');
        return null;
      }
      
      if (videoId.trim() === '') {
        console.log('🎥 RETORNO: null (videoId é string vazia)');
        return null;
      }
      
      console.log('🎥 RETORNO: ID válido encontrado:', videoId);
      return videoId.trim();
      
    } catch (error) {
      console.error("🎥 ERRO ao extrair ID do vídeo:", error);
      console.log('🎥 RETORNO: null (erro na extração)');
      return null;
    }
  };

  // ✅ OBTER ID DO VÍDEO
  const videoId = getVideoId();
  
  // ✅ LOG FINAL DE DEBUG
  console.log('🎥 ID final obtido:', videoId);
  console.log('🎥 Componente vai renderizar?', !!videoId);
  
  // ✅ EARLY RETURN: Se não há vídeo válido, não renderizar NADA
  if (!videoId) {
    console.log('🎥 VideoCondominio - Componente NÃO será renderizado (sem ID válido)');
    return null;
  }

  // ✅ FUNÇÃO: Carregar vídeo
  const loadVideo = () => {
    console.log('🎥 Carregando vídeo com ID:', videoId);
    setVideoLoaded(true);
    const videoData = getYoutubeEmbedUrl(videoId);
    setVideo(videoData);
    console.log('🎥 Dados do vídeo carregados:', videoData);
  };

  // ✅ RENDERIZAÇÃO: Só chega aqui se há vídeo válido
  console.log('🎥 VideoCondominio - Renderizando componente com ID:', videoId);
  
  return (
    <div className="bg-white container mx-auto p-4 md:p-10 mt-4 border-t-2">
      <h2 className="text-xl font-bold text-black" id="video">
        Vídeo {imovel?.Empreendimento || 'do Empreendimento'}
      </h2>
      <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mt-8">
        {videoLoaded ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={video?.embed}
            title={`Vídeo do empreendimento ${imovel?.Empreendimento || ''}`}
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
            {/* Botão play centralizado */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-lg">
              <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center transition-transform hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 24 24"
                  className="w-8 h-8 ml-1"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            
            {/* Thumbnail do YouTube */}
            <img
              src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
              alt={`Thumbnail do vídeo ${imovel?.Empreendimento || ''}`}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              loading="lazy"
              onError={(e) => {
                console.log('🎥 Erro ao carregar thumbnail maxres, tentando hqdefault');
                e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              }}
              onLoad={() => {
                console.log('🎥 Thumbnail carregada com sucesso para ID:', videoId);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
