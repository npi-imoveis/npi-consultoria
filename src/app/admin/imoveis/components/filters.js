import { useState } from "react";

export default function FiltersImoveisAdmin({ onFilter }) {
  const [filters, setFilters] = useState({
    categoria: "",
    status: "",
    situacao: "",
    cadastro: "Ativo",
  });

  const handleFilters = () => {
    const filtersToApply = {
      Categoria: filters.categoria,
      Status: filters.status,
      Situacao: filters.situacao,
      Ativo: filters.cadastro === "Ativo" ? "Sim" : "Não",
    };

    if (onFilter) {
      onFilter(filtersToApply);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      categoria: "",
      status: "",
      situacao: "",
      cadastro: "Ativo",
    });

    if (onFilter) {
      onFilter({});
    }
  };

  return (
    <div className="w-full mt-4 grid grid-cols-5 gap-2 border-t py-4">
      <SelectFilter
        name="categoria"
        options={[
          { value: "Apartamento", label: "Apartamento" },
          { value: "Casa", label: "Casa" },
          { value: "Casa Comercial", label: "Casa Comercial" },
          { value: "Casa em Condominio", label: "Casa em Condominio" },
          { value: "Cobertura", label: "Cobertura" },
          { value: "Flat", label: "Flat" },
          { value: "Garden", label: "Garden" },
          { value: "Loft", label: "Loft" },
          { value: "Loja", label: "Loja" },
          { value: "Prédio Comercial", label: "Prédio Comercial" },
          { value: "Sala Comercial", label: "Sala Comercial" },
          { value: "Terreno", label: "Terreno" },
        ]}
        placeholder="Categoria"
        onChange={(e) => setFilters({ ...filters, categoria: e.target.value })}
        value={filters.categoria}
      />
      <SelectFilter
        name="status"
        options={[
          { value: "LOCAÇÃO", label: "LOCAÇÃO" },
          { value: "LOCADO", label: "LOCADO" },
          { value: "PENDENTE", label: "PENDENTE" },
          { value: "SUSPENSO", label: "SUSPENSO" },
          { value: "VENDA", label: "VENDA" },
          { value: "VENDA E LOCAÇÃO", label: "VENDA E LOCAÇÃO" },
          { value: "VENDIDO", label: "VENDIDO" },
        ]}
        placeholder="Status"
        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        value={filters.status}
      />
      <SelectFilter
        name="situacao"
        options={[
          { value: "EM CONSTRUÇÃO", label: "EM CONSTRUÇÃO" },
          { value: "LANÇAMENTO", label: "LANÇAMENTO" },
          { value: "PRÉ-LANÇAMENTO", label: "PRÉ-LANÇAMENTO" },
          { value: "PRONTO NOVO", label: "PRONTO NOVO" },
          { value: "PRONTO USADO", label: "PRONTO USADO" },
        ]}
        placeholder="Situação"
        onChange={(e) => setFilters({ ...filters, situacao: e.target.value })}
        value={filters.situacao}
      />
      <SelectFilter
        name="cadastro"
        options={[
          { value: "Ativo", label: "Ativo" },
          { value: "Inativo", label: "Inativo" },
        ]}
        placeholder="Cadastro"
        onChange={(e) => setFilters({ ...filters, cadastro: e.target.value })}
        value={filters.cadastro}
      />
      <div className="mt-2 flex gap-2">
        <button
          className="w-full bg-gray-200 font-bold rounded-lg text-gray-600 hover:bg-gray-300"
          onClick={handleFilters}
        >
          Filtrar
        </button>
        <button
          className="w-full bg-red-100 font-bold rounded-lg text-red-600 hover:bg-red-200"
          onClick={handleClearFilters}
        >
          Limpar
        </button>
      </div>
    </div>
  );
}

function SelectFilter({ options, name, onChange, value }) {
  return (
    <div>
      <select
        name={name}
        className="mt-2 w-full text-xs rounded-lg border border-gray-300 bg-white p-2 focus:outline-none focus:ring-1 focus:ring-black"
        onChange={onChange}
        value={value || ""}
      >
        <option value="">Selecione {name}</option>
        {options.map((option, index) => (
          <option className="text-xs" key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
