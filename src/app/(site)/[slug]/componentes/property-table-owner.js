"use client";
import { formatterValue } from "@/app/utils/formatter-value";
import { formatterNumber } from "./../../../utils/formatter-number";

export function PropertyTableOwner({ imovel }) {
  // Add safety check - return null if imovel is undefined
  if (!imovel) {
    return null;
  }

  const imoveisTable = [
    {
      Categoria: imovel.Categoria || "Apartamento",
      Valor: imovel.ValorAntigo,
      Metragem: imovel.MetragemAnt,
      Dormitorios: imovel.DormitoriosAntigo,
      Suites: imovel.SuiteAntigo,
      Vagas: imovel.VagasAntigo,
    },
    {
      Categoria: imovel.ValorVenda2 && "Apartamento",
      Valor: imovel.ValorVenda2,
      Metragem: imovel.MetragemAnt2,
      Dormitorios: imovel.Dormitorio2,
      Suites: imovel.Suites2,
      Vagas: imovel.Vagas2,
    },
    {
      Categoria: imovel.ValorCobertura && "Cobertura",
      Valor: imovel.ValorCobertura,
      Metragem: imovel.MetragemAnt7,
      Dormitorios: imovel.Dormitorio7,
      Suites: imovel.Suites7,
      Vagas: imovel.Vagas7,
    },
    {
      Categoria: imovel.ValorCobertura2 && "Cobertura",
      Valor: imovel.ValorCobertura2,
      Metragem: imovel.MetragemAnt8,
      Dormitorios: imovel.Dormitorio8,
      Suites: imovel.Suites8,
      Vagas: imovel.Vagas8,
    },
    {
      Categoria: imovel.ValorGarden && "Garden",
      Valor: imovel.ValorGarden,
      Metragem: imovel.MetragemAnt5,
      Dormitorios: imovel.Dormitorio5,
      Suites: imovel.Suites5,
      Vagas: imovel.Vagas5,
    },
    {
      Categoria: imovel.ValorGarden2 && "Garden",
      Valor: imovel.ValorGarden2,
      Metragem: imovel.MetragemAnt6,
      Dormitorios: imovel.Dormitorio6,
      Suites: imovel.Suites6,
      Vagas: imovel.Vagas6,
    },
  ];

  // Filter out items that don't have all required properties
  const filteredImoveisTable = imoveisTable.filter(
    (item) =>
      item.Categoria && item.Valor && item.Metragem && item.Dormitorios && item.Suites && item.Vagas
  );

  return (
    <div className="overflow-y-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className=" bg-zinc-100 text-[8px] ">
            <th className="p-3">Tipo</th>
            <th className="p-3">Valor</th>
            <th className="p-3">Metragem</th>
            <th className="p-3">Dormitórios</th>
            <th className="p-3">Suítes</th>
            <th className="p-3">Vagas</th>
          </tr>
        </thead>
        <tbody>
          {filteredImoveisTable.map((item, index) => {
            return (
              <tr key={index} className="border-b border-gray-200 text-[10px]  transition-colors">
                <td className="p-3 font-bold">
                  <h2 className="text-black font-semibold text-[10px]">{item.Categoria}</h2>
                </td>
                <td className="p-3 font-semibold text-[9px]">{formatterNumber(item.Valor)}</td>
                <td className="p-3">
                  {(() => {
                    const metragem = item.Metragem;
                    return metragem && metragem.toString().includes('m²') 
                      ? metragem 
                      : `${metragem} m²`;
                  })()}
                </td>
                <td className="p-3">{item.Dormitorios}</td>
                <td className="p-3">{item.Suites}</td>
                <td className="p-3">{item.Vagas}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
