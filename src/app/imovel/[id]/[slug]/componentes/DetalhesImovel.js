"use client";

import { Bed, Bath, Car, ShowerHead } from "lucide-react";

export default function DetalhesImovel({ imovel }) {
  return (
    <div className="flex flex-col bg-white container mx-auto border-t-2 p-4 md:p-10 mt-4">
      <span className="text-xl font-bold text-black">
        {imovel.Categoria} de {imovel.AreaPrivativa || imovel.MetragemAnt} m²{" "}
        {imovel.Status.toLowerCase()}
      </span>
      <div className="flex flex-wrap gap-2 mt-8" aria-label="Características do imóvel">
        <div className="flex flex-col bg-zinc-100 rounded-lg items-center px-4 py-2 text-xs min-w-[110px]">
          <Bed size={24} aria-hidden="true" />
          <p className="mt-1 font-medium">
            {imovel.DormitoriosAntigo || imovel.Dormitorios} quarto
            {imovel.DormitoriosAntigo !== 1 ? "s" : ""}
          </p>
        </div>
       <div className="flex flex-col bg-zinc-100 rounded-lg items-center px-4 py-2 text-xs min-w-[110px]">
  <Bath size={24} aria-hidden="true" />
  <p className="mt-1 font-medium">
    {imovel.Suites || 0} suíte{imovel.Suites !== 1 ? "s" : ""}
  </p>
</div>
        <div className="flex flex-col bg-zinc-100 rounded-lg items-center px-4 py-2 text-xs min-w-[110px]">
          <ShowerHead size={24} aria-hidden="true" />
          <p className="mt-1 font-medium">
            {imovel.BanheiroSocialQtd} banheiro{imovel.BanheiroSocialQtd !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex flex-col bg-zinc-100 rounded-lg items-center px-4 py-2 text-xs min-w-[110px]">
          <Car size={24} aria-hidden="true" />
          <p className="mt-1 font-medium">
            {imovel.VagasAntigo || imovel.Vagas} vaga{imovel.VagasAntigo !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
