import { connectToDatabase } from "@/app/lib/mongodb";
import Imovel from "@/app/models/Imovel";

import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const url = new URL(request.url);

        await connectToDatabase();

        // Remover filtro e retornar apenas os slugs de todos os imóveis
        const slugs = await Imovel.find({}, { Slug: 1, _id: 0 });

        return NextResponse.json({
            status: 200,
            data: slugs.map(item => item.Slug),
        });
    } catch (error) {
        console.error("Erro ao buscar slugs de imóveis:", error);
        return NextResponse.json(
            {
                message: "Erro ao buscar slugs de imóveis",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            },
            { status: 500 }
        );
    }
}
