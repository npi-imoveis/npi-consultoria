import { connectToDatabase } from "@/app/lib/mongodb";
import Review from "@/app/models/Review";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { codigo } = params;

    if (!codigo) {
      return NextResponse.json(
        {
          message: "Código do imóvel não informado",
          error: "Código do imóvel não informado",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Buscar o imóvel pelo código
    const imovel = await Review.findOne({ Codigo: codigo });

    if (!imovel) {
      return NextResponse.json(
        {
          message: "Imóvel não encontrado",
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
    console.error(`API automacao: Erro ao buscar imóvel:`, error);
    return NextResponse.json(
      {
        message: "Erro ao buscar imóvel",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  try {
    const { codigo } = params;

    if (!codigo) {
      return NextResponse.json(
        {
          message: "Código do imóvel não informado",
          error: "Código do imóvel não informado",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    await connectToDatabase();

    // Verificar se o imóvel existe
    const imovelExistente = await Review.findOne({ Codigo: codigo });

    if (!imovelExistente) {
      return NextResponse.json(
        {
          message: "Imóvel não encontrado",
          error: "Imóvel não encontrado",
        },
        { status: 404 }
      );
    }

    // Atualizar o imóvel
    const imovelAtualizado = await Review.findOneAndUpdate({ Codigo: codigo }, body, { new: true });

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel atualizado com sucesso",
      data: imovelAtualizado,
    });
  } catch (error) {
    console.error(`API automacao: Erro ao atualizar imóvel:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao atualizar imóvel",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { codigo } = params;

    if (!codigo) {
      return NextResponse.json(
        {
          message: "Código do imóvel não informado",
          error: "Código do imóvel não informado",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    await connectToDatabase();

    // Verificar se o imóvel existe
    const imovelExistente = await Review.findOne({ Codigo: codigo });

    if (!imovelExistente) {
      return NextResponse.json(
        {
          message: "Imóvel não encontrado",
          error: "Imóvel não encontrado",
        },
        { status: 404 }
      );
    }

    // Atualizar o imóvel
    const imovelAtualizado = await Review.findOneAndUpdate(
      { Codigo: codigo },
      { $set: body },
      { new: true }
    );

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel atualizado com sucesso",
      data: imovelAtualizado,
    });
  } catch (error) {
    console.error(`API automacao: Erro ao atualizar imóvel:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao atualizar imóvel",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { codigo } = params;

    if (!codigo) {
      return NextResponse.json(
        {
          message: "Código do imóvel não informado",
          error: "Código do imóvel não informado",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Tentar excluir pelo Codigo primeiro
    let imovelExistente = await Review.findOne({ Codigo: codigo });
    let deleteResult = null;

    if (imovelExistente) {
      deleteResult = await Review.findOneAndDelete({ Codigo: codigo });
    } else {
      // Se não encontrar pelo Codigo, tenta pelo _id
      imovelExistente = await Review.findById(codigo);
      if (imovelExistente) {
        deleteResult = await Review.findByIdAndDelete(codigo);
      }
    }

    if (!deleteResult) {
      return NextResponse.json(
        {
          message: "Imóvel não encontrado",
          error: "Imóvel não encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      success: true,
      message: "Imóvel excluído com sucesso",
    });
  } catch (error) {
    console.error(`API automacao: Erro ao excluir imóvel:`, error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro ao excluir imóvel",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
