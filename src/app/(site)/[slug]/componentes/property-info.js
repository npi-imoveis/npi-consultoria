"use client";

import { Share } from "@/app/components/ui/share";
import { Button } from "@/app/components/ui/button";
import { formatterValue } from "@/app/utils/formatter-value";

export function PropertyInfo({ condominio, imoveisRelacionados, currentUrl }) {
    return (
        <div className="px-10 py-6 bg-white max-h-[400px] xl:max-h-[300px] rounded-lg flex-grow">
            <div className="flex justify-between">
                <span className="text-[10px]">Código:{condominio.Codigo}</span>
                <Share url={currentUrl} title={`Compartilhe o imóvel ${condominio.Empreendimento} em ${condominio.BairroComercial}`} variant="secondary" />
            </div>

            <h1 className="text-xl font-semibold mt-2">Condomínio {condominio.Empreendimento} </h1>
            <span className="text-xs text-zinc-700 font-semibold">
                {condominio.TipoEndereco} {condominio.Endereco}, {condominio.Numero}, {condominio.BairroComercial}, {condominio.Cidade}
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4 mb-8">
                {condominio.ValorAluguelSite && (
                    <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                        <h4 className="text-zinc-600 text-[10px] font-bold">Aluguel:</h4>
                        <h2 className="text-black font-semibold text-[10px]">R${" "}{condominio.ValorAluguelSite}</h2>
                    </div>
                )}

                <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">Venda:</h4>
                    <h2 className="text-black font-semibold text-[10px]">R${" "}{condominio.ValorAntigo}</h2>
                </div>
                {condominio.ValorCondominio && (
                    <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                        <h4 className="text-zinc-600 text-[10px] font-bold">Condomínio:</h4>
                        <h2 className="text-black font-semibold text-[10px]">
                            {formatterValue(condominio.ValorCondominio)}
                        </h2>
                    </div>
                )}
                {condominio.ValorIptu && (
                    <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                        <h4 className="text-zinc-600 text-[10px] font-bold">IPTU:</h4>
                        <h2 className="text-black font-semibold text-[10px]">
                            {formatterValue(condominio.ValorIptu)}
                        </h2>
                    </div>
                )}
            </div>
            <Button text={`Mostrar imóveis (${imoveisRelacionados.length})`} />
        </div>
    );
} 