import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros via slug (ex: /busca/comprar/apartamento/guaruja/enseada)
    const finalidade = searchParams.get("finalidade");
    const tipo = searchParams.get("tipo");
    const cidade = searchParams.get("cidade");
    const bairro = searchParams.get("bairro");
    const empreendimento = searchParams.get("empreendimento");

    // Parâmetro de busca livre (q)
    const query = searchParams.get("q");

    await connectToDatabase();

    // Filtro dinâmico para MongoDB
    const filtro = {};
    if (finalidade) filtro.finalidade = finalidade;
    if (tipo) filtro.tipo = tipo;
    if (cidade) filtro.cidade = cidade;
    if (bairro) filtro.bairro = bairro;
    if (empreendimento) filtro.empreendimento = empreendimento;
    if (query) filtro.$text = { $search: query }; // Busca textual

    const resultado = await Imovel.find(filtro).limit(20);

    const response = NextResponse.json({
      status: 200,
      data: resultado,
    });

    // Headers para evitar cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;

  } catch (error) {
    console.error("Erro na busca:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
