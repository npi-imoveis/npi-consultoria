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
import { headers } from "next/headers";

// 🔥 FORÇA RENDERIZAÇÃO DINÂMICA PARA GARANTIR METADATA
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 🛠️ FUNÇÃO AUXILIAR PARA CONSTRUIR URL ABSOLUTA
function getAbsoluteUrl(path) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.npiconsultoria.com.br';
  
  // Se já é uma URL absoluta, retorna como está
  if (path && path.startsWith('http')) {
    return path;
  }
  
  // Durante desenvolvimento/build, tenta pegar do header
  if (process.env.NODE_ENV === 'development' || !baseUrl.includes('npiconsultoria')) {
    try {
      const headersList = headers();
      const host = headersList.get('host');
      if (host) {
        const protocol = headersList.get('x-forwarded-proto') || 'https';
        return `${protocol}://${host}${path}`;
      }
    } catch (e) {
      // Fallback silencioso
    }
  }
  
  // Garante que o path comece com /
  const normalizedPath = path?.startsWith('/') ? path : `/${path || ''}`;
  return `${baseUrl}${normalizedPath}`;
}

// ✅ METADATA OTIMIZADA COM GARANTIA DE OG:IMAGE
export async function generateMetadata({ params }) {
  const { id } = params;
  
  try {
    console.log('[METADATA] Iniciando geração para imóvel:', id);
    
    const response = await getImovelById(id);
    
    if (!response?.data) {
      console.log('[METADATA] Imóvel não encontrado:', id);
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
    
    // 🔥 EXTRAÇÃO E PROCESSAMENTO DA IMAGEM COM MÚLTIPLAS VALIDAÇÕES
    let imageUrl = '';
    
    // Tenta extrair a primeira foto
    if (imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0) {
      // Procura pela primeira foto válida
      for (const foto of imovel.Foto) {
        if (foto && foto.Foto) {
          imageUrl = foto.Foto;
          break;
        }
      }
    }
    
    // Log para debug
    console.log('[METADATA] Imagem original:', imageUrl);
    
    // Garante URL absoluta usando a função helper
    if (imageUrl) {
      imageUrl = getAbsoluteUrl(imageUrl);
    } else {
      // Fallback para imagem padrão
      imageUrl = getAbsoluteUrl('/assets/images/default-property.jpg');
    }
    
    console.log('[METADATA] Imagem final (absoluta):', imageUrl);

    // 🎯 RETORNO OTIMIZADO DA METADATA
    const metadata = {
      title,
      description,
      metadataBase: new URL(siteUrl),
      
      // 🔥 OPEN GRAPH SIMPLIFICADO AO MÁXIMO
      openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: currentUrl,
        siteName: 'NPI Imobiliária',
        title,
        description,
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
      
      // 🐦 TWITTER CARDS
      twitter: {
        card: 'summary_large_image',
        site: '@npiconsultoria',
        creator: '@npiconsultoria',
        title,
        description,
        images: [imageUrl],
      },
      
      // 📱 OUTROS METADADOS
      robots: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
      
      alternates: {
        canonical: currentUrl,
      },
      
      // 🔧 METADADOS ADICIONAIS
      other: {
        'og:image:secure_url': imageUrl,
        'og:updated_time': new Date().toISOString(),
      },
    };
    
    console.log('[METADATA] Gerada com sucesso para:', imovel.Codigo);
    return metadata;
    
  } catch (error) {
    console.error('[METADATA ERROR] Erro completo:', error);
    console.error('[METADATA ERROR] Stack:', error.stack);
    
    // Retorna metadata mínima em caso de erro
    return {
      title: 'Erro ao carregar imóvel',
      description: 'Ocorreu um erro ao carregar as informações do imóvel.',
      openGraph: {
        title: 'Erro ao carregar imóvel',
        description: 'Ocorreu um erro ao carregar as informações do imóvel.',
        images: [getAbsoluteUrl('/assets/images/default-property.jpg')],
      },
    };
  }
}

// 🏠 COMPONENTE DA PÁGINA (mantido exatamente como estava)
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
