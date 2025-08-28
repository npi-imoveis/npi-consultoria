// src/app/admin/imoveis/gerenciar/@components/sections/BrokerSection.jsx

"use client";
import { memo, useEffect, useState, useRef } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import { getCorretores } from "@/app/admin/services/corretores";

// Cache global para não perder os corretores
let corretoresCache = [];

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState(corretoresCache);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);
  
  useEffect(() => {
    // Se já tem cache, usar o cache
    if (corretoresCache.length > 0) {
      setCorretores(corretoresCache);
      return;
    }
    
    // Evitar múltiplas chamadas
    if (hasFetched.current || isLoading) return;
    
    const fetchCorretores = async () => {
      hasFetched.current = true;
      setIsLoading(true);
      
      try {
        const response = await getCorretores();
        
        if (response?.success && response?.data) {
          let corretoresArray = Array.isArray(response.data) 
            ? response.data 
            : response.data?.data || [];
          
          const corretoresList = corretoresArray
            .map((item) => ({
              value: item.nome || item.Nome || "",
              label: item.nome || item.Nome || "Sem nome",
            }))
            .filter(c => c.value)
            .sort((a, b) => a.label.localeCompare(b.label));
          
          // Salvar no cache e no state
          corretoresCache = corretoresList;
          setCorretores(corretoresList);
          
          console.log(`✅ ${corretoresList.length} corretores carregados e salvos em cache`);
        }
      } catch (error) {
        console.error("Erro ao buscar corretores:", error);
        // Tentar novamente em 2 segundos
        setTimeout(() => {
          hasFetched.current = false;
          fetchCorretores();
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCorretores();
  }, []); // Array vazio para executar apenas uma vez
  
  const corretorField = () => {
    const isEmptyCorretor = !formData.Corretor || formData.Corretor.trim() === "";
    
    if (isEmptyCorretor) {
      return {
        name: "Corretor",
        label: "Nome",
        type: "select",
        options: corretores.length > 0 
          ? corretores 
          : isLoading 
            ? [{ value: "", label: "Carregando corretores..." }]
            : [{ value: "", label: "Nenhum corretor disponível" }],
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

// IMPORTANTE: memo evita re-renders desnecessários
export default memo(BrokerSection, (prevProps, nextProps) => {
  // Só re-renderizar se o corretor mudar
  return prevProps.formData.Corretor === nextProps.formData.Corretor &&
         prevProps.formData.EmailCorretor === nextProps.formData.EmailCorretor &&
         prevProps.formData.CelularCorretor === nextProps.formData.CelularCorretor;
});
