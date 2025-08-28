// src/app/admin/imoveis/gerenciar/@components/sections/BrokerSection.jsx

"use client";
import { memo, useEffect, useState } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import { getCorretores } from "@/app/admin/services/corretores";

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCorretores = async () => {
      try {
        setLoading(true);
        const response = await getCorretores();
        
        // Debug - verificar o que está vindo
        console.log("Resposta da API:", response);
        
        // Correção: verificar estrutura correta da resposta
        const corretoresData = response?.data?.data || response?.data || response || [];
        
        const corretoresList = corretoresData.map((item) => {
          return {
            value: item.nome || item.name || item.Nome,  // Tentar diferentes campos
            label: item.nome || item.name || item.Nome,
          };
        });
        
        console.log("Corretores processados:", corretoresList);
        setCorretores(corretoresList);
      } catch (error) {
        console.error("Erro ao buscar corretores:", error);
        // Fallback com dados de exemplo se API falhar
        setCorretores([
          { value: "Eduardo Lima", label: "Eduardo Lima" },
          { value: "Maria Silva", label: "Maria Silva" },
          { value: "João Santos", label: "João Santos" },
        ]);
      } finally {
        setLoading(false);
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
        options: [
          { value: "", label: loading ? "Carregando..." : "Selecione um corretor" },
          ...corretores
        ],
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
