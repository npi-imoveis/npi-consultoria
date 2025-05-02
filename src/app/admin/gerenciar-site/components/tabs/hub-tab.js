"use client";

import { useState, useEffect } from "react";
import Section from "../ui/section";
import { InputField, TextareaField } from "../ui/form-fields";
import HubImageSection from "../sections/hub-image-section";
import Button from "../ui/button";
import ImageSection from "../sections/image-section";

export default function HubTab({ form }) {
  const [formData, setFormData] = useState(form?.sobre_hub || {});
  const [loadingSection, setLoadingSection] = useState(null);
  const [sectionStatus, setSectionStatus] = useState({
    header: { show: false, type: null, message: null },
    sobre: { show: false, type: null, message: null },
    howto: { show: false, type: null, message: null },
  });

  useEffect(() => {
    if (form?.sobre_hub) {
      // Garantir que howto seja sempre um array com 3 itens
      const howtoData = form.sobre_hub.howto || [];
      const formattedHowto = Array(3)
        .fill(null)
        .map((_, index) => ({
          title: howtoData[index]?.title || "",
          description: howtoData[index]?.description || "",
        }));

      setFormData({
        ...form.sobre_hub,
        howto: formattedHowto,
      });
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Tratamento especial para campos do howto
    if (name.startsWith("howto_")) {
      const [_, field, indexStr] = name.match(/howto_(title|description)(\d+)/);
      const index = parseInt(indexStr) - 1;

      setFormData((prev) => {
        const updatedHowto = [...(prev.howto || [])];
        if (!updatedHowto[index]) {
          updatedHowto[index] = { title: "", description: "" };
        }
        updatedHowto[index][field] = value;

        return {
          ...prev,
          howto: updatedHowto,
        };
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleImageChange = (e) => {
    const { name, value, previewUrl } = e.target;
    // Usar previewUrl ou value, o que estiver disponível
    const imageUrl = previewUrl || value;
    if (imageUrl) {
      setFormData((prev) => ({
        ...prev,
        [name]: imageUrl,
      }));
    }
  };

  // Função para mostrar e ocultar mensagens de status
  const showStatusMessage = (section, type, message) => {
    setSectionStatus((prev) => ({
      ...prev,
      [section]: { show: true, type, message },
    }));

    // Esconde a mensagem após 5 segundos
    setTimeout(() => {
      setSectionStatus((prev) => ({
        ...prev,
        [section]: { ...prev[section], show: false },
      }));
    }, 5000);
  };

  // Função genérica para atualizar o conteúdo
  const updateContent = async (section, data) => {
    try {
      setLoadingSection(section);

      const payload = {
        sobre_hub: {
          ...formData,
          ...data,
        },
      };

      // Adiciona um tempo mínimo de loading de 2 segundos
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await fetch("/api/revalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: "/" }),
      });

      if (response.ok) {
        showStatusMessage(
          section,
          "success",
          `${section.charAt(0).toUpperCase() + section.slice(1)} atualizado com sucesso`
        );
      } else {
        showStatusMessage(section, "error", `Erro ao atualizar ${section}`);
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${section}:`, error);
      showStatusMessage(section, "error", `Erro ao atualizar ${section}`);
    } finally {
      setLoadingSection(null);
    }
  };

  // Componente para renderizar mensagens de status
  const StatusMessage = ({ section }) => {
    const status = sectionStatus[section];
    if (!status.show) return null;

    return (
      <div
        className={`mt-4 p-3 rounded ${
          status.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        {status.message}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <Section title="Header">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full space-y-4">
            <InputField
              label="Título"
              name="header"
              value={formData.header || ""}
              onChange={handleChange}
              type="text"
            />
            <TextareaField
              label="Descrição"
              name="header_descricao"
              value={formData.header_descricao || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1"></div>
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button
            onClick={() =>
              updateContent("header", {
                header: formData.header,
                header_descricao: formData.header_descricao,
                header_image: formData.header_image,
              })
            }
            disabled={loadingSection === "header"}
          >
            {loadingSection === "header" ? "Atualizando..." : "Atualizar Header"}
          </Button>
          <StatusMessage section="header" />
        </div>
      </Section>

      <Section title="Sobre">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-1">
            <ImageSection
              directory="sobre_hub"
              filename="sobre_hub1"
              onChange={handleImageChange}
            />
          </div>
          <div className="flex-1 space-y-4">
            <InputField
              label="Título"
              name="titulo"
              value={formData.titulo || ""}
              onChange={handleChange}
              type="text"
            />
            <TextareaField
              label="Descrição"
              name="descricao"
              value={formData.descricao || ""}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputField
              label="Título 2"
              name="titulo1"
              value={formData.titulo1 || ""}
              onChange={handleChange}
              type="text"
            />
            <TextareaField
              label="Descrição 2"
              name="descricao2"
              value={formData.descricao2 || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <ImageSection
              directory="sobre_hub"
              filename="sobre_hub2"
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button
            onClick={() =>
              updateContent("sobre", {
                titulo: formData.titulo,
                titulo1: formData.titulo1,
                descricao: formData.descricao,
                descricao2: formData.descricao2,
                about_image1: formData.about_image1,
                about_image2: formData.about_image2,
              })
            }
            disabled={loadingSection === "sobre"}
          >
            {loadingSection === "sobre" ? "Atualizando..." : "Atualizar Sobre"}
          </Button>
          <StatusMessage section="sobre" />
        </div>
      </Section>

      <Section title="Como funciona o Hub">
        <div className="flex flex-1 flex-col gap-8">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-6 space-y-4">
              <InputField
                label="Título"
                name={`howto_title${idx}`}
                value={formData.howto?.[idx - 1]?.title || ""}
                onChange={handleChange}
                type="text"
              />
              <TextareaField
                label="Descrição"
                name={`howto_description${idx}`}
                value={formData.howto?.[idx - 1]?.description || ""}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col space-y-2">
          <Button
            onClick={() =>
              updateContent("howto", {
                howto: formData.howto,
                howto_image: formData.howto_image,
              })
            }
            disabled={loadingSection === "howto"}
          >
            {loadingSection === "howto" ? "Atualizando..." : "Atualizar Como Funciona"}
          </Button>
          <StatusMessage section="howto" />
        </div>
      </Section>
    </div>
  );
}
