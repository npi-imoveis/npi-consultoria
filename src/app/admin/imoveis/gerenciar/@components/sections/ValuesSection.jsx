"use client";

import { memo } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";

const valuesFields = [
  { name: "ValorAntigo", label: "Valor da Venda", type: "text", isMonetary: true },
  { name: "ValorAluguelSite", label: "Valor de Aluguel", type: "text", isMonetary: true },
  { name: "ValorCondominio", label: "Valor do Condomínio", type: "text", isMonetary: true },
  { name: "ValorIptu", label: "Valor do IPTU ", type: "text", isMonetary: true },
];

const ValuesSection = ({ formData, displayValues, onChange }) => {
  return (
    <FormSection title="Valores">
      <FieldGroup
        fields={valuesFields}
        formData={formData}
        displayValues={displayValues}
        onChange={onChange}
      />
    </FormSection>
  );
};

export default memo(ValuesSection);
