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

// Função utilitária CORRIGIDA para converter data brasileira para ISO
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
  
  // ✅ FALLBACK: Se não encontrar data válida, usar data atual
  if (!workingDate) {
    const currentDate = new Date();
    console.log(`[DATE-CONVERT] ⚠️  Usando data atual como fallback: ${currentDate.toISOString()}`);
    return currentDate.toISOString();
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
        console.log(`[DATE-CONVERT] ✅ Formato brasileiro convertido: ${date.toISOString()}`);
        return date.toISOString();
      }
    }
    
    // Formato 2: Tentar parse direto
    const date = new Date(workingDate);
    if (!isNaN(date.getTime())) {
      console.log(`[DATE-CONVERT] ✅ Parse direto: ${date.toISOString()}`);
      return date.toISOString();
    }
    
    // ✅ Se chegou aqui, usar data atual
    const fallbackDate = new Date();
    console.log(`[DATE-CONVERT] ⚠️  Fallback para data atual: ${fallbackDate.toISOString()}`);
    return fallbackDate.toISOString();
    
  } catch (error) {
    console.error(`[DATE-CONVERT] ❌ Erro na conversão:`, error);
    const errorFallbackDate = new Date();
    return errorFallbackDate.toISOString();
  }
}

// ✅ NOVA FUNÇÃO: Validação cirúrgica do vídeo YouTube
function temVideoYouTubeValido(videoObj) {
  try {
    // Verificações básicas
    if (!videoObj || typeof videoObj !== 'object' || Array.isArray(videoObj)) {
      return false;
    }
    
    const keys = Object.keys(videoObj);
    if (keys.length === 0) {
      return false;
    }
    
    // Extrair valor do vídeo
    let videoValue = null;
    const values = Object.values(videoObj);
    
    if (values.length > 0) {
      const firstValue = values[0];
      if (firstValue && typeof firstValue === 'object') {
        videoValue = firstValue.Video || firstValue.url || firstValue.videoId || firstValue.id;
      } else if (firstValue && typeof firstValue === 'string') {
        videoValue = firstValue;
      }
    }
    
    if (!videoValue) {
      videoValue = videoObj.Video || videoObj.url || videoObj.videoId || videoObj.id;
    }
    
    if (!videoValue || typeof videoValue !== 'string') {
      return false;
    }
    
    const trimmed = videoValue.trim();
    if (trimmed === '') {
      return false;
    }
    
    // Validar se é YouTube válido (padrões básicos)
    const youtubePatterns = [
      /^[a-zA-Z0-9_-]{11}$/,                                          // VideoId direto
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,  // URL padrão
      /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,                    // URL embed
      /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/                    // URL shorts
    ];
    
    return youtubePatterns.some(pattern => pattern.test(trimmed));
  } catch (error) {
    console.error('Erro na validação do vídeo:', error);
    return false;
  }
}

