import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";

export async function GET(request) {
  // Extract the id from URL query params
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID do imóvel não fornecido" }, { status: 400 });
  }

  try {
    await connectToDatabase();

    // Find corretor where imoveis_vinculados contains an object with Codigo matching the id
    const corretor = await Corretores.findOne({
      "imoveis_vinculados.Codigo": id,
    });

    if (!corretor) {
      return NextResponse.json(
        { message: "Corretor não encontrado para este imóvel" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      nome: corretor.nome,
      email: corretor.email,
      celular: corretor.celular,
      creci: corretor.creci,
    });
  } catch (error) {
    console.error("Erro ao buscar corretor:", error);
    return NextResponse.json({ error: "Erro ao buscar informações do corretor" }, { status: 500 });
  }
}

export async function DELETE(request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  try {
    await connectToDatabase();

    const corretor = await Corretores.findOne({
      codigoD: id,
    });

    if (!corretor) {
      return NextResponse.json({ error: "Corretor não encontrado" }, { status: 404 });
    }

    await Corretores.deleteOne({ codigoD: id });

    return NextResponse.json({ message: "Corretor deletado com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar corretor:", error);
    return NextResponse.json({ error: "Erro ao deletar corretor" }, { status: 500 });
  }
}
