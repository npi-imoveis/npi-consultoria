import { connectToDatabase } from "@/app/lib/mongodb";
import Proprietarios from "@/app/models/Proprietarios";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = request.nextUrl;
        const id = searchParams.get("id");

        await connectToDatabase();

        // Se tiver ID, busca corretor específico
        if (id) {
            const corretor = await Proprietarios.findOne({ codigoC: id });
            return NextResponse.json({
                status: 200,
                data: corretor || null
            });
        }

        // Caso contrário, retorna lista paginada
        const limit = parseInt(searchParams.get("limit") || "25", 10);
        const page = parseInt(searchParams.get("page") || "1", 10);
        const skip = (page - 1) * limit;

        // Buscar todos os proprietários sem filtro
        const filter = { proprietario: "Sim" };

        const [totalItems, proprietarios] = await Promise.all([
            Proprietarios.countDocuments(filter),
            Proprietarios.find(filter).limit(limit).skip(skip)
        ]);

        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            status: 200,
            data: proprietarios,
            paginacao: {
                totalItems,
                totalPages,
                currentPage: page,
                limit,
            },
        });
    } catch (error) {
        console.error("Erro ao buscar proprietarios:", error);
        return NextResponse.json({ error: "Erro ao buscar proprietarios" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const data = await request.json();
        const { id, ...updateData } = data;

        await connectToDatabase();

        const corretor = await Proprietarios.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!corretor) {
            return NextResponse.json(
                { error: "Proprietario não encontrado" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Proprietario atualizado com sucesso",
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
