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
  const imovel = response?.data; // Alterado de condominio para imovel para consistência

  // Debug remoto (ver logs na Vercel)
  console.log('Estrutura do objeto imovel:', JSON.stringify(imovel, null, 2));

  // Método mais robusto para pegar a imagem
  const primeiraFoto = Array.isArray(imovel.Foto) ? imovel.Foto[0] : null;
  const destaqueFotoUrl = primeiraFoto?.Foto || primeiraFoto?.url || null;

  const description = `${imovel.Empreendimento} em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Categoria} com ${imovel.MetragemAnt}, ${imovel.DormitoriosAntigo} quartos, ${imovel.VagasAntigo} vagas. ${imovel.Situacao}.`;

  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;

  return {
    title: `${imovel.Empreendimento}, ${imovel.TipoEndereco} ${imovel.Endereco} ${imovel.Numero}, ${imovel.BairroComercial}`,
    description,
    robots: "index, follow",
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
      images: destaqueFotoUrl ? [{ 
        url: destaqueFotoUrl,
        width: 1200,
        height: 630,
        alt: `Imóvel ${imovel.Empreendimento}` 
      }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Imóvel ${imovel.Empreendimento}`,
      description,
      site: "@NPIImoveis",
      images: destaqueFotoUrl ? [destaqueFotoUrl] : [],
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
      
      {/* Restante do seu código permanece igual */}
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
