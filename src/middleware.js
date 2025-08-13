// middleware.js - VERSÃO UNIVERSAL: 404 → 301 HOME
import { NextResponse } from "next/server";
import { getCityValidSlugsSync, converterSlugCidadeSync } from "@/app/utils/url-slugs";

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin } = url;

  console.log(`🔍 [MIDDLEWARE] =================== INÍCIO ===================`);
  console.log(`🔍 [MIDDLEWARE] Processando: ${pathname}`);

  // 🚨 MELHORIA: URLs com caracteres especiais ou malformadas → HOME
  try {
    // Teste se a URL é válida
    decodeURIComponent(pathname);
  } catch (error) {
    console.log(`🔍 [MIDDLEWARE] 🏠 URL malformada → HOME: ${pathname}`);
    return NextResponse.redirect(new URL('/', origin), 301);
  }

  // 🚨 CORREÇÃO: TRAILING SLASH (resolverá 367 URLs)
  if (pathname.endsWith('/') && pathname.length > 1) {
    const withoutTrailingSlash = pathname.slice(0, -1);
    console.log(`🔍 [MIDDLEWARE] 🚨 TRAILING SLASH: ${pathname} → ${withoutTrailingSlash}`);
    
    const redirectUrl = new URL(withoutTrailingSlash, origin);
    url.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(redirectUrl, 301);
  }

  // ✅ FORMATO INCORRETO: /imovel/ID/slug → /imovel-ID/slug
  const formatoErradoMatch = pathname.match(/^\/imovel\/(\d+)\/(.+)$/);
  if (formatoErradoMatch) {
    const [, id, slug] = formatoErradoMatch;
    const formatoCorreto = `/imovel-${id}/${slug}`;
    console.log(`🔍 [MIDDLEWARE] ❌ Formato incorreto: ${pathname} → ${formatoCorreto}`);
    return NextResponse.redirect(new URL(formatoCorreto, origin), 301);
  }

  // ✅ IMÓVEIS SEM SLUG: /imovel-ID → /imovel-ID/slug
  const imovelMatch = pathname.match(/^\/imovel-(\d+)$/);
  if (imovelMatch) {
    const id = imovelMatch[1];
    console.log(`🔍 [MIDDLEWARE] 🔧 Imóvel sem slug: ${pathname}`);
    
    try {
      const apiUrl = new URL(`/api/imoveis/${id}`, origin);
      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        const imovel = data.data;
        
        if (imovel?.Slug) {
          const finalUrl = `/imovel-${id}/${imovel.Slug}`;
          console.log(`🔍 [MIDDLEWARE] ✅ Redirect para slug: ${pathname} → ${finalUrl}`);
          return NextResponse.redirect(new URL(finalUrl, origin), 301);
        } else if (imovel?.Empreendimento) {
          const slugGerado = imovel.Empreendimento
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '') || `imovel-${id}`;
          
          const finalUrl = `/imovel-${id}/${slugGerado}`;
          console.log(`🔍 [MIDDLEWARE] ✅ Redirect slug gerado: ${pathname} → ${finalUrl}`);
          return NextResponse.redirect(new URL(finalUrl, origin), 301);
        }
      }
    } catch (error) {
      console.error('🔍 [MIDDLEWARE] ❌ Erro API:', error.message);
    }
    
    // 🎯 SOLUÇÃO UNIVERSAL: Se imóvel não existe → HOME
    console.log(`🔍 [MIDDLEWARE] 🏠 Imóvel não encontrado → HOME: ${pathname}`);
    return NextResponse.redirect(new URL('/', origin), 301);
  }

  // ✅ URLs SEO-FRIENDLY: /buscar/finalidade/categoria/cidade
  const seoMatch = pathname.match(/^\/buscar\/([^\/]+)\/([^\/]+)\/([^\/]+)(.*)$/);
  if (seoMatch) {
    const [, finalidade, categoria, cidade, restPath] = seoMatch;
    
    const cidadesValidas = getCityValidSlugsSync();
    const finalidadesValidas = ['compra', 'venda', 'aluguel'];
    const categoriasValidas = [
      'apartamentos', 'casas', 'casas-comerciais', 'casas-em-condominio', 
      'coberturas', 'flats', 'gardens', 'lofts', 'lojas', 
      'predios-comerciais', 'salas-comerciais', 'sobrados', 'terrenos'
    ];
    
    if (cidadesValidas.includes(cidade) && finalidadesValidas.includes(finalidade) && categoriasValidas.includes(categoria)) {
      console.log(`🔍 [MIDDLEWARE] ✅ URL SEO-friendly: /buscar/${finalidade}/${categoria}/${cidade}${restPath}`);
      
      const parametrosUrl = { finalidade, categoria, cidade };
      
      if (restPath && restPath.length > 1) {
        const params = restPath.substring(1).split('/').filter(p => p.length > 0);
        params.forEach((param, index) => {
          if (param.includes('+')) {
            parametrosUrl.bairros = param;
          } else if (param.includes('-quarto')) {
            parametrosUrl.quartos = param;
          } else if (param.includes('mil') || param.includes('ate-') || param.includes('acima-')) {
            parametrosUrl.preco = param;
          } else if (index === 0 && !param.includes('-quarto') && !param.includes('mil')) {
            parametrosUrl.bairros = param;
          }
        });
      }
      
      const filtros = {
        cidadeSelecionada: '', finalidade: '', categoriaSelecionada: '',
        bairrosSelecionados: [], quartos: null, precoMin: null, precoMax: null
      };

      const MAPEAMENTO_CATEGORIAS = {
        'apartamentos': 'Apartamento', 'casas': 'Casa', 'casas-comerciais': 'Casa Comercial',
        'casas-em-condominio': 'Casa em Condominio', 'coberturas': 'Cobertura',
        'flats': 'Flat', 'gardens': 'Garden', 'lofts': 'Loft', 'lojas': 'Loja',
        'predios-comerciais': 'Prédio Comercial', 'salas-comerciais': 'Sala Comercial',
        'sobrados': 'Sobrado', 'terrenos': 'Terreno'
      };

      const MAPEAMENTO_FINALIDADES = {
        'compra': 'Comprar', 'venda': 'Comprar', 'aluguel': 'Alugar'
      };

      filtros.cidadeSelecionada = converterSlugCidadeSync(parametrosUrl.cidade);
      filtros.finalidade = MAPEAMENTO_FINALIDADES[parametrosUrl.finalidade] || parametrosUrl.finalidade;
      filtros.categoriaSelecionada = MAPEAMENTO_CATEGORIAS[parametrosUrl.categoria] || parametrosUrl.categoria;

      if (parametrosUrl.bairros) {
        filtros.bairrosSelecionados = parametrosUrl.bairros.split('+').map(bairroSlug => {
          return bairroSlug.split('-').map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1)).join(' ');
        });
      }

      if (parametrosUrl.quartos) {
        if (parametrosUrl.quartos === '1-quarto') {
          filtros.quartos = 1;
        } else {
          const match = parametrosUrl.quartos.match(/^(\d+)-quartos$/);
          if (match) filtros.quartos = parseInt(match[1]);
        }
      }

      if (parametrosUrl.preco) {
        const converterValor = (valorStr) => {
          if (valorStr.includes('mi')) return parseFloat(valorStr.replace('mi', '')) * 1000000;
          if (valorStr.includes('mil')) return parseFloat(valorStr.replace('mil', '')) * 1000;
          return parseFloat(valorStr);
        };
        
        if (parametrosUrl.preco.startsWith('ate-')) {
          filtros.precoMax = converterValor(parametrosUrl.preco.replace('ate-', ''));
        } else if (parametrosUrl.preco.startsWith('acima-')) {
          filtros.precoMin = converterValor(parametrosUrl.preco.replace('acima-', ''));
        } else if (parametrosUrl.preco.includes('-')) {
          const [minStr, maxStr] = parametrosUrl.preco.split('-');
          filtros.precoMin = converterValor(minStr);
          filtros.precoMax = converterValor(maxStr);
        }
      }
      
      const rewriteUrl = new URL('/busca', request.url);
      if (filtros.cidadeSelecionada) rewriteUrl.searchParams.set('cidade', filtros.cidadeSelecionada);
      if (filtros.finalidade) rewriteUrl.searchParams.set('finalidade', filtros.finalidade);
      if (filtros.categoriaSelecionada) rewriteUrl.searchParams.set('categoria', filtros.categoriaSelecionada);
      if (filtros.bairrosSelecionados?.length) rewriteUrl.searchParams.set('bairros', filtros.bairrosSelecionados.join(','));
      if (filtros.quartos) rewriteUrl.searchParams.set('quartos', filtros.quartos.toString());
      if (filtros.precoMin) rewriteUrl.searchParams.set('precoMin', filtros.precoMin.toString());
      if (filtros.precoMax) rewriteUrl.searchParams.set('precoMax', filtros.precoMax.toString());
      
      console.log(`🔍 [MIDDLEWARE] ⚡ Rewrite: ${rewriteUrl.toString()}`);
      return NextResponse.rewrite(rewriteUrl);
    } else {
      // 🎯 NOVA MELHORIA: URLs SEO inválidas → HOME
      console.log(`🔍 [MIDDLEWARE] 🏠 URL SEO inválida → HOME: ${pathname}`);
      return NextResponse.redirect(new URL('/', origin), 301);
    }
  }

  // ✅ IMÓVEIS COM SLUG: Verificar se slug está correto
  const imovelComSlugMatch = pathname.match(/^\/imovel-(\d+)\/(.+)$/);
  if (imovelComSlugMatch) {
    const [, id, currentSlug] = imovelComSlugMatch;
    console.log(`🔍 [MIDDLEWARE] ✅ Imóvel com slug: ID=${id}, SLUG=${currentSlug}`);

    try {
      const apiUrl = new URL(`/api/imoveis/${id}`, origin);
      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        const imovel = data.data;
        
        // Se imóvel não existe ou está inativo → HOME
        if (!imovel || imovel.Ativo !== 'Sim') {
          console.log(`🔍 [MIDDLEWARE] 🏠 Imóvel inativo/inexistente → HOME: ${pathname}`);
          return NextResponse.redirect(new URL('/', origin), 301);
        }
        
        // Se slug está desatualizado → slug correto
        if (imovel.Slug && imovel.Slug !== currentSlug) {
          const correctUrl = `/imovel-${id}/${imovel.Slug}`;
          console.log(`🔍 [MIDDLEWARE] ✅ Slug antigo → correto: ${currentSlug} → ${imovel.Slug}`);
          return NextResponse.redirect(new URL(correctUrl, origin), 301);
        }
      } else {
        // 🎯 SOLUÇÃO UNIVERSAL: API retornou erro → HOME
        console.log(`🔍 [MIDDLEWARE] 🏠 API erro (${response.status}) → HOME: ${pathname}`);
        return NextResponse.redirect(new URL('/', origin), 301);
      }
    } catch (error) {
      console.error('🔍 [MIDDLEWARE] ❌ Erro verificação:', error.message);
      // 🎯 SOLUÇÃO UNIVERSAL: Erro na verificação → HOME
      console.log(`🔍 [MIDDLEWARE] 🏠 Erro técnico → HOME: ${pathname}`);
      return NextResponse.redirect(new URL('/', origin), 301);
    }
    
    // Se chegou aqui, imóvel existe e slug está correto → rewrite
    console.log(`🔍 [MIDDLEWARE] 🔄 Rewrite: /imovel/${id}/${currentSlug}`);
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/imovel/${id}/${currentSlug}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // 🎯 MELHORIA: Lista expandida de URLs válidas (páginas que realmente existem)
  const urlsValidas = [
    '/',
    '/busca', 
    '/sobre', 
    '/contato', 
    '/politica-de-privacidade', 
    '/termos-de-uso',
    '/venda-seu-imovel', 
    '/sobre/hub-imobiliarias', 
    '/sobre/npi-imoveis', 
    '/sobre/nossos-servicos',
    '/admin',
    '/login',
    '/cadastro',
    '/recuperar-senha'
  ];

  // 🎯 MELHORIA: URLs que devem ser permitidas (patterns)
  const padroesPemitidos = [
    /^\/api\//,           // APIs
    /^\/admin\//,         // Admin routes
    /^\/_next\//,         // Next.js assets
    /^\/favicon\./,       // Favicons
    /^\/robots\.txt$/,    // Robots
    /^\/sitemap/,         // Sitemaps
    /^\/.*\.(ico|png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot)$/  // Assets estáticos
  ];

  // Verificar se URL é válida por lista ou pattern
  const urlPermitida = urlsValidas.includes(pathname) || 
                      padroesPemitidos.some(pattern => pattern.test(pathname));

  if (!urlPermitida) {
    // 🎯 SOLUÇÃO UNIVERSAL MELHORADA: Qualquer URL não reconhecida → HOME
    console.log(`🔍 [MIDDLEWARE] 🏠 URL não reconhecida → HOME: ${pathname}`);
    return NextResponse.redirect(new URL('/', origin), 301);
  }

  console.log(`🔍 [MIDDLEWARE] ➡️ Seguindo normalmente: ${pathname}`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt
     * - sitemap.xml
     * Also excludes files with extensions (assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap|.*\\..*).*)',
  ],
};
