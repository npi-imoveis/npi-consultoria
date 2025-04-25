// app/api/admin/update-edge/route.ts
import { NextRequest } from "next/server";

const configID = process.env.VERCEL_EDGE_CONFIG_ID!;
const token = process.env.VERCEL_EDGE_CONFIG_TOKEN!;
const endpoint = `https://api.vercel.com/v1/edge-config/${configID}/items`;

export async function POST(req: NextRequest) {
  const updates = await req.json(); // Ex: { "sobre.titulo": "Novo Título" }

  const items = Object.entries(updates).map(([key, value]) => ({ key, value }));

  const res = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
  });

  const data = await res.json();

  if (!res.ok) {
    return Response.json({ error: data.message }, { status: res.status });
  }

  return Response.json({ success: true });
}
