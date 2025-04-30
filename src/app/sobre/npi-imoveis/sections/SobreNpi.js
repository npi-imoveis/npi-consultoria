import { Button } from "@/app/components/ui/button";
import { Chip } from "@/app/components/ui/chip";
import Image from "next/image";

export default async function SobreNPI({ sobre }) {
  return (
    <section className="py-24 relative xl:mr-0 lg:mr-5 mr-0">
      <div className="w-full max-w-7xl px-4 md:px-5 lg:px-5 mx-auto">
        <div className="w-full justify-start items-center xl:gap-12 gap-10 grid lg:grid-cols-2 grid-cols-1">
          <div className="w-full flex flex-col justify-center lg:items-start items-center gap-10">
            <div className="w-full flex flex-col justify-center items-start gap-8">
              <div className="flex flex-col justify-start lg:items-start items-center gap-4">
                <Chip text="Quem Somos" />
                <div className="w-full flex flex-col justify-start lg:items-start items-center gap-3">
                  <h1 className="text-black text-xl font-bold leading-normal lg:text-start text-center">
                    {sobre?.title || "A NPi Imóveis nasceu em 2007"}
                  </h1>
                  <p className="text-black text-base font-normal leading-relaxed lg:text-start text-center">
                    {sobre?.description ||
                      "Com os empreendedores Eduardo Lima e Aline Monteiro de Barros, a ideia inicial era para suprir algumas lacunas de uma mercado imobiliário em plena expansão."}
                  </p>
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
                src="/uploads/sobre_npi/sobre.jpg"
                alt="Sobre NPI"
                layout="fill"
                objectFit="cover"
                className="sm:mt-5 sm:ml-5 w-full h-full rounded-3xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
