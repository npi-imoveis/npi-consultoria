// components/AboutSection.js
import Image from "next/image";
import { Button } from "../ui/button";
import { getContentHome } from "@/app/lib/site-content";

export async function AboutSection() {
  const content = await getContentHome();
  return (
    <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-6 py-16 px-10 ">
      <div className="relative flex-1">
        <div className="relative z-10 text-center lg:text-left">
          <span className="bg-[#8B6F4B] text-white px-5 py-2 text-sm font-bold">Quem somos</span>
          <h2 className="text-xl font-bold tracking-tight text-black my-5 uppercase">
            {content["sobre_titulo"]}
          </h2>
          <span className="text-sm font-bold text-zinc-800"> {content["sobre_subtitulo"]}</span>
          <p className="text-black font-medium text-base py-5">
            {content["sobre_descricao"]}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6">
            <Button link="/sobre/hub-imobiliarias" text="Conheça o Hub" />
            {/* <a href="#" className="text-sm font-semibold text-black">
              Seja um parceiro <span aria-hidden="true">→</span>
            </a> */}
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center lg:justify-end">
        <Image
          src="/assets/images/home.jpg"
          alt="Race car"
          width={400}
          height={400}
          className="z-10 w-full max-w-[500px] sm:w-[400px] lg:w-[500px]"
          unoptimized
        />
      </div>
    </div>
  );
}


