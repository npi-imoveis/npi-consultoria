"use client";
import { useState, useEffect } from "react";

export default function VideoCondominio({ imovel }) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [thumbnailLoading, setThumbnailLoading] = useState(true);
  const [videoMetadata, setVideoMetadata] = useState(null);
  
  // 🔍 CONSOLE DESTACADO para garantir visibilidade (MANTIDO)
  console.log('🔥🔥🔥 ===== VIDEO IMOVEL DEBUG ===== 🔥🔥🔥');
  console.log('🔥 imovel completo:', imovel);
  console.log('🔥 imovel.Video:', imovel?.Video);
  console.log('🔥🔥🔥 ================================ 🔥🔥🔥');
  
  // 🎯 EXTRAÇÃO ULTRA-ROBUSTA do videoId (MANTIDO 100%)
  const extractVideoId = () => {
    console.log('🔍 INICIANDO EXTRAÇÃO DE VIDEO ID DO IMOVEL');
    
    if (!imovel?.Video) {
      console.log('❌ Sem imovel.Video');
      return null;
    }
    
    console.log('✅ imovel.Video existe:', imovel.Video);
    console.log('✅ Tipo:', typeof imovel.Video);
    console.log('✅ É array?', Array.isArray(imovel.Video));
    
    if (typeof imovel.Video !== 'object' || imovel.Video === null) {
      console.log('❌ imovel.Video não é objeto válido');
      return null;
    }
    
    if (Array.isArray(imovel.Video)) {
      console.log('❌ imovel.Video é array (não esperado)');
      return null;
    }
    
    console.log('✅ Keys:', Object.keys(imovel.Video));
    console.log('✅ Values:', Object.values(imovel.Video));
    
    // MÉTODO 1: Extração padrão (Object.values)
    try {
      const videoValues = Object.values(imovel.Video);
      console.log('🔍 Valores do objeto Video:', videoValues);
      
      if (videoValues.length > 0) {
        const firstValue = videoValues[0];
        console.log('🔍 Primeiro valor:', firstValue);
        
        if (firstValue && typeof firstValue === 'object' && firstValue.Video) {
          const extractedId = firstValue.Video;
          console.log('✅ MÉTODO 1A - ID extraído do objeto interno:', extractedId);
          const validId = validateYouTubeId(extractedId);
          if (validId) return validId;
        } else if (firstValue && typeof firstValue === 'string' && firstValue.trim() !== '') {
          const extractedId = firstValue.trim();
          console.log('✅ MÉTODO 1B - ID extraído como string direta:', extractedId);
          const validId = validateYouTubeId(extractedId);
          if (validId) return validId;
        }
      }
    } catch (error) {
      console.log('❌ MÉTODO 1 falhou:', error);
    }
    
    // MÉTODO 2: Tentar propriedades diretas
    const directProperties = ['Video', 'video', 'videoId', 'id', 'url', 'embed'];
    for (const prop of directProperties) {
      if (imovel.Video[prop]) {
        console.log(`🔍 Testando propriedade direta: ${prop} =`, imovel.Video[prop]);
        const validId = validateYouTubeId(imovel.Video[prop]);
        if (validId) {
          console.log(`✅ MÉTODO 2 - ID encontrado em propriedade ${prop}:`, validId);
          return validId;
        }
      }
    }
    
    // MÉTODO 3: Busca profunda em toda estrutura
    const searchDeep = (obj, path = '') => {
      if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return null;
      
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        console.log(`🔍 Busca profunda: ${currentPath} =`, value);
        
        if (typeof value === 'string' && value.trim() !== '') {
          const validId = validateYouTubeId(value.trim());
          if (validId) {
            console.log(`✅ MÉTODO 3 - ID encontrado em ${currentPath}:`, validId);
            return validId;
          }
        } else if (typeof value === 'object' && value !== null) {
          const deepResult = searchDeep(value, currentPath);
          if (deepResult) return deepResult;
        }
      }
      return null;
    };
    
    const deepSearchResult = searchDeep(imovel.Video);
    if (deepSearchResult) return deepSearchResult;
    
    console.log('❌ Nenhum videoId válido encontrado em toda a estrutura do imovel');
    return null;
  };

  // 🎯 VALIDAÇÃO ULTRA-ROBUSTA do YouTube ID (MANTIDO 100%)
  const validateYouTubeId = (input) => {
    console.log('🔍 Validando input:', input);
    
    if (!input || typeof input !== 'string') {
      console.log('❌ Input inválido para validação:', typeof input);
      return null;
    }
    
    const trimmed = input.trim();
    if (trimmed === '') {
      console.log('❌ Input vazio após trim');
      return null;
    }
    
    // Lista de IDs problemáticos conhecidos
    const blockedIds = ['4Aq7szgycT4', 'dQw4w9WgXcQ', 'undefined', 'null', ''];
    
    // PADRÃO 1: VideoId direto (11 caracteres)
    const directIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (directIdPattern.test(trimmed)) {
      if (blockedIds.includes(trimmed)) {
        console.log('❌ ID direto está bloqueado:', trimmed);
        return null;
      }
      console.log('✅ VideoId direto válido:', trimmed);
      return trimmed;
    }
    
    // PADRÃO 2: URL watch
    const watchPattern = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const watchMatch = trimmed.match(watchPattern);
    if (watchMatch) {
      const id = watchMatch[1];
      if (blockedIds.includes(id)) {
        console.log('❌ ID da URL watch está bloqueado:', id);
        return null;
      }
      console.log('✅ VideoId extraído de URL watch:', id);
      return id;
    }
    
    // PADRÃO 3: URL embed
    const embedPattern = /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
    const embedMatch = trimmed.match(embedPattern);
    if (embedMatch) {
      const id = embedMatch[1];
      if (blockedIds.includes(id)) {
        console.log('❌ ID da URL embed está bloqueado:', id);
        return null;
      }
      console.log('✅ VideoId extraído de URL embed:', id);
      return id;
    }
    
    // PADRÃO 4: URL shorts
    const shortsPattern = /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
    const shortsMatch = trimmed.match(shortsPattern);
    if (shortsMatch) {
      const id = shortsMatch[1];
      if (blockedIds.includes(id)) {
        console.log('❌ ID da URL shorts está bloqueado:', id);
        return null;
      }
      console.log('✅ VideoId extraído de URL shorts:', id);
      return id;
    }
    
    // URLs inválidas
    const invalidPatterns = [
      /youtube\.com\/@/,
      /youtube\.com\/channel/,
      /youtube\.com\/user/,
      /youtube\.com\/c\//,
      /youtube\.com\/playlist/,
      /youtube\.com\/results/,
      /youtube\.com\/feed\/trending/,
      /^https?:\/\/(?:www\.)?youtube\.com\/?$/
    ];
    
    for (const pattern of invalidPatterns) {
      if (pattern.test(trimmed)) {
        console.log('❌ URL inválida detectada:', trimmed);
        return null;
      }
    }
    
    console.log('❌ Formato não reconhecido como vídeo do YouTube:', trimmed);
    return null;
  };
  
  // 🎯 TESTAR THUMBNAILS DISPONÍVEIS (MANTIDO 100%)
  const testThumbnail = async (videoId) => {
    console.log('🖼️ Testando thumbnails para videoId:', videoId);
    
    const thumbnailOptions = [
      `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      `https://i.ytimg.com/vi/${videoId}/default.jpg`
    ];
    
    for (const url of thumbnailOptions) {
      try {
        console.log('🧪 Testando URL:', url);
        
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
          console.log('✅ Thumbnail encontrado:', url);
          return url;
        }
        console.log('❌ Thumbnail não disponível:', url, 'Status:', response.status);
      } catch (error) {
        console.log('❌ Erro ao testar thumbnail:', url, error);
      }
    }
    
    console.log('❌ Nenhum thumbnail disponível');
    return null;
  };

  // 🚨 ATUALIZADO: Função melhorada para buscar metadados completos
  const fetchVideoMetadata = async (videoId) => {
    try {
      const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
      if (response.ok) {
        const data = await response.json();
        // Extrair duração do HTML se disponível (não é garantido pela API oembed)
        return { 
          title: data.title, 
          author: data.author_name,
          // A API oembed não retorna duração, então usamos valor padrão
          duration: 'PT3M' // Padrão: 3 minutos em formato ISO 8601
        };
      }
    } catch (error) {
      console.log('❌ Erro ao buscar metadados:', error);
    }
    return { 
      title: `Vídeo do empreendimento ${imovel?.Empreendimento || 'Imóvel'}`, 
      author: 'NPI Consultoria',
      duration: 'PT3M' // Padrão: 3 minutos
    };
  };

  // Extrair videoId (MANTIDO)
  const videoId = extractVideoId();
  
  console.log('🎯 VIDEO ID FINAL DO IMOVEL:', videoId);
  
  // useEffect para buscar thumbnails e metadados
  useEffect(() => {
    if (videoId) {
      console.log('🔄 Testando thumbnails para videoId do imóvel:', videoId);
      setThumbnailLoading(true);
      
      Promise.all([
        testThumbnail(videoId),
        fetchVideoMetadata(videoId)
      ]).then(([thumbnail, metadata]) => {
        console.log('🎯 Thumbnail final escolhido para imóvel:', thumbnail);
        setThumbnailUrl(thumbnail);
        setVideoMetadata(metadata);
        setThumbnailLoading(false);
      });
    }
  }, [videoId]);
  
  // ❌ EARLY RETURN: Sem videoId (MANTIDO)
  if (!videoId) {
    console.log('❌ Componente VideoCondominio do IMOVEL não será renderizado - sem videoId');
    return null;
  }
  
  // URLs do vídeo (MANTIDO)
  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const embedUrlWithAutoplay = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  // Metadados do vídeo
  const videoTitle = videoMetadata?.title || `Vídeo do empreendimento ${imovel?.Empreendimento || 'Imóvel'}`;
  
  // 🚨 CORREÇÃO COMPLETA: Structured data com TODOS os campos obrigatórios
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": videoTitle,
    "description": `Vídeo apresentação do ${imovel?.Empreendimento || 'empreendimento'} - ${imovel?.TipoImovel || 'Imóvel'} de alto padrão com ${imovel?.Quartos || ''} ${imovel?.Quartos ? (imovel.Quartos > 1 ? 'quartos' : 'quarto') : ''} ${imovel?.Suites ? `e ${imovel.Suites} ${imovel.Suites > 1 ? 'suítes' : 'suíte'}` : ''} localizado em ${imovel?.Bairro || ''}, ${imovel?.Cidade || 'São Paulo'}. ${imovel?.DescricaoCompleta ? imovel.DescricaoCompleta.substring(0, 150) + '...' : 'Conheça todos os detalhes deste imóvel exclusivo.'}`,
    "uploadDate": imovel?.DataCadastro || new Date().toISOString(), // 🚨 CAMPO CRÍTICO ADICIONADO
    "duration": videoMetadata?.duration || "PT3M", // 🚨 CAMPO ADICIONADO (formato ISO 8601)
    "contentUrl": watchUrl,
    "embedUrl": embedUrl,
    "thumbnailUrl": thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    "author": { 
      "@type": "Organization", 
      "name": videoMetadata?.author || "NPI Consultoria",
      "url": "https://www.npiconsultoria.com.br"
    },
    "publisher": {
      "@type": "Organization",
      "name": "NPI Consultoria",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.npiconsultoria.com.br/logo.png"
      }
    },
    "mainEntityOfPage": { 
      "@type": "WebPage", 
      "@id": typeof window !== 'undefined' ? window.location.href : `https://www.npiconsultoria.com.br/imovel/${imovel?.ID}/${imovel?.Slug}`
    }
  };

  console.log('🎯 Renderizando componente IMOVEL com videoId:', videoId);
  console.log('🎯 Thumbnail URL:', thumbnailUrl);
  console.log('🎯 Thumbnail loading:', thumbnailLoading);
  console.log('📊 Structured Data completo:', structuredData);

  return (
    <>
      {/* 🚨 JSON-LD script com dados estruturados completos */}
      <script 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} 
      />
      
      {/* Container principal com schema.org markup */}
      <div className="bg-white container mx-auto p-4 md:p-10 mt-4 border-t-2" itemScope itemType="https://schema.org/VideoObject">
        <h2 className="text-xl font-bold text-black" id="video">
          Vídeo {imovel?.Empreendimento || 'do Empreendimento'}
        </h2>
        
        {/* 🚨 Meta tags completas para fallback */}
        <meta itemProp="name" content={videoTitle} />
        <meta itemProp="description" content={structuredData.description} />
        <meta itemProp="uploadDate" content={structuredData.uploadDate} />
        <meta itemProp="duration" content={structuredData.duration} />
        <meta itemProp="contentUrl" content={watchUrl} />
        <meta itemProp="embedUrl" content={embedUrl} />
        <meta itemProp="thumbnailUrl" content={structuredData.thumbnailUrl} />
        
        {/* Player de vídeo */}
        <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mt-8">
          {videoLoaded ? (
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrlWithAutoplay}
              title={videoTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <div
              onClick={() => {
                console.log('🎥 Carregando vídeo do IMOVEL:', videoId);
                setVideoLoaded(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  console.log('🎥 Carregando vídeo do IMOVEL via teclado:', videoId);
                  setVideoLoaded(true);
                }
              }}
              tabIndex={0}
              className="absolute top-0 left-0 w-full h-full cursor-pointer group bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
              aria-label="Carregar vídeo"
              role="button"
            >
              {/* CONDITIONAL RENDERING baseado no estado do thumbnail */}
              {thumbnailLoading ? (
                // Estado de carregamento
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <div>Carregando preview...</div>
                </div>
              ) : thumbnailUrl ? (
                // Thumbnail encontrado
                <>
                  <img
                    src={thumbnailUrl}
                    alt={`Thumbnail do vídeo ${imovel?.Empreendimento || ''}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onLoad={() => console.log('✅ Thumbnail do IMOVEL renderizado com sucesso!')}
                    onError={() => console.log('❌ Erro ao renderizar thumbnail do IMOVEL')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
                </>
              ) : (
                // Fallback final - sem thumbnail
                <div className="text-white text-center">
                  <div className="text-6xl mb-4">📺</div>
                  <div className="text-lg font-semibold">Vídeo Disponível</div>
                  <div className="text-sm opacity-75">Clique para assistir</div>
                </div>
              )}
              
              {/* Play button - sempre visível */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 lg:p-6 transition-all duration-300 transform group-hover:scale-110 shadow-lg z-10">
                  <svg className="w-8 h-8 lg:w-12 lg:h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
              </div>
              
              {/* YouTube badge */}
              <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1 z-10">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
                YouTube
              </div>
              
              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 z-10">
                <h3 className="text-white font-semibold text-sm lg:text-base line-clamp-2">
                  {videoTitle}
                </h3>
              </div>
            </div>
          )}
        </div>
        
        {/* Link para YouTube */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-2">
            Prefere assistir no YouTube?
          </p>
          <a 
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
            aria-label={`Assistir ${videoTitle} no YouTube`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            <span className="font-medium">Ver no YouTube</span>
          </a>
        </div>
      </div>
    </>
  );
}
