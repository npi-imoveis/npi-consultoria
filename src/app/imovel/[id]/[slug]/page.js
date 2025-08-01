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

// ✅ FUNÇÃO ULTRA-RIGOROSA: Validação do vídeo YouTube
function temVideoYouTubeValido(videoObj) {
  console.log('🎥 [ULTRA-DEBUG] ========== INICIANDO VALIDAÇÃO ==========');
  console.log('🎥 [ULTRA-DEBUG] Input completo:', JSON.stringify(videoObj, null, 2));
  
  try {
    // VERIFICAÇÃO 1: Objeto existe e é válido
    if (!videoObj) {
      console.log('🎥 [ULTRA-DEBUG] ❌ FALHA: videoObj é falsy');
      return false;
    }
    
    if (typeof videoObj !== 'object') {
      console.log('🎥 [ULTRA-DEBUG] ❌ FALHA: videoObj não é object, é:', typeof videoObj);
      return false;
    }
    
    if (Array.isArray(videoObj)) {
      console.log('🎥 [ULTRA-DEBUG] ❌ FALHA: videoObj é array');
      return false;
    }
    
    // VERIFICAÇÃO 2: Objeto tem conteúdo
    const keys = Object.keys(videoObj);
    console.log('🎥 [ULTRA-DEBUG] Keys do objeto:', keys);
    
    if (keys.length === 0) {
      console.log('🎥 [ULTRA-DEBUG] ❌ FALHA: objeto vazio');
      return false;
    }
    
    // VERIFICAÇÃO 3: Extrair valor de vídeo (MAIS RIGOROSA)
    let videoValue = null;
    const values = Object.values(videoObj);
    console.log('🎥 [ULTRA-DEBUG] Values do objeto:', values);
    
    // Método 1: Primeiro valor
    if (values.length > 0) {
      const firstValue = values[0];
      console.log('🎥 [ULTRA-DEBUG] Primeiro valor:', firstValue, 'tipo:', typeof firstValue);
      
      if (firstValue && typeof firstValue === 'object') {
        videoValue = firstValue.Video || firstValue.url || firstValue.videoId || firstValue.id;
        console.log('🎥 [ULTRA-DEBUG] Valor extraído de objeto interno:', videoValue);
      } else if (firstValue && typeof firstValue === 'string') {
        videoValue = firstValue;
        console.log('🎥 [ULTRA-DEBUG] Valor extraído como string direta:', videoValue);
      }
    }
    
    // Método 2: Propriedades diretas
    if (!videoValue) {
      videoValue = videoObj.Video || videoObj.url || videoObj.videoId || videoObj.id;
      console.log('🎥 [ULTRA-DEBUG] Valor extraído de propriedades diretas:', videoValue);
    }
    
    // VERIFICAÇÃO 4: Valor é string válida
    if (!videoValue) {
      console.log('🎥 [ULTRA-DEBUG] ❌ FALHA: nenhum videoValue encontrado');
      return false;
    }
    
    if (typeof videoValue !== 'string') {
      console.log('🎥 [ULTRA-DEBUG] ❌ FALHA: videoValue não é string, é:', typeof videoValue);
      return false;
    }
    
    const trimmed = videoValue.trim();
    console.log('🎥 [ULTRA-DEBUG] Valor final trimmed:', `"${trimmed}"`);
    
    if (trimmed === '') {
      console.log('🎥 [ULTRA-DEBUG] ❌ FALHA: string vazia após trim');
      return false;
    }
    
    // VERIFICAÇÃO 5: VALIDAÇÃO YOUTUBE ULTRA-RIGOROSA
    console.log('🎥 [ULTRA-DEBUG] Iniciando validação de padrões YouTube...');
    
    // Padrão 1: VideoId direto (MAIS RIGOROSO)
    const directIdPattern = /^[a-zA-Z0-9_-]{11}$/;
    if (directIdPattern.test(trimmed)) {
      console.log('🎥 [ULTRA-DEBUG] ✅ MATCH: VideoId direto válido');
      return true;
    }
    
    // Padrão 2: URL padrão do YouTube
    const standardUrlPattern = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const standardMatch = trimmed.match(standardUrlPattern);
    if (standardMatch) {
      console.log('🎥 [ULTRA-DEBUG] ✅ MATCH: URL padrão YouTube, videoId:', standardMatch[1]);
      return true;
    }
    
    // Padrão 3: URL embed
    const embedUrlPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/;
    const embedMatch = trimmed.match(embedUrlPattern);
    if (embedMatch) {
      console.log('🎥 [ULTRA-DEBUG] ✅ MATCH: URL embed YouTube, videoId:', embedMatch[1]);
      return true;
    }
    
    // Padrão 4: URL shorts
    const shortsUrlPattern = /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/;
    const shortsMatch = trimmed.match(shortsUrlPattern);
    if (shortsMatch) {
      console.log('🎥 [ULTRA-DEBUG] ✅ MATCH: URL shorts YouTube, videoId:', shortsMatch[1]);
      return true;
    }
    
    // ❌ VALIDAÇÕES ADICIONAIS: Rejeitar explicitamente URLs inválidas
    const invalidPatterns = [
      { name: 'Canal @', pattern: /youtube\.com\/@/ },
      { name: 'Canal channel/', pattern: /youtube\.com\/channel/ },
      { name: 'Usuário user/', pattern: /youtube\.com\/user/ },
      { name: 'Canal c/', pattern: /youtube\.com\/c\// },
      { name: 'Playlist', pattern: /youtube\.com\/playlist/ },
      { name: 'Homepage', pattern: /^https?:\/\/(?:www\.)?youtube\.com\/?$/ },
      { name: 'Search', pattern: /youtube\.com\/results/ },
      { name: 'Trending', pattern: /youtube\.com\/feed\/trending/ }
    ];
    
    for (const invalid of invalidPatterns) {
      if (invalid.pattern.test(trimmed)) {
        console.log(`🎥 [ULTRA-DEBUG] ❌ REJEIÇÃO: ${invalid.name} detectado`);
        return false;
      }
    }
    
    // ❌ Se chegou até aqui, não é um vídeo YouTube válido
    console.log('🎥 [ULTRA-DEBUG] ❌ FALHA FINAL: Nenhum padrão YouTube válido encontrado');
    console.log('🎥 [ULTRA-DEBUG] Valor rejeitado:', `"${trimmed}"`);
    return false;
    
  } catch (error) {
    console.error('🎥 [ULTRA-DEBUG] ❌ ERRO na validação:', error);
    return false;
  }
}

// ✅ FUNÇÃO ULTRA-OTIMIZADA: Imagem para WhatsApp
function getWhatsAppOptimizedImageUrl(imovelFotos) {
  console.log('📱 [WHATSAPP-ULTRA] ========== PROCESSANDO IMAGEM ==========');
  console.log('📱 [WHATSAPP-ULTRA] Input:', JSON.stringify(imovelFotos, null, 2));
  
  try {
    let finalImageUrl = null;
    
    // MÉTODO 1: Array de fotos
    if (Array.isArray(imovelFotos) && imovelFotos.length > 0) {
      console.log('📱 [WHATSAPP-ULTRA] Processando array com', imovelFotos.length, 'itens');
      
      for (let i = 0; i < Math.min(imovelFotos.length, 3); i++) {
        const foto = imovelFotos[i];
        console.log(`📱 [WHATSAPP-ULTRA] Foto ${i}:`, foto);
        
        if (foto && typeof foto === 'object') {
          // Prioridade para fotos de melhor qualidade
          const possibleUrls = [
            foto.FotoGrande,
            foto.Foto, 
            foto.FotoMedia,
            foto.FotoPequena,
            foto.url,
            foto.src,
            foto.image,
            foto.href
          ];
          
          for (const url of possibleUrls) {
            if (url && typeof url === 'string' && url.trim() !== '') {
              finalImageUrl = url.trim();
              console.log(`📱 [WHATSAPP-ULTRA] ✅ URL encontrada em objeto[${i}]:`, finalImageUrl);
              break;
            }
          }
        } else if (foto && typeof foto === 'string' && foto.trim() !== '') {
          finalImageUrl = foto.trim();
          console.log(`📱 [WHATSAPP-ULTRA] ✅ URL string direta[${i}]:`, finalImageUrl);
          break;
        }
        
        if (finalImageUrl) break;
      }
    }
    
    // MÉTODO 2: String direta
    if (!finalImageUrl && typeof imovelFotos === 'string' && imovelFotos.trim() !== '') {
      finalImageUrl = imovelFotos.trim();
      console.log('📱 [WHATSAPP-ULTRA] ✅ URL string direta:', finalImageUrl);
    }
    
    // MÉTODO 3: Objeto único
    if (!finalImageUrl && imovelFotos && typeof imovelFotos === 'object' && !Array.isArray(imovelFotos)) {
      console.log('📱 [WHATSAPP-ULTRA] Processando objeto único');
      
      const possibleUrls = [
        imovelFotos.FotoGrande,
        imovelFotos.Foto,
        imovelFotos.FotoMedia, 
        imovelFotos.FotoPequena,
        imovelFotos.url,
        imovelFotos.src,
        imovelFotos.image
      ];
      
      for (const url of possibleUrls) {
        if (url && typeof url === 'string' && url.trim() !== '') {
          finalImageUrl = url.trim();
          console.log('📱 [WHATSAPP-ULTRA] ✅ URL encontrada em objeto único:', finalImageUrl);
          break;
        }
      }
    }
    
    // VALIDAÇÃO FINAL DA URL
    if (finalImageUrl) {
      // Garantir HTTPS (importante para WhatsApp)
      if (finalImageUrl.startsWith('http://')) {
        finalImageUrl = finalImageUrl.replace('http://', 'https://');
        console.log('📱 [WHATSAPP-ULTRA] ✅ Convertido para HTTPS:', finalImageUrl);
      }
      
      // Se URL relativa, converter para absoluta
      if (finalImageUrl.startsWith('/')) {
        finalImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}${finalImageUrl}`;
        console.log('📱 [WHATSAPP-ULTRA] ✅ Convertido para URL absoluta:', finalImageUrl);
      }
      
      return finalImageUrl;
    }
    
    // FALLBACK FINAL
    const fallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}/og-image.png`;
    console.log('📱 [WHATSAPP-ULTRA] ⚠️ Usando fallback final:', fallbackUrl);
    return fallbackUrl;
    
  } catch (error) {
    console.error('📱 [WHATSAPP-ULTRA] ❌ Erro geral:', error);
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}/og-image.png`;
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
    
    // ✅ IMAGEM ULTRA-OTIMIZADA para WhatsApp
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
        type: "article", // ✅ MELHOR para WhatsApp que "website"
        siteName: "NPI Consultoria",
        locale: "pt_BR", // ✅ IMPORTANTE para WhatsApp brasileiro
        publishedTime: modifiedDate,
        modifiedTime: modifiedDate,
        updatedTime: modifiedDate, // ✅ ADICIONAL
        images: [
          {
            url: imageUrl,
            secureUrl: imageUrl, // ✅ HTTPS para WhatsApp
            width: 1200,
            height: 630,
            alt: title,
            type: "image/jpeg",
          },
          // ✅ Imagem de fallback
          {
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
            secureUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`,
            width: 1200,
            height: 630,
            alt: "NPI Consultoria - Imóveis",
            type: "image/png",
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
      // ✅ META TAGS ULTRA-OTIMIZADAS para WhatsApp
      other: {
        // Básicas
        'article:published_time': modifiedDate,
        'article:modified_time': modifiedDate,
        'article:author': 'NPI Consultoria',
        'article:section': 'Imobiliário',
        'article:tag': `${imovel.Categoria}, ${imovel.BairroComercial}, ${imovel.Cidade}, imóvel à venda`,
        
        // OpenGraph extras para WhatsApp
        'og:updated_time': modifiedDate,
        'og:image:secure_url': imageUrl,
        'og:image:type': 'image/jpeg',
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
        'og:locale': 'pt_BR',
        'og:locale:alternate': 'pt_BR',
        
        // WhatsApp específicas
        'whatsapp:title': title,
        'whatsapp:description': description,
        'whatsapp:image': imageUrl,
        
        // Telegram também
        'telegram:title': title,
        'telegram:description': description, 
        'telegram:image': imageUrl,
        
        // Cache e datas
        'last-modified': modifiedDate,
        'date': modifiedDate,
        'DC.date.modified': modifiedDate,
        'DC.date.created': modifiedDate,
        
        // Cache busting para forçar atualização
        'cache-control': 'public, max-age=3600',
        'etag': `"${id}-${Date.now()}"`,
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

    // ✅ DEBUG ULTRA-COMPLETO
    const videoValido = temVideoYouTubeValido(imovel.Video);
    const imagemWhatsApp = getWhatsAppOptimizedImageUrl(imovel.Foto);
    
    console.log('🎥 [DEBUG-FINAL] =======================================');
    console.log('🎥 [DEBUG-FINAL] Dados do vídeo:', imovel.Video);
    console.log('🎥 [DEBUG-FINAL] Vídeo é válido?', videoValido);
    console.log('🎥 [DEBUG-FINAL] Vai renderizar VideoCondominio?', videoValido);
    console.log('📱 [DEBUG-FINAL] URL da imagem WhatsApp:', imagemWhatsApp);
    console.log('🎥 [DEBUG-FINAL] =======================================');

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
            
            {/* ✅ CORREÇÃO ULTRA-RIGOROSA: Validação YouTube extremamente rígida */}
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
