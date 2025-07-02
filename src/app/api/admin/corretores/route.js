import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({ status: 200, data: [] });
    }

    await connectToDatabase();

    // --- CÓDIGO DE DIAGNÓSTICO ---
    // Esta busca usa uma expressão regular (regex) para encontrar o nome.
    // Não é a forma mais performática, mas não depende do Atlas Search e serve para testar.
    const resultado = await Corretores.find({
      nomeCompleto: { $regex: query, $options: "i" } // 'i' para ser case-insensitive
    }).limit(20);
    // --- FIM DO CÓDIGO DE DIAGNÓSTICO ---

    // Se o campo for 'nome' em vez de 'nomeCompleto', use a linha abaixo:
    // const resultado = await Corretores.find({ nome: { $regex: query, $options: "i" } }).limit(20);

    const totalItems = resultado.length; // Simples contagem para este teste

    return NextResponse.json({
      status: 200,
      data: resultado,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / 20),
        currentPage: 1,
      },
    });

  } catch (error) {
    console.error("Erro na busca (diagnóstico):", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
