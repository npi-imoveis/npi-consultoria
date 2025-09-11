// src/app/components/sections/image-gallery.js - VERSÃO OTIMIZADA
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { Share } from "../ui/share";
import { photoSorter } from "@/app/utils/photoSorter";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    // Inicialização segura
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    
    // Check inicial sem layout shift
    check();
    
    // Debounced resize para performance
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
  }, []); // Dependency array vazio - evita loops

  return isMobile;
}

export function ImageGallery({ 
  // Props para página de IMÓVEL (modo original)
  imovel,
  
  // Props para página de CONDOMÍNIO (modo novo) 
  fotos, 
  title,
  shareUrl,
  shareTitle,

  // Layout da galeria
  layout = "grid" // "grid" (padrão) ou "single" (só foto principal)
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [debugMode, setDebugMode] = useState(false);
  const isMobile = useIsMobile();

  // MODO INTELIGENTE: Detectar se é imóvel ou condomínio
  const isImovelMode = !!imovel;
  
  // Processar dados baseado no modo
  const processedData = useMemo(() => {
    if (isImovelMode) {
      // MODO IMÓVEL (original)
      return {
        fotos: imovel?.Foto || [],
        titulo: imovel?.Empreendimento || '',
        codigo: imovel?.Codigo || '',
        urlShare: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel?.Codigo}/${formatterSlug(imovel?.Empreendimento || '')}`,
        tituloShare: `Confira este imóvel: ${imovel?.Empreendimento}`
      };
    } else {
      // MODO CONDOMÍNIO (novo)
      return {
        fotos: fotos || [],
        titulo: title || '',
        codigo: 'condominio',
        urlShare: shareUrl || '',
        tituloShare: shareTitle || `Confira as fotos: ${title}`
      };
    }
  }, [imovel, fotos, title, shareUrl, shareTitle, isImovelMode]);

  // 🎯 PROCESSAR FOTOS COM ORDENAÇÃO INTELIGENTE MELHORADA
  const images = useMemo(() => {
    if (!Array.isArray(processedData.fotos) || processedData.fotos.length === 0) {
      return [];
    }

    try {
      console.log('📸 GALERIA: Processando fotos...', {
        modo: isImovelMode ? 'IMÓVEL' : 'CONDOMÍNIO',
        totalFotos: processedData.fotos.length,
        codigo: processedData.codigo
      });

      // ✅ Preservar campos de ordem para análise
      const fotosComOrdem = processedData.fotos.map(foto => ({...foto}));
      
      // ✅ SEPARAR FOTO DESTAQUE
      const fotoDestaque = fotosComOrdem.find(foto => foto.Destaque === "Sim");
      const fotosSemDestaque = fotosComOrdem.filter(foto => foto.Destaque !== "Sim");
      
      // ✅ ORDENAÇÃO INTELIGENTE - Respeitando ordem da migração
      // Primeiro: verificar se existe campo de ordem explícito
      const temOrdemExplicita = fotosSemDestaque.some(foto => 
        foto.Ordem !== undefined || 
        foto.ordem !== undefined || 
        foto.ORDEM !== undefined
      );
      
      let fotosOrdenadas;
      
      if (temOrdemExplicita) {
        // Se tem ordem explícita, usar ela prioritariamente
        fotosOrdenadas = [...fotosSemDestaque].sort((a, b) => {
          // Pegar o valor de ordem de qualquer variação do campo
          const ordemA = a.Ordem || a.ordem || a.ORDEM || 9999;
          const ordemB = b.Ordem || b.ordem || b.ORDEM || 9999;
          
          // Converter para número se for string
          const numA = typeof ordemA === 'string' ? parseInt(ordemA, 10) : ordemA;
          const numB = typeof ordemB === 'string' ? parseInt(ordemB, 10) : ordemB;
          
          // Se ambos têm ordem válida, usar ela
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          
          // Fallback: manter ordem original do array
          return 0;
        });
        
        console.log('📸 GALERIA: Usando ordem explícita da migração');
      } else {
        // Se não tem ordem explícita, usar o photoSorter
        fotosOrdenadas = photoSorter.ordenarFotos(fotosSemDestaque, processedData.codigo);
        console.log('📸 GALERIA: Usando photoSorter para ordenação');
      }
      
      // ✅ COLOCAR FOTO DESTAQUE NO INÍCIO (se existir)
      const fotosFinais = fotoDestaque 
        ? [fotoDestaque, ...fotosOrdenadas]
        : fotosOrdenadas;
      
      // ✅ Adicionar código único mantendo a ordem estabelecida
      return fotosFinais.map((foto, index) => ({
        ...foto,
        Codigo: foto.Codigo || `${processedData.codigo}-foto-${index}`,
        _indexOrdenado: index // Guardar índice para debug se necessário
      }));

    } catch (error) {
      console.error('❌ GALERIA: Erro ao processar imagens:', error);
      
      // Fallback: manter ordem original do array
      return [...processedData.fotos].map((foto, index) => ({
        ...foto,
        Codigo: foto.Codigo || `${processedData.codigo}-foto-${index}`,
        _indexOrdenado: index
      }));
    }
  }, [processedData, isImovelMode]);

  // DEBUG INFO
  const debugInfo = useMemo(() => {
    if (!debugMode || !processedData.fotos) return null;
    
    // Para debug, usar fotos sem remover campos de ordem
    return photoSorter.gerarRelatorio(processedData.fotos, processedData.codigo);
  }, [debugMode, processedData.fotos, processedData.codigo]);

  // Toggle debug
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        setDebugMode(prev => !prev);
        console.log(debugMode ? 'Debug desativado' : 'Debug ativado');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [debugMode]);

  // Handlers otimizados com useCallback
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

  // Keyboard navigation
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

  // Bloqueia scroll quando modal abre
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isModalOpen]);

  if (!processedData.titulo) {
    return null;
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-[410px] relative">
        <div className="w-full h-full overflow-hidden bg-gray-200 flex items-center justify-center rounded-lg">
          <span className="text-gray-500">Imagem não disponível</span>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* DEBUG INFO */}
      {debugMode && debugInfo && (
        <div className="mb-4 p-3 bg-black text-green-400 font-mono text-xs rounded-md">
          <div className="font-bold mb-2">DEBUG - ORDENAÇÃO INTELIGENTE ({isImovelMode ? 'IMÓVEL' : 'CONDOMÍNIO'})</div>
          <div>Total: {debugInfo.total} fotos</div>
          <div>Grupos: {JSON.stringify(debugInfo.grupos)}</div>
          <div>Cobertura: {(debugInfo.cobertura * 100).toFixed(1)}%</div>
          <div>Padrões: {debugInfo.padroes.slice(0, 3).join(', ')}...</div>
          <div>Método: {images.some(f => f.Ordem || f.ordem || f.ORDEM) ? 'ORDEM EXPLÍCITA' : 'ANÁLISE INTELIGENTE'}</div>
        </div>
      )}

      {/* LAYOUT CONDICIONAL: Single ou Grid */}
      {layout === "single" ? (
        // LAYOUT SINGLE: Uma foto ocupando todo o espaço
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
            placeholder="blur"
            blurDataURL={images[0].blurDataURL || "/placeholder.png"}
            loading="eager"
            priority={true}
            className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-105"
          />

          {/* Indicador de destaque */}
          {images[0].Destaque === "Sim" && (
            <div className="absolute top-4 left-4 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              ⭐ DESTAQUE
            </div>
          )}

          {/* Contador de fotos */}
          <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg">
            {images.length} foto{images.length > 1 ? 's' : ''}
          </div>
        </div>
      ) : (
        // LAYOUT GRID: Grid tradicional com foto principal + thumbnails
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-full">
          <div className="col-span-1 h-[410px] cursor-pointer relative" onClick={() => openModal()}>
            <div className="w-full h-full overflow-hidden">
              <Image
                src={images[0].Foto}
                alt={processedData.titulo}
                title={processedData.titulo}
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

            {/* Indicador de destaque */}
            {images[0].Destaque === "Sim" && (
              <div className="absolute top-4 left-4 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                ⭐ DESTAQUE
              </div>
            )}

            {/* Contador de fotos */}
            <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium shadow-lg">
              {images.length} foto{images.length > 1 ? 's' : ''}
            </div>
          </div>

          {/* GRID 2x2 - Desktop only */}
          {!isMobile && (
            <div className="col-span-1 grid grid-cols-2 grid-rows-2 gap-1 h-[410px]">
              {images.slice(1, 5).map((image, index) => {
                const isLastImage = index === 3;
                return (
                  <div
                    key={image.Codigo || index}
                    className="relative h-full overflow-hidden cursor-pointer"
                    onClick={() => openModal()}
                  >
                    <Image
                      src={image.Foto}
                      alt={`${processedData.titulo} - imagem ${index + 2}`}
                      title={`${processedData.titulo} - imagem ${index + 2}`}
                      width={400}
                      height={300}
                      sizes="25vw"
                      placeholder="blur"
                      blurDataURL={image.blurDataURL || "/placeholder.png"}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                    />
                    
                    {/* Indicador de destaque nos thumbnails */}
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
      )}

      {/* Botão mobile para ver todas as fotos */}
      {isMobile && images.length > 1 && (
        <div className="mt-4 px-4">
          <button
            onClick={() => openModal()}
            className="w-full py-3 text-center border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors font-medium"
          >
            Ver todas as {images.length} fotos
          </button>
        </div>
      )}

      {/* MODAL DA GALERIA - COM HEADER FIXO E GRADIENTE */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-50 overflow-auto">
          {/* 🎯 HEADER FIXO COM GRADIENTE - MELHORADO */}
          <div className="sticky top-0 z-10 flex justify-between gap-4 p-5 pt-12 md:pt-8 bg-gradient-to-b from-black/40 to-transparent backdrop-blur-sm">
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

          {/* CONDICIONAL CORRIGIDA - SEM VAZAMENTO */}
          {selectedIndex !== null && selectedIndex !== undefined ? (
            // FOTO INDIVIDUAL - ABSOLUTAMENTE SEM THUMBNAILS!
            <div className="flex items-center justify-center min-h-screen p-4 relative">
              <Image
                src={images[selectedIndex].Foto}
                alt={`${processedData.titulo} - imagem ${selectedIndex + 1} de ${images.length}`}
                title={`${processedData.titulo} - imagem ${selectedIndex + 1} de ${images.length}`}
                width={900}
                height={600}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={images[selectedIndex].blurDataURL || "/placeholder.png"}
                loading="eager"
                quality={85}
                className="max-w-full max-h-screen object-contain"
              />

              {/* Contador */}
              <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm z-20">
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
            // GRID DE THUMBNAILS - SÓ QUANDO NÃO HÁ FOTO SELECIONADA
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
                    placeholder="blur"
                    blurDataURL={image.blurDataURL || "/placeholder.png"}
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

      {/* Hint do debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-2 text-xs text-gray-400 text-center">
          Ctrl + Shift + D para debug da ordenação ({isImovelMode ? 'IMÓVEL' : 'CONDOMÍNIO'})
        </div>
      )}
    </>
  );
}
