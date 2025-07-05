import { NextResponse } from 'next/server';

// Middleware rodará no Edge Runtime (mais rápido)
export const config = {
  runtime: 'edge',
  matcher: [
    '/imovel-:id(\\d+)',
    '/imovel-:id(\\d+)/',
  ],
};

// Função para buscar o slug da API (substitui o Mongoose)
async function fetchSlugFromAPI(id) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/imovel/${id}/slug`);
    if (!response.ok) throw new Error('Slug not found');
    return await response.json();
  } catch (error) {
    console.error('Error fetching slug:', error);
    return null;
  }
}

export default async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin, searchParams } = url;

  const imovelPattern = /^\/imovel-(\d+)(?:\/?)$/i;
  const match = pathname.match(imovelPattern);
  
  if (!match) return NextResponse.next();

  const id = match[1];

  // Busca o slug da API em vez de usar Mongoose diretamente
  const { slug } = await fetchSlugFromAPI(id);

  if (slug) {
    const newUrl = new URL(`/imovel-${id}/${slug}`, origin);
    searchParams.forEach((value, key) => newUrl.searchParams.append(key, value));
    return NextResponse.redirect(newUrl, 301);
  }

  const buscaUrl = new URL('/busca', origin);
  searchParams.forEach((value, key) => buscaUrl.searchParams.append(key, value));
  return NextResponse.redirect(buscaUrl, 302);
}
