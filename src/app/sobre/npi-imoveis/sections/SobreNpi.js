"use client";

import { Button } from "@/app/components/ui/button";
import { Chip } from "@/app/components/ui/chip";
import Image from "next/image";

export default function SobreNPI() {
  return (
    <section className="py-24 relative xl:mr-0 lg:mr-5 mr-0">
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
        <div className="w-full justify-start items-center xl:gap-12 gap-10 grid lg:grid-cols-2 grid-cols-1">
          {/* Texto e Informações */}
          <div className="w-full flex flex-col justify-center lg:items-start items-center gap-10">
            <div className="w-full flex flex-col justify-center items-start gap-8">
              <div className="flex flex-col justify-start lg:items-start items-center gap-4">
                <Chip text="Quem Somos" />
                <div className="w-full flex flex-col justify-start lg:items-start items-center gap-3">
                  <h1 className="text-black text-xl font-bold leading-normal lg:text-start text-center">
                    A NPi Imóveis nasceu em 2007.
                  </h1>
                  <p className="text-black text-base font-normal leading-relaxed lg:text-start text-center">
                    Com os empreendedores Eduardo Lima e Aline Monteiro de Barros, a ideia inicial
                    era para suprir algumas lacunas de uma mercado imobiliário em plena expansão.
                    Nasciamos com uma proposta inovadora de parcerias B2B com as maiores
                    construtoras do mercado, e com isso, aproximou o nosso cliente final aos donos
                    ou diretores das incorporadoras.
                  </p>
                </div>
              </div>

              {/* Informações de Estatísticas */}
              <div className="w-full flex flex-col justify-center items-start gap-6">
                <div className="w-full grid md:grid-cols-2 grid-cols-1 gap-8">
                  {[
                    {
                      title: "Destaque 01",
                      desc: "lorem ipsum dolor sit amet consectetur adipiscing elit",
                    },
                    {
                      title: "Destaque 02",
                      desc: "lorem ipsum dolor sit amet consectetur adipiscing elit",
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="w-full p-5 rounded-lg bg-zinc-100 hover:border-gray-400 transition-all duration-700 ease-in-out flex flex-col justify-start items-start gap-2.5"
                    >
                      <h4 className="text-gray-900 text-2xl font-bold">{item.title}</h4>
                      <p className="text-gray-500 text-base font-normal leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Botão */}
            <Button link="/" text="Conheça o Hub" />
          </div>

          {/* Imagem */}
          <div className="w-full flex lg:justify-start justify-center items-start">
            <div className="sm:w-[564px] w-full sm:h-[646px] h-auto sm:bg-gray-100 rounded-3xl sm:border border-gray-200 relative">
              <Image
                src="/assets/images/imoveis/02.jpg"
                alt="About Us Image"
                layout="fill"
                objectFit="cover"
                className="sm:mt-5 sm:ml-5 w-full h-full rounded-3xl"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
