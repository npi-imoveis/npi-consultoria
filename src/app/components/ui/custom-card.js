// components/ui/custom-card.js
import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function CustomCard({ 
  id, 
  image, 
  title, 
  description, 
  sign, 
  slug,
  // ✅ NOVAS PROPS para otimização das imagens
  imageTitle,
  imageAlt,
  loading = "lazy"
}) {
  // ✅ FALLBACKS para title e alt se não foram passados
  const finalImageTitle = imageTitle || `${title} - ${description} - NPi Imóveis`;
  const finalImageAlt = imageAlt || `${title} - ${sign} - NPi Imóveis`;
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={slug ? `/${slug}` : `/condominio/${id}`}>
        <div className="relative h-48 w-full">
          {image ? (
            <Image
              src={image}
              alt={finalImageAlt}
              title={finalImageTitle} // ✅ TITLE IMPLEMENTADO
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              loading={loading}
              quality={75}
            />
          ) : (
            // ✅ PLACEHOLDER com title e alt também
            <div 
              className="w-full h-full bg-gray-200 flex items-center justify-center"
              title={`${title} - Imagem não disponível - NPi Imóveis`}
              role="img"
              aria-label={`${title} - Imagem não disponível`}
            >
              <span className="text-gray-500 text-sm">Sem imagem</span>
            </div>
          )}
          
          {/* ✅ SETA CIRCULAR (igual sua versão original) */}
          <div className="absolute bottom-4 right-4 w-12 h-12 bg-amber-600 bg-opacity-80 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all duration-300">
            <ArrowRightIcon className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
            {description}
          </p>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
            {sign}
          </span>
        </div>
      </Link>
    </div>
  );
}
