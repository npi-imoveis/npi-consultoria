"use client";

import { memo, useEffect, useState } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import { getCorretores } from "@/app/admin/services/corretores";

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState([]);
  const [corretorasData, setCorretorasData] = useState([]); // Armazenar dados completos dos corretores

  useEffect(() => {
    const fetchCorretores = async () => {
      const response = await getCorretores();

      // Armazenar os dados completos dos corretores
      if (response.data?.data) {
        setCorretorasData(response.data.data);
      }

      const corretor = response.data?.data?.map((item) => {
        return {
          value: item.nome,
          label: item.nome,
        };
      });

      setCorretores(corretor);
    };
    fetchCorretores();
  }, []);

  // Função para preencher os campos do corretor quando selecionado
  const handleCorretorChange = (value, name) => {
    if (name === "Corretor") {
      // Buscar os dados completos do corretor selecionado
      const corretorSelecionado = corretorasData.find((corretor) => corretor.nome === value);

      if (corretorSelecionado) {
        // Atualizar campos relacionados
        onChange("EmailCorretor", corretorSelecionado.email || "");
        onChange("CelularCorretor", corretorSelecionado.celular || "");
      }
    }

    // Chamar o onChange original para atualizar o campo atual
    onChange(name, value);
  };

  const brokerFields = [
    { name: "Corretor", label: "Nome", type: "select", options: corretores },
    { name: "EmailCorretor", label: "E-mail", type: "text", disabled: true },
    { name: "CelularCorretor", label: "Celular", type: "text", disabled: true },
    {
      name: "Imobiliaria",
      label: "Imobiliária",
      type: "text",
    },
  ];

  return (
    <FormSection title="Corretores Vinculados">
      <FieldGroup
        fields={brokerFields}
        formData={formData}
        displayValues={displayValues}
        onChange={handleCorretorChange}
      />
    </FormSection>
  );
};

export default memo(BrokerSection);
