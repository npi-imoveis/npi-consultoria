import Cadimo from "@/app/admin/models/cadimo";
import { connectToDatabase } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    await connectToDatabase();

    if (id) {
      const proprietario = await Cadimo.findOne({ PLACA: id });
      return NextResponse.json({
        status: 200,
        data: proprietario,
      });
    }
  } catch (error) {
    console.error("Erro ao buscar proprietario:", error);
    return NextResponse.json({
      status: 500,
      message: "Erro ao buscar proprietario",
    });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const updateData = await request.json();

    await connectToDatabase();

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          message: "ID (PLACA) não informado",
        },
        { status: 400 }
      );
    }

    const proprietarioAtualizado = await Cadimo.findOneAndUpdate(
      { PLACA: id },
      { $set: updateData },
      { new: true }
    );

    if (!proprietarioAtualizado) {
      return NextResponse.json(
        {
          status: 404,
          message: "Proprietário não encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      message: "Proprietário atualizado com sucesso",
      data: proprietarioAtualizado,
    });
  } catch (error) {
    console.error("Erro ao atualizar proprietario:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Erro ao atualizar proprietario",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    const dadosProprietario = await request.json();

    await connectToDatabase();

    // Se ID foi fornecido como query parameter, usar ele como PLACA
    if (id) {
      dadosProprietario.PLACA = id;
    }

    // Verificar se o PLACA foi fornecido
    if (!dadosProprietario.PLACA) {
      return NextResponse.json(
        {
          status: 400,
          message: "O campo PLACA é obrigatório",
        },
        { status: 400 }
      );
    }

    // Verificar se já existe um proprietário com o mesmo PLACA
    const proprietarioExistente = await Cadimo.findOne({ PLACA: dadosProprietario.PLACA });

    if (proprietarioExistente) {
      return NextResponse.json(
        {
          status: 400,
          message: "Já existe um proprietário com esta PLACA",
        },
        { status: 400 }
      );
    }

    // Criar um novo proprietário
    const novoProprietario = new Cadimo(dadosProprietario);
    const proprietarioSalvo = await novoProprietario.save();

    return NextResponse.json(
      {
        status: 201,
        message: "Proprietário criado com sucesso",
        data: proprietarioSalvo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar proprietario:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Erro ao criar proprietario",
      },
      { status: 500 }
    );
  }
}
