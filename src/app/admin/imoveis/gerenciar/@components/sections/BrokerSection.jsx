"use client";

import { memo } from 'react';
import FormSection from '../FormSection';
import FieldGroup from '../FieldGroup';

const brokerFields = [
  { name: "Corretor", label: "Nome", type: "text" },
  { name: "EmailCorretor", label: "E-mail", type: "text" },
  {
    name: "TipoCorretor",
    label: "Tipo",
    type: "select",
    options: [
      { value: "Captador", label: "Captador" },
      { value: "Promotor", label: "Promotor" },
      { value: "Corretor", label: "Corretor" },
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