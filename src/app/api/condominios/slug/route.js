import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const slug = searchParams.get("slug");

    console.log(`[API-CONDOMINIOS-SLUG] ====== CHAMADA RECEBIDA ======`);
    console.log(`[API-CONDOMINIOS-SLUG] Slug recebido: ${slug}`);
    console.log(`[API-CONDOMINIOS-SLUG] User-Agent: ${request.headers.get('user-agent')?.substring(0, 50)}...`);
    console.log(`[API-CONDOMINIOS-SLUG] Referrer: ${request.headers.get('referer') || 'N/A'}`);

    if (!slug) {
      return NextResponse.json(
        {
          status: 400,
          error: "É necessário fornecer o SLUG do imóvel",
        },
        { status: 400 }
      );
    }

    // Detectar e rejeitar slugs no formato imovel-{id}
    if (slug.match(/^imovel-\d+$/)) {
      console.log(`[API-CONDOMINIOS-SLUG] Rejeitando slug de imóvel: ${slug}`);
      return NextResponse.json(
        {
          status: 404,
          error: "Slug de imóvel detectado - não é um slug de condomínio",
        },
        { status: 404 }
      );
    }

    await connectToDatabase();

    // --- MODIFICAÇÃO AQUI: Buscar o imóvel de referência com Condominio: "Sim" ---
    let imovelReferencia = await Imovel.findOne({
      Slug: slug,
      Condominio: "Sim" // <--- Adicionando a condição para o campo Condominio
    });

    // Fallback: Se não encontrar com Condominio: "Sim", tenta encontrar apenas pelo Slug
    // e pega o de menor código, como era a lógica anterior.
    // Isso é importante para não quebrar páginas antigas ou casos onde o campo Condominio não está preenchido.
    if (!imovelReferencia) {
      console.warn(`Aviso: Imóvel principal para o slug ${slug} não encontrado com Condominio: "Sim". Tentando fallback com menor Codigo.`);
      imovelReferencia = await Imovel.findOne({ Slug: slug }).sort({ Codigo: 1 });
    }

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
      // Se não encontrar imóveis relacionados, ainda retorna o imóvel de referência
      // mas com a lista de relacionados vazia.
      return NextResponse.json({
        status: 200,
        data: imovelReferencia,
        imoveisRelacionados: [],
      });
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
