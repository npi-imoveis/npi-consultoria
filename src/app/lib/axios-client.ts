import axios from "axios";

// Determinar a URL base com base no ambiente
const getBaseUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Verifica se estamos em ambiente de servidor ou cliente
    const isServer = typeof window === 'undefined';

    // Se estiver no servidor, usa URL absoluta para API interna
    if (isServer) {
      return process.env.NEXT_PUBLIC_API_URL || "https://www.npiconsultoria.com.br/api/";
    }

    // No cliente em produção, usa URL completa
    return process.env.NEXT_PUBLIC_API_URL || "https://www.npiconsultoria.com.br/api/";
  }

  // Em desenvolvimento, usa localhost
  return "http://localhost:3000/api/";
};

const BASE_URL = getBaseUrl();

const axiosClient = axios.create({
  baseURL: BASE_URL,
  timeout: 25000, // 25 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para lidar com erros de forma global
axiosClient.interceptors.response.use(
  response => response,
  error => {
    // Log de erro para debug
    if (error.code === 'ERR_NETWORK') {
      console.error('Erro de conectividade de rede:', error.message);
    } else if (error.response) {
      // Tratar erros 404 como informação, não como erro
      if (error.response.status === 404) {
        console.info(`Recurso não encontrado [404]:`,
          error.response.data?.error || error.response.statusText);
      } else {
        console.error(`Erro de resposta HTTP [${error.response.status}]:`,
          error.response.data?.error || error.response.statusText);
      }
    } else if (error.request) {
      console.error('Erro de solicitação (sem resposta):', error.message);
    } else {
      console.error('Erro inesperado:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

// LOCAL = http://localhost:3000/api/
// PROD = https://npiconsultoria.com.br/api/
