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

// ✅ METADATA COM DEBUG MÁXIMO
export async function generateMetadata({ params }) {
  const { id } = params;
  
  console.error(`🔥 [DEBUG-META] ================ INÍCIO ================`);
  console.error(`🔥 [DEBUG-META] Processando ID: ${id}`);
  console.error(`🔥 [DEBUG-META] Params completo:`, JSON.stringify(params));
  
  try {
    const response = await getImovelById(id);
    
    console.error(`🔥 [DEBUG-META] Response status:`, response ? 'OK' : 'NULL');
    console.error(`🔥 [DEBUG-META] Response.data exists:`, !!response?.data);
    
    if (!response?.data) {
      console.error(`🔥 [DEBUG-META] ❌ Sem dados para o ID: ${id}`);
      return {
        title: 'Imóvel não encontrado',
        description: 'Este imóvel não está mais disponível.',
      };
    }

    const imovel = response.data;
    
    console.error(`🔥 [DEBUG-META] Empreendimento:`, imovel.Empreendimento);
    console.error(`🔥 [DEBUG-META] Foto é array:`, Array.isArray(imovel.Foto));
    console.error(`🔥 [DEBUG-META] Foto length:`, imovel.Foto?.length);
    console.error(`🔥 [DEBUG-META] Primeira foto:`, imovel.Foto?.[0]?.Foto);
    
    // Dados básicos
    const title = `${imovel.Empreendimento} - ${imovel.BairroComercial}, ${imovel.Cidade}`;
    const description = `${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo || 0} dormitórios, ${imovel.SuiteAntigo || 0} suítes, ${imovel.VagasAntigo || 0} vagas, ${imovel.MetragemAnt || 'Metragem a consultar'}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`;
    
    console.error(`🔥 [DEBUG-META] Title:`, title);
    console.error(`🔥 [DEBUG-META] Description length:`, description.length);
    
    // URLs
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.npiconsultoria.com.br';
    const currentUrl = `${siteUrl}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    
    console.error(`🔥 [DEBUG-META] Site URL:`, siteUrl);
    console.error(`🔥 [DEBUG-META] Current URL:`, currentUrl);
    
    // 🔥 ANÁLISE DETALHADA DA IMAGEM
    let imageUrl = '';
    
    console.error(`🔥 [DEBUG-META] === ANÁLISE DA IMAGEM ===`);
    console.error(`🔥 [DEBUG-META] Tipo do imovel.Foto:`, typeof imovel.Foto);
    console.error(`🔥 [DEBUG-META] É array:`, Array.isArray(imovel.Foto));
    
    if (imovel.Foto && Array.isArray(imovel.Foto) && imovel.Foto.length > 0) {
      console.error(`🔥 [DEBUG-META] ✅ Array com ${imovel.Foto.length} fotos`);
      const primeiraFoto = imovel.Foto[0];
      console.error(`🔥 [DEBUG-META] Primeira foto objeto:`, JSON.stringify(primeiraFoto, null, 2));
      
      if (primeiraFoto && primeiraFoto.Foto) {
        imageUrl = primeiraFoto.Foto;
        console.error(`🔥 [DEBUG-META] ✅ URL extraída do array:`, imageUrl);
      } else {
        console.error(`🔥 [DEBUG-META] ❌ Primeira foto não tem propriedade Foto`);
      }
    } else if (imovel.Foto && typeof imovel.Foto === 'string') {
      console.error(`🔥 [DEBUG-META] ✅ String direta`);
      imageUrl = imovel.Foto;
    } else {
      console.error(`🔥 [DEBUG-META] ❌ Foto inválida ou inexistente`);
    }
    
    console.error(`🔥 [DEBUG-META] Image URL antes da validação:`, imageUrl);
    
    // Garantir URL absoluta
    if (imageUrl && !imageUrl.startsWith('http')) {
      if (imageUrl.startsWith('/')) {
        imageUrl = `${siteUrl}${imageUrl}`;
      } else {
        imageUrl = `${siteUrl}/${imageUrl}`;
      }
      console.error(`🔥 [DEBUG-META] URL convertida para absoluta:`, imageUrl);
    }
    
    // Fallback se não tiver imagem
    if (!imageUrl) {
      imageUrl = `${siteUrl}/assets/images/default-property.jpg`;
      console.error(`🔥 [DEBUG-META] ⚠️ Usando fallback:`, imageUrl);
    }

    console.error(`🔥 [DEBUG-META] 🎯 IMAGE URL FINAL:`, imageUrl);

    const metadata = {
      title,
      description,
      
      // 🎯 METADATABASE OBRIGATÓRIO NO NEXT 14
      metadataBase: new URL(siteUrl),
      
      // 🔥 OPEN GRAPH SIMPLES
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
          }
        ],
      },
      
      // 🐦 TWITTER CARDS
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
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
    
    console.error(`🔥 [DEBUG-META] === METADATA FINAL ===`);
    console.error(`🔥 [DEBUG-META] OpenGraph images:`, JSON.stringify(metadata.openGraph.images, null, 2));
    console.error(`🔥 [DEBUG-META] Twitter images:`, JSON.stringify(metadata.twitter.images, null, 2));
    console.error(`🔥 [DEBUG-META] ================ FIM ================`);
    
    return metadata;
    
  } catch (error) {
    console.error('🔥 [DEBUG-META] ❌ ERRO:', error);
    return {
      title: 'Erro ao carregar imóvel',
      description: 'Ocorreu um erro ao carregar as informações do imóvel.',
    };
  }
}

export const revalidate = 0;

export default async function Imovel({ params }) {
  const { id, slug } = params;
  
  console.error(`🔥 [DEBUG-PAGE] =========== RENDERIZANDO PÁGINA ===========`);
  console.error(`🔥 [DEBUG-PAGE] ID: ${id}, Slug: ${slug}`);
  
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
