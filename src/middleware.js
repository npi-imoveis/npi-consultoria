import { NextResponse } from 'next/server';

// Verifique o caminho correto para estas importações
import dbConnect from '../../lib/dbConnect'; // Caminho relativo ajustado
import Imovel from '../../models/Imovel';    // Caminho relativo ajustado

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin, searchParams } = url;

  console.log(`Middleware processing: ${pathname}`);

  const imovelPattern = /^\/imovel-(\d+)(?:\/?)$/i;
  const match = pathname.match(imovelPattern);
  
  if (!match) {
    return NextResponse.next();
  }

  const id = match[1];
  console.log(`Processing imovel ID: ${id}`);

  try {
    await dbConnect();
    console.log(`Database connected, searching for imovel ${id}`);
    
    const imovel = await Imovel.findOne(
      { Codigo: parseInt(id) },
      { Slug: 1 }
    ).lean();

    if (imovel?.Slug) {
      const newUrl = new URL(`/imovel-${id}/${imovel.Slug}`, origin);
      searchParams.forEach((value, key) => {
        newUrl.searchParams.append(key, value);
      });
      
      console.log(`Redirecting to: ${newUrl.toString()}`);
      return NextResponse.redirect(newUrl, 301);
    }
  } catch (error) {
    console.error(`Error processing imovel ${id}:`, error);
  }

  const buscaUrl = new URL('/busca', origin);
  searchParams.forEach((value, key) => {
    buscaUrl.searchParams.append(key, value);
  });
  
  return NextResponse.redirect(buscaUrl, 302);
}

export const config = {
  matcher: [
    '/imovel-:id(\\d+)',
    '/imovel-:id(\\d+)/',
  ],
};
