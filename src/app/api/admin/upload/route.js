import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Obter os dados do corpo da requisição
        const body = await request.json();
        const { bucket, key, contentType, file } = body;

        // Validar os dados recebidos
        if (!bucket || !key || !contentType || !file) {
            return NextResponse.json(
                { message: 'Parâmetros inválidos' },
                { status: 400 }
            );
        }

        // Converter o arquivo Base64 de volta para Buffer
        const fileBuffer = Buffer.from(file, 'base64');

        // Inicializar o cliente S3
        const s3Client = new S3Client({
            region: process.env.AWS_REGION || 'sa-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });

        // Configurar os parâmetros para o upload
        const params = {
            Bucket: bucket,
            Key: key,
            Body: fileBuffer,
            ContentType: contentType,
        };

        // Criar o comando para o upload
        const command = new PutObjectCommand(params);

        // Executar o comando de upload
        await s3Client.send(command);

        // Retornar a URL do arquivo
        const fileUrl = `https://${bucket}.s3.amazonaws.com/${key}`;

        // Retornar sucesso
        return NextResponse.json({
            success: true,
            message: 'Arquivo enviado com sucesso',
            url: fileUrl,
        });
    } catch (error) {
        console.error('Erro no upload:', error);

        // Retornar erro
        return NextResponse.json(
            {
                success: false,
                message: 'Erro ao enviar arquivo: ' + error.message
            },
            { status: 500 }
        );
    }
} 
