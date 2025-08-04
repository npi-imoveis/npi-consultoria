"use client";
import { formatterSlug } from "@/app/utils/formatter-slug";
import { formatterValue } from "@/app/utils/formatter-value";

// Componente de Skeleton para a tabela
const TableSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-8 bg-zinc-100 w-full mb-2"></div>
    {[1, 2, 3].map((item) => (
      <div key={item} className="h-12 bg-gray-100 w-full mb-2"></div>
    ))}
  </div>
);

export function PropertyTable({ imoveisRelacionados, isLoading }) {
  if (isLoading) {
    return <TableSkeleton />;
  }

  // Filtra apenas imóveis que possuem ValorAntigo
  const imoveisFiltrados = imoveisRelacionados.filter((imovel) => imovel.ValorAntigo);

  return (
    <div className="overflow-y-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className=" bg-zinc-100 text-[8px] ">
            <th className="p-3">Tipo</th>
            <th className="p-3">Venda/Aluguel</th>
            <th className="p-3">Metragem (m²)</th>
            <th className="p-3">Dormitórios</th>
            <th className="p-3">Suítes</th>
            <th className="p-3">Vagas</th>
          </tr>
        </thead>
        <tbody>
          {imoveisFiltrados.map((imovel, index) => {
            const slug = formatterSlug(imovel.Empreendimento);
            const href = `/imovel-${imovel.Codigo}/${slug}`;
            return (
              <tr
                key={index}
                className="border-b border-gray-200 text-[10px] hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => window.open(href, '_blank')}
              >
                <td className="p-3 font-bold">
                  <h2 className="text-black font-semibold text-[10px]">{imovel.Categoria}</h2>
                </td>
                <td className="p-3 font-semibold text-[9px]">
                  {imovel.ValorAntigo !== "0"
                    ? "R$ " + imovel.ValorAntigo
                    : formatterValue(imovel.ValorAluguelSite)}
                </td>
                <td className="p-3">
                  {(() => {
                    const metragem = imovel.MetragemAnt || imovel.AreaPrivativa;
                    return metragem && metragem.toString().includes('m²') 
                      ? metragem 
                      : `${metragem} m²`;
                  })()}
                </td>
                <td className="p-3">{imovel.DormitoriosAntigo}</td>
                <td className="p-3">{imovel.SuiteAntigo}</td>
                <td className="p-3">{imovel.VagasAntigo}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
