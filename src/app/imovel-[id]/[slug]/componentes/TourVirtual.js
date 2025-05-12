"use client";

import { useState } from "react";

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
            <img
              src="/assets/images/tour_placeholder.jpg"
              alt={`Placeholder para o Tour Virtual - ${titulo}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <button className="text-white bg-black/40 px-4 py-2 rounded-lg hover:bg-black/20 transition">
                Iniciar Tour Virtual
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
