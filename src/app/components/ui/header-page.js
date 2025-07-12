"use client";
import Image from "next/image";
import { BreadcrumbList } from "@/app/components/structured-data";

export function HeaderPage({ title, description, image, breadcrumb }) {
  const breadcrumbItems = [
    {
      name: "Home",
      url: process.env.NEXT_PUBLIC_SITE_URL,
    },
    {
      name: title,
      url: typeof window !== "undefined" ? window.location.href : "",
    },
  ];

  // Breadcrumb padrão se não for passado
  const defaultBreadcrumb = [
    { label: "Home", active: false },
    { label: "Sobre", active: false },
    { label: title, active: true }
  ];

  const finalBreadcrumb = breadcrumb || defaultBreadcrumb;

  return (
    <div className="relative pt-24 w-full h-[400px] md:h-[450px] lg:h-[500px] md:pt-20 lg:pt-24 flex flex-col justify-end items-center text-center text-white">
      <BreadcrumbList items={breadcrumbItems} />
      
      {/* Fundo com imagem e efeito de overlay escuro */}
      <div className="absolute inset-0">
        <Image
          title="Hub de Imobiliárias Boutique de Alto Padrão"
          src={image}
          layout="fill"
          objectFit="cover"
          objectPosition="center"
          className="opacity-90"
          alt="NPi Imóveis - Hub de Imobiliárias Boutique de Alto Padrão"
          unoptimized
        />
        <div className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"></div>
      </div>
      
      {/* Texto da seção */}
      <div className="relative z-10 max-w-3xl px-4 sm:px-6">
        {/* ✅ ÚNICA H1 da página - mantendo exatamente como estava */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-300">
          {title}
        </h1>
        <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-200">
          {description}
        </p>
      </div>
      
      {/* Breadcrumb visual dinâmico */}
      <div className="relative z-10 w-full mt-10 sm:mt-12 md:mt-16">
        <div className="bg-black w-full py-3 sm:py-4 text-center text-white">
          {finalBreadcrumb.map((item, index) => (
            <span key={index}>
              <span className={item.active ? "text-gray-300" : "font-bold text-white"}>
                {item.label}
              </span>
              {index < finalBreadcrumb.length - 1 && " » "}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
