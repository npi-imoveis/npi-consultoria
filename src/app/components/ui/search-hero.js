"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SearchHero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  // ✅ Chrome iOS: aplica fontSize para texto digitado (não placeholder)
  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      
      // ✅ DETECÇÃO: Só aplica fontSize para texto digitado se for Chrome iOS
      const isChromeIOS = /CriOS/.test(navigator.userAgent);
      
      if (isChromeIOS) {
        // ✅ Chrome iOS: aplicar fontSize para texto digitado (prevenir zoom)
        input.style.fontSize = "16px"; // Tamanho adequado para texto digitado
      }
      
      // ✅ Propriedades essenciais para todos iOS (Safari + Chrome)
      input.style.webkitAppearance = "none";
      input.style.webkitTextSizeAdjust = "none";
      input.style.webkitUserScalable = "0";
      input.style.userScalable = "0";
      
      // Transform leve
      input.style.webkitTransform = "translate3d(0,0,0)";
      input.style.transform = "translate3d(0,0,0)";
      
      // ✅ Gesturestart para Chrome iOS
      const preventGesture = (e) => {
        e.preventDefault();
        if (isChromeIOS) {
          input.style.fontSize = "16px"; // Manter tamanho para texto digitado
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
    
    // Blur o input para esconder o teclado
    if (inputRef.current) {
      inputRef.current.blur();
    }
    
    // Redireciona para a página de busca com o parâmetro de busca
    router.push(`/busca?q=${encodeURIComponent(searchTerm)}`);
  };

  // ✅ REFINADO: Handler simples para mudança de input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    // ✅ Mínimo necessário - sem interferir na digitação
  };

  // ✅ Handler para focus - texto digitado adequado
  const handleFocus = (e) => {
    const input = e.target;
    const isChromeIOS = /CriOS/.test(navigator.userAgent);
    
    // ✅ Aplica fontSize para texto digitado apenas se for Chrome iOS
    if (isChromeIOS) {
      input.style.fontSize = "16px"; // Tamanho adequado para prevenir zoom
      input.style.webkitUserScalable = "0";
      input.style.userScalable = "0";
    }
  };

  return (
    <div className="relative w-[350px] mx-3 sm:w-[340px] sm:mx-4 md:w-[600px] xl:w-[950px] bg-gray-100/10 rounded-2xl sm:rounded-full p-1.5 mb-20 lg:mb-0 transform translate-z-0">
      <form 
        onSubmit={handleSubmit} 
        className="flex flex-col sm:block gap-2 sm:gap-0"
        noValidate
      >
        {/* Campo de busca - CORREÇÃO ULTRA-ESPECÍFICA iOS + Chrome */}
        <input
          ref={inputRef}
          type="text" // ✅ MUDANÇA: text em vez de search (Chrome mobile)
          inputMode="search" // ✅ NOVO: inputMode para teclado correto
          role="searchbox" // ✅ NOVO: ARIA role
          aria-label="Buscar imóveis"
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
            // ✅ REFINADO: Propriedades mínimas necessárias
            fontSize: "15.5px", // Tamanho otimizado (previne zoom Chrome iOS)
            minHeight: "40px", // Reduzido de 44px
            
            // WebKit essencial
            WebkitAppearance: "none",
            WebkitTextSizeAdjust: "none",
            WebkitUserScalable: "0",
            
            // Touch básico
            touchAction: "manipulation",
            userScalable: "0",
            
            // Transform leve
            WebkitTransform: "translate3d(0,0,0)",
            transform: "translate3d(0,0,0)",
            
            // Layout básico
            boxSizing: "border-box",
            outline: "none",
            border: "none",
          }}
          autoComplete="off"
          spellCheck="false"
          autoCorrect="off"
          autoCapitalize="off"
          // ✅ NOVO: Atributos específicos para prevenir zoom
          data-no-zoom="true"
          tabIndex={0}
        />
        
        {/* Botão de busca */}
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
            flex items-center justify-center 
            transition-all duration-200
          "
          style={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
            WebkitTouchCallout: "none",
            minHeight: "44px", // iOS minimum touch target
            fontSize: "14px", // Tamanho seguro para botões
          }}
          aria-label="Buscar imóveis"
          tabIndex={0}
        >
          <span>Buscar imóveis</span>
        </button>
      </form>
      
      {/* ✅ Script backup: Chrome iOS - texto digitado */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Detection específica para Chrome iOS
              var isChromeIOS = /CriOS/.test(navigator.userAgent);
              
              // ✅ SÓ executa se for Chrome iOS
              if (isChromeIOS) {
                function applyInputStyles() {
                  var inputs = document.querySelectorAll('.search-hero-input');
                  inputs.forEach(function(input) {
                    // ✅ APENAS Chrome iOS: fontSize para texto digitado
                    input.style.fontSize = '16px'; // Tamanho adequado para prevenir zoom
                    input.style.webkitUserScalable = '0';
                    input.style.userScalable = '0';
                    input.style.webkitTextSizeAdjust = 'none';
                    
                    // Gesturestart para prevenir zoom
                    input.addEventListener('gesturestart', function(e) {
                      e.preventDefault();
                      input.style.fontSize = '16px';
                    });
                  });
                }
                
                // Aplicar após DOM ready
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', applyInputStyles);
                } else {
                  applyInputStyles();
                }
              }
              // ✅ Placeholder controlado por CSS ::placeholder
            })();
          `
        }}
      />
    </div>
  );
}
