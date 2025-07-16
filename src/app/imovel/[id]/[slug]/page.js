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

// ✅ NOVA FUNÇÃO: Ordenar fotos pelo campo ORDEM
function ordenarFotos(fotos) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return [];
  }
  
  console.log(`[FOTO-ORDER] 📸 Ordenando ${fotos.length} fotos...`);
  
  // Ordenar por ORDEM (números menores primeiro)
  const fotosOrdenadas = fotos.sort((a, b) => {
    const ordemA = parseInt(a.ORDEM || a.Ordem || 999);
    const ordemB = parseInt(b.ORDEM || b.Ordem || 999);
    
    console.log(`[FOTO-ORDER] Comparando: ${ordemA} vs ${ordemB}`);
    return ordemA - ordemB;
  });
  
  console.log(`[FOTO-ORDER] ✅ Fotos ordenadas:`, fotosOrdenadas.map(f => ({ 
    nome: f.Nome || f.nome || 'sem-nome', 
    ordem: f.ORDEM || f.Ordem 
  })));
  
  return fotosOrdenadas;
}

// ✅ NOVA FUNÇÃO: Encontrar foto DESTAQUE para thumbnail
function encontrarFotoDestaque(fotos) {
  if (!Array.isArray(fotos) || fotos.length === 0) {
    return null;
  }
  
  console.log(`[FOTO-DESTAQUE] 🎯 Procurando foto destaque em ${fotos.length} fotos...`);
  
  // Procurar por foto marcada como DESTAQUE
  const fotoDestaque = fotos.find(foto => {
    const isDestaque = foto.DESTAQUE === 1 || 
                      foto.DESTAQUE === "1" || 
                      foto.DESTAQUE === true ||
                      foto.Destaque === 1 ||
                      foto.Destaque === "1" ||
                      foto.Destaque === true ||
                      foto.destaque === 1 ||
                      foto.destaque === "1" ||
                      foto.destaque === true;
    
    if (isDestaque) {
      console.log(`[FOTO-DESTAQUE] ✅ Encontrada foto destaque:`, {
        nome: foto.Nome || foto.nome || 'sem-nome',
        ordem: foto.ORDEM || foto.Ordem,
        destaque: foto.DESTAQUE || foto.Destaque || foto.destaque
      });
    }
    
    return isDestaque;
  });
  
  if (fotoDestaque) {
    // Retornar a URL da foto destaque
    return fotoDestaque.Foto || fotoDestaque.FotoPequena || fotoDestaque.url || fotoDestaque;
  }
  
  console.log(`[FOTO-DESTAQUE] ⚠️ Nenhuma foto destaque encontrada, usando primeira foto ordenada`);
  
  // Se não encontrar destaque, usar primeira foto da lista ordenada
  const fotosOrdenadas = ordenarFotos(fotos);
  const primeiraFoto = fotosOrdenadas[0];
  
  if (primeiraFoto) {
    return primeiraFoto.Foto || primeiraFoto.FotoPequena || primeiraFoto.url || primeiraFoto;
  }
  
  return null;
}

// ✅ FUNÇÃO MODIFICADA: Processar fotos do imóvel
function processarFotosImovel(imovelData) {
  console.log(`[PROCESSAR-FOTOS] 📸 Iniciando processamento...`);
  
  if (!imovelData || !imovelData.Foto) {
    console.log(`[PROCESSAR-FOTOS] ⚠️ Nenhuma foto encontrada`);
    return {
      fotosOrdenadas: [],
      fotoDestaque: null
    };
  }
  
  const fotos = Array.isArray(imovelData.Foto) ? imovelData.Foto : [imovelData.Foto];
  
  console.log(`[PROCESSAR-FOTOS] 📊 Dados brutos:`, {
    totalFotos: fotos.length,
    primeiraFoto: fotos[0] ? {
      nome: fotos[0].Nome || fotos[0].nome || 'sem-nome',
      ordem: fotos[0].ORDEM || fotos[0].Ordem,
      destaque: fotos[0].DESTAQUE || fotos[0].Destaque || fotos[0].destaque
    } : null
  });
  
  // 1. Ordenar fotos
  const fotosOrdenadas = ordenarFotos(fotos);
  
  // 2. Encontrar foto destaque
  const fotoDestaque = encontrarFotoDestaque(fotos);
  
  console.log(`[PROCESSAR-FOTOS] ✅ Processamento concluído:`, {
    fotosOrdenadas: fotosOrdenadas.length,
    temFotoDestaque: !!fotoDestaque
  });
  
  return {
    fotosOrdenadas,
    fotoDestaque
  };
}

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

