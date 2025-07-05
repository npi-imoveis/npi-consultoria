// app/imovel/[id]/[slug]/page.js

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
import { Apartment as StructuredDataApartment } from "@/app/components/structured-data";
import ExitIntentModal from "@/app/components/ui/exit-intent-modal";
import { notFound, redirect } from "next/navigation";
import Head from "next/head";

// ✅ SEO DINÂMICO MAIS ROBUSTO
export async function generateMetadata({ params }) {
  const { id } = params;
  
  console.error(`[IMOVEL-META] =========== PROCESSANDO ID: ${id} ===========`);
  
  const response = await getImovelById(id);

  if (!response?.data) return {};

  const imovel = response.data;
  const title = `${imovel.Empreendimento} - ${imovel.BairroComercial}, ${imovel.Cidade}`;
  const description = `${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo} dormitórios, ${imovel.SuiteAntigo} suítes, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`;

  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;

  // 🔧 GARANTIR URL COMPLETA DA IMAGEM
  const getFullImageUrl = (foto) => {
    if (!foto) return `${process.env.NEXT_PUBLIC_SITE_URL}/images/default-property.jpg`;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/')) return `${process.env.NEXT_PUBLIC_SITE_URL}${foto}`;
    return `${process.env.NEXT_PUBLIC_SITE_URL}/${foto}`;
  };

  const imageUrl = getFullImageUrl(imovel.Foto);

  return {
    title,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
    alternates: {
      canonical: currentUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: currentUrl,
      siteName: "NPI Imobiliária",
      type: "website",
      locale: "pt_BR",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${imovel.Empreendimento} - ${imovel.BairroComercial}`,
        }
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    // 🎯 FORÇAR META TAGS CRÍTICAS
    other: {
      "og:image": imageUrl,
      "og:image:secure_url": imageUrl,
      "og:image:type": "image/jpeg",
      "og:image:width": "1200",
      "og:image:height": "630",
      "og:image:alt": `${imovel.Empreendimento} - ${imovel.BairroComercial}`,
      "og:type": "website",
      "og:site_name": "NPI Imobiliária",
      "og:locale": "pt_BR",
      "twitter:card": "summary_large_image",
      "twitter:image": imageUrl,
      "twitter:image:alt": `${imovel.Empreendimento} - ${imovel.BairroComercial}`,
    },
  };
}

export const revalidate = 0;

// 🎯 COMPONENTE DE META TAGS MANUAL
function MetaTagsManual({ imovel, currentUrl }) {
  const title = `${imovel.Empreendimento} - ${imovel.BairroComercial}, ${imovel.Cidade}`;
  const description = `${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo} dormitórios, ${imovel.SuiteAntigo} suítes, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`;
  
  const getFullImageUrl = (foto) => {
    if (!foto) return `${process.env.NEXT_PUBLIC_SITE_URL}/images/default-property.jpg`;
    if (foto.startsWith('http')) return foto;
    if (foto.startsWith('/')) return `${process.env.NEXT_PUBLIC_SITE_URL}${foto}`;
    return `${process.env.NEXT_PUBLIC_SITE_URL}/${foto}`;
  };

  const imageUrl = getFullImageUrl(imovel.Foto);

  return (
    <Head>
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${imovel.Empreendimento} - ${imovel.BairroComercial}`} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="NPI Imobiliária" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={`${imovel.Empreendimento} - ${imovel.BairroComercial}`} />
      
      {/* WhatsApp específico */}
      <meta property="og:updated_time" content={new Date().toISOString()} />
      
      {/* SEO básico */}
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={currentUrl} />
    </Head>
  );
}

export default async function Imovel({ params }) {
  const { id, slug } = params;
  
  console.error(`[IMOVEL-PAGE] =========== PROCESSANDO ID: ${id}, SLUG: ${slug} ===========`);
  
  const response = await getImovelById(id);

  if (!response?.data) {
    notFound();
  }

  const imovel = {
    ...response.data,
    SuiteAntigo: response.data.SuiteAntigo ?? response.data.Suites ?? 0,
    DormitoriosAntigo: response.data.DormitoriosAntigo ?? 0,
    VagasAntigo: response.data.VagasAntigo ?? 0,
    BanheiroSocialQtd: response.data.BanheiroSocialQtd ?? 0,
  };

  const slugCorreto = imovel.Slug;

  if (slug !== slugCorreto) {
    redirect(`/imovel-${id}/${slugCorreto}`);
  }  

  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;

  return (
    <>
      {/* 🔥 META TAGS FORÇADAS MANUALMENTE */}
      <MetaTagsManual imovel={imovel} currentUrl={currentUrl} />
      
      <section className="w-full bg-white pb-32 pt-20">
        <StructuredDataApartment
          title={imovel.Empreendimento}
          price={imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}
          description={`${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Empreendimento}: ${imovel.DormitoriosAntigo} quartos, ${imovel.SuiteAntigo} suítes, ${imovel.BanheiroSocialQtd} banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. ${imovel.Situacao}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}. ${imovel.TipoEndereco} ${imovel.Endereco}.`}
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
          message={`Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponível na página do Imóvel: ${currentUrl}`}
        />
      </section>
    </>
  );
}
