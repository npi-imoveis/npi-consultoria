import Input from "./Input";

export default function Search() {
  return (
    <div className="py-5 bg-white rounded-lg">
      <div className="container mx-auto px-8 ">
        <div className="flex justify-between items-center space-x-2">
          {/* Inputs */}
          <Input placeholder="Busque por nome, endereço ou cidade" />
          <Input placeholder="Finalidade" />
          <Input placeholder="Tipo" />
          <Input placeholder="Cidade" />
          {/* Botão */}
          <a
            href="/properties"
            className="rounded-md min-w-[200px] bg-zinc-950 px-3.5 py-4 text-white text-xs font-semibold  shadow-sm hover:bg-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Buscar Imóveis
            <span aria-hidden="true"> →</span>
          </a>
        </div>
      </div>
    </div>
  );
}
