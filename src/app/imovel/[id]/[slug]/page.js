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

export async function generateMetadata({ params }) {
  const { id } = params;
  const response = await getImovelById(id);
  const imovel = response?.data;

  // 1. Busca otimizada por foto destaque
  const getFeaturedImage = () => {
    if (!Array.isArray(imovel.Foto)) return null;
    
    // Tenta encontrar por Destaque (case insensitive)
    const featured = imovel.Foto.find(f => 
      String(f.Destaque).toLowerCase() === "sim"
    );
    if (featured) return featured.Foto || featured.url;

    // Fallback 1: Foto com Indice 0
    const primary = imovel.Foto.find(f => f.Indice === 0);
    if (primary) return primary.Foto || primary.url;

    // Fallback 2: Primeira foto válida
    const firstValid = imovel.Foto.find(f => f.Foto || f.url);
    return firstValid?.Foto || firstValid?.url;
  };

  const imagePath = getFeaturedImage();
  const absoluteImageUrl = imagePath
    ? imagePath.startsWith('http')
      ? imagePath
      : `${process.env.NEXT_PUBLIC_SITE_URL}${imagePath}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/default-imovel.jpg`;

  // Debug crucial
  console.log('URL da imagem selecionada:', absoluteImageUrl);
  console.log('Domínio da imagem:', new URL(absoluteImageUrl).hostname);

  const description = `${imovel.Empreendimento} em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Categoria} com ${imovel.MetragemAnt}, ${imovel.DormitoriosAntigo} quartos, ${imovel.VagasAntigo} vagas. ${imovel.Situacao}.`;

  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`.replace(/\s+/g, '');

  return {
    title: `${imovel.Empreendimento}, ${imovel.TipoEndereco} ${imovel.Endereco} ${imovel.Numero}, ${imovel.BairroComercial}`,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
    alternates: {
      canonical: currentUrl,
      languages: {
        "pt-BR": currentUrl,
      },
    },
    openGraph: {
      title: `Imóvel ${imovel.Empreendimento}`,
      description,
      url: currentUrl,
      images: [{
        url: absoluteImageUrl,
        width: 1200,
        height: 630,
        alt: `Imóvel ${imovel.Empreendimento}`
      }],
      type: "website",
      siteName: "NPI Consultoria Imobiliária",
    },
    twitter: {
      card: "summary_large_image",
      title: `Imóvel ${imovel.Empreendimento}`,
      description,
      site: "@NPIImoveis",
      creator: "@NPIImoveis",
      images: [absoluteImageUrl],
    },
    // Adiciona meta tags adicionais para melhor compatibilidade
    other: {
      "og:image:secure_url": absoluteImageUrl,
      "og:image:type": "image/jpeg",
      "og:image:alt": `Imóvel ${imovel.Empreendimento}`,
    }
  };
}

export default async function Imovel({ params }) {
  const { id, slug } = params;
  const response = await getImovelById(id);

  if (!response?.data) {
    notFound();
  }

  const imovel = response.data;
  const slugCorreto = imovel.Slug;

  if (slug !== slugCorreto) {
    redirect(`/imovel-${id}/${slugCorreto}`);
  }

  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;

  // Repete a lógica de seleção de imagem para usar no WhatsApp
  let destaqueFotoUrl = null;
  if (Array.isArray(imovel.Foto)) {
    const destaqueFotoObj = imovel.Foto.find(f => 
      String(f.Destaque).toLowerCase() === "sim"
    );
    destaqueFotoUrl = destaqueFotoObj?.Foto || destaqueFotoObj?.url || null;
    
    if (!destaqueFotoUrl) {
      const primeiraFoto = imovel.Foto.find(f => f.Indice === 0);
      destaqueFotoUrl = primeiraFoto?.Foto || primeiraFoto?.url || null;
    }
    
    if (!destaqueFotoUrl && imovel.Foto.length > 0) {
      destaqueFotoUrl = imovel.Foto[0]?.Foto || imovel.Foto[0]?.url || null;
    }
  }

  const whatsappImageUrl = destaqueFotoUrl 
    ? destaqueFotoUrl.startsWith('http') 
      ? destaqueFotoUrl 
      : `${process.env.NEXT_PUBLIC_SITE_URL}${destaqueFotoUrl}`
    : `${process.env.NEXT_PUBLIC_SITE_URL}/default-imovel.jpg`;

  return (
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
        message={`Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponivel na pagina do Imóvel: ${currentUrl}`}
        imageUrl={whatsappImageUrl}
      />
    </section>
  );
}
