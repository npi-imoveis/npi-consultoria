"use client";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

export default function CustomCard({
  id,
  image,
  sign,
  slug,
  title,
  description,
  aspect = "aspect-[3/2]",
  // ✅ APENAS ADICIONEI ESTAS PROPS
  imageTitle,
  imageAlt,
  loading = "lazy"
}) {
  // ✅ FALLBACKS para title e alt
  const finalImageTitle = imageTitle || `${title} - ${description} - NPi Imóveis`;
  const finalImageAlt = imageAlt || title || "Imagem do condomínio";

  return (
    <div className="relative w-full h-auto overflow-hidden shadow-lg group">
      <div className={`relative w-full ${aspect} overflow-hidden bg-gray-200`}>
        {image ? (
          <Image
            src={image}
            alt={finalImageAlt} // ✅ USANDO O ALT OTIMIZADO
            title={finalImageTitle} // ✅ ADICIONEI APENAS ESTA LINHA
            fill
            style={{ objectFit: "cover" }}
            priority
            className="transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            Sem imagem disponível
          </div>
        )}
      </div>
      <div className="absolute inset-0 bg-black/70" />
      <div className="absolute bottom-0 left-0 right-0 p-10 text-white flex items-center justify-between">
        <div>
          <span className="text-xs sm:text-sm block mb-1 text-white/40">
            {sign || "Condomínio"}
          </span>
          <h3 className="font-semibold text-xl leading-tight text-white/70">
            {title
              ? title.length > 20
                ? title.substring(0, 20) + "..."
                : title
              : "Título não disponível"}
          </h3>
          {description && (
            <p className="font-medium text-sm leading-tight text-zinc-300 mt-2">{description}</p>
          )}
        </div>
        {slug && (
          <Link href={`/${slug}`} target="_blank" rel="noopener noreferrer">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#8B6F4B] text-white rounded-full shadow-md hover:bg-[#d8b887] transition-colors">
              <ArrowRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
