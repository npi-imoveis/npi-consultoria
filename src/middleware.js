// middleware.js - VERSÃO CORRIGIDA: Imóveis Vendidos OK | Condomínios OK | Deletados → HOME + CORREÇÕES GSC
import { NextResponse } from "next/server";
import { getCityValidSlugsSync, converterSlugCidadeSync } from "@/app/utils/url-slugs";

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin, searchParams } = url;
  const userAgent = request.headers.get('user-agent') || '';

  console.log(`🔍 [MIDDLEWARE] =================== INÍCIO ===================`);
  console.log(`🔍 [MIDDLEWARE] Processando: ${pathname}`);
  
  // 🚨 DEBUG: Log específico para iConatusIframe
  if (pathname.includes('iConatusIframe')) {
    console.log(`🚨 [DEBUG-IFRAME] Detectado iConatusIframe: ${pathname}`);
  }
  
  // 🚨 RASTREAMENTO DETALHADO: URLs problemáticas específicas do CSV
  const urlsProblematicas = [
    'imovel-106524/facebook.com/npiimoveis',
    'imovel-1685/facebook.com/npiimoveis', 
    'imovel-4879/facebook.com/npiimoveis',
    'imovel-106337/instagram.com/npi_imoveis',
    'imovel-106939/indexdata/index.swf'
  ];
  
  const isUrlProblematica = urlsProblematicas.some(url => pathname.includes(url));
  if (isUrlProblematica) {
    console.log(`🚨🚨🚨 [MIDDLEWARE] URL PROBLEMÁTICA DETECTADA: ${pathname}`);
    console.log(`🚨🚨🚨 [MIDDLEWARE] User-Agent: ${userAgent.substring(0, 100)}`);
    console.log(`🚨🚨🚨 [MIDDLEWARE] Is GoogleBot: ${isGoogleBot}`);
    console.log(`🚨🚨🚨 [MIDDLEWARE] Referer: ${request.headers.get('referer') || 'N/A'}`);
  }

  // 🚨 REDIRECTS VERCEL.JSON → MIDDLEWARE (resolver conflito com noindex)
  const REDIRECTS_MAP = {
    '/maison-dor-cobertura-em-moema': '/maison-dor-moema',
    '/rua-bela-cintra-2060': '/edificio-uirapuru-bela-cintra-2060',
    '/rua-luiz-galhanone-528': '/residencial-reserva-do-visconde',
    '/edificio-ritz-vila-nova-conceicao-cobertura': '/condominio-ritz-vila-nova',
    '/ritz-vila-nova': '/condominio-ritz-vila-nova',
    '/maison-jolie-jardins': '/condominio-edificio-maison-jolie',
    '/rua-cacapava-83': '/taormina-jardim-america',
    '//rua-lopes-neto-56': '/royal-palace-itaim-bibi',
    '/sierra-branca-moema-ibijau-229': '/sierra-blanca-moema',
    '/rua-gabriele-dannunzio-183': '/condominio-authentique-campo-belo',
    '/rua-clodomiro-amazonas-1256': '/condominio-san-juan',
    '/condominio-metropolitan': '/metropolitan-ibirapuera',
    '/avenida-antonio-joaquim-de-moura-andrade-597': '/edificio-maison-adriana',
    '/gran-ville-guaruja': '/condominio-granville-enseada',
    '/avenida-marjory-da-silva-prado-2605': '/jardim-pernambuco-ii',
    '/casas-a-venda-no-condominio-granville-guaruja': '/condominio-granville-enseada',
    '/condominio-granville': '/condominio-granville-enseada',
    '/casas-a-venda-na-peninsula-guaruja': '/condominio-peninsula-guaruja-enseada',
    '/avenida-amarilis-50': '/amarilis-50-cidade-jardim',
    '/rua-pedroso-alvarenga-121': '/residencial-piata',
    '/alameda-ministro-rocha-azevedo-1368': '/edificio-guararapes-jardim-america',
    '/edificio-michelangelo': '/edificio-michelangelo-moema',
    '/edificio-isaura': '/edificio-isaura-pinheiros-sao-paulo',
    '/rua-cristiano-viana-1211': '/4x4-pinheiros',
    '/condominio-edificio-villa-adriana': '/edificio-villa-adriana',
    '/avenida-jamaris-603': '/edificio-michelangelo',
    '/east-blue': '/east-blue-residences-tatuape',
    '/casas-em-condominio-gramado': '/casa-punta-gramado-rs',
    '/e-side-vila-madalena-rua-girassol1280': '/e-side-vila-madalena',
    '/edificio-itanhanga-santana': '/condominio-itanhanga',
    '/residencial-azul': '/azul-idea-zarvos',
    '/the-frame-vila-nova': '/the-frame-vila-nova-conceicao',
    '/ibi-ara': '/condominio-ibi-aram',
    '/residencial-jequitibas': '/condominio-portal-do-jequitiba-valinhos',
    '/condominio-campo-de-toscana-vinhedo-enderecobarao-de-iguatemi': '/residencial-campo-de-toscana-vinhedo',
    '/barao-de-iguatemi': '/edificio-barao-de-iguatemi',
    '/residencial-platinum': '/platinum-morumbi',
    '/residencial-malaga': '/malaga-analia-franco',
    '/edificio-tiffany': '/tiffany-analia-franco',
    '/medplex': '/thera-ibirapuera-by-yoo',
    '/residencial-montblanc': '/montblanc-tatuape',
    '/empreendimento-praca-henrique-monteiro': '/praca-henrique-monteiro',
    '/j-h-s-f-fasano-residences-cidade-jardim': '/fasano-cidade-jardim',
    '/rua-sebastiao-cardoso-168': '/condominio-santorini-residencial-club',
    '/condominio-residencial-santorini': '/condominio-santorini-residencial-club',
    '/rua-verbo-divino-1061': '/reserva-granja-julieta',
    '/grand-habitarte-brooklin': '/grand-habitarte',
    '/habitarte-2-brooklin': '/habitarte-2',
    '/one-sixty-vila-olimpia': '/one-sixty',
    '/one-sixty-cyrela-by-yoo': '/one-sixty',
    '/acapulco-guaruja-condominio': '/condominio-jardim-acapulco',
    '/casa-a-venda-condominio-acapulco': '/condominio-jardim-acapulco',
    '/casa-a-venda-jardim-acapulco-guaruja': '/condominio-jardim-acapulco',
    '/residencial-acapulco-guaruja': '/condominio-jardim-acapulco',
    // Adicionar versões com trailing slash
    '/maison-dor-cobertura-em-moema/': '/maison-dor-moema',
    '/condominio-edificio-villa-adriana/': '/edificio-villa-adriana',
    '/avenida-jamaris-603/': '/edificio-michelangelo',
    '/east-blue/': '/east-blue-residences-tatuape',
    '/casas-em-condominio-gramado/': '/casa-punta-gramado-rs',
    '/e-side-vila-madalena-rua-girassol1280/': '/e-side-vila-madalena',
    '/edificio-itanhanga-santana/': '/condominio-itanhanga',
    '/residencial-azul/': '/azul-idea-zarvos',
    '/the-frame-vila-nova/': '/the-frame-vila-nova-conceicao',
    '/ibi-ara/': '/condominio-ibi-aram',
    '/residencial-jequitibas/': '/condominio-portal-do-jequitiba-valinhos',
    '/condominio-campo-de-toscana-vinhedo-enderecobarao-de-iguatemi/': '/residencial-campo-de-toscana-vinhedo',
    '/barao-de-iguatemi/': '/edificio-barao-de-iguatemi',
    '/residencial-platinum/': '/platinum-morumbi',
    '/residencial-malaga/': '/malaga-analia-franco',
    '/edificio-tiffany/': '/tiffany-analia-franco',
    '/medplex/': '/thera-ibirapuera-by-yoo',
    '/residencial-montblanc/': '/montblanc-tatuape',
    '/empreendimento-praca-henrique-monteiro/': '/praca-henrique-monteiro',
    '/j-h-s-f-fasano-residences-cidade-jardim/': '/fasano-cidade-jardim',
    '/rua-sebastiao-cardoso-168/': '/condominio-santorini-residencial-club',
    '/condominio-residencial-santorini/': '/condominio-santorini-residencial-club',
    '/rua-verbo-divino-1061/': '/reserva-granja-julieta',
    '/grand-habitarte-brooklin/': '/grand-habitarte',
    '/habitarte-2-brooklin/': '/habitarte-2',
    '/one-sixty-vila-olimpia/': '/one-sixty',
    '/one-sixty-cyrela-by-yoo/': '/one-sixty',
    '/acapulco-guaruja-condominio/': '/condominio-jardim-acapulco',
    '/casa-a-venda-condominio-acapulco/': '/condominio-jardim-acapulco',
    '/casa-a-venda-jardim-acapulco-guaruja/': '/condominio-jardim-acapulco',
    '/residencial-acapulco-guaruja/': '/condominio-jardim-acapulco',
  };

  // Verificar se pathname está no mapa de redirects
  if (REDIRECTS_MAP[pathname]) {
    const destination = REDIRECTS_MAP[pathname];
    console.log(`🔍 [MIDDLEWARE] 🔄 REDIRECT VERCEL: ${pathname} → ${destination}`);
    return NextResponse.redirect(new URL(destination, origin), 301);
  }

  // 🚨 REDIRECTS PÁGINAS INSTITUCIONAIS (resolver noindex)
  const INSTITUTIONAL_REDIRECTS = {
    '/nossos-servicos': '/sobre/nossos-servicos',
    '/nossos-servicos/': '/sobre/nossos-servicos',
    '/trabalhe-conosco': '/sobre',
    '/trabalhe-conosco/': '/sobre',
    '/nossas-vantagens': '/sobre',
    '/nossas-vantagens/': '/sobre',
  };

  if (INSTITUTIONAL_REDIRECTS[pathname]) {
    const destination = INSTITUTIONAL_REDIRECTS[pathname];
    console.log(`🔍 [MIDDLEWARE] 🔄 REDIRECT INSTITUCIONAL: ${pathname} → ${destination}`);
    return NextResponse.redirect(new URL(destination, origin), 301);
  }

  // 🚨 CORREÇÃO GSC #1: DETECTAR GOOGLEBOT
  const isGoogleBot = /googlebot|bingbot|slurp|duckduckbot/i.test(userAgent);

  // 🚨 CORREÇÃO GSC #2: BLOQUEAR _RSC PARAMETERS (CRÍTICO)
  if (searchParams.has('_rsc')) {
    console.log('🚫 [GSC] Bloqueando _rsc parameter:', pathname);
    
    // Remove parâmetro _rsc e redireciona
    searchParams.delete('_rsc');
    url.search = searchParams.toString();
    
    return NextResponse.redirect(url, 301);
  }

  // 🚨 CORREÇÃO GSC #3: BLOQUEAR PARÂMETROS PROBLEMÁTICOS PARA BOTS
  if (isGoogleBot) {
    const problematicParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'ref', 'v', 'cache', 't'];
    let hasProblematicParams = false;
    
    problematicParams.forEach(param => {
      if (searchParams.has(param)) {
        searchParams.delete(param);
        hasProblematicParams = true;
      }
    });
    
    if (hasProblematicParams) {
      url.search = searchParams.toString();
      console.log('🚫 [GSC] Removendo parâmetros problemáticos para bot:', pathname);
      return NextResponse.redirect(url, 301);
    }
  }

  // 🚨 CORREÇÃO GSC #4: BLOQUEAR PATHS PROBLEMÁTICOS PARA BOTS
  const blockedPathsForBots = [
    '/_next/static/chunks/',
    '/_next/static/css/',
    '/_next/static/js/',
    '/_next/data/',
    '/api/'
  ];
  

