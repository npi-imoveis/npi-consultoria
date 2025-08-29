// src/app/admin/imoveis/gerenciar/@components/sections/BrokerSection.jsx

"use client";
import { memo, useEffect, useState } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import { getCorretores } from "@/app/admin/services/corretores";

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState([]);
  
  useEffect(() => {
    const fetchAllCorretores = async () => {
      try {
        let todosCorretores = [];
        
        // Primeira chamada para pegar a primeira página e info de paginação
        const firstResponse = await getCorretores();
        
        if (firstResponse.corretores) {
          todosCorretores = [...firstResponse.corretores];
          
          // Verificar se tem mais páginas
          const totalPages = firstResponse.pagination?.totalPages || 1;
          
          // Buscar páginas adicionais se existirem
          if (totalPages > 1) {
            for (let page = 2; page <= totalPages; page++) {
              // Você precisa ajustar getCorretores para aceitar página
              // Por enquanto vou simular com a estrutura que você tem
              const response = await fetch(`/api/admin/corretores?page=${page}`);
              const data = await response.json();
              if (data.corretores) {
                todosCorretores = [...todosCorretores, ...data.corretores];
              }
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
        
        console.log(`Total de corretores carregados: ${corretoresList.length}`);
        setCorretores(corretoresList);
        
      } catch (error) {
        console.error("Erro ao buscar corretores:", error);
        
        // Se falhar, usar os dados mockados com TODOS os 33 nomes
        const corretoresMock = [
          "Andrea Vallis",
          "Caio Alfredo",
          "Claudia Robles",
          "Davi Natã",
          "Liliana",
          "Márcia Dias",
          "Natane Almeida",
          "Patty Passos Gifford",
          "Priscila D'Von",
          "Ricardo Gomes Figueira",
          "Rubens Santoro",
          "Thiago Granato",
          // Adicione os outros 21 nomes que estão faltando aqui
        ].sort();
        
        setCorretores(corretoresMock.map(nome => ({
          value: nome,
          label: nome
        })));
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
        // Adicionar estilo para aumentar o tamanho do select
        style: { maxHeight: "300px", overflowY: "auto" }
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
