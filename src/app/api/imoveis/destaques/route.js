import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Buscar imóveis destacados, ordenados por data de criação (mais recentes primeiro)
    const imoveis = await Imovel.find({ Destacado: "Sim" })
      .sort({ createdAt: -1 }) // Ordenar por data de criação, mais recentes primeiro
      .limit(15);

    // Verificar se encontrou algum imóvel
    if (!imoveis || imoveis.length === 0) {
      console.log("Nenhum imóvel destacado encontrado");
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    console.log(`Encontrados ${imoveis.length} imóveis destacados`);

    return NextResponse.json({
      status: 200,
      data: imoveis,
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis destacados:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