// ✅ NOVA FUNÇÃO: Obter URL da imagem otimizada para WhatsApp
function getWhatsAppOptimizedImageUrl(imovelFotos) {
  console.log('📱 [WHATSAPP-IMG] Processando fotos para WhatsApp:', imovelFotos);
  
  try {
    // Caso 1: Array de fotos
    if (Array.isArray(imovelFotos) && imovelFotos.length > 0) {
      const primeiraFoto = imovelFotos[0];
      
      // Se a primeira foto é um objeto
      if (primeiraFoto && typeof primeiraFoto === 'object') {
        // Prioridade: Foto completa > FotoPequena > FotoMedia > qualquer propriedade de imagem
        const imageUrl = primeiraFoto.Foto || 
                        primeiraFoto.FotoPequena || 
                        primeiraFoto.FotoMedia || 
                        primeiraFoto.FotoGrande ||
                        primeiraFoto.url ||
                        primeiraFoto.src;
        
        if (imageUrl && typeof imageUrl === 'string') {
          console.log('📱 [WHATSAPP-IMG] ✅ URL de objeto array:', imageUrl);
          return imageUrl;
        }
      }
      
      // Se a primeira foto é uma string direta
      if (typeof primeiraFoto === 'string') {
        console.log('📱 [WHATSAPP-IMG] ✅ URL string direta:', primeiraFoto);
        return primeiraFoto;
      }
    }
    
    // Caso 2: String direta de foto
    if (typeof imovelFotos === 'string' && imovelFotos.trim() !== '') {
      console.log('📱 [WHATSAPP-IMG] ✅ URL string:', imovelFotos);
      return imovelFotos;
    }
    
    // Caso 3: Objeto único com propriedades de imagem
    if (imovelFotos && typeof imovelFotos === 'object' && !Array.isArray(imovelFotos)) {
      const imageUrl = imovelFotos.Foto || 
                     imovelFotos.FotoPequena || 
                     imovelFotos.FotoMedia ||
                     imovelFotos.url ||
                     imovelFotos.src;
      
      if (imageUrl && typeof imageUrl === 'string') {
        console.log('📱 [WHATSAPP-IMG] ✅ URL de objeto único:', imageUrl);
        return imageUrl;
      }
    }
    
    // Fallback: Imagem padrão
    const fallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;
    console.log('📱 [WHATSAPP-IMG] ⚠️ Usando fallback:', fallbackUrl);
    return fallbackUrl;
    
  } catch (error) {
    console.error('📱 [WHATSAPP-IMG] ❌ Erro ao processar imagem:', error);
    return `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;
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
    
    // ✅ GARANTIR DATA VÁLIDA
    let modifiedDate;
    try {
      modifiedDate = convertBrazilianDateToISO(imovel.DataHoraAtualizacao, imovel);
      
      // ✅ VALIDAÇÃO EXTRA: Verificar se a data é realmente válida
      const testDate = new Date(modifiedDate);
      if (isNaN(testDate.getTime())) {
        console.error(`[IMOVEL-META] ❌ Data inválida gerada, usando fallback`);
        modifiedDate = new Date().toISOString();
      }
    } catch (error) {
      console.error(`[IMOVEL-META] ❌ Erro na conversão de data:`, error);
      modifiedDate = new Date().toISOString();
    }
    
    console.error(`[IMOVEL-META] ✅ Data final válida: ${modifiedDate}`);
    
    const title = `${imovel.Empreendimento}, ${imovel.TipoEndereco} ${imovel.Endereco} ${imovel.Numero}, ${imovel.BairroComercial}, ${imovel.Cidade}`;
    const description = `${imovel.Empreendimento}, ${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo} dormitórios, ${imovel.SuiteAntigo} suítes, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt} m2. Preço: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`;
    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    
    // ✅ CORREÇÃO WHATSAPP: URL de imagem otimizada
    const imageUrl = getWhatsAppOptimizedImageUrl(imovel.Foto);
    
    console.log('📱 [WHATSAPP-META] URL final da imagem para WhatsApp:', imageUrl);

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
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
      openGraph: {
        title,
        description,
        url: currentUrl,
        type: "article", // ✅ CORREÇÃO: "article" é melhor para WhatsApp que "website"
        siteName: "NPI Consultoria",
        publishedTime: modifiedDate,
        modifiedTime: modifiedDate,
        locale: "pt_BR", // ✅ ADIÇÃO: Importante para WhatsApp brasileiro
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/jpeg",
          },
          // ✅ ADIÇÃO: Imagem secundária como fallback
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
            width: 1200,
            height: 630,
            alt: "NPI Consultoria - Imóveis",
            type: "image/png",
          }
        ],
        // ✅ Meta tags OpenGraph adicionais otimizadas para WhatsApp
        updated_time: modifiedDate,
        "image:alt": title, // ✅ ADIÇÃO: Alt text específico para WhatsApp
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
      // ✅ ADIÇÕES ESPECÍFICAS para WhatsApp Web e Mobile
      other: {
        'article:published_time': modifiedDate,
        'article:modified_time': modifiedDate,
        'article:author': 'NPI Consultoria',
        'article:section': 'Imobiliário',
        'article:tag': `${imovel.Categoria}, ${imovel.BairroComercial}, ${imovel.Cidade}, imóvel à venda`,
        'og:updated_time': modifiedDate,
        'og:image:secure_url': imageUrl, // ✅ IMPORTANTE: HTTPS para WhatsApp
        'og:image:type': 'image/jpeg',
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
        'og:locale': 'pt_BR',
        'og:locale:alternate': 'pt_BR',
        'last-modified': modifiedDate,
        'date': modifiedDate,
        'DC.date.modified': modifiedDate,
        'DC.date.created': modifiedDate,
        // ✅ Meta tags específicas para WhatsApp Business API
        'whatsapp:title': title,
        'whatsapp:description': description,
        'whatsapp:image': imageUrl,
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

    // Middleware já redireciona slugs antigos, então aqui só chegam slugs corretos
    // Apenas logamos para debug se necessário
    if (slug !== slugCorreto) {
      console.log(`🏠 [IMOVEL-PAGE] ⚠️ Slug inconsistente (middleware deveria ter redirecionado): ${slug} vs ${slugCorreto}`);
    }

    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    const modifiedDate = convertBrazilianDateToISO(imovel.DataHoraAtualizacao, imovel);
    
    console.log('🔍 Data convertida no componente:', modifiedDate);

    // Structured Data adicional para datas
    const structuredDataDates = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      url: currentUrl,
      datePublished: modifiedDate,
      dateModified: modifiedDate,
      author: {
        "@type": "Organization",
        name: "NPI Consultoria"
      },
      publisher: {
        "@type": "Organization",
        name: "NPI Consultoria"
      }
    };

    // ✅ DEBUG: Logs para verificação
    console.log('🎥 [VIDEO-DEBUG] Dados do vídeo:', imovel.Video);
    console.log('🎥 [VIDEO-DEBUG] Vídeo válido?', temVideoYouTubeValido(imovel.Video));
    console.log('📱 [WHATSAPP-DEBUG] URL da imagem:', getWhatsAppOptimizedImageUrl(imovel.Foto));

    return (
      <section className="w-full bg-white pb-32 pt-20">
        {/* Structured Data para o imóvel */}
        <StructuredDataApartment
          title={imovel.Empreendimento}
          price={imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}
          description={`${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Empreendimento}: ${imovel.DormitoriosAntigo} quartos, ${imovel.SuiteAntigo} suítes, ${imovel.BanheiroSocialQtd} banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt} m2. ${imovel.Situacao}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}. ${imovel.TipoEndereco} ${imovel.Endereco}.`}
          address={`${imovel.TipoEndereco} ${imovel.Endereco}, ${imovel.Numero}, ${imovel.BairroComercial}, ${imovel.Cidade}`}
          url={currentUrl}
          image={imovel.Foto}
        />

        {/* Structured Data para datas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataDates),
          }}
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
            
            {/* ✅ CORREÇÃO APLICADA: Validação rigorosa do vídeo YouTube */}
            {temVideoYouTubeValido(imovel.Video) && (
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
