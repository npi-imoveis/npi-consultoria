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

// ✅ FUNÇÃO DE DEBUG - Para ver a estrutura real
function debugFotosEstrutura(imovelData) {
  console.log('🔍 [DEBUG-FOTOS] =================== INÍCIO DEBUG ===================');
  console.log('🔍 [DEBUG-FOTOS] Dados brutos do imovel.Foto:', imovelData.Foto);
  console.log('🔍 [DEBUG-FOTOS] Tipo:', typeof imovelData.Foto);
  console.log('🔍 [DEBUG-FOTOS] É array?', Array.isArray(imovelData.Foto));
  
  if (Array.isArray(imovelData.Foto)) {
    console.log('🔍 [DEBUG-FOTOS] Total de fotos:', imovelData.Foto.length);
    
    imovelData.Foto.forEach((foto, index) => {
      console.log(`🔍 [DEBUG-FOTOS] Foto ${index + 1}:`, {
        // Estrutura completa da foto
        fotoCompleta: foto,
        // Campos que buscamos
        ORDEM: foto.ORDEM,
        Ordem: foto.Ordem,
        ordem: foto.ordem,
        DESTAQUE: foto.DESTAQUE,
        Destaque: foto.Destaque,
        destaque: foto.destaque,
        // URLs
        Foto: foto.Foto,
        FotoPequena: foto.FotoPequena,
        // Outros campos possíveis
        Nome: foto.Nome,
        nome: foto.nome,
        // Todos os campos disponíveis
        todasAsChaves: Object.keys(foto)
      });
    });
  }
  
  console.log('🔍 [DEBUG-FOTOS] =================== FIM DEBUG ===================');
}

// ✅ FUNÇÃO CORRIGIDA - Mais robusta
function processarFotosImovel(imovelData) {
  console.log(`[PROCESSAR-FOTOS] 📸 Iniciando processamento...`);
  
  // Debug da estrutura
  debugFotosEstrutura(imovelData);
  
  if (!imovelData || !imovelData.Foto) {
    console.log(`[PROCESSAR-FOTOS] ⚠️ Nenhuma foto encontrada`);
    return {
      fotosOrdenadas: [],
      fotoDestaque: null
    };
  }
  
  const fotos = Array.isArray(imovelData.Foto) ? imovelData.Foto : [imovelData.Foto];
  
  console.log(`[PROCESSAR-FOTOS] 📊 Total fotos para processar: ${fotos.length}`);
  
  // 1. PRIMEIRO: Clonar array para não modificar o original
  const fotosClone = fotos.map(foto => ({ ...foto }));
  
  // 2. SEGUNDO: Ordenar por ORDEM (tentando todas as variações)
  const fotosOrdenadas = fotosClone.sort((a, b) => {
    // Buscar campo ORDEM em todas as variações possíveis
    const ordemA = a.ORDEM || a.Ordem || a.ordem || 999;
    const ordemB = b.ORDEM || b.Ordem || b.ordem || 999;
    
    const numA = parseInt(ordemA);
    const numB = parseInt(ordemB);
    
    console.log(`[PROCESSAR-FOTOS] 🔢 Comparando ordens: ${numA} vs ${numB}`);
    
    return numA - numB;
  });
  
  console.log(`[PROCESSAR-FOTOS] ✅ Fotos ordenadas por ORDEM:`, 
    fotosOrdenadas.map((f, i) => ({
      indice: i,
      ordem: f.ORDEM || f.Ordem || f.ordem,
      nome: f.Nome || f.nome || `foto-${i}`,
      destaque: f.DESTAQUE || f.Destaque || f.destaque
    }))
  );
  
  // 3. TERCEIRO: Encontrar índice da foto destaque
  const indiceFotoDestaque = fotosOrdenadas.findIndex(foto => {
    const destaque = foto.DESTAQUE || foto.Destaque || foto.destaque;
    
    // Verificar todas as variações possíveis de "destaque"
    const isDestaque = destaque === 1 || 
                      destaque === "1" || 
                      destaque === true ||
                      destaque === "true" ||
                      destaque === "Sim" ||
                      destaque === "sim" ||
                      destaque === "S" ||
                      destaque === "s";
    
    if (isDestaque) {
      console.log(`[PROCESSAR-FOTOS] 🎯 Foto destaque encontrada no índice ${indiceFotoDestaque}:`, {
        nome: foto.Nome || foto.nome,
        ordem: foto.ORDEM || foto.Ordem || foto.ordem,
        destaque: destaque
      });
    }
    
    return isDestaque;
  });
  
  // 4. QUARTO: Mover foto destaque para primeira posição (se encontrada e não estiver já na primeira)
  if (indiceFotoDestaque > 0) {
    console.log(`[PROCESSAR-FOTOS] 📌 Movendo foto destaque do índice ${indiceFotoDestaque} para 0`);
    
    const fotoDestaque = fotosOrdenadas[indiceFotoDestaque];
    fotosOrdenadas.splice(indiceFotoDestaque, 1); // Remove da posição atual
    fotosOrdenadas.unshift(fotoDestaque); // Adiciona no início
    
    console.log(`[PROCESSAR-FOTOS] ✅ Foto destaque movida para primeira posição`);
  } else if (indiceFotoDestaque === 0) {
    console.log(`[PROCESSAR-FOTOS] ✅ Foto destaque já está na primeira posição`);
  } else {
    console.log(`[PROCESSAR-FOTOS] ⚠️ Nenhuma foto destaque encontrada`);
  }
  
  // 5. QUINTO: Encontrar URL da foto destaque
  const fotoDestaque = fotosOrdenadas[0] ? (
    fotosOrdenadas[0].Foto || 
    fotosOrdenadas[0].FotoPequena || 
    fotosOrdenadas[0].url || 
    fotosOrdenadas[0]
  ) : null;
  
  console.log(`[PROCESSAR-FOTOS] 🏁 Resultado final:`, {
    totalFotos: fotosOrdenadas.length,
    primeiraFoto: fotosOrdenadas[0] ? {
      nome: fotosOrdenadas[0].Nome || fotosOrdenadas[0].nome,
      ordem: fotosOrdenadas[0].ORDEM || fotosOrdenadas[0].Ordem || fotosOrdenadas[0].ordem,
      destaque: fotosOrdenadas[0].DESTAQUE || fotosOrdenadas[0].Destaque || fotosOrdenadas[0].destaque,
      url: fotosOrdenadas[0].Foto?.substring(0, 50) + '...'
    } : null,
    fotoDestaque: fotoDestaque ? fotoDestaque.substring(0, 50) + '...' : null
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
