import { getContentSobre } from "@/app/lib/site-content";
import Image from "next/image";

export async function ComoFuncionaHub() {
  const content = await getContentSobre();
  return (
    <section className="relative bg-black text-white py-16">
      {/* Background escurecido */}
      <div className="absolute inset-0">
        <Image
          src="/assets/images/meet.jpg" // Substitua pelo caminho correto da sua imagem
          alt="Background"
          layout="fill"
          objectFit="cover"
          className="opacity-50"
          unoptimized
        />
        <div className="absolute inset-0 bg-black opacity-60"></div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 container mx-auto px-6 flex flex-col lg:flex-row items-start gap-12">
        {/* Título e botão */}
        <div className="lg:w-1/3">
          <h1 className="text-xl uppercase font-semibold leading-snug">
            Como funciona o HUB
          </h1>
          <button className="mt-8 bg-white text-black font-medium py-2 px-4 rounded-md shadow-md flex items-center gap-2">
            Faça parte
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.293l3.71-4.06a.75.75 0 111.1 1.02l-4.25 4.65a.75.75 0 01-1.1 0l-4.25-4.65a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {/* Cartões de informação */}
        <div className="lg:w-2/3 space-y-8">
          {/* Card 1 */}
          <div className="bg-black/40 p-6 rounded-md shadow-lg">
            <h1 className="text-xl uppercase font-semibold mb-2">
              {content["sobre_page_howto_title"]}
            </h1>
            <p className="text-lg leading-relaxed text-gray-300">
              {content["sobre_page_howto_description"]}
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-black/40 p-6 rounded-md shadow-lg">
            <h1 className="text-xl uppercase font-semibold mb-2">
              {content["sobre_page_howto_title2"]}
            </h1>
            <p className="text-lg leading-relaxed text-gray-300">
              {content["sobre_page_howto_description2"]}
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-black/40 p-6 rounded-md shadow-lg">
            <h1 className="text-xl uppercase font-semibold mb-2">
              {content["sobre_page_howto_title3"]}
            </h1>
            <p className="text-lg leading-relaxed text-gray-300">
              {content["sobre_page_howto_description3"]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
