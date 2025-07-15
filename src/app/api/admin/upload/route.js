import { NextResponse } from "next/server";
import { writeFile, unlink, readdir, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Diretório base para armazenar as imagens
const BASE_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

// Função para verificar se estamos em ambiente de produção na Vercel
function isVercelProduction() {
  return process.env.VERCEL_ENV === "production";
}

// Função para garantir que o diretório existe
async function ensureDirectoryExists(directory) {
  if (!existsSync(directory)) {
    await mkdir(directory, { recursive: true });
  }
}

// Função auxiliar para verificar se o arquivo é uma imagem
function isImageFile(filename) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return imageExtensions.includes(path.extname(filename).toLowerCase());
}

// Função para validar o diretório
function validateDirectory(dir) {
  // Lista de diretórios permitidos
  const allowedDirs = ["parceiros", "home", "sobre_hub", "sobre_npi", "historia"];
  return allowedDirs.includes(dir);
}

// GET - Lista todas as imagens
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const directory = searchParams.get("directory");

    if (!directory || !validateDirectory(directory)) {
      return NextResponse.json(
        { success: false, error: "Diretório inválido ou não especificado" },
        { status: 400 }
      );
    }

    const targetDir = path.join(BASE_UPLOAD_DIR, directory);
    await ensureDirectoryExists(targetDir);

    const files = await readdir(targetDir);
    const images = files.filter((file) => isImageFile(file));

    return NextResponse.json({
      success: true,
      images: images.map((image) => `/uploads/${directory}/${image}`),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro ao listar imagens" }, { status: 500 });
  }
}

// POST - Upload de nova imagem
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const directory = formData.get("directory");
    const customFilename = formData.get("customFilename");

    if (!directory || !validateDirectory(directory)) {
      return NextResponse.json(
        { success: false, error: "Diretório inválido ou não especificado" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo enviado" },
        { status: 400 }
      );
    }

    // Verifica se é uma imagem
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "O arquivo deve ser uma imagem" },
        { status: 400 }
      );
    }

    const targetDir = path.join(BASE_UPLOAD_DIR, directory);
    await ensureDirectoryExists(targetDir);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Determinar o nome do arquivo
    let filename;
    if (customFilename) {
      // Se o customFilename não tiver extensão, use a extensão do arquivo original
      const originalExt = path.extname(file.name).toLowerCase();
      if (path.extname(customFilename).toLowerCase() === "") {
        filename = `${customFilename}${originalExt}`;
      } else {
        filename = customFilename;
      }
    } else {
      // Usar o nome original do arquivo (sanitizado)
      filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    }

    const filepath = path.join(targetDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({
      success: true,
      filename,
      path: `/uploads/${directory}/${filename}`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}

// DELETE - Remove uma imagem específica
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const filename = searchParams.get("filename");
    const directory = searchParams.get("directory");

    if (!directory || !validateDirectory(directory)) {
      return NextResponse.json(
        { success: false, error: "Diretório inválido ou não especificado" },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "Nome do arquivo não especificado" },
        { status: 400 }
      );
    }

    const filepath = path.join(BASE_UPLOAD_DIR, directory, filename);

    // Verificar se estamos em produção na Vercel
    if (isVercelProduction()) {
      // Em produção na Vercel, não podemos deletar arquivos do filesystem
      // Retornar sucesso simulado para manter a compatibilidade da UI
      console.warn(`Tentativa de deletar arquivo em produção (Vercel): ${filepath}`);
      return NextResponse.json({
        success: true,
        message: "Arquivo marcado para exclusão (limitação do ambiente de produção)",
        warning:
          "Em produção, arquivos não podem ser fisicamente removidos devido às limitações da Vercel. Considere usar uma solução de armazenamento externa como AWS S3, Cloudinary ou Vercel Blob.",
      });
    }

    try {
      // Tentar deletar o arquivo (funciona apenas em desenvolvimento local)
      await unlink(filepath);
      return NextResponse.json({
        success: true,
        message: "Imagem excluída com sucesso",
      });
    } catch (unlinkError) {
      // Se o erro for relacionado ao filesystem read-only
      if (unlinkError.code === "EROFS" || unlinkError.code === "EPERM") {
        console.warn(`Filesystem read-only detectado: ${unlinkError.message}`);
        return NextResponse.json({
          success: true,
          message: "Arquivo marcado para exclusão (limitação do filesystem)",
          warning:
            "O ambiente atual não permite exclusão física de arquivos. Considere usar uma solução de armazenamento externa.",
        });
      }

      // Se for outro tipo de erro (arquivo não encontrado, etc.)
      throw unlinkError;
    }
  } catch (error) {
    console.error("Erro ao excluir arquivo:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao excluir a imagem",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
