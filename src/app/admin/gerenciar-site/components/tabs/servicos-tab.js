"use client";
import { useState, useEffect } from "react";

export default function ServicosTab({ form, updateForm, updateNestedForm }) {
  const [debugData, setDebugData] = useState(null);
  const [rawApiData, setRawApiData] = useState(null);

  // EMERGÊNCIA: Carregar dados diretamente da API para debug
  useEffect(() => {
    const loadApiData = async () => {
      try {
        const res = await fetch("/api/admin/content");
        const data = await res.json();
        setRawApiData(data);
        console.log("🔍 DADOS RAW DA API:", data);
        console.log("🔍 DADOS FORM RECEBIDOS:", form);
      } catch (error) {
        console.error("🚨 ERRO AO CARREGAR API:", error);
      }
    };
    loadApiData();
  }, []);

  // FUNÇÃO DE EMERGÊNCIA: Tentar recuperar dados de qualquer estrutura
  const getFieldValue = (fieldPath, fallback = "") => {
    try {
      // Tentar múltiplas estruturas possíveis
      const paths = [
        `form.${fieldPath}`,
        `form.data.${fieldPath}`,
        `rawApiData.data.${fieldPath}`,
        `rawApiData.${fieldPath}`
      ];

      for (const path of paths) {
        const value = path.split('.').reduce((obj, key) => obj?.[key], window);
        if (value !== undefined && value !== null && value !== "") {
          console.log(`✅ ENCONTRADO em ${path}:`, value);
          return value;
        }
      }

      // Tentar na estrutura raw
      if (rawApiData?.data) {
        const segments = fieldPath.split('.');
        let current = rawApiData.data;
        for (const segment of segments) {
          current = current?.[segment];
        }
        if (current !== undefined && current !== null && current !== "") {
          console.log(`✅ ENCONTRADO na API:`, current);
          return current;
        }
      }

      console.log(`⚠️ NÃO ENCONTRADO: ${fieldPath}, usando fallback:`, fallback);
      return fallback;
    } catch (error) {
      console.error(`🚨 ERRO ao buscar ${fieldPath}:`, error);
      return fallback;
    }
  };

  return (
    <div className="space-y-8">
      {/* PAINEL DE EMERGÊNCIA - DEBUG */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
        <h3 className="font-bold text-red-900 mb-3">🚨 MODO EMERGÊNCIA - DIAGNÓSTICO</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-bold text-red-800">Form recebido:</h4>
            <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(form, null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-bold text-red-800">API Response:</h4>
            <pre className="bg-red-100 p-2 rounded text-xs overflow-auto max-h-32">
              {JSON.stringify(rawApiData, null, 2)}
            </pre>
          </div>
        </div>

        <div className="mt-3">
          <h4 className="font-bold text-red-800">Testes de Recuperação:</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>Título: {getFieldValue('titulo') || '❌ VAZIO'}</div>
            <div>Descrição: {getFieldValue('descricao') || '❌ VAZIO'}</div>
            <div>Video: {getFieldValue('videoYoutube') || '❌ VAZIO'}</div>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL COM RECUPERAÇÃO */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Nossa missão e serviços</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título Principal
            </label>
            <input
              type="text"
              value={getFieldValue('titulo', 'Nossa Missão e Serviços')}
              onChange={(e) => updateForm("titulo", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nossa Missão e Serviços"
            />
            <p className="text-xs text-gray-500">
              Origem: {getFieldValue('titulo') ? '✅ Recuperado' : '❌ Usando padrão'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição Principal
            </label>
            <textarea
              value={getFieldValue('descricao', '')}
              onChange={(e) => updateForm("descricao", e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da missão da empresa..."
            />
            <p className="text-xs text-gray-500">
              Origem: {getFieldValue('descricao') ? '✅ Recuperado' : '❌ Vazio'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do vídeo do YouTube
            </label>
            <input
              type="url"
              value={getFieldValue('videoYoutube', '')}
              onChange={(e) => updateForm("videoYoutube", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://youtube.com/watch?v=..."
            />
            <p className="text-xs text-gray-500">
              Origem: {getFieldValue('videoYoutube') ? '✅ Recuperado' : '❌ Vazio'}
            </p>
          </div>
        </div>
      </div>

      {/* SERVIÇOS COM RECUPERAÇÃO */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Serviços Específicos</h2>
        
        {['atendimentoPersonalizado', 'avaliacaoImoveis', 'assessoriaJuridica'].map((serviceKey) => {
          const labels = {
            atendimentoPersonalizado: 'Atendimento Personalizado',
            avaliacaoImoveis: 'Avaliação de Imóveis',
            assessoriaJuridica: 'Assessoria Jurídica'
          };

          return (
            <div key={serviceKey} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-medium text-blue-600 mb-4">
                {labels[serviceKey]}
              </h3>
              
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Serviço
                  </label>
                  <input
                    type="text"
                    value={getFieldValue(`${serviceKey}.titulo`, labels[serviceKey])}
                    onChange={(e) => updateNestedForm(serviceKey, "titulo", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Origem: {getFieldValue(`${serviceKey}.titulo`) ? '✅ Recuperado' : '❌ Usando padrão'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição do Serviço
                  </label>
                  <textarea
                    value={getFieldValue(`${serviceKey}.descricao`, '')}
                    onChange={(e) => updateNestedForm(serviceKey, "descricao", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500">
                    Origem: {getFieldValue(`${serviceKey}.descricao`) ? '✅ Recuperado' : '❌ Vazio'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imagem do Serviço
                  </label>
                  <input
                    type="text"
                    value={getFieldValue(`${serviceKey}.imagem`, '')}
                    onChange={(e) => updateNestedForm(serviceKey, "imagem", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="URL da imagem"
                  />
                  <p className="text-xs text-gray-500">
                    Origem: {getFieldValue(`${serviceKey}.imagem`) ? '✅ Recuperado' : '❌ Vazio'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BOTÃO DE RECUPERAÇÃO MANUAL */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-900 mb-2">🔧 Ações de Recuperação</h3>
        <div className="flex gap-3">
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Recarregar Página
          </button>
          <button
            onClick={() => {
              console.log("🔍 ESTADO ATUAL:", { form, rawApiData });
              alert("Verifique o console para dados de debug");
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Debug Console
          </button>
        </div>
      </div>
    </div>
  );
}
