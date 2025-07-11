import { connectToDatabase } from "@/app/lib/mongodb";
import Content, { IContent } from "@/app/models/Content";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();
    let content = await Content.findOne({});
    
    if (!content) {
      return NextResponse.json(
        {
          status: 404,
          message: "Conteúdo não encontrado",
        },
        { status: 404 }
      );
    }

    // GARANTIR que os campos de serviços existam (sem sobrescrever dados existentes)
    if (!content.servicos) {
      content.servicos = {};
    }

    // Adicionar estrutura básica apenas se os campos não existirem
    const servicosDefaults = {
      titulo: "Nossa missão e serviços",
      descricao: "Desde 2007, a NPI se dedica a oferecer um serviço imparcial e de excelência, ajudando nossos clientes a realizarem o sonho de adquirir um imóvel.",
      videoYoutube: "",
      atendimentoPersonalizado: {
        titulo: "Atendimento Personalizado",
        descricao: "",
        imagem: "",
        link: "",
        preco: "",
        prazo: "",
        beneficios: "",
        ativo: true,
        destaque: false
      },
      avaliacaoImoveis: {
        titulo: "Avaliação de Imóveis",
        descricao: "",
        imagem: "",
        link: "",
        preco: "",
        prazo: "",
        beneficios: "",
        ativo: true,
        destaque: false
      },
      assessoriaJuridica: {
        titulo: "Assessoria Jurídica",
        descricao: "",
        imagem: "",
        link: "",
        preco: "",
        prazo: "",
        beneficios: "",
        ativo: true,
        destaque: false
      }
    };

    // Mesclar apenas campos que não existem
    let needsUpdate = false;
    Object.keys(servicosDefaults).forEach(key => {
      if (!content.servicos[key]) {
        content.servicos[key] = servicosDefaults[key];
        needsUpdate = true;
      } else if (typeof servicosDefaults[key] === 'object' && !Array.isArray(servicosDefaults[key])) {
        // Para objetos aninhados (como os serviços), verificar campos individuais
        Object.keys(servicosDefaults[key]).forEach(subkey => {
          if (content.servicos[key][subkey] === undefined) {
            if (!content.servicos[key]) content.servicos[key] = {};
            content.servicos[key][subkey] = servicosDefaults[key][subkey];
            needsUpdate = true;
          }
        });
      }
    });

    // Se precisar atualizar, salvar no banco
    if (needsUpdate) {
      content = await Content.findOneAndUpdate(
        {},
        { $set: { servicos: content.servicos } },
        { new: true, upsert: true }
      );
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
    
    // Find the first document and update it (MANTIDO ORIGINAL)
    const updatedContent = await Content.findOneAndUpdate(
      {}, // empty filter to get the first document
      { $set: updateData },
      { new: true, upsert: true } // return updated document and create if doesn't exist
    );
    
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

// ADICIONAR suporte ao método PUT para compatibilidade com o sistema de gerenciamento
export async function PUT(request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { 
          status: 400, 
          message: "Dados não fornecidos",
          error: "Dados não fornecidos" 
        },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // Usar a mesma lógica do PATCH para compatibilidade
    const updatedContent = await Content.findOneAndUpdate(
      {},
      { $set: data },
      { new: true, upsert: true }
    );
    
    return NextResponse.json({
      status: 200,
      message: "Conteúdo atualizado com sucesso",
      data: updatedContent,
      success: true // Adicionar para compatibilidade
    });
  } catch (error) {
    console.error("Erro ao salvar conteúdo:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Erro ao salvar conteúdo",
        error: error instanceof Error ? error.message : "Erro desconhecido",
        success: false
      },
      { status: 500 }
    );
  }
}
