"use client";

import { memo } from "react";
import FormSection from "../FormSection";
import FieldGroup from "../FieldGroup";

const locationFields = [
  { name: "CEP", label: "CEP", type: "text" },
  { name: "Endereco", label: "Endereço", type: "text" },
  { name: "Numero", label: "Número", type: "text" },
  { name: "Complemento", label: "Complemento", type: "text" },
  { name: "Bairro", label: "Bairro", type: "text" },
  { name: "BairroComercial", label: "Bairro Comercial", type: "text" },
  { name: "Cidade", label: "Cidade", type: "text" },
  { name: "UF", label: "UF", type: "text" },
  { name: "Regiao", label: "Região", type: "text" },
  { name: "Latitude", label: "Latitude", type: "text" },
  { name: "Longitude", label: "Longitude", type: "text" },
];

const LocationSection = ({ formData, displayValues, onChange, validation }) => {
  return (
    <FormSection title="Localização">
      <FieldGroup
        fields={locationFields}
        formData={formData}
        displayValues={displayValues}
        onChange={onChange}
        validation={validation}
      />
    </FormSection>
  );
};

export default memo(LocationSection);
