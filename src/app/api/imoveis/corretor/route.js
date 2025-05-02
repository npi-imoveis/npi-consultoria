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
