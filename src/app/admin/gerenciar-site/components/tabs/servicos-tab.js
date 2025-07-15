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

      // ✅ CORREÇÃO: Adicionar requisição para salvar os dados
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: section,
          data: sectionData,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Erro desconhecido");
      }

      setSubmitStatus({
        type: "success",
        message: "Conteúdo atualizado com sucesso!",
      });

      // Opcional: Atualizar os dados locais com a resposta do servidor
      if (result.data) {
        setFormData(prev => ({ ...prev, ...result.data }));
      }

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
        
        {/* ✅ Adicionar botão de salvar se não existir */}
        <div className="mt-4 flex gap-2">
          <Button
            onClick={(e) => handleSubmitSection("nossos_servicos", e)}
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        {/* Status de envio */}
        {submitStatus.message && (
          <div
            className={`mt-4 p-3 rounded ${
              submitStatus.type === "success"
                ? "bg-green-100 text-green-700 border border-green-200"
                : "bg-red-100 text-red-700 border border-red-200"
            }`}
          >
            {submitStatus.message}
          </div>
        )}
      </Section>
    </div>
  );
}
