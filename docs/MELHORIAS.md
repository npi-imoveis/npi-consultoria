# Relatório de Melhorias - NPi Consultoria

## 🔴 SEGURANÇA - PROBLEMAS CRÍTICOS

### 1. **Credenciais Expostas no Repositório**
**Arquivo:** `.env.local`  
**Impacto:** CRÍTICO  
**Problema:** Credenciais sensíveis commitadas no repositório, incluindo:
- String de conexão MongoDB com senha
- Chaves API Firebase expostas
- Token Vercel Edge Config exposto

**Solução:**
```bash
# 1. Mover .env.local para .env.local.example (template)
# 2. Adicionar .env.local ao .gitignore
# 3. Revogar todas as credenciais expostas
# 4. Criar novas credenciais no MongoDB Atlas e Firebase
# 5. Usar variáveis de ambiente em produção
```

### 2. **Falta de Autenticação nas APIs Administrativas**
**Arquivo:** `src/app/api/admin/*`  
**Impacto:** CRÍTICO  
**Problema:** APIs administrativas sem verificação de autenticação

**Solução:**
```javascript
// Criar middleware de autenticação
import admin from "@/app/lib/firebase-admin";

export async function withAuth(handler) {
  return async (request) => {
    try {
      const token = request.headers.get('Authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: "Token não fornecido" }, { status: 401 });
      }
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      if (!decodedToken) {
        return NextResponse.json({ error: "Token inválido" }, { status: 401 });
      }
      
      return handler(request, decodedToken);
    } catch (error) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  };
}

// Usar em todas as rotas admin
export const GET = withAuth(async (request, user) => {
  // Lógica protegida
});
```

### 3. **Upload de Arquivos Sem Validação**
**Arquivo:** `src/app/api/upload/route.js`  
**Impacto:** ALTO  
**Problema:** Falta validação de tipo, tamanho e sanitização

**Solução:**
```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request) {
  try {
    const body = await request.json();
    const { contentType, file } = body;

    // Validar tipo de arquivo
    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { message: 'Tipo de arquivo não permitido' },
        { status: 400 }
      );
    }

    // Validar tamanho
    const fileBuffer = Buffer.from(file, 'base64');
    if (fileBuffer.length > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'Arquivo muito grande' },
        { status: 400 }
      );
    }

    // Continuar com upload...
  } catch (error) {
    return NextResponse.json({ error: 'Erro no upload' }, { status: 500 });
  }
}
```

### 4. **Controle de Sessão Inseguro**
**Arquivo:** `src/app/admin/components/auth-check.js`  
**Impacto:** MÉDIO  
**Problema:** Tempo de expiração incorreto e armazenamento inseguro

**Solução:**
```javascript
// Corrigir cálculo de tempo (10 horas em ms)
const SESSION_DURATION = 10 * 60 * 60 * 1000; // 36,000,000 ms

// Implementar refresh token
const refreshToken = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken(true);
      localStorage.setItem('authToken', token);
      return token;
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    logout();
  }
};
```

## ⚡ PERFORMANCE - PROBLEMAS SIGNIFICATIVOS

### 1. **Carregamento de Vídeo Pesado**
**Arquivo:** `src/app/components/sections/hero-section.js`  
**Impacto:** ALTO  
**Problema:** Vídeo carregado sem otimização, impactando LCP

**Solução:**
```jsx
<video
  className="absolute top-0 left-0 w-full h-full object-cover"
  src="/assets/video/video.mp4"
  autoPlay
  loop
  muted
  playsInline
  preload="metadata" // Em vez de "auto"
  poster="/assets/images/video-poster.jpg"
  onError={(e) => {
    // Fallback para imagem estática
    e.target.style.display = 'none';
  }}
>
  <source src="/assets/video/video.webm" type="video/webm" />
  <source src="/assets/video/video.mp4" type="video/mp4" />
</video>
```

### 2. **Imagens Sem Otimização Adequada**
**Arquivo:** `src/app/components/sections/image-gallery.js`  
**Impacto:** ALTO  
**Problema:** Falta blur placeholder e loading estratégico

