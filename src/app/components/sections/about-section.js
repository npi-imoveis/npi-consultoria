// src/app/components/sections/about-section.js
import Image from "next/image";
import { Button } from "../ui/button";

export async function AboutSection({ about }) {
  return (
    <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-6 py-16 px-10 ">
      <div className="relative flex-1">
        <div className="relative z-10 text-center lg:text-left">
          <span className="bg-[#8B6F4B] text-white px-5 py-2 text-sm font-bold">Quem somos</span>
          <h2 className="text-xl font-bold tracking-tight text-black my-5 uppercase">
            {about?.titulo || "HUB de Imobiliárias Boutique de Alto Padrão"}
          </h2>
          <span className="text-sm font-bold text-zinc-800">
            {" "}
            {about?.subtitulo || "Conectando sua imobiliária aos clientes de HIGH TICKET."}
          </span>
          <p className="text-black font-medium text-base py-5">
            {about?.descricao ||
              "Somos um ecossistema colaborativo que reúne imobiliárias boutique especializadas em imóveis de alto padrão, oferecendo uma estratégia inovadora para a captação de clientes de high ticket altamente qualificados. Combinamos tecnologia, atendimento premium e uma seleção rigorosa de propriedades para oferecer uma experiência única na compra e venda de imóveis sofisticados para nossos clientes"}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
            <Button link="/sobre/hub-imobiliarias" text="Conheça o Hub" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center lg:justify-end">
        <Image
          src="/uploads/home/about.jpg"
          alt="Race car"
          width={400}
          height={400}
          className="z-10 w-full max-w-[500px] sm:w-[400px] lg:w-[500px]"
        />
      </div>
    </div>
  );
}
