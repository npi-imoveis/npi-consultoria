// app/imovel/[id]/[slug]/page.js
// ✅ VERSÃO OTIMIZADA PARA LCP - Cirúrgica
// 🚀 FOCO: Largest Contentful Paint < 2.5s no mobile

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

function convertBrazilianDateToISO(brazilianDate, imovelData) {
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
    const currentDate = new Date();
    console.log(`[DATE-CONVERT] ⚠️  Usando data atual como fallback: ${currentDate.toISOString()}`);
    return currentDate.toISOString();
  }
  
  try {
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
    
    const date = new Date(workingDate);
    if (!isNaN(date.getTime())) {
      console.log(`[DATE-CONVERT] ✅ Parse direto: ${date.toISOString()}`);
      return date.toISOString();
    }
    
    const fallbackDate = new Date();
    console.log(`[DATE-CONVERT] ⚠️  Fallback para data atual: ${fallbackDate.toISOString()}`);
    return fallbackDate.toISOString();
    
  } catch (error) {
    console.error(`[DATE-CONVERT] ❌ Erro na conversão:`, error);
    const errorFallbackDate = new Date();
    return errorFallbackDate.toISOString();
  }
}

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

// ✅ FUNÇÃO CORRIGIDA: Bug do endereço no title RESOLVIDO
function createSmartTitle(imovel) {
  console.log('📝 [SMART-TITLE] ========== PROCESSANDO TÍTULO ==========');
  console.log('📝 [SMART-TITLE] Input imovel:', {
    Empreendimento: imovel.Empreendimento,
    TipoEndereco: imovel.TipoEndereco,
    Endereco: imovel.Endereco,
    Numero: imovel.Numero,
    BairroComercial: imovel.BairroComercial,
    Cidade: imovel.Cidade
  });
  
  const parts = [];
  
  // 1. Nome do empreendimento (sempre primeiro)
  if (imovel.Empreendimento) {
    parts.push(imovel.Empreendimento);
  }
  
  // 2. ✅ CORREÇÃO DO BUG: Endereço com espaçamento correto
  if (imovel.Endereco) {
    // 🔧 CORREÇÃO: Garantir espaços adequados entre as partes
    const enderecoParts = [];
    
    // Adiciona TipoEndereco (ex: "Rua")
    if (imovel.TipoEndereco && imovel.TipoEndereco.trim()) {
      enderecoParts.push(imovel.TipoEndereco.trim());
    }
    
    // Adiciona Endereco (ex: "Achilles Masetti")
    if (imovel.Endereco && imovel.Endereco.trim()) {
      enderecoParts.push(imovel.Endereco.trim());
    }
    
    // Adiciona Numero (ex: "105")
    if (imovel.Numero && imovel.Numero.trim()) {
      enderecoParts.push(imovel.Numero.trim());
    }
    
    // 🎯 CRÍTICO: Join com espaço único entre as partes
    const endereco = enderecoParts.join(' ');
    
    console.log('📝 [SMART-TITLE] Endereço construído:', endereco);
    
    if (endereco) {
      // Verificação rigorosa de duplicação com empreendimento
      const empreendimentoWords = (imovel.Empreendimento || '').toLowerCase()
        .replace(/[^\w\s]/g, ' ') // Remove pontuação
        .split(/\s+/)
        .filter(word => word.length > 2); // Palavras com 3+ caracteres
      
      const enderecoWords = endereco.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
      
      // Verifica se há sobreposição significativa entre as palavras
      const intersection = empreendimentoWords.filter(word => enderecoWords.includes(word));
      const overlapRatio = intersection.length / Math.max(enderecoWords.length, 1);
      
      console.log('📝 [SMART-TITLE] Análise duplicação:', {
        empreendimentoWords,
        enderecoWords,
        intersection,
        overlapRatio
      });
      
      // Se sobreposição < 80%, inclui o endereço
      if (overlapRatio < 0.8) {
        // ✅ LIMPEZA FINAL: Remove duplicatas consecutivas se existirem
        const enderecoLimpo = endereco
          .replace(/(\w+)\s+\1/gi, '$1') // Remove "Seridó Seridó" → "Seridó"
          .replace(/\s+/g, ' ') // Remove espaços múltiplos
          .trim();
        
        parts.push(enderecoLimpo);
        console.log('📝 [SMART-TITLE] Endereço incluído (limpo):', enderecoLimpo);
      } else {
        console.log('📝 [SMART-TITLE] Endereço omitido (duplicação detectada)');
      }
    }
  }
  
  // 3. Bairro - evita duplicação com partes já incluídas
  if (imovel.BairroComercial) {
    const bairroJaIncluido = parts.some(part => {
      const partWords = part.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
      const bairroWords = imovel.BairroComercial.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
      const intersect = partWords.filter(word => bairroWords.includes(word) && word.length > 2);
      return intersect.length / Math.max(bairroWords.length, 1) > 0.6;
    });
    
    if (!bairroJaIncluido) {
      parts.push(imovel.BairroComercial);
      console.log('📝 [SMART-TITLE] Bairro incluído:', imovel.BairroComercial);
    } else {
      console.log('📝 [SMART-TITLE] Bairro omitido (já incluído)');
    }
  }
  
  // 4. Cidade - evita duplicação
  if (imovel.Cidade) {
    const cidadeJaIncluida = parts.some(part => 
      part.toLowerCase().includes(imovel.Cidade.toLowerCase()) ||
      imovel.Cidade.toLowerCase().includes(part.toLowerCase())
    );
    
    if (!cidadeJaIncluida) {
      parts.push(imovel.Cidade);
      console.log('📝 [SMART-TITLE] Cidade incluída:', imovel.Cidade);
    } else {
      console.log('📝 [SMART-TITLE] Cidade omitida (já incluída)');
    }
  }
  
  // 5. LIMPEZA FINAL - Remove duplicatas globais
  const smartTitle = parts
    .filter(part => part && part.trim() !== '')
    .join(', ')
    .replace(/(\w+)(\s*,\s*)\1/gi, '$1') // Remove duplicatas separadas por vírgula "Seridó, Seridó" → "Seridó"
    .replace(/,\s*,+/g, ',') // Remove vírgulas duplas
    .replace(/^,+|,+$/g, '') // Remove vírgulas no início/fim
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
  
  console.log('📝 [SMART-TITLE] Resultado final:', smartTitle);
  console.log('📝 [SMART-TITLE] ========================================');
  
  return smartTitle;
}

