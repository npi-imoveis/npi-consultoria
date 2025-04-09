"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchHero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (searchTerm.trim() === "") return;

    // Redireciona para a página de busca com o parâmetro de busca
    router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="relative w-[450px] md:w-[600px] xl:w-[950px] bg-gray-100/10 rounded-full shadow-md p-1.5 transition-all duration-150 ease-in-out hover:scale-105 hover:shadow-lg">
      <form onSubmit={handleSubmit}>
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
          className="font-semibold text-[10px] md:text-sm w-full pl-10 pr-24 py-2 md:py-3 text-white bg-transparent rounded-lg focus:outline-none placeholder-gray-300"
          placeholder="Digite código, endereço, cidade ou condomínio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Botão de busca */}
        <button
          type="submit"
          className="absolute text-xs md:text-sm right-1 top-1 bottom-1 px-4 md:px-6 bg-black/70 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5044e4] flex items-center"
        >
          <span>Buscar imóveis</span>
        </button>
      </form>
    </div>
  );
}