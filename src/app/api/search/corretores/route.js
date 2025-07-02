import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    await connectToDatabase();

    // ALTERAÇÃO FEITA: Mudei de 'text' para 'autocomplete' para uma busca mais flexível e performática por nomes.
    const resultado = await Corretores.aggregate([
      {
        $search: {
          index: "corretores", // Certifique-se que este é o nome correto do seu índice no Atlas
          autocomplete: {
            query: query,
            path: "nomeCompleto", // ALTERAÇÃO FEITA: Especifiquei o campo 'nomeCompleto' para a busca ser mais direta. Se o nome estiver em outro campo, ajuste aqui.
            fuzzy: {
              maxEdits: 1, // Permite um erro de digitação
            },
          },
        },
      },
      {
        $limit: 20,
      },
      // ALTERAÇÃO FEITA: Adicionei um estágio para contar o total de documentos encontrados antes do limite, para a paginação.
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $limit: 20 }], // O limite que você já usava
        },
      },
    ]);

    const data = resultado[0].data;
    const totalItems = resultado[0].metadata[0] ? resultado[0].metadata[0].total : 0;
    const totalPages = Math.ceil(totalItems / 20);

    // ALTERAÇÃO FEITA: Retornando a paginação junto com os dados
    return NextResponse.json({
      status: 200,
      data: data,
      pagination: {
        totalItems,
        totalPages,
        currentPage: 1, // A busca sempre retorna a primeira página
      },
    });
  } catch (error) {
    console.error("Erro na busca:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
