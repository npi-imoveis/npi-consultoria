// /app/sobre/hub-imobiliarias/components/HubPartnersSlide.tsx

"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/autoplay";
import { Autoplay } from "swiper/modules";
import Image from "next/image";

// ADICIONE SEUS LOGOS AQUI - Coloque as imagens em /public/assets/images/hub-partners/
const hubLogos = [
  "/assets/images/hub-partners/polo-residencial.jpg",
  "/assets/images/hub-partners/Logo-First.png", 
  "/assets/images/hub-partners/Ganzaroli.jpeg",
  "/assets/images/hub-partners/Homesphere.jpg",
  "/assets/images/hub-partners/casa-brick.png",
  "/assets/images/hub-partners/imoveis-da-vila.jpeg",
  "/assets/images/hub-partners/ritt.jpeg",
  "/assets/images/hub-partners/siga.jpeg",
  "/assets/images/hub-partners/remax-vert.jpg",
  "/assets/images/hub-partners/ava-homes.jpg",
  "/assets/images/hub-partners/om2.png",
  "/assets/images/hub-partners/3quadras.jpg",
  "/assets/images/hub-partners/arco.jpg",
  "/assets/images/hub-partners/avere.png",
  "/assets/images/hub-partners/factual.jpg",
  "/assets/images/hub-partners/nokkel.jpg",
  "/assets/images/hub-partners/cg-imoveis-especiais.jpg",
  "/assets/images/hub-partners/andrea-gomes.jpg",
  "/assets/images/hub-partners/prime-one.webp",
  "/assets/images/hub-partners/logo-npi-degrade-transparente-oficial.png",
  "/assets/images/hub-partners/verano.jpg",
  "/assets/images/hub-partners/imomobile-unique.jpg",
  "/assets/images/hub-partners/robles.jpg",
  "/assets/images/hub-partners/Eurico.png",
  "/assets/images/hub-partners/remax-trio.jpeg",
  "/assets/images/hub-partners/revenda-imovel.jpg",
  "/assets/images/hub-partners/premiumcorp.jpg",
  "/assets/images/hub-partners/olhardecorretora.jpg",
  // Adicione quantos logos precisar
];

export function HubPartnersSlide() {
  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      {/* Título da Seção */}
      <div className="container mx-auto px-4 mb-10">
        <div className="text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Imobiliárias Parceiras do Hub
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conectamos as melhores imobiliárias boutique de alto padrão do mercado, 
            garantindo excelência e resultados excepcionais
          </p>
        </div>
      </div>

      {/* Carrossel */}
      <div className="container mx-auto">
        <Swiper
          slidesPerView={2}
          spaceBetween={20}
          breakpoints={{
            640: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 6 },
          }}
          loop={true}
          autoplay={{ 
            delay: 2000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: true
          }}
          modules={[Autoplay]}
          className="flex items-center justify-center"
        >
          {hubLogos.map((logo, index) => (
            <SwiperSlide key={index} className="flex justify-center">
              <div className="bg-white rounded-xl p-6 h-32 flex items-center justify-center hover:shadow-xl transition-all duration-300">
                <Image
                  src={logo}
                  alt={`Imobiliária Parceira ${index + 1}`}
                  width={180}
                  height={60}
                  className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                  loading="lazy"
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Badges de Confiança (Opcional) */}
      <div className="container mx-auto px-4 mt-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">{hubLogos.length}+</p>
            <p className="text-sm text-gray-600 mt-1">Imobiliárias Parceiras</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">100%</p>
            <p className="text-sm text-gray-600 mt-1">Boutique Premium</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">5★</p>
            <p className="text-sm text-gray-600 mt-1">Avaliação Média</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">I.A.</p>
            <p className="text-sm text-gray-600 mt-1">Clientes Qualificados</p>
          </div>
        </div>
      </div>
    </section>
  );
}
