"use client";

import { useState } from "react";
import { Home, Bed, Car, Calendar, Building } from "lucide-react";
import { formatterDate } from "@/app/utils/formatter-date";

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

export default function DetalhesCondominioSobre({ condominio }) {
    const [expanded, setExpanded] = useState(false);
    const maxVagas = getMaxVagas(condominio);

    return (
        <div className="max-w-lg mx-auto p-6 text-black font-sans">
            <h2 className="font-semibold">
                {condominio.Categoria} {condominio.Status}
            </h2>
            <div className="flex items-center gap-2 mt-2">
                <Home size={18} />
                <span className="text-sm">A partir de {condominio.MetragemAnt}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
                <Bed size={18} />
                <span className="text-sm">Imóveis com {condominio.DormitoriosAntigo} quartos</span>
            </div>

            <h3 className="font-semibold mt-6">Condomínio</h3>
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
                <span className="text-sm">Construtora: {condominio.Construtora}</span>
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
                        <h4 className="text-sm">{condominio.DescricaoUnidades}</h4>
                    </div>
                </div>
            ) : (
                <div className=" text-gray-700 mt-6">
                    <p>Não há descrição de unidades disponíveis para este condomínio.</p>
                </div>
            )}
        </div>
    );
} 