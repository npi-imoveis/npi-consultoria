"use client";

import { memo, useEffect, useState } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";
import { getCorretores } from "@/app/admin/services/corretores";

const BrokerSection = ({ formData, displayValues, onChange }) => {
  const [corretores, setCorretores] = useState([]);
  useEffect(() => {
    const fetchCorretores = async () => {
      const response = await getCorretores();
      const corretor = response.data?.data?.map((item, index) => {
        return {
          value: item.nome,
          label: item.nome,
        };
      });

      setCorretores(corretor);
    };
    fetchCorretores();
  }, []);
  const brokerFields = [
    { name: "Corretor", label: "Nome", type: "select", options: corretores },
    { name: "EmailCorretor", label: "E-mail", type: "text" },
    { name: "CelularCorretor", label: "Celular", type: "text" },
    {
      name: "Imobiliaria",
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
