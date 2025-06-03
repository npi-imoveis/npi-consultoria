"use client";

import { memo, useState, useId } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import useImovelStore from "@/app/admin/store/imovelStore";
import { cadastrarImovel, criarImovel } from "@/app/services";
import { useRouter } from "next/navigation";
import { generateRandomCode } from "../hooks/useImovelForm";
import { formatterNumber } from "@/app/utils/formatter-number";
import Modal from "@/app/admin/components/modal";
import { generateUniqueCode } from "@/app/utils/idgenerate";

const VincularImovelSection = ({ formData, displayValues, onChange, validation }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPropertyCode, setNewPropertyCode] = useState("");
  const [newPropertyName, setNewPropertyName] = useState("");
  const router = useRouter();
  const uniqueIdPrefix = useId(); // React's useId hook to generate unique IDs
  const [slug, setSlug] = useState("");

  // Estado local independente para o formulário de vincular imóvel
  const [localFormData, setLocalFormData] = useState({});
  const [localDisplayValues, setLocalDisplayValues] = useState({});

  // Get Automacao flag from the store
  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

  // Função local onChange para não afetar o imóvel original
  const handleLocalChange = (event) => {
    const { name, value } = event.target;

    // Verificar se é um campo de área que precisa de validação especial
    const isAreaField = name === "AreaPrivativa" || name === "AreaTotal";

    let finalValue = value;

    // Aplicar validação de números inteiros para campos de área
    if (isAreaField) {
      // Permitir apenas números inteiros (sem vírgulas, pontos, ou outros caracteres)
      finalValue = value.replace(/[^\d]/g, "");

      // Limitar a 4 dígitos máximo
      finalValue = finalValue.slice(0, 4);
    }

    // Atualizar o estado local
    setLocalFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));

    // Se for um campo monetário, também atualizar o displayValue
    const field = basicInfoFields.find((f) => f.name === name);
    if (field && field.isMonetary) {
      setLocalDisplayValues((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
    }
  };

  // Create dynamic fields array to update the label based on Automacao flag
  // Add a unique prefix to each field name to prevent duplicates
  const basicInfoFields = [
    {
      name: "Ativo",
      label: "Ativo",
      type: "select",
      options: [
        { value: "Sim", label: "Sim" },
        { value: "Não", label: "Não" },
      ],
    },
    {
      name: "Categoria",
      label: "Categoria",
      type: "select",
      options: [
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
      ],
    },
    {
      name: "Situacao",
      label: "Situação",
      type: "select",
      options: [
        { value: "EM CONSTRUÇÃO", label: "EM CONSTRUÇÃO" },
        { value: "LANÇAMENTO", label: "LANÇAMENTO" },
        { value: "PRÉ-LANÇAMENTO", label: "PRÉ-LANÇAMENTO" },
        { value: "PRONTO NOVO", label: "PRONTO NOVO" },
        { value: "PRONTO USADO", label: "PRONTO USADO" },
      ],
    },
    {
      name: "Status",
      label: "Status",
      type: "select",
      options: [
        { value: "LOCAÇÃO", label: "LOCAÇÃO" },
        { value: "LOCADO", label: "LOCADO" },
        { value: "PENDENTE", label: "PENDENTE" },
        { value: "SUSPENSO", label: "SUSPENSO" },
        { value: "VENDA", label: "VENDA" },
        { value: "VENDA E LOCAÇÃO", label: "VENDA E LOCAÇÃO" },
        { value: "VENDIDO", label: "VENDIDO" },
      ],
    },
    { name: "ValorAntigo", label: "Valor Venda", type: "text", isMonetary: true },
    { name: "ValorAluguelSite", label: "Valor de Aluguel", type: "text", isMonetary: true },
    { name: "AreaPrivativa", label: "Área Privativa (m²)", type: "text" },
    { name: "AreaTotal", label: "Área Total (m²)", type: "text" },
    { name: "DormitoriosAntigo", label: "Dormitórios", type: "text" },
    { name: "SuitesAntigo", label: "Suítes", type: "text" },
    { name: "BanheiroSocialQtd", label: "Banheiros Sociais", type: "text" },
    { name: "VagasAntigo", label: "Vagas de Garagem", type: "text" },
  ];

  // Create fields with unique ID prefixes to avoid conflicts
  const getNamespacedFields = () => {
    return basicInfoFields.map((field, index) => ({
      ...field,
      id: `vincular-${uniqueIdPrefix}-${field.name}-${index}`, // Ensure IDs are unique
    }));
  };

  // Function to handle creating a related property
  const handleCreateRelatedProperty = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Generate a new code using the imported function
      const newCode = await generateUniqueCode();

      // Create a new property based on the current selected property
      // but with the fields updated from this form
      const newPropertyData = {
        ...imovelSelecionado, // Copy all fields from the original property
        Codigo: newCode, // Use the new code
        Condominio: "Não",
        _id: undefined, // Remove the _id to let MongoDB generate a new one
      };

      // Update fields that were changed in the LOCAL form data
      basicInfoFields.forEach((field) => {
        if (localFormData[field.name] !== undefined && localFormData[field.name] !== "") {
          if (field.name === "ValorAntigo" || field.name === "ValorAluguelSite") {
            newPropertyData[field.name] = formatterNumber(localFormData[field.name]);
          } else {
            newPropertyData[field.name] = localFormData[field.name];
          }
        }
      });

      // Modificar o Slug para incluir a categoria
      if (newPropertyData.Slug && newPropertyData.Categoria && newPropertyData.AreaPrivativa) {
        // Converter a categoria para minúsculo e substituir espaços por hífens
        const categoriaFormatada = newPropertyData.Categoria.toLowerCase().replace(/\s+/g, "-");
        const areaFormatada = newPropertyData.AreaPrivativa.toLowerCase().replace(/\s+/g, "-");
        // Adicionar a categoria no início do slug
        newPropertyData.Slug = `${categoriaFormatada}-${areaFormatada}-metros-${newPropertyData.Slug}-${newCode}`;
        setSlug(newPropertyData.Slug);
      }

      // Submit the new property
      if (newCode) {
        const result = await criarImovel(newCode, newPropertyData);
        if (result && result.success) {
          setSuccess(
            `Imóvel cadastrado com sucesso! Código: ${newCode}. Acesse no link: https://npiconsultoria.com.br/imovel-${newCode}/${newPropertyData.Slug}`
          );

          // Store the new property code and name for the modal
          setNewPropertyCode(newCode);
          setNewPropertyName(newPropertyData.Empreendimento || "Novo Imóvel");

          // Open the modal
          setIsModalOpen(true);
        } else {
          setError(result?.message || "Erro ao cadastrar imóvel relacionado");
        }
      }
    } catch (error) {
      console.error("Erro ao cadastrar imóvel relacionado:", error);
      setError("Ocorreu um erro ao cadastrar o imóvel relacionado");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle closing the modal and resetting the form
  const handleCloseModalAndReset = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      // Limpar apenas o estado local, não o formulário principal
      setLocalFormData({});
      setLocalDisplayValues({});
      setError("");
      setSuccess("");
    }, 2000);
  };

  return (
    <FormSection title="Cadastrar novo imóvel" highlight={true}>
      {isModalOpen && (
        <Modal
          title="Imóvel Cadastrado com Sucesso"
          description={`${localFormData.Categoria || "Imóvel"} em ${newPropertyName} com ${
            localFormData.AreaPrivativa || "área não informada"
          }m² cadastrado com sucesso com o código ${newPropertyCode}. Ele agora está disponível na lista de imóveis do site.`}
          buttonText="Ver no site"
          link={`/imovel-${newPropertyCode}/${slug}`}
          onClose={handleCloseModalAndReset}
        />
      )}

      <FieldGroup
        fields={getNamespacedFields()}
        formData={localFormData}
        displayValues={localDisplayValues}
        onChange={handleLocalChange}
        validation={validation}
      />

      {/* Status messages */}
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {success && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4"
          role="alert"
        >
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      {/* Button to create related property */}
      <div className="w-full flex justify-between mt-6">
        <span className="text-xs text-gray-500">
          Esse formulário cria uma nova <strong>pagina de imóvel</strong> copiando os dados do
          condomínio original. <br />
          Será gerado um novo código e slug, além das informações preenchidas acima.
        </span>
        <button
          type="button"
          onClick={handleCreateRelatedProperty}
          disabled={isSubmitting}
          className="bg-black hover:bg-opacity-80 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar Imóvel"}
        </button>
      </div>
    </FormSection>
  );
};

export default memo(VincularImovelSection);
