"use client";
import { useState } from "react";
import { getYoutubeEmbedUrl } from "@/app/utils/youtube-extractor";

export default function VideoCondominio({ imovel }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [video, setVideo] = useState(null);

  // 🎥 FUNÇÃO ULTRA-ROBUSTA: Extrair e validar ID do vídeo YouTube
  const getValidYouTubeVideoId = () => {
    console.log('🎥 VideoCondominio - Debug completo:');
    console.log('🎥 imovel:', imovel);
    console.log('🎥 imovel.Video:', imovel?.Video);
    console.log('🎥 Tipo de imovel.Video:', typeof imovel?.Video);
    
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
    
    // ✅ EXTRAÇÃO E VALIDAÇÃO: Tentar extrair ID válido do YouTube
    try {
      let rawVideoValue = null;
      
      // MÉTODO 1: Tentar extrair do primeiro valor do objeto
      const videoValues = Object.values(imovel.Video);
      console.log('🎥 Valores do objeto Video:', videoValues);
      
      if (videoValues.length > 0) {
        const firstValue = videoValues[0];
        console.log('🎥 Primeiro valor:', firstValue);
        
        if (firstValue && typeof firstValue === 'object') {
          // Se o primeiro valor é um objeto, tentar extrair propriedades
          rawVideoValue = firstValue.Video || firstValue.url || firstValue.videoId || firstValue.id;
          console.log('🎥 Valor bruto extraído do objeto interno:', rawVideoValue);
        } else if (firstValue && typeof firstValue === 'string') {
          // Se o primeiro valor é uma string, usar diretamente
          rawVideoValue = firstValue;
          console.log('🎥 Valor bruto extraído como string direta:', rawVideoValue);
        }
      }
      
      // MÉTODO 2: Se não encontrou, tentar propriedades diretas
      if (!rawVideoValue) {
        rawVideoValue = imovel.Video.Video || imovel.Video.url || imovel.Video.videoId || imovel.Video.id;
        console.log('🎥 Valor bruto extraído das propriedades diretas:', rawVideoValue);
      }
      
      // ✅ VERIFICAÇÕES BÁSICAS: Validar se o valor bruto é válido
      if (!rawVideoValue) {
        console.log('🎥 RETORNO: null (valor bruto não encontrado)');
        return null;
      }
      
      if (typeof rawVideoValue !== 'string') {
        console.log('🎥 RETORNO: null (valor bruto não é string, é:', typeof rawVideoValue, ')');
        return null;
      }
      
      const trimmedValue = rawVideoValue.trim();
      if (trimmedValue === '') {
        console.log('🎥 RETORNO: null (valor bruto é string vazia)');
        return null;
      }
      
      console.log('🎥 Valor bruto válido encontrado:', trimmedValue);
      
      // 🎯 VALIDAÇÃO YOUTUBE: Verificar se é um videoId válido do YouTube
      const validVideoId = extractYouTubeVideoId(trimmedValue);
      
      if (!validVideoId) {
        console.log('🎥 RETORNO: null (não é um vídeo válido do YouTube)');
        return null;
      }
      
      console.log('🎥 RETORNO: VideoId válido do YouTube:', validVideoId);
      return validVideoId;
      
    } catch (error) {
      console.error("🎥 ERRO ao extrair e validar ID do vídeo:", error);
      console.log('🎥 RETORNO: null (erro na extração)');
      return null;
    }
  };

  // 🎯 FUNÇÃO AUXILIAR: Extrair videoId válido de URLs ou IDs do YouTube
  const extractYouTubeVideoId = (input) => {
    if (!input || typeof input !== 'string') return null;
    
    const trimmed = input.trim();
    console.log('🔍 Analisando entrada para YouTube:', trimmed);
    
    // PADRÃO 1: VideoId direto (11 caracteres, alfanumérico + _ -)
    const directIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (directIdPattern.test(trimmed)) {
      console.log('✅ VideoId direto detectado:', trimmed);
      return trimmed;
    }
    
    // PADRÃO 2: URL padrão do YouTube (watch?v=)
    const standardUrlPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const standardMatch = trimmed.match(standardUrlPattern);
    if (standardMatch) {
      console.log('✅ URL padrão do YouTube detectada, videoId:', standardMatch[1]);
      return standardMatch[1];
    }
    
    // PADRÃO 3: URL embed do YouTube
    const embedUrlPattern = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
    const embedMatch = trimmed.match(embedUrlPattern);
    if (embedMatch) {
      console.log('✅ URL embed do YouTube detectada, videoId:', embedMatch[1]);
      return embedMatch[1];
    }
    
    // PADRÃO 4: URL shorts do YouTube
    const shortsUrlPattern = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
    const shortsMatch = trimmed.match(shortsUrlPattern);
    if (shortsMatch) {
      console.log('✅ URL shorts do YouTube detectada, videoId:', shortsMatch[1]);
      return shortsMatch[1];
    }
    
    // ❌ PADRÕES INVÁLIDOS: Detectar URLs que NÃO são vídeos
    const invalidPatterns = [
      /youtube\.com\/@/,        // URL de canal (@usuario)
      /youtube\.com\/channel/,  // URL de canal (channel/UC...)
      /youtube\.com\/user/,     // URL de usuário antigo
      /youtube\.com\/c\//,      // URL de canal personalizado
      /youtube\.com\/playlist/, // URL de playlist
      /youtube\.com\/?$/,       // Homepage do YouTube
    ];
    
    for (const pattern of invalidPatterns) {
      if (pattern.test(trimmed)) {
        console.log('❌ URL inválida detectada (não é vídeo):', trimmed);
        return null;
      }
    }
    
    console.log('❌ Formato não reconhecido como vídeo do YouTube:', trimmed);
    return null;
  };

  // ✅ OBTER VIDEOID VÁLIDO
  const videoId = getValidYouTubeVideoId();
  
  // ✅ LOG FINAL DE DEBUG
  console.log('🎥 VideoId final obtido:', videoId);
  console.log('🎥 Componente vai renderizar?', !!videoId);
  
  // ✅ EARLY RETURN: Se não há vídeo válido, não renderizar NADA
  if (!videoId) {
    console.log('🎥 VideoCondominio - Componente NÃO será renderizado (sem videoId válido)');
    return null;
  }

  // ✅ FUNÇÃO: Carregar vídeo
  const loadVideo = () => {
    console.log('🎥 Carregando vídeo com VideoId:', videoId);
    setVideoLoaded(true);
    const videoData = getYoutubeEmbedUrl(videoId);
    setVideo(videoData);
    console.log('🎥 Dados do vídeo carregados:', videoData);
  };

  // ✅ RENDERIZAÇÃO: Só chega aqui se há videoId válido
  console.log('🎥 VideoCondominio - Renderizando componente com VideoId válido:', videoId);
  
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
            
            {/* Thumbnail do YouTube - só carrega se temos videoId válido */}
            <img
              src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
              alt={`Thumbnail do vídeo ${imovel?.Empreendimento || ''}`}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-lg"
              loading="lazy"
              onError={(e) => {
                console.log('🎥 Erro ao carregar thumbnail maxres, tentando hqdefault para videoId:', videoId);
                e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
              }}
              onLoad={() => {
                console.log('🎥 Thumbnail carregada com sucesso para videoId:', videoId);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
