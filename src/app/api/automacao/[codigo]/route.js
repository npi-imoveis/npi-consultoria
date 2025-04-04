import { connectToDatabaseAutomacao } from "@/app/lib/mongodb";
import Review from "@/app/models/Review";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const { codigo } = params;

        if (!codigo) {
            return NextResponse.json(
                {
                    message: "Código do imóvel não informado",
                    error: "Código do imóvel não informado"
                },
                { status: 400 }
            );
        }

        console.log(`API automacao: Buscando imóvel com código: ${codigo}`);

        await connectToDatabaseAutomacao();
        console.log("API automacao: Collection:", Review.collection.name);

        // Buscar o imóvel pelo código
        const imovel = await Review.findOne({ Codigo: codigo });

        if (!imovel) {
            console.log(`API automacao: Imóvel com código ${codigo} não encontrado`);
            return NextResponse.json(
                {
                    message: "Imóvel não encontrado",
                    error: "Imóvel não encontrado"
                },
                { status: 404 }
            );
        }

        console.log(`API automacao: Imóvel encontrado: ${imovel.Empreendimento || "Sem nome"}`);

        return NextResponse.json({
            status: 200,
            data: imovel,
        });
    } catch (error) {
        console.error(`API automacao: Erro ao buscar imóvel:`, error);
        return NextResponse.json(
            {
                message: "Erro ao buscar imóvel",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            },
            { status: 500 }
        );
    }
}

export async function POST(request, { params }) {
    try {
        const { codigo } = params;

        if (!codigo) {
            return NextResponse.json(
                {
                    message: "Código do imóvel não informado",
                    error: "Código do imóvel não informado"
                },
                { status: 400 }
            );
        }

        const body = await request.json();

        console.log(`API automacao: Atualizando imóvel com código: ${codigo}`);

        await connectToDatabaseAutomacao();
        console.log("API automacao: Collection:", Review.collection.name);

        // Verificar se o imóvel existe
        const imovelExistente = await Review.findOne({ Codigo: codigo });

        if (!imovelExistente) {
            console.log(`API automacao: Imóvel com código ${codigo} não encontrado para atualização`);
            return NextResponse.json(
                {
                    message: "Imóvel não encontrado",
                    error: "Imóvel não encontrado"
                },
                { status: 404 }
            );
        }

        // Atualizar o imóvel
        const imovelAtualizado = await Review.findOneAndUpdate(
            { Codigo: codigo },
            body,
            { new: true }
        );

        console.log(`API automacao: Imóvel atualizado: ${imovelAtualizado.Empreendimento || "Sem nome"}`);

        return NextResponse.json({
            status: 200,
            success: true,
            message: "Imóvel atualizado com sucesso",
            data: imovelAtualizado,
        });
    } catch (error) {
        console.error(`API automacao: Erro ao atualizar imóvel:`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Erro ao atualizar imóvel",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const { codigo } = params;

        if (!codigo) {
            return NextResponse.json(
                {
                    message: "Código do imóvel não informado",
                    error: "Código do imóvel não informado"
                },
                { status: 400 }
            );
        }

        const body = await request.json();

        console.log(`API automacao: Atualizando imóvel com código: ${codigo}`);

        await connectToDatabaseAutomacao();
        console.log("API automacao: Collection:", Review.collection.name);

        // Verificar se o imóvel existe
        const imovelExistente = await Review.findOne({ Codigo: codigo });

        if (!imovelExistente) {
            console.log(`API automacao: Imóvel com código ${codigo} não encontrado para atualização`);
            return NextResponse.json(
                {
                    message: "Imóvel não encontrado",
                    error: "Imóvel não encontrado"
                },
                { status: 404 }
            );
        }

        // Atualizar o imóvel
        const imovelAtualizado = await Review.findOneAndUpdate(
            { Codigo: codigo },
            { $set: body },
            { new: true }
        );

        console.log(`API automacao: Imóvel atualizado: ${imovelAtualizado.Empreendimento || "Sem nome"}`);

        return NextResponse.json({
            status: 200,
            success: true,
            message: "Imóvel atualizado com sucesso",
            data: imovelAtualizado,
        });
    } catch (error) {
        console.error(`API automacao: Erro ao atualizar imóvel:`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Erro ao atualizar imóvel",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const { codigo } = params;

        if (!codigo) {
            return NextResponse.json(
                {
                    message: "Código do imóvel não informado",
                    error: "Código do imóvel não informado"
                },
                { status: 400 }
            );
        }

        console.log(`API automacao: Excluindo imóvel com código: ${codigo}`);

        await connectToDatabaseAutomacao();
        console.log("API automacao: Collection:", Review.collection.name);

        // Verificar se o imóvel existe
        const imovelExistente = await Review.findOne({ Codigo: codigo });

        if (!imovelExistente) {
            console.log(`API automacao: Imóvel com código ${codigo} não encontrado para exclusão`);
            return NextResponse.json(
                {
                    message: "Imóvel não encontrado",
                    error: "Imóvel não encontrado"
                },
                { status: 404 }
            );
        }

        // Excluir o imóvel
        await Review.findOneAndDelete({ Codigo: codigo });

        console.log(`API automacao: Imóvel excluído com sucesso: ${codigo}`);

        return NextResponse.json({
            status: 200,
            success: true,
            message: "Imóvel excluído com sucesso",
        });
    } catch (error) {
        console.error(`API automacao: Erro ao excluir imóvel:`, error);
        return NextResponse.json(
            {
                success: false,
                message: "Erro ao excluir imóvel",
                error: error instanceof Error ? error.message : "Erro desconhecido",
            },
            { status: 500 }
        );
    }
} 