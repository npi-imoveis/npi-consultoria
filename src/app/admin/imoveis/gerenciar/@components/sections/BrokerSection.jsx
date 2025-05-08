"use client";

import { memo, useEffect, useState } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import { getCorretores } from "@/app/admin/services/corretores";

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState([]);

  useEffect(() => {
    const fetchCorretores = async () => {
      if (!formData.Corretor) {
        const response = await getCorretores();
        const corretor = response.data?.data?.map((item, index) => {
          return {
            value: item.nome,
            label: item.nome,
          };
        });

        setCorretores(corretor);
      }
    };
    fetchCorretores();
  }, []);

  const corretorField = () => {
    if (formData.Corretor) {
      return {
        name: "Corretor",
        label: "Nome",
        type: "text",
        value: formData.Corretor,
      };
    }
    if (!formData.Corretor) {
      return {
        name: "Corretor",
        label: "Nome",
        type: "select",
        options: corretores,
      };
    }
    return;
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
  ];

  return (
    <FormSection title="Corretores Vinculados">
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
