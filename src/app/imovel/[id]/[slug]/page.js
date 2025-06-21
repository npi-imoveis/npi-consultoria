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

// A função generateMetadata deve ser um Server Component e rodar antes da página.
// Ela é responsável por gerar as tags <title> e <meta> no <head> do HTML inicial.
export async function generateMetadata({ params }) {
  const { id } = params;
  let condominio = null;

  try {
    const response = await getImovelById(id);
    condominio = response?.data;
  } catch (error) {
    console.error("Erro ao buscar dados do imóvel para metadados:", error);
    // Em caso de erro na busca, retorne metadados genéricos para evitar falha total.
    return {
      title: "Imóvel - NPI Consultoria Imobiliária",
      description: "Encontre seu imóvel ideal com a NPI Consultoria. Especialistas em imóveis de alto padrão.",
      robots: "noindex, nofollow", // Pode ser 'noindex, nofollow' se não houver dados válidos
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${id}`,
      },
      openGraph: {
        title: "NPI Consultoria Imobiliária",
        description: "Encontre seu imóvel ideal com a NPI Consultoria.",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${id}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "NPI Consultoria Imobiliária",
        description: "Encontre seu imóvel ideal com a NPI Consultoria.",
        site: "@NPIImoveis",
      },
    };
  }

  // Se o imóvel não for encontrado, o notFound() será chamado no componente da página,
  // mas para os metadados, podemos retornar um fallback ou um noindex.
  if (!condominio) {
    return {
      title: "Imóvel não encontrado - NPI Consultoria Imobiliária",
      description: "A página do imóvel que você está procurando não foi encontrada.",
      robots: "noindex, nofollow",
      alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${id}`,
      },
      openGraph: {
        title: "Imóvel não encontrado",
        description: "A página do imóvel que você está procurando não foi encontrada.",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${id}`,
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: "Imóvel não encontrado",
        description: "A página do imóvel que você está procurando não foi encontrada.",
        site: "@NPIImoveis",
      },
    };
  }

  const destaqueFotoObj = condominio.Foto?.find((f) => f.Destaque === "Sim");
  const destaqueFotoUrl = destaqueFotoObj?.Foto;

  // Garante que a descrição não seja muito longa ou vazia
  const description = `${condominio.Empreendimento || 'Imóvel'} em ${condominio.BairroComercial || 'localização desconhecida'}, ${condominio.Cidade || 'cidade desconhecida'}. ${condominio.Categoria || 'Imóvel'} com ${condominio.MetragemAnt || 'metragem não informada'}, ${condominio.DormitoriosAntigo || 'número de'} quartos, ${condominio.VagasAntigo || 'número de'} vagas. ${condominio.Situacao || ''}.`.trim();

  return {
    title: `${condominio.Empreendimento}, ${condominio.TipoEndereco} ${condominio.Endereco} ${condominio.Numero}, ${condominio.BairroComercial}`,
    description: description,
    robots: "index, follow",
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${condominio.Codigo}/${condominio.Slug}`,
      languages: {
        "pt-BR": `/imovel-${condominio.Codigo}/${condominio.Slug}`,
      },
    },
    openGraph: {
      title: `Condomínio ${condominio.Empreendimento}`,
      description: description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${condominio.Codigo}/${condominio.Slug}`,
      images: destaqueFotoUrl ? [{ url: destaqueFotoUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Condomínio ${condominio.Empreendimento}`,
      description: description,
      site: "@NPIImoveis",
      images: destaqueFotoUrl ? [destaqueFotoUrl] : [],
    },
  };
}

export default async function Imovel({ params }) {
  const { id, slug } = params;
  const response = await getImovelById(id);

  if (!response?.data) {
    notFound(); // Isso vai renderizar a página 404 do Next.js
  }

  const imovel = response.data;

  const slugCorreto = imovel.Slug;

  if (slug !== slugCorreto) {
    redirect(`/imovel-${id}/${slugCorreto}`);
  }

  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;

  return (
    <section className="w-full bg-white pb-32 pt-20">
      {/* StructuredDataApartment deve ser um Client Component se precisar de dados do DOM ou interatividade */}
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
