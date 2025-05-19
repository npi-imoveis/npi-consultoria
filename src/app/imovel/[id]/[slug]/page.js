import { ImageGallery } from "@/app/components/sections/image-gallery";
import { FAQImovel } from "./componentes/FAQImovel";
import DetalhesCondominio from "./componentes/DetalhesCondominio";
import LocalizacaoCondominio from "./componentes/LocalizacaoCondominio";
import FichaTecnica from "./componentes/FichaTecnica";
import Lazer from "./componentes/Lazer";
import TituloImovel from "./componentes/TituloImovel";
import DetalhesImovel from "./componentes/DetalhesImovel";
import DescricaoImovel from "./componentes/DescricaoImovel";
import VideoCondominio from "./componentes/VideoCondominio";
import TourVirtual from "./componentes/TourVirtual";
import Contato from "./componentes/Contato";
import { SimilarProperties } from "./componentes/similar-properties";
import { getCondominioPorSlug, getImovelById } from "@/app/services";
import { WhatsappFloat } from "@/app/components/ui/whatsapp";
import { Apartment as StructuredDataApartment } from "@/app/components/structured-data";
import ExitIntentModal from "@/app/components/ui/exit-intent-modal";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id, slug } = params;
  // const response = await getCondominioPorSlug(slug);
  const response = await getImovelById(id);
  // Acessando cookies no server component

  const condominio = response?.data;

  if (!condominio) {
    return {
      title: "Condomínio não encontrado | NPI Imóveis",
      description: "O condomínio solicitado não foi encontrado.",
      robots: "noindex",
    };
  }

  const destaqueFotoObj = condominio.Foto?.find((f) => f.Destaque === "Sim");
  const destaqueFotoUrl = destaqueFotoObj?.Foto;

  const description = `${condominio.Empreendimento} em ${condominio.BairroComercial}, ${condominio.Cidade}. ${condominio.Empreendimento}: ${condominio.DormitoriosAntigo} quartos, ${condominio.Suites} suítes, ${condominio.BanheiroSocialQtd} banheiros, ${condominio.VagasAntigo} vagas, ${condominio.MetragemAnt}. ${condominio.Situacao}.`;

  return {
    title: `${condominio.Empreendimento}, ${condominio.TipoEndereco} ${condominio.Endereco}, ${condominio.BairroComercial}`,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`,
    },
    openGraph: {
      title: `Condomínio ${condominio.Empreendimento}`,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`,
      images: destaqueFotoUrl ? [{ url: destaqueFotoUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Condomínio ${condominio.Empreendimento}`,
      description,
      site: "@NPIImoveis",
      images: destaqueFotoUrl ? [destaqueFotoUrl] : [],
    },
  };
}

export default async function Imovel({ params }) {
  const { id, slug } = params;
  // const response = await getCondominioPorSlug(slug);
  const response = await getImovelById(id);
  // Acessando cookies no server component

  // const response = await getCondominioPorSlug(slug);

  if (!response?.data) {
    notFound();
  }

  const imovel = response.data;
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`;

  return (
    <section className="w-full bg-white pb-32 pt-20">
      <StructuredDataApartment
        title={imovel.Empreendimento}
        price={imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}
        description={`${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${
          imovel.Empreendimento
        }: ${imovel.DormitoriosAntigo} quartos, ${imovel.Suites} suítes, ${
          imovel.BanheiroSocialQtd
        } banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. ${
          imovel.Situacao
        }. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}. ${
          imovel.TipoEndereco
        } ${imovel.Endereco}.`}
        address={`${imovel.TipoEndereco} ${imovel.Endereco}, ${imovel.Numero}, ${imovel.BairroComercial}, ${imovel.Cidade}`}
        url={currentUrl}
        image={imovel.Foto}
      />
      <ExitIntentModal condominio={imovel.Empreendimento} link={currentUrl} />

      <div className="w-full mx-auto">
        <ImageGallery imovel={imovel} />
      </div>

      <div className="container mx-auto gap-4 mt-3 px-4 md:px-0 flex flex-col lg:flex-row">
        <div className="w-full lg:w-[65%]">
          <TituloImovel imovel={imovel} currentUrl={currentUrl} />
          <DetalhesImovel imovel={imovel} />
          <DescricaoImovel imovel={imovel} />
          <FichaTecnica imovel={imovel} />
          <DetalhesCondominio imovel={imovel} />
          <Lazer imovel={imovel} />
          {imovel.Video && Object.keys(imovel.Video).length > 0 && (
            <VideoCondominio imovel={imovel} />
          )}
          {imovel.Tour360 && <TourVirtual link={imovel.Tour360} titulo={imovel.Empreendimento} />}
          <SimilarProperties id={imovel.Codigo} />
          <LocalizacaoCondominio imovel={imovel} />
        </div>

        <div className="w-full lg:w-[35%] h-fit lg:sticky lg:top-24 order-first lg:order-last mb-6 lg:mb-0">
          <Contato imovel={imovel} currentUrl={currentUrl} />
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-0">
        <FAQImovel imovel={imovel} />
      </div>
      <WhatsappFloat
        message={`Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponivel na pagina do Imóvel: ${currentUrl}`}
      />
    </section>
  );
}
