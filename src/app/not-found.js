//  src/app/not-found.js

import Link from "next/link";

// ✅ ADICIONADO: Metadata para página 404
export const metadata = {
  title: "Página não encontrada - NPi Consultoria",
  description: "A página que você está procurando não foi encontrada.",
  // Não definir robots - Google entende 404 naturalmente
};

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center bg-zinc-100 min-h-[700px]">
        <div className="container mx-auto px-4 py-20 flex flex-col items-center text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-[#8B6F4B]">404</h1>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-black">
            Página não encontrada
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-700">
            A página do imóvel que você está procurando pode ter sido removida, teve seu nome
            alterado ou está temporariamente indisponível.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-[#8B6F4B] text-white py-3 px-8 rounded-md hover:bg-[#6B543B] transition-colors duration-300 uppercase tracking-wider font-bold text-sm"
            >
              Voltar para a Home
            </Link>
            <Link
              href="/busca"
              className="bg-black text-white py-3 px-8 rounded-md hover:bg-gray-800 transition-colors duration-300 uppercase tracking-wider font-bold text-sm"
            >
              Buscar Imóveis
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
