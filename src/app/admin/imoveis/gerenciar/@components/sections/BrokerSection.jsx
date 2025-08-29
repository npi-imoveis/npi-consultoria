// src/app/admin/imoveis/gerenciar/@components/sections/BrokerSection.jsx

"use client";
import { memo, useEffect, useState } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import axiosClient from "@/app/lib/axios-client";

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState([]);
  
  useEffect(() => {
    const fetchAllCorretores = async () => {
      try {
        let todosCorretores = [];
        
        // Buscar primeira página
        const firstResponse = await axiosClient.get("admin/corretores");
        
        if (firstResponse.data?.corretores) {
          todosCorretores = [...firstResponse.data.corretores];
          
          // Buscar páginas adicionais
          const totalPages = firstResponse.data.pagination?.totalPages || 1;
          
          for (let page = 2; page <= totalPages; page++) {
            const response = await axiosClient.get(`admin/corretores?page=${page}`);
            if (response.data?.corretores) {
              todosCorretores = [...todosCorretores, ...response.data.corretores];
            }
          }
        }
        
        // Mapear todos os corretores
        const corretoresList = todosCorretores
          .map((item) => ({
            value: item.nome,
            label: item.nome,
          }))
          .filter(c => c.value)
          .sort((a, b) => a.label.localeCompare(b.label));
        
        console.log(`Total de corretores: ${corretoresList.length}`);
        setCorretores(corretoresList);
        
      } catch (error) {
        console.error("Erro ao buscar corretores:", error);
        setCorretores([]);
      }
    };
    
    fetchAllCorretores();
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
