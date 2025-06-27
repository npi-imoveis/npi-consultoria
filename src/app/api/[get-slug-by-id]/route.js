// app/api/get-slug-by-id/route.js

import { NextResponse } from 'next/server';
import { getImovelById } from '@/app/services';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID not provided' }, { status: 400 });
  }

  try {
    const response = await getImovelById(id);

    if (response?.data?.Slug) {
      return NextResponse.json({ slug: response.data.Slug });
    } else {
      return NextResponse.json({ slug: null }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
