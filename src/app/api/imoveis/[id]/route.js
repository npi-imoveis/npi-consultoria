import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  // Extrair o id dos parâmetros (este id é o Codigo do imóvel)
  const { id } = params;

  console.log("Buscando imóvel com Codigo:", id);

  try {
    await connectToDatabase();

    // Buscar pelo campo Codigo
    const imovel = await Imovel.findOne({ Codigo: id });

    if (!imovel) {
      console.log(`Imóvel com Codigo ${id} não encontrado`);
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel não encontrado",
        },
        { status: 404 }
      );
    }

    console.log(`Imóvel com Codigo ${id} encontrado`);

    return NextResponse.json({
      status: 200,
      data: imovel,
    });
  } catch (error) {
    console.error(`Erro ao buscar imóvel com Codigo ${id}:`, error);
    return NextResponse.json(
      {
        status: 500,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Método para atualizar um imóvel existente pelo Codigo
export async function PUT(request, { params }) {
  // O id nos parâmetros é o Codigo do imóvel
  const { id } = params;
  console.log(`Atualizando imóvel com Codigo: ${id}`);

  try {
    await connectToDatabase();

    // Obter os dados do corpo da requisição
    const dadosAtualizados = await request.json();

    // Verificar se o imóvel existe pelo Codigo
    const imovelExistente = await Imovel.findOne({ Codigo: id });

    if (!imovelExistente) {
      console.log(`Imóvel com Codigo ${id} não encontrado para atualização`);
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel não encontrado",
        },
        { status: 404 }
      );
    }

    // Atualizar o imóvel no banco de dados pelo Codigo
    const imovelAtualizado = await Imovel.findOneAndUpdate(
      { Codigo: id },
      { $set: dadosAtualizados },
      { new: true } // Retorna o documento atualizado
    );

    if (!imovelAtualizado) {
      return NextResponse.json(
        {
          status: 500,
          error: "Erro ao atualizar imóvel",
        },
        { status: 500 }
      );
    }

    console.log(`Imóvel com Codigo ${id} atualizado com sucesso`);

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel atualizado com sucesso",
      data: imovelAtualizado,
    });
  } catch (error) {
    console.error(`Erro ao atualizar imóvel com Codigo ${id}:`, error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

// Método para excluir um imóvel pelo Codigo
export async function DELETE(request, { params }) {
  // O id nos parâmetros é o Codigo do imóvel
  const { id } = params;
  console.log(`Excluindo imóvel com Codigo: ${id}`);

  try {
    await connectToDatabase();

    // Verificar se o imóvel existe pelo Codigo
    const imovelExistente = await Imovel.findOne({ Codigo: id });

    if (!imovelExistente) {
      console.log(`Imóvel com Codigo ${id} não encontrado para exclusão`);
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel não encontrado",
        },
        { status: 404 }
      );
    }

    // Excluir o imóvel do banco de dados pelo Codigo
    const resultado = await Imovel.deleteOne({ Codigo: id });

    if (resultado.deletedCount === 0) {
      return NextResponse.json(
        {
          status: 500,
          error: "Erro ao excluir imóvel",
        },
        { status: 500 }
      );
    }

    console.log(`Imóvel com Codigo ${id} excluído com sucesso`);

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel excluído com sucesso",
    });
  } catch (error) {
    console.error(`Erro ao excluir imóvel com Codigo ${id}:`, error);
    return NextResponse.json(
      {
        status: 500,
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
