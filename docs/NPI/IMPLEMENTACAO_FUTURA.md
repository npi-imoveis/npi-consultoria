# Implementação Futura - NPi Consultoria

## 4. Melhorias para Implementação Futura

### 4.1 Layout da Página "Encontre Seu Imóvel"
**Prioridade**: Alta
**Status**: Planejado

**Objetivo**: Integrar mapa com cards de resultado, similar ao QuintoAndar, Zap e Loft
**Impacto**: Melhor experiência do usuário e navegação mais intuitiva

**Implementação**:
- Layout split-screen: 50% mapa, 50% lista
- Sincronização entre mapa e cards
- Hover no card destaca pin no mapa
- Click no pin mostra card correspondente

**Arquivos a modificar**:
- `src/app/busca/page.js`
- `src/app/busca/components/map-component.js`
- `src/app/busca/components/property-filters.js`
- `src/app/components/ui/card-imovel.js`

**Componentes necessários**:
```jsx
// Estrutura do novo layout
<div className="flex h-screen">
  <div className="w-1/2 overflow-y-auto">
    <PropertyList />
  </div>
  <div className="w-1/2 sticky top-0">
    <MapComponent />
  </div>
</div>
```

**Funcionalidades**:
- [ ] Layout responsivo (mobile: tabs mapa/lista)
- [ ] Sincronização mapa ↔ cards
- [ ] Filtros afetam ambos simultaneamente
- [ ] Zoom automático baseado nos resultados
- [ ] Clustering de pins quando muitos imóveis

**Estimativa**: 16-24 horas

---

### 4.2 Mapa Habilitado por Padrão na Busca
**Prioridade**: Média
**Status**: Planejado

**Objetivo**: Mapa inicia habilitado e carrega imóveis da região (ex: SP)
**Impacto**: Usuário vê imóveis imediatamente sem precisar configurar filtros

**Implementação**:
- Detectar localização do usuário (geolocalização)
- Fallback para São Paulo se não autorizar
- Carregar imóveis da região automaticamente
- Zoom apropriado para mostrar densidade

**Arquivos a modificar**:
- `src/app/busca/page.js`
- `src/app/busca/components/map-component.js`
- `src/app/api/imoveis/mapa/route.js`

**Funcionalidades**:
```javascript
// Carregar imóveis por região
const loadInitialProperties = async (lat, lng, radius = 50) => {
  const response = await fetch(`/api/imoveis/mapa?lat=${lat}&lng=${lng}&radius=${radius}`);
  return response.json();
};

// Geolocalização com fallback
const getInitialLocation = () => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve([position.coords.latitude, position.coords.longitude]),
        () => resolve([-23.5505, -46.6333]) // SP como fallback
      );
    } else {
      resolve([-23.5505, -46.6333]); // SP como fallback
    }
  });
};
```

**Estimativa**: 8-12 horas

---

### 4.3 Divisão de Cadastro de Imagens
**Prioridade**: Média
**Status**: Planejado

**Objetivo**: Organizar upload de imagens em 3 categorias
**Categorias**:
1. **Internas do Imóvel**: Quartos, salas, cozinha, banheiros
2. **Externas**: Fachada, área externa, jardim, piscina
3. **Plantas**: Plantas baixas, layouts, blueprints

**Arquivos a modificar**:
- `src/app/admin/imoveis/gerenciar/page.js`
- `src/app/admin/imoveis/gerenciar/@components/sections/ImagesSection.jsx`
- `src/app/models/Imovel.ts`
- `src/app/api/admin/upload/route.js`

**Estrutura de dados**:
```typescript
interface FotoCategoria {
  internas: {
    [key: string]: {
      Codigo: string;
      Foto: string;
      FotoPequena: string;
      Descricao: string;
      Destaque: boolean;
    }
  };
  externas: { /* mesmo formato */ };
  plantas: { /* mesmo formato */ };
}
```

**Interface do Admin**:
```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <ImageUploadSection 
    title="Internas do Imóvel" 
    category="internas"
    maxFiles={20}
  />
  <ImageUploadSection 
    title="Externas" 
    category="externas"
    maxFiles={10}
  />
  <ImageUploadSection 
    title="Plantas" 
    category="plantas"
    maxFiles={5}
  />
</div>
```

**Estimativa**: 12-16 horas

---

### 4.4 Upload de Planilha de Links de Parceiros
**Prioridade**: Média
**Status**: Planejado

**Objetivo**: Campo no admin para upload de planilha Excel com links dos parceiros
**Funcionalidade**: Processar planilha e alimentar automação no MongoDB

**Arquivos a criar/modificar**:
- `src/app/admin/automacao/upload-planilha/page.js`
- `src/app/api/admin/upload-planilha/route.js`
- `src/app/admin/components/planilha-upload.js`

