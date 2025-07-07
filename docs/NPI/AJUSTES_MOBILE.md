# Ajustes Mobile - NPi Consultoria

## 3. Problemas Mobile

### 3.1 Zoom Indevido em Input de Busca - iOS
**Prioridade**: Alta
**Status**: Pendente

**Problema**: Input de busca na HOME causa zoom automático no iOS
**Impacto**: Experiência ruim para usuários iOS, quebra layout

**Causa**: iOS faz zoom automático em inputs com font-size menor que 16px
**Solução**: Ajustar font-size ou usar viewport meta tag

**Arquivos relacionados**:
- `src/app/components/ui/search-hero.js`
- `src/app/components/ui/search.js`
- `src/app/components/ui/input.js`
- `src/app/globals.css`

**Soluções possíveis**:

#### Opção 1: Ajustar Font-size (Recomendado)
```css
/* Para inputs em dispositivos iOS */
input[type="search"],
input[type="text"] {
  font-size: 16px; /* Mínimo para evitar zoom no iOS */
}

/* Responsive para manter design */
@media (min-width: 768px) {
  input[type="search"],
  input[type="text"] {
    font-size: 14px; /* Tamanho original para desktop */
  }
}
```

#### Opção 2: Usar Transform Scale (Alternativa)
```css
/* Manter 16px mas visualmente menor */
input[type="search"] {
  font-size: 16px;
  transform: scale(0.875); /* Equivale a 14px visualmente */
  transform-origin: left center;
}
```

#### Opção 3: Viewport Meta Tag (Última opção)
```html
<!-- Adicionar ao layout.js -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

**Implementação recomendada**:
1. Usar Opção 1 (font-size responsivo)
2. Testar em dispositivos iOS reais
3. Verificar se não quebra design desktop

**Arquivos para modificar**:
- `src/app/globals.css` (adicionar CSS)
- `src/app/components/ui/search-hero.js` (verificar classes)
- `src/app/layout.js` (se necessário meta tag)

---

## Checklist de Prioridades

### 🔴 Alta Prioridade
- [ ] Corrigir zoom automático em input de busca iOS

---

## Estimativa de Tempo

| Tarefa | Tempo Estimado |
|--------|----------------|
| Zoom input iOS | 1-2 horas |

**Total estimado**: 1-2 horas

---

## Observações Técnicas

1. **Teste em Dispositivos Reais**: Fundamental testar em iPhone/iPad
2. **Compatibilidade**: Verificar se solução não afeta outros browsers
3. **Design**: Manter consistência visual entre desktop e mobile
4. **Performance**: Preferir CSS puro sobre JavaScript

---

## Detalhes da Implementação

### Identificação do Problema
- Ocorre apenas em dispositivos iOS (iPhone/iPad)
- Browsers iOS fazem zoom quando font-size < 16px
- Afeta experiência do usuário na busca

### Solução Detalhada
```css
/* Adicionar ao globals.css */

/* Base: 16px para evitar zoom iOS */
.search-input {
  font-size: 16px;
  -webkit-appearance: none;
  border-radius: 0; /* Remove bordas arredondadas padrão iOS */
}

/* Desktop: volta ao tamanho original */
@media (min-width: 768px) {
  .search-input {
    font-size: 14px;
  }
}

/* Opcional: melhorar aparência no iOS */
.search-input:focus {
  outline: none;
  border-color: #your-brand-color;
}
```

### Teste Necessário
- iPhone Safari
- iPhone Chrome
- iPad Safari
- iPad Chrome

---

## Próximos Passos

1. Implementar solução CSS responsiva
2. Testar em simulador iOS
3. Testar em dispositivos reais
4. Verificar compatibilidade com outros browsers
5. Documentar solução para futuros inputs

---

## Recursos Úteis

- [iOS Safari - Preventing Zoom](https://css-tricks.com/16px-or-larger-text-prevents-ios-form-zoom/)
- [Mobile Input Best Practices](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#mobile_considerations)
- [Viewport Meta Tag](https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag)