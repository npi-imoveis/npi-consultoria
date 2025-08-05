"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SearchHero() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  // ✅ Chrome iOS específico: useEffect para aplicar estilos críticos após mount
  useEffect(() => {
    if (inputRef.current) {
      const input = inputRef.current;
      
      // ✅ CHROME iOS ESPECÍFICO: Propriedades críticas via JavaScript
      input.style.fontSize = "16px";
      input.style.webkitAppearance = "none";
      input.style.webkitTextSizeAdjust = "none"; // ✅ "none" para Chrome iOS
      input.style.webkitUserScalable = "0"; // ✅ Valor "0" para Chrome iOS
      input.style.userScalable = "0";
      input.style.webkitTransform = "translateZ(0)"; // ✅ GPU layer para Chrome iOS
      input.style.transform = "translateZ(0)";
      input.style.zoom = "1";
      input.style.touchAction = "manipulation";
      
      // ✅ Chrome iOS: Previne zoom em double tap (comportamento específico)
      const preventChromeZoom = (e) => {
        e.preventDefault();
        // Delay específico para Chrome iOS
        setTimeout(() => {
          input.focus();
          // Força estilos após focus
          input.style.fontSize = "16px";
          input.style.zoom = "1";
          input.style.webkitTransform = "translateZ(0)";
        }, 50); // ✅ 50ms delay para Chrome iOS
      };
      
      // Event listeners específicos para Chrome iOS
      input.addEventListener('touchstart', preventChromeZoom, { passive: false });
      input.addEventListener('touchend', preventChromeZoom, { passive: false });
      
      // ✅ NOVO: Listener para gesturestart (Chrome iOS específico)
      input.addEventListener('gesturestart', (e) => {
        e.preventDefault();
        input.style.fontSize = "16px";
      }, { passive: false });
      
      // Cleanup
      return () => {
        input.removeEventListener('touchstart', preventChromeZoom);
        input.removeEventListener('touchend', preventChromeZoom);
        input.removeEventListener('gesturestart', preventChromeZoom);
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

  // ✅ NOVO: Handler específico para mudança de input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    
    // Força manter estilos durante typing
    const input = e.target;
    input.style.fontSize = "16px";
    input.style.zoom = "1";
  };

  // ✅ Chrome iOS: Handler para focus (previne zoom com timing específico)
  const handleFocus = (e) => {
    const input = e.target;
    
    // ✅ Chrome iOS específico: delay maior e múltiplas aplicações
    setTimeout(() => {
      input.style.fontSize = "16px";
      input.style.webkitTransform = "translateZ(0)";
      input.style.transform = "translateZ(0)";
      input.style.zoom = "1";
      input.style.webkitUserScalable = "0"; // Chrome iOS prefere "0"
      input.style.userScalable = "0";
    }, 100); // ✅ 100ms delay para Chrome iOS
    
    // ✅ Aplicação dupla para garantir
    setTimeout(() => {
      input.style.fontSize = "16px";
      input.style.zoom = "1";
    }, 200);
  };

  return (
    <div className="relative w-[400px] sm:w-[350px] md:w-[600px] xl:w-[950px] bg-gray-100/10 rounded-2xl sm:rounded-full p-1.5 mb-20 lg:mb-0 transform translate-z-0">
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
            text-base 
            md:text-lg
          "
          placeholder="Digite código, endereço, cidade ou condomínio..."
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          style={{
            // ✅ PROPRIEDADES ULTRA-CRÍTICAS inline (maior prioridade)
            fontSize: "16px",
            minHeight: "44px", // iOS minimum touch target
            
            // WebKit específico
            WebkitAppearance: "none",
            WebkitBorderRadius: "8px",
            WebkitTextSizeAdjust: "100%",
            WebkitUserScalable: "no",
            WebkitTransform: "none",
            WebkitTouchCallout: "none",
            WebkitTapHighlightColor: "transparent",
            
            // Touch e scale
            touchAction: "manipulation",
            userScalable: "no",
            transform: "none",
            zoom: 1,
            
            // Layout
            boxSizing: "border-box",
            outline: "none",
            border: "none",
            
            // Performance
            willChange: "auto", // Evita layers desnecessárias
            contain: "layout style", // Isolamento de rendering
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
      
      {/* ✅ Chrome iOS: Script inline backup específico */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              // Chrome iOS detection específica
              var isChromeIOS = /CriOS/.test(navigator.userAgent);
              
              if (isChromeIOS) {
                // Força estilos após DOM ready para Chrome iOS
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', applyChromeIOSStyles);
                } else {
                  applyChromeIOSStyles();
                }
                
                function applyChromeIOSStyles() {
                  var inputs = document.querySelectorAll('.search-hero-input');
                  inputs.forEach(function(input) {
                    // Chrome iOS específico
                    input.style.fontSize = '16px';
                    input.style.webkitAppearance = 'none';
                    input.style.webkitTextSizeAdjust = 'none';
                    input.style.webkitUserScalable = '0';
                    input.style.userScalable = '0';
                    input.style.zoom = '1';
                    input.style.webkitTransform = 'translateZ(0)';
                    input.style.transform = 'translateZ(0)';
                    
                    // Event listener específico para Chrome iOS
                    input.addEventListener('focus', function() {
                      setTimeout(function() {
                        input.style.fontSize = '16px';
                        input.style.zoom = '1';
                        input.style.webkitTransform = 'translateZ(0)';
                      }, 100);
                    });
                    
                    // Gesturestart para Chrome iOS
                    input.addEventListener('gesturestart', function(e) {
                      e.preventDefault();
                      input.style.fontSize = '16px';
                    });
                  });
                }
              }
            })();
          `
        }}
      />
    </div>
  );
}
