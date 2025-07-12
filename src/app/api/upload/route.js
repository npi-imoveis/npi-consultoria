import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        // Obter os dados do corpo da requisição
        const body = await request.json();
        const { bucket, key, contentType, file } = body;

        // ✅ MELHORIA 1: Validação mais detalhada
        if (!bucket || !key || !contentType || !file) {
            console.error('Parâmetros faltando:', { bucket: !!bucket, key: !!key, contentType: !!contentType, file: !!file });
            return NextResponse.json(
                { message: 'Parâmetros inválidos' },
                { status: 400 }
            );
        }

        // ✅ MELHORIA 2: Verificar variáveis de ambiente
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            console.error('Credenciais AWS não configuradas');
            return NextResponse.json(
                { message: 'Credenciais AWS não configuradas' },
                { status: 500 }
            );
        }

        // ✅ MELHORIA 3: Validar formato Base64
        if (!file.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
            console.error('Arquivo não está em formato Base64 válido');
            return NextResponse.json(
                { message: 'Formato de arquivo inválido' },
                { status: 400 }
            );
        }

        // Converter o arquivo Base64 de volta para Buffer
        const fileBuffer = Buffer.from(file, 'base64');

        // ✅ MELHORIA 4: Validar tamanho do arquivo (5MB max)
        if (fileBuffer.length > 5 * 1024 * 1024) {
            console.error('Arquivo muito grande:', fileBuffer.length);
            return NextResponse.json(
                { message: 'Arquivo muito grande (máximo 5MB)' },
                { status: 400 }
            );
        }

        console.log('Iniciando upload para S3:', { bucket, key, size: fileBuffer.length });

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
            // ✅ MELHORIA 5: Adicionar ACL para acesso público
            ACL: 'public-read',
        };

        // Criar o comando para o upload
        const command = new PutObjectCommand(params);

        // Executar o comando de upload
        await s3Client.send(command);

        // Retornar a URL do arquivo
        const fileUrl = `https://${bucket}.s3.amazonaws.com/${key}`;
        
        console.log('Upload realizado com sucesso:', fileUrl );

        // Retornar sucesso
        return NextResponse.json({
            success: true,
            message: 'Arquivo enviado com sucesso',
            url: fileUrl,
        });
    } catch (error) {
        // ✅ MELHORIA 6: Log mais detalhado do erro
        console.error('Erro detalhado no upload:', {
            message: error.message,
            code: error.code,
            statusCode: error.$metadata?.httpStatusCode,
            stack: error.stack
        } );

        // Retornar erro
        return NextResponse.json(
            {
                success: false,
                message: 'Erro ao enviar arquivo: ' + error.message,
                // ✅ MELHORIA 7: Incluir código do erro para debug
                errorCode: error.code || 'UNKNOWN_ERROR'
            },
            { status: 500 }
        );
    }
}
