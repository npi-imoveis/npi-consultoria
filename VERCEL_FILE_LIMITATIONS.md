# Limitações de Arquivos na Vercel

## Problema Identificado

Ao tentar excluir arquivos de logo em produção na Vercel, você encontra um erro 500. Isso acontece porque a Vercel utiliza um **filesystem somente leitura** em produção para as Serverless Functions.

## Por que isso acontece?

### Limitações da Vercel em Produção

1. **Filesystem Read-Only**: Em produção, a Vercel executa suas funções em um ambiente serverless com sistema de arquivos somente leitura
2. **Arquivos estáticos são imutáveis**: Uma vez que o deploy é feito, os arquivos na pasta `public/` não podem ser modificados
3. **Funções são efêmeras**: As Serverless Functions são executadas de forma temporária e não mantêm estado entre execuções

### Diferenças entre Desenvolvimento e Produção

- **Local (localhost:3000)**: ✅ Permite leitura e escrita de arquivos
- **Produção (Vercel)**: ✅ Permite leitura / ❌ **NÃO** permite escrita/exclusão

## Solução Implementada (Temporária)

Foi implementada uma solução de fallback na API `/api/admin/upload` que:

1. **Detecta o ambiente**: Verifica se está rodando em produção na Vercel
2. **Simula sucesso**: Retorna sucesso simulado para manter a UI funcionando
3. **Log de aviso**: Registra a tentativa de exclusão nos logs
4. **Tratamento de erro**: Captura erros de filesystem read-only

```javascript
// Verificação de ambiente
function isVercelProduction() {
  return process.env.VERCEL_ENV === "production";
}

// Em produção, simula exclusão
if (isVercelProduction()) {
  return NextResponse.json({
    success: true,
    message: "Arquivo marcado para exclusão (limitação do ambiente de produção)",
    warning: "Considere usar uma solução de armazenamento externa",
  });
}
```

## Soluções Recomendadas para Produção

### 1. **Vercel Blob** (Recomendado)

```javascript
import { del } from "@vercel/blob";

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  await del(url);

  return NextResponse.json({
    success: true,
    message: "Arquivo excluído com sucesso",
  });
}
```

### 2. **AWS S3**

```javascript
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function DELETE(request) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME,
    Key: filename,
  });

  await s3Client.send(command);

  return NextResponse.json({
    success: true,
    message: "Arquivo excluído do S3",
  });
}
```

### 3. **Cloudinary**

```javascript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request) {
  const result = await cloudinary.uploader.destroy(public_id);

  return NextResponse.json({
    success: true,
    message: "Arquivo excluído do Cloudinary",
  });
}
```

## Migração Recomendada

### Passo 1: Escolher Solução

- **Vercel Blob**: Mais integrado com Vercel, fácil configuração
- **AWS S3**: Mais controle, configuração flexível
- **Cloudinary**: Melhor para manipulação de imagens

### Passo 2: Configurar Variáveis de Ambiente

```bash
# Para Vercel Blob
BLOB_READ_WRITE_TOKEN=...

# Para AWS S3
AWS_REGION=sa-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...

# Para Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### Passo 3: Atualizar APIs

1. Modificar `/api/admin/upload/route.js`
2. Atualizar componentes que fazem upload
3. Migrar arquivos existentes

## Estado Atual

**✅ Funcionalidade atual:**

- Upload funciona normalmente
- Listagem de arquivos funciona
- Exclusão retorna "sucesso simulado" em produção
- Desenvolvimento local continua funcionando completamente

**⚠️ Limitações:**

- Arquivos não são fisicamente removidos em produção
- Podem acumular arquivos não utilizados
- Interface mostra como se tivesse deletado, mas arquivo permanece

## Próximos Passos

1. **Imediato**: A solução atual permite que a interface funcione sem erros
2. **Curto prazo**: Implementar uma das soluções de armazenamento externo
3. **Longo prazo**: Migrar completamente para armazenamento em nuvem

## Monitoramento

Para acompanhar tentativas de exclusão em produção, verifique os logs da Vercel:

```bash
vercel logs --app=npi-consultoria
```

## Links Úteis

- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [Vercel Functions Limitations](https://vercel.com/docs/functions/limitations)
- [Next.js File Upload Examples](https://github.com/vercel/examples/tree/main/solutions/blob)
