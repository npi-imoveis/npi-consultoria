# Ajustes Admin - NPi Consultoria

## 2. Problemas no Admin

### 2.1 Busca de Corretores por Nome
**Prioridade**: Alta
**Status**: Pendente

**Problema**: Search por nome de corretores não funciona
**Impacto**: Dificulta gestão de corretores no admin

**Investigar**:
- Algoritmo de busca em `src/app/api/search/corretores/route.js`
- Indexação no banco de dados
- Normalização de texto na busca

**Arquivos relacionados**:
- `src/app/api/search/corretores/route.js`
- `src/app/admin/corretores/page.js`
- Componentes de busca no admin

**Solução sugerida**:
```javascript
// Melhorar busca por nome usando regex case-insensitive
const searchQuery = {
  $or: [
    { nome: { $regex: searchTerm, $options: 'i' } },
    { email: { $regex: searchTerm, $options: 'i' } }
  ]
};
```

---

### 2.2 Erro ao Excluir Logo de Parceiro
**Prioridade**: Média
**Status**: Bloqueado (Vercel limitation)

**Problema**: Vercel bloqueia exclusão de arquivos em produção
**Impacto**: Não consegue remover logos de parceiros

**Limitação técnica**: Vercel não permite exclusão de arquivos estáticos
**Solução alternativa necessária**: Migrar para AWS S3 ou similar

**Arquivos relacionados**:
- `src/app/admin/gerenciar-site/page.js`
- `src/app/api/admin/upload/route.js`
- Sistema de upload atual

**Ações**:
- [ ] Implementar exclusão via AWS S3
- [ ] Manter referência no banco para controle
- [ ] Atualizar interface do admin

---

### 2.3 Upload de Fotos - História da NPI
**Prioridade**: Média
**Status**: Pendente

**Problema**: Ao subir foto em um campo, ela aparece no outro
**Página afetada**: "SOBRE A NPI" → "HISTÓRIA 2"

**Investigar**:
- Mapeamento de campos no formulário
- IDs dos inputs de upload
- Lógica de associação imagem-campo

**Arquivos relacionados**:
- `src/app/admin/gerenciar-site/page.js`
- `src/app/admin/gerenciar-site/components/sections/nossa-historia-section.js`
- `src/app/api/admin/upload/route.js`

**Solução sugerida**:
```javascript
// Garantir IDs únicos para cada campo
const handleUpload = (fieldId, file) => {
  // Associar corretamente o arquivo ao campo específico
};
```

---

### 2.4 Textos dos Serviços Não Editáveis
**Prioridade**: Média
**Status**: Pendente

**Problema**: Não consegue alterar textos dos serviços após link do YouTube
**Seção**: "Nossa missão e serviços"

**Investigar**:
- Mapeamento de campos no CMS
- Estrutura de dados dos serviços
- Interface de edição

**Arquivos relacionados**:
- `src/app/admin/gerenciar-site/components/sections/nossos-servicos-section.js`
- `src/app/admin/gerenciar-site/components/tabs/servicos-tab.js`
- `src/app/api/admin/content/route.js`

---

### 2.5 Imóvel em Lançamento - Valor Undefined
**Prioridade**: Alta
**Status**: Pendente

**Problema**: Imóvel em lançamento mostra "R$ undefined" em vez de "QUERO UM IMÓVEL NESTE CONDOMÍNIO"
**Exemplo**: https://www.npiconsultoria.com.br/imovel-741265/sao-paulo-bay-even

**Investigar**:
- Lógica de exibição de preço vs. botão de interesse
- Condições para identificar imóvel em lançamento
- Status/flags do imóvel

**Arquivos relacionados**:
- `src/app/imovel/[id]/[slug]/page.js`
- `src/app/imovel/[id]/[slug]/componentes/ValoresUnidade.js`
- `src/app/components/ui/card-imovel.js`

**Solução sugerida**:
```javascript
// Verificar se é lançamento e não tem preço definido
const isLancamento = imovel.Status === 'Lançamento';
const temPreco = imovel.Valor && imovel.Valor !== '0';

if (isLancamento && !temPreco) {
  return <BotaoInteresse />;
} else {
  return <ExibirPreco />;
}
```

---

### 2.6 Metragem Incorreta em Imóvel Duplicado
**Prioridade**: Média
**Status**: Pendente

**Problema**: Ao duplicar imóvel, metragem muda no card mas não na lista
**Exemplo**: Cobertura duplicada em https://www.npiconsultoria.com.br/opera-vila-nova

**Investigar**:
- Processo de duplicação no admin
- Sincronização de dados entre card e lista
- Cache de dados do condomínio

**Arquivos relacionados**:
- `src/app/admin/imoveis/gerenciar/page.js`
- `src/app/[slug]/page.js` (página do condomínio)
- `src/app/[slug]/componentes/property-table.js`
- Sistema de duplicação

**Solução**:
- Verificar mapeamento de campos na duplicação
- Invalidar cache após duplicação
- Sincronizar dados entre diferentes views

---

### 2.7 Imóveis Inativos Sem Possibilidade de Ativação
**Prioridade**: Alta
**Status**: Pendente

**Problema**: Imóveis com preço aparecem como inativos e não podem ser alterados para ativo
**Impacto**: Aparecem vermelhos no resultado de busca do admin

**Investigar**:
- Lógica de status ativo/inativo
- Condições para ativação
- Validações no formulário

**Arquivos relacionados**:
- `src/app/admin/imoveis/page.js`
- `src/app/admin/imoveis/gerenciar/page.js`
- `src/app/api/admin/imoveis/route.js`
- Modelo `src/app/models/Imovel.ts`

**Solução sugerida**:
```javascript
// Verificar condições de ativação
const podeAtivar = (imovel) => {
  return imovel.Valor && 
         imovel.Valor !== '0' && 
         imovel.Status !== 'Vendido' &&
         imovel.Foto && 
         Object.keys(imovel.Foto).length > 0;
};
```

---

## Checklist de Prioridades

### 🔴 Alta Prioridade
- [ ] Corrigir busca de corretores por nome
- [ ] Resolver "R$ undefined" em imóveis de lançamento
- [ ] Investigar imóveis inativos que não podem ser ativados

### 🟡 Média Prioridade
- [ ] Corrigir upload de fotos na História da NPI
- [ ] Habilitar edição de textos dos serviços
- [ ] Corrigir metragem em imóveis duplicados

### 🔵 Baixa Prioridade (Bloqueado)
- [ ] Exclusão de logos de parceiros (aguarda solução S3)

---

## Estimativa de Tempo

| Tarefa | Tempo Estimado |
|--------|----------------|
| Busca corretores | 4-6 horas |
| Valor undefined | 3-4 horas |
| Imóveis inativos | 4-6 horas |
| Upload fotos História | 2-3 horas |
| Edição textos serviços | 2-4 horas |
| Metragem duplicados | 3-4 horas |
| Exclusão logos S3 | 6-8 horas |

**Total estimado**: 24-35 horas

---

## Observações Técnicas

1. **Busca Corretores**: Pode necessitar índices no MongoDB
2. **Valor Undefined**: Revisar lógica de exibição de preços
3. **Imóveis Inativos**: Verificar regras de negócio para ativação
4. **Upload Fotos**: Problema de mapeamento de campos
5. **Exclusão Logos**: Requer migração para AWS S3

---

## Próximos Passos

1. Investigar busca de corretores (logs, queries)
2. Corrigir exibição de preços em lançamentos
3. Revisar lógica de ativação de imóveis
4. Testar uploads na seção História
5. Planejar migração para S3 (logos)