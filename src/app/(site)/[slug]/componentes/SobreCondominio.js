"use client";

import { useState } from "react";
import { Home, Bed, Car, Calendar, Building } from "lucide-react";
import { formatterDate } from "@/app/utils/formatter-date";
import dynamic from 'next/dynamic';

const CondominioGallery = dynamic(() => import('./condominio-gallery'), {
    loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>
});

const DetalhesCondominioSobre = dynamic(() => import('./DetalhesCondominioSobre'), {
    loading: () => <div className="w-full h-64 bg-zinc-100 animate-pulse rounded-lg"></div>
});

export default function SobreCondominio({ condominio }) {
    return (
        <div className="bg-white rounded-lg container mx-auto p-10 mt-4">
            <h2 className="text-xl font-bold text-black">
                Mais sobre {condominio.Categoria} {condominio.Empreendimento}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
                <CondominioGallery fotos={condominio.Foto} title={condominio.Empreendimento} second />
                <DetalhesCondominioSobre condominio={condominio} />
            </div>
        </div>
    );
}

// Função que retorna o maior número de vagas do condomínio
function getMaxVagas(condominio) {
    const vagasProps = [
        "Vagas",
        "Vagas1",
        "Vagas2",
        "Vagas3",
        "Vagas4",
        "Vagas5",
        "Vagas6",
        "Vagas7",
        "Vagas8",
    ];

    let maxVagas = 0;

    vagasProps.forEach((prop) => {
        if (condominio[prop]) {
            const vagasValue = parseInt(condominio[prop]);
            if (!isNaN(vagasValue) && vagasValue > maxVagas) {
                maxVagas = vagasValue;
            }
        }
    });

    return maxVagas;
}

function DetalhesCondominio({ condominio }) {
    const [expanded, setExpanded] = useState(false);
    const maxVagas = getMaxVagas(condominio);

    return (
        <div className="max-w-lg mx-auto p-6 text-black font-sans">
            <h1 className="font-semibold">
                {condominio.Categoria} {condominio.Status}
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <Home size={18} />
                <span className="text-sm">A partir de {condominio.MetragemAnt}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Bed size={18} />
                <h2 className="text-sm">Imóveis com {condominio.DormitoriosAntigo} quartos</h2>
            </div>

            <h1 className="font-semibold mt-6">Condomínio</h1>
            <div className="flex items-center gap-2 mt-2">
                <Car size={18} />
                <span className="text-sm">
                    Garagens com até {maxVagas > 0 ? maxVagas : condominio.Vagas} vagas
                </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
                <Calendar size={18} />
                <span className="text-sm">Data de entrega: {formatterDate(condominio.DataEntrega)}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Building size={18} />
                <h2 className="text-sm">Construtora: {condominio.Construtora}</h2>
            </div>

            {condominio.DescricaoUnidades ? (
                <div className="mt-6">
                    <button
                        className="flex items-center gap-2 mt-6 bg-black text-white px-4 py-2 rounded-full"
                        onClick={() => setExpanded(!expanded)}
                        type="button"
                    >
                        <span className="text-xs font-bold uppercase">{expanded ? "Ver menos" : "Ver mais"}</span>
                    </button>
                    <div className={`mt-2 text-gray-700 ${expanded ? "block" : "line-clamp-3"}`}>
                        <h4 className="text-xs">{condominio.DescricaoUnidades}</h4>
                    </div>
                </div>
            ) : (
                <div className="text-gray-700 mt-6">
                    <h4>Não há descrição de unidades disponíveis para este condomínio.</h4>
                </div>
            )}
        </div>
    );
} 