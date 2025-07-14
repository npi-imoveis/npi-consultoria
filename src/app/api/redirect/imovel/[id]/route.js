import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const isTrailingSlash = searchParams.get('trailing') === 'true';

  console.log(`🔍 [API REDIRECT] ${isTrailingSlash ? '🔧 TRAILING SLASH' : '📍 NORMAL'} redirect para imóvel ${id}`);

  try {
    await connectToDatabase();

    // Buscar o imóvel pelo código
    const imovel = await Imovel.findOne({ Codigo: id });

    if (!imovel) {
      // Se não encontrar o imóvel, redireciona para a página de busca
      return redirect('/busca');
    }

    // Gerar slug baseado no nome do empreendimento
    const slugBasico = imovel.Slug || 
      (imovel.Empreendimento 
        ? imovel.Empreendimento
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-') // Remove hífens duplos
            .replace(/^-|-$/g, '') // Remove hífens do início e fim
        : `imovel-${id}`);

    // Redirecionar para a URL com slug com status 301 explícito
    const finalUrl = `/imovel-${id}/${slugBasico}`;
    console.log(`🔍 [API REDIRECT] ✅ Redirecionamento DIRETO (301): /imovel-${id}${isTrailingSlash ? '/' : ''} → ${finalUrl}`);
    return NextResponse.redirect(new URL(finalUrl, request.url), 301);

  } catch (error) {
    console.error('Erro ao buscar imóvel para redirecionamento:', error);
    // Em caso de erro, redireciona para slug genérico com status 301
    return NextResponse.redirect(new URL(`/imovel-${id}/imovel-${id}`, request.url), 301);
  }
}