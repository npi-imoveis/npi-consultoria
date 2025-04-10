import { useState } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

// Carregamento dinâmico do componente Share
const Share = dynamic(() => import("../ui/share").then(mod => mod.Share), {
    ssr: false,
    loading: () => <div className="w-8 h-8"></div>
});

export default function ImageModal({
    images,
    empreendimento,
    selectedIndex,
    setSelectedIndex,
    closeModal,
    goNext,
    goPrev,
    url,
    tituloCompartilhamento,
    imovel
}) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-auto">
            <div className="flex gap-4 p-5">
                <button onClick={closeModal} aria-label="Fechar galeria">
                    <ArrowLeft color="white" size={24} />
                </button>
            </div>
            <div className="fixed top-5 right-5 flex justify-center items-center gap-4 px-5">
                <Share
                    url={url}
                    title={tituloCompartilhamento}
                    imovel={{
                        Codigo: imovel.Codigo,
                        nome: imovel.Empreendimento,
                        Empreendimento: imovel.Empreendimento,
                        BanheiroSocialQtd: imovel.BanheiroSocialQtd,
                        Foto: imovel.Foto,
                        Status: imovel.Status,
                        TipoEndereco: imovel.TipoEndereco,
                        Endereco: imovel.Endereco,
                        ValorAntigo: imovel.ValorAntigo,
                        Numero: imovel.Numero,
                        Dormitorios: imovel.Dormitorios,
                        Suites: imovel.Suites,
                        AreaPrivativa: imovel.AreaPrivativa,
                        id: imovel.id,
                    }}
                />
            </div>

            {selectedIndex !== null ? (
                <div className="flex items-center justify-center min-h-screen p-4 relative">
                    <Image
                        src={images[selectedIndex].Foto}
                        alt={`${empreendimento} - imagem ampliada`}
                        title={`${empreendimento} - imagem ampliada`}
                        width={800}
                        height={600}
                        loading="lazy"
                        quality={75}
                        sizes="(max-width: 640px) 95vw, (max-width: 1024px) 80vw, 70vw"
                        className="max-w-full max-h-screen object-contain"
                        unoptimized
                    />

                    <button
                        onClick={goPrev}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-4xl px-2"
                        aria-label="Imagem anterior"
                    >
                        &#10094;
                    </button>
                    <button
                        onClick={goNext}
                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-4xl px-2"
                        aria-label="Próxima imagem"
                    >
                        &#10095;
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 min-h-screen">
                    {images.map((image, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedIndex(idx)}
                            className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 cursor-pointer overflow-hidden"
                        >
                            <Image
                                src={image.Foto}
                                alt={`${empreendimento} - imagem ${idx + 1}`}
                                title={`${empreendimento} - imagem ${idx + 1}`}
                                fill
                                loading="lazy"
                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                quality={70}
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
} 