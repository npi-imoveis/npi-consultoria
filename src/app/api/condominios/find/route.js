import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    console.error(`[API-CONDOMINIOS-FIND] ====== CHAMADA RECEBIDA ======`);
    console.error(`[API-CONDOMINIOS-FIND] ID recebido: ${id}`);
    console.error(`[API-CONDOMINIOS-FIND] Referrer: ${request.headers.get('referer') || 'N/A'}`);

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

    const imovelReferencia = await Imovel.findOne({
      Codigo: id,
    });

    if (!imovelReferencia) {
      return NextResponse.json(
        {
          status: 204,
          error: "Imóvel de referência não encontrado",
        },
        { status: 204 }
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
    });

    // Verificar se encontrou algum imóvel
    if (!imoveisMesmoEndereco || imoveisMesmoEndereco.length === 0) {
      return NextResponse.json(
        {
          status: 404,
          error: "Não foram encontrados imóveis no mesmo endereço",
        },
        { status: 404 }
      );
    }

    // Priorizar imóvel com Condominio: "Sim"
    const imovelCondominio = imoveisMesmoEndereco.find((imovel) => imovel.Condominio === "Sim");
    const imovelMenorCodigo = imoveisMesmoEndereco.reduce((menor, atual) => {
      return parseInt(atual.Codigo) < parseInt(menor.Codigo) ? atual : menor;
    }, imoveisMesmoEndereco[0]);

    return NextResponse.json({
      status: 200,
      data: imovelCondominio || imovelMenorCodigo,
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
