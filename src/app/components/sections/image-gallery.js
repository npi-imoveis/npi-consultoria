// src/app/components/sections/image-gallery.js - ORIGINAL + 95 PONTOS MOBILE
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { Share } from "../ui/share";
import { photoSorter } from "@/app/utils/photoSorter";

// 🚀 HOOK OTIMIZADO com debounce (ORIGINAL)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    
    // ✅ Check inicial sem layout shift
    check();
    
    // ✅ Debounced resize para performance
    let timeoutId;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(check, 150);
    };
    
    window.addEventListener("resize", debouncedCheck, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", debouncedCheck);
    };
  }, []);

  return isMobile;
}

export function ImageGallery({ 
  // Props para página de IMÓVEL
  imovel,
  
  // Props para página de CONDOMÍNIO 
  fotos, 
  title,
  shareUrl,
  shareTitle,

  // Layout da galeria
  layout = "grid" // "grid" ou "single"
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [firstImageLoaded, setFirstImageLoaded] = useState(false);
  const isMobile = useIsMobile();

  // 🎯 PROCESSAMENTO OTIMIZADO (ORIGINAL)
  const isImovelMode = !!imovel;
  
  // 🚀 DADOS PROCESSADOS - Memoized para performance (ORIGINAL)
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
  }, [imovel, fotos, title, shareUrl, shareTitle, isImovelMode]);

  // 🎯 IMAGENS PROCESSADAS - Otimizado (ORIGINAL)
  const images = useMemo(() => {
    if (!Array.isArray(processedData.fotos) || processedData.fotos.length === 0) {
      return [];
    }

    try {
      // ✅ LIMPEZA E ORDENAÇÃO OTIMIZADA
      const fotosLimpas = processedData.fotos.map(foto => {
        const { Ordem, ordem, ORDEM, ...fotoSemOrdem } = foto;
        return fotoSemOrdem;
      });

      const fotosOrdenadas = photoSorter.ordenarFotos(fotosLimpas, processedData.codigo);
      
      return fotosOrdenadas.map((foto, index) => ({
        ...foto,
        Codigo: `${processedData.codigo}-foto-${index}`,
      }));

    } catch (error) {
      console.error('❌ GALERIA: Erro ao processar imagens:', error);
      
      // Fallback seguro
      return [...processedData.fotos].map((foto, index) => ({
        ...foto,
        Codigo: `${processedData.codigo}-foto-${index}`,
      }));
    }
  }, [processedData]);

  // 🎯 HANDLERS OTIMIZADOS com useCallback (ORIGINAL)
  const openModal = useCallback((index = null) => {
    setIsModalOpen(true);
    setSelectedIndex(index); // null = grid de thumbnails, número = imagem específica
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

  // 🔧 ERROR HANDLERS para evitar imagem quebrada (ORIGINAL)
  const handleImageError = useCallback(() => {
    setImageLoadError(true);
    setFirstImageLoaded(true);
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoadError(false);
    setFirstImageLoaded(true);
  }, []);

  // 🚀 PRELOAD CRÍTICO - SÓ A OTIMIZAÇÃO QUE DEU 95 PONTOS
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

  // 🚀 KEYBOARD NAVIGATION - Otimizado (ORIGINAL)
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
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

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, closeModal, goPrev, goNext]);

  if (!processedData.titulo || images.length === 0) {
    return (
      <div className="w-full h-[380px] relative">
        <div className="w-full h-full overflow-hidden bg-gray-100 flex flex-col items-center justify-center rounded-lg">
          {/* 🎯 LOADING PLACEHOLDER */}
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <span className="text-gray-600 text-sm font-medium">Carregando galeria...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 🎨 LAYOUT ORIGINAL + MOBILE OTIMIZADO */}
      {layout === "single" ? (
        // LAYOUT SINGLE (ORIGINAL)
        <div 
          className="w-full h-full cursor-pointer relative overflow-hidden rounded-lg"
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
          <Image
            src={images[0].Foto}
            alt={`${processedData.titulo} - foto principal`}
            title={processedData.titulo}
            width={800}
            height={600}
            sizes="100vw"
            placeholder="empty"
            loading="eager"
            priority={true}
            fetchPriority="high"
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          />

          {/* Indicadores otimizados (ORIGINAL) */}
          {images[0].Destaque === "Sim" && (
            <div className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ⭐ DESTAQUE
            </div>
          )}

          <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            {images.length} foto{images.length > 1 ? 's' : ''}
          </div>
        </div>
      ) : (
        // 📱💻 LAYOUT RESPONSIVO (ORIGINAL + MOBILE OTIMIZADO)
        <div className={`w-full ${isMobile ? '' : 'grid grid-cols-1 md:grid-cols-2 gap-1'}`}>
          
          {/* 📱 MOBILE: SÓ A OTIMIZAÇÃO QUE DEU 95 PONTOS */}
          {isMobile ? (
            <div 
              className="w-full h-[65vh] sm:h-[60vh] min-h-[320px] max-h-[380px] cursor-pointer relative overflow-hidden rounded-lg"
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
              <Image
                src={images[0].Foto}
                alt={`${processedData.titulo} - foto principal`}
                title={processedData.titulo}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
                placeholder="empty"
                loading="eager"
                priority={true}
                fetchPriority="high"
                quality={70}
                onLoad={handleImageLoad}
                onError={handleImageError}
                className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
              />

              {/* Indicadores móveis (ORIGINAL) */}
              {images[0].Destaque === "Sim" && (
                <div className="absolute top-3 left-3 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                  ⭐ DESTAQUE
                </div>
              )}

              <div className="absolute top-3 right-3 bg-black bg-opacity-80 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium shadow-lg">
                1 / {images.length}
              </div>

              {images.length > 1 && (
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-sm text-black px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                  Toque para ver as {images.length} fotos
                </div>
              )}
            </div>
          ) : (
            // 💻 DESKTOP: EXATAMENTE ORIGINAL
            <>
              <div 
                className="col-span-1 h-[380px] cursor-pointer relative"
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
                {/* 🎯 LOADING OVERLAY DESKTOP (ORIGINAL) */}
                {!firstImageLoaded && (
                  <div className="absolute inset-0 bg-gray-50 flex flex-col items-center justify-center z-10 rounded-lg">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-2"></div>
                    <span className="text-gray-600 text-sm">Carregando...</span>
                  </div>
                )}
                
                <div className="w-full h-full overflow-hidden rounded-lg">
                  <Image
                    src={images[0].Foto}
                    alt={`${processedData.titulo} - foto principal`}
                    title={processedData.titulo}
                    width={760}
                    height={570}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    placeholder="empty"
                    loading="eager"
                    priority={true}
                    fetchPriority="high"
                    quality={70}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                  />
                </div>

                {/* Indicadores desktop (ORIGINAL) */}
                {images[0].Destaque === "Sim" && (
                  <div className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    ⭐ DESTAQUE
                  </div>
                )}

                <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                  {images.length} foto{images.length > 1 ? 's' : ''}
                </div>
              </div>

              {/* GRID 2x2 (ORIGINAL) */}
              <div className="col-span-1 grid grid-cols-2 grid-rows-2 gap-1 h-[380px]">
                {images.slice(1, 5).map((image, index) => {
                  const isLastImage = index === 3;
                  return (
                    <div
                      key={image.Codigo || index}
                      className="relative h-full overflow-hidden cursor-pointer rounded-lg"
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
                      <Image
                        src={image.Foto}
                        alt={`${processedData.titulo} - imagem ${index + 2}`}
                        title={`${processedData.titulo} - imagem ${index + 2}`}
                        width={420}
                        height={315}
                        sizes="(max-width: 768px) 50vw, 25vw"
                        placeholder="empty"
                        loading="lazy"
                        priority={false}
                        quality={60}
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                      />
                      
                      {/* Indicador de destaque nos thumbnails (ORIGINAL) */}
                      {image.Destaque === "Sim" && (
                        <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                          ⭐
                        </div>
                      )}
                      
                      {isLastImage && images.length > 5 && (
                        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center rounded-lg">
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

      {/* 🖼️ MODAL OTIMIZADO (ORIGINAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-auto">
          {/* Header fixo */}
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
                quality={70}
                className="max-w-full max-h-screen object-contain"
              />

              {/* Contador */}
              <div className="absolute top-24 md:top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-20">
                {selectedIndex + 1} / {images.length}
                {images[selectedIndex].Destaque === "Sim" && " ⭐"}
              </div>

              {/* Navegação */}
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
            // Grid de thumbnails otimizado (ORIGINAL)
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {images.map((image, idx) => (
                <div
                  key={image.Codigo || idx}
                  onClick={() => setSelectedIndex(idx)}
                  className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 cursor-pointer overflow-hidden border-2 border-transparent hover:border-white transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50"
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
                  />
                  
                  {/* Número da foto */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {idx + 1}
                  </div>
                  
                  {/* Indicador de destaque */}
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
