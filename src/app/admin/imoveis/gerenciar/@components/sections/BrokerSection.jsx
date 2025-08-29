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

        // A resposta real da API tem a estrutura: response.corretores
        let corretoresArray = [];

        if (response.corretores) {
          // Acesso direto ao array de corretores
          corretoresArray = response.corretores;
        } else if (response.data?.corretores) {
          // Se vier wrapped em data
          corretoresArray = response.data.corretores;
        } else if (response.data && Array.isArray(response.data)) {
          // Se data for diretamente um array
          corretoresArray = response.data;
        }

        // Mapear os corretores para o formato esperado
        const corretoresList = corretoresArray
          .map((item) => ({
            value: item.nome,
            label: item.nome,
          }))
          .filter(c => c.value)
          .sort((a, b) => a.label.localeCompare(b.label));

        setCorretores(corretoresList);

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
