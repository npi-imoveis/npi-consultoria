// CondominioGallery.jsx - VERSÃO VISUAL APRIMORADA
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { Share } from "@/app/components/ui/share";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return isMobile;
}

export default function CondominioGallery({ fotos, title }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const isMobile = useIsMobile();

  if (!Array.isArray(fotos) || fotos.length === 0) {
    return (
      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-lg">
        <span className="text-gray-500">📸 Nenhuma imagem disponível</span>
      </div>
    );
  }

  const openModal = (index = 0) => {
    setIsModalOpen(true);
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIndex(null);
  };

  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev + 1) % fotos.length);
    }
  };

  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
    }
  };

  // Verificar se a primeira foto é destaque
  const primeiraFotoEDestaque = fotos[0]?.Destaque === "Sim";

  return (
    <>
      {/* GRID PRINCIPAL DA GALERIA */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-1">
        
        {/* FOTO PRINCIPAL */}
        <div 
          className="relative h-full min-h-[400px] cursor-pointer group overflow-hidden rounded-l-lg md:rounded-l-lg md:rounded-r-none rounded-r-lg"
          onClick={() => openModal(0)}
        >
          <Image
            src={fotos[0].Foto}
            alt={`${title} - Imagem principal`}
            title={title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
          
          {/* OVERLAY DE INFORMAÇÕES */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent">
            
            {/* FOTO DESTAQUE - Canto superior esquerdo */}
            {primeiraFotoEDestaque && (
              <div className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                ⭐ DESTAQUE
              </div>
            )}

            {/* CONTADOR DE FOTOS - Canto superior direito */}
            <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full shadow-lg">
              📸 {fotos.length} foto{fotos.length > 1 ? 's' : ''}
            </div>

            {/* BOTÃO VER GALERIA - Centro/Inferior em mobile */}
            {isMobile ? (
              <div className="absolute bottom-4 left-4 right-4">
                <button className="w-full bg-white/90 backdrop-blur-sm text-black font-medium py-3 px-4 rounded-lg shadow-lg hover:bg-white transition-all">
                  📱 Ver todas as fotos
                </button>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="bg-white/90 backdrop-blur-sm text-black font-medium py-2 px-4 rounded-lg shadow-lg hover:bg-white transition-all">
                  🖼️ Abrir galeria
                </button>
              </div>
            )}
          </div>
        </div>

        {/* GRID DE THUMBNAILS - Apenas no desktop */}
        {!isMobile && fotos.length > 1 && (
          <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
            {fotos.slice(1, 5).map((foto, index) => {
              const actualIndex = index + 1;
              const isLastThumbnail = index === 3;
              const remainingPhotos = fotos.length - 5;
              const fotoEDestaque = foto.Destaque === "Sim";

              return (
                <div
                  key={actualIndex}
                  className="relative cursor-pointer group overflow-hidden"
                  onClick={() => openModal(actualIndex)}
                >
                  <Image
                    src={foto.Foto}
                    alt={`${title} - Imagem ${actualIndex + 1}`}
                    fill
                    sizes="25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* INDICADOR DE DESTAQUE nos thumbnails */}
                  {fotoEDestaque && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow">
                      ⭐
                    </div>
                  )}

                  {/* OVERLAY DE MAIS FOTOS - Último thumbnail */}
                  {isLastThumbnail && remainingPhotos > 0 && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <span className="text-2xl font-bold">+{remainingPhotos}</span>
                      <span className="text-xs">mais fotos</span>
                    </div>
                  )}

                  {/* HOVER OVERLAY */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL DA GALERIA COMPLETA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto">
          
          {/* HEADER DO MODAL */}
          <div className="sticky top-0 left-0 right-0 z-60 bg-gradient-to-b from-black/90 to-black/20 p-4 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <button 
                onClick={closeModal} 
                className="text-white hover:text-gray-300 transition-colors p-2 flex items-center gap-2"
                aria-label="Voltar para página do condomínio"
              >
                <ArrowLeft size={24} />
                <span className="text-sm">Voltar</span>
              </button>
              
              <div className="text-white text-center">
                <h3 className="font-semibold text-lg">{title}</h3>
                {selectedIndex !== null && (
                  <div className="flex items-center justify-center gap-3 mt-2">
                    {/* CONTADOR ATUAL */}
                    <span className="text-sm bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full">
                      {selectedIndex + 1} / {fotos.length}
                    </span>
                    
                    {/* INDICADOR DE DESTAQUE */}
                    {fotos[selectedIndex]?.Destaque === "Sim" && (
                      <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">
                        ⭐ DESTAQUE
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Share
                  primary
                  url={`${process.env.NEXT_PUBLIC_SITE_URL || ''}`}
                  title={`Confira as fotos: ${title}`}
                />
                
                {/* BOTÃO FECHAR GALERIA */}
                <button 
                  onClick={closeModal} 
                  className="text-white hover:text-red-400 transition-colors p-2 rounded-full hover:bg-red-500/20"
                  aria-label="Fechar galeria"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
          </div>

          {selectedIndex !== null ? (
            // VISUALIZAÇÃO INDIVIDUAL - COM SCROLL
            <div className="min-h-screen pb-4">
              <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
                <div className="relative w-full max-w-6xl">
                  <Image
                    src={fotos[selectedIndex].Foto}
                    alt={`${title} - Imagem ${selectedIndex + 1}`}
                    width={1200}
                    height={800}
                    className="w-full h-auto object-contain max-h-[90vh]"
                    priority
                  />

                  {/* CONTROLES DE NAVEGAÇÃO */}
                  {fotos.length > 1 && (
                    <>
                      <button
                        onClick={goPrev}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-3xl p-3 rounded-full bg-black/60 hover:bg-black/80 transition-all backdrop-blur-sm"
                        aria-label="Imagem anterior"
                      >
                        <ArrowLeft size={24} />
                      </button>
                      <button
                        onClick={goNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-3xl p-3 rounded-full bg-black/60 hover:bg-black/80 transition-all backdrop-blur-sm"
                        aria-label="Próxima imagem"
                      >
                        <ArrowRight size={24} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* NAVEGAÇÃO POR THUMBNAILS - FIXO NO BOTTOM */}
              {fotos.length > 1 && (
                <div className="sticky bottom-0 bg-black/80 backdrop-blur-sm p-4">
                  <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
                    {fotos.map((foto, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIndex(idx)}
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                          selectedIndex === idx 
                            ? 'border-white shadow-lg' 
                            : 'border-transparent hover:border-gray-400'
                        }`}
                      >
                        <Image
                          src={foto.Foto}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                        {foto.Destaque === "Sim" && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs w-4 h-4 rounded-full flex items-center justify-center">
                            ⭐
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // GRID DE TODAS AS FOTOS
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 min-h-screen">
              {fotos.map((foto, idx) => {
                const fotoEDestaque = foto.Destaque === "Sim";
                
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedIndex(idx)}
                    className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg border-2 border-transparent hover:border-white/50 transition-all"
                  >
                    <Image
                      src={foto.Foto}
                      alt={`${title} - Imagem ${idx + 1}`}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="lazy"
                    />
                    
                    {/* OVERLAY COM NÚMERO */}
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {idx + 1}
                    </div>
                    
                    {/* INDICADOR DE DESTAQUE */}
                    {fotoEDestaque && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        ⭐ DESTAQUE
                      </div>
                    )}
                    
                    {/* HOVER OVERLAY */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
