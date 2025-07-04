import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";

import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = request.nextUrl;

    await connectToDatabase();

    // Buscar Slug e Codigo de todos os imóveis
    const imoveis = await Imovel.find({}, { Slug: 1, Codigo: 1, _id: 0 });

    // Filtro para remover slugs inválidos (ex: redes sociais, vazios, etc)
    const slugsInvalidos = [
      "facebook.com",
      "instagram.com",
      "twitter.com",
      "youtube.com",
      "linkedin.com",
      "tiktok.com",
      "wa.me",
      "whatsapp.com",
      "mailto:",
      "http://",
      "https://",
      "www.",
    ];

    const imoveisFiltrados = imoveis.filter((item) => {
      if (!item.Slug || typeof item.Slug !== "string") return false;
      const slugLower = item.Slug.toLowerCase();
      return !slugsInvalidos.some((invalido) => slugLower.includes(invalido));
    });

    return NextResponse.json({
      status: 200,
      data: imoveisFiltrados.map((item) => ({ Codigo: item.Codigo, Slug: item.Slug })),
    });
  } catch (error) {
    console.error("Erro ao buscar dados de imóveis:", error);
    return NextResponse.json(
      {
        message: "Erro ao buscar dados de imóveis",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
