# Guia de Migração para Vercel Blob

## Status Atual

✅ **Solução temporária implementada** - A exclusão não gera mais erro 500 em produção

## Migração Recomendada para Vercel Blob

### 1. Instalar a dependência

```bash
npm install @vercel/blob
# ou
pnpm add @vercel/blob
```

### 2. Configurar variável de ambiente

Acesse o dashboard da Vercel e adicione a variável de ambiente:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxx
```

**Como obter o token:**

1. Acesse https://vercel.com/dashboard
2. Vá em Storage > Blob
3. Crie um novo Blob Store ou use existente
4. Copie o token de leitura/escrita

### 3. API já criada

A API `/api/admin/upload-blob/route.js` já foi criada como exemplo. Ela inclui:

- ✅ Upload para Vercel Blob
- ✅ Listagem de arquivos
- ✅ **Exclusão funcional em produção**
- ✅ Organização por diretórios
- ✅ Validação de tipos de arquivo

### 4. Componente de migração

Crie um componente para testar a nova API:

```javascript
// Teste: trocar a URL da API no componente
const BLOB_API = "/api/admin/upload-blob"; // Nova API
const OLD_API = "/api/admin/upload"; // API atual

// No componente LogosParceirosSection, trocar:
const response = await fetch(`${BLOB_API}?directory=${DIRECTORY}`);
```

### 5. Migração gradual

#### Passo 1: Testar com nova API

```javascript
// logos-parceiros-section.js
const USE_BLOB = process.env.NODE_ENV === "production"; // Usar Blob apenas em produção
const API_BASE = USE_BLOB ? "/api/admin/upload-blob" : "/api/admin/upload";
```

#### Passo 2: Migrar arquivos existentes

Criar script para migrar arquivos do `/public/uploads` para Vercel Blob:

```javascript
// scripts/migrate-to-blob.js
import { put } from "@vercel/blob";
import { readdir, readFile } from "fs/promises";
import path from "path";

async function migrateDirectory(dirName) {
  const uploadsDir = path.join(process.cwd(), "public/uploads", dirName);
  const files = await readdir(uploadsDir);

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    const fileBuffer = await readFile(filePath);

    const blob = await put(`${dirName}/${file}`, fileBuffer, {
      access: "public",
    });

    console.log(`Migrated: ${file} -> ${blob.url}`);
  }
}

// Executar para cada diretório
await migrateDirectory("parceiros");
await migrateDirectory("home");
// ... outros diretórios
```

#### Passo 3: Atualizar todos os componentes

1. `logos-parceiros-section.js`
2. `image-section.js`
3. `hub-image-section.js`
4. Qualquer outro componente que use upload

#### Passo 4: Remover API antiga

Após confirmar que tudo funciona, remover `/api/admin/upload/route.js`

### 6. Vantagens da migração

| Aspecto              | Sistema Atual   | Vercel Blob         |
| -------------------- | --------------- | ------------------- |
| Exclusão em produção | ❌ Não funciona | ✅ Funciona         |
| CDN global           | ❌ Não          | ✅ Automático       |
| Backup automático    | ❌ Não          | ✅ Incluído         |
| Escalabilidade       | ❌ Limitada     | ✅ Ilimitada        |
| Gerenciamento        | ❌ Manual       | ✅ Dashboard Vercel |

### 7. Custos

- **Armazenamento**: $0.15/GB por mês
- **Transferência**: $0.10/GB
- **Operações**: $0.20/1K operações

Para sites pequenos/médios: ~$1-5/mês

### 8. Rollback (se necessário)

O sistema atual continua funcionando. Para voltar:

1. Reverter URLs da API nos componentes
2. Manter arquivos no Vercel Blob como backup

### 9. Teste da nova API

Para testar sem afetar produção:

```bash
# Criar branch de teste
git checkout -b feature/vercel-blob-migration

# Modificar um componente para usar a nova API
# Testar upload/listagem/exclusão
# Fazer deploy de preview para testar em produção

# Se tudo OK, merge na main
```

### 10. Monitoramento pós-migração

```javascript
// Adicionar logs para monitorar
console.log("Upload to Vercel Blob:", {
  directory,
  filename,
  size: file.size,
  timestamp: new Date().toISOString(),
});
```

## Status da Migração

- [ ] Instalar @vercel/blob
- [ ] Configurar BLOB_READ_WRITE_TOKEN
- [ ] Testar API de upload-blob
- [ ] Migrar componente logos-parceiros-section
- [ ] Migrar outros componentes de upload
- [ ] Migrar arquivos existentes
- [ ] Remover API antiga
- [ ] Documentar novo processo

## Suporte

- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)
- [Pricing](https://vercel.com/docs/storage/vercel-blob/pricing)
- [SDK Reference](https://vercel.com/docs/storage/vercel-blob/sdk)
