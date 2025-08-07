// src/app/(site)/[slug]/page.js - VERSÃO OTIMIZADA PARA 90+ PAGESPEED

import { Button } from "@/app/components/ui/button";
import { getCondominioPorSlug } from "@/app/services";
import { formatterValue } from "@/app/utils/formatter-value";
import { Apartment as StructuredDataApartment } from "@/app/components/structured-data";
import { Share } from "@/app/components/ui/share";
import { PropertyTableOwner } from "./componentes/property-table-owner";
import { WhatsappFloat } from "@/app/components/ui/whatsapp";
import { PropertyTable } from "./componentes/property-table";
import { notFound, redirect } from "next/navigation";
import ExitIntentModal from "@/app/components/ui/exit-intent-modal";
import ScrollToImoveisButton from "./componentes/scroll-to-imovel-button";
import { photoSorter } from "@/app/utils/photoSorter"; 
import { ImageGallery } from "@/app/components/sections/image-gallery";
import { optimizeImageGalleryProps, processPhotosForPerformance, PERFORMANCE_CONFIGS } from "@/app/utils/image-gallery-props";
import PreloadResources from "@/app/components/performance/preload-resources";

// 🚀 LAZY LOADING DOS COMPONENTES PESADOS (reduz TBT e Speed Index)
import { lazy, Suspense } from 'react';

const ImoveisRelacionados = lazy(() => import("./componentes/related-properties").then(module => ({ default: module.ImoveisRelacionados })));
const SobreCondominio = lazy(() => import("./componentes/SobreCondominio"));
const FichaTecnica = lazy(() => import("./componentes/FichaTecnica"));
const DiferenciaisCondominio = lazy(() => import("./componentes/DiferenciaisCondominio"));
const DetalhesCondominio = lazy(() => import("./componentes/DetalhesCondominio"));
const Lazer = lazy(() => import("./componentes/Lazer"));
const VideoCondominio = lazy(() => import("./componentes/VideoCondominio"));
const TourVirtual = lazy(() => import("./componentes/TourVirtual"));
const ExploreRegiao = lazy(() => import("./componentes/ExploreRegiao"));

