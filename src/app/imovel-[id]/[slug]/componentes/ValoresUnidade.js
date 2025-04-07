"use client";

const formatarValorMonetario = (valor) => {
    if (!valor) return "Não informado";

    // Remover espaços e verificar se é número
    const valorNumerico = valor.toString().trim();
    if (!valorNumerico || isNaN(Number(valorNumerico))) return "Não informado";

    // Formatar para o padrão brasileiro com vírgulas para centavos
    const valorFormatado = Number(valorNumerico).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return `R$ ${valorFormatado}`;
};

export default function ValoresUnidade({ imovel }) {
    return (
        <div className="px-6 pt-6 bg-white rounded-lg">
            <div itemScope itemType="https://schema.org/Offer">
                <p className="text-black font-medium">Preço:</p>
                <h2 className="text-2xl font-bold mt-2" itemProp="price" content={imovel.ValorAntigo || "Consultar"}>
                    {imovel.ValorAntigo !== "0" ? "R$ " + imovel.ValorAntigo : "Consultar"}
                </h2>
                <meta itemProp="priceCurrency" content="BRL" />
            </div>

            <div className="grid grid-cols-2 gap-3 my-8">
                <div className="flex flex-col bg-zinc-100 p-3 rounded-lg">
                    <p className="text-sm text-zinc-600">Condomínio</p>
                    <p className="text-black font-semibold">
                        {formatarValorMonetario(imovel.ValorCondominio)}
                    </p>
                </div>
                <div className="flex flex-col bg-zinc-100 p-3 rounded-lg">
                    <p className="text-sm text-zinc-600">IPTU</p>
                    <p className="text-black font-semibold">{formatarValorMonetario(imovel.ValorIptu)}</p>
                </div>
            </div>
        </div>
    );
} 