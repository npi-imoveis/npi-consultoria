import Image from "next/image";

export async function SobreHub({ sobre }) {
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
              {sobre?.titulo || "O que somos"}
            </h1>
            <p className="text-lg mt-4 leading-relaxed">
              {sobre?.descricao ||
                "O HUB de Imobiliárias Boutique de Alto Padrão é um novo e exclusivo modelo de negócios no mercado imobiliário, focado em imóveis de luxo, criado pela NPi Imóveis. O HUB é uma rede colaborativa que reúne imobiliárias especialistas em determinadas regiões, oferecendo uma estratégia inovadora para a captação de clientes de high ticket qualificados e redução de custos com marketing para imobiliárias do HUB."}
            </p>
          </div>
        </div>

        {/* Seção 2 */}
        <div className="xl:w-[80%] sm:w-[85%] w-[90%] mx-auto flex flex-col-reverse md:flex-row lg:gap-4 gap-6 justify-center lg:items-stretch md:items-center mt-8">
          <div className="md:w-[50%] w-full dark:bg-gray-900 dark:text-gray-400 md:p-6 p-4 rounded-md">
            <h1 className="text-2xl uppercase font-semibold text-gray-900 dark:text-white">
              {sobre?.titulo1 || "Setorização e Especialização"}
            </h1>
            <p className="text-lg mt-4 leading-relaxed">
              {sobre?.descricao1 ||
                "Cada imobiliária dentro do nosso HUB é cuidadosamente selecionada para atuar em regiões específicas, onde já possui um profundo conhecimento de mercado. Isso permite que cada parceiro ofereça um serviço mais personalizado, assertivo e eficiente, resultando em maior conversão dos nossos clientes qualificados."}
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
