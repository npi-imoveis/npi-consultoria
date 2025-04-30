"use client";

import InputValorImovel from "@/app/components/ui/input-valor-imovel";

export default function ValoresImoveis({ valorVenda, valorAluguel, valorCondominio, valorIptu }) {
  return (
    <div className="bg-white rounded-lg overflow-hidden p-6 my-6">
      <h1 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Valores do Imóvel</h1>

      <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <InputValorImovel label="Venda" valor={valorVenda} />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aluguel</label>
          <input
            className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
            placeholder="R$ 0"
            value={valorAluguel}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condominio</label>
          <input
            className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
            placeholder="R$ 0"
            value={valorCondominio}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">IPTU</label>
          <input
            className="border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
            placeholder="R$ 0"
            value={valorIptu}
          />
        </div>
      </form>
    </div>
  );
}
