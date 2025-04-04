"use client";

import { MapsLocator } from "@/app/components/shared/maps-locator";
import dynamic from 'next/dynamic';

const Contato = dynamic(() => import('./Contato'), {
    loading: () => <div className="w-full h-96 bg-zinc-100 animate-pulse rounded-lg"></div>
});

export default function ExploreRegiao({ condominio, currentUrl }) {
    return (
        <div className="container mx-auto flex flex-col md:flex-row gap-4 bg-gray-100 mt-4 rounded-lg">
            <div className="bg-white p-10 rounded-lg flex-1">
                <h2 className="text-xl font-bold">Explore no mapa a região</h2>
                <p className="text-gray-600 text-sm mt-1">
                    Encontre imóveis que estão próximos ao condomínio Living Wish Santo Amaro
                </p>
                <div className="mt-4 relative w-full h-full rounded-lg overflow-hidden">
                    <MapsLocator latitude={condominio.Latitude} longitude={condominio.Longitude} />
                </div>
            </div>

            <div className="bg-white p-10 rounded-lg flex-1">
                <Contato condominio={condominio} currentUrl={currentUrl} bairro={condominio.BairroComercial} />
            </div>
        </div>
    );
} 