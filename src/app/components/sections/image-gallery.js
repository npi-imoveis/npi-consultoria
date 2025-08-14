// src/app/components/sections/image-gallery.js - CLS ZERO + LCP OPTIMIZED
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { photoSorter } from "@/app/utils/photoSorter";

// 🚀 SHARE: CLS-safe com skeleton mínimo
import dynamic from 'next/dynamic';
const Share = dynamic(() => import("../ui/share").then(mod => ({ default: mod.Share })), {
  ssr: false,
  loading: () => (
    <div 
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 bg-opacity-60 rounded-lg"
      style={{ width: '120px', height: '40px' }}
    >
      <div className="w-4 h-4 bg-gray-300 rounded animate-pulse" />
      <div className="w-16 h-3 bg-gray-300 rounded animate-pulse" />
    </div>
  )
});

// 🚀 MOBILE: Simple detection
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(check, 100);
    };
    
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
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
    }
    return {
      fotos: fotos || [],
      titulo: title || '',
      codigo: 'condominio',
      urlShare: shareUrl || '',
      tituloShare: shareTitle || `Confira as fotos: ${title}`
    };
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

  // 🚀 ULTRA-AGGRESSIVE LCP PRELOAD (immediate, no delays)
  useEffect(() => {
    if (images[0]?.Foto) {
      // Immediate preload - no waiting for component ready
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
  }, [images]); // Only depends on images, no delays

  // 🚀 KEYBOARD navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      e.preventDefault();
      switch (e.key) {
        case 'Escape': closeModal(); break;
        case 'ArrowLeft': goPrev(); break;
        case 'ArrowRight': goNext(); break;
      }
    };

    document.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal, goPrev, goNext]);

  // 🔧 SIMPLE loading state - no complex ready states
  if (!processedData.titulo || images.length === 0) {
    const height = layout === "single" ? 
      (isMobile ? '340px' : '400px') : 
      (isMobile ? '340px' : '380px');

    return (
      <div 
        className="w-full relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ 
          height,
          width: '100%',
          contain: 'layout size'
        }}
        role="img"
        aria-label="Carregando galeria"
      >
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* 🔧 MINIMAL critical CSS */}
      <style jsx>{`
        .gallery-root {
          contain: layout size style;
          transform: translate3d(0, 0, 0);
        }
        .image-wrapper {
          contain: layout size;
          transform: translate3d(0, 0, 0);
          overflow: hidden;
        }
        .badge-fixed {
          contain: layout size;
          position: absolute;
          transform: translate3d(0, 0, 0);
        }
        
        /* Fixed positions */
        .badge-tl { top: 12px; left: 12px; width: 80px; height: 24px; }
        .badge-tr { top: 12px; right: 12px; }
        .badge-tr-mobile { width: 50px; height: 28px; }
        .badge-tr-desktop { width: 60px; height: 24px; }
        .badge-cta { bottom: 12px; left: 50%; transform: translateX(-50%); width: 200px; height: 32px; }
        .badge-thumb { top: 8px; left: 8px; width: 20px; height: 20px; }
        
        @media (min-width: 769px) {
          .badge-tl { top: 16px; left: 16px; }
          .badge-tr { top: 16px; right: 16px; }
        }
      `}</style>

      {/* 🎨 MAIN LAYOUT */}
      {layout === "single" ? (
        <div 
          className={`gallery-root w-full cursor-pointer relative rounded-lg`}
          style={{ 
            height: isMobile ? '340px' : '400px',
            contain: 'layout size style',
            aspectRatio: isMobile ? '1/1' : '5/4'
          }}
          onClick={() => openModal()}
          role="button"
          tabIndex={0}
          aria-label={`Ver galeria completa de ${processedData.titulo}`}
        >
          <div 
            className="image-wrapper w-full h-full rounded-lg"
            style={{ contain: 'layout size' }}
          >
            {/* 🚀 LCP IMAGE: Maximum priority, minimal barriers */}
            <Image
              src={images[0].Foto}
              alt={`${processedData.titulo} - foto principal`}
              title={processedData.titulo}
              fill
              sizes={isMobile ? "100vw" : "50vw"}
              placeholder="empty"
              loading="eager"
              priority={true}
              fetchPriority="high"
              quality={isMobile ? 70 : 75}
              onLoad={handleImageLoad}
              className="object-cover"
              style={{ objectFit: 'cover' }}
            />
          </div>

          {/* Fixed badges */}
          <div className="badge-fixed badge-tl">
            {images[0].Destaque === "Sim" && (
              <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg w-full h-full flex items-center justify-center">
                ⭐ DESTAQUE
              </div>
            )}
          </div>

          <div className={`badge-fixed badge-tr bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center justify-center ${isMobile ? 'badge-tr-mobile' : 'badge-tr-desktop'}`}>
            {images.length} foto{images.length > 1 ? 's' : ''}
          </div>
        </div>
      ) : (
        <div 
          className={`gallery-root w-full ${!isMobile ? 'grid grid-cols-1 md:grid-cols-2 gap-1' : ''}`}
          style={{ 
            height: isMobile ? '340px' : '380px',
            contain: 'layout size style'
          }}
        >
          
          {/* 📱 MOBILE */}
          {isMobile ? (
            <div 
              className="w-full cursor-pointer relative overflow-hidden rounded-lg"
              style={{ 
                height: '340px',
                contain: 'layout size style',
                aspectRatio: '1/1'
              }}
              onClick={() => openModal()}
              role="button"
              tabIndex={0}
              aria-label={`Ver galeria de ${images.length} fotos de ${processedData.titulo}`}
            >
              <div className="image-wrapper w-full h-full">
                {/* 🚀 LCP IMAGE: Mobile optimized, maximum priority */}
                <Image
                  src={images[0].Foto}
                  alt={`${processedData.titulo} - foto principal`}
                  title={processedData.titulo}
                  fill
                  sizes="100vw"
                  placeholder="empty"
                  loading="eager"
                  priority={true}
                  fetchPriority="high"
                  quality={70}
                  onLoad={handleImageLoad}
                  className="object-cover"
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Mobile badges */}
              <div className="badge-fixed badge-tl">
                {images[0].Destaque === "Sim" && (
                  <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg w-full h-full flex items-center justify-center">
                    ⭐ DESTAQUE
                  </div>
                )}
              </div>

              <div className="badge-fixed badge-tr badge-tr-mobile bg-black bg-opacity-80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg flex items-center justify-center">
                1/{images.length}
              </div>

              {images.length > 1 && (
                <div className="badge-fixed badge-cta bg-white bg-opacity-90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center justify-center">
                  Toque para ver as {images.length} fotos
                </div>
              )}
            </div>
          ) : (
            <>
              {/* 💻 DESKTOP MAIN */}
              <div 
                className="col-span-1 cursor-pointer relative"
                style={{ 
                  contain: 'layout size',
                  aspectRatio: '4/3'
                }}
                onClick={() => openModal()}
                role="button"
                tabIndex={0}
                aria-label={`Ver galeria de ${images.length} fotos de ${processedData.titulo}`}
              >
                <div className="image-wrapper w-full h-full overflow-hidden rounded-lg">
                  {/* 🚀 LCP IMAGE: Desktop main image */}
                  <Image
                    src={images[0].Foto}
                    alt={`${processedData.titulo} - foto principal`}
                    title={processedData.titulo}
                    fill
                    sizes="50vw"
                    placeholder="empty"
                    loading="eager"
                    priority={true}
                    fetchPriority="high"
                    quality={75}
                    onLoad={handleImageLoad}
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                </div>

                {/* Desktop badges */}
                <div className="badge-fixed badge-tl">
                  {images[0].Destaque === "Sim" && (
                    <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg w-full h-full flex items-center justify-center">
                      ⭐ DESTAQUE
                    </div>
                  )}
                </div>

                <div className="badge-fixed badge-tr badge-tr-desktop bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center justify-center">
                  {images.length} foto{images.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* 💻 DESKTOP GRID */}
              <div 
                className="col-span-1 grid grid-cols-2 grid-rows-2 gap-1"
                style={{ contain: 'layout size' }}
              >
                {images.slice(1, 5).map((image, index) => {
                  const globalIndex = index + 1;
                  const isLastImage = index === 3;
                  return (
                    <div
                      key={image.Codigo || globalIndex}
                      className="relative overflow-hidden cursor-pointer rounded-lg"
                      style={{ 
                        contain: 'layout size',
                        aspectRatio: '1/1'
                      }}
                      onClick={() => openModal()}
                      role="button"
                      tabIndex={0}
                      aria-label={`Ver galeria completa - imagem ${globalIndex + 1}`}
                    >
                      <div className="image-wrapper w-full h-full">
                        <Image
                          src={image.Foto}
                          alt={`${processedData.titulo} - imagem ${globalIndex + 1}`}
                          title={`${processedData.titulo} - imagem ${globalIndex + 1}`}
                          fill
                          sizes="25vw"
                          placeholder="empty"
                          loading="lazy"
                          priority={false}
                          quality={60}
                          className="object-cover"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      
                      {/* Thumbnail badges */}
                      <div className="badge-fixed badge-thumb">
                        {image.Destaque === "Sim" && (
                          <div className="bg-gray-900 text-white text-xs font-bold rounded w-full h-full flex items-center justify-center">
                            ⭐
                          </div>
                        )}
                      </div>
                      
                      {isLastImage && images.length > 5 && (
                        <div 
                          className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center rounded-lg"
                          style={{ contain: 'layout size' }}
                        >
                          <button
                            className="border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
                            style={{ width: '90px', height: '32px' }}
                            aria-label={`Ver mais ${images.length - 5} fotos`}
                          >
                            +{images.length - 5}
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

      {/* 🖼️ MODAL */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-auto"
          style={{ contain: 'layout style' }}
        >
          {/* Modal header */}
          <div 
            className="sticky top-0 z-10 flex justify-between gap-4 p-5 pt-28 mt-6 md:mt-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm"
            style={{ height: '80px' }}
          >
            <button 
              onClick={closeModal} 
              aria-label="Fechar galeria" 
              className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-1"
              style={{ width: '40px', height: '40px' }}
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
            // Single image view
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

              {/* Counter */}
              <div 
                className="absolute bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-20 flex items-center justify-center"
                style={{ 
                  top: '96px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '100px',
                  height: '28px'
                }}
              >
                {selectedIndex + 1} / {images.length}
                {images[selectedIndex].Destaque === "Sim" && " ⭐"}
              </div>

              {/* Navigation */}
              <button
                onClick={goPrev}
                className="absolute text-white text-4xl hover:bg-black hover:bg-opacity-50 rounded-full transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center justify-center"
                style={{ 
                  left: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '60px',
                  height: '60px'
                }}
                aria-label="Imagem anterior"
              >
                &#10094;
              </button>
              <button
                onClick={goNext}
                className="absolute text-white text-4xl hover:bg-black hover:bg-opacity-50 rounded-full transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center justify-center"
                style={{ 
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '60px',
                  height: '60px'
                }}
                aria-label="Próxima imagem"
              >
                &#10095;
              </button>
            </div>
          ) : (
            // Grid view
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {images.map((image, idx) => (
                <div
                  key={image.Codigo || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className="relative cursor-pointer overflow-hidden border-2 border-transparent hover:border-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
                  style={{ aspectRatio: '4/3' }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Ver imagem ${idx + 1} de ${images.length}`}
                >
                  <Image
                    src={image.Foto}
                    alt={`${processedData.titulo} - miniatura ${idx + 1}`}
                    title={`${processedData.titulo} - imagem ${idx + 1}`}
                    fill
                    sizes="25vw"
                    placeholder="empty"
                    loading="lazy"
                    quality={65}
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                  
                  {/* Modal grid badges */}
                  <div 
                    className="absolute bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center justify-center"
                    style={{ 
                      bottom: '8px',
                      right: '8px',
                      width: '30px',
                      height: '20px'
                    }}
                  >
                    {idx + 1}
                  </div>
                  
                  {image.Destaque === "Sim" && (
                    <div 
                      className="absolute bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded flex items-center justify-center"
                      style={{ 
                        top: '8px',
                        left: '8px',
                        width: '80px',
                        height: '24px'
                      }}
                    >
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
