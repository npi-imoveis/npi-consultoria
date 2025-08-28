// src/app/admin/imoveis/gerenciar/@components/sections/BrokerSection.jsx

"use client";
import { memo, useEffect, useState } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import { getCorretores } from "@/app/admin/services/corretores";

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState([]);
  
  useEffect(() => {
    const fetchCorretores = async () => {
      try {
        const response = await getCorretores();
        const corretoresData = response?.data?.data || response?.data || response || [];
        
        const corretoresList = corretoresData.map((item) => {
          return {
            value: item.nome,
            label: item.nome,
          };
        });
        
        setCorretores(corretoresList);
      } catch (error) {
        console.error("Erro ao buscar corretores:", error);
        // Dados de fallback caso a API falhe
        setCorretores([
          { value: "Eduardo Lima", label: "Eduardo Lima" },
          { value: "Maria Silva", label: "Maria Silva" },
          { value: "João Santos", label: "João Santos" },
        ]);
      }
    };
    
    fetchCorretores();
  }, []);
  
  const corretorField = () => {
    // Se está vazio ou é string vazia, mostrar select
    if (!formData.Corretor || formData.Corretor.trim() === "") {
      return {
        name: "Corretor",
        label: "Nome",
        type: "select",
        // NÃO adicionar opção vazia aqui - o FieldGroup já deve estar adicionando
        options: corretores,
        value: formData.Corretor || "",
      };
    }
    
    // Se tem valor, mostrar como texto
    return {
      name: "Corretor",
      label: "Nome",
      type: "text",
      value: formData.Corretor,
    };
  };
  
  const brokerFields = [
    corretorField(),
    { name: "EmailCorretor", label: "E-mail", type: "text" },
    { name: "CelularCorretor", label: "Celular", type: "text" },
    {
      name: "ImobParceiro",
      label: "Imobiliaria",
      type: "text",
    },
    {
      name: "ImobiliariaObs",
      label: "Observações",
      type: "textarea",
    },
  ];
  
  return (
    <FormSection title="Corretores Vinculados (Imobiliária)">
      <FieldGroup
        fields={brokerFields}
        formData={formData}
        displayValues={displayValues}
        onChange={onChange}
      />
    </FormSection>
  );
};

export default memo(BrokerSection);
