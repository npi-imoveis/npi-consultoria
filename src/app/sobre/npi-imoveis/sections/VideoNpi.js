"use client";
import { useState } from "react";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { TitleSection } from "@/app/components/ui/title-section";

export default function VideoNpi({ missao }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="bg-white py-24 px-6 lg:px-0">
      <div className="container mx-auto max-w-6xl">
        {/* Título e Descrição */}
        <TitleSection
          section={missao?.title || "Missão e Serviços"}
          title={missao?.title || "Nossa Missão e Serviços"}
          description={
            missao?.description ||
            "Desde 2007, a NPi se dedica a oferecer um serviço imparcial e de excelência, ajudando nossos clientes a realizarem o sonho de adquirir um imóvel."
          }
        />
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-12 items-center">
          {/* Vídeo Thumbnail */}
          <div
            className="relative group cursor-pointer w-full max-w-2xl mx-auto"
            onClick={() => setIsOpen(true)}
          >
            <Image
              src="/assets/images/imoveis/02.jpg"
              alt="Thumbnail do Vídeo"
              width={800}
              height={450}
              className="rounded-lg shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
            {/* Botão de Play */}
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-lg">
              <div className="w-16 h-16 bg-white text-black flex items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
                <svg
                  className="w-8 h-8"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Texto */}
          <div>         
            {/* Lista de Serviços */}
            <div className="mt-6 space-y-6">
              {missao?.itens && Array.isArray(missao.itens) && missao.itens.length > 0 ? (
                missao.itens.map((service, index) => (
                  <div key={index} className="bg-zinc-100 p-4 rounded-lg ">
                    <h1 className="text-lg font-semibold text-black">{service.title}</h1>
                    <p className="text-black mt-2">{service.description}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Serviços em breve...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vídeo */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
          <div className="relative bg-white rounded-lg overflow-hidden shadow-lg w-full max-w-4xl">
            {/* Botão Fechar */}
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={() => setIsOpen(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            {/* Vídeo */}
            <div className="w-full aspect-video">
              <iframe
                width="100%"
                height="100%"
                src={missao?.youtube}
                title="Vídeo Institucional NPi"
                frameBorder="0"
                allowFullScreen
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
