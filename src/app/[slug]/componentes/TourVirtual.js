"use client";

export default function TourVirtual({ condominio }) {
    const tourExiste = condominio && condominio.Tour360;

    if (!tourExiste) {
        return null;
    }

    return (
        <div className="bg-white container mx-auto p-10 mt-4 rounded-lg">
            <h2 className="text-xl font-bold text-black">Tour Virtual {condominio.Empreendimento}</h2>
            <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mt-6">
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={condominio.Tour360}
                    title={`Tour Virtual 360° do empreendimento ${condominio.Empreendimento}`}
                    frameBorder="0"
                    allow="fullscreen"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
} 