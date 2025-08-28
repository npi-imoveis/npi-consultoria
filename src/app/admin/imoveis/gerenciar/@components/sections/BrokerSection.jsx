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
        
        if (response.success && response.data) {
          let corretoresArray = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
          
          // LOG para verificar quantos corretores vieram
          console.log(`Total de corretores recebidos: ${corretoresArray.length}`);
          
          const corretoresList = corretoresArray.map((item) => ({
            value: item.nome || item.Nome || "",
            label: item.nome || item.Nome || "Sem nome",
          })).filter(c => c.value);
          
          // Ordenar alfabeticamente
          corretoresList.sort((a, b) => a.label.localeCompare(b.label));
          
          console.log(`Corretores processados: ${corretoresList.length}`);
          setCorretores(corretoresList);
        }
        
      } catch (error) {
        console.error("Erro ao buscar corretores:", error);
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
