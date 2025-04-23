import { connectToDatabase } from "@/app/lib/mongodb";
import Corretores from "@/app/models/Corretores";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        await connectToDatabase();

        // Se tiver ID, busca corretor específico
        if (id) {
            const corretor = await Corretores.findOne({ codigoD: id });
            return NextResponse.json({
                status: 200,
                data: corretor || null
            });
        }

        // Caso contrário, retorna lista paginada
        const limit = parseInt(url.searchParams.get("limit") || "25", 10);
        const page = parseInt(url.searchParams.get("page") || "1", 10);
        const skip = (page - 1) * limit;

        // Filtro para corretores não inativos
        const filter = { inativo: "Nao" };

        const [totalItems, corretores] = await Promise.all([
            Corretores.countDocuments(filter),
            Corretores.find(filter).limit(limit).skip(skip)
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            status: 200,
            data: corretores,
            paginacao: {
                totalItems,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("Erro ao buscar corretores:", error);
        return NextResponse.json({ error: "Erro ao buscar corretores" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        await connectToDatabase();

        const corretor = await Corretores.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!corretor) {
            return NextResponse.json(
                { error: "Corretor não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Corretor atualizado com sucesso",
            data: corretor
        });
    } catch (error) {
        console.error("Erro ao atualizar corretor:", error);
        return NextResponse.json(
            { error: "Erro ao atualizar corretor" },
            { status: 500 }
        );
    }
}
