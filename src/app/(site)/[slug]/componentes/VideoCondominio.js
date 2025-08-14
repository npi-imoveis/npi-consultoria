// src/app/(site)/[slug]/componentes/VideoCondominio.js
// 🚀 VERSÃO ULTRA-ROBUSTA COM DEBUG COMPLETO

"use client";

import { useState } from 'react';

export default function VideoCondominio({ condominio }) {
    const [videoLoaded, setVideoLoaded] = useState(false);
    
    // 🔍 DEBUG ULTRA-COMPLETO: Log de toda a estrutura
    console.log('🏠 VideoCondominio DEBUG COMPLETO:');
    console.log('🏠 condominio objeto completo:', JSON.stringify(condominio, null, 2));
    console.log('🏠 condominio.Video:', condominio?.Video);
    console.log('🏠 Tipo de condominio.Video:', typeof condominio?.Video);
    console.log('🏠 É array?', Array.isArray(condominio?.Video));
    console.log('🏠 Keys do Video:', condominio?.Video ? Object.keys(condominio.Video) : 'N/A');
    console.log('🏠 Values do Video:', condominio?.Video ? Object.values(condominio.Video) : 'N/A');
    
    // 🎯 EXTRAÇÃO ULTRA-ROBUSTA do videoId
    const extractVideoId = () => {
        // Verificações básicas
        if (!condominio) {
            console.log('❌ Condominio não existe');
            return null;
        }
        
        if (!condominio.Video) {
            console.log('❌ condominio.Video não existe');
            return null;
        }
        
        if (typeof condominio.Video !== 'object') {
            console.log('❌ condominio.Video não é objeto');
            return null;
        }
        
        if (Array.isArray(condominio.Video)) {
            console.log('❌ condominio.Video é array (não esperado)');
            return null;
        }
        
        const videoKeys = Object.keys(condominio.Video);
        if (videoKeys.length === 0) {
            console.log('❌ condominio.Video é objeto vazio');
            return null;
        }
        
        console.log('✅ condominio.Video é válido, processando...');
        
        // MÉTODO 1: Extração original (Object.values)
        try {
            const firstValue = Object.values(condominio.Video)[0];
            console.log('🔍 Primeiro valor:', firstValue);
            
            if (firstValue && typeof firstValue === 'object' && firstValue.Video) {
                const extractedId = firstValue.Video;
                console.log('✅ MÉTODO 1 - ID extraído:', extractedId);
                return validateYouTubeId(extractedId);
            }
        } catch (error) {
            console.log('❌ MÉTODO 1 falhou:', error);
        }
        
        // MÉTODO 2: Tentar todas as keys possíveis
        const possibleKeys = ['Video', 'video', 'videoId', 'id', 'url', 'embed'];
        for (const key of videoKeys) {
            console.log(`🔍 Testando key: ${key}`);
            const value = condominio.Video[key];
            console.log(`🔍 Valor da key ${key}:`, value);
            
            if (value && typeof value === 'object') {
                // Se é objeto, tentar extrair propriedades
                for (const subKey of possibleKeys) {
                    if (value[subKey]) {
                        console.log(`✅ MÉTODO 2A - ID encontrado em ${key}.${subKey}:`, value[subKey]);
                        const validId = validateYouTubeId(value[subKey]);
                        if (validId) return validId;
                    }
                }
            } else if (value && typeof value === 'string') {
                // Se é string direta
                console.log(`✅ MÉTODO 2B - String direta em ${key}:`, value);
                const validId = validateYouTubeId(value);
                if (validId) return validId;
            }
        }
        
        // MÉTODO 3: Busca profunda em toda estrutura
        const searchDeep = (obj, path = '') => {
            if (typeof obj !== 'object' || obj === null) return null;
            
            for (const [key, value] of Object.entries(obj)) {
                const currentPath = path ? `${path}.${key}` : key;
                console.log(`🔍 Busca profunda: ${currentPath} =`, value);
                
                if (typeof value === 'string' && value.trim() !== '') {
                    const validId = validateYouTubeId(value);
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
        
        const deepSearchResult = searchDeep(condominio.Video);
        if (deepSearchResult) return deepSearchResult;
        
        console.log('❌ Nenhum videoId válido encontrado em toda a estrutura');
        return null;
    };
    
    // 🎯 VALIDAÇÃO ULTRA-ROBUSTA do YouTube ID
    const validateYouTubeId = (input) => {
        if (!input || typeof input !== 'string') {
            console.log('❌ Input inválido para validação:', input);
            return null;
        }
        
        const trimmed = input.trim();
        if (trimmed === '') {
            console.log('❌ Input vazio após trim');
            return null;
        }
        
        console.log('🔍 Validando input:', trimmed);
        
        // Lista de IDs problemáticos conhecidos
        const blockedIds = ['4Aq7szgycT4', 'dQw4w9WgXcQ', 'undefined', 'null', ''];
        
        // PADRÃO 1: VideoId direto (11 caracteres)
        const directIdPattern = /^[a-zA-Z0-9_-]{11}$/;
        if (directIdPattern.test(trimmed)) {
            if (blockedIds.includes(trimmed)) {
                console.log('❌ ID direto está bloqueado:', trimmed);
                return null;
            }
            console.log('✅ ID direto válido:', trimmed);
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
            console.log('✅ ID extraído de URL watch:', id);
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
            console.log('✅ ID extraído de URL embed:', id);
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
            console.log('✅ ID extraído de URL shorts:', id);
            return id;
        }
        
        // URLs inválidas
        const invalidPatterns = [
            /youtube\.com\/@/,
            /youtube\.com\/channel/,
            /youtube\.com\/user/,
            /youtube\.com\/c\//,
            /youtube\.com\/playlist/,
            /^https?:\/\/(?:www\.)?youtube\.com\/?$/
        ];
        
        for (const pattern of invalidPatterns) {
            if (pattern.test(trimmed)) {
                console.log('❌ URL inválida detectada:', trimmed);
                return null;
            }
        }
        
        console.log('❌ Formato não reconhecido:', trimmed);
        return null;
    };
    
    // Extrair o videoId
    const videoId = extractVideoId();
    
    console.log('🎯 RESULTADO FINAL - VideoId:', videoId);
    console.log('🎯 Componente vai renderizar?', !!videoId);
    
    // Se não há videoId válido, não renderizar
    if (!videoId) {
        console.log('❌ VideoCondominio não será renderizado - sem videoId válido');
        return null;
    }
    
    // URLs do vídeo
    const embedUrl = `https://www.youtube.com/embed/${videoId}`;
    const embedUrlWithAutoplay = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    
    console.log('🎯 URLs geradas:');
    console.log('🎯 Embed:', embedUrl);
    console.log('🎯 Thumbnail:', thumbnailUrl);
    console.log('🎯 Watch:', watchUrl);
    
    const videoTitle = `Vídeo de apresentação - ${condominio.Empreendimento}`;
    const videoDescription = `Conheça o ${condominio.Empreendimento} em ${condominio.BairroComercial}, ${condominio.Cidade}. ` +
                           `${condominio.Categoria} com ${condominio.DormitoriosAntigo} quartos, ` +
                           `${condominio.SuiteAntigo} suítes, ${condominio.MetragemAnt}, ${condominio.VagasAntigo} vagas.`;
    
    // Structured data
    const videoStructuredData = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": videoTitle,
        "description": videoDescription,
        "thumbnailUrl": thumbnailUrl,
        "uploadDate": new Date().toISOString(),
        "contentUrl": watchUrl,
        "embedUrl": embedUrl,
        "publisher": {
            "@type": "Organization", 
            "name": "NPI Consultoria",
            "logo": {
                "@type": "ImageObject",
                "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
            }
        }
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(videoStructuredData),
                }}
            />
            
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
                            aria-label={videoTitle}
                        />
                    ) : (
                        <div 
                            className="absolute top-0 left-0 w-full h-full cursor-pointer group bg-black rounded-lg overflow-hidden"
                            onClick={() => {
                                console.log('🎥 Carregando vídeo - VideoId:', videoId);
                                setVideoLoaded(true);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    console.log('🎥 Carregando vídeo via teclado - VideoId:', videoId);
                                    setVideoLoaded(true);
                                }
                            }}
                            tabIndex={0}
                            role="button"
                            aria-label={`Reproduzir ${videoTitle}`}
                        >
                            <img
                                src={thumbnailUrl}
                                alt={`Thumbnail: ${videoTitle}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                onLoad={(e) => {
                                    console.log('✅ Thumbnail carregada com sucesso!');
                                    console.log('✅ URL:', e.target.src);
                                    console.log('✅ Dimensões:', e.target.naturalWidth + 'x' + e.target.naturalHeight);
                                }}
                                onError={(e) => {
                                    console.log('❌ ERRO ao carregar thumbnail maxres:', e.target.src);
                                    
                                    if (e.target.src.includes('maxresdefault')) {
                                        console.log('🔄 Tentando hqdefault...');
                                        e.target.src = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
                                    } else if (e.target.src.includes('hqdefault')) {
                                        console.log('🔄 Tentando mqdefault...');
                                        e.target.src = `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
                                    } else if (e.target.src.includes('mqdefault')) {
                                        console.log('🔄 Tentando default...');
                                        e.target.src = `https://i.ytimg.com/vi/${videoId}/default.jpg`;
                                    } else {
                                        console.log('❌ Todos os thumbnails falharam, escondendo imagem');
                                        e.target.style.display = 'none';
                                        // Mostrar um placeholder
                                        e.target.parentElement.innerHTML += `
                                            <div class="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                                <div class="text-white text-center">
                                                    <div class="text-4xl mb-2">📺</div>
                                                    <div>Vídeo disponível</div>
                                                </div>
                                            </div>
                                        `;
                                    }
                                }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 lg:p-6 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
                                    <svg className="w-8 h-8 lg:w-12 lg:h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                    </svg>
                                </div>
                            </div>
                            <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                                </svg>
                                YouTube
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
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
                        aria-label={`Assistir ${videoTitle} no YouTube`}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                        <span className="font-medium">Ver no YouTube</span>
                    </a>
                </div>
                
                <link rel="preload" as="image" href={thumbnailUrl} />
            </div>
        </>
    );
}
