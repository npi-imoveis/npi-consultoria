import { NextResponse } from "next/server";
import Imovel from "@/app/models/Imovel";
import Corretores from "@/app/models/Corretores";
import { connectToDatabase } from "@/app/lib/mongodb";

export async function POST(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id_corretor = searchParams.get("id_corretor");
    const id_imovel = searchParams.get("id_imovel");

    if (!id_corretor || !id_imovel) {
      return NextResponse.json(
        { error: "ID do corretor e ID do imóvel são obrigatórios" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Verify if the property exists
    const imovel = await Imovel.findOne({ Codigo: id_imovel });

    if (!imovel) {
      return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });
    }

    // 2. Add the property code to the broker's imoveis_vinculados array
    const updatedCorretor = await Corretores.findOneAndUpdate(
      { codigoD: id_corretor },
      {
        $addToSet: {
          imoveis_vinculados: { Codigo: id_imovel },
        },
      },
      { new: true }
    );

    if (!updatedCorretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Imóvel vinculado com sucesso",
      corretor: updatedCorretor,
    });
  } catch (error) {
    console.error("Error linking property to broker:", error);
    return NextResponse.json({ error: "Erro ao vincular imóvel ao corretor" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id_corretor = searchParams.get("id_corretor");
    const id_imovel = searchParams.get("id_imovel");

    if (!id_corretor || !id_imovel) {
      return NextResponse.json(
        { error: "ID do corretor e ID do imóvel são obrigatórios" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Remove the property from the broker's imoveis_vinculados array
    const updatedCorretor = await Corretores.findOneAndUpdate(
      { codigoD: id_corretor },
      {
        $pull: {
          imoveis_vinculados: { Codigo: id_imovel },
        },
      },
      { new: true }
    );

    if (!updatedCorretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Imóvel desvinculado com sucesso",
      corretor: updatedCorretor,
    });
  } catch (error) {
    console.error("Error unlinking property from broker:", error);
    return NextResponse.json({ error: "Erro ao desvincular imóvel do corretor" }, { status: 500 });
  }
}
