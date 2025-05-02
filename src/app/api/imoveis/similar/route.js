import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        {
          status: 400,
          error: "É necessário fornecer o ID do imóvel",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Buscar o imóvel de referência pelo Codigo
    const imovelReferencia = await Imovel.findOne({ Codigo: id });

    if (!imovelReferencia) {
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel de referência não encontrado",
        },
        { status: 404 }
      );
    }

    // Verificar se o imóvel possui área privativa definida
    if (!imovelReferencia.AreaPrivativa) {
      return NextResponse.json(
        {
          status: 400,
          error: "O imóvel de referência não possui área privativa definida",
        },
        { status: 400 }
      );
    }

    // Converter a área privativa para número, removendo qualquer texto não numérico
    const areaReferenciaString = imovelReferencia.AreaPrivativa.toString()
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    const areaReferencia = parseFloat(areaReferenciaString);

    // Definir margem de variação (20%)
    const margemVariacao = areaReferencia * 0.2;
    const areaMinima = areaReferencia - margemVariacao;
    const areaMaxima = areaReferencia + margemVariacao;

    // Verificar se o imóvel possui bairro definido
    if (!imovelReferencia.Bairro) {
      return NextResponse.json(
        {
          status: 400,
          error: "O imóvel de referência não possui bairro definido",
        },
        { status: 400 }
      );
    }

    // Buscar imóveis com área privativa semelhante, no mesmo bairro, excluindo o próprio imóvel de referência
    const imoveisSimilares = await Imovel.find({
      Codigo: { $ne: id },
      Bairro: imovelReferencia.Bairro, // Filtrar pelo mesmo bairro
      AreaPrivativa: { $exists: true, $ne: "" },
      ValorAntigo: { $nin: ["0", ""] },
    })
      .limit(20)
      .lean();

    // Filtrar os resultados em JavaScript para garantir a conversão correta
    const filtrados = imoveisSimilares
      .filter((imovel) => {
        try {
          const areaString = imovel.AreaPrivativa.toString()
            .replace(/[^\d.,]/g, "")
            .replace(",", ".");
          const area = parseFloat(areaString);
          return !isNaN(area) && area >= areaMinima && area <= areaMaxima;
        } catch (e) {
          return false;
        }
      })
      .slice(0, 10);

    return NextResponse.json({
      status: 200,
      data: filtrados,
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis similares:", error);
    return NextResponse.json(
      {
        status: 500,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
