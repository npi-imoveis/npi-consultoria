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
        console.log("🔄 Buscando corretores...");
        const response = await getCorretores();
        
        console.log("📥 Resposta da API getCorretores():", response);
        
        // TEMPORÁRIO: Usar dados mockados se a API retornar vazio
        if (!response || !response.data || response.data.length === 0) {
          console.warn("⚠️ API retornou vazio, usando dados mockados");
          
          // DADOS MOCKADOS - substituir quando API funcionar
          const mockCorretores = [
            { nome: "Eduardo Lima" },
            { nome: "Maria Silva" },
            { nome: "João Santos" },
            { nome: "Ana Costa" },
            { nome: "Pedro Oliveira" },
            { nome: "Juliana Ferreira" },
            { nome: "Carlos Mendes" },
            { nome: "Beatriz Souza" }
          ];
          
          const corretoresList = mockCorretores.map((item) => ({
            value: item.nome,
            label: item.nome,
          }));
          
          setCorretores(corretoresList);
          return;
        }
        
        // Processar resposta real da API quando funcionar
        const corretoresData = response?.data?.data || response?.data || [];
        const corretoresList = corretoresData.map((item) => ({
          value: item.nome,
          label: item.nome,
        }));
        
        setCorretores(corretoresList);
        
      } catch (error) {
        console.error("❌ Erro ao buscar corretores:", error);
        console.error("Detalhes:", error.message);
        
        // Em caso de erro, usar lista vazia
        setCorretores([]);
      }
    };
    
    fetchCorretores();
  }, []);
  
  const corretorField = () => {
    if (!formData.Corretor || formData.Corretor.trim() === "") {
      return {
        name: "Corretor",
        label: "Nome",
        type: "select",
        options: corretores,
        value: formData.Corretor || "",
      };
    }
    
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
