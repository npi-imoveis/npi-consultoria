// src/app/(site)/[slug]/page.js

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
import DiferenciaisCondominio from "./componentes/DiferenciaisCondominio";
import DetalhesCondominio from "./componentes/DetalhesCondominio";
import Lazer from "./componentes/Lazer";
import VideoCondominio from "./componentes/VideoCondominio";
import TourVirtual from "./componentes/TourVirtual";
import ExploreRegiao from "./componentes/ExploreRegiao";
import { notFound, redirect } from "next/navigation";
import ExitIntentModal from "@/app/components/ui/exit-intent-modal";
import ScrollToImoveisButton from "./componentes/scroll-to-imovel-button";
import { photoSorter } from "@/app/utils/photoSorter"; 
import { ImageGallery } from "@/app/components/sections/image-gallery";

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

// 🎯 NOVA FUNÇÃO PARA ORDENAR IMÓVEIS RELACIONADOS
// Coloca o imóvel principal primeiro + demais por valor (menor → maior)
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

    // 1️⃣ SEPARAR IMÓVEL PRINCIPAL DOS DEMAIS
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

    console.log('🔍 ORDENAÇÃO: Separação concluída', {
      imovelPrincipalEncontrado: !!imovelPrincipal,
      codigoImovelPrincipal: imovelPrincipal?.Codigo || imovelPrincipal?.CodigoImovel,
      demaisImoveis: demaisImoveis.length
    });

    // 2️⃣ ORDENAR DEMAIS IMÓVEIS POR VALOR (MENOR → MAIOR)
    const demaisOrdenados = demaisImoveis.sort((a, b) => {
      // Função para extrair valor numérico melhorada
      const extrairValor = (imovel) => {
        // Tentar diferentes campos de valor (ordem de prioridade)
        const valorBruto = imovel.ValorVenda || 
                          imovel.ValorAntigo || 
                          imovel.Valor || 
                          imovel.PrecoVenda ||
                          imovel.ValorVendaFormatado ||
                          imovel.ValorVendaSite ||
                          '0';
        
        console.log('🔍 VALOR BRUTO:', {
          codigo: imovel.Codigo || imovel.CodigoImovel,
          valorBruto,
          tipo: typeof valorBruto
        });
        
        // Se for número, retornar direto
        if (typeof valorBruto === 'number') {
          return valorBruto;
        }
        
        // Se for string, fazer limpeza mais robusta
        if (typeof valorBruto === 'string') {
          // Remover R$, pontos, espaços, deixar apenas números e vírgula
          let valorLimpo = valorBruto
            .replace(/R\$?\s*/g, '')           // Remove R$ e espaços
            .replace(/\./g, '')               // Remove pontos (separadores de milhares)
            .replace(/,/g, '.')               // Troca vírgula por ponto decimal
            .replace(/[^\d.-]/g, '')          // Remove qualquer outro caractere
            .trim();
          
          const valorNumerico = parseFloat(valorLimpo) || 0;
          
          console.log('🔍 CONVERSÃO:', {
            codigo: imovel.Codigo || imovel.CodigoImovel,
            original: valorBruto,
            limpo: valorLimpo,
            numerico: valorNumerico
          });
          
          return valorNumerico;
        }
        
        return 0;
      };

      const valorA = extrairValor(a);
      const valorB = extrairValor(b);
      
      console.log('🎯 COMPARAÇÃO:', {
        imovelA: `${a.Codigo || a.CodigoImovel} = ${valorA}`,
        imovelB: `${b.Codigo || b.CodigoImovel} = ${valorB}`,
        resultado: valorA - valorB
      });

      return valorA - valorB; // Ordem crescente (menor → maior)
    });

    // 3️⃣ MONTAR ARRAY FINAL: PRINCIPAL PRIMEIRO + DEMAIS ORDENADOS
    const imoveisOrdenados = [];
    
    if (imovelPrincipal) {
      imoveisOrdenados.push(imovelPrincipal);
    }
    
    imoveisOrdenados.push(...demaisOrdenados);

    console.log('✅ ORDENAÇÃO: Finalizada com sucesso', {
      totalFinal: imoveisOrdenados.length,
      primeiroEhPrincipal: imoveisOrdenados[0]?.Codigo === codigoPrincipal || 
                          imoveisOrdenados[0]?.CodigoImovel === codigoPrincipal,
      ordemValores: imoveisOrdenados.slice(1, 4).map(i => {
        const valor = i.ValorVenda || i.ValorAntigo || i.Valor || 0;
        return typeof valor === 'string' ? valor.substring(0, 15) + '...' : valor;
      })
    });

    return imoveisOrdenados;

  } catch (error) {
    console.error('❌ ORDENAÇÃO: Erro ao ordenar imóveis relacionados:', error);
    
    // Fallback seguro - retornar array original
    return imoveisRelacionados;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = params;
  
  // Detectar URLs que sigam o padrão imovel-{id} e retornar metadata vazio (não redirecionar aqui)
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
  
  // 🎯 MELHORAR SELEÇÃO DE IMAGEM PARA WHATSAPP
  const destaqueFotoObj = fotosOrdenadas?.find((f) => f.Destaque === "Sim");
  const primeiraFoto = Array.isArray(fotosOrdenadas) && fotosOrdenadas.length > 0 ? fotosOrdenadas[0] : null;
  
  // Priorizar FotoPequena para WhatsApp (menor tamanho = carrega mais rápido)
  const imagemWhatsApp = destaqueFotoObj?.FotoPequena || 
                        primeiraFoto?.FotoPequena ||
                        destaqueFotoObj?.Foto || 
                        primeiraFoto?.Foto ||
                        `${process.env.NEXT_PUBLIC_SITE_URL}/og-image-small.jpg`;
  
  // Imagem de backup otimizada para redes sociais
  const imagemFacebook = destaqueFotoObj?.Foto || 
                        primeiraFoto?.Foto ||
                        `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.jpg`;
  
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`;
  
  // ✅ Gerar data para o condomínio
  const modifiedDate = new Date().toISOString();

  // 🎯 EXTRAIR ID DO VÍDEO - ADICIONADO
  const videoId = condominio?.Video ? Object.values(condominio.Video)[0]?.Video : null;

  console.error(`[CONDOMINIO-META] WhatsApp Image URL: ${imagemWhatsApp}`);
  console.error(`[CONDOMINIO-META] Facebook Image URL: ${imagemFacebook}`);

  const description = `${rawTitle} em ${condominio.BairroComercial}, ${condominio.Cidade}. ${condominio.Categoria} com ${condominio.MetragemAnt} m2, ${condominio.DormitoriosAntigo} quartos, ${condominio.VagasAntigo} vagas. ${condominio.Situacao}.`;

  return {
    title: `${rawTitle}, ${condominio.TipoEndereco} ${condominio.Endereco} ${condominio.Numero}, ${condominio.BairroComercial}`,
    description,
    
    // 🎯 CRÍTICO: metadataBase é OBRIGATÓRIO para Next.js 13+ WhatsApp thumbnails
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
    
    // 🎯 OPENGRPAH OTIMIZADO PARA WHATSAPP
    openGraph: {
      title: rawTitle,
      description,
      url: currentUrl,
      type: "website",
      siteName: "NPI Consultoria",
      publishedTime: modifiedDate,
      modifiedTime: modifiedDate,
      
      // 🎯 MÚLTIPLAS IMAGENS: WHATSAPP USARÁ A MAIS ADEQUADA
      images: [
        // Primeira imagem: Otimizada para WhatsApp (300KB max, quadrada)
        {
          url: imagemWhatsApp,
          width: 400,
          height: 400,
          alt: `${rawTitle} - WhatsApp Preview`,
          type: "image/jpeg",
        },
        // Segunda imagem: Para Facebook/outras redes (retangular)
        {
          url: imagemFacebook,
          width: 1200,
          height: 630,
          alt: `${rawTitle} - Social Preview`,
          type: "image/jpeg",
        }
      ],
      
      // 🎯 ADICIONAR VÍDEOS SE EXISTIR
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
      card: videoId ? "player" : "summary_large_image", // 🎯 Muda para player se tiver vídeo
      title: rawTitle,
      description,
      site: "@NPIImoveis",
      creator: "@NPIImoveis",
      
      // Usar imagem menor para carregamento mais rápido
      images: [
        {
          url: imagemWhatsApp,
          alt: rawTitle,
          width: 400,
          height: 400,
        }
      ],
      
      // 🎯 ADICIONAR PLAYER DO TWITTER SE TIVER VÍDEO
      ...(videoId && {
        players: [{
          playerUrl: `https://www.youtube.com/embed/${videoId}`,
          streamUrl: `https://www.youtube.com/watch?v=${videoId}`,
          width: 1280,
          height: 720,
        }],
      }),
    },
    
    // 🎯 META TAGS ADICIONAIS PARA WHATSAPP
    other: {
      // Meta tags básicas
      'article:published_time': modifiedDate,
      'article:modified_time': modifiedDate,
      'article:author': 'NPI Consultoria',
      'article:section': 'Imobiliário',
      'article:tag': `${condominio.Categoria}, ${condominio.BairroComercial}, ${condominio.Cidade}, condomínio`,
      
      // Meta tags específicas para WhatsApp
      'og:updated_time': modifiedDate,
      'og:image:secure_url': imagemWhatsApp,
      'og:image:width': '400',
      'og:image:height': '400',
      'og:image:type': 'image/jpeg',
      
      // Meta tags de cache
      'last-modified': modifiedDate,
      'date': modifiedDate,
      'DC.date.modified': modifiedDate,
      'DC.date.created': modifiedDate,
      
      // 🎯 META TAGS DE VÍDEO ADICIONADAS CORRETAMENTE
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
  
  // URLs imovel-{id} agora são interceptadas pelo next.config.mjs
  // Esta página só deve processar slugs de condomínios reais
  
  const response = await getCondominioPorSlug(slug);

  if (!response.data) {
    notFound();
  }

  const condominio = response.data;
  const imoveisRelacionados = response.imoveisRelacionados;

  // 🎯 PROCESSAR FOTOS COM photoSorter ANTES DE USAR (igual ao admin que funcionou)
  const fotosOrdenadas = processarFotosCondominio(condominio.Foto, condominio.Codigo);

  // 🎯 NOVA IMPLEMENTAÇÃO: ORDENAR IMÓVEIS RELACIONADOS
  // Principal primeiro + demais por valor crescente
  const imoveisOrdenados = ordenarImoveisRelacionados(imoveisRelacionados, condominio.Codigo);

  const rawTitle = ensureCondominio(condominio.Empreendimento);
  const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/${slug}`;
  const modifiedDate = new Date().toISOString();

  // 🎯 EXTRAIR ID DO VÍDEO - ADICIONADO
  const videoId = condominio?.Video ? Object.values(condominio.Video)[0]?.Video : null;

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

  // 🎯 STRUCTURED DATA DO VÍDEO - ADICIONADO
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
    <section className="w-full bg-zinc-100 pb-10">
      {/* Structured Data para o condomínio */}
      <StructuredDataApartment
        title={rawTitle}
        price={condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}
        description={`${condominio.Categoria} à venda em ${condominio.BairroComercial}, ${condominio.Cidade}. ${rawTitle}: ${condominio.DormitoriosAntigo} quartos, ${condominio.SuiteAntigo} suítes, ${condominio.BanheiroSocialQtd} banheiros, ${condominio.VagasAntigo} vagas, ${condominio.MetragemAnt} m2. ${condominio.Situacao}. Valor: ${condominio.ValorAntigo ? `R$ ${condominio.ValorAntigo}` : "Consulte"}. ${condominio.TipoEndereco} ${condominio.Endereco}.`}
        address={`${condominio.TipoEndereco} ${condominio.Endereco} ${condominio.Numero}, ${condominio.BairroComercial}, ${condominio.Cidade}`}
        url={currentUrl}
        image={fotosOrdenadas} // 🎯 USAR FOTOS ORDENADAS NO STRUCTURED DATA
      />

      {/* 🎯 STRUCTURED DATA DO VÍDEO - ADICIONADO */}
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

                {/* Este é o bloco do Valor de Venda. O erro estava aqui. */}
                <div className="flex flex-col rounded-lg bg-zinc-100 p-4">
                  <h2 className="text-zinc-600 text-[10px] font-bold">Preço:</h2>
                  <h2 className="text-black font-semibold text-[10px]">R$ {condominio.ValorAntigo}</h2>
                </div>
                {/* A linha 132 do erro anterior (onde estava o ')}') foi removida aqui. */}

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
            {/* 🎯 ALTERAÇÃO: Usar layout="single" para mostrar apenas 1 foto principal ocupando todo espaço */}
            <ImageGallery 
              fotos={fotosOrdenadas}
              title={rawTitle}
              shareUrl={currentUrl}
              shareTitle={`Compartilhe o imóvel ${rawTitle} em ${condominio.BairroComercial}`}
              layout="single"
            />
          </div>
        </div>
      </div>
      {imoveisOrdenados && imoveisOrdenados.length > 0 && (
        <div id="imoveis-relacionados">
          <ImoveisRelacionados imoveisRelacionados={imoveisOrdenados} />
        </div>
      )}
      <SobreCondominio condominio={condominio} />

      {condominio.FichaTecnica && <FichaTecnica condominio={condominio} />}
      {condominio.DestaquesDiferenciais && <DetalhesCondominio imovel={condominio} />}
      {condominio.DestaquesLazer && <Lazer condominio={condominio} />}
      {condominio.Video && Object.keys(condominio.Video).length > 0 && (
        <VideoCondominio condominio={condominio} />
      )}
      {condominio.Tour360 && (
        <TourVirtual link={condominio.Tour360} titulo={rawTitle} />
      )}

      <ExploreRegiao condominio={condominio} currentUrl={currentUrl} />
      <WhatsappFloat
        message={`Quero saber mais sobre o ${rawTitle}, no bairro ${condominio.BairroComercial}, disponível na página de Condomínio: ${currentUrl}`}
      />
    </section>
  );
}
