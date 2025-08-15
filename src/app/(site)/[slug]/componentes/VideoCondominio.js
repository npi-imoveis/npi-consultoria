// src/app/(site)/[slug]/componentes/VideoCondominio.js
// 🚀 VERSÃO FINAL COM TESTE DE THUMBNAIL

"use client";

import { useState, useEffect } from 'react';

export default function VideoCondominio({ condominio }) {
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [thumbnailUrl, setThumbnailUrl] = useState(null);
    const [thumbnailLoading, setThumbnailLoading] = useState(true);
    
    // 🔍 CONSOLE DESTACADO para garantir visibilidade
    console.log('🔥🔥🔥 ===== VIDEO CONDOMINIO DEBUG ===== 🔥🔥🔥');
    console.log('🔥 condominio completo:', condominio);
    console.log('🔥 condominio.Video:', condominio?.Video);
    console.log('🔥🔥🔥 ================================ 🔥🔥🔥');
    
    // 🎯 EXTRAÇÃO SIMPLIFICADA E ROBUSTA
    const extractVideoId = () => {
        console.log('🔍 INICIANDO EXTRAÇÃO DE VIDEO ID');
        
        if (!condominio?.Video) {
            console.log('❌ Sem condominio.Video');
            return null;
        }
        
        console.log('✅ condominio.Video existe:', condominio.Video);
        console.log('✅ Tipo:', typeof condominio.Video);
        console.log('✅ Keys:', Object.keys(condominio.Video));
        console.log('✅ Values:', Object.values(condominio.Video));
        
        // Método original
        try {
            const firstValue = Object.values(condominio.Video)[0];
            console.log('🔍 Primeiro valor:', firstValue);
            
            if (firstValue && typeof firstValue === 'object' && firstValue.Video) {
                const videoId = firstValue.Video.trim();
                console.log('✅ VideoId extraído (método original):', videoId);
                return validateYouTubeId(videoId);
            }
        } catch (error) {
            console.log('❌ Método original falhou:', error);
        }
        
        // Busca profunda em qualquer propriedade
        const searchForVideoId = (obj, path = '') => {
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;
                console.log(`🔍 Verificando ${currentPath}:`, value);
                
                if (typeof value === 'string' && value.trim() !== '') {
                    const cleanValue = value.trim();
                    const validId = validateYouTubeId(cleanValue);
                    if (validId) {
                        console.log(`✅ VideoId encontrado em ${currentPath}:`, validId);
                        return validId;
                    }
                } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    const deepResult = searchForVideoId(value, currentPath);
                    if (deepResult) return deepResult;
                }
            }
            return null;
        };
        
        const foundId = searchForVideoId(condominio.Video);
        console.log('🔍 RESULTADO DA BUSCA:', foundId);
        return foundId;
    };
    
    // 🎯 VALIDAÇÃO YOUTUBE ID
    const validateYouTubeId = (input) => {
        console.log('🔍 Validando input:', input);
        
        if (!input || typeof input !== 'string') return null;
        
        const trimmed = input.trim();
        if (!trimmed) return null;
        
        // VideoId direto (11 caracteres)
        if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
            console.log('✅ VideoId direto válido:', trimmed);
            return trimmed;
        }
        
        // Extrair de URLs
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
            const match = trimmed.match(pattern);
            if (match) {
                console.log('✅ VideoId extraído de URL:', match[1]);
                return match[1];
            }
        }
        
        console.log('❌ Formato não reconhecido:', trimmed);
        return null;
    };
    
    // 🎯 TESTAR THUMBNAILS DISPONÍVEIS
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
    
    // Extrair videoId
    const videoId = extractVideoId();
    
    console.log('🎯 VIDEO ID FINAL:', videoId);
    
    // 🔄 EFFECT: Testar thumbnail quando videoId for encontrado
    useEffect(() => {
        if (videoId) {
            console.log('🔄 Testando thumbnails para videoId:', videoId);
            setThumbnailLoading(true);
            
            testThumbnail(videoId).then((url) => {
                console.log('🎯 Thumbnail final escolhido:', url);
                setThumbnailUrl(url);
                setThumbnailLoading(false);
            });
        }
    }, [videoId]);
    
    // ❌ EARLY RETURN: Sem videoId
    if (!videoId) {
        console.log('❌ Componente não será renderizado - sem videoId');
        return null;
    }
    
    // URLs do vídeo
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const embedUrlWithAutoplay = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const videoTitle = `Vídeo de apresentação - ${condominio.Empreendimento}`;

    console.log('🎯 Renderizando componente com videoId:', videoId);
    console.log('🎯 Thumbnail URL:', thumbnailUrl);
    console.log('🎯 Thumbnail loading:', thumbnailLoading);

    return (
        <div className="bg-white container mx-auto p-10 mt-4 rounded-lg">
            <h2 className="text-xl font-bold text-black">
                Vídeo {condominio.Empreendimento}
            </h2>
            
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
                        className="absolute top-0 left-0 w-full h-full cursor-pointer group bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center"
                        onClick={() => {
                            console.log('🎥 Carregando vídeo:', videoId);
                            setVideoLoaded(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setVideoLoaded(true);
                            }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Reproduzir ${videoTitle}`}
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
                                    alt={`Thumbnail: ${videoTitle}`}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onLoad={() => console.log('✅ Thumbnail renderizado com sucesso!')}
                                    onError={() => console.log('❌ Erro ao renderizar thumbnail')}
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
            
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-2">
                    Prefere assistir no YouTube?
                </p>
                <a 
                    href={watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span className="font-medium">Ver no YouTube</span>
                </a>
            </div>
        </div>
    );
}
