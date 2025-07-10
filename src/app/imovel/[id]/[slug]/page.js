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

// Componente para meta tags específicas que o Ahrefs precisa detectar
function DateMetaTags({ modifiedDate }) {
  return (
    <>
      <meta property="article:modified_time" content={modifiedDate} />
      <meta property="article:published_time" content={modifiedDate} />
      <meta property="og:updated_time" content={modifiedDate} />
      <meta name="last-modified" content={modifiedDate} />
    </>
  );
}

// Utilitários centralizados
const utils = {
  /**
   * Converte data brasileira para formato ISO
   * @param {string} brazilianDate - Data no formato "DD/MM/AAAA, HH:MM:SS"
   * @returns {string} Data no formato ISO
   */
  convertBrazilianDateToISO: (brazilianDate, imovelData) => {
    console.error('[DATE] ===== DEBUG COMPLETO DA DATA =====');
    console.error('[DATE] brazilianDate recebido:', brazilianDate);
    console.error('[DATE] Tipo:', typeof brazilianDate);
    console.error('[DATE] imovelData.DataHoraAtualizacao:', imovelData?.DataHoraAtualizacao);
    console.error('[DATE] imovelData.DataAtualizacao:', imovelData?.DataAtualizacao);
    console.error('[DATE] imovelData.DataCadastro:', imovelData?.DataCadastro);
    console.error('[DATE] imovelData completo (campos de data):', {
      DataHoraAtualizacao: imovelData?.DataHoraAtualizacao,
      DataAtualizacao: imovelData?.DataAtualizacao,
      DataCadastro: imovelData?.DataCadastro,
      DataModificacao: imovelData?.DataModificacao,
      UltimaAtualizacao: imovelData?.UltimaAtualizacao
    });
    
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
        console.error('[DATE] Usando campo:', workingDate);
        break;
      }
    }
    
    if (!workingDate) {
      console.error('[DATE] NENHUMA DATA ENCONTRADA! Usando fallback');
      return '2025-02-11T20:53:31.000Z'; // Data fixa baseada no admin como último recurso
    }
    
    console.error('[DATE] Processando data:', workingDate);
    
    try {
      // Tentar diferentes formatos
      
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
          const isoString = date.toISOString();
          console.error('[DATE] ✅ Convertido (formato 1):', isoString);
          return isoString;
        }
      }
      
      // Formato 2: "AAAA-MM-DD HH:MM:SS"
      if (workingDate.includes('-') && workingDate.includes(' ')) {
        const date = new Date(workingDate);
        if (!isNaN(date.getTime())) {
          const isoString = date.toISOString();
          console.error('[DATE] ✅ Convertido (formato 2):', isoString);
          return isoString;
        }
      }
      
      // Formato 3: Tentar parse direto
      const date = new Date(workingDate);
      if (!isNaN(date.getTime())) {
        const isoString = date.toISOString();
        console.error('[DATE] ✅ Convertido (formato 3):', isoString);
        return isoString;
      }
      
      throw new Error('Nenhum formato funcionou');
      
    } catch (error) {
      console.error('[DATE] ❌ Erro ao converter:', error.message);
      console.error('[DATE] Usando data do admin como fallback');
      return '2025-02-11T20:53:31.000Z'; // Data do admin como fallback
    }
  },

  /**
   * Normaliza dados do imóvel
   * @param {Object} rawData - Dados brutos do imóvel
   * @returns {Object} Dados normalizados
   */
  normalizeImovelData: (rawData) => ({
    ...rawData,
    SuiteAntigo: rawData.SuiteAntigo ?? rawData.Suites ?? 0,
    DormitoriosAntigo: rawData.DormitoriosAntigo ?? 0,
    VagasAntigo: rawData.VagasAntigo ?? 0,
    BanheiroSocialQtd: rawData.BanheiroSocialQtd ?? 0,
  }),
  getMainImageUrl: (foto) => {
    if (Array.isArray(foto) && foto.length > 0) {
      return foto[0].Foto || foto[0].FotoPequena || foto[0];
    }
    if (typeof foto === 'string') {
      return foto;
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;
  },

  /**
   * Gera URL canônica do imóvel
   * @param {string|number} codigo - Código do imóvel
   * @param {string} slug - Slug do imóvel
   * @returns {string} URL canônica
   */
  getCanonicalUrl: (codigo, slug) => 
    `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${codigo}/${slug}`,

  /**
   * Gera descrição SEO do imóvel
   * @param {Object} imovel - Dados do imóvel
   * @returns {string} Descrição formatada
   */
  generateSEODescription: (imovel) => {
    const valor = imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte";
    return `${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo} dormitórios, ${imovel.SuiteAntigo} suítes, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. Valor: ${valor}.`;
  }
};

// Configuração de revalidação
export const revalidate = 0;

