"use client";
import { useState, useEffect } from 'react';

const formatarHtml = (htmlString ) => {
    if (!htmlString) return "";
    let formatted = htmlString.replace(/\r\n|\r|\n/g, "<br />");

    // Regex para encontrar links (href) que não começam com http:// ou https://
    // e que apontam para domínios de redes sociais específicos.
    // Isso garante que eles se tornem URLs absolutas.
    formatted = formatted.replace(
        /href=["'](?!https?:\/\/)(instagram\.com|facebook\.com|youtube\.com|linkedin\.com|twitter\.com|tiktok\.com)([^"']*)["']/g,
        'href="https://$1$2"'
     );

    // Consideração importante: O uso de dangerouslySetInnerHTML pode ser um risco de segurança (XSS)
    // se o conteúdo de imovel.DescricaoUnidades vier de uma fonte não confiável e não for sanitizado.
    // Para este problema específico de URL, a regex acima resolve.
    // Para sanitização completa, bibliotecas como 'dompurify' seriam recomendadas.

    return formatted;
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
