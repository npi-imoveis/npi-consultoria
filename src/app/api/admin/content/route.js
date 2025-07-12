import { connectToDatabase } from "@/app/lib/mongodb";
import Content, { IContent } from "@/app/models/Content";
import { NextResponse } from "next/server";

// Função auxiliar para migrar dados antigos para nova estrutura
function migrateOldDataStructure(content) {
  // Se já tem a estrutura nova, retorna como está
  if (content.servicos_page) {
    return content;
  }

  // Migração de dados antigos - ajuste conforme sua estrutura atual
  const migrated = { ...content.toObject() };
  
  // Cria a estrutura servicos_page se não existir
  if (!migrated.servicos_page) {
    migrated.servicos_page = {
      header: {
        title: content.servicos_titulo || content.header_servicos_title || "Sobre a NPi Imóveis",
        subtitle: content.servicos_subtitulo || content.header_servicos_subtitle || "De 2007 a 2025 - Um pouco da nossa história"
      },
      missao: {
        titulo: content.missao_titulo || content.servicos_missao_titulo || "Nossa Missão e Serviços",
        descricao: content.missao_descricao || content.servicos_missao_descricao || "Desde 2007, a NPi se dedica a oferecer um serviço imparcial e de excelência, ajudando nossos clientes a realizarem o sonho de adquirir um imóvel.",
        youtube_link: content.youtube_link || content.missao_youtube_link || ""
      },
      servicos: {
        atendimento: {
          titulo: content.atendimento_titulo || "Atendimento Personalizado",
          descricao: content.atendimento_descricao || "Nossa missão é entender as necessidades de cada cliente e oferecer as melhores opções de imóveis."
        },
        avaliacao: {
          titulo: content.avaliacao_titulo || "Avaliação de Imóveis",
          descricao: content.avaliacao_descricao || "Equipe altamente capacitada para precificar o seu imóvel com uma metodologia completa."
        },
        assessoria: {
          titulo: content.assessoria_titulo || "Assessoria Jurídica",
          descricao: content.assessoria_descricao || "Consultoria especializada no mercado imobiliário para assessorar nossos clientes."
        }
      }
    };
  }

  return migrated;
}

export async function GET(request) {
  try {
    await connectToDatabase();
    let content = await Content.findOne({});
    
    if (!content) {
      // Se não existe conteúdo, cria um novo com estrutura padrão
      content = await Content.create({
        // Estrutura básica existente
        hero_title: "NPi Consultoria",
        hero_subtitle: "Imóveis de Alto Padrão",
        // Nova estrutura de serviços
        servicos_page: {
          header: {
            title: "Sobre a NPi Imóveis",
            subtitle: "De 2007 a 2025 - Um pouco da nossa história"
          },
          missao: {
            titulo: "Nossa Missão e Serviços",
            descricao: "Desde 2007, a NPi se dedica a oferecer um serviço imparcial e de excelência.",
            youtube_link: ""
          },
          servicos: {
            atendimento: {
              titulo: "Atendimento Personalizado",
              descricao: "Nossa missão é entender as necessidades de cada cliente."
            },
            avaliacao: {
              titulo: "Avaliação de Imóveis",
              descricao: "Equipe altamente capacitada para precificar o seu imóvel."
            },
            assessoria: {
              titulo: "Assessoria Jurídica",
              descricao: "Consultoria especializada no mercado imobiliário."
            }
          }
        }
      });
    } else {
      // Migra dados antigos se necessário
      const migratedData = migrateOldDataStructure(content);
      
      // Se houve migração, salva
      if (!content.servicos_page && migratedData.servicos_page) {
        content = await Content.findOneAndUpdate(
          { _id: content._id },
          { $set: { servicos_page: migratedData.servicos_page } },
          { new: true }
        );
      }
    }

    return NextResponse.json({
      status: 200,
      data: content,
    });
  } catch (error) {
    console.error("Detailed error in content fetch:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        status: 500,
        message: "Erro ao buscar conteúdo",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const updateData = await request.json();
    await connectToDatabase();
    
    // Busca o documento atual
    const currentContent = await Content.findOne({});
    
    // Se não existe, cria um novo
    if (!currentContent) {
      const newContent = await Content.create(updateData);
      return NextResponse.json({
        status: 200,
        message: "Conteúdo criado com sucesso",
        data: newContent,
      });
    }
    
    // Prepara os dados para atualização com merge profundo
    let mergedData = { ...updateData };
    
    // Se está atualizando servicos_page, faz merge profundo
    if (updateData.servicos_page) {
      const currentServicosPage = currentContent.servicos_page || {};
      mergedData.servicos_page = {
        header: {
          ...currentServicosPage.header,
          ...updateData.servicos_page.header
        },
        missao: {
          ...currentServicosPage.missao,
          ...updateData.servicos_page.missao
        },
        servicos: {
          atendimento: {
            ...currentServicosPage.servicos?.atendimento,
            ...updateData.servicos_page.servicos?.atendimento
          },
          avaliacao: {
            ...currentServicosPage.servicos?.avaliacao,
            ...updateData.servicos_page.servicos?.avaliacao
          },
          assessoria: {
            ...currentServicosPage.servicos?.assessoria,
            ...updateData.servicos_page.servicos?.assessoria
          }
        }
      };
    }
    
    // Atualiza preservando dados não modificados
    const updatedContent = await Content.findOneAndUpdate(
      { _id: currentContent._id },
      { $set: mergedData },
      { 
        new: true, // retorna o documento atualizado
        runValidators: true // executa validações do schema
      }
    );

    // Log para debug (remova em produção)
    console.log("Conteúdo atualizado:", {
      received: updateData,
      merged: mergedData,
      saved: updatedContent.servicos_page
    });

    return NextResponse.json({
      status: 200,
      message: "Conteúdo atualizado com sucesso",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Erro ao atualizar conteúdo:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Erro ao atualizar conteúdo",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Endpoint adicional para backup (opcional)
export async function POST(request) {
  try {
    const { action } = await request.json();
    
    if (action === "backup") {
      await connectToDatabase();
      const content = await Content.findOne({});
      
      // Cria um backup com timestamp
      const backup = {
        content: content.toObject(),
        timestamp: new Date(),
        version: content.__v
      };
      
      // Você pode salvar isso em uma collection separada de backups
      // await Backup.create(backup);
      
      return NextResponse.json({
        status: 200,
        message: "Backup criado com sucesso",
        data: backup
      });
    }
    
    return NextResponse.json({ status: 400, message: "Ação inválida" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { status: 500, message: "Erro ao processar ação" },
      { status: 500 }
    );
  }
}
