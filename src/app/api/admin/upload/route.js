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

// Função para validar o diretório (EXPANDIDA para incluir servicos)
function validateDirectory(dir) {
  // Lista de diretórios permitidos (MANTIDOS OS ORIGINAIS + servicos)
  const allowedDirs = ["parceiros", "home", "sobre_hub", "sobre_npi", "historia", "servicos"];
  return allowedDirs.includes(dir);
}

// NOVA: Função para validar subdiretórios de serviços
function validateServiceSubdirectory(subdir) {
  const allowedSubdirs = ["atendimentoPersonalizado", "avaliacaoImoveis", "assessoriaJuridica"];
  return allowedSubdirs.includes(subdir);
}

// GET - Lista todas as imagens (MANTIDO ORIGINAL + suporte a subdiretórios)
export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;
    const directory = searchParams.get("directory");
    const subdirectory = searchParams.get("subdirectory"); // NOVO parâmetro opcional

    if (!directory || !validateDirectory(directory)) {
      return NextResponse.json(
        { success: false, error: "Diretório inválido ou não especificado" },
        { status: 400 }
      );
    }

    // NOVO: Validação para subdiretórios de serviços
    if (directory === "servicos" && subdirectory && !validateServiceSubdirectory(subdirectory)) {
      return NextResponse.json(
        { success: false, error: "Subdiretório de serviços inválido" },
        { status: 400 }
      );
    }

    // NOVO: Construir caminho com ou sem subdiretório
    let targetDir;
    let urlPath;
    
    if (directory === "servicos" && subdirectory) {
      targetDir = path.join(BASE_UPLOAD_DIR, directory, subdirectory);
      urlPath = `uploads/${directory}/${subdirectory}`;
    } else {
      targetDir = path.join(BASE_UPLOAD_DIR, directory);
      urlPath = `uploads/${directory}`;
    }

    await ensureDirectoryExists(targetDir);

    const files = await readdir(targetDir);
    const images = files.filter((file) => isImageFile(file));

    return NextResponse.json({
      success: true,
      images: images.map((image) => `/${urlPath}/${image}`),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Erro ao listar imagens" }, { status: 500 });
  }
}

// POST - Upload de nova imagem (EXPANDIDO para suportar subdiretórios)
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const directory = formData.get("directory");
    const customFilename = formData.get("customFilename");
    
    // NOVO: Suporte aos parâmetros do sistema de serviços
    const section = formData.get("section");
    const subsection = formData.get("subsection");

    // COMPATIBILIDADE: Se section/subsection forem fornecidos, usar essa estrutura
    let finalDirectory, finalSubdirectory;
    
    if (section === "servicos" && subsection) {
      finalDirectory = "servicos";
      finalSubdirectory = subsection;
    } else if (directory) {
      // Usar sistema original
      finalDirectory = directory;
      finalSubdirectory = formData.get("subdirectory");
    } else {
      return NextResponse.json(
        { success: false, error: "Diretório não especificado" },
        { status: 400 }
      );
    }

    if (!validateDirectory(finalDirectory)) {
      return NextResponse.json(
        { success: false, error: "Diretório inválido" },
        { status: 400 }
      );
    }

    // NOVO: Validação para subdiretórios de serviços
    if (finalDirectory === "servicos" && finalSubdirectory && !validateServiceSubdirectory(finalSubdirectory)) {
      return NextResponse.json(
        { success: false, error: "Subdiretório de serviços inválido" },
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

    // NOVO: Construir diretório de destino
    let targetDir, urlPath;
    
    if (finalDirectory === "servicos" && finalSubdirectory) {
      targetDir = path.join(BASE_UPLOAD_DIR, finalDirectory, finalSubdirectory);
      urlPath = `uploads/${finalDirectory}/${finalSubdirectory}`;
    } else {
      targetDir = path.join(BASE_UPLOAD_DIR, finalDirectory);
      urlPath = `uploads/${finalDirectory}`;
    }

    await ensureDirectoryExists(targetDir);

    const buffer = Buffer.from(await file.arrayBuffer());

    // Determinar o nome do arquivo (MANTIDO ORIGINAL)
    let filename;
    if (customFilename) {
      const originalExt = path.extname(file.name).toLowerCase();
      if (path.extname(customFilename).toLowerCase() === "") {
        filename = `${customFilename}${originalExt}`;
      } else {
        filename = customFilename;
      }
    } else {
      // NOVO: Para serviços, criar nome mais organizado
      if (finalDirectory === "servicos" && finalSubdirectory) {
        const timestamp = Date.now();
        const originalExt = path.extname(file.name).toLowerCase();
        const sanitizedName = file.name.replace(originalExt, "").replace(/[^a-zA-Z0-9.-]/g, "_");
        filename = `${finalSubdirectory}-${sanitizedName}-${timestamp}${originalExt}`;
      } else {
        // Usar sistema original
        filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      }
    }

    const filepath = path.join(targetDir, filename);

    await writeFile(filepath, buffer);

    // RESPOSTA EXPANDIDA (mantém compatibilidade + novos campos)
    const response = {
      success: true,
      filename,
      path: `/${urlPath}/${filename}`,
      url: `/${urlPath}/${filename}`, // Adicionar 'url' para compatibilidade com sistema de serviços
    };

    // Adicionar informações extras se for upload de serviços
    if (finalDirectory === "servicos" && finalSubdirectory) {
      response.section = "servicos";
      response.subsection = finalSubdirectory;
    }

    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}

// DELETE - Remove uma imagem específica (EXPANDIDO para subdiretórios)
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const filename = searchParams.get("filename");
    const directory = searchParams.get("directory");
    const subdirectory = searchParams.get("subdirectory"); // NOVO parâmetro opcional

    if (!directory || !validateDirectory(directory)) {
      return NextResponse.json(
        { success: false, error: "Diretório inválido ou não especificado" },
        { status: 400 }
      );
    }

    // NOVO: Validação para subdiretórios de serviços
    if (directory === "servicos" && subdirectory && !validateServiceSubdirectory(subdirectory)) {
      return NextResponse.json(
        { success: false, error: "Subdiretório de serviços inválido" },
        { status: 400 }
      );
    }

    if (!filename) {
      return NextResponse.json(
        { success: false, error: "Nome do arquivo não especificado" },
        { status: 400 }
      );
    }

    // NOVO: Construir caminho com ou sem subdiretório
    let filepath;
    if (directory === "servicos" && subdirectory) {
      filepath = path.join(BASE_UPLOAD_DIR, directory, subdirectory, filename);
    } else {
      filepath = path.join(BASE_UPLOAD_DIR, directory, filename);
    }

    // Verificar se estamos em produção na Vercel (MANTIDO ORIGINAL)
    if (isVercelProduction()) {
      console.warn(`Tentativa de deletar arquivo em produção (Vercel): ${filepath}`);
      return NextResponse.json({
        success: true,
        message: "Arquivo marcado para exclusão (limitação do ambiente de produção)",
        warning:
          "Em produção, arquivos não podem ser fisicamente removidos devido às limitações da Vercel. Considere usar uma solução de armazenamento externa como AWS S3, Cloudinary ou Vercel Blob.",
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
          warning:
            "O ambiente atual não permite exclusão física de arquivos. Considere usar uma solução de armazenamento externa.",
        });
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
