// middleware.js
//
// Este middleware intercepta requisições para rotas de imóveis e garante que URLs incompletas (ex: /imovel-123) sejam redirecionadas para a URL completa com slug (ex: /imovel-123/helbor-brooklin).
// Isso é fundamental para SEO, pois milhares de URLs antigas sem slug estão indexadas no Google. O middleware busca o slug correto diretamente no MongoDB e faz o redirecionamento 301 para a URL canônica.
// Também mantém as regras já existentes para normalização de rotas entre /imovel-:id/:slug e /imovel/:id/:slug.
//
import { NextResponse } from "next/server";

// Importação dinâmica para evitar problemas de dependência no edge
const dynamicImport = (path) => import(path);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Redireciona /imovel-:id (sem slug) para /imovel-:id/:slug
  const matchIdOnly = pathname.match(/^\/imovel-([^\/]+)$/);
  if (matchIdOnly) {
    const id = matchIdOnly[1];
    try {
      // Importa conexão e model dinamicamente
      const { connectToDatabase } = await dynamicImport("@/app/lib/mongodb");
      const ImovelAtivo = (await dynamicImport("@/app/models/ImovelAtivo")).default;
      await connectToDatabase();
      // Busca imóvel pelo campo Codigo
      const imovel = await ImovelAtivo.findOne({ Codigo: id }).select("Slug slug").lean();
      const slug = imovel?.Slug || imovel?.slug;
      if (slug) {
        const url = request.nextUrl.clone();
        url.pathname = `/imovel-${id}/${slug}`;
        return NextResponse.redirect(url, 301);
      }
    } catch (e) {
      // Se der erro, segue fluxo normal (404)
    }
  }

  // Verifica se a URL segue o padrão /imovel-:id/:slug
  // Ex: /imovel-123/apartamento-centro
  if (pathname.match(/^\/imovel-([^\/]+)\/(.+)$/)) {
    // Extrai o ID e o slug da URL
    const [, id, slug] = pathname.match(/^\/imovel-([^\/]+)\/(.+)$/);

    // Cria a nova URL interna para processamento
    const url = request.nextUrl.clone();
    url.pathname = `/imovel/${id}/${slug}`;

    // Reescreve a URL internamente sem mudar a URL visível para o usuário
    return NextResponse.rewrite(url);
  }

  // Se alguém acessar diretamente o formato /imovel/:id/:slug, redireciona para /imovel-:id/:slug
  if (pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/)) {
    // Extrai o ID e o slug da URL
    const [, id, slug] = pathname.match(/^\/imovel\/([^\/]+)\/(.+)$/);

    // Cria a nova URL com o formato correto para exibição
    const url = request.nextUrl.clone();
    url.pathname = `/imovel-${id}/${slug}`;

    // Redireciona para a URL no formato correto (visível para o usuário)
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercepta rotas como /imovel-123/nome-do-imovel
    "/imovel-:id/:slug*",
    // Também intercepta rotas como /imovel/123/nome-do-imovel para redirecionar
    "/imovel/:id/:slug*",
    // Agora intercepta também rotas /imovel-:id (sem slug)
    "/imovel-:id",
  ],
};
