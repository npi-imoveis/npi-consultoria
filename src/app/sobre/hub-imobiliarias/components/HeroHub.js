export function HeroHub() {
  return (
    <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 h-[600px] text-white overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/assets/images/imoveis/05.jpg"
          alt="Background Image"
          className="object-cover object-center w-full h-full"
        />
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <div className="relative z-10 flex flex-col justify-center items-center h-full text-center">
        <h1 className="text-2xl uppercase font-bold leading-tight mb-4">
          O HUB de Imobiliárias <br />
          Boutique de Alto Padrão
        </h1>
        <p className="text-lg text-gray-300 mb-8 w-[600px]">
          O HUB de Imobiliárias Boutique de Alto Padrão é um novo e exclusivo
          modelo de negócios no mercado imobiliário, focada em imóveis de luxo,
          criada pela NPi Imóveis.
        </p>
        <a
          href="#"
          className="bg-black text-gray-200 hover:black/20 py-2 px-6 rounded-full text-lg font-semibold transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
        >
          Faça parte do HUB
        </a>
      </div>
    </div>
  );
}
