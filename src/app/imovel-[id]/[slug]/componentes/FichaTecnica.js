"use client";

import { formatterDate } from "@/app/utils/formatter-date";

const formatarHtml = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/\r\n|\r|\n/g, "<br />");
};

export default function FichaTecnica({ imovel }) {
    const date = formatterDate(imovel.DataEntrega);
    const fichaTecnica = formatarHtml(imovel.FichaTecnica);

    return (
        <div className="bg-white container mx-auto border-t-2 p-4 md:p-10 mt-4">
            <h2 className="text-xl font-bold text-black" id="ficha-tecnica">
                Ficha Técnica, Paisagismo e Arquitetura do Condomínio
            </h2>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col bg-zinc-100 p-5 rounded-lg">
                    <p className="text-xs text-zinc-900">Empreendimento</p>
                    <span className="font-bold text-sm">{imovel.Empreendimento}</span>
                </div>
                <div className="flex flex-col bg-zinc-100 p-5 rounded-lg">
                    <p className="text-xs text-zinc-900">Fase da Obra</p>
                    <span className="font-bold text-sm">{imovel.Situacao}</span>
                </div>
                <div className="flex flex-col bg-zinc-100 p-5 rounded-lg">
                    <p className="text-xs text-zinc-900">Data Entrega</p>
                    <span className="font-bold text-sm">{date}</span>
                </div>
                <div className="flex flex-col bg-zinc-100 p-5 rounded-lg">
                    <p className="text-xs text-zinc-900">Construtora</p>
                    <span className="font-bold text-sm">{imovel.Construtora}</span>
                </div>
            </div>
            <div className="mt-8">
                <p
                    className="my-8 text-zinc-600 text-base"
                    dangerouslySetInnerHTML={{ __html: fichaTecnica }}
                    aria-labelledby="ficha-tecnica"
                />
            </div>
        </div>
    );
} 