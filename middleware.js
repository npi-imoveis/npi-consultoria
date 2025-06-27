// middleware.js

import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Checa se o caminho começa com /imovel- e possui apenas o ID sem slug
  const match = pathname.match(/^\/imovel-(\d+)\/?$/);

  if (match) {
    const id = match[1];

    // Redireciona para a rota que cairá no app/imovel/[id]/[slug]/page.js
    // onde você já tem a lógica para buscar o slug correto e redirecionar automaticamente
    return NextResponse.redirect(new URL(`/imovel/${id}/`, request.nextUrl.origin));
  }

  // Se não casar, segue normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/imovel-:path*',
  ],
};
