// middleware.js
export function middleware(request) {
  console.log("🧠 Middleware executado para:", request.nextUrl.pathname);
  // ...
}
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ✅ 1. Intercepta /imovel-123/ (sem slug) → reescreve para /imovel-123/__
  if (pathname.match(/^\/imovel-(\d+)\/?$/)) {
    const [, id] = pathname.match(/^\/imovel-(\d+)\/?$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/__`;

    return NextResponse.rewrite(url);
  }

  // ✅ 2. Intercepta /imovel-123/nome-do-imovel → reescreve internamente para /imovel/123/nome-do-imovel
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;

    return NextResponse.rewrite(url);
  }

  // ✅ 3. Intercepta /imovel/123/nome-do-imovel → redireciona para /imovel-123/nome-do-imovel
  if (pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/)) {
    const [, id, slug] = pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/);

    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;

    return NextResponse.redirect(url);
  }

  // ✅ 4. Passa adiante se não for nenhuma das rotas acima
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/imovel-:id/:slug*",     // cobre /imovel-9507/ e /imovel-9507/slug
    "/imovel/:id/:slug*",     // cobre /imovel/9507/slug
  ],
};
