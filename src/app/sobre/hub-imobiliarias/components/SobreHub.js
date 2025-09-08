import Image from "next/image";

export async function SobreHub({ sobre }) {
  return (
    <section className="w-full mx-auto py-10 bg-gray-50 dark:bg-gray-900 dark:text-white">
      <div className="container mx-auto h-full flex flex-col items-center md:py-4 py-10">
        {/* Seção 1 */}
        <div className="xl:w-[80%] sm:w-[85%] w-[90%] mx-auto flex flex-col md:flex-row lg:gap-4 gap-6 justify-center lg:items-stretch md:items-center mt-4">
          <div className="md:w-[50%] w-full relative h-64 md:h-auto">
            <Image
               title="O que somos - Hub de Imobiliárias Boutique de Alto Padrão"
              src="/assets/images/home.jpg"
              alt="Imagem do HUB"
              layout="fill"
              objectFit="cover"
              className="md:rounded-t-lg rounded-sm"
              unoptimized
            />
          </div>

          <div className="md:w-[50%] w-full dark:bg-gray-900 dark:text-gray-400 md:p-6 p-4 rounded-md">
            <h2 className="text-2xl uppercase font-semibold text-gray-900 dark:text-white">
              {sobre?.titulo || "CONHEÇA O HUB"}
            </h2>
            <p className="text-lg mt-4 leading-relaxed whitespace-pre-line">
              {sobre?.descricao ||
                `Seus imóveis de alto padrão merecem estar onde os clientes realmente procuram: NA PRIMEIRA PÁGINA DO GOOGLE.
                 Alcançamos a primeira página do Google com seus imóveis de alto padrão, conectando-os a clientes de alto nível e real intenção de compra, qualificamos esses clientes, enviamos para seu atendimento, e assim, alavancamos resultados concretos para sua imobiliária.
                 Nosso serviço é dar visibilidade aos imóveis da sua imobiliária, captar, qualificar os clientes e alavancar negócios através do posicionamento orgânico(SEO) na maior vitrine do mundo: o Google.
               
                O HUB de Imobiliárias Boutique de Alto Padrão foi dealizado por Eduardo Lima, fundador da NPi Imóveis, com mais de 20 anos de experiência no mercado imobiliário, e hoje é maior presença orgânica no Google do setor de alto padrão em São Paulo. 
                No inicio da NPi, como acontece com a maioria imobiliárias, ele dependia de portais para gerar clientes para sua empresa; Isatisfeito com a qualidade desses clientes, Eduardo Lima uniu sua bagagem de tecnologia à sua vivência no setor imobiliário para construir uma nova lógica: não estar dentro dos portais, mas sim onde os portais estão, ou seja, na Primeira Página do Google.
                Buscando especialização em SEO desde 2010, a NPi se tornou conhecida no digital e referência em SEO no mercado imobiliário de alto padrão em São Paulo, com mais de 5.000 posições orgânicas e resultados consistentes sem depender de mídias tradicionais pagas. 
                Hoje a NPi tem como propósito transbordar esse Know-how, e alavancar negócios para as imobiliárias pertencentes a esse ecossistema.`}
            </p>
          </div>
        </div>

        {/* Seção 2 */}
        <div className="xl:w-[80%] sm:w-[85%] w-[90%] mx-auto flex flex-col-reverse md:flex-row lg:gap-4 gap-6 justify-center lg:items-stretch md:items-center mt-8">
          <div className="md:w-[50%] w-full dark:bg-gray-900 dark:text-gray-400 md:p-6 p-4 rounded-md">
            <h2 className="text-2xl uppercase font-semibold text-gray-900 dark:text-white">
              {sobre?.titulo1 || "O futuro do mercado imobiliário começa na Primeira Página do Google"}
            </h2>
            <p className="text-lg mt-4 leading-relaxed whitespace-pre-line">
              {sobre?.descricao1 ||
                `POSICIONAMENTO + SUPORTE COMPLETO

	•	Cadastro qualificado dos imóveis
	•	Relatório de posicionamento e visibilidade
	•	Exclusividade do imóvel cadastrado
	•	Geração de cliente qualificado (E Gifts) 
    •	Gifts: clientes para imóveis das construtoras
	•	Pré-atendimento por IA e SDR humano
	•	Encaminhamento ao corretor especialista
	•	CRM integrado
	•	App com aviso sonoro de novos clientes
	•	Acompanhamento de performance por gerente dedicado

CURADORIA DOS PARCEIROS:

Cada imobiliária dentro do nosso HUB é cuidadosamente selecionada para atuar em regiões específicas, onde já possui um profundo conhecimento de mercado. Isso permite que cada parceiro ofereça um serviço mais personalizado, assertivo e eficiente, resultando em maior conversão dos nossos clientes qualificados.

ECONOMIA COM MARKETING

As imobiliárias quando ingressam no HUB NPi, quando recebem clientes qualificados, também se beneficiam com uma alta redução de custos de marketing com portais e redes sociais.`}
            </p>
          </div>

          <div className="md:w-[50%] w-full relative h-64 md:h-auto">
            <Image
              title="Setorização - O futuro do mercado imobiliário" 
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