// Configuração de revalidação
export const revalidate = 0;

// ✅ FUNÇÃO MODIFICADA: Geração dinâmica de metadados SEO
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
    
    // ✅ PROCESSAR FOTOS PARA METADATA
    const { fotosOrdenadas, fotoDestaque } = processarFotosImovel(imovel);
    
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
    
    const title = `${imovel.Empreendimento} - ${imovel.BairroComercial}, ${imovel.Cidade}`;
    const description = `${imovel.Categoria} à venda no bairro ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.DormitoriosAntigo} dormitórios, ${imovel.SuiteAntigo} suítes, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}.`;
    const currentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/imovel-${imovel.Codigo}/${imovel.Slug}`;
    
    // ✅ USAR FOTO DESTAQUE PARA OG IMAGE
    const imageUrl = fotoDestaque || 
                    (fotosOrdenadas.length > 0 ? 
                      (fotosOrdenadas[0].Foto || fotosOrdenadas[0].FotoPequena || fotosOrdenadas[0]) : 
                      `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`);

    console.log(`[IMOVEL-META] 🎯 Imagem selecionada:`, {
      usandoDestaque: !!fotoDestaque,
      imageUrl: imageUrl?.substring(0, 50) + '...'
    });

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
        'article:published_time': modifiedDate,
        'article:modified_time': modifiedDate,
        'article:author': 'NPI Consultoria',
        'article:section': 'Imobiliário',
        'article:tag': `${imovel.Categoria}, ${imovel.BairroComercial}, ${imovel.Cidade}, imóvel à venda`,
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

// ✅ COMPONENTE PRINCIPAL MODIFICADO
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

    const imovelRaw = {
      ...response.data,
      SuiteAntigo: response.data.SuiteAntigo ?? response.data.Suites ?? 0,
      DormitoriosAntigo: response.data.DormitoriosAntigo ?? 0,
      VagasAntigo: response.data.VagasAntigo ?? 0,
      BanheiroSocialQtd: response.data.BanheiroSocialQtd ?? 0,
    };

    // ✅ PROCESSAR FOTOS DO IMÓVEL
    const { fotosOrdenadas, fotoDestaque } = processarFotosImovel(imovelRaw);
    
    // ✅ CRIAR OBJETO IMOVEL COM FOTOS ORDENADAS
    const imovel = {
      ...imovelRaw,
      Foto: fotosOrdenadas, // Substituir fotos originais pelas ordenadas
      FotoDestaque: fotoDestaque // Adicionar foto destaque
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
    console.log('📸 Fotos processadas:', {
      original: imovelRaw.Foto ? (Array.isArray(imovelRaw.Foto) ? imovelRaw.Foto.length : 1) : 0,
      ordenadas: fotosOrdenadas.length,
      temDestaque: !!fotoDestaque
    });

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
          description={`${imovel.Categoria} à venda em ${imovel.BairroComercial}, ${imovel.Cidade}. ${imovel.Empreendimento}: ${imovel.DormitoriosAntigo} quartos, ${imovel.SuiteAntigo} suítes, ${imovel.BanheiroSocialQtd} banheiros, ${imovel.VagasAntigo} vagas, ${imovel.MetragemAnt}. ${imovel.Situacao}. Valor: ${imovel.ValorAntigo ? `R$ ${imovel.ValorAntigo}` : "Consulte"}. ${imovel.TipoEndereco} ${imovel.Endereco}.`}
          address={`${imovel.TipoEndereco} ${imovel.Endereco}, ${imovel.Numero}, ${imovel.BairroComercial}, ${imovel.Cidade}`}
          url={currentUrl}
          image={imovel.Foto} // Agora com fotos ordenadas
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
          {/* ✅ GALERIA COM FOTOS ORDENADAS */}
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