**Solução:**
```jsx
import { useState } from 'react';

const ImageWithPlaceholder = ({ src, alt, priority = false }) => {
  const [loading, setLoading] = useState(true);
  
  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        width={800}
        height={600}
        sizes="(max-width: 768px) 100vw, 50vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        priority={priority}
        onLoadingComplete={() => setLoading(false)}
        className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
      {loading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
};
```

### 3. **Consultas MongoDB Não Otimizadas**
**Arquivo:** `src/app/api/imoveis/route.js`  
**Impacto:** ALTO  
**Problema:** Agregação complexa sem índices adequados

**Solução:**
```javascript
// 1. Adicionar índices no MongoDB
/*
db.imoveis.createIndex({ "Codigo": 1 })
db.imoveis.createIndex({ "BairroComercial": 1, "Cidade": 1 })
db.imoveis.createIndex({ "ValorAntigo": 1 })
db.imoveis.createIndex({ "DataHoraAtualizacao": -1 })
*/

// 2. Otimizar agregação
const pipeline = [
  { $match: filtro },
  { $sort: { "DataHoraAtualizacao": -1 } },
  {
    $group: {
      _id: "$Codigo",
      doc: { $first: "$$ROOT" },
    },
  },
  { $replaceRoot: { newRoot: "$doc" } },
  {
    $facet: {
      total: [{ $count: "count" }],
      dados: [
        { $skip: skip },
        { $limit: limit },
        {
          $project: {
            // Selecionar apenas campos necessários
            Codigo: 1,
            TituloSite: 1,
            ValorVenda: 1,
            Foto: 1,
            BairroComercial: 1,
            Cidade: 1,
            Dormitorios: 1,
            Banheiros: 1,
            Vagas: 1,
            AreaTotal: 1,
          }
        }
      ],
    },
  },
];
```

### 4. **Carregamento Eager de Componentes Pesados**
**Arquivo:** `src/app/busca/components/map-component.js`  
**Impacto:** MÉDIO  
**Problema:** Mapa carregado desnecessariamente

**Solução:**
```jsx
import dynamic from 'next/dynamic';

// Lazy load do mapa
const MapComponent = dynamic(() => import('./map-component'), {
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-gray-100">
      <div className="text-gray-500">Carregando mapa...</div>
    </div>
  ),
  ssr: false
});

// Usar com intersection observer
const LazyMap = () => {
  const [showMap, setShowMap] = useState(false);
  const mapRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowMap(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (mapRef.current) {
      observer.observe(mapRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mapRef} className="h-96">
      {showMap ? <MapComponent /> : <div className="h-96 bg-gray-100" />}
    </div>
  );
};
```

### 5. **Bundle Size Não Otimizado**
**Arquivo:** `next.config.mjs`  
**Impacto:** MÉDIO  
**Problema:** Configuração não otimizada para produção

**Solução:**
```javascript
const nextConfig = {
  // Remover ignore em produção
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === 'development',
  },
  
  // Otimizações experimentais
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@heroicons/react',
      'framer-motion'
    ],
  },
  
  // Configurar webpack
  webpack: (config, { isServer }) => {
    // Tree shaking
    config.optimization.usedExports = true;
    
    // Analisar bundle em desenvolvimento
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }
    
    return config;
  },
};
```

## 🧹 CÓDIGO E LÓGICA

### 1. **Tratamento de Erro Inconsistente**
**Arquivo:** Multiple files  
**Impacto:** MÉDIO  
**Problema:** Erros não tratados consistentemente

**Solução:**
```javascript
// Criar serviço centralizado
class ErrorService {
  static handle(error, context) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'server'
    };
    
    console.error('Error:', errorInfo);
    
    // Em produção, enviar para monitoramento
    if (process.env.NODE_ENV === 'production') {
      // Implementar integração com Sentry, LogRocket, etc.
    }
    
    return this.getUserFriendlyMessage(error);
  }
  
  static getUserFriendlyMessage(error) {
    const messages = {
      'NETWORK_ERROR': 'Erro de conexão. Verifique sua internet.',
      'VALIDATION_ERROR': 'Dados inválidos. Verifique os campos.',
      'NOT_FOUND': 'Conteúdo não encontrado.',
      'SERVER_ERROR': 'Erro interno. Tente novamente em alguns minutos.',
    };
    
    return messages[error.code] || 'Algo deu errado. Tente novamente.';
  }
}

// Hook personalizado para erros
const useErrorHandler = () => {
  const [error, setError] = useState(null);
  
  const handleError = (error, context) => {
    const friendlyMessage = ErrorService.handle(error, context);
    setError(friendlyMessage);
    
    // Limpar erro após 5 segundos
    setTimeout(() => setError(null), 5000);
  };
  
  return { error, handleError };
};
```

