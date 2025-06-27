// app/imovel/[id]/[slug]/page.js
// ... (código existente)

export default async function Imovel({ params }) {
  const { id, slug } = params;
  
  try {
    const response = await getImovelById(id);
    
    if (!response?.data) {
      notFound();
    }

    const imovel = { ...response.data };
    const slugCorreto = imovel.Slug;

    if (slug !== slugCorreto) {
      redirect(`/imovel-${id}/${slugCorreto}`);
    }
    
    // ... restante do código
  } catch (error) {
    redirect('/busca');
  }
}
