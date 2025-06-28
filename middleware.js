// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Verifica se a URL segue o padrão /imovel-:id (sem slug)
  // Ex: /imovel-123
  if (pathname.match(/^\/imovel-([^\/]+)$/)) {
    // Extrai o ID da URL
    const [, id] = pathname.match(/^\/imovel-([^\/]+)$/);
    
    // Aqui você precisará buscar o slug correto para este ID
    // Isso pode vir de uma API, banco de dados ou outro serviço
    // Exemplo fictício - substitua pela sua lógica real
    const slugCorreto = await getSlugPorId(id);
    
    if (slugCorreto) {
      // Cria a nova URL com formato completo
      const url = request.nextUrl.clone();
      url.pathname = `/imovel-${id}/${slugCorreto}`;
      
      // Redireciona 301 (permanente) ou 302 (temporário)
      return NextResponse.redirect(url, 301);
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
    // Intercepta rotas como /imovel-123 (sem slug)
    "/imovel-:id",
    // Intercepta rotas como /imovel-123/nome-do-imovel
    "/imovel-:id/:slug*",
    // Também intercepta rotas como /imovel/123/nome-do-imovel para redirecionar
    "/imovel/:id/:slug*",
  ],
};

// Função auxiliar para buscar o slug correto pelo ID
// Substitua por sua implementação real
async function getSlugPorId(id) {
  // Exemplo: você pode buscar de uma API ou banco de dados
  // const response = await fetch(`https://api.exemplo.com/imoveis/${id}`);
  // const data = await response.json();
  // return data.slug;
  
  // Exemplo estático para demonstração
  const slugsPorId = {
    '9507': 'avenida-antonio-joaquim-de-moura-andrade-597',
    // Adicione outros mapeamentos conforme necessário
  };
  
  return slugsPorId[id] || null;
}
