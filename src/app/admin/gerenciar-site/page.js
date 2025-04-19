"use client";

import AuthCheck from "../components/auth-check";
import { useState } from "react";

// Componentes reutilizáveis
function Section({ title, children }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">{title}</h2>
      {children}
    </section>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}

function TextareaField({ label, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
        {...props}
      />
    </div>
  );
}

function ImageUpload({ label, onChange }) {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[120px]">
      <label className="block text-sm font-medium mb-2">{label}</label>
      <input type="file" accept="image/*" className="mb-2" onChange={onChange} />
      <span className="text-xs text-gray-500">(JPG, PNG, até 2MB)</span>
    </div>
  );
}

export default function GerenciarSite() {
  const [tab, setTab] = useState("home");
  return (
    <AuthCheck>
      <div className="mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Gerenciar Site</h1>
        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { key: "home", label: "Home" },
            { key: "hub", label: "Conheça o Hub" },
            { key: "sobre", label: "Sobre a NPI" },
            { key: "servicos", label: "Nossos Serviços" },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${tab === key ? "border-black text-black bg-gray-50" : "border-transparent text-gray-400 bg-gray-100"}`}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {/* Tab Content */}
        <div className="bg-white rounded-lg p-8 min-h-[200px]">
          {tab === "home" && <HomeTab />}
          {tab === "hub" && <HubTab />}
          {tab === "sobre" && <SobreTab />}
          {tab === "servicos" && <ServicosTab />}
        </div>
      </div>
    </AuthCheck>
  );
}

function HomeTab() {
  return (
    <div className="space-y-8">
      <Section title="Quem somos">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputField label="Título" placeholder="Digite o título" type="text" />
            <InputField label="Subtítulo" placeholder="Digite o subtítulo" type="text" />
            <TextareaField label="Descrição" placeholder="Digite a descrição" />
          </div>
          <div className="flex-1">
            <ImageUpload label="Imagem" />
          </div>
        </div>
      </Section>
      <Section title="Nossos Resultados em Números">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            "Posições 1 Página",
            "Visualizações no Google",
            "Cliques no site",
            "Imobiliárias parceiras",
            "Imóveis cadastrados",
          ].map((label, i) => (
            <InputField key={i} label={label} placeholder={`Digite o número de ${label.toLowerCase()}`} type="number" />
          ))}
        </div>
      </Section>
      <Section title="Cards Destacados">
        <div className="flex flex-col md:flex-row gap-8">
          {[0, 1].map((idx) => (
            <div key={idx} className="flex-1 bg-gray-50 rounded-lg p-6 space-y-4">
              <InputField label="Título" placeholder="Digite o título" type="text" />
              <InputField label="Descrição" placeholder="Digite a descrição" type="text" />
              <ImageUpload label="Imagem" />
            </div>
          ))}
        </div>
      </Section>
      <Section title="Testemunhos">
        <TestemunhosSection />
      </Section>
    </div>
  );
}

function HubTab() {
  return (
    <div className="space-y-8">
      <Section title="Header">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputField label="Título" placeholder="Digite o título" type="text" />
            <TextareaField label="Descrição" placeholder="Digite a descrição" />
          </div>
          <div className="flex-1">
            <ImageUpload label="Imagem" />
          </div>
        </div>
      </Section>
      <Section title="Sobre">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="flex-1">
            <ImageUpload label="Imagem" />
          </div>
          <div className="flex-1 space-y-4">
            <InputField label="Título" placeholder="Digite o título" type="text" />
            <TextareaField label="Descrição" placeholder="Digite a descrição" />
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputField label="Título" placeholder="Digite o título" type="text" />
            <TextareaField label="Descrição" placeholder="Digite a descrição" />
          </div>
          <div className="flex-1">
            <ImageUpload label="Imagem" />
          </div>
        </div>
      </Section>
      <Section title="Como funciona o Hub">
        <div className="flex flex-col gap-8">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-6 space-y-4">
              <InputField label="Título" placeholder={`Digite o título do card ${idx}`} type="text" />
              <TextareaField label="Descrição" placeholder={`Digite a descrição do card ${idx}`} />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <ImageUpload label="Imagem" />
        </div>
      </Section>
    </div>
  );
}

function SobreTab() {
  return (
    <div className="space-y-8">
      <Section title="Header">
        <div className="space-y-4">
          <InputField label="Título" placeholder="Digite o título" type="text" />
          <TextareaField label="Descrição" placeholder="Digite a descrição" />
        </div>
      </Section>
      <Section title="Quem Somos">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputField label="Título" placeholder="Digite o título" type="text" />
            <TextareaField label="Descrição" placeholder="Digite a descrição" />
            <InputField label="Destaque 1" placeholder="Digite o destaque 1" type="text" />
            <InputField label="Destaque 2" placeholder="Digite o destaque 2" type="text" />
          </div>
          <div className="flex-1">
            <ImageUpload label="Imagem" />
          </div>
        </div>
      </Section>
      <Section title="Nossa história">
        <NossaHistoriaSection />
      </Section>
      <Section title="Nossa missão e serviços">
        <div className="space-y-4">
          <InputField label="Título" placeholder="Digite o título" type="text" />
          <InputField label="Descrição" placeholder="Digite a descrição" type="text" />
          <InputField label="Link do vídeo do YouTube" placeholder="Cole o link do vídeo do YouTube" type="text" />
          <InputField label="Título" placeholder="Digite o título" type="text" />
          <InputField label="Descrição" placeholder="Digite a descrição" type="text" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="bg-gray-50 rounded-lg p-6 space-y-4">
              <InputField label="Título" placeholder={`Digite o título do serviço ${idx}`} type="text" />
              <TextareaField label="Descrição" placeholder={`Digite a descrição do serviço ${idx}`} />
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function ServicosTab() {
  return (
    <div className="space-y-8">
      <Section title="Nossos Serviços">
        <NossosServicosTabs />
      </Section>
    </div>
  );
}

// Componente para a seção de testemunhos
function TestemunhosSection() {
  const [testemunhos, setTestemunhos] = useState([
    { descricao: "", nome: "", cargo: "", foto: null }
  ]);
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (idx, field, value) => {
    setTestemunhos((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleFileChange = (idx, file) => {
    setTestemunhos((prev) => {
      const updated = [...prev];
      updated[idx].foto = file;
      return updated;
    });
  };

  const addTestemunho = () => {
    setTestemunhos((prev) => [
      ...prev,
      { descricao: "", nome: "", cargo: "", foto: null }
    ]);
    setActiveTab(testemunhos.length);
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {testemunhos.map((_, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${activeTab === idx ? "border-black text-black bg-gray-50" : "border-transparent text-gray-400 bg-gray-100"}`}
            onClick={() => setActiveTab(idx)}
          >
            Testemunho {idx + 1}
          </button>
        ))}
        <button
          className="px-4 py-2 rounded-t-md font-semibold border-b-2 border-transparent text-blue-500 bg-gray-100 hover:bg-blue-50 ml-2"
          onClick={addTestemunho}
        >
          + Adicionar
        </button>
      </div>
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <TextareaField
          label="Descrição"
          placeholder="Digite o testemunho"
          value={testemunhos[activeTab].descricao}
          onChange={e => handleChange(activeTab, "descricao", e.target.value)}
        />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <InputField
              label="Nome"
              placeholder="Nome do autor"
              type="text"
              value={testemunhos[activeTab].nome}
              onChange={e => handleChange(activeTab, "nome", e.target.value)}
            />
          </div>
          <div className="flex-1">
            <InputField
              label="Cargo"
              placeholder="Cargo do autor"
              type="text"
              value={testemunhos[activeTab].cargo}
              onChange={e => handleChange(activeTab, "cargo", e.target.value)}
            />
          </div>
        </div>
        <ImageUpload
          label="Foto"
          onChange={e => handleFileChange(activeTab, e.target.files[0])}
        />
      </div>
    </div>
  );
}

