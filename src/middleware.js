// middleware.js
import { NextResponse } from "next/server";
import { getCityValidSlugsSync, converterSlugCidadeSync } from "@/app/utils/url-slugs";

export async function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname, origin } = url;


  console.log(`🔍 [MIDDLEWARE] =================== INÍCIO ===================`);
  console.log(`🔍 [MIDDLEWARE] Processando: ${pathname}`);
  console.log(`🔍 [MIDDLEWARE] Origin: ${origin}`);

  // 🔧 CORREÇÃO: URLs de imóveis sem slug - redirect DIRETO para slug completo (SEM trailing slash)
  const imovelMatch = pathname.match(/^\/imovel-(\d+)\/?$/);
  if (imovelMatch) {
    const id = imovelMatch[1];
    const hasTrailingSlash = pathname.endsWith('/');
    
    console.log(`🔍 [MIDDLEWARE] 🔧 Imóvel ${hasTrailingSlash ? 'COM' : 'SEM'} trailing slash: ${pathname}`);
    
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
          const finalUrl = `/imovel-${id}/${imovel.Slug}`; // SEM trailing slash
          console.log(`🔍 [MIDDLEWARE] ✅ Redirecionamento DIRETO (301): ${pathname} → ${finalUrl}`);
          // Forçar status 301 explicitamente
          return NextResponse.redirect(new URL(finalUrl, origin), 301);
        } else if (imovel?.Empreendimento) {
          const slugGerado = imovel.Empreendimento
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            || `imovel-${id}`;
          
          const finalUrl = `/imovel-${id}/${slugGerado}`; // SEM trailing slash
          console.log(`🔍 [MIDDLEWARE] ✅ Redirecionamento DIRETO (301 - slug gerado): ${pathname} → ${finalUrl}`);
          // Forçar status 301 explicitamente
          return NextResponse.redirect(new URL(finalUrl, origin), 301);
        }
      }
    } catch (error) {
      console.error('🔍 [MIDDLEWARE] ❌ Erro ao buscar slug:', error.message);
    }
    
    // Se falhou, redireciona para busca
    console.log(`🔍 [MIDDLEWARE] ❌ Imóvel ${id} não encontrado - redirecionando para /busca`);
    return NextResponse.redirect(new URL('/busca', origin), 302);
  }

  // 1. Verificar se é URL SEO-friendly (/buscar/finalidade/categoria/cidade/bairro)
  const seoMatch = pathname.match(/^\/buscar\/([^\/]+)\/([^\/]+)\/([^\/]+)(.*)$/);
  
  if (seoMatch) {
    const [, finalidade, categoria, cidade, restPath] = seoMatch;
    
    // Buscar cidades válidas do banco de dados
    const cidadesValidas = getCityValidSlugsSync();
    const finalidadesValidas = ['compra', 'venda', 'aluguel'];
    const categoriasValidas = [
      'apartamentos', 'casas', 'casas-comerciais', 'casas-em-condominio', 
      'coberturas', 'flats', 'gardens', 'lofts', 'lojas', 
      'predios-comerciais', 'salas-comerciais', 'sobrados', 'terrenos'
    ];
    
    if (cidadesValidas.includes(cidade) && finalidadesValidas.includes(finalidade) && categoriasValidas.includes(categoria)) {
      console.log(`🔍 [MIDDLEWARE] ✅ URL SEO-friendly detectada: /buscar/${finalidade}/${categoria}/${cidade}${restPath}`);
      
      // Converter parâmetros de URL para filtros
      const parametrosUrl = { finalidade, categoria, cidade };
      
      // Processar parâmetros extras se existirem
      if (restPath && restPath.length > 1) {
        const params = restPath.substring(1).split('/').filter(p => p.length > 0);
        
        params.forEach((param, index) => {
          if (param.includes('+')) {
            // Múltiplos bairros
            parametrosUrl.bairros = param;
          } else if (param.includes('-quarto')) {
            // Quartos
            parametrosUrl.quartos = param;
          } else if (param.includes('mil') || param.includes('ate-') || param.includes('acima-')) {
            // Preço
            parametrosUrl.preco = param;
          } else if (index === 0 && !param.includes('-quarto') && !param.includes('mil')) {
            // Primeiro parâmetro provavelmente é bairro único
            parametrosUrl.bairros = param;
          }
        });
      }
      
      // Converter parâmetros URL para filtros diretamente (sem import)
      const filtros = {
        cidadeSelecionada: '',
        finalidade: '',
        categoriaSelecionada: '',
        bairrosSelecionados: [],
        quartos: null,
        precoMin: null,
        precoMax: null
      };

      // Mapeamentos de conversão usando banco de dados

      const MAPEAMENTO_CATEGORIAS = {
        'apartamentos': 'Apartamento',
        'casas': 'Casa',
        'casas-comerciais': 'Casa Comercial',
        'casas-em-condominio': 'Casa em Condominio',
        'coberturas': 'Cobertura',
        'flats': 'Flat',
        'gardens': 'Garden',
        'lofts': 'Loft',
        'lojas': 'Loja',
        'predios-comerciais': 'Prédio Comercial',
        'salas-comerciais': 'Sala Comercial',
        'sobrados': 'Sobrado',
        'terrenos': 'Terreno'
      };

      const MAPEAMENTO_FINALIDADES = {
        'compra': 'Comprar',
        'venda': 'Comprar',
        'aluguel': 'Alugar'
      };

      // Converter parâmetros básicos
      filtros.cidadeSelecionada = converterSlugCidadeSync(parametrosUrl.cidade);
      filtros.finalidade = MAPEAMENTO_FINALIDADES[parametrosUrl.finalidade] || parametrosUrl.finalidade;
      filtros.categoriaSelecionada = MAPEAMENTO_CATEGORIAS[parametrosUrl.categoria] || parametrosUrl.categoria;

      // Converter bairros se existirem
      if (parametrosUrl.bairros) {
        filtros.bairrosSelecionados = parametrosUrl.bairros.split('+').map(bairroSlug => {
          return bairroSlug
            .split('-')
            .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
            .join(' ');
        });
      }

      // Converter quartos se existir
      if (parametrosUrl.quartos) {
        if (parametrosUrl.quartos === '1-quarto') {
          filtros.quartos = 1;
        } else {
          const match = parametrosUrl.quartos.match(/^(\d+)-quartos$/);
          if (match) filtros.quartos = parseInt(match[1]);
        }
      }

      // Converter preços se existir
      if (parametrosUrl.preco) {
        const converterValor = (valorStr) => {
          if (valorStr.includes('mi')) {
            return parseFloat(valorStr.replace('mi', '')) * 1000000;
          } else if (valorStr.includes('mil')) {
            return parseFloat(valorStr.replace('mil', '')) * 1000;
          }
          return parseFloat(valorStr);
        };
        
        if (parametrosUrl.preco.startsWith('ate-')) {
          const valor = parametrosUrl.preco.replace('ate-', '');
          filtros.precoMax = converterValor(valor);
        } else if (parametrosUrl.preco.startsWith('acima-')) {
          const valor = parametrosUrl.preco.replace('acima-', '');
          filtros.precoMin = converterValor(valor);
        } else if (parametrosUrl.preco.includes('-')) {
          const [minStr, maxStr] = parametrosUrl.preco.split('-');
          filtros.precoMin = converterValor(minStr);
          filtros.precoMax = converterValor(maxStr);
        }
      }
      
      // Construir URL de rewrite para /busca (mantém URL amigável)
      const rewriteUrl = new URL('/busca', request.url);
      
      if (filtros.cidadeSelecionada) rewriteUrl.searchParams.set('cidade', filtros.cidadeSelecionada);
      if (filtros.finalidade) rewriteUrl.searchParams.set('finalidade', filtros.finalidade);
      if (filtros.categoriaSelecionada) rewriteUrl.searchParams.set('categoria', filtros.categoriaSelecionada);
      if (filtros.bairrosSelecionados && filtros.bairrosSelecionados.length > 0) {
        rewriteUrl.searchParams.set('bairros', filtros.bairrosSelecionados.join(','));
      }
      if (filtros.quartos) rewriteUrl.searchParams.set('quartos', filtros.quartos.toString());
      if (filtros.precoMin) rewriteUrl.searchParams.set('precoMin', filtros.precoMin.toString());
      if (filtros.precoMax) rewriteUrl.searchParams.set('precoMax', filtros.precoMax.toString());
      
      console.log(`🔍 [MIDDLEWARE] ⚡ Rewrite para: ${rewriteUrl.toString()}`);
      return NextResponse.rewrite(rewriteUrl);
    }
  }

  // 2. Processar URLs de imóveis COM slug - verificar se slug está correto
  const imovelComSlugMatch = pathname.match(/^\/imovel-(\d+)\/(.+)$/);
  
  if (!imovelComSlugMatch) {
    console.log(`🔍 [MIDDLEWARE] ➡️ Não é URL de imóvel: ${pathname}`);
    return NextResponse.next();
  }

  const [, id, currentSlug] = imovelComSlugMatch;
  console.log(`🔍 [MIDDLEWARE] ✅ URL de imóvel COM SLUG detectada: ID=${id}, SLUG=${currentSlug}`);

  // Verificar se slug está correto e redirecionar se necessário
  try {
    const apiUrl = new URL(`/api/imoveis/${id}`, origin);
    
    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      const imovel = data.data;
      
      // Se slug está desatualizado, redireciona para slug correto
      if (imovel?.Slug && imovel.Slug !== currentSlug) {
        const correctUrl = `/imovel-${id}/${imovel.Slug}`;
        console.log(`🔍 [MIDDLEWARE] ✅ Redirecionando slug antigo para correto (301): ${currentSlug} → ${imovel.Slug}`);
        // Forçar status 301 explicitamente
        return NextResponse.redirect(new URL(correctUrl, origin), 301);
      }
    }
  } catch (error) {
    console.error('🔍 [MIDDLEWARE] ❌ Erro ao verificar slug:', error.message);
  }
  
  // Se slug está correto, faz rewrite
  console.log(`🔍 [MIDDLEWARE] 🔄 Rewrite para: /imovel/${id}/${currentSlug}`);
  const rewriteUrl = url.clone();
  rewriteUrl.pathname = `/imovel/${id}/${currentSlug}`;
  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: [
    '/imovel-:id(\\d+)',           // /imovel-1715 (sem slug)
    '/imovel-:id(\\d+)/',          // /imovel-1715/ (sem slug, com trailing slash)
    '/imovel-:id(\\d+)/:slug*',    // /imovel-1715/helbor-brooklin (com slug)
    '/buscar/:finalidade/:categoria/:cidade*', // URLs SEO-friendly
  ],
};
