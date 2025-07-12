import { writeFile, mkdir } from 'fs/promises';
import { NextResponse } from 'next/server';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Assegura que o diretório de uploads existe
async function ensureDirectoryExists(directory) {
    try {
        await mkdir(directory, { recursive: true });
    } catch (error) {
        if (error.code !== 'EEXIST') {
            throw error;
        }
    }
}

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json(
                { success: false, message: 'Nenhum arquivo enviado' },
                { status: 400 }
            );
        }

        // Verificar se o arquivo é uma imagem
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: 'O arquivo deve ser uma imagem' },
                { status: 400 }
            );
        }

        // Obter a extensão do arquivo
        const fileExtension = file.name.split('.').pop().toLowerCase();

        // Criar um nome único para o arquivo
        const fileName = `${uuidv4()}.${fileExtension}`;

        // Diretório para salvar as imagens
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'home');

        // Garantir que o diretório exista
        await ensureDirectoryExists(uploadDir);

        // Caminho completo do arquivo
        const filePath = join(uploadDir, fileName);

        // Converter o arquivo para array buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Escrever o arquivo no diretório
        await writeFile(filePath, buffer);

        // Caminho relativo para acessar a imagem (para uso no frontend)
        const relativePath = `/uploads/home/${fileName}`;

        return NextResponse.json({
            success: true,
            message: 'Arquivo enviado com sucesso',
            filePath: relativePath
        });
    } catch (error) {
        console.error('Erro no upload:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Erro ao enviar arquivo: ' + error.message
            },
            { status: 500 }
        );
    }
} 
