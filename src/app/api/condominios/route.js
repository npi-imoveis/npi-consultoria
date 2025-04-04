import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    console.log("Iniciando busca de condomínios na API");

    // Extrair o parâmetro limit da URL
    const { searchParams } = new URL(request.url);
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
      console.log("Nenhum condomínio encontrado na API");
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    console.log(`Encontrados ${condominios.length} condomínios na API`);

    // Log para depuração
    condominios.forEach((cond, index) => {
      console.log(`Condomínio ${index + 1}: ${cond.Empreendimento || "Sem nome"}`);
    });

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
