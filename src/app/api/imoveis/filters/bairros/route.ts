import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Obter o parâmetro cidade da URL
    const { searchParams } = request.nextUrl;
    const cidade = searchParams.get("cidade");

    // Definir a condição de busca
    let condition = {};
    if (cidade) {
      // Se uma cidade foi especificada, filtrar apenas os bairros dessa cidade
      condition = { Cidade: cidade };
    }

    // Buscar bairros distintos com base na condição
    const bairros = await Imovel.distinct("BairroComercial", condition);

    // Filtrar bairros vazios e ordená-los
    const bairrosFiltrados = bairros
      .filter((bairro) => bairro && bairro.trim() !== "")
      .sort((a, b) => a.localeCompare(b));

    // Retornar os bairros como resposta
    return NextResponse.json({
      status: 200,
      data: bairrosFiltrados,
    });
  } catch (error) {
    console.error("Erro ao buscar bairros:", error);

    // Retornar erro
    return NextResponse.json({
      status: 500,
      error: error instanceof Error ? error.message : "Erro desconhecido ao buscar bairros",
    });
  }
}
