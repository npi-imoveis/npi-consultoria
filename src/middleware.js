// middleware.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';  // Sua conexão com o MongoDB
import Imovel from '@/models/Imovel';     // Seu modelo do Mongoose

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin } = url;

  // Captura **apenas** URLs no formato `/imovel-123` ou `/imovel-123/`
  const match = pathname.match(/^\/imovel-(\d+)\/?$/);
  if (!match) return NextResponse.next(); // Ignora outras rotas

  const id = match[1];

  try {
    await dbConnect();
    const imovel = await Imovel.findOne({ Codigo: parseInt(id) }).select('Slug').lean();

    if (imovel?.Slug) {
      // **Redireciona 301 (Permanente) para a URL correta**
      return NextResponse.redirect(new URL(`/imovel-${id}/${imovel.Slug}`, origin), 301);
    }
  } catch (error) {
    console.error('Erro no middleware:', error);
  }

  // Fallback para página de busca se não encontrar o imóvel
  return NextResponse.redirect(new URL('/busca', origin), 302);
}

// **Garante que o middleware só execute para URLs de imóvel quebradas**
export const config = {
  matcher: ['/imovel-:id(\\d+)', '/imovel-:id(\\d+)/'],
};
