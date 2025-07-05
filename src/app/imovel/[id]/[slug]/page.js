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

// ✅ METADATA CORRIGIDA - VERSÃO FINAL
export async function generateMetadata({ params }) {
  const { id } = params;
  
  console.error(`[IMOVEL-META] =========== PROCESSANDO ID: ${id} ===========`);
  
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
    
    // 🔥 CORREÇÃO CRÍTICA DA IMAGEM
    let imageUrl = '';
    if (imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0) {
      // Se for array, pega a primeira imagem
      const primeiraFoto = imovel.Foto[0];
      if (primeiraFoto && primeiraFoto.Foto) {
        imageUrl = primeiraFoto.Foto;
      }
    } else if (imovel.Foto && typeof imovel.Foto === 'string') {
      // Se for string direta
      imageUrl = imovel.Foto;
    }
    
    // Garantir URL absoluta
    if (imageUrl && !imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('/')) {
        imageUrl = `${siteUrl}${imageUrl}`;
      } else {
        imageUrl = `${siteUrl}/${imageUrl}`;
      }
    }
    
    // Fallback se não tiver imagem
    if (!imageUrl) {
      imageUrl = `${siteUrl}/assets/images/default-property.jpg`;
    }

    console.error(`[IMOVEL-META] Image URL Final: ${imageUrl}`);

    return {
      title,
      description,
      
      // 🎯 METADATABASE OBRIGATÓRIO NO NEXT 14
      metadataBase: new URL(siteUrl),
      
      // 🔥 FORÇAR OPEN GRAPH COM ESTRUTURA SIMPLES
      openGraph: {
        title,
        description,
        url: currentUrl,
        siteName: 'NPI Imobiliária',
        locale: 'pt_BR',
        type: 'website',
        images: imageUrl, // ⚡ MUDANÇA: usar string simples em vez de array
      },
      
      // 🐦 TWITTER CARDS
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl, // ⚡ MUDANÇA: usar string simples
      },
      
      // 🚀 FORÇAR META TAGS CRÍTICAS VIA OTHER
      other: {
        // ⚡ TAGS MAIS IMPORTANTES PARA WHATSAPP
        'og:image': imageUrl,
        'og:image:secure_url': imageUrl,
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
        'og:type': 'website',
        'og:site_name': 'NPI Imobiliária',
        'og:locale': 'pt_BR',
        
        // Twitter específico
        'twitter:image': imageUrl,
        'twitter:image:alt': title,
        
        // Meta tags adicionais
        'property="og:updated_time"': new Date().toISOString(),
      },
      
      // Meta tags básicas
      keywords: `${imovel.Categoria}, ${imovel.BairroComercial}, ${imovel.Cidade}, ${imovel.Empreendimento}, imóvel, venda`,
      
      // Robots
      robots: {
        index: true,
        follow: true,
      },
      
      // Canonical URL
      alternates: {
        canonical: currentUrl,
      },
    };
    
  } catch (error) {
    console.error('[IMOVEL-META] Erro ao gerar metadata:', error);
    return {
      title: 'Erro ao carregar imóvel',
      description: 'Ocorreu um erro ao carregar as informações do imóvel.',
    };
  }
}

export const revalidate = 0;

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
