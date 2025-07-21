// ImageGallery.jsx - VERSÃO COM ORDENAÇÃO INTELIGENTE APRIMORADA
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { Share } from "../ui/share";
import { photoSorter } from "@/app/utils/photoSorter"; // 🚀 Nova classe

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

export function ImageGallery({ imovel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const isMobile = useIsMobile();

  // 🎯 NOVA LÓGICA: Usar classe inteligente para ordenação
  const images = useMemo(() => {
    if (!Array.isArray(imovel?.Foto) || imovel.Foto.length === 0) {
      return [];
    }

    try {
      // Usar o novo ordenador inteligente
      const fotosOrdenadas = photoSorter.ordenarFotos(imovel.Foto, imovel.Codigo);
      
      // Adicionar códigos únicos para o componente
      return fotosOrdenadas.map((foto, index) => ({
        ...foto,
        Codigo: `${imovel.Codigo}-foto-${index}`,
      }));

    } catch (error) {
      console.error('❌ Erro ao processar imagens na galeria:', error);
      
      // Fallback seguro
      return [...imovel.Foto].map((foto, index) => ({
        ...foto,
        Codigo: `${imovel.Codigo}-foto-${index}`,
      }));
    }
  }, [imovel?.Foto, imovel?.Codigo]);

  // 🔍 NOVA FEATURE: Debug da ordenação
  const debugInfo = useMemo(() => {
    if (!debugMode || !imovel?.Foto) return null;
    
    return photoSorter.gerarRelatorio(imovel.Foto, imovel.Codigo);
  }, [debugMode, imovel?.Foto, imovel?.Codigo]);

  // 🔧 Toggle debug no desenvolvimento
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log(debugMode ? '🔍 Debug desativado' : '🔍 Debug ativado');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugMode]);

  if (!imovel || !imovel.Empreendimento) {
    return null;
  }

  const slug = formatterSlug(imovel.Empreendimento);

  if (images.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
        <div className="col-span-1 h-[410px] relative">
          <div className="w-full h-full overflow-hidden bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Imagem não disponível</span>
          </div>
        </div>
      </div>
    );
  }

  const openModal = (index) => {
    setIsModalOpen(true);
    setSelectedIndex(index ?? null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIndex(null);
  };

  const goNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goPrev = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const tituloCompartilhamento = `Confira este imóvel: ${imovel.Empreendimento}`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${slug}`;

  return (
    <>
      {/* 🔍 DEBUG INFO (só aparece no modo debug) */}
      {debugMode && debugInfo && (
        <div className="mb-4 p-3 bg-black text-green-400 font-mono text-xs rounded-md">
          <div className="font-bold mb-2">🔍 DEBUG - ORDENAÇÃO INTELIGENTE</div>
          <div>📸 Total: {debugInfo.total} fotos</div>
          <div>📊 Grupos: {JSON.stringify(debugInfo.grupos)}</div>
          <div>📈 Cobertura: {(debugInfo.cobertura * 100).toFixed(1)}%</div>
          <div>🎯 Padrões: {debugInfo.padroes.slice(0, 3).join(', ')}...</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
        <div className="col-span-1 h-[410px] cursor-pointer relative" onClick={() => openModal()}>
          <div className="w-full h-full overflow-hidden">
            <Image
              src={images[0].Foto}
              alt={imovel.Empreendimento}
              title={imovel.Empreendimento}
              width={800}
              height={600}
              sizes="(max-width: 350px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              placeholder="blur"
              blurDataURL={images[0].blurDataURL || "/placeholder.png"}
              loading="eager"
              priority={true}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
            />
          </div>

          {/* 🏷️ NOVO: Indicador de destaque mais visível */}
          {images[0].Destaque === "Sim" && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ⭐ DESTAQUE
            </div>
          )}

          {isMobile && images.length > 1 && (
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              {images.length} fotos
            </div>
          )}
        </div>

        {!isMobile && (
          <div className="col-span-1 grid grid-cols-2 grid-rows-2 gap-1 h-[410px]">
            {images.slice(1, 5).map((image, index) => {
              const isLastImage = index === 3;
              return (
                <div
                  key={index}
                  className="relative h-full overflow-hidden cursor-pointer"
                  onClick={() => openModal()}
                >
                  <Image
                    src={image.Foto}
                    alt={`${imovel.Empreendimento} - imagem ${index + 2}`}
                    title={`${imovel.Empreendimento} - imagem ${index + 2}`}
                    width={400}
                    height={300}
                    sizes="25vw"
                    placeholder="blur"
                    blurDataURL={image.blurDataURL || "/placeholder.png"}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                  />
                  
                  {/* 🏷️ NOVO: Indicadores nos thumbnails */}
                  {image.Destaque === "Sim" && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                      ⭐
                    </div>
                  )}
                  
                  {isLastImage && images.length > 5 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
                      <button
                        className="border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
                        aria-label="Ver mais fotos"
                      >
                        +{images.length - 5} fotos
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isMobile && images.length > 1 && (
        <div className="mt-4 px-4">
          <button
            onClick={() => openModal()}
            className="w-full py-3 text-center border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors font-medium"
          >
            📸 Ver todas as {images.length} fotos
          </button>
        </div>
      )}

      {/* 🖼️ MODAL DA GALERIA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-auto">
          <div className="flex justify-between gap-4 p-5 pt-28 mt-6 md:mt-0">
            <button onClick={closeModal} aria-label="Fechar galeria" className="text-white">
              <ArrowLeft size={24} />
            </button>
            <Share
              primary
              url={url}
              title={tituloCompartilhamento}
              imovel={{
                Codigo: imovel.Codigo,
                Empreendimento: imovel.Empreendimento,
              }}
            />
          </div>

          {selectedIndex !== null ? (
            <div className="flex items-center justify-center min-h-screen p-4 relative">
              <Image
                src={images[selectedIndex].Foto}
                alt={`${imovel.Empreendimento} - imagem ampliada`}
                title={`${imovel.Empreendimento} - imagem ampliada`}
                width={1200}
                height={800}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={images[selectedIndex].blurDataURL || "/placeholder.png"}
                loading="eager"
                className="max-w-full max-h-screen object-contain"
              />

              {/* Indicador de foto atual */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm">
                {selectedIndex + 1} / {images.length}
                {images[selectedIndex].Destaque === "Sim" && " ⭐"}
              </div>

              <button
                onClick={goPrev}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-4xl px-2 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors"
                aria-label="Imagem anterior"
              >
                &#10094;
              </button>
              <button
                onClick={goNext}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-4xl px-2 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors"
                aria-label="Próxima imagem"
              >
                &#10095;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
              {images.map((image, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 cursor-pointer overflow-hidden border-2 border-transparent hover:border-white transition-colors"
                >
                  <Image
                    src={image.Foto}
                    alt={`${imovel.Empreendimento} - imagem ${idx + 1}`}
                    title={`${imovel.Empreendimento} - imagem ${idx + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    placeholder="blur"
                    blurDataURL={image.blurDataURL || "/placeholder.png"}
                    loading="lazy"
                    className="object-cover"
                  />
                  
                  {/* Overlay com número */}
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                    {idx + 1}
                  </div>
                  
                  {/* Indicador de destaque */}
                  {image.Destaque === "Sim" && (
                    <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded">
                      ⭐ DESTAQUE
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 🔍 Hint do debug no desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Ctrl + Shift + D para debug da ordenação
        </div>
      )}
    </>
  );
}
