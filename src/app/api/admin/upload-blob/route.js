import { NextResponse } from "next/server";
import { put, del, list } from "@vercel/blob";

// Função para validar o diretório
function validateDirectory(dir) {
  const allowedDirs = ["parceiros", "home", "sobre_hub", "sobre_npi", "historia"];
  return allowedDirs.includes(dir);
}

// Função auxiliar para verificar se o arquivo é uma imagem
function isImageFile(filename) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

// GET - Lista todas as imagens do diretório especificado
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

    // Listar arquivos do Vercel Blob com prefixo do diretório
    const { blobs } = await list({
      prefix: `${directory}/`,
      limit: 100,
    });

    // Filtrar apenas imagens
    const images = blobs.filter((blob) => isImageFile(blob.pathname)).map((blob) => blob.url);

    return NextResponse.json({
      success: true,
      images: images,
    });
  } catch (error) {
    console.error("Erro ao listar imagens:", error);
    return NextResponse.json({ success: false, error: "Erro ao listar imagens" }, { status: 500 });
  }
}

// POST - Upload de nova imagem para Vercel Blob
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

    // Determinar o nome do arquivo
    let filename;
    if (customFilename) {
      const originalExt = file.name.split(".").pop();
      if (!customFilename.includes(".")) {
        filename = `${customFilename}.${originalExt}`;
      } else {
        filename = customFilename;
      }
    } else {
      // Usar o nome original do arquivo (sanitizado)
      filename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    }

    // Criar pathname com o diretório
    const pathname = `${directory}/${filename}`;

    // Upload para Vercel Blob
    const blob = await put(pathname, file, {
      access: "public",
      addRandomSuffix: false, // Para manter o nome exato
    });

    return NextResponse.json({
      success: true,
      filename,
      path: blob.url,
      blobUrl: blob.url,
    });
  } catch (error) {
    console.error("Erro no upload:", error);
    return NextResponse.json(
      { success: false, error: "Erro ao fazer upload da imagem" },
      { status: 500 }
    );
  }
}

// DELETE - Remove uma imagem específica do Vercel Blob
export async function DELETE(request) {
  try {
    const { searchParams } = request.nextUrl;
    const url = searchParams.get("url");
    const filename = searchParams.get("filename");
    const directory = searchParams.get("directory");

    if (!directory || !validateDirectory(directory)) {
      return NextResponse.json(
        { success: false, error: "Diretório inválido ou não especificado" },
        { status: 400 }
      );
    }

    let blobUrl = url;

    // Se não foi fornecida a URL completa, construir baseado no filename
    if (!blobUrl && filename) {
      // Listar blobs para encontrar a URL exata
      const { blobs } = await list({
        prefix: `${directory}/${filename}`,
        limit: 1,
      });

      if (blobs.length === 0) {
        return NextResponse.json(
          { success: false, error: "Arquivo não encontrado" },
          { status: 404 }
        );
      }

      blobUrl = blobs[0].url;
    }

    if (!blobUrl) {
      return NextResponse.json(
        { success: false, error: "URL do arquivo não especificada" },
        { status: 400 }
      );
    }

    // Deletar do Vercel Blob
    await del(blobUrl);

    return NextResponse.json({
      success: true,
      message: "Imagem excluída com sucesso do Vercel Blob",
    });
  } catch (error) {
    console.error("Erro ao excluir arquivo:", error);

    // Vercel Blob pode retornar erro se arquivo não existir
    if (error.message?.includes("not found")) {
      return NextResponse.json({
        success: true,
        message: "Arquivo já foi removido ou não existe",
      });
    }

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
