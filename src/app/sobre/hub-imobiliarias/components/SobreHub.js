import Image from "next/image";
import { getContentSobre } from "@/app/lib/site-content";

export async function SobreHub() {
  const content = await getContentSobre();
  return (
    <section className="w-full mx-auto py-10 bg-gray-50 dark:bg-gray-900 dark:text-white">
      <div className="container mx-auto h-full flex flex-col items-center md:py-4 py-10">
        {/* Seção 1 */}
        <div className="xl:w-[80%] sm:w-[85%] w-[90%] mx-auto flex flex-col md:flex-row lg:gap-4 gap-6 justify-center lg:items-stretch md:items-center mt-4">
          <div className="md:w-[50%] w-full relative h-64 md:h-auto">
            <Image
              src="/assets/images/home.jpg"
              alt="Imagem do HUB"
              layout="fill"
              objectFit="cover"
              className="md:rounded-t-lg rounded-sm"
              unoptimized
            />
          </div>

          <div className="md:w-[50%] w-full dark:bg-gray-900 dark:text-gray-400 md:p-6 p-4 rounded-md">
            <h1 className="text-2xl uppercase font-semibold text-gray-900 dark:text-white">
              {content["sobre_page_titulo"]}
            </h1>
            <p className="text-lg mt-4 leading-relaxed">
              {content["sobre_page_descricao"]}
            </p>
          </div>
        </div>

        {/* Seção 2 */}
        <div className="xl:w-[80%] sm:w-[85%] w-[90%] mx-auto flex flex-col-reverse md:flex-row lg:gap-4 gap-6 justify-center lg:items-stretch md:items-center mt-8">
          <div className="md:w-[50%] w-full dark:bg-gray-900 dark:text-gray-400 md:p-6 p-4 rounded-md">
            <h1 className="text-2xl uppercase font-semibold text-gray-900 dark:text-white">
              {content["sobre_page_titulo1"]}
            </h1>
            <p className="text-lg mt-4 leading-relaxed">
              {content["sobre_page_descricao2"]}
            </p>
          </div>

          <div className="md:w-[50%] w-full relative h-64 md:h-auto">
            <Image
              src="/assets/images/setorizacao.jpg"
              alt="Imagem do HUB"
              layout="fill"
              objectFit="cover"
              className="md:rounded-t-lg rounded-sm"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
