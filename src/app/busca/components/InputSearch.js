export function InputSearch() {
  return (
    <div className="relative w-full bg-white rounded-full transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-lg">
      {/* Ícone de busca */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>

      {/* Campo de busca */}
      <input
        type="text"
        className="font-semibold w-full pl-10 pr-24 py-3  text-zinc-600 bg-transparent rounded-lg focus:outline-none placeholder-gray-300"
        placeholder="Digite o código, endereço, cidade ou condomínio..."
      />

      {/* Botão de busca */}
      <button className="absolute text-xs uppercase right-1 top-1 bottom-1 px-4 md:px-6 bg-black text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5044e4]">
        <span>Buscar imóveis</span>
      </button>
    </div>
  );
}
