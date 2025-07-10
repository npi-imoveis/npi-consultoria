// src/app/components/sections/seo-links-section.js

"use client";

import Link from "next/link";
import { useSeoUrls } from "@/app/hooks/useSeoUrls";

export default function SeoLinksSection() {
  const { gerarLinksNavegacaoRapida } = useSeoUrls();

  // Gerar apenas alguns links populares para não sobrecarregar a página
  const linksPopulares = [
    {
      url: "/buscar/sao-paulo/venda/apartamentos",
      texto: "Apartamentos à venda em São Paulo",
      descricao: "Encontre apartamentos de alto padrão para compra"
    },
    {
      url: "/buscar/sao-paulo/aluguel/apartamentos",
      texto: "Apartamentos para alugar em São Paulo",
      descricao: "Apartamentos para locação em São Paulo"
    },
    {
      url: "/buscar/sao-paulo/venda/casas",
      texto: "Casas à venda em São Paulo",
      descricao: "Casas de alto padrão para compra"
    },
    {
      url: "/buscar/rio-de-janeiro/venda/apartamentos",
      texto: "Apartamentos à venda no Rio de Janeiro",
      descricao: "Apartamentos de luxo no Rio de Janeiro"
    },
    {
      url: "/buscar/sao-paulo/venda/coberturas",
      texto: "Coberturas à venda em São Paulo",
      descricao: "Coberturas de alto padrão para compra"
    },
    {
      url: "/buscar/rio-de-janeiro/venda/coberturas",
      texto: "Coberturas à venda no Rio de Janeiro",
      descricao: "Coberturas de luxo no Rio de Janeiro"
    }
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Explore Imóveis por Categoria
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Navegue pelas nossas categorias mais populares de imóveis de alto padrão
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {linksPopulares.map((link, index) => (
            <Link
              key={index}
              href={link.url}
              className="group bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors duration-200 border border-gray-200 hover:border-gray-300"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-black">
                {link.texto}
              </h3>
              <p className="text-gray-600 text-sm">
                {link.descricao}
              </p>
              <div className="mt-4 text-sm text-blue-600 group-hover:text-blue-700 font-medium">
                Ver imóveis →
              </div>
            </Link>
          ))}
        </div>

        {/* Links adicionais para SEO */}
        <div className="mt-12 border-t pt-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Outras Opções
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <Link href="/buscar/belo-horizonte/venda/apartamentos" className="text-gray-600 hover:text-black transition-colors">
              Apartamentos BH
            </Link>
            <Link href="/buscar/brasilia/venda/apartamentos" className="text-gray-600 hover:text-black transition-colors">
              Apartamentos Brasília
            </Link>
            <Link href="/buscar/salvador/venda/apartamentos" className="text-gray-600 hover:text-black transition-colors">
              Apartamentos Salvador
            </Link>
            <Link href="/buscar/fortaleza/venda/apartamentos" className="text-gray-600 hover:text-black transition-colors">
              Apartamentos Fortaleza
            </Link>
            <Link href="/buscar/curitiba/venda/apartamentos" className="text-gray-600 hover:text-black transition-colors">
              Apartamentos Curitiba
            </Link>
            <Link href="/buscar/recife/venda/apartamentos" className="text-gray-600 hover:text-black transition-colors">
              Apartamentos Recife
            </Link>
            <Link href="/buscar/porto-alegre/venda/apartamentos" className="text-gray-600 hover:text-black transition-colors">
              Apartamentos Porto Alegre
            </Link>
            <Link href="/buscar/manaus/venda/apartamentos" className="text-gray-600 hover:text-black transition-colors">
              Apartamentos Manaus
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}