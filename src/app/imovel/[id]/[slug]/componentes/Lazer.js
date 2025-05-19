"use client";

import { formatterStringToArray } from "@/app/utils/formatter-string-to-array";

export default function Lazer({ imovel }) {
    // Função para verificar se o conteúdo é texto formatado ou lista de itens
    const isFormattedText = (text) => {
        if (!text) return false;

        // Verificar se o texto tem mais de 50 caracteres sem vírgulas ou quebras de linha
        const hasTags = /<[^>]*>/g.test(text);
        const longTextWithoutSeparators = text.length > 50 && !(/\r\n|\r|\n|,/).test(text);

        return hasTags || longTextWithoutSeparators;
    };

    const destaquesLazer = imovel.DestaquesLazer || "";
    const isText = isFormattedText(destaquesLazer);
    const lazer = isText ? [] : formatterStringToArray(destaquesLazer);

    return (
        <div className="container mx-auto bg-white mt-4 p-4 md:p-10 border-t-2">
            <h2 className="text-xl font-bold text-black" id="lazer">Lazer disponível no condomínio</h2>

            {isText ? (
                <div
                    className="mt-6 prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: destaquesLazer }}
                />
            ) : (
                <div className="flex flex-wrap gap-3 mt-6" role="list" aria-labelledby="lazer">
                    {lazer.map((item, index) => (
                        <span
                            key={index}
                            className="px-4 py-1 text-xs font-bold bg-zinc-100 rounded-full"
                            role="listitem"
                        >
                            {item}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
} 