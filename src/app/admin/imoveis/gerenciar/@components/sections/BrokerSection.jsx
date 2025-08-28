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
        
        // DEBUG COMPLETO - Ver toda a estrutura
        console.log("=== DEBUG CORRETORES ===");
        console.log("1. Response completo:", response);
        console.log("2. response.data:", response?.data);
        console.log("3. response.data.data:", response?.data?.data);
        
        // Tentar diferentes caminhos possíveis
        let corretoresData = null;
        
        if (response?.data?.data) {
          corretoresData = response.data.data;
          console.log("Usando: response.data.data");
        } else if (response?.data) {
          corretoresData = response.data;
          console.log("Usando: response.data");
        } else if (Array.isArray(response)) {
          corretoresData = response;
          console.log("Usando: response direto (é array)");
        } else if (response?.corretores) {
          corretoresData = response.corretores;
          console.log("Usando: response.corretores");
        }
        
        console.log("4. Dados dos corretores:", corretoresData);
        
        // Se encontrou dados, verificar o primeiro item para ver a estrutura
        if (corretoresData && corretoresData.length > 0) {
          console.log("5. Primeiro corretor (estrutura):", corretoresData[0]);
          console.log("6. Chaves do objeto:", Object.keys(corretoresData[0]));
        }
        
        // Mapear corretores - tentar diferentes campos possíveis
        const corretoresList = corretoresData?.map((item, index) => {
          const nome = item.nome || item.Nome || item.name || item.Name || 
                       item.nomeCorretor || item.corretor || `Corretor ${index + 1}`;
          
          console.log(`Corretor ${index}:`, nome);
          
          return {
            value: nome,
            label: nome,
          };
        }) || [];
        
        console.log("7. Lista final de corretores:", corretoresList);
        console.log("=== FIM DEBUG ===");
        
        setCorretores(corretoresList);
        
      } catch (error) {
        console.error("❌ ERRO ao buscar corretores:", error);
        console.error("Detalhes do erro:", error.response || error.message);
        setCorretores([]); // Lista vazia em caso de erro
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
        options: corretores.length > 0 
          ? corretores 
          : [{ value: "", label: "Nenhum corretor encontrado" }],
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
