"use client";
import { useState } from "react";
import Image from "next/image";

export default function TourVirtual({ link, titulo = "Tour Virtual" }) {
  const [isIframeLoaded, setIsIframeLoaded] = useState(false);
  
  const handleLoadIframe = () => {
    setIsIframeLoaded(true);
  };
  
  return (
    <div className="bg-white container mx-auto p-4 md:p-10 mt-4 border-t-2">
      <h2 className="text-xl font-bold text-black" id="tour-virtual">
        Tour Virtual {titulo}
      </h2>
      <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mt-6">
        {isIframeLoaded ? (
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={link}
            title={`Tour Virtual 360° - ${titulo}`}
            frameBorder="0"
            allow="fullscreen"
            allowFullScreen
            loading="lazy"
          ></iframe>
        ) : (
          <div
            className="absolute top-0 left-0 w-full h-full cursor-pointer"
            onClick={handleLoadIframe}
          >
            {/* ✅ OTIMIZAÇÃO CRÍTICA: tour_placeholder.jpg (38 KiB economia) */}
            <div style={{ aspectRatio: '857/482', width: '100%', height: '100%' }}>
              <Image
                src="/assets/images/tour_placeholder.jpg"
                alt={`Placeholder para o Tour Virtual - ${titulo}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                loading="lazy"
                quality={80}
                className="object-cover rounded-lg"
                priority={false}
              />
            </div>
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <button 
                className="text-white bg-black/40 px-4 py-2 rounded-lg hover:bg-black/20 transition"
                aria-label={`Iniciar Tour Virtual de ${titulo}`}
              >
                Iniciar Tour Virtual
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
