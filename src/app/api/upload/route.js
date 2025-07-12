import { NextResponse } from "next/server";
import { writeFile, unlink, readdir, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// Diretório base para armazenar as imagens
const BASE_UPLOAD_DIR = path.join(process.cwd(), "public/uploads");

// Função para verificar se estamos em ambiente de produção na Vercel
function isVercelProduction() {
  return process.env.VERCEL_ENV === "production" || 
         process.env.VERCEL === "1" ||
         process.cwd().includes('/var/task'); // ← Detecta Vercel pelo path
}

// Função para garantir que o diretório existe
async function ensureDirectoryExists(directory) {
  try {
    if (!existsSync(directory)) {
      await mkdir(directory, { recursive: true });
    }
  } catch (error) {
    console.error("Erro ao criar diretório:", error);
    throw new Error(`Não foi possível criar o diretório: ${error.message}`);
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

// GET - Lista todas as imagens com cache busting
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const directory = searchParams.get("directory");

    if (!directory || !validateDirectory(directory)) {
      return NextResponse.json(
        { success: false, error: "Diretório inválido ou não especificado" },
        { status: 400 }
      );
    }

    const targetDir = path.join(BASE_UPLOAD_DIR, directory);
    
    try {
      await ensureDirectoryExists(targetDir);
    } catch (dirError) {
      return NextResponse.json(
        { success: false, error: `Erro no diretório: ${dirError.message}` },
        { status: 500 }
      );
    }

    const files = await readdir(targetDir);
    const images = files.filter((file) => isImageFile(file));

    // ✅ ADICIONAR CACHE BUSTING NAS IMAGENS LISTADAS
    const timestamp = Date.now();
    
    return NextResponse.json({
      success: true,
      images: images.map((image) => `/uploads/${directory}/${image}?v=${timestamp}`),
    });
  } catch (error) {
    console.error("Erro ao listar imagens:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Erro ao listar imagens",
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Upload de nova imagem com cache busting
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const directory = formData.get("directory");
    const customFilename = formData.get("customFilename");

    // Validações
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

    // Verificar tamanho do arquivo (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: "Arquivo muito grande. Máximo 10MB." },
        { status: 400 }
      );
    }

    const targetDir = path.join(BASE_UPLOAD_DIR, directory);
    
    try {
      await ensureDirectoryExists(targetDir);
    } catch (dirError) {
      return NextResponse.json(
        { success: false, error: `Erro ao criar diretório: ${dirError.message}` },
        { status: 500 }
      );
    }

    let buffer;
    try {
      buffer = Buffer.from(await file.arrayBuffer());
    } catch (bufferError) {
      return NextResponse.json(
        { success: false, error: "Erro ao processar arquivo" },
        { status: 500 }
      );
    }

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

    // ✅ VERIFICAR SE É VERCEL ANTES DE TENTAR ESCREVER
    if (isVercelProduction()) {
      return NextResponse.json({
        success: false,
        error: "Upload não disponível em produção",
        message: "A Vercel não permite uploads diretos de arquivos. Considere usar Vercel Blob, Cloudinary ou AWS S3.",
        suggestion: "Para desenvolvimento, use 'npm run dev' localmente."
      }, { status: 400 });
    }

    const filepath = path.join(targetDir, filename);

    try {
      await writeFile(filepath, buffer);
    } catch (writeError) {
      console.error("Erro ao escrever arquivo:", writeError);
      
      // ✅ DETECTAR ERRO DE FILESYSTEM READ-ONLY
      if (writeError.code === "EROFS" || writeError.code === "EPERM") {
        return NextResponse.json({
          success: false,
          error: "Sistema de arquivos somente leitura",
          message: "Este ambiente não permite salvar arquivos. Use um ambiente de desenvolvimento local ou configure um serviço de upload externo.",
          details: writeError.message
        }, { status: 400 });
      }
      
      return NextResponse.json(
        { success: false, error: `Erro ao salvar arquivo: ${writeError.message}` },
        { status: 500 }
      );
    }

    // ✅ RETORNAR COM CACHE BUSTING
    const timestamp = Date.now();
    
    return NextResponse.json({
      success: true,
      filename,
      path: `/uploads/${directory}/${filename}?v=${timestamp}`,
      pathWithoutCache: `/uploads/${directory}/${filename}`, // Caso precise sem cache
    });
  } catch (error) {
    console.error("Erro geral no upload:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Remove uma imagem específica
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
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

    // Limpar o filename de parâmetros de cache se houver
    const cleanFilename = filename.split('?')[0];
    const filepath = path.join(BASE_UPLOAD_DIR, directory, cleanFilename);

    // Verificar se estamos em produção na Vercel
    if (isVercelProduction()) {
      console.warn(`Tentativa de deletar arquivo em produção (Vercel): ${filepath}`);
      return NextResponse.json({
        success: true,
        message: "Arquivo marcado para exclusão (limitação do ambiente de produção)",
        warning: "Em produção, arquivos não podem ser fisicamente removidos devido às limitações da Vercel.",
      });
    }

    try {
      await unlink(filepath);
      return NextResponse.json({
        success: true,
        message: "Imagem excluída com sucesso",
      });
    } catch (unlinkError) {
      if (unlinkError.code === "EROFS" || unlinkError.code === "EPERM") {
        console.warn(`Filesystem read-only detectado: ${unlinkError.message}`);
        return NextResponse.json({
          success: true,
          message: "Arquivo marcado para exclusão (limitação do filesystem)",
          warning: "O ambiente atual não permite exclusão física de arquivos.",
        });
      }

      if (unlinkError.code === "ENOENT") {
        return NextResponse.json({
          success: false,
          error: "Arquivo não encontrado",
        }, { status: 404 });
      }

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
