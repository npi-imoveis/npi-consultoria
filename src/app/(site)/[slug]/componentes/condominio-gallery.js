"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Share } from "@/app/components/ui/share";

export default function CondominioGallery({ fotos, second, title }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);

  // Reorganiza as imagens para que a foto em destaque seja a primeira
  const images = fotos
    ? [...fotos].sort((a, b) => {
        if (a.Destaque === "Sim" && b.Destaque !== "Sim") return -1;
        if (a.Destaque !== "Sim" && b.Destaque === "Sim") return 1;
        return 0;
      })
    : [];

  // Se a propriedade second for true e tiver pelo menos 2 imagens, coloca a segunda imagem como primeira
  if (second && images.length >= 2) {
    const secondImage = images[1];
    images.splice(1, 1);
    images.unshift(secondImage);
  }

  if (!images || images.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const openModal = (index) => {
    setIsModalOpen(true);
    setSelectedIndex(index !== undefined ? index : currentIndex);
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

  const imgAlt = title || `Imagem ${currentIndex + 1} de ${images.length} do condomínio`;

  return (
    <>
      <div className="relative w-full h-full min-h-[550px] overflow-hidden rounded-lg">
        {/* Imagem principal */}
        <div className="relative w-full h-[550px] cursor-pointer" onClick={() => openModal()}>
          <Image
            src={images[currentIndex].Foto}
            alt={imgAlt}
            title={title}
            fill={true}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-lg"
            style={{ objectPosition: "center" }}
            priority={currentIndex === 0}
            loading={currentIndex === 0 ? "eager" : "lazy"}
          />
          <span className="absolute top-2 right-2 bg-black text-white text-[12px] px-2 py-1 rounded z-10">
            {currentIndex + 1} de {images.length}
          </span>
        </div>

        {/* Botões de navegação */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
          aria-label="Imagem anterior"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full z-10"
          aria-label="Próxima imagem"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Modal para visualização em tela cheia */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto">
          <div className="flex justify-between gap-4 p-5 pt-28 mt-6 md:mt-0">
            <button onClick={closeModal} aria-label="Fechar galeria">
              <ArrowLeft color="white" size={24} />
            </button>

            <Share
              url={typeof window !== "undefined" ? window.location.href : ""}
              title="Confira este condomínio"
              imovel={fotos && fotos.length > 0 ? { Codigo: fotos[0].CondominioId } : null}
            />
          </div>

          {selectedIndex !== null ? (
            <div className="flex items-center justify-center min-h-screen p-4 relative">
              <div className="relative max-w-full max-h-[80vh]">
                <Image
                  src={images[selectedIndex].Foto}
                  alt={imgAlt}
                  title={title}
                  width={1200}
                  height={800}
                  className="max-w-full max-h-[80vh] object-contain"
                  loading="lazy"
                />
              </div>

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 min-h-screen">
              {images.map((image, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedIndex(idx)}
                  className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 cursor-pointer overflow-hidden"
                >
                  <Image
                    src={image.Foto}
                    alt={`${title || "Imagem do condomínio"} ${idx + 1}`}
                    title={title}
                    fill
                    className="object-cover"
                    loading="lazy"
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
