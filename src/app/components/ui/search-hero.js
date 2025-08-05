"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SearchHero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  // ✅ MANTIDO: Chrome iOS - aplica fontSize para texto digitado (não placeholder)
  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      
      // ✅ MANTIDO: DETECÇÃO específica Chrome iOS
      const isChromeIOS = /CriOS/.test(navigator.userAgent);
      
      if (isChromeIOS) {
        // ✅ MANTIDO: Chrome iOS - aplicar fontSize para texto digitado (prevenir zoom)
        input.style.fontSize = "16px"; // ✅ AJUSTADO: 16px para acessibilidade
      }
      
      // ✅ MANTIDO: Propriedades essenciais para todos iOS (Safari + Chrome)
      input.style.webkitAppearance = "none";
      input.style.webkitTextSizeAdjust = "100%"; // ✅ AJUSTADO: 100% em vez de 'none' para acessibilidade
      // ✅ REMOVIDO: webkitUserScalable e userScalable para acessibilidade (PageSpeed)
      
      // ✅ MANTIDO: Transform leve
      input.style.webkitTransform = "translate3d(0,0,0)";
      input.style.transform = "translate3d(0,0,0)";
      
      // ✅ MANTIDO: Gesturestart para Chrome iOS
      const preventGesture = (e) => {
        e.preventDefault();
        if (isChromeIOS) {
          input.style.fontSize = "16px"; // ✅ AJUSTADO: 16px para acessibilidade
        }
      };
      
      input.addEventListener('gesturestart', preventGesture, { passive: false });
      
      return () => {
        input.removeEventListener('gesturestart', preventGesture);
      };
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim() === "") return;
    
    // ✅ MANTIDO: Blur o input para esconder o teclado
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // ✅ MANTIDO: Redireciona para a página de busca com o parâmetro de busca
    router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
  };

  // ✅ MANTIDO: Handler simples para mudança de input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    // ✅ Mínimo necessário - sem interferir na digitação
  };

  // ✅ MANTIDO: Handler para focus - texto digitado adequado
  const handleFocus = (e) => {
    const input = e.target;
    const isChromeIOS = /CriOS/.test(navigator.userAgent);
    
    // ✅ MANTIDO: Aplica fontSize para texto digitado apenas se for Chrome iOS
    if (isChromeIOS) {
      input.style.fontSize = "16px"; // ✅ AJUSTADO: 16px para acessibilidade
      // ✅ REMOVIDO: webkitUserScalable e userScalable para acessibilidade
    }
  };

  return (
    <div className="relative w-[385px] mx-1 sm:w-[375px] sm:mx-2 md:w-[600px] xl:w-[950px] bg-gray-100/10 rounded-2xl sm:rounded-full p-1.5 mb-20 lg:mb-0 transform translate-z-0">
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:block gap-2 sm:gap-0"
        noValidate
      >
        {/* ✅ MANTIDO: Campo de busca - CORREÇÃO ULTRA-ESPECÍFICA iOS + Chrome */}
        <input
          ref={inputRef}
          type="text" // ✅ MANTIDO: text em vez de search (Chrome mobile)
          inputMode="search" // ✅ MANTIDO: inputMode para teclado correto
          role="searchbox" // ✅ MANTIDO: ARIA role
          aria-label="Buscar imóveis por código, endereço, cidade ou condomínio" // ✅ MELHORADO: aria-label mais descritivo
          className="
            search-hero-input font-semibold w-full px-5 py-2 md:py-3 
            text-white bg-transparent rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-white/30 
            placeholder-gray-300 transition-all duration-200
          "
          placeholder="Digite código, endereço, cidade ou condomínio..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          style={{
            // ✅ MANTIDO: Propriedades mínimas necessárias + AJUSTADO para acessibilidade
            fontSize: "16px", // ✅ AJUSTADO: 16px para acessibilidade (era 15.5px)
            minHeight: "44px", // ✅ AJUSTADO: 44px para iOS touch targets (era 40px)
            
            // ✅ MANTIDO: WebKit essencial
            WebkitAppearance: "none",
            WebkitTextSizeAdjust: "100%", // ✅ AJUSTADO: 100% para acessibilidade (era 'none')
            // ✅ REMOVIDO: WebkitUserScalable e userScalable para acessibilidade
            
            // ✅ MANTIDO: Touch básico
            touchAction: "manipulation",
            
            // ✅ MANTIDO: Transform leve
            WebkitTransform: "translate3d(0,0,0)",
            transform: "translate3d(0,0,0)",
            
            // ✅ MANTIDO: Layout básico
            boxSizing: "border-box",
            outline: "none",
            border: "none",
          }}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          // ✅ MANTIDO: Atributos específicos para prevenir zoom
          data-no-zoom="true"
          tabIndex={0}
        />
        
        {/* ✅ MANTIDO: Botão de busca */}
        <button
          type="submit"
          className="
            w-full sm:w-auto sm:absolute 
            text-sm md:text-base
            right-1 sm:top-1 sm:bottom-1 
            px-4 md:px-6 py-2 sm:py-0 
            bg-black/70 hover:bg-black/80 
            text-white font-bold rounded-full 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 
            focus:ring-opacity-50 
            flex items-center justify-center 
            transition-all duration-200
          "
          style={{
            // ✅ MANTIDO: Touch properties
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            WebkitTouchCallout: "none",
            minHeight: "44px", // ✅ MANTIDO: iOS minimum touch target
            fontSize: "14px", // ✅ MANTIDO: Tamanho seguro para botões
          }}
          aria-label="Buscar imóveis"
          tabIndex={0}
        >
          <span>Buscar imóveis</span>
        </button>
      </form>
      
      {/* ✅ MANTIDO: Script backup - Chrome iOS - OTIMIZADO mas funcional */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // ✅ MANTIDO: Detection específica para Chrome iOS
              var isChromeIOS = /CriOS/.test(navigator.userAgent);
              
              // ✅ MANTIDO: SÓ executa se for Chrome iOS
              if (isChromeIOS) {
                function applyInputStyles() {
                  var inputs = document.querySelectorAll('.search-hero-input');
                  inputs.forEach(function(input) {
                    // ✅ MANTIDO: APENAS Chrome iOS - fontSize para texto digitado
                    input.style.fontSize = '16px'; // ✅ AJUSTADO: 16px para acessibilidade
                    // ✅ REMOVIDO: userScalable para acessibilidade
                    input.style.webkitTextSizeAdjust = '100%'; // ✅ AJUSTADO: 100% para acessibilidade
                    
                    // ✅ MANTIDO: Gesturestart para prevenir zoom
                    input.addEventListener('gesturestart', function(e) {
                      e.preventDefault();
                      input.style.fontSize = '16px'; // ✅ AJUSTADO: 16px
                    });
                  });
                }
                
                // ✅ MANTIDO: Aplicar após DOM ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', applyInputStyles);
                } else {
                  applyInputStyles();
                }
              }
              // ✅ MANTIDO: Placeholder controlado por CSS ::placeholder
            })();
          `
        }}
      />
    </div>
  );
}
