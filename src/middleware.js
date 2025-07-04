// middleware.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Imovel from '@/models/Imovel';

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin, searchParams } = url;
  
  // Log para diagnóstico (aparecerá nos logs do Vercel)
  console.log(`Middleware processing: ${pathname}`);
  
  // 1. Verifica se é uma URL de imóvel sem slug ou com barra no final
  const imovelPattern = /^\/imovel-(\d+)(?:\/?)$/i;
  const match = pathname.match(imovelPattern);
  
  if (!match) {
    console.log('Not an imovel URL, skipping middleware');
    return NextResponse.next();
  }

  const id = match[1];
  console.log(`Processing imovel ID: ${id}`);

  try {
    // 2. Conecta ao MongoDB
    await dbConnect();
    console.log(`Database connected, searching for imovel ${id}`);
    
    // 3. Busca apenas o slug no banco de dados
    const imovel = await Imovel.findOne(
      { Codigo: parseInt(id) },
      { Slug: 1 } // Apenas o campo Slug
    ).lean();

    if (imovel?.Slug) {
      // 4. Constrói a nova URL mantendo query params se existirem
      const newUrl = new URL(`/imovel-${id}/${imovel.Slug}`, origin);
      searchParams.forEach((value, key) => {
        newUrl.searchParams.append(key, value);
      });
      
      console.log(`Redirecting to: ${newUrl.toString()}`);
      return NextResponse.redirect(newUrl, 301);
    } else {
      console.warn(`Imovel ${id} not found in database`);
    }
  } catch (error) {
    console.error(`Database error for imovel ${id}:`, error);
  }

  // 5. Fallback para página de busca mantendo query params
  const buscaUrl = new URL('/busca', origin);
  searchParams.forEach((value, key) => {
    buscaUrl.searchParams.append(key, value);
  });
  
  console.log(`Fallback to search page: ${buscaUrl.toString()}`);
  return NextResponse.redirect(buscaUrl, 302);
}

export const config = {
  matcher: [
    '/imovel-:id(\\d+)',      // /imovel-1715
    '/imovel-:id(\\d+)/',     // /imovel-1715/
  ],
};
