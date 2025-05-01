"use client";

import { memo } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";

const featuresFields = [
  { name: "AreaPrivativa", label: "Área Privativa (m²)", type: "text" },
  { name: "AreaTotal", label: "Área Total (m²)", type: "text" },
  { name: "DormitoriosAntigo", label: "Dormitórios", type: "text" },
  { name: "SuiteAntigo", label: "Suítes", type: "text" },
  { name: "BanheiroSocialQtd", label: "Banheiros Sociais", type: "text" },
  { name: "VagasAntigo", label: "Vagas de Garagem", type: "text" },
];

const FeaturesSection = ({ formData, displayValues, onChange }) => {
  return (
    <FormSection title="Características">
      <FieldGroup
        fields={featuresFields}
        formData={formData}
        displayValues={displayValues}
        onChange={onChange}
      />
    </FormSection>
  );
};

export default memo(FeaturesSection);
