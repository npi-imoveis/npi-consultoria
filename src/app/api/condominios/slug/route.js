import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Garante que a rota seja sempre dinâmica

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const condominioSlug = url.searchParams.get("slug"); // O slug da URL do condomínio (ex: 'fasano-itaim')

    if (!condominioSlug) {
      return NextResponse.json(
        { status: 400, error: "É necessário fornecer o SLUG do condomínio" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // 1. Encontrar todos os imóveis que pertencem a este condomínio (pelo nome do empreendimento)
    //    Assumimos que o campo 'Empreendimento' no Imovel contém o nome do condomínio
    //    e que o 'condominioSlug' é a versão slugificada desse nome.
    //    Usamos regex para buscar de forma flexível (case-insensitive e ignorando hífens/espaços)
    const nomeCondominioRegex = new RegExp(condominioSlug.replace(/-/g, ' '), 'i');

    const todosImoveisDoEmpreendimento = await Imovel.find({
      Empreendimento: { $regex: nomeCondominioRegex }
    }).sort({ Codigo: 1 }); // Ordena para encontrar o de menor código

    if (!todosImoveisDoEmpreendimento || todosImoveisDoEmpreendimento.length === 0) {
      return NextResponse.json(
        { status: 404, error: "Condomínio ou imóveis relacionados não encontrados pelo nome do empreendimento" },
        { status: 404 }
      );
    }

    // 2. Identificar o "imóvel de referência" (o de menor código)
    //    Como já ordenamos por Codigo, o primeiro elemento é o de menor código.
    const imovelReferencia = todosImoveisDoEmpreendimento[0];

    // 3. Buscar TODOS os imóveis que compartilham o MESMO ENDEREÇO e NÚMERO
    //    (incluindo o próprio imóvel de referência, se ele tiver Endereco/Numero)
    if (!imovelReferencia.Endereco || !imovelReferencia.Numero) {
        // Se o imóvel de referência não tem endereço, não podemos agrupar por endereço.
        // Retornamos apenas os imóveis encontrados pelo nome do empreendimento como fallback.
        return NextResponse.json({
            status: 200,
            data: imovelReferencia, // O imóvel de referência
            imoveisRelacionados: todosImoveisDoEmpreendimento, // Todos os imóveis encontrados pelo nome do empreendimento
        });
    }

    const imoveisAgrupadosPorEndereco = await Imovel.find({
      Endereco: imovelReferencia.Endereco,
      Numero: imovelReferencia.Numero,
    }).sort({ Codigo: 1 }); // Opcional: manter ordenação por código

    // 4. Retornar os dados do imóvel de referência e a lista completa de imóveis agrupados por endereço
    return NextResponse.json({
      status: 200,
      data: imovelReferencia, // O imóvel de referência (menor código)
      imoveisRelacionados: imoveisAgrupadosPorEndereco, // Todos os imóveis no mesmo endereço
    });

  } catch (error) {
    console.error("Erro ao buscar condomínio por slug:", error);
    return NextResponse.json(
      {
        status: 500,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
