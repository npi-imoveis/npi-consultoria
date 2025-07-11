import { connectToDatabase } from "@/app/lib/mongodb";
import Content, { IContent } from "@/app/models/Content";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();
    const content = await Content.findOne({});
    
    if (!content) {
      return NextResponse.json(
        {
          status: 404,
          message: "Conteúdo não encontrado",
        },
        { status: 404 }
      );
    }

    // APENAS verificar se serviços existem, SEM alterar nada existente
    // Se não existir, adicionar estrutura MÍNIMA apenas
    if (!content.servicos) {
      const minimalServicos = {
        atendimentoPersonalizado: {},
        avaliacaoImoveis: {},
        assessoriaJuridica: {}
      };

      // Adicionar apenas os campos mínimos SEM sobrescrever nada
      try {
        await Content.findOneAndUpdate(
          {},
          { 
            $set: { 
              "servicos.atendimentoPersonalizado": content.servicos?.atendimentoPersonalizado || {},
              "servicos.avaliacaoImoveis": content.servicos?.avaliacaoImoveis || {},
              "servicos.assessoriaJuridica": content.servicos?.assessoriaJuridica || {}
            }
          },
          { new: false } // NÃO retornar novo documento para não alterar resposta
        );
      } catch (updateError) {
        console.log("Não foi possível atualizar, mas continuando...", updateError);
      }
    }

    // SEMPRE retornar o conteúdo original, preservado
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
    
    // PRESERVAR TUDO - usar $set apenas para campos específicos
    const updatedContent = await Content.findOneAndUpdate(
      {}, 
      { $set: updateData },
      { new: true, upsert: true }
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

// PUT method - PRESERVA TUDO, atualiza apenas campos enviados
export async function PUT(request) {
  try {
    const body = await request.json();
    const { data } = body;

    if (!data) {
      return NextResponse.json(
        { 
          status: 400, 
          message: "Dados não fornecidos",
          error: "Dados não fornecidos",
          success: false
        },
        { status: 400 }
      );
    }

    await connectToDatabase();
    
    // BUSCAR dados atuais primeiro
    const currentContent = await Content.findOne({});
    
    if (!currentContent) {
      return NextResponse.json(
        {
          status: 404,
          message: "Conteúdo não encontrado para atualizar",
          error: "Documento não existe",
          success: false
        },
        { status: 404 }
      );
    }

    // FAZER UPDATE SELETIVO - apenas dos campos enviados
    // Construir objeto de update de forma EXTREMAMENTE cuidadosa
    const updateFields = {};
    
    // Para cada seção enviada, atualizar apenas os campos específicos
    Object.keys(data).forEach(section => {
      if (data[section] && typeof data[section] === 'object' && !Array.isArray(data[section])) {
        Object.keys(data[section]).forEach(field => {
          const fieldPath = `${section}.${field}`;
          updateFields[fieldPath] = data[section][field];
        });
      } else {
        updateFields[section] = data[section];
      }
    });

    console.log("🛡️ UPDATE DEFENSIVO - Apenas estes campos:", updateFields);

    // Atualizar apenas os campos específicos enviados
    const updatedContent = await Content.findOneAndUpdate(
      {},
      { $set: updateFields },
      { new: true }
    );
    
    return NextResponse.json({
      status: 200,
      message: "Conteúdo atualizado com sucesso",
      data: updatedContent,
      success: true,
      fieldsUpdated: Object.keys(updateFields)
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
