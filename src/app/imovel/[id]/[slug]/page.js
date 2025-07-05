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

// 🔧 FUNÇÃO AUXILIAR PARA GARANTIR URL ABSOLUTA
function getAbsoluteUrl(path) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.npiconsultoria.com.br';
  
  // Se já é uma URL absoluta, retorna como está
  if (path && path.startsWith('http')) {
    return path;
  }
  
  // Se não tem path, retorna URL padrão
  if (!path) {
    return `${baseUrl}/assets/images/default-property.jpg`;
  }
  
  // Constrói URL absoluta
  return path.startsWith('/') ? `${baseUrl}${path}` : `${baseUrl}/${path}`;
}

// ✅ METADATA OTIMIZADA COM GARANTIA DE OG:IMAGE
export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    const response = await getImovelById(id);
    
    if (!response?.data) {
      return {
        title: 'Imóvel não encontrado',
        description: 'Este imóvel não está mais disponível.',
      };
    }

    const imovel = response.data;
    
    // Dados básicos
    const title = `${imovel.Empreendimento} - ${imovel.BairroComercial}, ${imovel.Cidade}`;
    const description = `${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo || 0} dormitórios, ${imovel.SuiteAntigo || 0} suítes, ${imovel.VagasAntigo || 0} vagas, ${imovel.MetragemAnt || 'Metragem a consultar'}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`;
    
    // URLs
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.npiconsultoria.com.br';
    const currentUrl = `${siteUrl}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    
    // 🔥 EXTRAÇÃO DA IMAGEM COM GARANTIA DE URL ABSOLUTA
    let imageUrl = '';
    
    // Tenta pegar a primeira foto
    if (imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0) {
      const primeiraFoto = imovel.Foto[0];
      imageUrl = primeiraFoto.Foto || primeiraFoto.url || primeiraFoto;
    }
    
    // Garante URL absoluta
    imageUrl = getAbsoluteUrl(imageUrl);
    
    // Log para debug (remova em produção)
    console.log('[METADATA] Image URL:', imageUrl);
    console.log('[METADATA] Current URL:', currentUrl);

    return {
      title,
      description,
      metadataBase: new URL(siteUrl),
      
      // 🎯 OPEN GRAPH COM ARRAY DE IMAGENS CORRETO
      openGraph: {
        title,
        description,
        url: currentUrl,
        siteName: 'NPI Imobiliária',
        locale: 'pt_BR',
        type: 'website',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: 'image/jpeg',
          }
        ],
      },
      
      // 🐦 TWITTER CARDS COM ARRAY
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
        site: '@npiconsultoria',
        creator: '@npiconsultoria',
      },
      
      // 🚀 OUTROS METADADOS
      other: {
        'og:image': imageUrl,
        'og:image:secure_url': imageUrl,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
        'og:image:type': 'image/jpeg',
        'twitter:image': imageUrl,
        'twitter:image:alt': title,
      },
      
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      
      alternates: {
        canonical: currentUrl,
      },
      
      // 🆕 VIEWPORT E TEMA
      viewport: 'width=device-width, initial-scale=1',
      themeColor: '#ffffff',
      
      // 🆕 VERIFICAÇÃO DO SITE
      verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
      },
    };
    
  } catch (error) {
    console.error('[METADATA ERROR]:', error);
    
    // Retorna metadata básica com imagem padrão em caso de erro
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.npiconsultoria.com.br';
    const defaultImage = `${siteUrl}/assets/images/default-property.jpg`;
    
    return {
      title: 'Erro ao carregar imóvel',
      description: 'Ocorreu um erro ao carregar as informações do imóvel.',
      openGraph: {
        title: 'Erro ao carregar imóvel',
        description: 'Ocorreu um erro ao carregar as informações do imóvel.',
        images: [
          {
            url: defaultImage,
            width: 1200,
            height: 630,
          }
        ],
      },
    };
  }
}

// 🆕 FORCE DYNAMIC PARA GARANTIR GERAÇÃO CORRETA
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Imovel({ params }) {
  const { id, slug } = params;
  
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.npiconsultoria.com.br';
  const currentUrl = `${siteUrl}/imovel-${imovel.Codigo}/${imovel.Slug}`;

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
        message={`Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponível na página do Imóvel: ${currentUrl}`}
      />
    </section>
  );
}
