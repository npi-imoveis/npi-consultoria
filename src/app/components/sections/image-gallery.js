// ImageGallery.jsx (FRONTEND) - VERSÃO LIMPA COM DIAGNÓSTICO
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { Share } from "../ui/share";

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
  const isMobile = useIsMobile();

  const getProcessedImages = () => {
    if (!Array.isArray(imovel?.Foto) || imovel.Foto.length === 0) {
      console.warn('⚠️ FRONTEND - imovel.Foto inválido:', imovel?.Foto);
      return [];
    }

    // 🔥 DIAGNÓSTICO COMPLETO - DADOS BRUTOS DA API
    console.log('🔥 FRONTEND - DIAGNÓSTICO COMPLETO:', {
      imovelCodigo: imovel.Codigo,
      totalFotos: imovel.Foto.length,
      primeiraFoto: imovel.Foto[0]?.Foto,
      ultimaFoto: imovel.Foto[imovel.Foto.length - 1]?.Foto,
      fotosComCodigo487: imovel.Foto.filter(f => f.Codigo === '487').length,
      codigosUnicos: [...new Set(imovel.Foto.map(f => f.Codigo))],
      urlsUnicas: [...new Set(imovel.Foto.map(f => f.Foto))],
      fotoDestaque: imovel.Foto.find(f => f.Destaque === 'Sim')
    });

    // 🚨 VALIDAÇÃO DA HIPÓTESE PRINCIPAL
    const codigosDuplicados = imovel.Foto.filter(f => f.Codigo === '487').length;
    const totalFotos = imovel.Foto.length;
    const urlsUnicas = [...new Set(imovel.Foto.map(f => f.Foto))];

    console.log('🚨 FRONTEND - DIAGNÓSTICO CRÍTICO:', {
      temCodigosDuplicados: codigosDuplicados > 1,
      percentualDuplicado: (codigosDuplicados / totalFotos * 100).toFixed(1) + '%',
      precisaCorrecao: codigosDuplicados === totalFotos,
      temUrlsDiferentes: urlsUnicas.length > 1,
      totalUrlsUnicas: urlsUnicas.length
    });

    // 📸 COMPARAÇÃO VISUAL
    const DEBUG_FOTOS = true;
    if (DEBUG_FOTOS) {
      console.log('📸 FRONTEND - PRIMEIRAS 3 FOTOS DA API:');
      imovel.Foto.slice(0, 3).forEach((foto, i) => {
        console.log(`  ${i+1}. Código: ${foto.Codigo} | URL: ${foto.Foto.slice(-30)}`);
      });
    }

    // ✅ CORREÇÃO: Gerar códigos únicos baseados no índice
    const ordemOriginal = [...imovel.Foto].map((foto, index) => ({
      ...foto,
      Codigo: `${imovel.Codigo}-foto-${index}`,
    }));

    console.log('✅ FRONTEND - CÓDIGOS ÚNICOS GERADOS:', {
      totalGerados: ordemOriginal.length,
      primeiros5: ordemOriginal.slice(0, 5).map(f => f.Codigo)
    });

    // 🎯 BUSCAR E POSICIONAR DESTAQUE
    const destaqueIndex = ordemOriginal.findIndex(f => f.Destaque === "Sim");
    
    if (destaqueIndex === -1) {
      console.log('🎯 FRONTEND - ❌ SEM DESTAQUE - Mantendo ordem original');
      return ordemOriginal;
    }

    console.log('🎯 FRONTEND - ✅ DESTAQUE ENCONTRADO:', {
      posicaoOriginal: destaqueIndex + 1,
      codigoDestaque: ordemOriginal[destaqueIndex].Codigo,
      urlDestaque: ordemOriginal[destaqueIndex].Foto.slice(-30)
    });

    const fotoDestaque = ordemOriginal[destaqueIndex];
    const outrasfotos = ordemOriginal.filter((_, index) => index !== destaqueIndex);
    const ordemFinal = [fotoDestaque, ...outrasfotos];

    // 📋 RESULTADO FINAL
    console.log('📋 FRONTEND - RESULTADO FINAL:', {
      primeiraFotoFinal: ordemFinal[0].Codigo,
      urlPrimeiraFinal: ordemFinal[0].Foto.slice(-30),
      mudouPosicao: imovel.Foto[0]?.Foto !== ordemFinal[0]?.Foto ? '✅ SIM' : '❌ NÃO'
    });
    
    return ordemFinal;
  };

  const images = getProcessedImages();

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

          {isMobile && images.length > 1 && (
            <div className="absolute top-4 right-4 bg-white bg-opacity-80 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-medium">
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
                  {isLastImage && images.length > 5 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center">
                      <button
                        className="border border-white text-white px-4 py-2 rounded hover:bg-white hover:text-black transition-colors"
                        aria-label="Ver mais fotos"
                      >
                        Ver mais fotos
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
            className="w-full py-3 text-center border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors"
          >
            Ver todas as {images.length} fotos
          </button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto">
          <div className="flex justify-between gap-4 p-5 pt-28 mt-6 md:mt-0">
            <button onClick={closeModal} aria-label="Fechar galeria">
              <ArrowLeft color="white" size={24} />
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

              <button
                onClick={goPrev}
                className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-4xl px-2"
                aria-label="Imagem anterior"
              >
                &#10094;
              </button>
              <button
                onClick={goNext}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-4xl px-2"
                aria-label="Próxima imagem"
              >
                &#10095;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 ">
              {images.map((image, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 cursor-pointer overflow-hidden"
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
