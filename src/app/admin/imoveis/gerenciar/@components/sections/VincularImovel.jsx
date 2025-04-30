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

  // Get Automacao flag from the store
  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

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

  // Map formData to vinculado fields to avoid React duplicate key warnings
  const getVinculadoFormData = () => {
    const vinculadoData = { ...formData };
    // Map the fields to local versions if they exist in formData
    basicInfoFields.forEach((field) => {
      if (formData[field.name] !== undefined) {
        vinculadoData[field.name] = formData[field.name];
      }
    });
    return vinculadoData;
  };

  // Map displayValues to vinculado display values
  const getVinculadoDisplayValues = () => {
    const vinculadoDisplayValues = { ...displayValues };
    // Add any specific mappings here if needed
    return vinculadoDisplayValues;
  };

  // Function to handle creating a related property
  const handleCreateRelatedProperty = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Generate a new code using the imported function
      const newCode = generateRandomCode();

      // Create a new property based on the current selected property
      // but with the fields updated from this form
      const newPropertyData = {
        ...imovelSelecionado, // Copy all fields from the original property
        Codigo: newCode, // Use the new code
        _id: undefined, // Remove the _id to let MongoDB generate a new one
      };

      // Update fields that were changed in the form
      basicInfoFields.forEach((field) => {
        if (formData[field.name] !== undefined) {
          if (field.name === "ValorAntigo" || field.name === "ValorAluguelSite") {
            newPropertyData[field.name] = formatterNumber(formData[field.name]);
          } else {
            newPropertyData[field.name] = formData[field.name];
          }
        }
      });

      // Modificar o Slug para incluir a categoria
      if (newPropertyData.Slug && newPropertyData.Categoria) {
        // Converter a categoria para minúsculo e substituir espaços por hífens
        const categoriaFormatada = newPropertyData.Categoria.toLowerCase().replace(/\s+/g, "-");
        // Adicionar a categoria no início do slug
        newPropertyData.Slug = `${categoriaFormatada}-${newPropertyData.Slug}`;
        setSlug(newPropertyData.Slug);
      }

      // Submit the new property
      const result = await criarImovel(newCode, newPropertyData);

      if (result && result.success) {
        setSuccess(
          `Imóvel relacionado cadastrado com sucesso! Código: ${newCode}. Acesse no link: https://www.imobiliaria.com.br/imovel-${newCode}/${newPropertyData.Slug}`
        );

        // Store the new property code and name for the modal
        setNewPropertyCode(newCode);
        setNewPropertyName(newPropertyData.Empreendimento || "Novo Imóvel");

        // Open the modal
        setIsModalOpen(true);
      } else {
        setError(result?.message || "Erro ao cadastrar imóvel relacionado");
      }
    } catch (error) {
      console.error("Erro ao cadastrar imóvel relacionado:", error);
      setError("Ocorreu um erro ao cadastrar o imóvel relacionado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormSection title="Duplicar Imóvel">
      {isModalOpen && (
        <Modal
          title="Imóvel Relacionado Cadastrado com Sucesso"
          description={`O imóvel ${newPropertyName} foi cadastrado com sucesso com o código ${newPropertyCode}. Ele agora está disponível na lista de imóveis do site.`}
          buttonText="Ver imóvel"
          link={`/imovel-${newPropertyCode}/${slug}`}
        />
      )}

      <FieldGroup
        fields={getNamespacedFields()}
        formData={getVinculadoFormData()}
        displayValues={getVinculadoDisplayValues()}
        onChange={onChange}
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
      <div className="w-full flex justify-end mt-6">
        <button
          type="button"
          onClick={handleCreateRelatedProperty}
          disabled={isSubmitting}
          className="bg-black hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-all duration-300 ease-in-out"
        >
          {isSubmitting ? "Cadastrando..." : "Cadastrar Imóvel Relacionado"}
        </button>
      </div>
    </FormSection>
  );
};

export default memo(VincularImovelSection);
