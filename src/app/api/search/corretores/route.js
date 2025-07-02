import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  // Log para sabermos que a API foi chamada
  console.log(`API /api/search/corretores foi chamada com o termo: ${query}`);

  // Teste Fixo: Se buscar por "Rubens", retorna um dado fixo.
  if (query && query.toLowerCase().includes("rubens")) {
    const fakeData = {
      status: 200,
      data: [
        {
          _id: "FAKE_ID_123",
          nome: "Rubens Santoro (API FUNCIONOU!)",
          email: "api.funcionou@test.com",
          celular: "11-99999-8888",
          codigoD: "TESTE-102",
        },
      ],
      pagination: { totalItems: 1, totalPages: 1, currentPage: 1 },
    };
    // Log do que estamos retornando
    console.log("Retornando dados FAKES:", JSON.stringify(fakeData, null, 2));
    return NextResponse.json(fakeData);
  }

  // Se não for "Rubens", retorna vazio.
  console.log("Termo não é 'Rubens', retornando array vazio.");
  return NextResponse.json({ status: 200, data: [] });
}