### 2. **Validação de Formulário Fraca**
**Arquivo:** `src/app/venda-seu-imovel/page.js`  
**Impacto:** MÉDIO  
**Problema:** Validação apenas visual, sem esquema robusto

**Solução:**
```javascript
// Instalar: npm install zod
import { z } from 'zod';

const ImovelFormSchema = z.object({
  nome: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  email: z.string().email("Email inválido"),
  telefone: z.string().regex(
    /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    "Telefone deve estar no formato (11) 99999-9999"
  ),
  valorImovel: z.number()
    .min(1, "Valor deve ser maior que zero")
    .max(100000000, "Valor muito alto"),
  endereco: z.string().min(10, "Endereço deve ser mais detalhado"),
  observacoes: z.string().max(500, "Observações muito longas").optional(),
});

const useFormValidation = () => {
  const [errors, setErrors] = useState({});
  
  const validateField = (name, value) => {
    try {
      const fieldSchema = ImovelFormSchema.shape[name];
      fieldSchema.parse(value);
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      
      return true;
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error.errors[0].message
      }));
      return false;
    }
  };
  
  const validateForm = (data) => {
    try {
      ImovelFormSchema.parse(data);
      setErrors({});
      return { success: true };
    } catch (error) {
      const fieldErrors = error.flatten().fieldErrors;
      setErrors(fieldErrors);
      return { success: false, errors: fieldErrors };
    }
  };
  
  return { errors, validateField, validateForm };
};
```

### 3. **State Management Sem Tipagem**
**Arquivo:** `src/app/store/*`  
**Impacto:** BAIXO  
**Problema:** Stores sem TypeScript e estrutura inconsistente

**Solução:**
```typescript
// Migrar para TypeScript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ImovelState {
  imoveis: Imovel[];
  imovelAtual: Imovel | null;
  loading: boolean;
  error: string | null;
  filtros: SearchFilters;
}

interface ImovelActions {
  setImoveis: (imoveis: Imovel[]) => void;
  setImovelAtual: (imovel: Imovel | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateFiltros: (filtros: Partial<SearchFilters>) => void;
  resetFiltros: () => void;
}

type ImovelStore = ImovelState & ImovelActions;

const useImovelStore = create<ImovelStore>()(
  persist(
    (set, get) => ({
      // State
      imoveis: [],
      imovelAtual: null,
      loading: false,
      error: null,
      filtros: {
        categoria: '',
        cidade: '',
        bairro: '',
        precoMin: 0,
        precoMax: 0,
      },
      
      // Actions
      setImoveis: (imoveis) => set({ imoveis }),
      setImovelAtual: (imovel) => set({ imovelAtual: imovel }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      updateFiltros: (filtros) => set(state => ({
        filtros: { ...state.filtros, ...filtros }
      })),
      resetFiltros: () => set({
        filtros: {
          categoria: '',
          cidade: '',
          bairro: '',
          precoMin: 0,
          precoMax: 0,
        }
      }),
    }),
    {
      name: 'imovel-storage',
      partialize: (state) => ({
        filtros: state.filtros,
      }),
    }
  )
);
```

### 4. **Componentes Não Reutilizáveis**
**Arquivo:** Multiple files  
**Impacto:** BAIXO  
**Problema:** Código duplicado em formulários e cards

**Solução:**
```tsx
// Criar componentes base
interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  helpText,
  children,
}) => {
  return (
    <div className="form-field">
      <label className={`form-label ${required ? 'required' : ''}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {helpText && (
        <p className="text-sm text-gray-500 mt-1">{helpText}</p>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}
    </div>
  );
};

