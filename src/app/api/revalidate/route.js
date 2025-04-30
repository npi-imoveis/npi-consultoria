import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { path } = await req.json();
  try {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
