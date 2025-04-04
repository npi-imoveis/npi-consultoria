"use client";

export default function DetalhesCondominio({ imovel }) {
    return (
        <div className="bg-white container mx-auto p-4 md:p-10 mt-4 border-t-2">
            <h2 className="text-xl font-bold text-black" id="sobre-condominio">Sobre o Condomínio {imovel.Empreendimento}</h2>
            <p
                className="mt-8 text-zinc-600 text-base"
                dangerouslySetInnerHTML={{ __html: imovel.DescricaoDiferenciais }}
                aria-labelledby="sobre-condominio"
            />

            {imovel.DestaquesDiferenciais && (
                <div className="my-8 border-t-2 pt-8">
                    <h3 className="text-xl font-bold text-black" id="diferenciais">Diferenciais do Condomínio</h3>
                    <p
                        className="my-8 text-zinc-600 text-base"
                        dangerouslySetInnerHTML={{ __html: imovel.DestaquesDiferenciais }}
                        aria-labelledby="diferenciais"
                    />
                </div>
            )}
        </div>
    );
} 