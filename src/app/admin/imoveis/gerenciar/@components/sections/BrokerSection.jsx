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
        
        console.log("Resposta getCorretores:", response);
        
        // Verificar se a resposta foi bem-sucedida
        if (response.success && response.data) {
          // response.data deve ser um array de corretores
          let corretoresArray = Array.isArray(response.data) 
            ? response.data 
            : response.data.data || [];
          
          console.log("Corretores recebidos:", corretoresArray);
          
          // Mapear para o formato esperado
          const corretoresList = corretoresArray.map((item) => {
            return {
              value: item.nome || item.Nome || "",
              label: item.nome || item.Nome || "Sem nome",
            };
          }).filter(c => c.value); // Filtrar corretores sem nome
          
          console.log("Lista processada:", corretoresList);
          setCorretores(corretoresList);
        } else {
          // Se falhou ou não tem dados
          console.error("Erro ao buscar corretores:", response.message);
          setCorretores([]);
        }
        
      } catch (error) {
        console.error("Erro na requisição:", error);
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
