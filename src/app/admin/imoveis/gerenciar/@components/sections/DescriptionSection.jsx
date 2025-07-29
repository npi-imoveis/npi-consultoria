"use client";

import { memo } from 'react';
import FormSection from '../FormSection';
import FieldGroup from '../FieldGroup';

const descriptionFields = [
  { name: "DescricaoUnidades", label: "Descrição da Unidade", type: "textarea" },
  { name: "FichaTecnica", label: "Ficha Técnica", type: "textarea" },
  { name: "DescricaoDiferenciais", label: "Sobre o Condomínio", type: "textarea" },
  { name: "DestaquesDiferenciais", label: "Destaques e Diferenciais", type: "textarea" },
  { name: "DestaquesLazer", label: "Destaques de Lazer", type: "textarea" },
  { name: "DestaquesLocalizacao", label: "Destaques de Localização", type: "textarea" },
  
];

const DescriptionSection = ({ formData, displayValues, onChange }) => {
  return (
    <FormSection title="Descrições">
      <FieldGroup 
        fields={descriptionFields} 
        formData={formData} 
        displayValues={displayValues} 
        onChange={onChange} 
      />
    </FormSection>
  );
};

export default memo(DescriptionSection); 
