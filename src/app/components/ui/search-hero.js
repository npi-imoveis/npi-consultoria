"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

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
    <div className="relative w-[400px] sm:w-[350px] md:w-[600px] xl:w-[950px] bg-gray-100/10 rounded-2xl sm:rounded-full  p-1.5 mb-20 lg:mb-0">
      <form onSubmit={handleSubmit} className="flex flex-col sm:block gap-2 sm:gap-0">
        {/* Ícone de busca */}


        {/* Campo de busca */}
        <input
          type="text"
          className="font-semibold text-[10px] md:text-sm w-full  px-5 py-2 md:py-3 text-white bg-transparent rounded-lg focus:outline-none placeholder-gray-300"
          placeholder="Digite código, endereço, cidade ou condomínio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Botão de busca */}
        <button
          type="submit"
          className="w-full sm:w-auto sm:absolute text-xs md:text-sm right-1 sm:top-1 sm:bottom-1 px-4 md:px-6 py-2 sm:py-0 bg-black/70 text-white font-bold rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#5044e4] flex items-center justify-center"
        >
          <span>Buscar imóveis</span>
        </button>
      </form>
    </div>
  );
}