import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function POST(request) {
  try {
    const { source, destination } = await request.json();
    if (!source || !destination) {
      return NextResponse.json({ error: "source e destination são obrigatórios" }, { status: 400 });
    }

    const filePath = path.resolve(process.cwd(), "vercel.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileData);

    if (!json.redirects) json.redirects = [];
    json.redirects.push({ source, destination, permanent: true });

    await fs.writeFile(filePath, JSON.stringify(json, null, 2));

    return NextResponse.json({ success: true, redirect: { source, destination, permanent: true } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { source } = await request.json();
    if (!source) {
      return NextResponse.json({ error: "source é obrigatório" }, { status: 400 });
    }
    const filePath = path.resolve(process.cwd(), "vercel.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileData);
    json.redirects = (json.redirects || []).filter((r) => r.source !== source);
    await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { oldSource, source, destination } = await request.json();
    if (!oldSource || !source || !destination) {
      return NextResponse.json(
        { error: "oldSource, source e destination são obrigatórios" },
        { status: 400 }
      );
    }
    const filePath = path.resolve(process.cwd(), "vercel.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileData);
    json.redirects = (json.redirects || []).map((r) =>
      r.source === oldSource ? { ...r, source, destination } : r
    );
    await fs.writeFile(filePath, JSON.stringify(json, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
