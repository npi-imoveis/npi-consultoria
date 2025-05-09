"use client";

import { memo } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import useImovelStore from "@/app/admin/store/imovelStore";

const BasicInfoSection = ({ formData, displayValues, onChange, validation }) => {
  // Get Automacao flag from the store
  const imovelSelecionado = useImovelStore((state) => state.imovelSelecionado);
  const isAutomacao = imovelSelecionado?.Automacao === true;

  // Create dynamic fields array to update the label based on Automacao flag
  const basicInfoFields = [
    {
      name: "Codigo",
      label: isAutomacao ? "Código (Aut)" : "Código",
      type: "text",
      disabled: true,
      className: isAutomacao ? "bg-gray-100" : "",
    },
    {
      name: "Ativo",
      label: "Ativo",
      type: "text",
      disabled: true,
    },
    {
      name: "TermoSeo",
      label: "Termo SEO",
      type: "text",
    },
    {
      name: "Empreendimento",
      label: "Empreendimento",
      type: "text",
    },

    { name: "Construtora", label: "Construtora", type: "text" },
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
    {
      name: "Slug",
      label: "Slug (Automático)",
      type: "text",
      disabled: true,
      readOnly: true,
      className: "bg-gray-100",
    },
    {
      name: "Destacado",
      label: "Imóvel Destaque (Sim/Não)",
      type: "select",
      options: [
        { value: "Sim", label: "Sim" },
        { value: "Não", label: "Não" },
      ],
    },
    {
      name: "Condominio",
      label: "É Condomínio? ",
      type: "select",
      options: [
        { value: "Sim", label: "Sim" },
        { value: "Não", label: "Não" },
      ],
    },
    {
      name: "CondominioDestaque",
      label: "Condomínio Destaque",
      type: "select",
      options: [
        { value: "Sim", label: "Sim" },
        { value: "Não", label: "Não" },
      ],
    },
    { name: "DataEntrega", label: "Data de Entrega", type: "text" },
    {
      name: "LinkImovelOriginal",
      label: "Link Parceiro",
      type: "text",
    },
    {
      name: "DataHoraAtualizacao",
      label: "Data de Atualização",
      type: "text",
      disabled: true,
    },
    {
      name: "Disponibilidade",
      label: "Disponibilidade (Observações)",
      type: "textarea",
    },
  ];

  return (
    <FormSection title="Informações Básicas">
      <FieldGroup
        fields={basicInfoFields}
        formData={formData}
        displayValues={displayValues}
        onChange={onChange}
        validation={validation}
      />
    </FormSection>
  );
};

export default memo(BasicInfoSection);
