import { NextResponse } from 'next/server';
import dbConnect from '@lib/dbConnect'; // Usando alias absoluto
import Imovel from '@models/Imovel';    // Usando alias absoluto

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin, searchParams } = url;

  const imovelPattern = /^\/imovel-(\d+)(?:\/?)$/i;
  const match = pathname.match(imovelPattern);
  
  if (!match) return NextResponse.next();

  const id = match[1];

  try {
    await dbConnect();
    const imovel = await Imovel.findOne(
      { Codigo: parseInt(id) },
      { Slug: 1, _id: 0 }
    ).lean();

    if (imovel?.Slug) {
      const newUrl = new URL(`/imovel-${id}/${imovel.Slug}`, origin);
      searchParams.forEach((value, key) => newUrl.searchParams.append(key, value));
      return NextResponse.redirect(newUrl, 301);
    }
  } catch (error) {
    console.error(`Error processing imovel ${id}:`, error);
  }

  const buscaUrl = new URL('/busca', origin);
  searchParams.forEach((value, key) => buscaUrl.searchParams.append(key, value));
  return NextResponse.redirect(buscaUrl, 302);
}

export const config = {
  runtime: 'nodejs',
  matcher: [
    '/imovel-:id(\\d+)',
    '/imovel-:id(\\d+)/',
  ],
};
