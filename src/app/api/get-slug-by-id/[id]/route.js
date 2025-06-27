import { NextResponse } from 'next/server';

// Configuração para Edge Runtime
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET(request, { params }) {
    const { id } = params;

    // Mock temporário - substitua pela busca real
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
