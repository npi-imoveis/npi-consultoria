export default function PropertiesList({ imoveis }) {
  return (
    <section>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 max-w-full overflow-hidden">
        {Array.isArray(imoveis) && imoveis.length > 0 ? (
          imoveis.map((imovel) => <CardImovel key={imovel.Codigo} {...imovel} />)
        ) : (
          <p>Nenhum imóvel encontrado.</p>
        )}
      </div>
    </section>
  );
}
