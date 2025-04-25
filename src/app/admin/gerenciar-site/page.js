"use client";

import AuthCheck from "../components/auth-check";
import { useEffect, useState } from "react";
import UpdateContent from './components/update';



function Section({ title, children }) {
  return (
    <section className="mb-8 bg-white rounded-lg p-8">
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 my-4">{title}</h2>
      {children}
    </section>
  );
}

function InputField({ label, name, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        name={name}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        {...props}
      />
    </div>
  );
}

function TextareaField({ label, name, ...props }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <textarea
        name={name}
        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
        {...props}
      />
    </div>
  );
}

function ImageUpload({ label, onChange, value, name }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const [error, setError] = useState(null);

  // Atualizar previewUrl quando value muda
  useEffect(() => {
    if (value) {
      setPreviewUrl(value);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("O arquivo é muito grande. Tamanho máximo: 2MB.");
      return;
    }

    // Armazenar o arquivo selecionado
    setSelectedFile(file);
    setError(null);

    // Criar e mostrar preview local
    const localPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(localPreviewUrl);

    // Notificar componente pai da mudança (sem fazer upload)
    if (onChange) {
      onChange({
        target: {
          name,
          value: null, // Caminho ainda não disponível
          file, // Passar o arquivo para fazer upload depois
          previewUrl: localPreviewUrl
        }
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 min-h-[120px]">
      <label className="block text-sm font-medium mb-2">{label}</label>

      {previewUrl && (
        <div className="mb-4 relative w-full max-w-[200px]">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-auto rounded-md object-cover"
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        className="mb-2"
        onChange={handleFileChange}
        name={name}
      />

      {error && <p className="text-xs text-red-500">{error}</p>}
      {!error && (
        <span className="text-xs text-gray-500">(JPG, PNG, até 2MB)</span>
      )}
    </div>
  );
}

export default function GerenciarSite() {
  const [tab, setTab] = useState("home");
  const [form, setForm] = useState({});



  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/content/get/");
      const data = await res.json();
      setForm(data);

    };
    fetchData();
  }, []);

  return (
    <AuthCheck>
      <div className="mx-auto">
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
        <div className="min-h-[200px]">
          {tab === "home" && <HomeTab form={form} />}
          {tab === "hub" && <HubTab form={form} />}
          {tab === "sobre" && <SobreTab form={form} />}
          {tab === "servicos" && <ServicosTab form={form} />}
        </div>
      </div>
    </AuthCheck>
  );
}

function HomeTab({ form }) {
  const [formData, setFormData] = useState(form || {});
  const [imagePreviews, setImagePreviews] = useState({});
  const [pendingImages, setPendingImages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: null });

  useEffect(() => {
    if (form) {
      setFormData(form);
    }
  }, [form]);

  const stats = [
    { label: "Posições 1 Página", name: "stats_position" },
    { label: "Visualizações no Google", name: "stats_views" },
    { label: "Cliques no site", name: "stats_clicks" },
    { label: "Imobiliárias parceiras", name: "stats_partners" },
    { label: "Imóveis cadastrados", name: "stats_properties" },
  ]

  const cards = [
    { title: "card_destacado_title", description: "card_destacado_description" },
    { title: "card_destacado_title2", description: "card_destacado_description2" },
  ]

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleImageChange = (e) => {
    const { name, file, previewUrl } = e.target;

    // Armazenar o arquivo para upload posterior
    if (file) {
      setPendingImages((prev) => ({
        ...prev,
        [name]: file,
      }));
    }

    // Armazenar a URL de preview
    if (previewUrl) {
      setImagePreviews((prev) => ({
        ...prev,
        [name]: previewUrl,
      }));
    }
  };

  // Função para upload de uma imagem
  const uploadImage = async (name, file) => {
    try {
      // Criar FormData para enviar o arquivo
      const formData = new FormData();
      formData.append('file', file);

      // Enviar para a API de upload local
      const response = await fetch('/api/upload-local', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro ao fazer upload');
      }

      // Retornar o caminho do arquivo
      return data.filePath;
    } catch (error) {
      console.error(`Erro no upload da imagem ${name}:`, error);
      throw error;
    }
  };



  return (
    <div className="space-y-8 ">
      <Section title="Quem somos">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-4">
            <InputField
              label="Título"
              name="sobre_titulo"
              value={formData["sobre_titulo"] || ""}
              onChange={handleChange}
              type="text"
            />
            <InputField
              label="Subtítulo"
              name="sobre_subtitulo"
              value={formData["sobre_subtitulo"] || ""}
              onChange={handleChange}
              type="text"
            />
            <TextareaField
              label="Descrição"
              name="sobre_descricao"
              value={formData["sobre_descricao"] || ""}
              onChange={handleChange}
            />
          </div>
          <div className="flex-1">
            <ImageUpload
              label="Imagem"
              name="sobre_imagem"
              value={formData["sobre_imagem"]}
              onChange={handleImageChange}
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            className="bg-black px-4 py-2 text-white rounded-md disabled:bg-gray-400"
          >
            Atualizar Quem Somos
          </button>
        </div>
      </Section>
      <Section title="Nossos Resultados em Números">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stats.map(({ label, name }, i) => (
            <InputField
              key={i}
              label={label}
              name={name}
              value={formData[name] || ""}
              onChange={handleChange}
            />
          ))}
        </div>
        <button
          className="mt-4 bg-black px-4 py-2 text-white rounded-md disabled:bg-gray-400"
        >
          Atualizar Resultados
        </button>
      </Section>
      <Section title="Cards Destacados">
        <div className="flex flex-col md:flex-row gap-8">
          {cards.map(({ title, description }, idx) => (
            <div key={idx} className="flex-1 bg-gray-50 rounded-lg p-6 space-y-4">
              <InputField
                label="Título"
                name={title}
                value={formData[title] || ""}
                onChange={handleChange}
                type="text"
              />
              <InputField
                label="Descrição"
                name={description}
                value={formData[description] || ""}
                onChange={handleChange}
                type="text"
              />
              <ImageUpload
                label="Imagem"
                name={`card_image_${idx}`}
                value={formData[`card_image_${idx}`] || ""}
                onChange={handleImageChange}
              />
            </div>
          ))}
        </div>
        <button
          className="mt-4 bg-black px-4 py-2 text-white rounded-md disabled:bg-gray-400"
        >
          Atualizar Cards Destacados
        </button>
      </Section>

      <Section title="Testemunhos">
        <TestemunhosSection />
      </Section>
    </div>
  );
}

function HubTab({ form }) {
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
