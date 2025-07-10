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

// Função utilitária para converter data brasileira para ISO
function convertBrazilianDateToISO(brazilianDate, imovelData) {
  // Tentar múltiplos campos de data
  const possibleDateFields = [
    brazilianDate,
    imovelData?.DataHoraAtualizacao,
    imovelData?.DataAtualizacao,
    imovelData?.DataCadastro,
    imovelData?.DataModificacao,
    imovelData?.UltimaAtualizacao
  ];
  
  let workingDate = null;
  for (const dateField of possibleDateFields) {
    if (dateField && typeof dateField === 'string' && dateField.trim() !== '') {
      workingDate = dateField.trim();
      break;
    }
  }
  
  if (!workingDate) {
    return new Date().toISOString();
  }
  
  try {
    // Formato 1: "DD/MM/AAAA, HH:MM:SS"
    if (workingDate.includes(', ')) {
      const [datePart, timePart] = workingDate.split(', ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes, seconds] = timePart.split(':');
      
      const date = new Date(
        parseInt(year), 
        parseInt(month) - 1, 
        parseInt(day), 
        parseInt(hours), 
        parseInt(minutes), 
        parseInt(seconds || 0)
      );
      
      if (!isNaN(date.getTime())) {
        return date.toISOString();
      }
    }
    
    // Formato 2: Tentar parse direto
    const date = new Date(workingDate);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
    
    return new Date().toISOString();
  } catch (error) {
    return new Date().toISOString();
  }
}

// Configuração de revalidação
export const revalidate = 0;

// Geração dinâmica de metadados SEO
export async function generateMetadata({ params }) {
  const { id } = params;
  
  console.error(`[IMOVEL-META] =========== PROCESSANDO ID: ${id} ===========`);
  
  try {
    const response = await getImovelById(id);
    if (!response?.data) {
      return {
        title: 'Imóvel não encontrado - NPI Consultoria',
        description: 'O imóvel solicitado não foi encontrado.',
      };
    }

    const imovel = response.data;
    const modifiedDate = convertBrazilianDateToISO(imovel.DataHoraAtualizacao, imovel);
    
    console.error(`[IMOVEL-META] Modified Date: ${modifiedDate}`);
    
    const title = `${imovel.Empreendimento} - ${imovel.BairroComercial}, ${imovel.Cidade}`;
    const description = `${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo} dormitórios, ${imovel.SuiteAntigo} suítes, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`;
    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    
    const imageUrl = Array.isArray(imovel.Foto) && imovel.Foto.length > 0 
      ? (imovel.Foto[0].Foto || imovel.Foto[0].FotoPequena || imovel.Foto[0])
      : imovel.Foto || `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;

    return {
      title,
      description,
      alternates: {
        canonical: currentUrl,
        languages: {
          "pt-BR": currentUrl,
        },
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title,
        description,
        url: currentUrl,
        type: "website",
        siteName: "NPI Consultoria",
        publishedTime: modifiedDate,
        modifiedTime: modifiedDate,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/jpeg",
          }
        ],
        // ✅ Meta tags OpenGraph adicionais
        updated_time: modifiedDate,
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        site: "@NPIImoveis",
        creator: "@NPIImoveis",
        images: [
          {
            url: imageUrl,
            alt: title,
          }
        ],
      },
      other: {
        'article:modified_time': modifiedDate,
        'article:published_time': modifiedDate,
        'og:updated_time': modifiedDate,
        'last-modified': modifiedDate,
        'date': modifiedDate,
        'DC.date.modified': modifiedDate,
        'DC.date.created': modifiedDate,
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    return {
      title: 'Erro - NPI Consultoria',
      description: 'Ocorreu um erro ao carregar as informações do imóvel.',
    };
  }
}

// Componente principal da página do imóvel
export default async function ImovelPage({ params }) {
  const { id, slug } = params;
  
  console.log(`🏠 [IMOVEL-PAGE] =================== INÍCIO ===================`);
  console.log(`🏠 [IMOVEL-PAGE] Processando ID: ${id}, SLUG: ${slug}`);
  
  try {
    console.log(`🏠 [IMOVEL-PAGE] 📞 Chamando getImovelById(${id})`);
    const response = await getImovelById(id);
    
    console.log(`🏠 [IMOVEL-PAGE] 📞 Response:`, { 
      success: !!response?.data, 
      codigo: response?.data?.Codigo,
      empreendimento: response?.data?.Empreendimento?.substring(0, 30)
    });
    
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
    const modifiedDate = convertBrazilianDateToISO(imovel.DataHoraAtualizacao, imovel);
    
    console.log('🔍 Data convertida no componente:', modifiedDate);

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
  } catch (error) {
    console.error('Erro na página do imóvel:', error);
    notFound();
  }
}
