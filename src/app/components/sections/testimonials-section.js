"use client";

import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

// Importe os estilos do Swiper
import "swiper/css";
import "swiper/css/navigation";
import { TitleSection } from "../ui/title-section";

export function TestimonialsSection({ testimonials }) {
  // Dados dos depoimentos

  // Refs para os botões de navegação personalizados
  const [swiperRef, setSwiperRef] = useState(null);

  return (
    <section className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-16 lg:px-8">
      <TitleSection
        center
        section="Depoimentos"
        title="O que estão dizendo"
        description="Depoimentos dos nossos clientes"
      />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.100),white)] opacity-20" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

      <div className="mx-auto max-w-2xl lg:max-w-4xl">
        <div className="relative mt-10">
          {/* Botões de navegação personalizados */}
          <div className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-full hidden md:block">
            <button
              onClick={() => swiperRef.slidePrev()}
              className="rounded-full bg-[#8B6F48] p-2 shadow-md hover:bg-[#8B6F48]/40 focus:outline-none"
              aria-label="Depoimento anterior"
            >
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-full hidden md:block">
            <button
              onClick={() => swiperRef.slideNext()}
              className="rounded-full bg-[#8B6F48] p-2 shadow-md hover:bg-[#8B6F48]/40 focus:outline-none"
              aria-label="Próximo depoimento"
            >
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Swiper carrossel */}
          <Swiper
            modules={[Navigation]}
            onSwiper={setSwiperRef}
            spaceBetween={30}
            slidesPerView={1}
            loop={true}
            className="mySwiper"
          >
            {testimonials.map((testimonial) => (
              <SwiperSlide key={testimonial.id}>
                <figure>
                  <blockquote className="text-center text-lg font-semibold text-gray-900 ">
                    <p>&ldquo;{testimonial.content}&rdquo;</p>
                  </blockquote>
                  <figcaption className="mt-10">
                    <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <svg
                        width={3}
                        height={3}
                        viewBox="0 0 2 2"
                        aria-hidden="true"
                        className="fill-gray-900"
                      >
                        <circle r={1} cx={1} cy={1} />
                      </svg>
                      <div className="text-gray-600">{testimonial.role}</div>
                    </div>
                  </figcaption>
                </figure>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Botões de navegação para dispositivos móveis */}
          <div className="flex justify-center mt-8 space-x-4 md:hidden">
            <button
              onClick={() => swiperRef.slidePrev()}
              className="rounded-full bg-[#8B6F48] p-2 shadow-md hover:bg-[#8B6F48]/40 focus:outline-none"
              aria-label="Depoimento anterior"
            >
              <ChevronLeftIcon className="h-5 w-5 text-white" />
            </button>
            <button
              onClick={() => swiperRef.slideNext()}
              className="rounded-full bg-[#8B6F48] p-2 shadow-md hover:bg-[#8B6F48]/40 focus:outline-none"
              aria-label="Próximo depoimento"
            >
              <ChevronRightIcon className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