// 🎯 Loading Skeleton otimizado
const LoadingSkeleton = ({ height = "h-64", className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${height} ${className}`}>
    <div className="h-full w-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"></div>
  </div>
);

function ensureCondominio(text) {
  return /condom[ií]nio/i.test(text) ? text : `Condomínio ${text}`;
}

// 🎯 FUNÇÃO PARA ORDENAR FOTOS DO CONDOMÍNIO (igual ao admin que funcionou)
function processarFotosCondominio(fotos, codigoCondominio) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    console.log('📸 CONDOMÍNIO: Nenhuma foto para processar');
    return [];
  }

  try {
    console.log('📝 CONDOMÍNIO: Iniciando ordenação com photoSorter...', {
      totalFotos: fotos.length,
      codigo: codigoCondominio
    });
    
    // 🎯 FORÇAR photoSorter a usar SEMPRE Análise Inteligente (igual ao admin)
    const fotosTemp = fotos.map(foto => {
      // Remover campos ORDEM para forçar análise inteligente
      const { Ordem, ordem, ORDEM, ...fotoSemOrdem } = foto;
      return fotoSemOrdem;
    });
    
    // EXATAMENTE IGUAL AO ADMIN QUE FUNCIONOU - usar photoSorter.ordenarFotos() 
    const fotosOrdenadas = photoSorter.ordenarFotos(fotosTemp, codigoCondominio || 'condominio');
    
    console.log('✅ CONDOMÍNIO: Ordenação finalizada usando photoSorter:', {
      totalFotos: fotosOrdenadas.length,
      primeira: fotosOrdenadas[0]?.Foto?.split('/').pop()?.substring(0, 30) + '...',
      metodo: 'photoSorter.ordenarFotos() - IGUAL AO ADMIN'
    });

    return fotosOrdenadas;

  } catch (error) {
    console.error('❌ CONDOMÍNIO: Erro ao usar photoSorter:', error);
    
    // Fallback seguro - retornar fotos originais
    return fotos;
  }
}

// 🎯 FUNÇÃO PARA LIMPAR DECIMAIS DESNECESSÁRIOS DA METRAGEM
function limparMetragem(valor) {
  if (!valor) return valor;
  
  if (typeof valor === 'string') {
    const numero = parseFloat(valor.replace(/[^\d,.-]/g, '').replace(',', '.'));
    
    if (isNaN(numero)) return valor;
    
    if (numero === Math.floor(numero)) {
      return numero.toString();
    }
    
    return numero.toFixed(1).replace('.0', '');
  }
  
  if (typeof valor === 'number') {
    if (valor === Math.floor(valor)) {
      return valor.toString();
    }
    
    return valor.toFixed(1).replace('.0', '');
  }
  
  return valor;
}

// 🎯 FUNÇÃO PARA PROCESSAR E LIMPAR DADOS DOS IMÓVEIS
function processarDadosImoveis(imoveis) {
  if (!Array.isArray(imoveis)) return imoveis;
  
  return imoveis.map(imovel => {
    const imovelProcessado = { ...imovel };
    
    const camposMetragem = [
      'Metragem',
      'MetragemTotal', 
      'MetragemPrivativa',
      'MetragemAnt',
      'AreaTotal',
      'AreaPrivativa',
      'Area'
    ];
    
    camposMetragem.forEach(campo => {
      if (imovelProcessado[campo]) {
        const valorOriginal = imovelProcessado[campo];
        const valorLimpo = limparMetragem(valorOriginal);
        
        if (valorOriginal !== valorLimpo) {
          console.log(`🧹 METRAGEM LIMPA: ${campo} ${valorOriginal} → ${valorLimpo} (Código: ${imovel.Codigo})`);
        }
        
        imovelProcessado[campo] = valorLimpo;
      }
    });
    
    return imovelProcessado;
  });
}

// 🎯 FUNÇÃO PARA ORDENAR IMÓVEIS RELACIONADOS
function ordenarImoveisRelacionados(imoveisRelacionados, codigoPrincipal) {
  if (!Array.isArray(imoveisRelacionados) || imoveisRelacionados.length === 0) {
    console.log('📋 ORDENAÇÃO: Nenhum imóvel relacionado para ordenar');
    return [];
  }

  try {
    console.log('🎯 ORDENAÇÃO: Iniciando ordenação de imóveis relacionados', {
      totalImoveis: imoveisRelacionados.length,
      codigoPrincipal: codigoPrincipal
    });

    const imovelPrincipal = imoveisRelacionados.find(imovel => 
      imovel.Codigo === codigoPrincipal || 
      imovel.Codigo === parseInt(codigoPrincipal) ||
      imovel.CodigoImovel === codigoPrincipal ||
      imovel.CodigoImovel === parseInt(codigoPrincipal)
    );

    const demaisImoveis = imoveisRelacionados.filter(imovel => 
      imovel.Codigo !== codigoPrincipal && 
      imovel.Codigo !== parseInt(codigoPrincipal) &&
      imovel.CodigoImovel !== codigoPrincipal &&
      imovel.CodigoImovel !== parseInt(codigoPrincipal)
    );

    const demaisOrdenados = demaisImoveis.sort((a, b) => {
      const extrairValor = (imovel) => {
        const valorBruto = imovel.ValorVenda || 
                          imovel.ValorAntigo || 
                          imovel.Valor || 
                          imovel.PrecoVenda ||
                          imovel.ValorVendaFormatado ||
                          imovel.ValorVendaSite ||
                          '0';
        
        if (typeof valorBruto === 'number') {
          return valorBruto;
        }
        
        if (typeof valorBruto === 'string') {
          let valorLimpo = valorBruto
            .replace(/R\$?\s*/g, '')
            .replace(/\./g, '')
            .replace(/,/g, '.')
            .replace(/[^\d.-]/g, '')
            .trim();
          
          const valorNumerico = parseFloat(valorLimpo) || 0;
          return valorNumerico;
        }
        
        return 0;
      };

      const valorA = extrairValor(a);
      const valorB = extrairValor(b);

      return valorA - valorB;
    });

    const imoveisOrdenados = [];
    
    if (imovelPrincipal) {
      imoveisOrdenados.push(imovelPrincipal);
    }
    
    imoveisOrdenados.push(...demaisOrdenados);

    return processarDadosImoveis(imoveisOrdenados);

  } catch (error) {
    console.error('❌ ORDENAÇÃO: Erro ao ordenar imóveis relacionados:', error);
    return processarDadosImoveis(imoveisRelacionados);
  }
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  if (slug.match(/^imovel-(\d+)$/)) {
    return {
      title: "Redirecionando...",
      robots: { index: false, follow: false }
    };
  }
  
  const response = await getCondominioPorSlug(slug);
  const condominio = response?.data;

  if (!condominio) {
    return {
      title: "Condomínio não encontrado",
      description: "A página do condomínio que você procura não foi encontrada.",
      robots: "noindex, nofollow",
    };
  }

  const rawTitle = ensureCondominio(condominio.Empreendimento);
  
  // 🎯 PROCESSAR FOTOS PARA METADATA TAMBÉM  
  const fotosOrdenadas = processarFotosCondominio(condominio.Foto, condominio.Codigo);
  const fotosOtimizadas = processPhotosForPerformance(fotosOrdenadas, 'single', 1);
  
  // Corrigir extração da imagem - buscar foto destacada ou primeira disponível
  const destaqueFotoObj = fotosOtimizadas?.find((f) => f.Destaque === "Sim");
  const primeiraFoto = Array.isArray(fotosOtimizadas) && fotosOtimizadas.length > 0 ? fotosOtimizadas[0] : null;
  
  const destaqueFotoUrl = destaqueFotoObj?.Foto || 
                         destaqueFotoObj?.FotoPequena || 
                         primeiraFoto?.Foto || 
                         primeiraFoto?.FotoPequena ||
                         `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;
  
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`;
  const modifiedDate = new Date().toISOString();
  const videoId = condominio?.Video ? Object.values(condominio.Video)[0]?.Video : null;

  const description = `${rawTitle} em ${condominio.BairroComercial}, ${condominio.Cidade}. ${condominio.Categoria} com ${condominio.MetragemAnt} m2, ${condominio.DormitoriosAntigo} quartos, ${condominio.VagasAntigo} vagas. ${condominio.Situacao}.`;

  return {
    title: `${rawTitle}, ${condominio.TipoEndereco} ${condominio.Endereco} ${condominio.Numero}, ${condominio.BairroComercial}`,
    description,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL),
    robots: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    alternates: {
      canonical: currentUrl,
      languages: {
        "pt-BR": currentUrl,
      },
    },
    openGraph: {
      title: rawTitle,
      description,
      url: currentUrl,
      type: "website",
      siteName: "NPI Consultoria",
      publishedTime: modifiedDate,
      modifiedTime: modifiedDate,
      images: [
        {
          url: destaqueFotoUrl,
          width: 1200,
          height: 630,
          alt: rawTitle,
          type: "image/jpeg",
        }
      ],
      ...(videoId && {
        videos: [{
          url: `https://www.youtube.com/embed/${videoId}`,
          secureUrl: `https://www.youtube.com/embed/${videoId}`,
          type: 'text/html',
          width: 1280,
          height: 720,
        }],
      }),
      updated_time: modifiedDate,
    },
    twitter: {
      card: videoId ? "player" : "summary_large_image",
      title: rawTitle,
      description,
      site: "@NPIImoveis",
      creator: "@NPIImoveis",
      images: [
        {
          url: destaqueFotoUrl,
          alt: rawTitle,
        }
      ],
      ...(videoId && {
        players: [{
          playerUrl: `https://www.youtube.com/embed/${videoId}`,
          streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
          width: 1280,
          height: 720,
        }],
      }),
    },
    other: {
      'article:published_time': modifiedDate,
      'article:modified_time': modifiedDate,
      'article:author': 'NPI Consultoria',
      'article:section': 'Imobiliário',
      'article:tag': `${condominio.Categoria}, ${condominio.BairroComercial}, ${condominio.Cidade}, condomínio`,
      'og:updated_time': modifiedDate,
      'last-modified': modifiedDate,
      'date': modifiedDate,
      'DC.date.modified': modifiedDate,
      'DC.date.created': modifiedDate,
      ...(videoId && {
        'og:video': `https://www.youtube.com/embed/${videoId}`,
        'og:video:url': `https://www.youtube.com/embed/${videoId}`,
        'og:video:secure_url': `https://www.youtube.com/embed/${videoId}`,
        'og:video:type': 'text/html',
        'og:video:width': '1280',
        'og:video:height': '720',
        'twitter:player': `https://www.youtube.com/embed/${videoId}`,
        'twitter:player:width': '1280',
        'twitter:player:height': '720',
      }),
    },
  };
}

