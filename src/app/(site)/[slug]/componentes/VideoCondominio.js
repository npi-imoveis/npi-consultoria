"use client";

export default function VideoCondominio({ condominio }) {
    const id = condominio?.Video ? Object.values(condominio.Video)[0]?.Video : null;
    return (
        <div className="bg-white container mx-auto p-10 mt-4 rounded-lg">
            <h2 className="text-xl font-bold text-black">Vídeo {condominio.Empreendimento}</h2>
            <div className="relative w-full pb-[56.25%] h-0 overflow-hidden rounded-lg mt-8 ">
                <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${id}`}
                    title={`Vídeo de apresentação do empreendimento ${condominio.Empreendimento}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
} 