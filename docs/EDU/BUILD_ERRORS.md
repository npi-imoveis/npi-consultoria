# Build Errors - Vercel Deployment

## Problema Principal

Durante o build no Vercel, várias rotas da API estão falhando com o erro:

**Dynamic server usage: Route couldn't be rendered statically because it accessed `request.url`**

## Rotas Afetadas

### Admin APIs
- `/api/admin/proprietarios`
- `/api/admin/imoveis`
- `/api/admin/vinculo`

### Automação APIs
- `/api/automacao`
- `/api/condominios`
- `/api/condominios/find`

### Imóveis APIs
- `/api/imoveis/filters/bairros`
- `/api/imoveis/mapa`
- `/api/imoveis/similar`
- `/api/imoveis/slug`

### Search APIs
- `/api/search/automacao`

## Causa do Problema

O Next.js 14 está tentando renderizar estaticamente as rotas da API durante o build, mas essas rotas estão acessando `request.url`, que é um comportamento dinâmico. Isso impede a renderização estática.

## Soluções

### 1. Adicionar `export const dynamic = 'force-dynamic'` nas rotas da API

Em cada arquivo de rota afetado, adicione no topo:

```javascript
export const dynamic = 'force-dynamic';
```

### 2. Lista de Arquivos para Corrigir

#### Admin APIs
- `src/app/api/admin/proprietarios/route.js`
- `src/app/api/admin/imoveis/route.js`
- `src/app/api/admin/vinculo/route.js`

#### Automação APIs
- `src/app/api/automacao/route.js`
- `src/app/api/condominios/route.js`
- `src/app/api/condominios/find/route.js`

#### Imóveis APIs
- `src/app/api/imoveis/filters/bairros/route.js`
- `src/app/api/imoveis/mapa/route.js`
- `src/app/api/imoveis/similar/route.js`
- `src/app/api/imoveis/slug/route.js`

#### Search APIs
- `src/app/api/search/automacao/route.js`

### 3. Exemplo de Correção

**Antes:**
```javascript
// route.js
import { NextResponse } from 'next/server';

export async function GET(request) {
  const url = request.url; // Isso causa o erro
  // resto do código
}
```

**Depois:**
```javascript
// route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const url = request.url; // Agora funciona
  // resto do código
}
```

### 4. Alternativa: Usar searchParams

Se não quiser forçar como dinâmico, pode usar `searchParams`:

```javascript
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  // usar searchParams em vez de request.url
}
```

## Avisos sobre SWC

O build também mostra avisos sobre dependências SWC em falta no lockfile:
- `⚠ Found lockfile missing swc dependencies, run next locally to automatically patch`

### Solução para SWC
Execute localmente:
```bash
npm run dev
```

Isso irá automaticamente corrigir o lockfile.

## Prioridade de Correção

1. **Alta**: Adicionar `export const dynamic = 'force-dynamic'` em todas as rotas listadas
2. **Média**: Corrigir avisos do SWC executando `npm run dev` localmente
3. **Baixa**: Otimizar rotas para usar menos recursos dinâmicos quando possível

## Status do Build

Apesar dos erros, o build foi **concluído com sucesso** e o deploy foi realizado. Os erros não impedem o funcionamento, mas podem afetar a performance das rotas em questão.

## Estimativa de Tempo

| Tarefa | Tempo Estimado |
|--------|----------------|
| Adicionar `dynamic = 'force-dynamic'` (11 rotas) | 2-3 horas |
| Testar build local | 1 hora |
| Verificar e corrigir avisos SWC | 1-2 horas |
| Deploy e validação | 1 hora |

**Total estimado**: 5-7 horas

---

## Próximos Passos

1. Corrigir todas as rotas da API adicionando `export const dynamic = 'force-dynamic'`
2. Testar localmente com `npm run build`
3. Verificar se os avisos do SWC desaparecem
4. Fazer novo deploy