export default async function CondominioPage({ params }) {
  const { slug } = params;
  
  const response = await getCondominioPorSlug(slug);

  if (!response.data) {
    notFound();
  }

  const condominio = response.data;
  const imoveisRelacionados = response.imoveisRelacionados;

  // 🎯 PROCESSAR FOTOS COM photoSorter ANTES DE USAR
  const fotosOrdenadas = processarFotosCondominio(condominio.Foto, condominio.Codigo);

  // 🚀 OTIMIZAR FOTOS PARA PERFORMANCE 90+
  const fotosOtimizadas = processPhotosForPerformance(fotosOrdenadas, 'single', 1);

  // 🎯 ORDENAR IMÓVEIS RELACIONADOS + LIMPAR METRAGEM
  const imoveisOrdenados = ordenarImoveisRelacionados(imoveisRelacionados, condominio.Codigo);

  const rawTitle = ensureCondominio(condominio.Empreendimento);
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`;
  const modifiedDate = new Date().toISOString();
  const videoId = condominio?.Video ? Object.values(condominio.Video)[0]?.Video : null;

  // 🚀 PRELOAD CRÍTICO: URL da primeira imagem para LCP
  const primeiraImagemUrl = fotosOtimizadas?.[0]?.Foto || fotosOtimizadas?.[0]?.FotoPequena;
  
  // 🚀 OTIMIZAR PROPS DO IMAGEGALLERY
  const imageGalleryProps = optimizeImageGalleryProps({
    fotos: fotosOtimizadas,
    title: rawTitle,
    shareUrl: currentUrl,
    shareTitle: `Compartilhe o imóvel ${rawTitle} em ${condominio.BairroComercial}`,
    ...PERFORMANCE_CONFIGS.CONDOMINIO_HERO
  }, true);

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

  let videoStructuredData = null;
  if (videoId) {
    videoStructuredData = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": `Vídeo de apresentação - ${condominio.Empreendimento}`,
      "description": `Conheça o ${condominio.Empreendimento} em ${condominio.BairroComercial}, ${condominio.Cidade}. ${condominio.Categoria} com ${condominio.DormitoriosAntigo} quartos, ${condominio.MetragemAnt} m2, ${condominio.VagasAntigo} vagas.`,
      "thumbnailUrl": `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      "uploadDate": modifiedDate,
      "contentUrl": `https://www.youtube.com/watch?v=${videoId}`,
      "embedUrl": `https://www.youtube.com/embed/${videoId}`,
      "publisher": {
        "@type": "Organization",
        "name": "NPI Consultoria",
        "logo": {
          "@type": "ImageObject",
          "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
        }
      },
      "potentialAction": {
        "@type": "WatchAction",
        "target": `https://www.youtube.com/watch?v=${videoId}`
      }
    };
  }

  function isValidValue(value) {
    return value !== undefined && value !== null && value !== "" && value !== "0";
  }

  return (
    <>
      {/* 🚀 PRELOAD INTELIGENTE DE RECURSOS CRÍTICOS */}
      <PreloadResources 
        criticalImage={primeiraImagemUrl}
        videoThumbnail={videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined}
        fonts={[
          'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2'
        ]}
      />

      {/* 🚀 PRELOAD CRÍTICO PARA LCP - PRIMEIRA IMAGEM */}
      {primeiraImagemUrl && (
        <link
          rel="preload"
          as="image"
          href={primeiraImagemUrl}
          fetchPriority="high"
        />
      )}

      {/* 🚀 PRECONNECT PARA RECURSOS EXTERNOS */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://img.youtube.com" />

      <section className="w-full bg-zinc-100 pb-10">
        {/* Structured Data para o condomínio - usando fotos otimizadas */}
        <StructuredDataApartment
          title={rawTitle}
          price={condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}
          description={`${condominio.Categoria} à venda em ${condominio.BairroComercial}, ${condominio.Cidade}. ${rawTitle}: ${condominio.DormitoriosAntigo} quartos, ${condominio.SuiteAntigo} suítes, ${condominio.BanheiroSocialQtd} banheiros, ${condominio.VagasAntigo} vagas, ${condominio.MetragemAnt} m2. ${condominio.Situacao}. Valor: ${condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}. ${condominio.TipoEndereco} ${condominio.Endereco}.`}
          address={`${condominio.TipoEndereco} ${condominio.Endereco} ${condominio.Numero}, ${condominio.BairroComercial}, ${condominio.Cidade}`}
          url={currentUrl}
          image={fotosOtimizadas}
        />

        {/* 🎯 STRUCTURED DATA DO VÍDEO */}
        {videoStructuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(videoStructuredData),
            }}
          />
        )}

        {/* Structured Data para datas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataDates),
          }}
        />

        <ExitIntentModal condominio={rawTitle} link={currentUrl} />

        <div className="container mx-auto pt-20">
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 ">
            <div className="flex flex-col gap-4 ">
              <div className="px-10 py-6 bg-white max-h-[400px] xl:max-h-[300px] rounded-lg flex-grow">
                <div className="flex justify-between">
                  <span className="text-[10px]">Código:{condominio.Codigo}</span>
                  <Share
                    url={currentUrl}
                    title={`Compartilhe o imóvel ${rawTitle} em ${condominio.BairroComercial}`}
                    variant="secondary"
                  />
                </div>

                <h1 className="text-xl font-bold mt-2">{rawTitle}</h1>
                <span className="text-xs text-zinc-700 font-semibold">
                  {condominio.TipoEndereco} {condominio.Endereco} {condominio.Numero}, {condominio.BairroComercial}, {condominio.Cidade}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4 mb-8">
                  {condominio.ValorAluguelSite && (
                    <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                      <h2 className="text-zinc-600 text-[10px] font-bold">Aluguel:</h2>
                      <h2 className="text-black font-semibold text-[10px]">R$ {condominio.ValorAluguelSite}</h2>
                    </div>
                  )}

                  <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                    <h2 className="text-zinc-600 text-[10px] font-bold">Preço:</h2>
                    <h2 className="text-black font-semibold text-[10px]">R$ {condominio.ValorAntigo}</h2>
                  </div>

                  {condominio.ValorCondominio && (
                    <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                      <h4 className="text-zinc-600 text-[10px] font-bold">Condomínio:</h4>
                      <h2 className="text-black font-semibold text-[10px]">{formatterValue(condominio.ValorCondominio)}</h2>
                    </div>
                  )}
                  {condominio.ValorIptu && (
                    <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                      <h4 className="text-zinc-600 text-[10px] font-bold">IPTU:</h4>
                      <h2 className="text-black font-semibold text-[10px]">{formatterValue(condominio.ValorIptu)}</h2>
                    </div>
                  )}
                </div>
                <ScrollToImoveisButton text={`Mostrar imóveis (${imoveisOrdenados.length})`} />
              </div>
              <div className="relative w-full h-[230px] overflow-y-auto bg-white rounded-lg overflow-hidden p-4">
                {isValidValue(condominio.ValorVenda2) || isValidValue(condominio.ValorGarden) || isValidValue(condominio.ValorCobertura) ? (
                  <PropertyTableOwner imovel={condominio} />
                ) : (
                  <PropertyTable imoveisRelacionados={imoveisOrdenados} />
                )}
              </div>
            </div>
            <div className="relative w-full min-h-[550px] overflow-hidden rounded-lg">
              {/* 🚀 CRÍTICO: IMAGEGALLERY OTIMIZADA PARA LCP 90+ */}
              <ImageGallery {...imageGalleryProps} />
            </div>
          </div>
        </div>

        {/* 🚀 LAZY LOADING COM SUSPENSE - SEÇÕES ABAIXO DA DOBRA */}
        {imoveisOrdenados && imoveisOrdenados.length > 0 && (
          <div id="imoveis-relacionados">
            <Suspense fallback={<LoadingSkeleton height="h-96" className="mx-4" />}>
              <ImoveisRelacionados imoveisRelacionados={imoveisOrdenados} />
            </Suspense>
          </div>
        )}

        <Suspense fallback={<LoadingSkeleton height="h-64" className="mx-4" />}>
          <SobreCondominio condominio={condominio} />
        </Suspense>

        {condominio.FichaTecnica && (
          <Suspense fallback={<LoadingSkeleton height="h-48" className="mx-4" />}>
            <FichaTecnica condominio={condominio} />
          </Suspense>
        )}

        {condominio.DestaquesDiferenciais && (
          <Suspense fallback={<LoadingSkeleton height="h-48" className="mx-4" />}>
            <DetalhesCondominio imovel={condominio} />
          </Suspense>
        )}

        {condominio.DestaquesLazer && (
          <Suspense fallback={<LoadingSkeleton height="h-48" className="mx-4" />}>
            <Lazer condominio={condominio} />
          </Suspense>
        )}

        {condominio.Video && Object.keys(condominio.Video).length > 0 && (
          <Suspense fallback={<LoadingSkeleton height="h-96" className="mx-4" />}>
            <VideoCondominio condominio={condominio} />
          </Suspense>
        )}

        {condominio.Tour360 && (
          <Suspense fallback={<LoadingSkeleton height="h-96" className="mx-4" />}>
            <TourVirtual link={condominio.Tour360} titulo={rawTitle} />
          </Suspense>
        )}

        <Suspense fallback={<LoadingSkeleton height="h-64" className="mx-4" />}>
          <ExploreRegiao condominio={condominio} currentUrl={currentUrl} />
        </Suspense>

        <WhatsappFloat
          message={`Quero saber mais sobre o ${rawTitle}, no bairro ${condominio.BairroComercial}, disponível na página de Condomínio: ${currentUrl}`}
        />
      </section>
    </>
  );
}
