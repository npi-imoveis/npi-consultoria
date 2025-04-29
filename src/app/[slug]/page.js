import { Button } from "@/app/components/ui/button";
import { getCondominioPorSlug } from "@/app/services";
import { formatterValue } from "@/app/utils/formatter-value";
import { Apartment as StructuredDataApartment } from "@/app/components/structured-data";
import { Share } from "@/app/components/ui/share";
import { PropertyTableOwner } from "./componentes/property-table-owner";
import { WhatsappFloat } from "@/app/components/ui/whatsapp";
import CondominioGallery from "./componentes/condominio-gallery";
import { PropertyTable } from "./componentes/property-table";
import { ImoveisRelacionados } from "./componentes/related-properties";
import SobreCondominio from "./componentes/SobreCondominio";
import FichaTecnica from "./componentes/FichaTecnica";
import DiferenciaisCondominio from "./componentes/DiferenciaisCondominio";
import Lazer from "./componentes/Lazer";
import VideoCondominio from "./componentes/VideoCondominio";
import TourVirtual from "./componentes/TourVirtual";
import ExploreRegiao from "./componentes/ExploreRegiao";
import ScrollToImoveisButton from "./componentes/scroll-to-imovel-button";

export async function generateMetadata({ params }) {
  const response = await getCondominioPorSlug(params.slug);
  const condominio = response?.data;

  if (!condominio) {
    return {
      title: "Condomínio não encontrado | NPI Imóveis",
      description: "O condomínio solicitado não foi encontrado.",
      robots: "noindex",
    };
  }

  const description = `Condomínio ${condominio.Empreendimento} em ${condominio.BairroComercial}, ${condominio.Cidade}. ${condominio.Empreendimento}: ${condominio.DormitoriosAntigo} quartos, ${condominio.Suites} suítes, ${condominio.BanheiroSocialQtd} banheiros, ${condominio.VagasAntigo} vagas, ${condominio.MetragemAnt}. ${condominio.Situacao}.`;

  return {
    title: `Condomínio ${condominio.Empreendimento}, ${condominio.TipoEndereco} ${condominio.Endereco}, ${condominio.Numero}, ${condominio.BairroComercial}`,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${params.slug}`,
    },
    openGraph: {
      title: `Condomínio ${condominio.Empreendimento}`,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${params.slug}`,
      images: condominio.Foto?.[0]?.Foto ? [{ url: condominio.Foto[0].Foto }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Condomínio ${condominio.Empreendimento}`,
      description,
      site: "@NPIImoveis",
      images: condominio.Foto?.[0]?.Foto ? [condominio.Foto[0].Foto] : [],
    },
  };
}

export default async function CondominioPage({ params }) {
  const response = await getCondominioPorSlug(params.slug);
  const condominio = response.data;
  const imoveisRelacionados = response.imoveisRelacionados;

  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${params.slug}`;

  return (
    <section className="w-full bg-zinc-100 pb-10">
      <StructuredDataApartment
        title={condominio.Empreendimento}
        price={condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}
        description={`${condominio.Categoria} à venda em ${condominio.BairroComercial}, ${
          condominio.Cidade
        }. ${condominio.Empreendimento}: ${condominio.DormitoriosAntigo} quartos, ${
          condominio.Suites
        } suítes, ${condominio.BanheiroSocialQtd} banheiros, ${condominio.VagasAntigo} vagas, ${
          condominio.MetragemAnt
        }. ${condominio.Situacao}. Valor: ${
          condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"
        }. ${condominio.TipoEndereco} ${condominio.Endereco}.`}
        address={`${condominio.TipoEndereco} ${condominio.Endereco}, ${condominio.Numero}, ${condominio.BairroComercial}, ${condominio.Cidade}`}
        url={currentUrl}
        image={condominio.Foto}
      />

      <div className="container mx-auto pt-20">
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="flex flex-col gap-4 ">
            <div className="px-10 py-6 bg-white max-h-[400px] xl:max-h-[300px] rounded-lg flex-grow">
              <div className="flex justify-between">
                <span className="text-[10px]">Código:{condominio.Codigo}</span>
                <Share
                  url={currentUrl}
                  title={`Compartilhe o imóvel ${condominio.Empreendimento} em ${condominio.BairroComercial}`}
                  variant="secondary"
                />
              </div>

              <h1 className="text-xl font-semibold mt-2">
                Condomínio {condominio.Empreendimento}{" "}
              </h1>
              <span className="text-xs text-zinc-700 font-semibold">
                {condominio.TipoEndereco} {condominio.Endereco}, {condominio.Numero},{" "}
                {condominio.BairroComercial}, {condominio.Cidade}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4 mb-8">
                {condominio.ValorAluguelSite && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">Aluguel:</h4>
                    <h2 className="text-black font-semibold text-[10px]">
                      R$ {condominio.ValorAluguelSite}
                    </h2>
                  </div>
                )}

                <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                  <h4 className="text-zinc-600 text-[10px] font-bold">Venda:</h4>
                  <h2 className="text-black font-semibold text-[10px]">
                    R$ {condominio.ValorAntigo}
                  </h2>
                </div>
                {condominio.ValorCondominio && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">Condomínio:</h4>
                    <h2 className="text-black font-semibold text-[10px]">
                      {/* formatterValue foi importado anteriormente mas não é usado aqui */}
                      {formatterValue(condominio.ValorCondominio)}
                    </h2>
                  </div>
                )}
                {condominio.ValorIptu && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">IPTU:</h4>
                    <h2 className="text-black font-semibold text-[10px]">
                      {/* formatterValue foi importado anteriormente mas não é usado aqui */}
                      {formatterValue(condominio.ValorIptu)}
                    </h2>
                  </div>
                )}
              </div>
              <ScrollToImoveisButton text={`Mostrar imóveis (${imoveisRelacionados.length})`} />
            </div>
            <div className="relative w-full h-[230px] overflow-y-auto bg-white rounded-lg overflow-hidden p-4">
              {condominio.ValorVenda2 != "0" ||
              condominio.ValorGarden != "0" ||
              condominio.ValorCobertura != "0" ? (
                <PropertyTableOwner imovel={condominio} />
              ) : (
                <PropertyTable imoveisRelacionados={imoveisRelacionados} />
              )}
            </div>
          </div>
          <div className="relative w-full min-h-[550px] overflow-hidden rounded-lg">
            <CondominioGallery fotos={condominio.Foto} title={condominio.Empreendimento} />
          </div>
        </div>
      </div>
      {imoveisRelacionados && imoveisRelacionados.length > 0 && (
        <div id="imoveis-relacionados">
          <ImoveisRelacionados imoveisRelacionados={imoveisRelacionados} />
        </div>
      )}
      <SobreCondominio condominio={condominio} />

      {condominio.FichaTecnica && <FichaTecnica condominio={condominio} />}
      {condominio.DescricaoDiferenciais && <DiferenciaisCondominio condominio={condominio} />}
      {condominio.DestaquesLazer && <Lazer condominio={condominio} />}
      {condominio.Video.length != 0 && <VideoCondominio condominio={condominio} />}
      {condominio.Tour360 && <TourVirtual condominio={condominio} />}

      <ExploreRegiao condominio={condominio} currentUrl={currentUrl} />
      <WhatsappFloat
        message={`Quero saber mais sobre o ${condominio.Empreendimento}, no bairro ${condominio.BairroComercial}, disponivel na pagina de Condominio: ${currentUrl}`}
      />
    </section>
  );
}