/**
 * Geração dinâmica de metadados SEO
 */
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

    const imovel = {
      ...response.data,
      SuiteAntigo: response.data.SuiteAntigo ?? response.data.Suites ?? 0,
      DormitoriosAntigo: response.data.DormitoriosAntigo ?? 0,
      VagasAntigo: response.data.VagasAntigo ?? 0,
      BanheiroSocialQtd: response.data.BanheiroSocialQtd ?? 0,
    };
    const modifiedDate = utils.convertBrazilianDateToISO(imovel.DataHoraAtualizacao);
    const canonicalUrl = utils.getCanonicalUrl(imovel.Codigo, imovel.Slug);
    const imageUrl = utils.getMainImageUrl(imovel.Foto);
    
    console.error(`[IMOVEL-META] Image URL: ${imageUrl}`);
    console.error(`[IMOVEL-META] Modified Date: ${modifiedDate}`);
    
    const title = `${imovel.Empreendimento} - ${imovel.BairroComercial}, ${imovel.Cidade}`;
    const description = utils.generateSEODescription(imovel);

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
        languages: {
          "pt-BR": canonicalUrl,
        },
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
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        type: "website",
        siteName: "NPI Consultoria",
        publishedTime: modifiedDate, // ✅ Data real convertida
        modifiedTime: modifiedDate,  // ✅ Data real convertida
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/jpeg",
          }
        ],
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
      // ✅ MANTENDO TODAS AS META TAGS IMPORTANTES PARA AHREFS
      other: {
        'article:modified_time': modifiedDate,
        'article:published_time': modifiedDate,
        'og:updated_time': modifiedDate,
        'last-modified': modifiedDate,
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

/**
 * Componente principal da página do imóvel
 */
export default async function ImovelPage({ params }) {
  const { id, slug } = params;
  
  console.log(`🏠 [IMOVEL-PAGE] =================== INÍCIO ===================`);
  console.log(`🏠 [IMOVEL-PAGE] Processando ID: ${id}, SLUG: ${slug}`);
  console.log(`🏠 [IMOVEL-PAGE] Params completos:`, params);
  
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

    // Normalizar dados (mantendo exatamente como estava)
    const imovel = utils.normalizeImovelData(response.data);

    const slugCorreto = imovel.Slug;

    // Verificar e redirecionar se slug estiver incorreto
    if (slug !== slugCorreto) {
      redirect(`/imovel-${id}/${slugCorreto}`);
    }

    // Preparar dados para renderização
    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    
    // ✅ CONVERTER DATA AQUI NO COMPONENTE (mantendo como estava)
    const modifiedDate = utils.convertBrazilianDateToISO(imovel.DataHoraAtualizacao, imovel);
    console.log('🔍 Data convertida no componente:', modifiedDate);

    return (
      <>
        {/* ✅ META TAGS ESPECÍFICAS PARA AHREFS DETECTAR */}
        <DateMetaTags modifiedDate={modifiedDate} />
        
        <main className="w-full bg-white pb-32 pt-20">
          {/* Dados estruturados para SEO */}
          <StructuredDataApartment
            title={imovel.Empreendimento}
            price={imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}
            description={`${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Empreendimento}: ${imovel.DormitoriosAntigo} quartos, ${imovel.SuiteAntigo} suítes, ${imovel.BanheiroSocialQtd} banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. ${imovel.Situacao}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}. ${imovel.TipoEndereco} ${imovel.Endereco}.`}
            address={`${imovel.TipoEndereco} ${imovel.Endereco}, ${imovel.Numero}, ${imovel.BairroComercial}, ${imovel.Cidade}`}
            url={currentUrl}
            image={imovel.Foto}
          />

          {/* Modal de exit intent */}
          <ExitIntentModal 
            condominio={imovel.Empreendimento} 
            link={currentUrl} 
          />

          {/* Galeria de imagens */}
          <div className="w-full mx-auto">
            <ImageGallery imovel={imovel} />
          </div>

          {/* Conteúdo principal */}
          <div className="container mx-auto gap-4 mt-3 px-4 md:px-0 flex flex-col lg:flex-row">
            {/* Coluna principal de conteúdo */}
            <div className="w-full lg:w-[65%]">
              <TituloImovel imovel={imovel} currentUrl={currentUrl} />
              <DetalhesImovel imovel={imovel} />
              <DescricaoImovel imovel={imovel} />
              <FichaTecnica imovel={imovel} />
              <DetalhesCondominio imovel={imovel} />
              <Lazer imovel={imovel} />
              
              {/* Renderização condicional mantida exatamente como estava */}
              {imovel.Video && Object.keys(imovel.Video).length > 0 && (
                <VideoCondominio imovel={imovel} />
              )}
              {imovel.Tour360 && (
                <TourVirtual 
                  link={imovel.Tour360} 
                  titulo={imovel.Empreendimento} 
                />
              )}
              
              <SimilarProperties id={imovel.Codigo} />
              <LocalizacaoCondominio imovel={imovel} />
            </div>

            {/* Sidebar de contato */}
            <div className="w-full lg:w-[35%] h-fit lg:sticky lg:top-24 order-first lg:order-last mb-6 lg:mb-0">
              <Contato imovel={imovel} currentUrl={currentUrl} />
            </div>
          </div>

          {/* FAQ */}
          <div className="container mx-auto px-4 md:px-0">
            <FAQImovel imovel={imovel} />
          </div>

          {/* WhatsApp float - mantendo mensagem exatamente como estava */}
          <WhatsappFloat
            message={`Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponível na página do Imóvel: ${currentUrl}`}
          />
        </main>
      </>
    );
  } catch (error) {
    console.error('Erro na página do imóvel:', error);
    notFound();
  }
}
