// src/app/components/sections/image-gallery.js - CLS ZERO + LCP OTIMIZADO
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { photoSorter } from "@/app/utils/photoSorter";

// 🚀 LAZY LOAD: Share component sem blocking
import dynamic from 'next/dynamic';
const Share = dynamic(() => import("../ui/share").then(mod => ({ default: mod.Share })), {
  ssr: false,
  loading: () => null // 🔧 Sem loading state para evitar CLS
});

// 🚀 HOOK ULTRA-OTIMIZADO
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    
    let ticking = false;
    const throttledCheck = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          check();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener("resize", throttledCheck, { passive: true });
    return () => window.removeEventListener("resize", throttledCheck);
  }, []);

  return isMobile;
}

export function ImageGallery({ 
  imovel,
  fotos, 
  title,
  shareUrl,
  shareTitle,
  layout = "grid"
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const isMobile = useIsMobile();

  const isImovelMode = !!imovel;
  
  const processedData = useMemo(() => {
    if (isImovelMode) {
      return {
        fotos: imovel?.Foto || [],
        titulo: imovel?.Empreendimento || '',
        codigo: imovel?.Codigo || '',
        urlShare: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel?.Codigo}/${formatterSlug(imovel?.Empreendimento || '')}`,
        tituloShare: `Confira este imóvel: ${imovel?.Empreendimento}`
      };
    } else {
      return {
        fotos: fotos || [],
        titulo: title || '',
        codigo: 'condominio',
        urlShare: shareUrl || '',
        tituloShare: shareTitle || `Confira as fotos: ${title}`
      };
    }
  }, [imovel?.Foto, imovel?.Empreendimento, imovel?.Codigo, fotos, title, shareUrl, shareTitle, isImovelMode]);

  const images = useMemo(() => {
    if (!Array.isArray(processedData.fotos) || processedData.fotos.length === 0) {
      return [];
    }

    try {
      const fotosLimpas = processedData.fotos.map((foto, index) => {
        const { Ordem, ordem, ORDEM, ...fotoSemOrdem } = foto;
        return {
          ...fotoSemOrdem,
          Codigo: `${processedData.codigo}-foto-${index}`,
        };
      });

      return photoSorter.ordenarFotos(fotosLimpas, processedData.codigo);
    } catch (error) {
      console.error('❌ GALERIA: Erro ao processar imagens:', error);
      return [...processedData.fotos].map((foto, index) => ({
        ...foto,
        Codigo: `${processedData.codigo}-foto-${index}`,
      }));
    }
  }, [processedData.fotos, processedData.codigo]);

  const openModal = useCallback((index = null) => {
    setIsModalOpen(true);
    setSelectedIndex(index);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedIndex(null);
  }, []);

  const goNext = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev + 1) % images.length);
    }
  }, [selectedIndex, images.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  }, [selectedIndex, images.length]);

  const handleImageLoad = useCallback(() => {
    setFirstImageLoaded(true);
  }, []);

  // 🚀 PRELOAD CRÍTICO OTIMIZADO
  useEffect(() => {
    if (images[0]?.Foto) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = images[0].Foto;
      link.fetchPriority = 'high';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
      
      return () => {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      };
    }
  }, [images]);

  // 🚀 KEYBOARD NAVIGATION
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      switch (e.key) {
        case 'Escape':
          closeModal();
          break;
        case 'ArrowLeft':
          goPrev();
          break;
        case 'ArrowRight':
          goNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal, goPrev, goNext]);

  if (!processedData.titulo || images.length === 0) {
    return (
      <div 
        className="w-full relative bg-gray-100 rounded-lg overflow-hidden"
        style={{ 
          height: '380px', // 🔧 CLS FIX: Altura fixa
          contain: 'layout style' // 🔧 Layout containment
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <span className="text-gray-600 text-sm font-medium">Carregando galeria...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 🔧 CRITICAL CSS para eliminar CLS */}
      <style jsx>{`
        .gallery-container {
          contain: layout style paint;
          transform: translateZ(0);
          will-change: auto;
        }
        .image-container {
          contain: layout;
          transform: translateZ(0);
        }
        .badge-placeholder {
          width: 80px;
          height: 24px;
          contain: layout;
        }
        .count-badge {
          width: 60px;
          height: 24px;
          contain: layout;
        }
      `}</style>

      {/* 🎨 LAYOUT COM DIMENSÕES FIXAS */}
      {layout === "single" ? (
        <div 
          className="gallery-container w-full cursor-pointer relative overflow-hidden rounded-lg"
          style={{ 
            width: '100%',
            height: '400px', // 🔧 CLS FIX: Altura fixa
            contain: 'layout style'
          }}
          onClick={() => openModal()}
          role="button"
          tabIndex={0}
          aria-label={`Ver galeria completa de ${processedData.titulo}`}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              openModal();
            }
          }}
        >
          <div 
            className="image-container w-full h-full"
            style={{ contain: 'layout' }}
          >
            <Image
              src={images[0].Foto}
              alt={`${processedData.titulo} - foto principal`}
              title={processedData.titulo}
              fill
              sizes="100vw"
              placeholder="empty"
              loading="eager"
              priority={true}
              quality={75}
              onLoad={handleImageLoad}
              className="object-cover"
              style={{ 
                objectFit: 'cover'
              }}
            />
          </div>

          {/* 🔧 CLS FIX: Placeholder sempre presente */}
          <div 
            className="badge-placeholder absolute top-4 left-4 flex items-center"
            style={{ 
              width: '80px',
              height: '24px',
              contain: 'layout'
            }}
          >
            {images[0].Destaque === "Sim" && (
              <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg w-full h-full flex items-center justify-center">
                ⭐ DESTAQUE
              </div>
            )}
          </div>

          <div 
            className="count-badge absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center justify-center"
            style={{ 
              width: '60px',
              height: '24px',
              contain: 'layout'
            }}
          >
            {images.length} foto{images.length > 1 ? 's' : ''}
          </div>
        </div>
      ) : (
        <div 
          className={`gallery-container w-full ${isMobile ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-1'}`}
          style={{ contain: 'layout style' }}
        >
          
          {/* 📱 MOBILE */}
          {isMobile ? (
            <div 
              className="w-full cursor-pointer relative overflow-hidden rounded-lg"
              style={{ 
                width: '100%',
                height: '340px', // 🔧 CLS FIX: Altura fixa mobile
                contain: 'layout style'
              }}
              onClick={() => openModal()}
              role="button"
              tabIndex={0}
              aria-label={`Ver galeria de ${images.length} fotos de ${processedData.titulo}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openModal();
                }
              }}
            >
              <div 
                className="image-container w-full h-full"
                style={{ contain: 'layout' }}
              >
                <Image
                  src={images[0].Foto}
                  alt={`${processedData.titulo} - foto principal`}
                  title={processedData.titulo}
                  fill
                  sizes="100vw"
                  placeholder="empty"
                  loading="eager"
                  priority={true}
                  quality={70}
                  onLoad={handleImageLoad}
                  className="object-cover"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Badge mobile com placeholder */}
              <div 
                className="badge-placeholder absolute top-3 left-3 flex items-center"
                style={{ 
                  width: '80px',
                  height: '24px',
                  contain: 'layout'
                }}
              >
                {images[0].Destaque === "Sim" && (
                  <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg w-full h-full flex items-center justify-center">
                    ⭐ DESTAQUE
                  </div>
                )}
              </div>

              <div 
                className="absolute top-3 right-3 bg-black bg-opacity-80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center justify-center"
                style={{ 
                  width: '50px',
                  height: '28px',
                  contain: 'layout'
                }}
              >
                1 / {images.length}
              </div>

              {images.length > 1 && (
                <div 
                  className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center justify-center"
                  style={{ 
                    width: '200px',
                    height: '32px',
                    contain: 'layout'
                  }}
                >
                  Toque para ver as {images.length} fotos
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 💻 DESKTOP */}
              <div 
                className="col-span-1 cursor-pointer relative"
                style={{ 
                  width: '100%',
                  height: '380px', // 🔧 CLS FIX: Altura fixa
                  contain: 'layout style'
                }}
                onClick={() => openModal()}
                role="button"
                tabIndex={0}
                aria-label={`Ver galeria de ${images.length} fotos de ${processedData.titulo}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openModal();
                  }
                }}
              >
                <div 
                  className="image-container w-full h-full overflow-hidden rounded-lg"
                  style={{ contain: 'layout' }}
                >
                  <Image
                    src={images[0].Foto}
                    alt={`${processedData.titulo} - foto principal`}
                    title={processedData.titulo}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    placeholder="empty"
                    loading="eager"
                    priority={true}
                    quality={75}
                    onLoad={handleImageLoad}
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Badge desktop com placeholder */}
                <div 
                  className="badge-placeholder absolute top-4 left-4 flex items-center"
                  style={{ 
                    width: '80px',
                    height: '24px',
                    contain: 'layout'
                  }}
                >
                  {images[0].Destaque === "Sim" && (
                    <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg w-full h-full flex items-center justify-center">
                      ⭐ DESTAQUE
                    </div>
                  )}
                </div>

                <div 
                  className="count-badge absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center justify-center"
                  style={{ 
                    width: '60px',
                    height: '24px',
                    contain: 'layout'
                  }}
                >
                  {images.length} foto{images.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* GRID 2x2 COM DIMENSÕES FIXAS */}
              <div 
                className="col-span-1 grid grid-cols-2 grid-rows-2 gap-1"
                style={{ 
                  width: '100%',
                  height: '380px',
                  contain: 'layout'
                }}
              >
                {images.slice(1, 5).map((image, index) => {
                  const isLastImage = index === 3;
                  return (
                    <div
                      key={image.Codigo || index}
                      className="relative overflow-hidden cursor-pointer rounded-lg"
                      style={{ 
                        width: '100%',
                        height: '100%',
                        contain: 'layout'
                      }}
                      onClick={() => openModal()}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver galeria completa - imagem ${index + 2}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          openModal();
                        }
                      }}
                    >
                      <div 
                        className="image-container w-full h-full"
                        style={{ contain: 'layout' }}
                      >
                        <Image
                          src={image.Foto}
                          alt={`${processedData.titulo} - imagem ${index + 2}`}
                          title={`${processedData.titulo} - imagem ${index + 2}`}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          placeholder="empty"
                          loading="lazy"
                          priority={false}
                          quality={60}
                          className="object-cover"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      
                      {/* Badge thumbnails com placeholder */}
                      <div 
                        className="absolute top-2 left-2 flex items-center justify-center"
                        style={{ 
                          width: '20px',
                          height: '20px',
                          contain: 'layout'
                        }}
                      >
                        {image.Destaque === "Sim" && (
                          <div className="bg-gray-900 text-white text-xs font-bold rounded w-full h-full flex items-center justify-center">
                            ⭐
                          </div>
                        )}
                      </div>
                      
                      {isLastImage && images.length > 5 && (
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center rounded-lg"
                          style={{ contain: 'layout' }}
                        >
                          <button
                            className="border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
                            aria-label={`Ver mais ${images.length - 5} fotos`}
                          >
                            +{images.length - 5} fotos
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* 🖼️ MODAL OTIMIZADO */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-auto"
          style={{ contain: 'layout style' }}
        >
          <div className="sticky top-0 z-10 flex justify-between gap-4 p-5 pt-28 mt-6 md:mt-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm">
            <button 
              onClick={closeModal} 
              aria-label="Fechar galeria" 
              className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-1"
            >
              <ArrowLeft size={24} />
            </button>
            <Share
              primary
              url={processedData.urlShare}
              title={processedData.tituloShare}
              imovel={isImovelMode ? {
                Codigo: imovel.Codigo,
                Empreendimento: imovel.Empreendimento,
              } : undefined}
            />
          </div>

          {selectedIndex !== null ? (
            <div className="flex items-center justify-center min-h-screen p-4 relative">
              <Image
                src={images[selectedIndex].Foto}
                alt={`${processedData.titulo} - imagem ${selectedIndex + 1} de ${images.length}`}
                title={`${processedData.titulo} - imagem ${selectedIndex + 1} de ${images.length}`}
                width={900}
                height={600}
                sizes="100vw"
                placeholder="empty"
                loading="eager"
                quality={85}
                className="max-w-full max-h-screen object-contain"
              />

              <div className="absolute top-24 md:top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-20">
                {selectedIndex + 1} / {images.length}
                {images[selectedIndex].Destaque === "Sim" && " ⭐"}
              </div>

              <button
                onClick={goPrev}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-4xl px-2 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Imagem anterior"
              >
                &#10094;
              </button>
              <button
                onClick={goNext}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-4xl px-2 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Próxima imagem"
              >
                &#10095;
              </button>
            </div>
          ) : (
            <div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
              style={{ contain: 'layout' }}
            >
              {images.map((image, idx) => (
                <div
                  key={image.Codigo || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className="relative cursor-pointer overflow-hidden border-2 border-transparent hover:border-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  style={{ 
                    width: '100%',
                    aspectRatio: '4/3',
                    contain: 'layout'
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver imagem ${idx + 1} de ${images.length}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedIndex(idx);
                    }
                  }}
                >
                  <Image
                    src={image.Foto}
                    alt={`${processedData.titulo} - miniatura ${idx + 1}`}
                    title={`${processedData.titulo} - imagem ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    placeholder="empty"
                    loading="lazy"
                    quality={65}
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                  
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {idx + 1}
                  </div>
                  
                  {image.Destaque === "Sim" && (
                    <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded">
                      ⭐ DESTAQUE
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
