import { Share } from "@/app/components/ui/share";
import { Breadcrumb } from "./breadcrumb";
import Link from "next/link";
import { getCondominiosPorImovel } from "@/app/services";

export default async function TituloImovel({ imovel, currentUrl }) {
    let condominio = null;

    try {
        const response = await getCondominiosPorImovel(imovel.Codigo)
        condominio = response?.data?.Slug
    } catch (error) {
        console.error('Erro ao carregar dados do condomínio:', error)
    }

    return (
        <div className="bg-white rounded-lg container mx-auto px-4 md:px-10">
            <Breadcrumb
                Categoria={imovel.Categoria}
                Bairro={imovel.BairroComercial}
                Empreendimento={imovel.Empreendimento}
                Codigo={imovel.Codigo}
            />

            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-bold text-black max-w-[800px]" id="imovel-titulo">
                    {imovel.Empreendimento}
                </h1>
                <div className="flex justify-end">
                    <Share url={currentUrl} title={`Compartilhe o imóvel ${imovel.Empreendimento} em ${imovel.BairroComercial}`} variant="secondary" />
                </div>
            </div>

            <div className="mt-2">
                <h2 className="text-sm font-bold">Endereço:</h2>
                <h2 className="text-xs not-italic">
                    {imovel.TipoEndereco} {imovel.Endereco}, {imovel.Numero}, {imovel.BairroComercial}, {imovel.Cidade}
                </h2>
            </div>

            {condominio && (
                <Link
                    href={`/${condominio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold flex justify-center items-center gap-2 mt-4 bg-zinc-100 p-2 rounded-lg hover:bg-zinc-200 transition-colors"
                    aria-label={`Ver informações completas do condomínio ${imovel.Empreendimento}`}
                >
                    Veja Mais Opções no {imovel.Empreendimento}
                    <svg
                        className="size-5 rtl:rotate-180"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                    </svg>
                </Link>
            )}
        </div>
    );
} 