**Estrutura da planilha**:
```
| Parceiro | Corretor | Link | Código | Status |
|----------|----------|------|---------|--------|
| Andrea Gomes | Andrea | https://... | 83 | Ativo |
| Thiago Granato | Thiago | https://... | 56 | Ativo |
```

**Implementação**:
```javascript
// Processamento da planilha
import * as XLSX from 'xlsx';

const processarPlanilha = async (file) => {
  const workbook = XLSX.read(await file.arrayBuffer());
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  // Validar e inserir no MongoDB
  for (const row of data) {
    await criarLinkAutomacao(row);
  }
};
```

**Validações necessárias**:
- [ ] Formato da planilha
- [ ] URLs válidas
- [ ] Códigos de parceiros únicos
- [ ] Logs de processamento

**Estimativa**: 10-14 horas

---

### 4.5 Importação de Imóveis - Novos Parceiros
**Prioridade**: Alta
**Status**: Pendente

**Problema**: Faltam imóveis de parceiros específicos
**Parceiros em falta**:
- **Andrea Gomes** (Código: 83)
- **Thiago Granato** (Código: 56) - substituiu Marcos Strafacce

**Ações necessárias**:
1. Configurar automação para Andrea Gomes
2. Migrar imóveis do Marcos Strafacce para Thiago Granato
3. Configurar automação para Thiago Granato
4. Validar importação

**Arquivos relacionados**:
- `src/app/api/automacao/route.js`
- `src/app/api/automacao/[codigo]/route.js`
- Scripts de migração de dados

**Implementação**:
```javascript
// Migração Marcos → Thiago
const migrarImoveis = async () => {
  await ImovelModel.updateMany(
    { Corretor: 'Marcos Strafacce' },
    { 
      $set: { 
        Corretor: 'Thiago Granato',
        CodigoCorretor: 56 
      }
    }
  );
};

// Configurar automação novos parceiros
const configurarAutomacao = async (codigo, nome, url) => {
  await AutomacaoModel.create({
    codigo,
    nome,
    url,
    ativo: true,
    frequencia: 'diaria'
  });
};
```

**Estimativa**: 6-8 horas

---

### 4.6 Ranking de Imóveis dos Parceiros
**Prioridade**: Média
**Status**: Pendente

**Problema**: Ranking não atualiza com novos imóveis e novos parceiros
**Impacto**: Dados desatualizados no dashboard

**Investigar**:
- Algoritmo de ranking atual
- Trigger de atualização
- Cache de dados

**Arquivos relacionados**:
- `src/app/api/admin/dashboard/route.js`
- `src/app/admin/dashboard/page.js`
- `src/app/admin/dashboard/components/card.js`

**Implementação**:
```javascript
// Recalcular ranking
const atualizarRanking = async () => {
  const ranking = await ImovelModel.aggregate([
    {
      $group: {
        _id: '$Corretor',
        totalImoveis: { $sum: 1 },
        imoveisAtivos: { 
          $sum: { $cond: [{ $eq: ['$Status', 'Ativo'] }, 1, 0] }
        },
        valorTotal: { $sum: { $toDouble: '$Valor' } }
      }
    },
    { $sort: { totalImoveis: -1 } }
  ]);
  
  // Atualizar cache/dashboard
  await atualizarDashboard(ranking);
};
```

**Melhorias**:
- [ ] Atualização automática (cron job)
- [ ] Cache inteligente
- [ ] Métricas em tempo real

**Estimativa**: 8-10 horas

---

## Checklist de Prioridades

### 🔴 Alta Prioridade
- [ ] Layout integrado mapa + cards na busca
- [ ] Importar imóveis dos novos parceiros

### 🟡 Média Prioridade
- [ ] Mapa habilitado por padrão
- [ ] Divisão de cadastro de imagens
- [ ] Upload de planilha de parceiros
- [ ] Corrigir ranking de parceiros

---

## Estimativa Total

| Funcionalidade | Tempo Estimado |
|----------------|----------------|
| Layout mapa + cards | 16-24 horas |
| Mapa habilitado por padrão | 8-12 horas |
| Divisão de imagens | 12-16 horas |
| Upload planilha parceiros | 10-14 horas |
| Importar novos parceiros | 6-8 horas |
| Corrigir ranking | 8-10 horas |

**Total estimado**: 60-84 horas

---

## Observações Técnicas

1. **Layout Mapa**: Requer redesign significativo da página de busca
2. **Geolocalização**: Considerar privacidade e permissões
3. **Upload Planilha**: Validações rigorosas necessárias
4. **Ranking**: Implementar cache para performance
5. **Importação**: Backup antes de migrações

---

## Próximos Passos

1. Definir prioridades com stakeholders
2. Criar protótipos do novo layout
3. Implementar em ambiente de desenvolvimento
4. Testes extensivos antes da produção
5. Documentar processos de automação