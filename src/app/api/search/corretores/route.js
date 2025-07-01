export const dynamic = "force-dynamic";

import { NextResponse, NextRequest } from "next/server";
import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import ImovelAtivo from "@/app/models/ImovelAtivo";

export async function GET(req) {
  try {
    const request = req; // Tipagem para NextRequest
    const query = request.nextUrl.searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json({
        status: 200,
        data: [],
      });
    }

    await connectToDatabase();

    // Utilizando regex para busca funcional imediata
    const resultado = await Corretores.find({
      $or: [
        { nome: { $regex: query, $options: "i" } },
        { nomeCompleto: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { celular: { $regex: query, $options: "i" } },
      ],
    }).limit(20);

    return NextResponse.json({
      status: 200,
      data: resultado,
    });
  } catch (error) {
    console.error("Erro na busca:", error);
    return NextResponse.json({
      status: 500,
      error: error.message || "Erro desconhecido",
    });
  }
}
