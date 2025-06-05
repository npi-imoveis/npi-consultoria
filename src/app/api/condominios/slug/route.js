import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const slug = url.searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        {
          status: 400,
          error: "É necessário fornecer o SLUG do imóvel",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const imovelReferencia = await Imovel.findOne({ Slug: slug });

    if (!imovelReferencia) {
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel de referência não encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar se o imóvel possui endereço e número definidos
    if (!imovelReferencia.Endereco || !imovelReferencia.Numero) {
      return NextResponse.json(
        {
          status: 400,
          error: "O imóvel de referência não possui endereço ou número definidos",
        },
        { status: 400 }
      );
    }

    // Buscar todos os imóveis com o mesmo endereço e número
    const imoveisRelacionados = await Imovel.find({
      Endereco: imovelReferencia.Endereco,
      Numero: imovelReferencia.Numero,
    }).sort({ Codigo: 1 });

    // Verificar se encontrou algum imóvel
    if (!imoveisRelacionados || imoveisRelacionados.length === 0) {
      return NextResponse.json(
        {
          status: 404,
          error: "Não foram encontrados imóveis no mesmo endereço",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      data: imovelReferencia,
      imoveisRelacionados: imoveisRelacionados,
    });
  } catch (error) {
    console.error("Erro ao buscar imóvel por slug:", error);
    return NextResponse.json(
      {
        status: 500,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
