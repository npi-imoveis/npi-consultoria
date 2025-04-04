"use client"

import React, { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

// Importe os estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import { TitleSection } from '../ui/title-section';

export function TestimonialsSection() {
  // Dados dos depoimentos
  const testimonials = [
    {
      id: 1,
      content: "Comprei um imóvel para investimento no Condomínio Pin Home Design com a NPi. Conseguiram uma unidade com excelente preço, o melhor do prédio, e tive um atendimento rápido, com total atenção em todo processo. Mesmo em meio a pandemia, consegui visitar o imóvel, tive acesso a toda documentação e com isso, total segurança para fazer esta aquisição. De fato eles fazem um atendimento personalizado.",
      name: "José Simões",
      role: "Analista Financeiro",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 2,
      content: "Atendimento rápido, profissionais atenciosos, me apresentaram todos imóveis do Campo Belo no perfil que eu selecionei, e enfim, encontrei o que eu queria. Super recomendo.",
      name: "Patrícia Gouveia",
      role: "Empresária",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    },
    {
      id: 3,
      content: "Precisávamos de um espaço na Faria Lima que fosse com metragem mediana mas em prédio novo pois precisava de uma apresentação excelente para nossos clientes da clínica. Encontrei na NPi um imóvel perfeito para minha clinica! 100% satisfeito com o atendimento profissional e muito cordial.",
      name: "Luciano Souza",
      role: "Médico",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    }
  ];

  // Refs para os botões de navegação personalizados
  const [swiperRef, setSwiperRef] = useState(null);

  return (
    <section className="relative isolate overflow-hidden bg-white px-6 py-24 sm:py-16 lg:px-8">
      <TitleSection
      center
      section="Depoimentos"
      title="O que estão dizendo sobre nós"
      description="Veja o que nossos clientes estão falando sobre nós"
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
                    <p>"{testimonial.content}"</p>
                  </blockquote>
                  <figcaption className="mt-10">
                    <img
                      alt={testimonial.name}
                      src={testimonial.avatar}
                      className="mx-auto size-10 rounded-full"
                    />
                    <div className="mt-4 flex items-center justify-center space-x-3 text-base">
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
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