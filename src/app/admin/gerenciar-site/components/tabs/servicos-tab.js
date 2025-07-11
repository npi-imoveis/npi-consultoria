"use client";
import { useState } from "react";

export default function ServicosTab({ form, updateForm, updateNestedForm }) {
  const [uploadingImages, setUploadingImages] = useState({});

  // Função ULTRA DEFENSIVA para upload - não sobrescreve outros campos
  const handleImageUpload = async (serviceKey, file) => {
    if (!file) return;

    try {
      setUploadingImages(prev => ({ ...prev, [serviceKey]: true }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("section", "servicos");
      formData.append("subsection", serviceKey);
      formData.append("directory", "servicos");
      formData.append("subdirectory", serviceKey);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha no upload");
      }

      const data = await res.json();
      
      // Atualizar APENAS o campo imagem - preservar todo o resto
      updateNestedForm(serviceKey, "imagem", data.url || data.path);
      
      console.log(`📸 IMAGEM ATUALIZADA: ${serviceKey}.imagem =`, data.url || data.path);
      
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImages(prev => ({ ...prev, [serviceKey]: false }));
    }
  };

  // Função ULTRA DEFENSIVA para obter dados com fallbacks
  const getServiceData = (serviceKey) => {
    const data = form?.[serviceKey] || {};
    
    // Retornar dados existentes OU valores padrão mínimos
    return {
      titulo: data.titulo || (serviceKey === "atendimentoPersonalizado" ? "Atendimento Personalizado" : 
                              serviceKey === "avaliacaoImoveis" ? "Avaliação de Imóveis" : "Assessoria Jurídica"),
      descricao: data.descricao || "",
      imagem: data.imagem || "",
      link: data.link || "",
      preco: data.preco || "",
      prazo: data.prazo || "",
      beneficios: data.beneficios || "",
      ativo: data.ativo !== undefined ? data.ativo : true,
      destaque: data.destaque !== undefined ? data.destaque : false
    };
  };

  const services = [
    {
      key: "atendimentoPersonalizado",
      label: "Atendimento Personalizado",
      data: getServiceData("atendimentoPersonalizado")
    },
    {
      key: "avaliacaoImoveis", 
      label: "Avaliação de Imóveis",
      data: getServiceData("avaliacaoImoveis")
    },
    {
      key: "assessoriaJuridica",
      label: "Assessoria Jurídica", 
      data: getServiceData("assessoriaJuridica")
    }
  ];

  return (
    <div className="space-y-8">
      {/* Aviso de Segurança */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-900 mb-2">🛡️ Modo Seguro Ativo</h3>
        <p className="text-sm text-green-800">
          Este sistema preserva todos os dados existentes. Apenas os campos que você editar serão atualizados.
        </p>
      </div>

      {/* Seção geral de serviços */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Nossa missão e serviços</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={form?.titulo || "Nossa Missão e Serviços"}
              onChange={(e) => updateForm("titulo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nossa Missão e Serviços"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Principal
            </label>
            <textarea
              value={form?.descricao || ""}
              onChange={(e) => updateForm("descricao", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da missão da empresa..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do vídeo do YouTube
            </label>
            <input
              type="url"
              value={form?.videoYoutube || ""}
              onChange={(e) => updateForm("videoYoutube", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      {/* Serviços individuais */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Serviços Específicos</h2>
        
        {services.map(({ key, label, data }) => (
          <div key={key} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-blue-600">{label}</h3>
              <span className="text-xs text-gray-500">ID: {key}</span>
            </div>
            
            <div className="grid gap-4">
              {/* Título do Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Serviço
                </label>
                <input
                  type="text"
                  value={data.titulo}
                  onChange={(e) => updateNestedForm(key, "titulo", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={label}
                />
              </div>

              {/* Descrição do Serviço */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Serviço
                </label>
                <textarea
                  value={data.descricao}
                  onChange={(e) => updateNestedForm(key, "descricao", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Descreva como funciona o serviço de ${label.toLowerCase()}...`}
                />
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Serviço
                </label>
                
                {/* Preview da imagem atual */}
                {data.imagem && (
                  <div className="mb-3">
                    <img
                      src={data.imagem}
                      alt={label}
                      className="h-40 w-auto object-cover rounded-md border shadow-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Imagem atual: {data.imagem}
                    </p>
                  </div>
                )}

                {/* Input de upload */}
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleImageUpload(key, file);
                      }
                    }}
                    disabled={uploadingImages[key]}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  
                  {uploadingImages[key] && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                      Enviando...
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  A imagem será salva em: /uploads/servicos/{key}/
                </p>
              </div>

              {/* Campos adicionais em layout de grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link Adicional
                  </label>
                  <input
                    type="url"
                    value={data.link}
                    onChange={(e) => updateNestedForm(key, "link", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço/Valor
                  </label>
                  <input
                    type="text"
                    value={data.preco}
                    onChange={(e) => updateNestedForm(key, "preco", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: A partir de R$ 500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prazo de Entrega
                  </label>
                  <input
                    type="text"
                    value={data.prazo}
                    onChange={(e) => updateNestedForm(key, "prazo", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 5 a 7 dias úteis"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={data.ativo}
                        onChange={(e) => updateNestedForm(key, "ativo", e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Ativo</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={data.destaque}
                        onChange={(e) => updateNestedForm(key, "destaque", e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">Destaque</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Benefícios */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefícios Principais
                </label>
                <textarea
                  value={data.beneficios}
                  onChange={(e) => updateNestedForm(key, "beneficios", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Liste os principais benefícios deste serviço..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Informações finais */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">📋 Informações Importantes</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Apenas os campos que você editar serão atualizados no banco</li>
          <li>• Imagens são salvas em diretórios separados para cada serviço</li>
          <li>• Todos os dados existentes são preservados</li>
          <li>• Use o botão "Desfazer Alterações" para voltar ao estado original</li>
        </ul>
      </div>
    </div>
  );
}
