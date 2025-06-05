import { getProprietario, updateProprietario, adicionarProprietario } from "@/app/admin/services";
import { useEffect, useState, useMemo } from "react";

// Componente de campo de formulário reutilizável
const FormField = ({ label, name, value, onChange, type = "text", disabled, rows }) => (
  <div className={rows ? "col-span-full" : ""}>
    <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
    {rows ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className="text-xs border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
        disabled={disabled}
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="text-xs border-2 px-5 py-2 text-zinc-700 w-full rounded-md focus:outline-none focus:ring-black focus:border-black"
        disabled={disabled}
      />
    )}
  </div>
);

// Campos padrão para cada proprietário
const CAMPOS_PROPRIETARIO = [
  { name: "nome", label: "Nome" },
  { name: "fone", label: "Fone" },
  { name: "email", label: "Email", type: "email" },
  { name: "unidade", label: "Unidade" },
  { name: "metrag", label: "Metragem" },
  { name: "valor", label: "Valor" },
  { name: "data", label: "Data" },
  { name: "observacoes", label: "Observações", rows: 4 },
];

// Componente de Aba
const ProprietarioTab = ({ index, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 focus:outline-none ${
      isActive ? "border-black text-black" : "border-transparent text-gray-500 hover:text-black"
    }`}
  >
    Proprietário {index + 1}
  </button>
);

// Componente de Feedback
const Feedback = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div
      className={`mb-4 p-3 rounded ${
        feedback.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {feedback.message}
    </div>
  );
};

export default function ProprietariosSection({ id }) {
  // Estrutura de chaves para os campos do proprietário
  const getProprietarioKey = (index, field) => {
    const idx = String(index + 1).padStart(2, "0");
    const fieldMap = {
      nome: `NOME${idx}`,
      fone: `FONE_P${idx}`,
      email: `EMAIL_${idx}`,
      unidade: `UNIDADE_${idx}`,
      metrag: `M2_${idx}`,
      valor: `VALORP_${idx}`,
      data: `DATAP_${idx}`,
      observacoes: `OBS_P${idx}`,
    };
    return fieldMap[field];
  };

  // Estado inicial com campos vazios para 5 proprietários
  const initialState = {};
  Array.from({ length: 5 }).forEach((_, index) => {
    CAMPOS_PROPRIETARIO.forEach(({ name }) => {
      initialState[getProprietarioKey(index, name)] = "";
    });
  });

  const [proprietarios, setProprietarios] = useState(initialState);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [proprietarioExistente, setProprietarioExistente] = useState(false);

  useEffect(() => {
    const fetchProprietarios = async () => {
      const response = await getProprietario(id);
      if (response && response.success && response.data) {
        // Verificar se os dados retornados não são apenas um objeto vazio ou null
        const dadosValidos =
          response.data &&
          typeof response.data === "object" &&
          Object.keys(response.data).length > 0 &&
          Object.values(response.data).some(
            (valor) => valor !== null && valor !== undefined && valor.toString().trim() !== ""
          );

        if (dadosValidos) {
          setProprietarios(response.data);
          setProprietarioExistente(true);
        } else {
          setProprietarioExistente(false);
        }
      } else {
        setProprietarioExistente(false);
      }
    };
    fetchProprietarios();
  }, [id]);

  // Função para separar os dados em 5 proprietários
  const proprietariosSeparados = useMemo(() => {
    return Array.from({ length: 5 }, (_, i) => {
      const proprietario = {};
      CAMPOS_PROPRIETARIO.forEach(({ name }) => {
        proprietario[name] = proprietarios[getProprietarioKey(i, name)] || "";
      });
      return proprietario;
    });
  }, [proprietarios]);

  // Atualiza o estado original ao editar um campo
  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const key = getProprietarioKey(index, name);
    setProprietarios((prev) => ({ ...prev, [key]: value }));
  };

  // Função para verificar se há dados válidos nos proprietários
  const temDadosValidos = useMemo(() => {
    return Object.values(proprietarios).some((valor) => valor && valor.toString().trim() !== "");
  }, [proprietarios]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setFeedback(null);
    try {
      let result;

      // Decidir entre POST (criar) ou PUT (atualizar)
      // Criar novo se: não existe proprietário OU existe mas os dados atuais são diferentes/novos
      if (!proprietarioExistente) {
        // Definitivamente criar novo proprietário
        result = await adicionarProprietario(id, proprietarios);
        if (result.success) {
          setProprietarioExistente(true); // Agora existe
        }
      } else {
        // Atualizar proprietário existente
        result = await updateProprietario(id, proprietarios);
      }

      setFeedback({
        type: result.success ? "success" : "error",
        message:
          result.message ||
          (result.success ? "Dados salvos com sucesso!" : "Erro ao salvar dados."),
      });
    } catch (err) {
      setFeedback({ type: "error", message: "Erro inesperado ao salvar dados." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden p-5 border-2 border-[#8B6F48]">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
        Informações dos Proprietários
      </h2>

      {/* Abas */}
      <div className="flex space-x-2 mb-6 border-b">
        {Array.from({ length: 5 }).map((_, idx) => (
          <ProprietarioTab
            key={`prop-tab-${idx}`}
            index={idx}
            isActive={abaAtiva === idx}
            onClick={() => setAbaAtiva(idx)}
          />
        ))}
      </div>

      <Feedback feedback={feedback} />

      <div className="mb-6 border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold">Proprietário {abaAtiva + 1}</h2>
          <span
            className={`text-xs px-2 py-1 rounded ${
              proprietarioExistente ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
            }`}
          >
            {proprietarioExistente ? "Existente" : "Novo"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CAMPOS_PROPRIETARIO.map(({ name, label, type, rows }) => (
            <FormField
              key={`prop-${abaAtiva}-${name}`}
              label={label}
              name={name}
              type={type}
              rows={rows}
              value={proprietariosSeparados[abaAtiva][name]}
              onChange={(e) => handleChange(abaAtiva, e)}
              disabled={loading}
            />
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-8">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-black hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
