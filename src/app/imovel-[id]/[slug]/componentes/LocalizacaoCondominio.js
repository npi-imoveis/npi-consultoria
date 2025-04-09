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
            <h2 className="text-xl font-bold text-black" id="localizacao">Localização do {imovel.Empreendimento}</h2>
            <address className="text-sm mt-2 not-italic">
                {imovel.TipoEndereco}, {imovel.Endereco}, {imovel.Numero}, {imovel.BairroComercial}- {imovel.Cidade}
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
                            fill
                            className="object-cover"
                            priority
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