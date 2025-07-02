export const dynamic = "force-dynamic";
/**
 * Página dinâmica para qualquer slug na raiz do site (ex: /imovel-123, /helbor-brooklin, etc).
 * Se o slug for do tipo 'imovel-123', busca o imóvel pelo ID e redireciona para a URL canônica com slug.
 * Se o slug for do tipo 'imovel-123/slug-do-imovel', renderiza a página do imóvel.
 * Se não, renderiza normalmente a página do condomínio.
 * Isso garante redirecionamento dinâmico e eficiente para milhares de URLs antigas, sem precisar de redirects estáticos.
 * Toda a lógica de renderização do imóvel foi migrada do antigo src/app/imovel/[id]/[slug]/page.js para cá.
 */

import { notFound, redirect } from "next/navigation";
import { getCondominioPorSlug, getImovelById } from "@/app/services";
import { Button } from "@/app/components/ui/button";
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
import ExitIntentModal from "@/app/components/ui/exit-intent-modal";
import ScrollToImoveisButton from "./componentes/scroll-to-imovel-button";
// Imports do imóvel
import { ImageGallery } from "@/app/components/sections/image-gallery";
import { FAQImovel } from "./componentes/FAQImovel";
import DetalhesCondominio from "./componentes/DetalhesCondominio";
import LocalizacaoCondominio from "./componentes/LocalizacaoCondominio";
import TituloImovel from "./componentes/TituloImovel";
import DetalhesImovel from "./componentes/DetalhesImovel";
import DescricaoImovel from "./componentes/DescricaoImovel";
import Contato from "./componentes/Contato";
import { SimilarProperties } from "./componentes/similar-properties";

function ensureCondominio(text) {
  return /condom[ií]nio/i.test(text) ? text : `Condomínio ${text}`;
}

