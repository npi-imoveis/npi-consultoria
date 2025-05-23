import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.resolve(process.cwd(), "vercel.json");
    const fileData = await fs.readFile(filePath, "utf-8");
    const json = JSON.parse(fileData);
    return NextResponse.json({ redirects: json.redirects || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
