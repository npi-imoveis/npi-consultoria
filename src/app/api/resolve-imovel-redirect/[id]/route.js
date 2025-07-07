import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import Imovel from '@/app/models/Imovel';

export async function GET(request, { params }) {
  const { id } = params;
  
  console.log(`[API-RESOLVE] Resolvendo redirecionamento para ID: ${id}`);
  
  try {
    await connectToDatabase();
    const imovel = await Imovel.findOne({ Codigo: parseInt(id) }).select('Slug Empreendimento').lean();
    
    if (!imovel) {
      console.log(`[API-RESOLVE] Imóvel ${id} não encontrado`);
      return NextResponse.redirect(new URL('/busca', request.url), 302);
    }

    let slug = imovel.Slug;
    
    if (!slug && imovel.Empreendimento) {
      // Gerar slug básico se não existir
      slug = imovel.Empreendimento
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplos
        .replace(/^-|-$/g, '') // Remove hífens do início e fim
        || `imovel-${id}`;
    }

    const redirectUrl = new URL(`/imovel-${id}/${slug}`, request.url);
    console.log(`[API-RESOLVE] Redirecionando para: ${redirectUrl.pathname}`);
    
    return NextResponse.redirect(redirectUrl, 301);

  } catch (error) {
    console.error('[API-RESOLVE] Erro:', error);
    return NextResponse.redirect(new URL('/busca', request.url), 302);
  }
}