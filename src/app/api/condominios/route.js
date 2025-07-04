import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Extrair o parâmetro limit da URL
    const { searchParams } = request.nextUrl;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")) : null;

    await connectToDatabase();

    // Buscar condomínios com situação "LANÇAMENTO"
    let query = Imovel.find({ Situacao: "LANÇAMENTO" });

    // Aplicar limit se fornecido
    if (limit && limit > 0) {
      query = query.limit(limit);
    }

    // Executar a consulta
    const condominios = await query;

    // Verificar se encontrou algum condomínio
    if (!condominios || condominios.length === 0) {
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    // Log para depuração
    condominios.forEach((cond, index) => {});

    return NextResponse.json({
      status: 200,
      data: condominios,
    });
  } catch (error) {
    console.error("Erro ao buscar condomínios na API:", error);
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido",
    });
  }
}
