import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client
const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Bucket name
const bucketName = process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'npi-imoveis';

/**
 * Gera metadados para upload de imagem, sem fazer upload direto
 * @param {File} file - O arquivo a ser enviado
 * @returns {Promise<Object>} - Objeto contendo informações para upload
 */
export const getImageUploadMetadata = async (file) => {
    if (!file) throw new Error("File is required");

    const fileExtension = file.name.split('.').pop();
    const contentType = file.type;

    // Criar uma chave única para o arquivo
    const key = `imagens_baixadas/${uuidv4()}.${fileExtension}`;

    // A URL final onde o arquivo estará acessível após o upload
    const fileUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;

    return {
        file,
        key,
        contentType,
        fileUrl
    };
};

/**
 * Função para converter arquivo em Base64
 * @param {File} file - O arquivo para converter
 * @returns {Promise<string>} - String Base64 do arquivo
 */
const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Função para enviar arquivo para o S3 através de API intermediária
 * @param {Object} metadata - Metadados do arquivo
 * @returns {Promise<boolean>} - Se o upload foi bem-sucedido
 */
export const uploadToS3 = async (metadata) => {
    try {
        // Converter o arquivo para Base64
        const base64File = await fileToBase64(metadata.file);

        // Criar payload para enviar à API
        const payload = {
            bucket: bucketName,
            key: metadata.key,
            contentType: metadata.contentType,
            file: base64File
        };

        // Enviar para API intermediária
        // Vamos fazer isso através de uma rota local que depois se comunicará com o S3
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao fazer upload');
        }

        return true;
    } catch (error) {
        console.error("Erro no upload para S3:", error);
        throw error;
    }
}; 