export async function generateMetadata({ params }) {
  // Normaliza slug para string
  let slugValue = params.slug;
  if (Array.isArray(slugValue)) slugValue = slugValue[0];

  // Se for /imovel-<id> ou /imovel-<id>/<slug>, busca o imóvel
  const matchImovel = typeof slugValue === "string" && slugValue.match(/^imovel-(\d+)(?:\/(.+))?$/);
  if (matchImovel) {
    const id = matchImovel[1];
    const response = await getImovelById(id);
    const imovel = response?.data;
    if (!imovel) {
      return {
        title: "Imóvel não encontrado",
        description: "A página do imóvel que você procura não foi encontrada.",
        robots: "noindex, nofollow",
      };
    }
    // Se for /imovel-<id> (sem slug), meta de redirecionamento
    if (!matchImovel[2]) {
      return {
        title: "Redirecionando...",
        robots: "noindex, nofollow",
      };
    }
    // Se for /imovel-<id>/<slug>, meta do imóvel
    // Busca imagem destaque
    const getFeaturedImage = () => {
      if (!Array.isArray(imovel.Foto)) return null;
      const featured = imovel.Foto.find(f => String(f.Destaque).toLowerCase() === "sim");
      if (featured) return featured.Foto || featured.url;
      const primary = imovel.Foto.find(f => f.Indice === 0);
      if (primary) return primary.Foto || primary.url;
      const firstValid = imovel.Foto.find(f => f.Foto || f.url);
      return firstValid?.Foto || firstValid?.url;
    };
    const imagePath = getFeaturedImage();
    const absoluteImageUrl = imagePath
      ? imagePath.startsWith('http')
        ? imagePath
        : `${process.env.NEXT_PUBLIC_SITE_URL}${imagePath}`
      : `${process.env.NEXT_PUBLIC_SITE_URL}/default-imovel.jpg`;
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
      other: {
        "og:image:secure_url": absoluteImageUrl,
        "og:image:type": "image/jpeg",
        "og:image:alt": `Imóvel ${imovel.Empreendimento}`,
      }
    };
  }
  // Caso contrário, meta de condomínio
  const response = await getCondominioPorSlug(slugValue);
  const condominio = response?.data;
  if (!condominio) {
    return {
      title: "Condomínio não encontrado",
      description: "A página do condomínio que você procura não foi encontrada.",
      robots: "noindex, nofollow",
    };
  }
  const rawTitle = ensureCondominio(condominio.Empreendimento);
  const destaqueFotoObj = condominio.Foto?.find((f) => f.Destaque === "Sim");
  const destaqueFotoUrl = destaqueFotoObj?.Foto;
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slugValue}`;
  const description = `${rawTitle} em ${condominio.BairroComercial}, ${condominio.Cidade}. ${condominio.Categoria} com ${condominio.MetragemAnt}, ${condominio.DormitoriosAntigo} quartos, ${condominio.VagasAntigo} vagas. ${condominio.Situacao}.`;
  return {
    title: `${rawTitle}, ${condominio.TipoEndereco} ${condominio.Endereco} ${condominio.Numero}, ${condominio.BairroComercial}`,
    description,
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        "pt-BR": currentUrl,
      },
    },
    openGraph: {
      title: rawTitle,
      description,
      url: currentUrl,
      images: destaqueFotoUrl ? [{ url: destaqueFotoUrl }] : [],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: rawTitle,
      description,
      site: "@NPIImoveis",
      images: destaqueFotoUrl ? [destaqueFotoUrl] : [],
    },
  };
}

export default async function Page({ params }) {
  let slugValue = params.slug;
  if (Array.isArray(slugValue)) slugValue = slugValue[0];
  // Se for /imovel-<id> ou /imovel-<id>/<slug>
  const matchImovel = typeof slugValue === "string" && slugValue.match(/^imovel-(\d+)(?:\/(.+))?$/);
  if (matchImovel) {
    const id = matchImovel[1];
    const slug = matchImovel[2];
    const response = await getImovelById(id);
    const imovel = response?.data;
    if (!imovel) {
      return notFound();
    }
    // Se for /imovel-<id> (sem slug), redireciona para a canônica
    if (!slug) {
      return redirect(`/imovel-${id}/${imovel.Slug}`);
    }
    // Se slug está diferente do correto, redireciona
    if (slug !== imovel.Slug) {
      return redirect(`/imovel-${id}/${imovel.Slug}`);
    }
    // Renderiza página do imóvel
    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    // Repete a lógica de seleção de imagem para usar no WhatsApp
    let destaqueFotoUrl = null;
    if (Array.isArray(imovel.Foto)) {
      const destaqueFotoObj = imovel.Foto.find(f => String(f.Destaque).toLowerCase() === "sim");
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
  // --- LÓGICA NORMAL DE CONDOMÍNIO ---
  const response = await getCondominioPorSlug(slugValue);
  if (!response.data) {
    return notFound();
  }
  const condominio = response.data;
  const imoveisRelacionados = response.imoveisRelacionados;
  const rawTitle = ensureCondominio(condominio.Empreendimento);
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slugValue}`;
  function isValidValue(value) {
    return value !== undefined && value !== null && value !== "" && value !== "0";
  }
  return (
    <section className="w-full bg-zinc-100 pb-10">
      <StructuredDataApartment
        title={rawTitle}
        price={condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}
        description={`${condominio.Categoria} à venda em ${condominio.BairroComercial}, ${condominio.Cidade}. ${rawTitle}: ${condominio.DormitoriosAntigo} quartos, ${condominio.SuiteAntigo} suítes, ${condominio.BanheiroSocialQtd} banheiros, ${condominio.VagasAntigo} vagas, ${condominio.MetragemAnt}. ${condominio.Situacao}. Valor: ${condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}. ${condominio.TipoEndereco} ${condominio.Endereco}.`}
        address={`${condominio.TipoEndereco} ${condominio.Endereco}, ${condominio.Numero}, ${condominio.BairroComercial}, ${condominio.Cidade}`}
        url={currentUrl}
        image={condominio.Foto}
      />
      <ExitIntentModal condominio={rawTitle} link={currentUrl} />
      <div className="container mx-auto pt-20">
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ">
          <div className="flex flex-col gap-4 ">
            <div className="px-10 py-6 bg-white max-h-[400px] xl:max-h-[300px] rounded-lg flex-grow">
              <div className="flex justify-between">
                <span className="text-[10px]">Código:{condominio.Codigo}</span>
                <Share
                  url={currentUrl}
                  title={`Compartilhe o imóvel ${rawTitle} em ${condominio.BairroComercial}`}
                  variant="secondary"
                />
              </div>
              <h1 className="text-xl font-bold mt-2">{rawTitle}</h1>
              <span className="text-xs text-zinc-700 font-semibold">
                {condominio.TipoEndereco} {condominio.Endereco}, {condominio.Numero}, {condominio.BairroComercial}, {condominio.Cidade}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4 mb-8">
                {condominio.ValorAluguelSite && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">Aluguel:</h4>
                    <h2 className="text-black font-semibold text-[10px]">R$ {condominio.ValorAluguelSite}</h2>
                  </div>
                )}
                <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                  <h4 className="text-zinc-600 text-[10px] font-bold">Venda:</h4>
                  <h2 className="text-black font-semibold text-[10px]">R$ {condominio.ValorAntigo}</h2>
                </div>
                {condominio.ValorCondominio && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">Condomínio:</h4>
                    <h2 className="text-black font-semibold text-[10px]">{formatterValue(condominio.ValorCondominio)}</h2>
                  </div>
                )}
                {condominio.ValorIptu && (
                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h4 className="text-zinc-600 text-[10px] font-bold">IPTU:</h4>
                    <h2 className="text-black font-semibold text-[10px]">{formatterValue(condominio.ValorIptu)}</h2>
                  </div>
                )}
              </div>
              <ScrollToImoveisButton text={`Mostrar imóveis (${imoveisRelacionados.length})`} />
            </div>
            <div className="relative w-full h-[230px] overflow-y-auto bg-white rounded-lg overflow-hidden p-4">
              {isValidValue(condominio.ValorVenda2) || isValidValue(condominio.ValorGarden) || isValidValue(condominio.ValorCobertura) ? (
                <PropertyTableOwner imovel={condominio} />
              ) : (
                <PropertyTable imoveisRelacionados={imoveisRelacionados} />
              )}
            </div>
          </div>
          <div className="relative w-full min-h-[550px] overflow-hidden rounded-lg">
            <CondominioGallery fotos={condominio.Foto} title={rawTitle} />
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
      {condominio.Video && Object.keys(condominio.Video).length > 0 && (
        <VideoCondominio condominio={condominio} />
      )}
      {condominio.Tour360 && (
        <TourVirtual link={condominio.Tour360} titulo={rawTitle} />
      )}
      <ExploreRegiao condominio={condominio} currentUrl={currentUrl} />
      <WhatsappFloat
        message={`Quero saber mais sobre o ${rawTitle}, no bairro ${condominio.BairroComercial}, disponível na página de Condomínio: ${currentUrl}`}
      />
    </section>
  );
}
