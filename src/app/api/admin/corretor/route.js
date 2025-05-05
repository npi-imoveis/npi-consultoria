import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const nome = url.searchParams.get("nome");

    await connectToDatabase();

    if (nome) {
      const corretor = await Corretores.findOne({ nome });

      return NextResponse.json({
        status: 200,
        data: corretor || null,
      });
    }
  } catch (error) {
    console.error("Erro ao buscar corretores:", error);
    return NextResponse.json({ error: "Erro ao buscar corretores" }, { status: 500 });
  }
}
