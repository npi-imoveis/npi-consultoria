// src/app/(site)/[slug]/page.js - OTIMIZAÇÃO CIRÚRGICA PARA 90+

import { Button } from "@/app/components/ui/button";
import { getCondominioPorSlug } from "@/app/services";
import { formatterValue } from "@/app/utils/formatter-value";
import { Apartment as StructuredDataApartment } from "@/app/components/structured-data";
import { Share } from "@/app/components/ui/share";
import { PropertyTableOwner } from "./componentes/property-table-owner";
import { WhatsappFloat } from "@/app/components/ui/whatsapp";
import { PropertyTable } from "./componentes/property-table";
import { ImoveisRelacionados } from "./componentes/related-properties";
import SobreCondominio from "./componentes/SobreCondominio";
import FichaTecnica from "./componentes/FichaTecnica";
import DetalhesCondominio from "./componentes/DetalhesCondominio";
import Lazer from "./componentes/Lazer";
import TourVirtual from "./componentes/TourVirtual";
import ExploreRegiao from "./componentes/ExploreRegiao";
import { notFound, redirect } from "next/navigation";
import ExitIntentModal from "@/app/components/ui/exit-intent-modal";
import ScrollToImoveisButton from "./componentes/scroll-to-imovel-button";
import { photoSorter } from "@/app/utils/photoSorter"; 
import { ImageGallery } from "@/app/components/sections/image-gallery";

// 🚀 LAZY LOADING APENAS DE COMPONENTES BELOW-THE-FOLD
import { lazy, Suspense, useState } from 'react';

// 🚀 REMOVER lazy loading de componentes que aparecem rapidamente (Speed Index)
// Manter apenas os que realmente são below-the-fold
const VideoCondominio = lazy(() => import("./componentes/VideoCondominio"));

