"use client";

import { memo } from "react";
import FormField from "./FormField";

// List of required fields
export const REQUIRED_FIELDS = [
  "Empreendimento",
  "Slug",
  "CEP",
  "Endereco",
  "Numero",
  "Bairro",
  "Cidade",
];

const FieldGroup = ({ fields, formData, displayValues, onChange, validation = {} }) => {
  const getFieldValue = (field) => {
    if (field.name === "Video.1.Video") {
      return formData?.Video?.[1]?.Video || "";
    }
    return formData[field.name] || "";
  };

  const isFieldValid = (fieldName) => {
    // If we don't have validation data, assume it's valid
    if (!validation.fieldValidation) return true;
    return validation.fieldValidation[fieldName] !== false;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {fields.map((field, index) => (
        <FormField
          key={`${field.name}-${index}`}
          field={field}
          value={getFieldValue(field)}
          displayValue={field.isMonetary ? displayValues[field.name] : undefined}
          onChange={onChange}
          fullWidth={field.type === "textarea"}
          isRequired={REQUIRED_FIELDS.includes(field.name)}
          isValid={isFieldValid(field.name)}
        />
      ))}
    </div>
  );
};

export default memo(FieldGroup);