// Card de imóvel reutilizável
interface ImovelCardProps {
  imovel: Imovel;
  onClick?: () => void;
  showFavorite?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export const ImovelCard: React.FC<ImovelCardProps> = ({
  imovel,
  onClick,
  showFavorite = false,
  variant = 'default',
}) => {
  const cardClasses = {
    default: 'bg-white rounded-lg shadow-md overflow-hidden',
    compact: 'bg-white rounded-md shadow-sm overflow-hidden',
    featured: 'bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-200',
  };
  
  return (
    <div className={cardClasses[variant]} onClick={onClick}>
      {/* Conteúdo do card */}
    </div>
  );
};
```

## 🏗️ ARQUITETURA

### 1. **Separação de Responsabilidades**
**Arquivo:** Multiple files  
**Impacto:** MÉDIO  
**Problema:** Lógica de negócio misturada com UI

**Solução:**
```typescript
// Criar camada de serviços
class ImovelService {
  private baseURL = '/api/imoveis';
  
  async getAll(params?: SearchParams): Promise<PaginatedResponse<Imovel>> {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${this.baseURL}?${query}`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar imóveis');
    }
    
    return response.json();
  }
  
  async getById(id: string): Promise<Imovel> {
    const response = await fetch(`${this.baseURL}/${id}`);
    
    if (!response.ok) {
      throw new Error('Imóvel não encontrado');
    }
    
    return response.json();
  }
  
  async create(data: CreateImovelDto): Promise<Imovel> {
    const response = await fetch(this.baseURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Erro ao criar imóvel');
    }
    
    return response.json();
  }
}

// Hook para usar o serviço
const useImovelService = () => {
  const service = useMemo(() => new ImovelService(), []);
  
  return {
    async getImoveis(params?: SearchParams) {
      try {
        return await service.getAll(params);
      } catch (error) {
        throw new Error('Erro ao carregar imóveis');
      }
    },
    
    async getImovel(id: string) {
      try {
        return await service.getById(id);
      } catch (error) {
        throw new Error('Erro ao carregar imóvel');
      }
    },
  };
};
```

### 2. **Middleware de Validação Ausente**
**Arquivo:** API routes  
**Impacto:** MÉDIO  
**Problema:** Validação inconsistente nas APIs

**Solução:**
```typescript
// Criar middleware de validação
import { z } from 'zod';

export function validateRequest<T>(schema: z.ZodSchema<T>) {
  return async (request: Request) => {
    try {
      const body = await request.json();
      const validatedData = schema.parse(body);
      return { success: true, data: validatedData };
    } catch (error) {
      return {
        success: false,
        error: error instanceof z.ZodError ? error.flatten() : 'Validation failed',
      };
    }
  };
}

// Middleware de autenticação
export async function requireAuth(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return { success: false, error: 'Token não fornecido' };
  }
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return { success: true, user: decodedToken };
  } catch (error) {
    return { success: false, error: 'Token inválido' };
  }
}

// Usar nas rotas
export async function POST(request: Request) {
  // Validar dados
  const validation = await validateRequest(ImovelSchema)(request);
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error },
      { status: 400 }
    );
  }
  
  // Verificar autenticação (se necessário)
  const auth = await requireAuth(request);
  if (!auth.success) {
    return NextResponse.json(
      { error: auth.error },
      { status: 401 }
    );
  }
  
  // Processar requisição
  const { data } = validation;
  // ... lógica da API
}
```

### 3. **Modelo de Dados Muito Flexível**
**Arquivo:** `src/app/models/Imovel.ts`  
**Impacto:** BAIXO  
**Problema:** Schema muito permissivo pode causar inconsistências

**Solução:**
```typescript
// Criar schemas mais rígidos
const ImovelSchema = new Schema({
  // Campos obrigatórios
  Codigo: {
    type: String,
    required: [true, 'Código é obrigatório'],
    unique: true,
    index: true,
    trim: true,
  },
  
  Categoria: {
    type: String,
    required: [true, 'Categoria é obrigatória'],
    enum: {
      values: ['Apartamento', 'Casa', 'Cobertura', 'Terreno', 'Sala'],
      message: 'Categoria deve ser uma das opções válidas'
    },
  },
  
  Cidade: {
    type: String,
    required: [true, 'Cidade é obrigatória'],
    trim: true,
    index: true,
  },
  
  // Validações customizadas
  ValorVenda: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^\d+(\.\d{1,2})?$/.test(v);
      },
      message: 'Valor deve ser um número válido'
    }
  },
  
  // Campos com transformação
  TituloSite: {
    type: String,
    trim: true,
    maxlength: [200, 'Título não pode ter mais de 200 caracteres'],
  },
  
}, {
  timestamps: true,
  collection: "imoveis",
  strict: true, // Não permitir campos não definidos
});

// Middleware para validações
ImovelSchema.pre('save', function(next) {
  // Validar se pelo menos um valor está definido
  if (!this.ValorVenda && !this.ValorAluguel) {
    next(new Error('Pelo menos um valor (venda ou aluguel) deve ser definido'));
  }
  
  // Gerar slug automático se não existir
  if (!this.Slug && this.TituloSite) {
    this.Slug = this.TituloSite
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  next();
});

// Índices compostos para performance
ImovelSchema.index({ Cidade: 1, BairroComercial: 1 });
ImovelSchema.index({ Categoria: 1, ValorVenda: 1 });
ImovelSchema.index({ DataHoraAtualizacao: -1 });
```

## 📋 PLANO DE IMPLEMENTAÇÃO

### 🔴 **FASE 1 - CRÍTICO (Semana 1)**
1. **Segurança**
   - [ ] Revogar credenciais expostas
   - [ ] Implementar autenticação nas APIs admin
   - [ ] Validar uploads de arquivos
   - [ ] Corrigir controle de sessão

2. **Performance Crítica**
   - [ ] Otimizar carregamento de vídeo
   - [ ] Implementar lazy loading de imagens
   - [ ] Adicionar índices no MongoDB

### 🟡 **FASE 2 - ALTO (Semanas 2-3)**
1. **Estrutura**
   - [ ] Implementar tratamento de erro centralizado
   - [ ] Criar middleware de validação
   - [ ] Separar lógica de negócio em serviços

2. **Performance**
   - [ ] Otimizar consultas do banco
   - [ ] Implementar lazy loading de componentes
   - [ ] Configurar bundle analyzer

### 🟢 **FASE 3 - MÉDIO (Semanas 4-6)**
1. **Qualidade de Código**
   - [ ] Migrar para TypeScript completo
   - [ ] Criar componentes reutilizáveis
   - [ ] Implementar validação robusta

2. **Arquitetura**
   - [ ] Refatorar stores com tipagem
   - [ ] Criar hooks personalizados
   - [ ] Implementar testes unitários

## 🔧 FERRAMENTAS RECOMENDADAS

### **Desenvolvimento**
- **ESLint + Prettier**: Padronização de código
- **Husky**: Git hooks para qualidade
- **TypeScript**: Tipagem estática
- **Zod**: Validação de esquemas

### **Monitoramento**
- **Sentry**: Rastreamento de erros
- **Vercel Analytics**: Métricas de performance
- **Lighthouse CI**: Auditoria automatizada

### **Teste**
- **Jest**: Testes unitários
- **Cypress**: Testes E2E
- **React Testing Library**: Testes de componentes

### **Segurança**
- **npm audit**: Vulnerabilidades de dependências
- **OWASP ZAP**: Teste de segurança
- **SonarQube**: Análise de código

## 📊 MÉTRICAS DE SUCESSO

### **Segurança**
- ✅ Zero credenciais expostas
- ✅ 100% APIs protegidas
- ✅ Validação em todas as entradas

### **Performance**
- 🎯 LCP < 2.5s
- 🎯 CLS < 0.1
- 🎯 Bundle size < 500KB

### **Qualidade**
- 🎯 Cobertura de testes > 80%
- 🎯 Zero erros TypeScript
- 🎯 Score ESLint > 90%

---

**Última atualização:** $(date)  
**Versão:** 1.0