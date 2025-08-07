// app/imovel/[id]/[slug]/page.js
// 🎯 VERSÃO ULTRA-OTIMIZADA PARA PAGESPEED 95+ - LCP < 2.5s

import { Suspense, lazy } from 'react';
import { ImageGallery } from "@/app/components/sections/image-gallery";
import { getImovelById } from "@/app/services";
import { WhatsappFloat } from "@/app/components/ui/whatsapp";
import { Apartment as StructuredDataApartment } from "@/app/components/structured-data";
import ExitIntentModal from "@/app/components/ui/exit-intent-modal";
import { notFound, redirect } from "next/navigation";
import Script from "next/script";

// 🔥 LAZY LOADING AGRESSIVO - Todos componentes below-the-fold
const FAQImovel = lazy(() => import("./componentes/FAQImovel").then(mod => ({ default: mod.FAQImovel })));
const DetalhesCondominio = lazy(() => import("./componentes/DetalhesCondominio"));
const LocalizacaoCondominio = lazy(() => import("./componentes/LocalizacaoCondominio"));
const FichaTecnica = lazy(() => import("./componentes/FichaTecnica"));
const Lazer = lazy(() => import("./componentes/Lazer"));
const TituloImovel = lazy(() => import("./componentes/TituloImovel"));
const DetalhesImovel = lazy(() => import("./componentes/DetalhesImovel"));
const DescricaoImovel = lazy(() => import("./componentes/DescricaoImovel"));
const VideoCondominio = lazy(() => import("./componentes/VideoCondominio"));
const TourVirtual = lazy(() => import("./componentes/TourVirtual"));
const SimilarProperties = lazy(() => import("./componentes/similar-properties").then(mod => ({ default: mod.SimilarProperties })));

// 🚀 COMPONENTE DE CONTATO CRÍTICO - Não lazy (sidebar)
import Contato from "./componentes/Contato";

// 🔥 SKELETON COMPONENTS ULTRA-LEVES
const TitleSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded-md w-3/4 mb-4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
  </div>
);

const DetailsSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
    <div className="grid grid-cols-2 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-4 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

const GenericSkeleton = ({ className = "h-32" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`}></div>
);

// 🔥 FUNÇÃO PARA GERAR PRELOAD LINKS
function generateResourceHints(imovel) {
  const hints = [];
  
  // DNS prefetch para domínios de imagens
  const imageDomains = [
    'npi-imoveis.s3.sa-east-1.amazonaws.com',
    'cdn.vistahost.com.br',
    'd1988evaubdc7a.cloudfront.net',
    'images.usenonstop.com.br'
  ];
  
  imageDomains.forEach(domain => {
    hints.push(
      <link key={`dns-${domain}`} rel="dns-prefetch" href={`https://${domain}`} />
    );
  });
  
  // Preconnect para primeira imagem
  if (imovel?.Foto?.[0]?.Foto) {
    const imageUrl = new URL(imovel.Foto[0].Foto);
    hints.push(
      <link key="preconnect-img" rel="preconnect" href={`${imageUrl.protocol}//${imageUrl.hostname}`} />
    );
  }
  
  return hints;
}

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

