import React from "react";
import { HeaderPage } from "../components/ui/header-page";

export default function ImovelForm() {
  return (
    <section>
      <HeaderPage
        title="Aqui você pode cadastrar seu imóvel para venda ou locação"
        description="Aqui você pode cadastrar seu imóvel para venda ou locação."
        image="/assets/images/imoveis/02.jpg"
      />
      <div className="container mx-auto px-4 py-16">
        <p className="py-4">
          <strong>Dicas:</strong> Fotos na posição horizontal e luzes acesas de
          todos ambientes e do lazer, valorizam mais o anuncio do seu imóvel ;)
        </p>
        <form className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Nome*"
            type="text"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="E-mail*"
            type="email"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Telefone*"
            type="tel"
            required
          />
          <select className="border rounded py-2 px-3 w-full bg-white" required>
            <option value="">Tipo de Imóvel</option>
            <option>Apartamento</option>
            <option>Casa</option>
          </select>
          <select className="border rounded py-2 px-3 w-full bg-white" required>
            <option value="">O que deseja fazer?</option>
            <option>Venda</option>
            <option>Locação</option>
          </select>
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="CEP*"
            type="text"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Endereço*"
            type="text"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Número*"
            type="text"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Complemento*"
            type="text"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Bairro*"
            type="text"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Cidade*"
            type="text"
            required
          />
          <select className="border rounded py-2 px-3 w-full bg-white" required>
            <option value="">Estado</option>
            <option>São Paulo</option>
            <option>Outro Estado</option>
          </select>
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Valor do Imóvel (R$)*"
            type="number"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Valor do Condomínio (R$)*"
            type="number"
            required
          />
          <input
            className="border rounded py-2 px-3 w-full"
            placeholder="Valor do IPTU (R$)*"
            type="number"
            required
          />
          <textarea
            className="border rounded py-2 px-3 w-full sm:col-span-3"
            placeholder="Faça uma descrição rica em detalhes do seu imóvel*"
            rows={4}
            required
          />
        </form>
        <UploadArea />
        <div>
          <button
            type="submit"
            className="w-full bg-[#8B6F48] text-white py-3 rounded font-semibold hover:bg-[#7a5f3a] transition-colors"
          >
            Anunciar meu imóvel
          </button>
        </div>
      </div>
    </section>
  );
}

function UploadArea() {
  return (
    <div className="w-full mx-auto py-4">
      <div className="mb-4 ">
        <p>
          Dicas: Fotos na posição horizontal, com todas as luzes acesas, fotos
          do lazer e da fachada, valorizam e chamam mais atenção para o anúncio
          do seu imóvel ;)
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center text-center">
        <p className="text-gray-600 font-medium">
          Copie &amp; Cole as fotos aqui
        </p>
        <p className="text-gray-500 my-2">ou</p>
        <button
          type="button"
          className="text-[#7a5f3a] hover:underline font-semibold"
        >
          Escolher arquivos
        </button>
      </div>
    </div>
  );
}
