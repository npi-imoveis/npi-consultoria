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
import { getImovelById } from "@/app/services";
import { WhatsappFloat } from "@/app/components/ui/whatsapp";
import ExitIntentModal from "@/app/components/ui/exit-intent-modal";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = params;
  const response = await getImovelById(id);
  const condominio = response?.data;

  if (!condominio) {
    return {};
  }

  const destaqueFotoObj = condominio.Foto?.find((f) => f.Destaque === "Sim");
  const destaqueFotoUrl = destaqueFotoObj?.Foto;

  const description = `${condominio.Empreendimento} em ${condominio.BairroComercial}, ${condominio.Cidade}. ${condominio.Categoria} com ${condominio.MetragemAnt}, ${condominio.DormitoriosAntigo} quartos, ${condominio.VagasAntigo} vagas. ${condominio.Situacao}.`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Apartment",
    name: condominio.Empreendimento,
    description,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${condominio.TipoEndereco} ${condominio.Endereco}, ${condominio.Numero}`,
      addressLocality: condominio.BairroComercial,
      addressRegion: condominio.Cidade,
      addressCountry: "BR",
    },
    numberOfRooms: condominio.DormitoriosAntigo,
    numberOfBathroomsTotal: condominio.BanheiroSocialQtd,
    numberOfFullBathrooms: condominio.Suites,
    floorSize: {
      "@type": "QuantitativeValue",
      value: condominio.MetragemAnt,
      unitCode: "MTK",
    },
    offers: {
      "@type": "Offer",
      price: condominio.ValorAntigo || "Consulte",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${condominio.Codigo}/${condominio.Slug}`,
    image: condominio.Foto?.map((foto) => foto.Foto) || [],
  };

  return {
    title: `${condominio.Empreendimento}, ${condominio.TipoEndereco} ${condominio.Endereco}, ${condominio.Numero}, ${condominio.BairroComercial}`,
    description,
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${condominio.Codigo}/${condominio.Slug}`,
    },
    openGraph: {
      title: `Condomínio ${condominio.Empreendimento}`,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${condominio.Codigo}/${condominio.Slug}`,
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
    other: {
      "structured-data": `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    },
  };
}

export default async function Imovel({ params }) {
  const { id } = params;
  const response = await getImovelById(id);

  if (!response?.data) {
    notFound();
  }

  const imovel = response.data;
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;

  return (
    <section className="w-full bg-white pb-32 pt-20">
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
          {imovel.Tour360 && (
            <TourVirtual link={imovel.Tour360} titulo={imovel.Empreendimento} />
          )}
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
        message={`Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponível na página do Imóvel: ${currentUrl}`}
      />
    </section>
  );
}
