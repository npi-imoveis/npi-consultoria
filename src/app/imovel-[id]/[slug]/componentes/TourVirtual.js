"use client";

export default function TourVirtual({ link, titulo = "Tour Virtual" }) {
    return (
        <div className="bg-white container mx-auto p-4 md:p-10 mt-4 border-t-2">
            <h2 className="text-xl font-bold text-black" id="tour-virtual">Tour Virtual {titulo}</h2>
            <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mt-6">
                {link ? (
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
                    <p className="text-center py-10 bg-zinc-100 rounded-lg">Tour virtual não disponível</p>
                )}
            </div>
        </div>
    );
} 