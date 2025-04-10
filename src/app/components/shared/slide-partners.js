"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import Image from "next/image";

const logos = [
  "/assets/parceiros/01.jpg",
  "/assets/parceiros/02.png",
  "/assets/parceiros/03.jpg",
  "/assets/parceiros/04.png",
  "/assets/parceiros/05.png",
  "/assets/parceiros/06.png",
  "/assets/parceiros/07.jpg",
  "/assets/parceiros/08.png",
  "/assets/parceiros/09.jpg",
  "/assets/parceiros/11.jpg",
  "/assets/parceiros/13.jpg",
  "/assets/parceiros/14.png",
  "/assets/parceiros/15.jpg",
  "/assets/parceiros/17.jpg",
  "/assets/parceiros/18.jpg",
  "/assets/parceiros/19.jpg",
  "/assets/parceiros/20.jpg",
  "/assets/parceiros/21.jpg",
  "/assets/parceiros/22.jpg",
  "/assets/parceiros/23.jpg",
  "/assets/parceiros/24.jpg",
  "/assets/parceiros/25.jpg",
  "/assets/parceiros/26.jpg",
  "/assets/parceiros/27.jpg",
  "/assets/parceiros/28.jpg",
  "/assets/parceiros/29.jpg",
  "/assets/parceiros/30.jpg",
  "/assets/parceiros/31.jpg",
  "/assets/parceiros/32.jpg",
  "/assets/parceiros/33.jpg",
  "/assets/parceiros/34.jpg",
  "/assets/parceiros/35.jpg",
  "/assets/parceiros/36.jpg",
  "/assets/parceiros/37.jpg",
  "/assets/parceiros/38.jpg",
  "/assets/parceiros/39.jpg",
  "/assets/parceiros/40.jpg",
  "/assets/parceiros/41.jpg",
];

export function SlidePartners() {
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
              alt={`Logo ${index + 1}`}
              width={150}
              height={50}
              className="object-contain"
              unoptimized
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
