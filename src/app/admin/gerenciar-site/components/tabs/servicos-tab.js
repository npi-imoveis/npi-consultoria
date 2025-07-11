"use client";
import { useState, useEffect } from "react";

export default function ServicosTab({ form, updateForm, updateNestedForm }) {
  const [isLoading, setIsLoading] = useState(true);
  const [servicosData, setServicosData] = useState(null);
  const [uploadingImages, setUploadingImages] = useState({});

  // Carregar dados diretamente da API para garantir que temos os dados
  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch("/api/admin/content");
        const response = await res.json();
        if (response.status === 200 && response.data) {
          setServicosData(response.data);
          console.log("✅ DADOS CARREGADOS:", response.data);
          console.log("✅ SOBRE NPI:", response.data.sobre_npi);
          console.log("✅ MISSÃO:", response.data.sobre_npi?.missao);
        }
      } catch (error) {
        console.error("❌ Erro ao carregar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Dados da missão (onde estão seus textos)
  const missaoData = servicosData?.sobre_npi?.missao || {};
  const itens = missaoData.itens || [];

  // Função para salvar alterações diretamente
  const saveChanges = async (updatedData) => {
    try {
      const res = await fetch("/api/admin/content", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        console.log("✅ Dados salvos com sucesso");
        // Recarregar dados
        const newRes = await fetch("/api/admin/content");
        const newResponse = await newRes.json();
        if (newResponse.status === 200) {
          setServicosData(newResponse.data);
        }
      }
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      alert("Erro ao salvar alterações");
    }
  };

  // Função para atualizar campo principal
  const updateMainField = (field, value) => {
    const updateData = {
      [`sobre_npi.missao.${field}`]: value
    };
    saveChanges(updateData);
  };

  // Função para atualizar item específico
  const updateItem = (index, field, value) => {
    const newItens = [...itens];
    if (newItens[index]) {
      newItens[index][field] = value;
      const updateData = {
        "sobre_npi.missao.itens": newItens
      };
      saveChanges(updateData);
    }
  };

  // Função para upload de imagem
  const handleImageUpload = async (index, file) => {
    if (!file) return;

    try {
      setUploadingImages(prev => ({ ...prev, [index]: true }));

      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", "servicos");
      formData.append("customFilename", `servico-${index + 1}-${Date.now()}`);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Falha no upload");
      }

      const data = await res.json();
      
      // Atualizar imagem no item
      updateItem(index, "imagem", data.path);
      
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro ao fazer upload da imagem");
    } finally {
      setUploadingImages(prev => ({ ...prev, [index]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!servicosData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-bold">❌ Erro ao carregar dados</h3>
        <p className="text-red-700">Não foi possível carregar os dados da API.</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Recarregar Página
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status dos dados */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-bold text-green-900 mb-2">✅ DADOS ENCONTRADOS!</h3>
        <div className="text-sm text-green-800">
          <p><strong>Título:</strong> {missaoData.title || 'Não encontrado'}</p>
          <p><strong>Descrição:</strong> {missaoData.description?.substring(0, 100)}...</p>
          <p><strong>YouTube:</strong> {missaoData.youtube || 'Não definido'}</p>
          <p><strong>Serviços encontrados:</strong> {itens.length}</p>
        </div>
      </div>

      {/* Seção principal */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Nossa missão e serviços</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={missaoData.title || ""}
              onChange={(e) => updateMainField("title", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nossa Missão e Serviços"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Principal
            </label>
            <textarea
              value={missaoData.description || ""}
              onChange={(e) => updateMainField("description", e.target.value)}
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
              value={missaoData.youtube || ""}
              onChange={(e) => updateMainField("youtube", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
        </div>
      </div>

      {/* Serviços individuais */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Serviços Específicos</h2>
        
        {itens.map((item, index) => (
          <div key={item._id || index} className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-medium text-blue-600 mb-4">
              Serviço {index + 1}: {item.title}
            </h3>
            
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Serviço
                </label>
                <input
                  type="text"
                  value={item.title || ""}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição do Serviço
                </label>
                <textarea
                  value={item.description || ""}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem do Serviço
                </label>
                
                {item.imagem && (
                  <div className="mb-3">
                    <img
                      src={item.imagem}
                      alt={item.title}
                      className="h-40 w-auto object-cover rounded-md border"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleImageUpload(index, file);
                    }
                  }}
                  disabled={uploadingImages[index]}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {uploadingImages[index] && (
                  <p className="text-sm text-blue-600 mt-2">
                    🔄 Fazendo upload...
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Debug completo */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <h3 className="font-bold mb-2">🔍 Debug Completo</h3>
        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
          {JSON.stringify(servicosData?.sobre_npi?.missao, null, 2)}
        </pre>
      </div>
    </div>
  );
}
