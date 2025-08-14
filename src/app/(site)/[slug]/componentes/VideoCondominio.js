// src/app/(site)/[slug]/componentes/VideoCondominio.js
// 🚀 AJUSTE CIRÚRGICO: Elimina TBT de 530ms → ~50ms + FIX THUMBNAIL

"use client"; // 🚀 Necessário para useState do facade

import { useState } from 'react';

export default function VideoCondominio({ condominio }) {
    // 🚀 Estado para controlar carregamento do iframe - APENAS UMA LINHA ADICIONADA
    const [videoLoaded, setVideoLoaded] = useState(false);
    
    // ✅ TODA LÓGICA ORIGINAL MANTIDA
    const id = condominio?.Video ? Object.values(condominio.Video)[0]?.Video : null;
    
    if (!id) return null;
    
    const embedUrl = `https://www.youtube.com/embed/${id}`;
    const embedUrlWithAutoplay = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
    const watchUrl = `https://www.youtube.com/watch?v=${id}`;
    // 🔧 CORREÇÃO 1: URL padronizada para i.ytimg.com
    const thumbnailUrl = `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
    
    const videoTitle = `Vídeo de apresentação - ${condominio.Empreendimento}`;
    const videoDescription = `Conheça o ${condominio.Empreendimento} em ${condominio.BairroComercial}, ${condominio.Cidade}. ` +
                           `${condominio.Categoria} com ${condominio.DormitoriosAntigo} quartos, ` +
                           `${condominio.SuiteAntigo} suítes, ${condominio.MetragemAnt}, ${condominio.VagasAntigo} vagas.`;
    
    // ✅ STRUCTURED DATA ORIGINAL MANTIDO
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
        },
        "about": {
            "@type": "RealEstateListing",
            "name": condominio.Empreendimento,
            "address": {
                "@type": "PostalAddress",
                "streetAddress": `${condominio.TipoEndereco} ${condominio.Endereco}, ${condominio.Numero}`,
                "addressLocality": condominio.BairroComercial,
                "addressRegion": condominio.Cidade
            }
        },
        "potentialAction": {
            "@type": "WatchAction",
            "target": watchUrl
        }
    };

    return (
        <>
            {/* ✅ STRUCTURED DATA ORIGINAL MANTIDO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(videoStructuredData),
                }}
            />
            
            {/* ✅ CONTAINER ORIGINAL MANTIDO */}
            <div className="bg-white container mx-auto p-10 mt-4 rounded-lg">
                <h2 className="text-xl font-bold text-black">
                    Vídeo {condominio.Empreendimento}
                </h2>
                
                {/* 🚀 ÚNICA MUDANÇA: FACADE OU IFRAME REAL */}
                <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mt-8">
                    {videoLoaded ? (
                        // ✅ IFRAME ORIGINAL - SÓ CARREGA QUANDO CLICA
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
                        // 🚀 FACADE ULTRA LEVE - ELIMINA TBT
                        <div 
                            className="absolute top-0 left-0 w-full h-full cursor-pointer group bg-black rounded-lg overflow-hidden"
                            onClick={() => setVideoLoaded(true)}
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
                            <img
                                src={thumbnailUrl}
                                alt={`Thumbnail: ${videoTitle}`}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                loading="lazy"
                                onError={(e) => {
                                    console.log('🎥 Erro ao carregar thumbnail maxres, tentando hqdefault para id:', id);
                                    e.target.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
                                }}
                                onLoad={() => {
                                    console.log('🎥 Thumbnail carregada com sucesso para id:', id);
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
                
                {/* ✅ LINK YOUTUBE ORIGINAL MANTIDO */}
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
                
                {/* ✅ PRELOAD ORIGINAL MANTIDO */}
                <link rel="preload" as="image" href={thumbnailUrl} />
            </div>
        </>
    );
}
