# Ajustes Pendentes - NPi Consultoria

## 1. Ajustes no Site

### 1.1 Google Search Console (GSC) - Zerar Erros
**Prioridade**: Alta
**Status**: Pendente

**Ações necessárias**:
- Analisar erros reportados no Google Search Console
- Corrigir problemas de indexação
- Verificar URLs com problemas
- Resolver erros de estrutura/markup

**Arquivos relacionados**:
- `src/app/robots.js`
- `src/app/sitemap.xml/route.js`
- Metadata em páginas específicas

---

### 1.2 URLs Amigáveis na Busca
**Prioridade**: Alta
**Status**: Pendente

**Objetivo**: Criar URLs semânticas para melhorar SEO
**Exemplo**: `https://www.npiconsultoria.com.br/busca/comprar/apartamento/guaruja`

**Implementação**:
- Modificar roteamento em `src/app/busca/`
- Criar estrutura: `/busca/[finalidade]/[tipo]/[cidade]`
- Atualizar middleware se necessário
- Implementar redirecionamentos da URL antiga

**Arquivos a modificar**:
- `src/app/busca/page.js`
- `src/middleware.js` (se necessário)
- Componentes de busca

---

### 1.3 Remover 2º H1 da Home
**Prioridade**: Média
**Status**: Pendente

**Problema**: Múltiplos H1 prejudicam SEO
**Ação**: Localizar e alterar tags H1 duplicadas para H2 ou H3

**Arquivos relacionados**:
- `src/app/page.js`
- `src/app/components/sections/hero-section.js`
- Outros componentes da home

---

### 1.4 Título Dinâmico na Página de Busca
**Prioridade**: Alta
**Status**: Pendente

**Objetivo**: Gerar títulos SEO dinâmicos
**Exemplo**: "Apartamento para comprar em São Caetano do Sul"

**Implementação**:
```javascript
// Modelo de título dinâmico
const gerarTitulo = (tipo, finalidade, cidade) => {
  return `${tipo} para ${finalidade} em ${cidade}`;
};
```

**Arquivos a modificar**:
- `src/app/busca/page.js` (metadata)
- `src/app/busca/layout.js`
- Componentes de filtro

---

### 1.5 Thumbnail WhatsApp
**Prioridade**: Média
**Status**: Pendente

**Problema**: Falta thumbnail ao compartilhar no WhatsApp
**Páginas afetadas**:
- Página do imóvel (`/imovel/[id]/[slug]`)
- Página do HUB (`/sobre/hub-imobiliarias`)

**Implementação**:
- Adicionar Open Graph meta tags
- Configurar `og:image` adequadamente
- Verificar `og:title` e `og:description`

**Arquivos a modificar**:
- `src/app/imovel/[id]/[slug]/page.js`
- `src/app/sobre/hub-imobiliarias/page.js`

---

### 1.6 Busca Livre por Endereço
**Prioridade**: Alta
**Status**: Pendente

**Problema**: Busca por endereço não funciona corretamente
**Exemplo**: "Antonio Barros de Ulhoa Cintra"

**Investigar**:
- Algoritmo de busca atual
- Indexação de endereços no banco
- Normalização de texto

**Arquivos relacionados**:
- `src/app/api/search/route.js`
- `src/app/busca/components/InputSearch.js`
- Modelos de busca

---

### 1.7 Scroll to Top na Paginação
**Prioridade**: Média
**Status**: Pendente

**Problema**: Ao mudar página, não rola para o topo
**Solução**: Implementar scroll automático na mudança de página

**Implementação**:
```javascript
// No componente de paginação
const handlePageChange = (newPage) => {
  setCurrentPage(newPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

**Arquivos a modificar**:
- `src/app/components/ui/pagination.js`
- `src/app/busca/page.js`

---

## Checklist de Prioridades

### 🔴 Alta Prioridade
- [ ] Corrigir erros do Google Search Console
- [ ] Implementar URLs amigáveis na busca
- [ ] Título dinâmico na página de busca
- [ ] Corrigir busca livre por endereço

### 🟡 Média Prioridade
- [ ] Remover 2º H1 da home
- [ ] Thumbnail WhatsApp nas páginas
- [ ] Scroll to top na paginação

---

## Estimativa de Tempo

| Tarefa | Tempo Estimado |
|--------|----------------|
| URLs amigáveis | 8-12 horas |
| Título dinâmico | 4-6 horas |
| Busca por endereço | 6-8 horas |
| GSC erros | 4-8 horas |
| Thumbnail WhatsApp | 2-4 horas |
| Remover 2º H1 | 1-2 horas |
| Scroll to top | 1-2 horas |

**Total estimado**: 26-42 horas

---

## Observações Técnicas

1. **URLs Amigáveis**: Requer mudança significativa na estrutura de roteamento
2. **Busca por Endereço**: Pode precisar de melhorias no algoritmo de busca
3. **GSC**: Priorizar correções que afetam indexação
4. **Testes**: Todos os ajustes devem ser testados em ambiente de desenvolvimento

---

## Próximos Passos

1. Priorizar correções do Google Search Console
2. Implementar URLs amigáveis na busca
3. Testar cada ajuste individualmente
4. Verificar impacto no SEO após cada mudança