import Image from "next/image";

export function ComoFuncionaHub() {
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
              Colaboração eficiente
            </h1>
            <p className="text-lg leading-relaxed text-gray-300">
              A NPI com mais de 5000 posições na 1ª página do Google, é
              responsável por gerar todos os clientes, já pré-qualificados com
              tecnologia de ponta, para as imobiliárias parceiras do HUB. E
              esses parceiros, especializados na região setorizada, receberão
              toda demanda desses clientes pré-qualificados.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-black/40 p-6 rounded-md shadow-lg">
            <h1 className="text-xl uppercase font-semibold mb-2">
              Conexão e treinamento
            </h1>
            <p className="text-lg leading-relaxed text-gray-300">
              Para garantir a coesão e a eficácia do HUB, realizamos reuniões de
              alinhamento mensais, onde todas as imobiliárias parceiras
              participam para discutir estratégias, compartilhar experiências e
              ajustar abordagens conforme necessário.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-black/40 p-6 rounded-md shadow-lg">
            <h1 className="text-xl uppercase font-semibold mb-2">
              Ecossistema do HUB
            </h1>
            <p className="text-lg leading-relaxed text-gray-300">
              O HUB é mais do que uma rede de imobiliárias; é um ecossistema
              dinâmico que une tecnologia, especialização e colaboração. Cada
              parceiro é escolhido com base em critérios rigorosos, incluindo
              conhecimento de mercado e compromisso com a excelência.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
