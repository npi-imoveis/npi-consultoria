"use client";

import { Carousel } from 'react-responsive-carousel';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Share } from "@/app/components/ui/share";

export default function CondominioGallery({ fotos, second, title }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Processamento das imagens
  const processedImages = fotos
    ? [...fotos].sort((a, b) => {
        if (a.Destaque === "Sim" && b.Destaque !== "Sim") return -1;
        if (a.Destaque !== "Sim" && b.Destaque === "Sim") return 1;
        return 0;
      }).map((foto, index) => ({
        src: foto.Foto,
        alt: `Imagem ${index + 1} do condomínio`
      }))
    : [];

  // Reorganização se second for true
  const images = [...processedImages]; // Cria uma cópia
  if (second && images.length >= 2) {
    const secondImage = images[1];
    images.splice(1, 1);
    images.unshift(secondImage);
  }

  if (!images || images.length === 0) {
    return null;
  }

  // Atualiza o alt da imagem selecionada
  const updatedImages = images.map((image, index) => ({
    ...image,
    alt: index === selectedIndex 
      ? title || `Imagem ${selectedIndex + 1} de ${images.length} do condomínio`
      : image.alt
  }));

  const openModal = (index) => {
    setIsModalOpen(true);
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const goNext = () => {
    setSelectedIndex((prev) => (prev + 1) % updatedImages.length);
  };

  const goPrev = () => {
    setSelectedIndex((prev) => (prev - 1 + updatedImages.length) % updatedImages.length);
  };

  return (
    <>
      <div className="relative w-full h-full min-h-[550px] overflow-hidden rounded-lg">
        <Carousel
          showThumbs={true}
          showStatus={false}
          showIndicators={false}
          infiniteLoop={true}
          useKeyboardArrows={true}
          autoPlay={false}
          swipeable={true}
          emulateTouch={true}
          thumbWidth={80}
          onClickItem={openModal}
          selectedItem={selectedIndex}
          renderThumbs={(children) =>
            updatedImages.map((image, index) => (
              <div key={index} className="thumb">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={80}
                  height={60}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            ))
          }
        >
          {updatedImages.map((image, index) => (
            <div key={index} className="relative w-full h-[550px]">
              <Image
                src={image.src}
                alt={image.alt}
                title={title}
                fill={true}
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover rounded-lg"
                style={{ objectPosition: "center" }}
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
              />
              <span className="absolute top-2 right-2 bg-black text-white text-[12px] px-2 py-1 rounded z-10">
                {index + 1} de {updatedImages.length}
              </span>
            </div>
          ))}
        </Carousel>
      </div>

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

          <div className="flex items-center justify-center min-h-screen p-4 relative">
            <div className="relative max-w-full max-h-[80vh]">
              <Image
                src={updatedImages[selectedIndex].src}
                alt={updatedImages[selectedIndex].alt}
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
        </div>
      )}
    </>
  );
}
