// src/app/imovel/[id]/[slug]/componentes/LocalizacaoCondominio.js
// ✅ CORREÇÃO CIRÚRGICA - Apenas propriedades da Image otimizadas
// PROBLEMA: priority + sem sizes + sem quality = 8 KiB desperdiçados
// CORREÇÃO: loading="lazy" + sizes responsivo + quality otimizada

"use client";
import { MapsLocator } from "@/app/components/shared/maps-locator";
import { useState } from "react";
import Image from "next/image";

export default function LocalizacaoCondominio({ imovel }) {
  const [showMap, setShowMap] = useState(false);
  
  const handleMapClick = () => {
    setShowMap(true);
  };
  
  return (
    <div className="bg-white container mx-auto p-4 md:p-10 mt-4 border-t-2">
      <h2 className="text-xl font-bold text-black" id="localizacao">
        Localização do {imovel.Empreendimento}
      </h2>
      <address className="text-sm mt-2 not-italic">
        {imovel.TipoEndereco}, {imovel.Endereco}, {imovel.Numero}, {imovel.BairroComercial}-{" "}
        {imovel.Cidade}
      </address>
      <p
        className="mt-8 text-zinc-600 text-base mb-8"
        dangerouslySetInnerHTML={{ __html: imovel.DestaquesLocalizacao }}
        aria-labelledby="localizacao"
      />
      <div className="w-full h-[300px] md:h-[450px] relative">
        {!showMap ? (
          <div
            onClick={handleMapClick}
            className="cursor-pointer relative w-full h-full"
            role="button"
            aria-label="Clique para ver o mapa interativo"
          >
            <Image
              src="/assets/images/map-default.jpg"
              alt={`Localização de ${imovel.Empreendimento}`}
              title={`Localização do ${imovel.Empreendimento}`}
              fill
              className="object-cover"
              // ⚡ CORREÇÕES CRÍTICAS (baseadas no PageSpeed):
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 60vw" // ✅ Sizes responsivo
              quality={65}          // ✅ Qualidade otimizada (era padrão 75)
              loading="lazy"        // ✅ Lazy loading (remove fetchpriority="high")
              priority={false}      // ✅ Não é prioridade (corrige o problema)
              placeholder="blur"    // ✅ UX: Placeholder blur
              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            />
          </div>
        ) : (
          <MapsLocator
            latitude={imovel.Latitude}
            longitude={imovel.Longitude}
            title={`Localização de ${imovel.Empreendimento}`}
          />
        )}
      </div>
    </div>
  );
}