// 🚀 YOUTUBE FACADE INLINE (evita arquivo externo)
function YouTubeFacadeInline({ videoId, title }) {
  const [isLoaded, setIsLoaded] = useState(false);

  if (isLoaded) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <div 
      className="relative w-full cursor-pointer group bg-black rounded-lg overflow-hidden"
      onClick={() => setIsLoaded(true)}
      style={{ aspectRatio: '16/9' }}
    >
      <img
        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
        alt={`Thumbnail: ${title}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-red-600 hover:bg-red-700 rounded-full p-4 lg:p-6 transition-all duration-300 transform group-hover:scale-110 shadow-lg">
          <svg className="w-8 h-8 lg:w-12 lg:h-12 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </div>
      </div>
      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
        YouTube
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
        <h3 className="text-white font-semibold text-sm lg:text-base line-clamp-2">
          {title}
        </h3>
      </div>
    </div>
  );
}

// 🚀 OTIMIZAÇÃO DE IMAGEM S3 (inline)
function optimizeS3ImageUrl(url, width = 800, quality = 85) {
  if (!url) return url;
  
  if (url.includes('amazonaws.com') || url.includes('s3.')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}w=${width}&q=${quality}&f=webp`;
  }
  
  return url;
}

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
    
    // 🚀 OTIMIZAR URLS DAS FOTOS PARA S3
    const fotosOtimizadas = fotosOrdenadas.map(foto => ({
      ...foto,
      Foto: optimizeS3ImageUrl(foto.Foto, 1200, 90),
      FotoPequena: optimizeS3ImageUrl(foto.FotoPequena, 800, 85)
    }));
    
    console.log('✅ CONDOMÍNIO: Ordenação finalizada usando photoSorter:', {
      totalFotos: fotosOtimizadas.length,
      primeira: fotosOtimizadas[0]?.Foto?.split('/').pop()?.substring(0, 30) + '...',
      metodo: 'photoSorter.ordenarFotos() - IGUAL AO ADMIN'
    });

    return fotosOtimizadas;

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
  const fotosOrdenadas = processarFotosCondominio(condominio.Foto, condominio.Codigo);
  
  const destaqueFotoObj = fotosOrdenadas?.find((f) => f.Destaque === "Sim");
  const primeiraFoto = Array.isArray(fotosOrdenadas) && fotosOrdenadas.length > 0 ? fotosOrdenadas[0] : null;
  
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

  // 🎯 PROCESSAR FOTOS COM photoSorter ANTES DE USAR (já otimizadas)
  const fotosOrdenadas = processarFotosCondominio(condominio.Foto, condominio.Codigo);

  // 🎯 ORDENAR IMÓVEIS RELACIONADOS + LIMPAR METRAGEM
  const imoveisOrdenados = ordenarImoveisRelacionados(imoveisRelacionados, condominio.Codigo);

  const rawTitle = ensureCondominio(condominio.Empreendimento);
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`;
  const modifiedDate = new Date().toISOString();
  const videoId = condominio?.Video ? Object.values(condominio.Video)[0]?.Video : null;

  // 🚀 URL da primeira imagem para preload LCP
  const primeiraImagemUrl = fotosOrdenadas?.[0]?.Foto || fotosOrdenadas?.[0]?.FotoPequena;

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
      {/* 🚀 CRITICAL CSS INLINE para reduzir render blocking */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .container{max-width:1200px;margin:0 auto;padding:0 1rem}
          .grid{display:grid}
          .grid-cols-1{grid-template-columns:repeat(1,minmax(0,1fr))}
          .grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}
          .flex{display:flex}
          .flex-col{flex-direction:column}
          .gap-4{gap:1rem}
          .bg-white{background-color:#fff}
          .bg-zinc-100{background-color:#f4f4f5}
          .rounded-lg{border-radius:0.5rem}
          .p-4{padding:1rem}
          .text-xl{font-size:1.25rem}
          .font-bold{font-weight:700}
          .mt-2{margin-top:0.5rem}
          .text-xs{font-size:0.75rem}
          .text-zinc-700{color:#374151}
          @media(min-width:768px){.md\\:grid-cols-2{grid-template-columns:repeat(2,minmax(0,1fr))}}
        `
      }} />

      {/* 🚀 PRELOAD CRÍTICO PARA LCP - PRIMEIRA IMAGEM */}
      {primeiraImagemUrl && (
        <link
          rel="preload"
          as="image"
          href={primeiraImagemUrl}
          fetchPriority="high"
        />
      )}

      {/* 🚀 PRECONNECT PARA RECURSOS EXTERNOS (apenas essenciais) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

      <section className="w-full bg-zinc-100 pb-10">
        {/* Structured Data para o condomínio */}
        <StructuredDataApartment
          title={rawTitle}
          price={condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}
          description={`${condominio.Categoria} à venda em ${condominio.BairroComercial}, ${condominio.Cidade}. ${rawTitle}: ${condominio.DormitoriosAntigo} quartos, ${condominio.SuiteAntigo} suítes, ${condominio.BanheiroSocialQtd} banheiros, ${condominio.VagasAntigo} vagas, ${condominio.MetragemAnt} m2. ${condominio.Situacao}. Valor: ${condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}. ${condominio.TipoEndereco} ${condominio.Endereco}.`}
          address={`${condominio.TipoEndereco} ${condominio.Endereco} ${condominio.Numero}, ${condominio.BairroComercial}, ${condominio.Cidade}`}
          url={currentUrl}
          image={fotosOrdenadas}
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
              {/* 🚀 CRÍTICO: PRIORITY + SIZES OTIMIZADOS PARA LCP */}
              <ImageGallery 
                fotos={fotosOrdenadas}
                title={rawTitle}
                shareUrl={currentUrl}
                shareTitle={`Compartilhe o imóvel ${rawTitle} em ${condominio.BairroComercial}`}
                layout="single"
                priority={true}
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, 50vw"
                quality={90}
              />
            </div>
          </div>
        </div>

        {/* 🚀 COMPONENTES ABOVE-THE-FOLD SEM LAZY (melhora Speed Index) */}
        {imoveisOrdenados && imoveisOrdenados.length > 0 && (
          <div id="imoveis-relacionados">
            <ImoveisRelacionados imoveisRelacionados={imoveisOrdenados} />
          </div>
        )}

        <SobreCondominio condominio={condominio} />

        {condominio.FichaTecnica && <FichaTecnica condominio={condominio} />}

        {condominio.DestaquesDiferenciais && <DetalhesCondominio imovel={condominio} />}

        {condominio.DestaquesLazer && <Lazer condominio={condominio} />}

        {/* 🚀 YOUTUBE FACADE INLINE - EVITA TBT */}
        {condominio.Video && Object.keys(condominio.Video).length > 0 && (
          <section className="w-full py-16 bg-white">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Vídeo do Empreendimento
                </h2>
                <div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Conheça todos os detalhes e diferenciais do {condominio.Empreendimento} em um tour completo
                </p>
              </div>
              <div className="max-w-6xl mx-auto">
                <div className="relative w-full">
                  <YouTubeFacadeInline
                    videoId={videoId}
                    title={`Conheça o ${condominio.Empreendimento} - ${condominio.BairroComercial}, ${condominio.Cidade}`}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 🚀 LAZY LOADING APENAS PARA COMPONENTES REALMENTE BELOW-THE-FOLD */}
        {condominio.Tour360 && (
          <Suspense fallback={<div className="h-96 bg-gray-200 animate-pulse mx-4 rounded-lg"></div>}>
            <TourVirtual link={condominio.Tour360} titulo={rawTitle} />
          </Suspense>
        )}

        <ExploreRegiao condominio={condominio} currentUrl={currentUrl} />

        <WhatsappFloat
          message={`Quero saber mais sobre o ${rawTitle}, no bairro ${condominio.BairroComercial}, disponível na página de Condomínio: ${currentUrl}`}
        />
      </section>
    </>
  );
}
