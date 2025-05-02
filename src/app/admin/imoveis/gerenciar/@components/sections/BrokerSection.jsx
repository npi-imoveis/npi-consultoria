"use client";

import { memo } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";

const brokerFields = [
  { name: "Corretor", label: "Nome", type: "text" },
  { name: "EmailCorretor", label: "E-mail", type: "text" },
  { name: "CelularCorretor", label: "Celular", type: "text" },
  {
    name: "Tipo",
    label: "Tipo",
    type: "select",
    options: [
      { value: "Captador", label: "Captador" },
      { value: "Promotor", label: "Promotor" },
    ],
  },
];

const BrokerSection = ({ formData, displayValues, onChange }) => {
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
