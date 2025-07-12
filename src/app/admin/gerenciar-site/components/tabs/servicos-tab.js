"use client";
import { useState, useEffect } from "react";
import Section from "../ui/section";
import { InputField, TextareaField } from "../ui/form-fields";
import Button from "../ui/button";

export default function ServicosTab({ form }) {
  const [formData, setFormData] = useState({
    header: {
      title: "",
      subtitle: ""
    },
    missao: {
      titulo: "",
      descricao: "",
      youtube_link: ""
    },
    servicos: {
      atendimento: {
        titulo: "",
        descricao: ""
      },
      avaliacao: {
        titulo: "",
        descricao: ""
      },
      assessoria: {
        titulo: "",
        descricao: ""
      }
    }
  });
  
  const [loadingSection, setLoadingSection] = useState(null);
  const [sectionStatus, setSectionStatus] = useState({
    header: { show: false, type: null, message: null },
    missao: { show: false, type: null, message: null },
    servicos: { show: false, type: null, message: null }
  });

  useEffect(() => {
    if (form && form.servicos_page) {
      setFormData(form.servicos_page);
    }
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split('.');
    
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const showStatusMessage = (section, type, message) => {
    setSectionStatus(prev => ({
      ...prev,
      [section]: { show: true, type, message }
    }));

    setTimeout(() => {
      setSectionStatus(prev => ({
        ...prev,
        [section]: { ...prev[section], show: false }
      }));
    }, 5000);
  };

  const updateContent = async (section) => {
    try {
      setLoadingSection(section);

      const payload = {
        servicos_page: formData
      };

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
        body: JSON.stringify({ path: "/servicos" }),
      });

      if (response.ok) {
        showStatusMessage(section, "success", "Atualizado com sucesso!");
      } else {
        showStatusMessage(section, "error", "Erro ao atualizar");
      }
    } catch (error) {
      console.error(`Erro ao atualizar ${section}:`, error);
      showStatusMessage(section, "error", "Erro ao atualizar");
    } finally {
      setLoadingSection(null);
    }
  };

  const StatusMessage = ({ section }) => {
    const status = sectionStatus[section];
    if (!status.show) return null;

    return (
      <div className={`mt-4 p-3 rounded ${
        status.type === "success" 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {status.message}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <Section title="Header">
        <div className="space-y-4">
          <InputField
            label="Título"
            name="header.title"
            value={formData.header?.title || ""}
            onChange={handleChange}
            placeholder="Sobre a NPi Imóveis"
          />
          <InputField
            label="Subtítulo"
            name="header.subtitle"
            value={formData.header?.subtitle || ""}
            onChange={handleChange}
            placeholder="De 2007 a 2025 - Um pouco da nossa história"
          />
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button 
            onClick={() => updateContent("header")} 
            disabled={loadingSection === "header"}
          >
            {loadingSection === "header" ? "Atualizando..." : "Atualizar Header"}
          </Button>
          <StatusMessage section="header" />
        </div>
      </Section>

      {/* Nossa Missão e Serviços Section */}
      <Section title="Nossa missão e serviços">
        <div className="space-y-4">
          <InputField
            label="Título"
            name="missao.titulo"
            value={formData.missao?.titulo || ""}
            onChange={handleChange}
            placeholder="Nossa Missão e Serviços"
          />
          <TextareaField
            label="Descrição"
            name="missao.descricao"
            value={formData.missao?.descricao || ""}
            onChange={handleChange}
            rows={4}
            placeholder="Desde 2007, a NPi se dedica a oferecer um serviço imparcial e de excelência..."
          />
          <InputField
            label="Link do vídeo do YouTube"
            name="missao.youtube_link"
            value={formData.missao?.youtube_link || ""}
            onChange={handleChange}
            type="url"
            placeholder="https://youtube.com/watch?v=..."
          />
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button 
            onClick={() => updateContent("missao")} 
            disabled={loadingSection === "missao"}
          >
            {loadingSection === "missao" ? "Atualizando..." : "Atualizar Missão"}
          </Button>
          <StatusMessage section="missao" />
        </div>
      </Section>

      {/* Serviços Section */}
      <Section title="Serviços">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Atendimento Personalizado */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h4 className="text-md font-semibold text-blue-600">Atendimento Personalizado</h4>
            <InputField
              label="Título"
              name="servicos.atendimento.titulo"
              value={formData.servicos?.atendimento?.titulo || ""}
              onChange={handleChange}
              placeholder="Atendimento Personalizado"
            />
            <TextareaField
              label="Descrição"
              name="servicos.atendimento.descricao"
              value={formData.servicos?.atendimento?.descricao || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Nossa missão é entender as necessidades de cada cliente..."
            />
          </div>

          {/* Avaliação de Imóveis */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h4 className="text-md font-semibold text-blue-600">Avaliação de Imóveis</h4>
            <InputField
              label="Título"
              name="servicos.avaliacao.titulo"
              value={formData.servicos?.avaliacao?.titulo || ""}
              onChange={handleChange}
              placeholder="Avaliação de Imóveis"
            />
            <TextareaField
              label="Descrição"
              name="servicos.avaliacao.descricao"
              value={formData.servicos?.avaliacao?.descricao || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Equipe altamente capacitada para precificar o seu imóvel..."
            />
          </div>

          {/* Assessoria Jurídica */}
          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <h4 className="text-md font-semibold text-blue-600">Assessoria Jurídica</h4>
            <InputField
              label="Título"
              name="servicos.assessoria.titulo"
              value={formData.servicos?.assessoria?.titulo || ""}
              onChange={handleChange}
              placeholder="Assessoria Jurídica"
            />
            <TextareaField
              label="Descrição"
              name="servicos.assessoria.descricao"
              value={formData.servicos?.assessoria?.descricao || ""}
              onChange={handleChange}
              rows={4}
              placeholder="Consultoria especializada no mercado imobiliário..."
            />
          </div>
        </div>
        <div className="mt-4 flex flex-col space-y-2">
          <Button 
            onClick={() => updateContent("servicos")} 
            disabled={loadingSection === "servicos"}
          >
            {loadingSection === "servicos" ? "Atualizando..." : "Atualizar Serviços"}
          </Button>
          <StatusMessage section="servicos" />
        </div>
      </Section>
    </div>
  );
}
