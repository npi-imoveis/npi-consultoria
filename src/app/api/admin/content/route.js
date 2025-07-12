import { connectToDatabase } from "@/app/lib/mongodb";
import Content, { IContent } from "@/app/models/Content";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    await connectToDatabase();

    const content = await Content.findOne({});

    if (!content) {
      return NextResponse.json(
        {
          status: 404,
          message: "Conteúdo não encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 200,
      data: content,
    });
  } catch (error) {
    console.error("Detailed error in content fetch:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        status: 500,
        message: "Erro ao buscar conteúdo",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const updateData = await request.json();

    await connectToDatabase();

    // Find the first document and update it
    const updatedContent = await Content.findOneAndUpdate(
      {}, // empty filter to get the first document
      { $set: updateData },
      { new: true, upsert: true } // return updated document and create if doesn't exist
    );

    return NextResponse.json({
      status: 200,
      message: "Conteúdo atualizado com sucesso",
      data: updatedContent,
    });
  } catch (error) {
    console.error("Erro ao atualizar conteúdo:", error);
    return NextResponse.json(
      {
        status: 500,
        message: "Erro ao atualizar conteúdo",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      },
      { status: 500 }
    );
  }
}
