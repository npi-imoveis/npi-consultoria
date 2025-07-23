"use client";

import { useEffect } from "react";

// Named export for Apartment component
export function Apartment({ title, description, address, url, image, price }) {
  useEffect(() => {
    // Verificar se está no navegador (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // 1. Verificar e remover script existente
      const scriptId = "apartment-data";
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      // 2. Dados estruturados
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Apartment",
        "name": title,
        "price": price,
        "address": address,
        "url": url,
        "description": description,
        "image": image.map((item, index) => ({

          "position": index + 1,
          "url": item.Foto
        }))
      };

      // 3. Criar script
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.setAttribute('data-schema', 'Apartment');
      script.innerHTML = JSON.stringify(structuredData);
      document.head.appendChild(script);

      // 4. Cleanup
      return () => {
        const scriptToRemove = document.getElementById(scriptId);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    } catch (error) {
      console.error("Apartment: Erro ao criar structured data:", error);
    }
  }, [title, description, address, url, image]);

  return null;
}

// Named export for Organization component
export function Organization() {
  useEffect(() => {
    // Verificar se está no navegador (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // 1. Verificar e remover script existente
      const scriptId = "organization-data";
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      // 2. Dados estruturados
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "NPi Imóveis",
        "url": process.env.NEXT_PUBLIC_SITE_URL,
        "logo": process.env.NEXT_PUBLIC_SITE_URL + "/assets/images/logo.png",
        "description": "Hub de Imobiliárias de alto padrão",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Rua George Ohm, 206P, Cj. 101 – Torre B – Brooklin",
          "addressLocality": "São Paulo",
          "addressRegion": "SP",
          "postalCode": "04576-020",
          "addressCountry": "BR"
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "(11) 2614-4414",
          "contactType": "customer service",
          "areaServed": "BR"
        }
      };

      // 3. Criar script
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.setAttribute('data-schema', 'Organization');
      script.innerHTML = JSON.stringify(structuredData);
      document.head.appendChild(script);

      // 4. Cleanup
      return () => {
        const scriptToRemove = document.getElementById(scriptId);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    } catch (error) {
      console.error("Organization: Erro ao criar structured data:", error);
    }
  }, []);

  return null;
}

// Named export for WebSite component
export function WebSite() {
  useEffect(() => {
    // Verificar se está no navegador (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    try {
      // 1. Verificar e remover script existente
      const scriptId = "website-data";
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      // 2. Dados estruturados
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "NPi Imóveis",
        "url": process.env.NEXT_PUBLIC_SITE_URL,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${process.env.NEXT_PUBLIC_SITE_URL || ''}/busca?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      };

      // 3. Criar script
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.setAttribute('data-schema', 'WebSite');
      script.innerHTML = JSON.stringify(structuredData);
      document.head.appendChild(script);

      // 4. Cleanup
      return () => {
        const scriptToRemove = document.getElementById(scriptId);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    } catch (error) {
      console.error("WebSite: Erro ao criar structured data:", error);
    }
  }, []);

  return null;
}

// Named export for BreadcrumbList component
export function BreadcrumbList({ items }) {
  useEffect(() => {
    // Verificar se está no navegador (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    if (!items || items.length === 0) {
      console.error("BreadcrumbList: Itens vazios ou indefinidos");
      return;
    }

    try {
      // 1. Verificar e remover script existente
      const scriptId = "breadcrumb-data";
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      // 2. Dados estruturados
      const structuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.name,
          "item": item.url
        }))
      };

      // 3. Criar script
      const script = document.createElement("script");
      script.id = scriptId;
      script.type = "application/ld+json";
      script.setAttribute('data-schema', 'BreadcrumbList');
      script.innerHTML = JSON.stringify(structuredData);
      document.head.appendChild(script);

      // 4. Cleanup
      return () => {
        const scriptToRemove = document.getElementById(scriptId);
        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      };
    } catch (error) {
      console.error("BreadcrumbList: Erro ao criar structured data:", error);
    }
  }, [items]);

  return null;
}

// Add a default export that includes all components
const StructuredData = {
  Apartment,
  BreadcrumbList,
  Organization,
  WebSite
};

export default StructuredData; 
