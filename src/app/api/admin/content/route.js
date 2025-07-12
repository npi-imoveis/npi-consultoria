import { connectToDatabase } from "@/app/lib/mongodb";
import Content from "@/app/models/Content";
import { NextResponse } from "next/server";

// Função auxiliar para migrar dados antigos para nova estrutura
function migrateOldDataStructure(content) {
  const migrated = { ...content.toObject() };

  // Se já tem servicos_page, não precisa migrar
  if (migrated.servicos_page) {
    return migrated;
  }

  // Inicializa servicos_page com valores padrão
  migrated.servicos_page = {
    header: {
      title: migrated.servicos_titulo || migrated.header_servicos_title || "Sobre a NPi Imóveis",
      subtitle: migrated.servicos_subtitulo || migrated.header_servicos_subtitle || "De 2007 a 2025 - Um pouco da nossa história",
    },
    missao: {
      titulo: migrated.missao_titulo || migrated.servicos_missao_titulo || "Nossa Missão e Serviços",
      descricao: migrated.missao_descricao || migrated.servicos_missao_descricao || "Desde 2007, a NPi se dedica a oferecer um serviço imparcial e de excelência.",
      youtube_link: migrated.youtube_link || migrated.missao_youtube_link || "",
    },
    servicos: {
      atendimento: { titulo: "", descricao: "", image_url: "" },
      avaliacao: { titulo: "", descricao: "", image_url: "" },
      assessoria: { titulo: "", descricao: "", image_url: "" },
    },
  };

  // Mapeia o array servicos para servicos_page.servicos
  if (migrated.servicos && Array.isArray(migrated.servicos)) {
    const servicesMap = ["atendimento", "avaliacao", "assessoria"];
    migrated.servicos.forEach((service, index) => {
      if (index < servicesMap.length) {
        migrated.servicos_page.servicos[servicesMap[index]] = {
          titulo: service.title || "",
          descricao: service.descricao || "",
          image_url: service.image_url || "",
        };
      }
    });
  }

  return migrated;
}

export async function GET(request) {
  try {
    await connectToDatabase();
    let content = await Content.findOne({});

    if (!content) {
      content = await Content.create({
        servicos_page: {
          header: {
            title: "Sobre a NPi Imóveis",
            subtitle: "De 2007 a 2025 - Um pouco da nossa história",
          },
          missao: {
            titulo: "Nossa Missão e Serviços",
            descricao: "Desde 2007, a NPi se dedica a oferecer um serviço imparcial e de excelência.",
            youtube_link: "",
          },
          servicos: {
            atendimento: {
              titulo: "Atendimento Personalizado",
              descricao: "Nossa missão é entender as necessidades de cada cliente.",
              image_url: "",
            },
            avaliacao: {
              titulo: "Avaliação de Imóveis",
              descricao: "Equipe altamente capacitada para precificar o seu imóvel.",
              image_url: "",
            },
            assessoria: {
              titulo: "Assessoria Jurídica",
              descricao: "Consultoria especializada no mercado imobiliário.",
              image_url: "",
            },
          },
        },
      });
    } else {
      const migratedData = migrateOldDataStructure(content);
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

    const currentContent = await Content.findOne({});
    if (!currentContent) {
      const newContent = await Content.create(updateData);
      return NextResponse.json({
        status: 200,
        message: "Conteúdo criado com sucesso",
        data: newContent,
      });
    }

    let mergedData = { ...currentContent.toObject(), ...updateData };

    // Se atualizando servicos_page, faz merge profundo
    if (updateData.servicos_page) {
      const currentServicosPage = currentContent.servicos_page || {};
      mergedData.servicos_page = {
        header: {
          ...currentServicosPage.header,
          ...updateData.servicos_page.header,
        },
        missao: {
          ...currentServicosPage.missao,
          ...updateData.servicos_page.missao,
        },
        servicos: {
          atendimento: {
            ...currentServicosPage.servicos?.atendimento,
            ...updateData.servicos_page.servicos?.atendimento,
          },
          avaliacao: {
            ...currentServicosPage.servicos?.avaliacao,
            ...updateData.servicos_page.servicos?.avaliacao,
          },
          assessoria: {
            ...currentServicosPage.servicos?.assessoria,
            ...updateData.servicos_page.servicos?.assessoria,
          },
        },
      };

      // Atualiza o array servicos para compatibilidade
      mergedData.servicos = [
        mergedData.servicos_page.servicos.atendimento,
        mergedData.servicos_page.servicos.avaliacao,
        mergedData.servicos_page.servicos.assessoria,
      ].filter(Boolean);
    }

    const updatedContent = await Content.findOneAndUpdate(
      { _id: currentContent._id },
      { $set: mergedData },
      { new: true, runValidators: true }
    );

    console.log("Conteúdo atualizado:", {
      received: updateData,
      merged: mergedData,
      saved: updatedContent.servicos_page,
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

export async function POST(request) {
  try {
    const { action } = await request.json();
    if (action === "backup") {
      await connectToDatabase();
      const content = await Content.findOne({});
      const backup = {
        content: content.toObject(),
        timestamp: new Date(),
        version: content.__v,
      };
      return NextResponse.json({
        status: 200,
        message: "Backup criado com sucesso",
        data: backup,
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
