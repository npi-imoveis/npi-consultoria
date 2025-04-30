import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import ImovelAtivo from "@/app/models/ImovelAtivo";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  // Extrair o id dos parâmetros (este id é o Codigo do imóvel)
  const { id } = params;

  try {
    await connectToDatabase();

    // Buscar pelo campo Codigo
    const imovel = await Imovel.findOne({ Codigo: id });

    if (!imovel) {
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel não encontrado",
        },
        { status: 404 }
      );
    }

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

  try {
    await connectToDatabase();

    // Obter os dados do corpo da requisição
    const dadosAtualizados = await request.json();

    // Verificar se o imóvel existe pelo Codigo
    const imovelExistente = await Imovel.findOne({ Codigo: id });

    if (!imovelExistente) {
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

  try {
    await connectToDatabase();

    // Verificar se o imóvel existe pelo Codigo
    const imovelExistente = await Imovel.findOne({ Codigo: id });

    if (!imovelExistente) {
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

// Método para criar um novo imóvel com Codigo específico
export async function POST(request, { params }) {
  // O id nos parâmetros é o Codigo do imóvel
  const { id } = params;

  try {
    await connectToDatabase();

    // Obter os dados do corpo da requisição
    const dadosImovel = await request.json();

    // Verificar se já existe um imóvel com este Codigo
    const imovelExistente = await Imovel.findOne({ Codigo: id });

    if (imovelExistente) {
      return NextResponse.json(
        {
          status: 409,
          error: "Imóvel com este código já existe",
        },
        { status: 409 }
      );
    }

    // Definir o Codigo no objeto de dados
    dadosImovel.Codigo = id;

    // Criar um novo imóvel
    const novoImovel = new Imovel(dadosImovel);
    const imovelSalvo = await novoImovel.save();

    const novoImovelAtivo = new ImovelAtivo(dadosImovel);
    const imovelAtivoSalvo = await novoImovelAtivo.save();

    return NextResponse.json(
      {
        status: 201,
        success: true,
        message: "Imóvel criado com sucesso",
        data: imovelSalvo,
        imovelAtivo: imovelAtivoSalvo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(`Erro ao criar imóvel com Codigo ${id}:`, error);
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
