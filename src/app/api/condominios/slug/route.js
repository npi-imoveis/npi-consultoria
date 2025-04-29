import { connectToDatabase } from "@/app/lib/mongodb";
import ImovelAtivo from "@/app/models/ImovelAtivo";
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

    const imovelReferencia = await ImovelAtivo.findOne({ Slug: slug });

    if (!imovelReferencia) {
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel de referência não encontrado",
        },
        { status: 404 }
      );
    }

    const imoveisRelacionados = await ImovelAtivo.find({
      Endereco: imovelReferencia.Endereco,
      Numero: imovelReferencia.Numero,
      _id: { $ne: imovelReferencia._id }, // Excluir o imóvel de referência
    }).sort({ Codigo: 1 });

    const todosImoveis = [imovelReferencia, ...imoveisRelacionados];

    return NextResponse.json({
      status: 200,
      data: imovelReferencia,
      imoveisRelacionados: todosImoveis,
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
