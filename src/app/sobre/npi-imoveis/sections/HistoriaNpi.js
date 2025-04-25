

import Image from "next/image";
import { getContentSobreNpi } from "@/app/lib/site-content";

export async function HistoriaNpi() {

  const content = await getContentSobreNpi();
  const historyData = [
    {
      year: "2007 - 2010",
      title: content["sobrenpi_ano_title"],
      description: content["sobrenpi_ano_description"],
      image: "/assets/images/sobre/01.jpg",
    },
    {
      year: "2008",
      title: content["sobrenpi_ano1_title"],
      description: content["sobrenpi_ano1_description"],
      image: "/assets/images/sobre/03.jpg",
    },
    {
      year: "2011 - 2016",
      title: content["sobrenpi_ano2_title"],
      description: content["sobrenpi_ano2_description"],
      image: "/assets/images/sobre/03.jpg",
    },
    {
      year: "2017",
      title: content["sobrenpi_ano3_title"],
      description: content["sobrenpi_ano3_description"],
      image: "/assets/images/sobre/04.jpg",
    },
  ];

  return (
    <section className="bg-zinc-100 py-24 px-6 lg:px-0">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-xl uppercase font-bold text-black">Nossa História</h1>
          <p className="text-lg max-w-2xl mx-auto mt-4">
            Conheça a evolução da NPi e como nos tornamos referência no mercado imobiliário de alto
            padrão.
          </p>
        </div>

        {/* Linha do Tempo */}
        <div className="relative border-l-4 border-zinc-200 pl-8 lg:pl-12 space-y-16">
          {historyData.map((item, index) => (
            <div key={index} className="flex flex-col lg:flex-row items-center gap-8 group">
              {/* Texto */}
              <div className="lg:w-1/2 text-center lg:text-left">
                <h1 className="text-2xl font-semibold text-black group-hover:text-[#8B6F4B text-white] transition duration-300">
                  {item.year}
                </h1>
                <h1 className="text-xl font-bold text-gray-900 mt-2">{item.title}</h1>
                <p className="text-black text-lg mt-4">{item.description}</p>
              </div>

              {/* Imagem */}
              <div className="lg:w-1/2">
                <div className="relative w-full h-[250px] lg:h-[300px] rounded-lg overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
