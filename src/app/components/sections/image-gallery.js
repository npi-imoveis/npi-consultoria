// src/app/components/sections/image-gallery.js - CLS ZERO SOLUTION
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { photoSorter } from "@/app/utils/photoSorter";

// 🚀 SHARE COMPONENT: CLS-safe loading com skeleton perfeito
import dynamic from 'next/dynamic';
const Share = dynamic(() => import("../ui/share").then(mod => ({ default: mod.Share })), {
  ssr: false,
  loading: () => (
    <div 
      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 bg-opacity-60 rounded-lg"
      style={{ 
        width: '120px', 
        height: '40px',
        contain: 'layout size style',
        transform: 'translate3d(0, 0, 0)'
      }}
    >
      <div 
        className="rounded animate-pulse bg-gray-300"
        style={{ width: '16px', height: '16px' }}
      />
      <div 
        className="rounded animate-pulse bg-gray-300"
        style={{ width: '70px', height: '12px' }}
      />
    </div>
  )
});

// 🚀 HOOK: Mobile detection com stability
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 100);
    };
    
    window.addEventListener("resize", handleResize, { passive: true });
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return { isMobile, isHydrated };
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
  const [loadedImages, setLoadedImages] = useState(new Set());
  const [isComponentReady, setIsComponentReady] = useState(false);
  const { isMobile, isHydrated } = useIsMobile();

  const isImovelMode = !!imovel;
  
  // 🔧 PROCESSED DATA: Stable memoization
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

  // 🔧 IMAGES: Stable processing
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

  // 🔧 HANDLERS: Optimized callbacks
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

  const handleImageLoad = useCallback((imageId) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  }, []);

  // 🚀 CRITICAL: Component ready state
  useEffect(() => {
    if (isHydrated && images.length > 0) {
      // Small delay to ensure all layout calculations are done
      const timer = setTimeout(() => setIsComponentReady(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isHydrated, images.length]);

  // 🚀 PRELOAD: First image optimization
  useEffect(() => {
    if (images[0]?.Foto && isComponentReady) {
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
  }, [images, isComponentReady]);

  // 🚀 KEYBOARD: Modal navigation
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

  // 🔧 LOADING STATE: Dimensions absolutely fixed
  if (!isComponentReady || !processedData.titulo || images.length === 0) {
    const height = layout === "single" ? 
      (isMobile ? '340px' : '400px') : 
      (isMobile ? '340px' : '380px');

    return (
      <div 
        className="w-full relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center"
        style={{ 
          height,
          width: '100%',
          contain: 'layout size style',
          minHeight: height,
          maxHeight: height
        }}
        role="img"
        aria-label="Carregando galeria de imagens"
      >
        <div 
          className="flex flex-col items-center justify-center"
          style={{ 
            width: '200px', 
            height: '100px',
            contain: 'layout size'
          }}
        >
          <div 
            className="border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"
            style={{ width: '32px', height: '32px' }}
          />
          <span 
            className="text-gray-600 text-sm font-medium text-center"
            style={{ 
              width: '160px', 
              height: '20px',
              lineHeight: '20px'
            }}
          >
            Carregando galeria...
          </span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 🔧 CRITICAL CSS: Ultra-specific containment */}
      <style jsx>{`
        .gallery-root {
          contain: layout size style paint;
          position: relative;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
        }
        .image-wrapper {
          contain: layout size;
          position: relative;
          transform: translate3d(0, 0, 0);
          overflow: hidden;
        }
        .badge-fixed {
          contain: layout size;
          position: absolute;
          transform: translate3d(0, 0, 0);
          pointer-events: none;
        }
        .loading-placeholder {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          contain: layout size;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        
        /* Mobile fixed dimensions */
        @media (max-width: 768px) {
          .mobile-height { height: 340px !important; }
          .badge-mobile-tl { top: 12px; left: 12px; width: 80px; height: 24px; }
          .badge-mobile-tr { top: 12px; right: 12px; width: 50px; height: 28px; }
          .badge-mobile-cta { bottom: 12px; left: 50%; transform: translateX(-50%); width: 200px; height: 32px; }
        }
        
        /* Desktop fixed dimensions */
        @media (min-width: 769px) {
          .desktop-height { height: 380px !important; }
          .desktop-single-height { height: 400px !important; }
          .badge-desktop-tl { top: 16px; left: 16px; width: 80px; height: 24px; }
          .badge-desktop-tr { top: 16px; right: 16px; width: 60px; height: 24px; }
          .badge-thumb { top: 8px; left: 8px; width: 20px; height: 20px; }
        }
      `}</style>

      {/* 🎨 MAIN LAYOUT */}
      {layout === "single" ? (
        <div 
          className={`gallery-root w-full cursor-pointer relative rounded-lg ${
            isMobile ? 'mobile-height' : 'desktop-single-height'
          }`}
          style={{ 
            contain: 'layout size style',
            aspectRatio: isMobile ? '1/1' : '5/4'
          }}
          onClick={() => openModal()}
          role="button"
          tabIndex={0}
          aria-label={`Ver galeria completa de ${processedData.titulo}`}
        >
          <SingleImageView 
            image={images[0]}
            titulo={processedData.titulo}
            totalImages={images.length}
            isMobile={isMobile}
            isLoaded={loadedImages.has('main-0')}
            onLoad={() => handleImageLoad('main-0')}
          />
        </div>
      ) : (
        <div 
          className={`gallery-root w-full ${
            isMobile ? 'mobile-height' : 'desktop-height grid grid-cols-1 md:grid-cols-2 gap-1'
          }`}
          style={{ contain: 'layout size style' }}
        >
          {isMobile ? (
            <SingleImageView 
              image={images[0]}
              titulo={processedData.titulo}
              totalImages={images.length}
              isMobile={true}
              isLoaded={loadedImages.has('main-0')}
              onLoad={() => handleImageLoad('main-0')}
              showCounter={true}
              showCTA={images.length > 1}
              onOpenModal={() => openModal()}
            />
          ) : (
            <>
              {/* Desktop main image */}
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
                <SingleImageView 
                  image={images[0]}
                  titulo={processedData.titulo}
                  totalImages={images.length}
                  isMobile={false}
                  isLoaded={loadedImages.has('main-0')}
                  onLoad={() => handleImageLoad('main-0')}
                />
              </div>

              {/* Desktop thumbnail grid */}
              <div 
                className="col-span-1 grid grid-cols-2 grid-rows-2 gap-1"
                style={{ 
                  contain: 'layout size'
                }}
              >
                {images.slice(1, 5).map((image, index) => {
                  const globalIndex = index + 1;
                  const isLastThumb = index === 3;
                  return (
                    <ThumbnailImage 
                      key={image.Codigo || globalIndex}
                      image={image}
                      titulo={processedData.titulo}
                      imageIndex={globalIndex}
                      totalImages={images.length}
                      isLastThumb={isLastThumb}
                      showMoreCount={images.length - 5}
                      isLoaded={loadedImages.has(`thumb-${globalIndex}`)}
                      onLoad={() => handleImageLoad(`thumb-${globalIndex}`)}
                      onOpenModal={() => openModal()}
                    />
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* 🖼️ MODAL */}
      {isModalOpen && (
        <ImageModal 
          isOpen={isModalOpen}
          images={images}
          selectedIndex={selectedIndex}
          processedData={processedData}
          isImovelMode={isImovelMode}
          imovel={imovel}
          onClose={closeModal}
          onNext={goNext}
          onPrev={goPrev}
          onSelectIndex={setSelectedIndex}
          loadedImages={loadedImages}
          onImageLoad={handleImageLoad}
        />
      )}
    </>
  );
}

// 🔧 COMPONENT: Single Image View
function SingleImageView({ 
  image, 
  titulo, 
  totalImages, 
  isMobile, 
  isLoaded, 
  onLoad,
  showCounter = false,
  showCTA = false,
  onOpenModal
}) {
  return (
    <div 
      className="image-wrapper w-full h-full rounded-lg"
      style={{ contain: 'layout size' }}
      onClick={onOpenModal}
    >
      {/* Loading placeholder */}
      {!isLoaded && (
        <div 
          className="loading-placeholder absolute inset-0 w-full h-full rounded-lg"
          style={{ contain: 'layout size' }}
        />
      )}
      
      {/* Main image */}
      <Image
        src={image.Foto}
        alt={`${titulo} - foto principal`}
        title={titulo}
        fill
        sizes={isMobile ? "100vw" : "50vw"}
        placeholder="empty"
        loading="eager"
        priority={true}
        quality={isMobile ? 70 : 75}
        onLoad={onLoad}
        className="object-cover"
        style={{ 
          objectFit: 'cover',
          transform: 'translate3d(0, 0, 0)'
        }}
      />

      {/* Destaque badge */}
      <div 
        className={`badge-fixed ${
          isMobile ? 'badge-mobile-tl' : 'badge-desktop-tl'
        }`}
      >
        {image.Destaque === "Sim" && (
          <div className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg w-full h-full flex items-center justify-center">
            ⭐ DESTAQUE
          </div>
        )}
      </div>

      {/* Count badge */}
      <div 
        className={`badge-fixed bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg flex items-center justify-center ${
          isMobile ? 'badge-mobile-tr' : 'badge-desktop-tr'
        }`}
      >
        {showCounter ? `1 / ${totalImages}` : `${totalImages} foto${totalImages > 1 ? 's' : ''}`}
      </div>

      {/* Mobile CTA */}
      {showCTA && (
        <div 
          className="badge-fixed bg-white bg-opacity-90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg flex items-center justify-center badge-mobile-cta"
        >
          Toque para ver as {totalImages} fotos
        </div>
      )}
    </div>
  );
}

// 🔧 COMPONENT: Thumbnail Image
function ThumbnailImage({ 
  image, 
  titulo, 
  imageIndex, 
  totalImages,
  isLastThumb, 
  showMoreCount, 
  isLoaded, 
  onLoad, 
  onOpenModal 
}) {
  return (
    <div
      className="relative overflow-hidden cursor-pointer rounded-lg"
      style={{ 
        contain: 'layout size',
        aspectRatio: '1/1'
      }}
      onClick={onOpenModal}
      role="button"
      tabIndex={0}
      aria-label={`Ver galeria completa - imagem ${imageIndex + 1}`}
    >
      <div 
        className="image-wrapper w-full h-full"
        style={{ contain: 'layout size' }}
      >
        {/* Thumbnail loading placeholder */}
        {!isLoaded && (
          <div 
            className="loading-placeholder absolute inset-0 w-full h-full rounded-lg"
            style={{ contain: 'layout size' }}
          />
        )}
        
        <Image
          src={image.Foto}
          alt={`${titulo} - imagem ${imageIndex + 1}`}
          title={`${titulo} - imagem ${imageIndex + 1}`}
          fill
          sizes="25vw"
          placeholder="empty"
          loading="lazy"
          priority={false}
          quality={60}
          onLoad={onLoad}
          className="object-cover"
          style={{ 
            objectFit: 'cover',
            transform: 'translate3d(0, 0, 0)'
          }}
        />
      </div>
      
      {/* Thumbnail destaque badge */}
      <div className="badge-fixed badge-thumb">
        {image.Destaque === "Sim" && (
          <div className="bg-gray-900 text-white text-xs font-bold rounded w-full h-full flex items-center justify-center">
            ⭐
          </div>
        )}
      </div>
      
      {/* More photos overlay */}
      {isLastThumb && showMoreCount > 0 && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center rounded-lg"
          style={{ contain: 'layout size' }}
        >
          <button
            className="border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
            style={{ 
              width: '90px', 
              height: '32px',
              fontSize: '14px',
              contain: 'layout size'
            }}
            aria-label={`Ver mais ${showMoreCount} fotos`}
          >
            +{showMoreCount}
          </button>
        </div>
      )}
    </div>
  );
}

// 🔧 COMPONENT: Image Modal
function ImageModal({ 
  isOpen, 
  images, 
  selectedIndex, 
  processedData, 
  isImovelMode, 
  imovel,
  onClose, 
  onNext, 
  onPrev, 
  onSelectIndex,
  loadedImages,
  onImageLoad
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-auto"
      style={{ contain: 'layout style' }}
    >
      {/* Fixed header */}
      <div 
        className="sticky top-0 z-10 flex justify-between gap-4 p-5 pt-28 mt-6 md:mt-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent backdrop-blur-sm"
        style={{ 
          height: '80px',
          contain: 'layout size'
        }}
      >
        <button 
          onClick={onClose} 
          aria-label="Fechar galeria" 
          className="text-white hover:text-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg p-1"
          style={{ 
            width: '40px', 
            height: '40px',
            contain: 'layout size'
          }}
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
        <div 
          className="flex items-center justify-center min-h-screen p-4 relative"
          style={{ contain: 'layout' }}
        >
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
            style={{ transform: 'translate3d(0, 0, 0)' }}
          />

          {/* Counter */}
          <div 
            className="absolute bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-20 flex items-center justify-center"
            style={{ 
              top: '96px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100px',
              height: '28px',
              contain: 'layout size'
            }}
          >
            {selectedIndex + 1} / {images.length}
            {images[selectedIndex].Destaque === "Sim" && " ⭐"}
          </div>

          {/* Navigation buttons */}
          <button
            onClick={onPrev}
            className="absolute text-white text-4xl hover:bg-black hover:bg-opacity-50 rounded-full transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center justify-center"
            style={{ 
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '60px',
              height: '60px',
              contain: 'layout size'
            }}
            aria-label="Imagem anterior"
          >
            &#10094;
          </button>
          <button
            onClick={onNext}
            className="absolute text-white text-4xl hover:bg-black hover:bg-opacity-50 rounded-full transition-colors z-20 focus:outline-none focus:ring-2 focus:ring-white/50 flex items-center justify-center"
            style={{ 
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '60px',
              height: '60px',
              contain: 'layout size'
            }}
            aria-label="Próxima imagem"
          >
            &#10095;
          </button>
        </div>
      ) : (
        // Grid view
        <div 
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
          style={{ contain: 'layout size' }}
        >
          {images.map((image, idx) => (
            <div
              key={image.Codigo || idx}
              onClick={() => onSelectIndex(idx)}
              className="relative cursor-pointer overflow-hidden border-2 border-transparent hover:border-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
              style={{ 
                aspectRatio: '4/3',
                contain: 'layout size'
              }}
              role="button"
              tabIndex={0}
              aria-label={`Ver imagem ${idx + 1} de ${images.length}`}
            >
              {/* Modal grid skeleton */}
              {!loadedImages.has(`modal-${idx}`) && (
                <div 
                  className="loading-placeholder absolute inset-0 w-full h-full rounded-lg"
                  style={{ contain: 'layout size' }}
                />
              )}
              
              <Image
                src={image.Foto}
                alt={`${processedData.titulo} - miniatura ${idx + 1}`}
                title={`${processedData.titulo} - imagem ${idx + 1}`}
                fill
                sizes="25vw"
                placeholder="empty"
                loading="lazy"
                quality={65}
                onLoad={() => onImageLoad(`modal-${idx}`)}
                className="object-cover"
                style={{ 
                  objectFit: 'cover',
                  transform: 'translate3d(0, 0, 0)'
                }}
              />
              
              {/* Modal badges with fixed positions */}
              <div 
                className="absolute bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center justify-center"
                style={{ 
                  bottom: '8px',
                  right: '8px',
                  width: '30px',
                  height: '20px',
                  contain: 'layout size'
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
                    height: '24px',
                    contain: 'layout size'
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
  );
}
