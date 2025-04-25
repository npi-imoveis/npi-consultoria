"use client";

import { memo } from 'react';
import FormSection from '../FormSection';
import FieldGroup from '../FieldGroup';

const mediaFields = [
  { name: "Tour360", label: "Link do Tour Virtual 360°", type: "text" },
  {
    name: "Video.1.Video",
    label: "ID do Vídeo (YouTube)",
    type: "text",
    placeholder: "Ex: mdcsckJg7rc",
  },
];

const MediaSection = ({ formData, displayValues, onChange }) => {
  return (
    <FormSection title="Mídia">
      <FieldGroup 
        fields={mediaFields} 
        formData={formData} 
        displayValues={displayValues} 
        onChange={onChange} 
      />
    </FormSection>
  );
};

export default memo(MediaSection); 