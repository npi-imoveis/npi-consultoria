"use client";

import { useState, useEffect } from "react";
import Section from "../ui/section";
import NossosServicosSection from "../sections/nossos-servicos-section";
import Button from "../ui/button";

export default function ServicosTab({ form }) {
  const [formData, setFormData] = useState(form || {});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: null });

  useEffect(() => {
    if (form) {
      setFormData(form);
    }
  }, [form]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmitSection = async (section, event) => {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: null });

    try {
      // Filter form data for this section
      const sectionKeys = Object.keys(formData).filter((key) => key.startsWith(section));
      const sectionData = {};
      sectionKeys.forEach((key) => {
        // Certifique-se de que valores vazios são tratados corretamente
        sectionData[key] = formData[key] === "" ? null : formData[key];
      });

      console.log(`Enviando dados da seção ${section}:`, sectionData);

      setSubmitStatus({
        type: "success",
        message: "Conteúdo atualizado com sucesso!",
      });
    } catch (error) {
      console.error(`Erro na seção ${section}:`, error);
      setSubmitStatus({
        type: "error",
        message: `Erro ao atualizar: ${error.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Section title="Nossos Serviços">
        <NossosServicosSection form={formData} onChange={handleChange} />
      </Section>
    </div>
  );
}
