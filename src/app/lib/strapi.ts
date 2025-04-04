import axios, { AxiosInstance } from 'axios';

class HttpClient {
  private static instance: AxiosInstance;

  private constructor() {} // Impede instância externa

  public static getInstance(): AxiosInstance {
    if (!HttpClient.instance) {
      HttpClient.instance = axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337/api',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // Timeout de 10s
      });

      // Interceptador de requisição
      HttpClient.instance.interceptors.request.use(
        (config) => {
          // Adiciona um token, se necessário
          const token = localStorage.getItem('token');
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        (error) => Promise.reject(error)
      );

      // Interceptador de resposta
      HttpClient.instance.interceptors.response.use(
        (response) => response,
        (error) => {
          console.error('Erro na requisição:', error);
          return Promise.reject(error);
        }
      );
    }
    return HttpClient.instance;
  }
}

export default HttpClient;
