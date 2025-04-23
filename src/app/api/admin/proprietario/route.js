import Cadimo from "@/app/admin/models/cadimo";
import { connectToDatabase } from "@/app/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");

        await connectToDatabase();

        if (id) {
            const proprietario = await Cadimo.findOne({ PLACA: id });
            return NextResponse.json({
                status: 200,
                data: proprietario
            });
        }
    } catch (error) {
        console.error("Erro ao buscar proprietario:", error);
        return NextResponse.json({
            status: 500,
            message: "Erro ao buscar proprietario"
        });
    }
}

export async function PUT(request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        const updateData = await request.json();

        await connectToDatabase();

        if (!id) {
            return NextResponse.json({
                status: 400,
                message: "ID (PLACA) não informado"
            }, { status: 400 });
        }

        const proprietarioAtualizado = await Cadimo.findOneAndUpdate(
            { PLACA: id },
            { $set: updateData },
            { new: true }
        );

        if (!proprietarioAtualizado) {
            return NextResponse.json({
                status: 404,
                message: "Proprietário não encontrado"
            }, { status: 404 });
        }

        return NextResponse.json({
            status: 200,
            message: "Proprietário atualizado com sucesso",
            data: proprietarioAtualizado
        });
    } catch (error) {
        console.error("Erro ao atualizar proprietario:", error);
        return NextResponse.json({
            status: 500,
            message: "Erro ao atualizar proprietario"
        }, { status: 500 });
    }
}


