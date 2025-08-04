// app/imovel/[id]/[slug]/page.js
// ✅ VERSÃO V17 COMPLETA - TODOS OS PONTOS CONTEMPLADOS:
// 1. ✅ Valida formato YouTube (regex rigorosa)
// 2. ✅ Rejeita URLs inválidas (canais, playlists)  
// 3. ✅ Bloqueia vídeos deletados (lista expansível)
// 4. ✅ Permite vídeos válidos funcionarem
// 5. ✅ Meta tags otimizadas para redes sociais
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
    
    // ✅ DEBUG: Verificar se todos os pontos V17 estão funcionando
    console.log('🎯 [V17-DEBUG] ========== VERIFICAÇÃO COMPLETA ==========');
    console.log('🎯 [V17-DEBUG] 1. Validação YouTube rigorosa: ✅ ATIVA');
    console.log('🎯 [V17-DEBUG] 2. Rejeição URLs inválidas: ✅ ATIVA');  
    console.log('🎯 [V17-DEBUG] 3. Lista vídeos deletados: ✅ EXPANSÍVEL');
    console.log('🎯 [V17-DEBUG] 4. Vídeos válidos permitidos: ✅ SIM');
    console.log('🎯 [V17-DEBUG] 5. Meta tags otimizadas: ✅ COMPLETAS');
    console.log('🎯 [V17-DEBUG] URL da imagem:', getWhatsAppOptimizedImageUrl(imovel.Foto));
    console.log('🎯 [V17-DEBUG] ===============================================');

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
            
            {/* ✅ CORREÇÃO COMPLETA DO VÍDEO: Validação rigorosa + lista expansível */}
            {(() => {
              try {
                if (!imovel?.Video || typeof imovel.Video !== 'object' || Array.isArray(imovel.Video)) {
                  return null;
                }
                
                if (Object.keys(imovel.Video).length === 0) {
                  return null;
                }
                
                let videoValue = null;
                const values = Object.values(imovel.Video);
                
                if (values.length > 0) {
                  const firstValue = values[0];
                  if (firstValue && typeof firstValue === 'object') {
                    videoValue = (firstValue.Video || firstValue.url || firstValue.videoId || firstValue.id || '').trim();
                  }
                }
                
                if (!videoValue) {
                  return null;
                }
                
                // ✅ LISTA EXPANSÍVEL de vídeos deletados/problemáticos
                const blockedVideoIds = [
                  '4Aq7szgycT4', // Vídeo deletado identificado
                  // Adicionar outros IDs problemáticos conforme necessário
                ];
                
                // Extrair VideoId limpo se for URL completa
                let cleanVideoId = videoValue;
                const urlMatch = videoValue.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
                if (urlMatch) {
                  cleanVideoId = urlMatch[1];
                }
                
                // ✅ BLOQUEAR vídeos da lista
                if (blockedVideoIds.includes(cleanVideoId)) {
                  console.log('🎥 Bloqueando vídeo da lista:', cleanVideoId);
                  return null;
                }
                
                // ✅ VALIDAÇÃO RIGOROSA do formato YouTube
                const isValidYoutubeFormat = 
                  /^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId) ||
                  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                  /youtu\.be\/([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/.test(videoValue);
                
                if (!isValidYoutubeFormat) {
                  console.log('🎥 Formato inválido:', videoValue);
                  return null;
                }
                
                // ✅ REJEITAR URLs inválidas (canais, playlists, etc.)
                const invalidUrlPatterns = [
                  /youtube\.com\/@/,           // Canais (@usuario)
                  /youtube\.com\/channel/,     // Canais (/channel/...)
                  /youtube\.com\/user/,        // Usuários (/user/...)
                  /youtube\.com\/c\//,         // Canais (/c/...)
                  /youtube\.com\/playlist/,    // Playlists
                  /youtube\.com\/results/,     // Pesquisas
                  /youtube\.com\/feed\/trending/, // Trending
                  /^https?:\/\/(?:www\.)?youtube\.com\/?$/ // Homepage
                ];
                
                for (const pattern of invalidUrlPatterns) {
                  if (pattern.test(videoValue)) {
                    console.log('🎥 URL inválida detectada:', videoValue);
                    return null;
                  }
                }
                
                console.log('🎥 Vídeo válido aprovado:', cleanVideoId);
                return <VideoCondominio imovel={imovel} />;
                
              } catch (e) {
                console.error('🎥 Erro na validação:', e);
                return null;
              }
            })()}
            
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
        type: "website", // ✅ MUDADO: website funciona melhor no WhatsApp que article
        siteName: "NPI Consultoria",
        locale: "pt_BR",
        publishedTime: modifiedDate,
        modifiedTime: modifiedDate,
        images: [
          {
            url: imageUrl,
            secureUrl: imageUrl,
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
      other: {
        // ✅ Meta tags básicas
        'article:published_time': modifiedDate,
        'article:modified_time': modifiedDate,
        'article:author': 'NPI Consultoria',
        'article:section': 'Imobiliário',
        'article:tag': `${imovel.Categoria}, ${imovel.BairroComercial}, ${imovel.Cidade}, imóvel à venda`,
        
        // ✅ OpenGraph OTIMIZADAS para redes sociais
        'og:title': title,
        'og:description': description,
        'og:image': imageUrl,
        'og:url': currentUrl,
        'og:type': 'website',
        'og:site_name': 'NPI Consultoria',
        'og:locale': 'pt_BR',
        'og:updated_time': modifiedDate,
        'og:image:secure_url': imageUrl,
        'og:image:type': 'image/jpeg',
        'og:image:width': '1200',
        'og:image:height': '630',
        'og:image:alt': title,
        
        // ✅ Twitter Cards otimizadas
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': description,
        'twitter:image': imageUrl,
        'twitter:image:alt': title,
        'twitter:site': '@NPIImoveis',
        'twitter:creator': '@NPIImoveis',
        
        // ✅ WhatsApp específicas
        'whatsapp:title': title,
        'whatsapp:description': description,
        'whatsapp:image': imageUrl,
        
        // ✅ Telegram específicas
        'telegram:title': title,
        'telegram:description': description,
        'telegram:image': imageUrl,
        
        // ✅ LinkedIn específicas
        'linkedin:title': title,
        'linkedin:description': description,
        'linkedin:image': imageUrl,
        
        // ✅ Cache control para forçar atualizações em redes sociais
        'cache-control': 'no-cache, must-revalidate',
        'pragma': 'no-cache',
        'expires': '0',
        'last-modified': modifiedDate,
        'etag': `"social-${id}-${Date.now()}"`,
        
        // ✅ Meta tags de geolocalização (se disponível)
        'geo.region': 'BR-SP',
        'geo.placename': imovel.Cidade,
        'ICBM': `${imovel.Latitude || ''}, ${imovel.Longitude || ''}`,
        
        // ✅ Meta tags de conteúdo
        'author': 'NPI Consultoria',
        'publisher': 'NPI Consultoria',
        'copyright': 'NPI Consultoria',
        'language': 'pt-BR',
      },
