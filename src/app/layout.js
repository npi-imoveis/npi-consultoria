import { Oxanium, Michroma } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryClientProvider";
import { MusicPlayer } from "./components/shared/music-player";
import { Organization, WebSite } from "./components/structured-data";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

// Fontes otimizadas (SEGURO: funciona em todas as versões)
const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap", // Performance boost
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap", // Performance boost
});

const GTM_ID = "GTM-NN6HZC";
const ANALYTICS_ID = "G-405E52JFGM";

// SEGURO: Funciona no Next.js 13+ (você está no 14+)
export const metadata = {
  title: {
    default: "NPi Consultoria - Imóveis de Alto Padrão",
    template: "%s | NPi Consultoria"
  },
  description: "Especialistas em imóveis de alto padrão. Encontre apartamentos, casas e terrenos exclusivos com a melhor consultoria imobiliária.",
  keywords: ["imóveis alto padrão", "consultoria imobiliária", "apartamentos luxo", "casas exclusivas", "imóveis São Paulo"],
  authors: [{ name: "NPi Consultoria" }],
  creator: "NPi Consultoria",
  publisher: "NPi Consultoria",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // SEO CRÍTICO: OpenGraph (funciona mesmo sem as imagens)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://npiconsultoria.com.br",
    siteName: "NPi Consultoria",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
  },
  // SEO CRÍTICO: Twitter Cards
  twitter: {
    card: "summary_large_image",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
  },
};

// CRÍTICO: Viewport para iOS (SEGURO: funciona em todas as versões)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* CRÍTICO: Meta viewport backup (iOS fix) */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no"
        />
        
        {/* SEO ESSENCIAL: Meta tags adicionais */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NPi Consultoria" />
        
        {/* PERFORMANCE: Preconnect essenciais (SEGURO) */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* FAVICON BÁSICO (SEGURO: funciona mesmo se não existir) */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      
      <body 
        className={`${oxanium.variable} ${michroma.variable} antialiased`}
        style={{
          // iOS optimizations (SEGURO)
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* GTM - Implementação corrigida (SEGURO) */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${GTM_ID}');
            `,
          }}
        />

        {/* Google Analytics - Otimizado (SEGURO) */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script 
          id="gtag-init" 
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ANALYTICS_ID}', {
                page_title: document.title,
                page_location: window.location.href
              });
            `,
          }}
        />

        {/* NoScript GTM fallback (SEO IMPORTANTE) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* Structured Data (SEGURO: seus componentes existem) */}
        <Organization />
        <WebSite />

        {/* App Content */}
        <QueryProvider>
          {children}
        </QueryProvider>

        {/* Global Components (SEGURO: componentes existem) */}
        <MusicPlayer />
        
        {/* Vercel Analytics (SEGURO) */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