// Componente para a seção Nossa história
function NossaHistoriaSection() {
  const [historias, setHistorias] = useState([
    { ano: '', titulo: '', descricao: '', foto: null },
    { ano: '', titulo: '', descricao: '', foto: null },
    { ano: '', titulo: '', descricao: '', foto: null },
    { ano: '', titulo: '', descricao: '', foto: null },
  ]);
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (idx, field, value) => {
    setHistorias((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleFileChange = (idx, file) => {
    setHistorias((prev) => {
      const updated = [...prev];
      updated[idx].foto = file;
      return updated;
    });
  };

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {historias.map((_, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${activeTab === idx ? "border-black text-black bg-gray-50" : "border-transparent text-gray-400 bg-gray-100"}`}
            onClick={() => setActiveTab(idx)}
          >
            {`História ${idx + 1}`}
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-8 bg-gray-50 rounded-lg p-6">
        <div className="flex-1 space-y-4">
          <InputField
            label="Ano"
            placeholder="Digite o ano"
            type="text"
            value={historias[activeTab].ano}
            onChange={e => handleChange(activeTab, 'ano', e.target.value)}
          />
          <InputField
            label="Título"
            placeholder="Digite o título"
            type="text"
            value={historias[activeTab].titulo}
            onChange={e => handleChange(activeTab, 'titulo', e.target.value)}
          />
          <TextareaField
            label="Descrição"
            placeholder="Digite a descrição"
            value={historias[activeTab].descricao}
            onChange={e => handleChange(activeTab, 'descricao', e.target.value)}
          />
        </div>
        <div className="flex-1">
          <ImageUpload
            label="Imagem"
            onChange={e => handleFileChange(activeTab, e.target.files[0])}
          />
        </div>
      </div>
    </div>
  );
}

// Componente para as tabs de Nossos Serviços
function NossosServicosTabs() {
  const [servicos, setServicos] = useState(Array(9).fill({ titulo: '', descricao: '' }));
  const [activeTab, setActiveTab] = useState(0);

  const handleChange = (idx, field, value) => {
    setServicos((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {servicos.map((_, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 rounded-t-md font-semibold border-b-2 transition-colors ${activeTab === idx ? "border-black text-black bg-gray-50" : "border-transparent text-gray-400 bg-gray-100"}`}
            onClick={() => setActiveTab(idx)}
          >
            {`Serviço ${idx + 1}`}
          </button>
        ))}
      </div>
      <div className="bg-gray-50 rounded-lg p-6 space-y-4">
        <InputField
          label="Título"
          placeholder="Digite o título do serviço"
          type="text"
          value={servicos[activeTab].titulo}
          onChange={e => handleChange(activeTab, 'titulo', e.target.value)}
        />
        <TextareaField
          label="Descrição"
          placeholder="Digite a descrição do serviço"
          value={servicos[activeTab].descricao}
          onChange={e => handleChange(activeTab, 'descricao', e.target.value)}
        />
      </div>
    </div>
  );
}