if (isGoogleBot && blockedPathsForBots.some(path => pathname.startsWith(path))) {
  console.log('🚫 [GSC] Bloqueando path para bot:', pathname);
  return new NextResponse(null, { status: 404 });
 }

  // 🚨 CORREÇÃO CANONICAL #4: URLs de busca malformadas
  if (pathname === '/busca' || pathname === '/busca/') {
    let hasCanonicalIssues = false;
    const cleanParams = new URLSearchParams();
    
    // Limpar parâmetros duplicados e vazios
    for (const [key, value] of searchParams) {
      // Skip parâmetros vazios ou duplicados problemáticos
      if (key === 'ordenar' && cleanParams.has('ordenar')) {
        hasCanonicalIssues = true;
        continue; // Skip ordenar duplicado
      }
      if (key === 'emp_cod_end' && !value) {
        hasCanonicalIssues = true;  
        continue; // Skip parâmetros vazios
      }
      if (key === 'finalidade' && !value) {
        hasCanonicalIssues = true;
        continue; // Skip finalidade vazia
      }
      if ((key === 'valor[0]' || key === 'valor[1]') && !value) {
        hasCanonicalIssues = true;
        continue; // Skip valores vazios
      }
      if ((key === 'area[0]' || key === 'area[1]') && !value) {
        hasCanonicalIssues = true;
        continue; // Skip áreas vazias
      }
      
      // Manter parâmetros válidos
      if (value || ['pagina', 'listagem'].includes(key)) {
        cleanParams.set(key, value);
      } else if (!value) {
        hasCanonicalIssues = true;
      }
    }
    
    // Se há problemas canônicos, redirecionar para versão limpa
    if (hasCanonicalIssues || pathname === '/busca/') {
      const cleanUrl = new URL('/busca', origin);
      cleanParams.forEach((value, key) => {
        cleanUrl.searchParams.set(key, value);
      });
      
      console.log(`🚨 [CANONICAL-FIX] Busca malformada: ${pathname}${url.search} → ${cleanUrl.pathname}${cleanUrl.search}`);
      return NextResponse.redirect(cleanUrl, 301);
    }
  }

  /* 
  🎯 ESTRATÉGIA SEO OTIMIZADA (MANTIDA):
  
  1. IMÓVEIS VENDIDOS → Páginas funcionam NORMALMENTE (não redirecionar!)
  2. CONDOMÍNIOS → Páginas funcionam NORMALMENTE (/slug-condominio)
  3. IMÓVEIS DELETADOS (não existem no banco) → Redirect 301 para HOME
  4. URLs MALFORMADAS → HOME 
  5. URLs SEO INVÁLIDAS → HOME
  6. TRAILING SLASHES → Versão sem trailing slash
  
  ⚠️ IMPORTANTE: 
  - Só redirecionar quando imóvel NÃO EXISTE no banco!
  - Permitir páginas de condomínio (pattern: /slug-nome)
  */

  // 🚨 MELHORIA: URLs com caracteres especiais ou malformadas → HOME
  try {
    // Teste se a URL é válida
    decodeURIComponent(pathname);
  } catch (error) {
    console.log(`🔍 [MIDDLEWARE] 🏠 URL malformada → HOME: ${pathname}`);
    return NextResponse.redirect(new URL('/', origin), 301);
  }

  // 🚨 CORREÇÃO GSC: TRATAMENTO UNIFICADO DE IMÓVEIS (elimina cascata de redirects)
  
  // ✅ PATTERN 1: /imovel/ID/slug → /imovel-ID/slug (formato incorreto)
  const formatoErradoMatch = pathname.match(/^\/imovel\/(\d+)\/(.+)$/);
  if (formatoErradoMatch) {
    const [, id, slug] = formatoErradoMatch;
    const formatoCorreto = `/imovel-${id}/${slug}`;
    console.log(`🔍 [MIDDLEWARE] ❌ Formato incorreto: ${pathname} → ${formatoCorreto}`);
    return NextResponse.redirect(new URL(formatoCorreto, origin), 301);
  }
  
  // ✅ PATTERN 2: /imovel/ID (sem slug, formato incorreto) → /imovel-ID/slug
  const formatoErradoSemSlugMatch = pathname.match(/^\/imovel\/(\d+)$/);
  if (formatoErradoSemSlugMatch) {
    const id = formatoErradoSemSlugMatch[1];
    console.log(`🔍 [MIDDLEWARE] ❌ Formato incorreto sem slug: ${pathname}`);
    // Redirect para versão correta sem slug (será tratado abaixo)
    return NextResponse.redirect(new URL(`/imovel-${id}`, origin), 301);
  }

  // ✅ PATTERN 3: /imovel-ID/slug/ → /imovel-ID/slug (trailing slash)
  const imovelComSlugTrailingMatch = pathname.match(/^\/imovel-(\d+)\/(.+)\/$/);
  if (imovelComSlugTrailingMatch) {
    const [, id, slug] = imovelComSlugTrailingMatch;
    const semTrailingSlash = `/imovel-${id}/${slug}`;
    console.log(`🔍 [MIDDLEWARE] 🚨 TRAILING SLASH: ${pathname} → ${semTrailingSlash}`);
    return NextResponse.redirect(new URL(semTrailingSlash, origin), 301);
  }

  // ✅ PATTERN 4: /imovel-ID/ → /imovel-ID (trailing slash sem slug)
  const imovelSemSlugTrailingMatch = pathname.match(/^\/imovel-(\d+)\/$/);
  if (imovelSemSlugTrailingMatch) {
    const id = imovelSemSlugTrailingMatch[1];
    const semTrailingSlash = `/imovel-${id}`;
    console.log(`🔍 [MIDDLEWARE] 🚨 TRAILING SLASH: ${pathname} → ${semTrailingSlash}`);
    return NextResponse.redirect(new URL(semTrailingSlash, origin), 301);
  }

  // ✅ PATTERN 5: URLs 404 de redes sociais (problema histórico GSC) → redirect para imóvel
  const urlRedeSocialMatch = pathname.match(/^\/imovel-(\d+)\/(facebook\.com\/npiimoveis|instagram\.com\/npi_imoveis|indexdata\/index\.swf)$/);
  if (urlRedeSocialMatch) {
    const id = urlRedeSocialMatch[1];
    console.log(`🔍 [MIDDLEWARE] 🚨 URL rede social 404 (GSC): ${pathname} → /imovel-${id}`);
    
    // Redirect para página do imóvel (sem slug) - será tratado pelo pattern seguinte
    return NextResponse.redirect(new URL(`/imovel-${id}`, origin), 301);
  }

  // ✅ PATTERN 6: /imovel-ID (sem slug) → buscar slug na API
  const imovelSemSlugMatch = pathname.match(/^\/imovel-(\d+)$/);
  if (imovelSemSlugMatch) {
    const id = imovelSemSlugMatch[1];
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
        
        // 🚨 CORREÇÃO GSC: Validar slug antes de redirecionar
        const slugsInvalidos = [
          'facebook.com/npiimoveis',
          'instagram.com/npi_imoveis', 
          'indexdata/index.swf'
        ];
        
        if (imovel?.Slug && !slugsInvalidos.includes(imovel.Slug)) {
          const finalUrl = `/imovel-${id}/${imovel.Slug}`;
          console.log(`🔍 [MIDDLEWARE] ✅ Redirect para slug válido: ${pathname} → ${finalUrl}`);
          return NextResponse.redirect(new URL(finalUrl, origin), 301);
        } else if (imovel?.Slug && slugsInvalidos.includes(imovel.Slug)) {
          console.log(`🚨 [MIDDLEWARE] ❌ Slug inválido detectado: ${imovel.Slug} → NÃO redirecionando`);
          // Deixa a URL sem slug (/imovel-1234) e continua processamento
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
        } else if (imovel) {
          // 🎯 NOVO: Se imóvel existe mas sem slug, redirecionar para HOME
          console.log(`🔍 [MIDDLEWARE] 🏠 Imóvel sem slug → HOME: ${pathname}`);
          return NextResponse.redirect(new URL('/', origin), 301);
        }
      }
    } catch (error) {
      console.error('🔍 [MIDDLEWARE] ❌ Erro API:', error.message);
    }
    
    // 🎯 SOLUÇÃO UNIVERSAL: Se imóvel não existe → BUSCA RELEVANTE
    console.log(`🔍 [MIDDLEWARE] 🔍 Imóvel não encontrado → BUSCA RELEVANTE: ${pathname}`);
    return NextResponse.redirect(new URL('/busca', origin), 301);
  }

  // ✅ OUTRAS URLs COM TRAILING SLASH (não imóveis) 
  if (pathname.endsWith('/') && pathname.length > 1 && !pathname.startsWith('/imovel')) {
    const withoutTrailingSlash = pathname.slice(0, -1);
    console.log(`🔍 [MIDDLEWARE] 🚨 TRAILING SLASH (geral): ${pathname} → ${withoutTrailingSlash}`);
    
    const redirectUrl = new URL(withoutTrailingSlash, origin);
    url.searchParams.forEach((value, key) => {
      redirectUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(redirectUrl, 301);
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
        
        // Se imóvel NÃO EXISTE (deletado do banco) → REDIRECT HOME
        if (!imovel) {
          console.log(`🔍 [MIDDLEWARE] 🏠 Imóvel não existe → HOME: ${pathname}`);
          return NextResponse.redirect(new URL('/', origin), 301);
        }
        
        // ✅ IMÓVEL EXISTE (mesmo que vendido) → Continuar normal
        
        // 🚨 CORREÇÃO GSC: Se slug está desatualizado → validar antes de redirecionar
        const slugsInvalidos = [
          'facebook.com/npiimoveis',
          'instagram.com/npi_imoveis', 
          'indexdata/index.swf'
        ];
        
        if (imovel.Slug && imovel.Slug !== currentSlug) {
          if (!slugsInvalidos.includes(imovel.Slug)) {
            const correctUrl = `/imovel-${id}/${imovel.Slug}`;
            console.log(`🔍 [MIDDLEWARE] ✅ Slug antigo → válido: ${currentSlug} → ${imovel.Slug}`);
            return NextResponse.redirect(new URL(correctUrl, origin), 301);
          } else {
            console.log(`🚨 [MIDDLEWARE] ❌ Slug inválido no banco: ${imovel.Slug} → redirecionando para sem slug`);
            const urlSemSlug = `/imovel-${id}`;
            return NextResponse.redirect(new URL(urlSemSlug, origin), 301);
          }
        }
      } else {
        // 🎯 SOLUÇÃO OTIMIZADA: API retornou erro → BUSCA RELEVANTE
        console.log(`🔍 [MIDDLEWARE] 🔍 API erro (${response.status}) → BUSCA: ${pathname}`);
        return NextResponse.redirect(new URL('/busca', origin), 301);
      }
    } catch (error) {
      console.error('🔍 [MIDDLEWARE] ❌ Erro verificação:', error.message);
      // 🎯 SOLUÇÃO OTIMIZADA: Erro na verificação → BUSCA RELEVANTE
      console.log(`🔍 [MIDDLEWARE] 🔍 Erro técnico → BUSCA: ${pathname}`);
      return NextResponse.redirect(new URL('/busca', origin), 301);
    }
    
    // Se chegou aqui, imóvel existe e slug está correto → rewrite
    console.log(`🔍 [MIDDLEWARE] 🔄 Rewrite: /imovel/${id}/${currentSlug}`);
    const rewriteUrl = url.clone();
    rewriteUrl.pathname = `/imovel/${id}/${currentSlug}`;
    return NextResponse.rewrite(rewriteUrl);
  }

  // 🚨 CORREÇÃO CANONICAL #1: URLs de iframe legacy (PRIORIDADE ALTA)
  const iframeLegacyMatch = pathname.match(/^\/(testeIframe|iConatusIframe)\/iframe\.php/);
  if (iframeLegacyMatch) {
    console.log(`🚨 [CANONICAL-FIX] Iframe legacy: ${pathname} → /busca`);
    return NextResponse.redirect(new URL('/busca', origin), 301);
  }
  
  // 🚨 CORREÇÃO CANONICAL #2: /imovel-/slug (ID ausente após hífen)
  const imovelIDausenteMatch = pathname.match(/^\/imovel-\/(.+)$/);
  if (imovelIDausenteMatch) {
    console.log(`🚨 [CANONICAL-FIX] ID ausente após hífen: ${pathname} → /busca`);
    return NextResponse.redirect(new URL('/busca', origin), 301);
  }
  
  // 🚨 CORREÇÃO CANONICAL #3: URL malformada do Instagram 
  if (pathname === '/instagram.com/npi_imoveis') {
    console.log(`🚨 [CANONICAL-FIX] URL Instagram malformada: ${pathname} → https://instagram.com/npi_imoveis`);
    return NextResponse.redirect('https://instagram.com/npi_imoveis', 301);
  }
  
  // Fix canonical mismatch: Handle undefined IDs in /imovel/ paths
  const isProblematicoImovel = pathname.match(/^\/imovel\/(.*)$/);
  if (isProblematicoImovel) {
    const [, paramPath] = isProblematicoImovel;
    
    // Redirect invalid IDs (undefined, null, non-numeric) to search
    if (!paramPath || paramPath === 'undefined' || paramPath === 'null' || !paramPath.match(/^\d+/)) {
      console.log(`🚨 [CANONICAL-FIX] Invalid imovel path: ${pathname} → /busca`);
      return NextResponse.redirect(new URL('/busca', origin), 301);
    }
  }

  // ✅ PÁGINAS DE CONDOMÍNIO: /slug-condominio (sem ID)
  // Padrão simples: apenas letras, números e hífens (sem barras)
  const isCondominioPattern = pathname.match(/^\/[a-z0-9-]+$/);
  
  if (isCondominioPattern) {
    console.log(`🔍 [MIDDLEWARE] 🏢 Condomínio permitido: ${pathname} → NEXT()`);
    // Deixar passar para o Next.js resolver (página de condomínio ou 404 natural)
    return NextResponse.next();
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
    // ✅ CORREÇÃO CRÍTICA: Deixar Next.js resolver (404 natural) ao invés de redirecionar
    console.log(`🔍 [MIDDLEWARE] 📄 URL não reconhecida, deixando Next.js resolver: ${pathname}`);
    return NextResponse.next(); // 🔴 MUDANÇA CRÍTICA AQUI - era: redirect(new URL('/', origin), 301)
  }

  // 🚨 CORREÇÃO GSC #5: ADICIONAR HEADERS SEO APROPRIADOS
  const response = NextResponse.next();
  
  // Cache para recursos estáticos
  if (pathname.includes('.')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  // Cache para páginas HTML
  else {
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }
  
  // Headers para SEO
  response.headers.set('X-Robots-Tag', 'index, follow');
  
  // 🚨 CORREÇÃO GSC #6: LOGGING ESPECÍFICO PARA BOTS E REDIRECTS
  if (isGoogleBot) {
    console.log(`🤖 [GSC] BOT REQUEST - ${request.method} ${pathname} - UA: ${userAgent.slice(0, 50)}`);
  }
  
  // 🚨 CORREÇÃO GSC #7: LOG ESPECÍFICO PARA URLs PROBLEMÁTICAS IDENTIFICADAS
  if (pathname.includes('/imovel-') || pathname.includes('/imovel/')) {
    console.log(`🔍 [GSC-TRACKING] URL de imóvel processada: ${pathname} | Bot: ${isGoogleBot ? 'SIM' : 'NÃO'}`);
  }

  console.log(`🔍 [MIDDLEWARE] ➡️ Seguindo normalmente: ${pathname}`);
  return response;
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
     * Allows .php files (for iframe redirects)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap).*)',
  ],
};
