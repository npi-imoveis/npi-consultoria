import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    // Buscar condomínios, ordenados por data de criação (mais recentes primeiro)
    const condominios = await Imovel.find({ Categoria: "CONDOMÍNIO" })
      .sort({ createdAt: -1 }) // Ordenar por data de criação, mais recentes primeiro
      .limit(8);

    // Verificar se encontrou algum condomínio
    if (!condominios || condominios.length === 0) {
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    return NextResponse.json({
      status: 200,
      data: condominios,
    });
  } catch (error) {
    console.error("Erro ao buscar condomínios:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
