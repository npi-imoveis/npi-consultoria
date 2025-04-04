"use client";

import Image from "next/image";

export function HistoriaNpi() {
  const historyData = [
    {
      year: "2007 - 2010",
      title: "Consultoria Personalizada",
      description:
        "A operação foi pensada não como uma imobiliária tradicional, mas sim como uma consultoria personalizada que se preocupava com a dor de cada cliente, oferecendo uma alternativa segura e eficaz para o desgastante processo de busca por imóveis.",
      image: "/assets/images/sobre/01.jpg",
    },
    {
      year: "2008",
      title: "Lançamento do novo site",
      description:
        "A NPi lança seu novo site, dinâmico, focado em SEO e de conteúdo aberto. Uma ferramenta de busca eficaz e completa para quem buscava lançamentos em São Paulo.",
      image: "/assets/images/sobre/03.jpg",
    },
    {
      year: "2011 - 2016",
      title: "Nova sede em Moema",
      description:
        "Em 2011, a NPi inaugura sua nova sede em Moema, ampliando sua estrutura física e fortalecendo seu time de vendas. O site é reformulado para destacar ainda mais as vantagens oferecidas aos clientes.",
      image: "/assets/images/sobre/03.jpg",
    },
    {
      year: "2017",
      title: "Mudança para Brooklin",
      description:
        "A NPi se muda para o edifício LWM CORPORATE no Brooklin, adotando um formato mais moderno, enxuto e tecnológico, consolidando-se nas primeiras páginas do Google e no mercado imobiliário.",
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