function getLCPOptimizedImageUrl(imovelFotos) {
  console.log('🚀 [LCP-ULTRA] ========== PROCESSANDO IMAGEM LCP ==========');
  
  try {
    let imageUrl = null;
    
    if (Array.isArray(imovelFotos) && imovelFotos.length > 0) {
      const foto = imovelFotos[0];
      
      if (foto && typeof foto === 'object') {
        const possibleUrls = [
          foto.FotoGrande,
          foto.Foto, 
          foto.FotoMedia,
        ];
        
        for (const url of possibleUrls) {
          if (url && typeof url === 'string' && url.trim() !== '') {
            imageUrl = url.trim();
            break;
          }
        }
      } else if (foto && typeof foto === 'string' && foto.trim() !== '') {
        imageUrl = foto.trim();
      }
    }
    
    if (!imageUrl && typeof imovelFotos === 'string' && imovelFotos.trim() !== '') {
      imageUrl = imovelFotos.trim();
    }
    
    if (!imageUrl && imovelFotos && typeof imovelFotos === 'object' && !Array.isArray(imovelFotos)) {
      const possibleUrls = [
        imovelFotos.FotoGrande,
        imovelFotos.Foto,
        imovelFotos.FotoMedia, 
      ];
      
      for (const url of possibleUrls) {
        if (url && typeof url === 'string' && url.trim() !== '') {
          imageUrl = url.trim();
          break;
        }
      }
    }
    
    if (imageUrl) {
      if (imageUrl.startsWith('http://')) {
        imageUrl = imageUrl.replace('http://', 'https://');
      }
      
      if (imageUrl.startsWith('/')) {
        imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}${imageUrl}`;
      }
      
      console.log('🚀 [LCP-ULTRA] ✅ URL otimizada para LCP:', imageUrl);
      return imageUrl;
    }
    
    const fallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}/og-image.png`;
    console.log('🚀 [LCP-ULTRA] ⚠️ Usando fallback:', fallbackUrl);
    return fallbackUrl;
    
  } catch (error) {
    console.error('🚀 [LCP-ULTRA] ❌ Erro:', error);
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}/og-image.png`;
  }
}

function getWhatsAppOptimizedImageUrl(imovelFotos) {
  console.log('📱 [WHATSAPP-ULTRA] ========== PROCESSANDO IMAGEM ==========');
  
  try {
    let finalImageUrl = null;
    
    if (Array.isArray(imovelFotos) && imovelFotos.length > 0) {
      for (let i = 0; i < Math.min(imovelFotos.length, 3); i++) {
        const foto = imovelFotos[i];
        
        if (foto && typeof foto === 'object') {
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
    
    if (!finalImageUrl && typeof imovelFotos === 'string' && imovelFotos.trim() !== '') {
      finalImageUrl = imovelFotos.trim();
    }
    
    if (!finalImageUrl && imovelFotos && typeof imovelFotos === 'object' && !Array.isArray(imovelFotos)) {
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
          break;
        }
      }
    }
    
    if (finalImageUrl) {
      if (finalImageUrl.startsWith('http://')) {
        finalImageUrl = finalImageUrl.replace('http://', 'https://');
      }
      
      if (finalImageUrl.startsWith('/')) {
        finalImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}${finalImageUrl}`;
      }
      
      return finalImageUrl;
    }
    
    const fallbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}/og-image.png`;
    return fallbackUrl;
    
  } catch (error) {
    console.error('📱 [WHATSAPP-ULTRA] ❌ Erro geral:', error);
    return `${process.env.NEXT_PUBLIC_SITE_URL || 'https://npiconsultoria.com.br'}/og-image.png`;
  }
}

function createSmartTitle(imovel) {
  const parts = [];
  
  if (imovel.Empreendimento) {
    parts.push(imovel.Empreendimento);
  }
  
  if (imovel.Endereco) {
    const enderecoParts = [];
    
    if (imovel.TipoEndereco && imovel.TipoEndereco.trim() !== '') {
      enderecoParts.push(imovel.TipoEndereco.trim());
    }
    
    if (imovel.Endereco && imovel.Endereco.trim() !== '') {
      enderecoParts.push(imovel.Endereco.trim());
    }
    
    if (imovel.Numero && imovel.Numero.trim() !== '') {
      enderecoParts.push(imovel.Numero.trim());
    }
    
    let endereco = enderecoParts.join(' ').trim();
    endereco = endereco
      .replace(/([a-zA-Z])([A-Z][a-z])/g, '$1 $2')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (endereco) {
      const empreendimento = (imovel.Empreendimento || '').toLowerCase();
      const enderecoLower = endereco.toLowerCase();
      
      if (!empreendimento.includes(enderecoLower.slice(0, 10)) && 
          !enderecoLower.includes(empreendimento.slice(0, 10))) {
        parts.push(endereco);
      }
    }
  }
  
  if (imovel.BairroComercial) {
    const bairroJaIncluido = parts.some(part => 
      part.toLowerCase().includes(imovel.BairroComercial.toLowerCase()) ||
      imovel.BairroComercial.toLowerCase().includes(part.toLowerCase())
    );
    
    if (!bairroJaIncluido) {
      parts.push(imovel.BairroComercial);
    }
  }
  
  if (imovel.Cidade) {
    const cidadeJaIncluida = parts.some(part => 
      part.toLowerCase().includes(imovel.Cidade.toLowerCase()) ||
      imovel.Cidade.toLowerCase().includes(part.toLowerCase())
    );
    
    if (!cidadeJaIncluida) {
      parts.push(imovel.Cidade);
    }
  }
  
  return parts
    .filter(part => part && part.trim() !== '')
    .join(', ')
    .replace(/,\s*,+/g, ',')
    .replace(/^,+|,+$/g, '')
    .trim();
}

function cleanDuplicateWords(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text
    .replace(/(\w+)\s+\1/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export const revalidate = 0;

export async function generateMetadata({ params }) {
  const { id } = params;
  
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
        modifiedDate = new Date().toISOString();
      }
    } catch (error) {
      modifiedDate = new Date().toISOString();
    }
    
    const title = createSmartTitle(imovel);
    
    const descricaoLimpa = cleanDuplicateWords(
      `${imovel.Empreendimento}, ${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo} dormitórios, ${imovel.SuiteAntigo} suítes, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt} m2. Preço: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`
    );
    
    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    const imageUrl = getWhatsAppOptimizedImageUrl(imovel.Foto);

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
        'cache-control': 'public, max-age=3600, must-revalidate',
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
  
  try {
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
      console.log(`🏠 [IMOVEL-PAGE] ⚠️ Slug inconsistente: ${slug} vs ${slugCorreto}`);
    }

    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    const modifiedDate = convertBrazilianDateToISO(imovel.DataHoraAtualizacao, imovel);
    const lcpImageUrl = getLCPOptimizedImageUrl(imovel.Foto);
    
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
      <>
        {/* 🔥 RESOURCE HINTS NO HEAD */}
        {generateResourceHints(imovel)}
        
        {/* 🚀 PRELOAD CRÍTICO DA IMAGEM LCP */}
        <link 
          rel="preload" 
          href={lcpImageUrl} 
          as="image" 
          fetchpriority="high"
        />
        
        {/* 🔥 STRUCTURED DATA */}
        <StructuredDataApartment
          title={imovel.Empreendimento}
          price={imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}
          description={cleanDuplicateWords(`${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Empreendimento}: ${imovel.DormitoriosAntigo} quartos, ${imovel.SuiteAntigo} suítes, ${imovel.BanheiroSocialQtd} banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt} m2.`)}
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

        <section className="w-full bg-white pb-32 pt-20">
          <ExitIntentModal condominio={imovel.Empreendimento} link={currentUrl} />

          {/* 🔥 IMAGEM LCP - ELEMENTO CRÍTICO (ABOVE THE FOLD) */}
          <div className="w-full mx-auto">
            <ImageGallery imovel={imovel} />
          </div>

          <div className="container mx-auto gap-4 mt-3 px-4 md:px-0 flex flex-col lg:flex-row">
            <div className="w-full lg:w-[65%]">
              
              {/* 🚀 TÍTULO E DETALHES - CRÍTICOS (ABOVE THE FOLD) */}
              <Suspense fallback={<TitleSkeleton />}>
                <TituloImovel imovel={imovel} currentUrl={currentUrl} />
              </Suspense>
              
              <Suspense fallback={<DetailsSkeleton />}>
                <DetalhesImovel imovel={imovel} />
              </Suspense>
              
              {/* 🔥 LAZY LOADING AGRESSIVO - BELOW THE FOLD */}
              <Suspense fallback={<GenericSkeleton className="h-24" />}>
                <DescricaoImovel imovel={imovel} />
              </Suspense>
              
              <Suspense fallback={<GenericSkeleton className="h-48" />}>
                <FichaTecnica imovel={imovel} />
              </Suspense>
              
              <Suspense fallback={<GenericSkeleton className="h-32" />}>
                <DetalhesCondominio imovel={imovel} />
              </Suspense>
              
              <Suspense fallback={<GenericSkeleton className="h-40" />}>
                <Lazer imovel={imovel} />
              </Suspense>
              
              {/* ✅ VALIDAÇÃO ROBUSTA DE VÍDEO (lazy loaded) */}
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
                  
                  const blockedVideoIds = ['4Aq7szgycT4'];
                  
                  let cleanVideoId = videoValue;
                  const urlMatch = videoValue.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
                  if (urlMatch) {
                    cleanVideoId = urlMatch[1];
                  }
                  
                  if (blockedVideoIds.includes(cleanVideoId)) {
                    return null;
                  }
                  
                  const isValidYoutubeFormat = 
                    /^[a-zA-Z0-9_-]{11}$/.test(cleanVideoId) ||
                    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                    /youtu\.be\/([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/.test(videoValue) ||
                    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/.test(videoValue);
                  
                  if (!isValidYoutubeFormat) {
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
                      return null;
                    }
                  }
                  
                  return (
                    <Suspense fallback={<GenericSkeleton className="h-64" />}>
                      <VideoCondominio imovel={imovel} />
                    </Suspense>
                  );
                  
                } catch (e) {
                  console.error('🎥 [VALIDATION] ❌ Erro na validação:', e);
                  return null;
                }
              })()}
              
              {imovel.Tour360 && (
                <Suspense fallback={<GenericSkeleton className="h-48" />}>
                  <TourVirtual link={imovel.Tour360} titulo={imovel.Empreendimento} />
                </Suspense>
              )}
              
              <Suspense fallback={<GenericSkeleton className="h-96" />}>
                <SimilarProperties id={imovel.Codigo} />
              </Suspense>
              
              <Suspense fallback={<GenericSkeleton className="h-80" />}>
                <LocalizacaoCondominio imovel={imovel} />
              </Suspense>
            </div>

            {/* 🚀 SIDEBAR - NÃO LAZY (importante para conversão) */}
            <div className="w-full lg:w-[35%] h-fit lg:sticky lg:top-24 order-first lg:order-last mb-6 lg:mb-0">
              <Contato imovel={imovel} currentUrl={currentUrl} />
            </div>
          </div>

          {/* 🔥 FAQ - LAZY LOADING */}
          <div className="container mx-auto px-4 md:px-0">
            <Suspense fallback={<GenericSkeleton className="h-64" />}>
              <FAQImovel imovel={imovel} />
            </Suspense>
          </div>

          {/* 🚀 WHATSAPP FLOAT - Não lazy (importante para conversão) */}
          <WhatsappFloat
            message={`Quero saber mais sobre o ${imovel.Empreendimento}, no bairro ${imovel.BairroComercial}, disponível na página do Imóvel: ${currentUrl}`}
          />
        </section>

        {/* 🔥 SCRIPTS OTIMIZADOS - afterInteractive */}
        <Script
          id="performance-observer"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift' && !entry.hadRecentInput) {
                      console.log('CLS:', entry.value);
                    }
                  }
                });
                
                try {
                  observer.observe({entryTypes: ['largest-contentful-paint', 'layout-shift']});
                } catch (e) {
                  console.log('Performance Observer not supported');
                }
              }
            `
          }}
        />
      </>
    );
  } catch (error) {
    console.error('Erro na página do imóvel:', error);
    notFound();
  }
}
