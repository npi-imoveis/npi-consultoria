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
    const imovelReferencia = await Imovel.findOne({
      Codigo: id,
      ValorAntigo: {
        $nin: ["", "0"],
        $exists: true
      }
    });

    if (!imovelReferencia) {
      return NextResponse.json(
        {
          status: 404,
          error: "Imóvel de referência não encontrado ou sem valor antigo válido",
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
    const imoveisMesmoEndereco = await Imovel.find({
      Endereco: imovelReferencia.Endereco,
      Numero: imovelReferencia.Numero,
      ValorAntigo: {
        $nin: ["", "0"],
        $exists: true
      }
    });

    // Verificar se encontrou algum imóvel
    if (!imoveisMesmoEndereco || imoveisMesmoEndereco.length === 0) {
      return NextResponse.json(
        {
          status: 404,
          error: "Não foram encontrados imóveis no mesmo endereço com valor antigo válido",
        },
        { status: 404 }
      );
    }

    // Encontrar o imóvel com o menor código
    const imovelMenorCodigo = imoveisMesmoEndereco.reduce((menor, atual) => {
      return parseInt(atual.Codigo) < parseInt(menor.Codigo) ? atual : menor;
    }, imoveisMesmoEndereco[0]);


    return NextResponse.json({
      status: 200,
      data: imovelMenorCodigo,
      imoveisRelacionados: imoveisMesmoEndereco,

    });
  } catch (error) {
    console.error("Erro ao buscar imóvel com o menor código:", error);
    return NextResponse.json(
      {
        status: 500,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
