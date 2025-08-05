"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function SearchHero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() === "") return;
    
    // Redireciona para a página de busca com o parâmetro de busca
    router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div className="relative w-[400px] sm:w-[350px] md:w-[600px] xl:w-[950px] bg-gray-100/10 rounded-2xl sm:rounded-full p-1.5 mb-20 lg:mb-0 transform translate-z-0">
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:block gap-2 sm:gap-0"
      >
        {/* Campo de busca - CORREÇÃO iOS */}
        <input
          type="search"
          className="
            font-semibold w-full px-5 py-2 md:py-3 
            text-white bg-transparent rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-white/30 
            placeholder-gray-300 transition-all duration-200
            text-base /* 16px - CRÍTICO para iOS */
            md:text-lg /* 18px para desktop */
          "
          placeholder="Digite código, endereço, cidade ou condomínio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            // Propriedades críticas para iOS
            WebkitAppearance: 'none',
            WebkitBorderRadius: '8px',
            touchAction: 'manipulation',
            WebkitTouchCallout: 'none',
            WebkitUserSelect: 'text',
            WebkitTapHighlightColor: 'transparent',
          }}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
        />

        {/* Botão de busca */}
        <button
          type="submit"
          className="
            w-full sm:w-auto sm:absolute 
            text-sm md:text-base /* Consistente com input */
            right-1 sm:top-1 sm:bottom-1 
            px-4 md:px-6 py-2 sm:py-0 
            bg-black/70 hover:bg-black/80 
            text-white font-bold rounded-full 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 
            flex items-center justify-center 
            transition-all duration-200
          "
          style={{
            touchAction: 'manipulation',
            WebkitTapHighlightColor: 'transparent',
            WebkitTouchCallout: 'none',
          }}
          aria-label="Buscar imóveis"
        >
          <span>Buscar imóveis</span>
        </button>
      </form>
    </div>
  );
}
