import { NextResponse } from "next/server";
import admin from "@/app/lib/firebase-admin";

export async function GET() {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map((user) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      creationTime: user.metadata.creationTime,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ error: "Erro ao listar usuários" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email, password, displayName } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email e senha são obrigatórios" }, { status: 400 });
    }
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName,
    });
    return NextResponse.json({ user: userRecord });
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { uid, password, displayName } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: "UID é obrigatório" }, { status: 400 });
    }

    // Monta objeto de atualização dinamicamente
    const updateData = {};
    if (password) updateData.password = password;
    if (displayName) updateData.displayName = displayName;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
    }

    const userRecord = await admin.auth().updateUser(uid, updateData);
    return NextResponse.json({ user: userRecord });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { uid } = await request.json();
    if (!uid) {
      return NextResponse.json({ error: "UID é obrigatório" }, { status: 400 });
    }
    await admin.auth().deleteUser(uid);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar usuário:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
