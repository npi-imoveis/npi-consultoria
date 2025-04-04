import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { cidade } = params;
  const url = new URL(request.url);

  // Extrair parâmetro de categoria da query
  const categoria = url.searchParams.get("categoria");

  try {
    // Conectar ao banco de dados
    await connectToDatabase();

    // Definir a condição de busca usando o parâmetro de cidade
    let condition: any = { Cidade: decodeURIComponent(cidade) };

    // Adicionar filtro de categoria se estiver presente
    if (categoria) {
      condition.Categoria = categoria;
      console.log(
        `Filtrando bairros por cidade: ${decodeURIComponent(cidade)} e categoria: ${categoria}`
      );
    } else {
      console.log(`Buscando bairros para a cidade: ${decodeURIComponent(cidade)}`);
    }

    // Buscar bairros distintos com base na condição
    const bairros = await Imovel.distinct("BairroComercial", condition);

    // Filtrar bairros vazios e ordená-los
    const bairrosFiltrados = bairros
      .filter((bairro) => bairro && bairro.trim() !== "")
      .sort((a, b) => a.localeCompare(b));

    console.log(
      `Encontrados ${bairrosFiltrados.length} bairros para a cidade ${decodeURIComponent(cidade)}${
        categoria ? ` e categoria ${categoria}` : ""
      }`
    );

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
