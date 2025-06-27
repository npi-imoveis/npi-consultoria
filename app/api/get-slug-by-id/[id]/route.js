// app/api/get-slug-by-id/[id]/route.js
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request, { params }) {
    const { id } = params;

    const mockData = {
        '9507': { slug: 'avenida-antonio-joaquim-de-moura-andrade-597' },
        '80867': { slug: 'edificio-searpa' }
    };

    if (mockData[id]) {
        return NextResponse.json({ id, slug: mockData[id].slug });
    } else {
        return NextResponse.json({ error: 'Imóvel não encontrado' }, { status: 404 });
    }
}
