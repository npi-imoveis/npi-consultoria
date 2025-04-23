"use client";
import { useState, useEffect } from 'react';

const formatarHtml = (htmlString) => {
    if (!htmlString) return "";
    return htmlString.replace(/\r\n|\r|\n/g, "<br />");
};

export default function DescricaoImovel({ imovel }) {
    const [descricao, setDescricao] = useState('');

    useEffect(() => {
        setDescricao(formatarHtml(imovel.DescricaoUnidades));
    }, [imovel.DescricaoUnidades]);

    return (
        <div className="bg-white container mx-auto border-t-2 p-4 md:p-10 mt-4">
            <h2 className="text-xl font-bold text-black" id="descricao-unidade">Descrição da Unidade</h2>
            {descricao ? (
                <p
                    className="text-base my-8 text-zinc-600"
                    dangerouslySetInnerHTML={{ __html: descricao }}
                    aria-labelledby="descricao-unidade"
                />
            ) : (
                <p className="text-base my-8 text-zinc-600" aria-labelledby="descricao-unidade">
                    Carregando descrição...
                </p>
            )}
        </div>
    );
} 