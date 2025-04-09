"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumb({ Categoria, Bairro, Cidade, Empreendimento, Codigo }) {
  const items = [
    { name: "Npi Imóveis", href: "/" },
    { name: Categoria, href: `/busca?categoria=${Categoria}` },
    { name: Bairro, href: `/busca?bairro=${Bairro}` },
    { name: Empreendimento, href: "" },
    { name: Codigo, href: "" },
  ];

  return (
    <nav className="text-[10px] text-gray-900 font-bold py-4" aria-label="Breadcrumb">
      <ol className="flex space-x-1">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index !== 0 && <ChevronRight className="w-4 h-4 mx-1 text-gray-900" />}
            <Link href={item.href} className="hover:underline hover:text-gray-900">
              {item.name}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
