import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

// Configuração do cliente S3 (melhor como singleton)
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'sa-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Aumente conforme necessário
    },
  },
};

export async function POST(request) {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // Verificar método OPTIONS para CORS preflight
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers });
    }

    // Verificar método POST
    if (request.method !== 'POST') {
      return new NextResponse(
        JSON.stringify({ message: 'Método não permitido' }),
        { status: 405, headers }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const bucket = formData.get('bucket') || process.env.S3_BUCKET;
    const key = formData.get('key');
    const contentType = formData.get('contentType') || file.type;

    if (!file || !bucket || !key) {
      return new NextResponse(
        JSON.stringify({ message: 'Parâmetros inválidos' }),
        { status: 400, headers }
      );
    }

    const fileBuffer = await file.arrayBuffer();

    const params = {
      Bucket: bucket,
      Key: key,
      Body: Buffer.from(fileBuffer),
      ContentType: contentType,
    };

    await s3Client.send(new PutObjectCommand(params));

    const fileUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

    return new NextResponse(
      JSON.stringify({
        success: true,
        url: fileUrl,
      }),
      { headers }
    );

  } catch (error) {
    console.error('Erro no upload:', error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      { status: 500, headers }
    );
  }
}