// ✅ FUNÇÃO ADICIONAL: Limpa duplicatas em textos
function cleanDuplicateWords(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .replace(/(\w+)\s+\1/gi, '$1') // Remove palavras duplicadas consecutivas
    .replace(/\s+/g, ' ') // Remove espaços múltiplos
    .trim();
}

// 🚀 NOVA FUNÇÃO: Extrai URL da primeira imagem para preload
function getFirstImageUrl(imovelFotos) {
  console.log('🖼️ [PRELOAD-IMAGE] Extraindo primeira imagem para preload');
  
  if (!imovelFotos) return null;
  
  // Array de fotos
  if (Array.isArray(imovelFotos) && imovelFotos.length > 0) {
    const firstPhoto = imovelFotos[0];
    if (firstPhoto && typeof firstPhoto === 'object') {
      return firstPhoto.FotoGrande || firstPhoto.Foto || firstPhoto.FotoMedia || null;
    }
    if (typeof firstPhoto === 'string') {
      return firstPhoto;
    }
  }
  
  // Objeto único
  if (typeof imovelFotos === 'object' && !Array.isArray(imovelFotos)) {
    return imovelFotos.FotoGrande || imovelFotos.Foto || imovelFotos.FotoMedia || null;
  }
  
  // String direta
  if (typeof imovelFotos === 'string') {
    return imovelFotos;
  }
  
  return null;
}

