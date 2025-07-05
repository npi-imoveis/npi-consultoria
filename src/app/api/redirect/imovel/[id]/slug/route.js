import dbConnect from '@lib/dbConnect';
import Imovel from '@models/Imovel';

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const imovel = await Imovel.findOne(
      { Codigo: parseInt(params.id) },
      { Slug: 1, _id: 0 }
    ).lean();

    if (!imovel) {
      return new Response(JSON.stringify({ error: 'Imóvel não encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ slug: imovel.Slug }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Erro no servidor' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
