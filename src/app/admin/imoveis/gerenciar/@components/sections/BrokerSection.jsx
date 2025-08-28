// src/app/admin/imoveis/gerenciar/@components/sections/BrokerSection.jsx

"use client";
import { memo, useEffect, useState } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import { getCorretores } from "@/app/admin/services/corretores";

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState([]);
  
  useEffect(() => {
    // Log imediato para garantir que está executando
    console.log("🚀 BrokerSection montado!");
    
    const fetchCorretores = async () => {
      try {
        console.log("📡 Chamando getCorretores()...");
        const response = await getCorretores();
        
        console.log("✅ Resposta completa:", response);
        
        // Se não tem success ou data, tentar acessar direto
        if (response) {
          // Tentar vários caminhos possíveis
          const possiblePaths = [
            response.data,
            response.data?.data,
            response.data?.corretores,
            response.corretores,
            response
          ];
          
          let corretoresArray = null;
          
          for (const path of possiblePaths) {
            if (Array.isArray(path) && path.length > 0) {
              corretoresArray = path;
              console.log("📍 Encontrado array em:", path);
              break;
            }
          }
          
          if (!corretoresArray) {
            console.error("❌ Nenhum array de corretores encontrado");
            console.log("🔍 Estrutura recebida:", JSON.stringify(response, null, 2));
            return;
          }
          
          console.log("📋 Primeiro corretor:", corretoresArray[0]);
          
          const corretoresList = corretoresArray.map((item) => ({
            value: item.nome || item.Nome || item.name || "",
            label: item.nome || item.Nome || item.name || "Sem nome",
          })).filter(c => c.value);
          
          console.log(`✅ ${corretoresList.length} corretores processados`);
          setCorretores(corretoresList);
        }
        
      } catch (error) {
        console.error("💥 Erro completo:", error);
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
