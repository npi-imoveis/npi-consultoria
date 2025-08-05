import { Oxanium, Michroma } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryClientProvider";
import { MusicPlayer } from "./components/shared/music-player";
import { Organization, WebSite } from "./components/structured-data";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

// ✅ MANTIDO: Fontes otimizadas com preload
const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true, // ✅ MANTIDO: Preload crítico
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: true, // ✅ MANTIDO: Preload crítico
});

const GTM_ID = "GTM-NN6HZC";
const ANALYTICS_ID = "G-405E52JFGM";

// ✅ MANTIDO: METADATA COMPLETO - Não interfere nas fotos de condomínio
export const metadata = {
  title: {
    default: "NPi Consultoria - Imóveis de Alto Padrão",
    template: "%s | NPi Consultoria"
  },
  description: "Especialistas em imóveis de alto padrão. Encontre apartamentos, casas e terrenos exclusivos com a melhor consultoria imobiliária.",
  keywords: ["imóveis alto padrão", "consultoria imobiliária", "apartamentos luxo", "casas exclusivas"],
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
  // ✅ MANTIDO: OpenGraph SEM imagens específicas - deixa o sistema usar as imagens das páginas
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://npiconsultoria.com.br",
    siteName: "NPi Consultoria",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
    // ✅ MANTIDO: REMOVIDO images array para não interferir nas fotos de condomínio
  },
  twitter: {
    card: "summary_large_image",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
    // ✅ MANTIDO: REMOVIDO images para não interferir
  },
  // ✅ MANTIDO: Manifest e app metadata
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NPi Consultoria",
  },
};

// 🔧 OTIMIZADO: Viewport acessível (removido user-scalable=false para PageSpeed)
export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0, // ✅ ADICIONADO: Permite zoom para acessibilidade
  minimumScale: 1.0,
  // ✅ REMOVIDO: userScalable: false (problema acessibilidade PageSpeed)
  // ✅ MANTIDO: iOS específico
  viewportFit: "cover",
  shrinkToFit: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* 🔧 OTIMIZADO: Meta viewport acessível para Chrome iOS */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, shrink-to-fit=no, viewport-fit=cover"
        />
        
        {/* ✅ MANTIDO: iOS específico - Safari + Chrome iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NPi Consultoria" />
        
        {/* ✅ MANTIDO: Meta tags essenciais SEM interferir em imagens */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        
        {/* ✅ MANTIDO: Theme e color scheme para consistência iOS */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light" />
        
        {/* ✅ MANTIDO: DNS prefetch para performance */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* ✅ MANTIDO: Preconnect essenciais SEM preload de mídia */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* ✅ MANTIDO: Manifest PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* ✅ MANTIDO: Favicon otimizado */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* 🔧 OTIMIZADO: CSS inline específico - MANTÉM funcionalidade iOS mas remove user-scalable */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* ✅ MANTIDO: Chrome iOS detection - texto digitado para prevenir zoom */
            @supports (-webkit-appearance: none) and (not (-webkit-backdrop-filter: blur(1px))) {
              input, textarea, select {
                font-size: 16px !important;
                /* ✅ REMOVIDO: user-scalable para acessibilidade */
                -webkit-text-size-adjust: 100% !important;
                -webkit-transform: translate3d(0,0,0) !important;
                transform: translate3d(0,0,0) !important;
              }
              
              /* ✅ MANTIDO: Placeholder responsivo para Chrome iOS */
              input::placeholder, textarea::placeholder {
                font-size: 12px !important;
                opacity: 0.7 !important;
              }
            }
            
            /* ✅ MANTIDO: Propriedades básicas para todos iOS */
            @media screen and (max-width: 768px) {
              input, textarea, select {
                /* ✅ REMOVIDO: user-scalable para acessibilidade */
                min-height: 44px !important;
                -webkit-appearance: none !important;
                touch-action: manipulation !important;
              }
              
              /* ✅ MANTIDO: Placeholder responsivo */
              input::placeholder {
                font-size: 12px !important;
              }
            }
            
            /* ✅ MANTIDO: Desktop placeholder */
            @media screen and (min-width: 768px) {
              input::placeholder {
                font-size: 14px !important;
              }
            }
            
            /* ✅ MANTIDO: Tap highlight removal */
            * {
              -webkit-tap-highlight-color: transparent !important;
            }
            
            /* ✅ MANTIDO: Text size adjust */
            html {
              -webkit-text-size-adjust: 100% !important;
            }
          `
        }} />
      </head>
      
      <body 
        className={`${oxanium.variable} ${michroma.variable} antialiased`}
        style={{
          // ✅ MANTIDO: Font smoothing
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          WebkitTapHighlightColor: "transparent",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          // ✅ MANTIDO: Propriedades para iOS
          WebkitTextSizeAdjust: "100%",
          textSizeAdjust: "100%",
          touchAction: "manipulation",
        }}
      >
        {/* ✅ MANTIDO: GTM Script com priority */}
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          priority
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
                page_location: window.location.href,
                anonymize_ip: true,
              });
            `,
          }}
        />

        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {/* ✅ MANTIDO: Structured data otimizado */}
        <Organization />
        <WebSite />
        
        {/* ✅ MANTIDO: Query provider com error boundary */}
        <QueryProvider>
          {children}
        </QueryProvider>
        
        {/* ✅ MANTIDO: Components com lazy loading */}
        <MusicPlayer />
        
        {/* ✅ MANTIDO: Analytics otimizados */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
