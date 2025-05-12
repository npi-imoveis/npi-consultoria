"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import Image from "next/image";
import { useEffect, useState } from "react";

export function SlidePartners() {
  const [logos, setLogos] = useState([]);

  useEffect(() => {
    async function fetchPartners() {
      try {
        const response = await fetch("/api/admin/upload?directory=parceiros");
        const data = await response.json();
        if (data.success) {
          setLogos(data.images);
        } else {
          console.error("Erro ao carregar imagens:", data.error);
        }
      } catch (error) {
        console.error("Erro ao buscar parceiros:", error);
      }
    }

    fetchPartners();
  }, []);

  if (logos.length === 0) {
    return null; // Não mostra nada enquanto carrega
  }

  return (
    <div className="container mx-auto py-10">
      <Swiper
        slidesPerView={2}
        spaceBetween={20}
        breakpoints={{
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 5 },
        }}
        loop={true}
        autoplay={{ delay: 1000, disableOnInteraction: false }}
        modules={[Autoplay]}
        className="flex items-center justify-center"
      >
        {logos.map((logo, index) => (
          <SwiperSlide key={index} className="flex justify-center">
            <Image
              src={logo}
              alt={`Logo do Parceiro ${index + 1}`}
              width={150}
              height={50}
              className="object-contain"
              onError={(e) => {
                console.error(`Error loading image: ${logo}`);
                e.target.style.display = "none";
              }}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