export const revalidate = 0;

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
    
    let modifiedDate;
    try {
      modifiedDate = convertBrazilianDateToISO(imovel.DataHoraAtualizacao, imovel);
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
    
    // ✅ APLICA A FUNÇÃO CORRIGIDA (bug do endereço resolvido)
    const title = createSmartTitle(imovel);
    
    // ✅ DESCRIÇÃO TAMBÉM COM LIMPEZA
    const descricaoLimpa = cleanDuplicateWords(
      `${imovel.Empreendimento}, ${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo} dormitórios, ${imovel.SuiteAntigo} suítes, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt} m2. Preço: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`
    );
    
    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    const imageUrl = getWhatsAppOptimizedImageUrl(imovel.Foto);
    
    console.log('📱 [WHATSAPP-META] URL final da imagem para WhatsApp:', imageUrl);

    return {
      title,
      description: descricaoLimpa,
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
        description: descricaoLimpa,
        url: currentUrl,
        type: "website",
        siteName: "NPI Consultoria",
        locale: "pt_BR",
        images: [
          {
            url: imageUrl,
            secureUrl: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
            type: "image/jpeg",
          },
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
        description: descricaoLimpa,
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
        'og:title': title,
        'og:description': descricaoLimpa,
        'og:image': imageUrl,
        'og:url': currentUrl,
        'og:type': 'website',
        'og:site_name': 'NPI Consultoria',
        'og:locale': 'pt_BR',
        'article:published_time': modifiedDate,
        'article:modified_time': modifiedDate,
        'cache-control': 'no-cache, must-revalidate',
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
      console.log(`🏠 [IMOVEL-PAGE] ⚠️ Slug inconsistente (middleware deveria ter redirecionado): ${slug} vs ${slugCorreto}`);
    }

    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    const modifiedDate = convertBrazilianDateToISO(imovel.DataHoraAtualizacao, imovel);
    
    // 🚀 CRÍTICO PARA LCP: Extrair URL da primeira imagem
    const firstImageUrl = getFirstImageUrl(imovel.Foto);
    console.log('🖼️ [LCP-OPTIMIZATION] URL da primeira imagem:', firstImageUrl);
    
    console.log('🔍 Data convertida no componente:', modifiedDate);
    
    console.log('🎥 [DEBUG-FINAL] =======================================');
    console.log('🎥 [DEBUG-FINAL] Dados do vídeo:', imovel.Video);
    console.log('📱 [DEBUG-FINAL] URL da imagem WhatsApp:', getWhatsAppOptimizedImageUrl(imovel.Foto));
    console.log('📱 [DEBUG-FINAL] Dados da foto original:', imovel.Foto);
    console.log('📱 [DEBUG-FINAL] URL atual:', currentUrl);
    console.log('🎥 [DEBUG-FINAL] =======================================');

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
        {/* 🚀 PRELOAD CRÍTICO: Primeira imagem para LCP */}
        {firstImageUrl && (
          <link
            rel="preload"
            as="image"
            href={firstImageUrl}
            fetchPriority="high"
            className="hidden"
          />
        )}

        <StructuredDataApartment
          title={imovel.Empreendimento}
          price={imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}
          description={cleanDuplicateWords(`${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Empreendimento}: ${imovel.DormitoriosAntigo} quartos, ${imovel.SuiteAntigo} suítes, ${imovel.BanheiroSocialQtd} banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt} m2. ${imovel.Situacao}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}. ${imovel.TipoEndereco} ${imovel.Endereco}.`)}
          address={cleanDuplicateWords(`${imovel.TipoEndereco} ${imovel.Endereco}, ${imovel.Numero}, ${imovel.BairroComercial}, ${imovel.Cidade}`)}
          url={currentUrl}
          image={imovel.Foto}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataDates),
          }}
        />

        <ExitIntentModal condominio={imovel.Empreendimento} link={currentUrl} />

        {/* 🎯 GALERIA OTIMIZADA PARA LCP */}
        <div className="w-full mx-auto">
          <ImageGallery 
            imovel={imovel}
            priority={true}
            lcpOptimized={true}
          />
        </div>

        {/* 🚀 CONTAINER OTIMIZADO - Removido minHeight que causa CLS */}
        <div className="container mx-auto gap-4 mt-3 px-4 md:px-0 flex flex-col lg:flex-row">
          <div className="w-full lg:w-[65%]">
            <TituloImovel imovel={imovel} currentUrl={currentUrl} />
            <DetalhesImovel imovel={imovel} />
            <DescricaoImovel imovel={imovel} />
            <FichaTecnica imovel={imovel} />
            <DetalhesCondominio imovel={imovel} />
            <Lazer imovel={imovel} />
            
            {/* ✅ VALIDAÇÃO ROBUSTA DE VÍDEO (mantida) */}
            {(() => {
              try {
                if (!imovel?.Video || typeof imovel.Video !== 'object' || Array.isArray(imovel.Video)) {
                  console.log('🎥 [VALIDATION] ❌ Video inválido: não é objeto válido');
                  return null;
                }
                
                if (Object.keys(imovel.Video).length === 0) {
                  console.log('🎥 [VALIDATION] ❌ Video inválido: objeto vazio');
                  return null;
                }
                
                let videoValue = null;
                const values = Object.values(imovel.Video);
                
                if (values.length > 0) {
                  const firstValue = values[0];
                  if (firstValue && typeof firstValue === 'object') {
                    videoValue = (firstValue.Video || firstValue.url || firstValue.videoId || firstValue.id || '').trim();
                    console.log('🎥 [VALIDATION] VideoId extraído:', videoValue);
                  }
                }
                
                if (!videoValue) {
                  console.log('🎥 [VALIDATION] ❌ Video inválido: valor vazio');
                  return null;
                }
                
                const blockedVideoIds = ['4Aq7szgycT4'];
                
                let cleanVideoId = videoValue;
                const urlMatch = videoValue.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
                if (urlMatch) {
                  cleanVideoId = urlMatch[1];
                }
                
                if (blockedVideoIds.includes(cleanVideoId)) {
                  console.log('🎥 [VALIDATION] ❌ VideoId na lista de deletados:', cleanVideoId);
                  return null;
                }
                
                const isValidYoutubeFormat = 
                  /^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId) ||
                  /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                  /youtu\.be\/([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                  /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/.test(videoValue);
                
                if (!isValidYoutubeFormat) {
                  console.log('🎥 [VALIDATION] ❌ Formato inválido:', videoValue);
                  return null;
                }
                
                const invalidUrlPatterns = [
                  /youtube\.com\/@/,
                  /youtube\.com\/channel/,
                  /youtube\.com\/user/,
                  /youtube\.com\/c\//,
                  /youtube\.com\/playlist/,
                  /youtube\.com\/results/,
                  /youtube\.com\/feed\/trending/,
                  /^https?:\/\/(?:www\.)?youtube\.com\/?$/
                ];
                
                for (const pattern of invalidUrlPatterns) {
                  if (pattern.test(videoValue)) {
                    console.log('🎥 [VALIDATION] ❌ URL inválida detectada:', videoValue);
                    return null;
                  }
                }
                
                console.log('🎥 [VALIDATION] ✅ Vídeo válido aprovado:', cleanVideoId);
                return <VideoCondominio imovel={imovel} />;
                
              } catch (e) {
                console.error('🎥 [VALIDATION] ❌ Erro na validação:', e);
                return null;
              }
            })()}
            
            {imovel.Tour360 && <TourVirtual link={imovel.Tour360} titulo={imovel.Empreendimento} />}
            <SimilarProperties id={imovel.Codigo} />
            <LocalizacaoCondominio imovel={imovel} />
          </div>

          {/* ✅ SIDEBAR OTIMIZADA - Sticky otimizado */}
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
