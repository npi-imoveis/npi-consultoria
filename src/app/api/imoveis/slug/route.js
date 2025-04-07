import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";

import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const url = new URL(request.url);

        await connectToDatabase();

        // Buscar Slug e Codigo de todos os imóveis
        const imoveis = await Imovel.find({}, { Slug: 1, Codigo: 1, _id: 0 });

        return NextResponse.json({
            status: 200,
            data: imoveis.map(item => ({ Codigo: item.Codigo, Slug: item.Slug })),
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
