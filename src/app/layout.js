// src/app/layout.js
import { Oxanium, Michroma } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryClientProvider";
import { MusicPlayer } from "./components/shared/music-player";
import { Organization, WebSite } from "./components/structured-data";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

// ✅ CORREÇÃO: Fontes sem preload (evita warnings)
const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const GTM_ID = "GTM-NN6HZC";
const ANALYTICS_ID = "G-405E52JFGM";

// METADATA SEM MANIFEST - Evita erros
export const metadata = {
  title: {
    default: "NPi Consultoria - Imóveis de Alto Padrão",
    template: "%s | NPi",
  },
  description:
    "Especialistas em imóveis de alto padrão. Encontre apartamentos, casas e terrenos exclusivos com a melhor consultoria imobiliária.",
  keywords: [
    "imóveis alto padrão",
    "consultoria imobiliária",
    "apartamentos luxo",
    "casas exclusivas",
  ],
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
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://npiconsultoria.com.br",
    siteName: "NPi Consultoria",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description:
      "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description:
      "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NPi Consultoria",
  },
};

// 🔧 Viewport oficial do App Router (única fonte de verdade)
// Removemos o <meta name="viewport"> manual do <head> para evitar duplicidade.
export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  viewportFit: "cover",
  shrinkToFit: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* ✅ iOS específico: Safari + Chrome iOS */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NPi Consultoria" />

        {/* Meta tags essenciais */}
        <meta
          name="format-detection"
          content="telephone=no, email=no, address=no"
        />

        {/* ✅ Theme e color scheme */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light" />

        {/* ✅ OTIMIZAÇÃO: DNS prefetch apenas essencial */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />

        {/* Preconnect essenciais */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* ✅ CSS específico para inputs de busca em iOS (não afeta breakpoints) */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @supports (-webkit-appearance: none) and (not (-webkit-backdrop-filter: blur(1px))) {
              input[type="search"],
              input[placeholder*="Buscar"],
              input[placeholder*="buscar"],
              input[placeholder*="Pesquisar"],
              input[placeholder*="pesquisar"],
              input[placeholder*="Procurar"],
              input[placeholder*="procurar"],
              .search-input,
              [data-search="true"] input,
              form[role="search"] input {
                font-size: 16px !important;
                -webkit-user-scalable: 0 !important;
                user-scalable: 0 !important;
                -webkit-text-size-adjust: none !important;
                -webkit-transform: translate3d(0,0,0) !important;
                transform: translate3d(0,0,0) !important;
              }
              input[type="search"]::placeholder,
              input[placeholder*="Buscar"]::placeholder,
              input[placeholder*="buscar"]::placeholder,
              input[placeholder*="Pesquisar"]::placeholder,
              input[placeholder*="pesquisar"]::placeholder,
              .search-input::placeholder,
              [data-search="true"] input::placeholder,
              form[role="search"] input::placeholder {
                font-size: 11px !important;
                opacity: 0.7 !important;
              }
              input:not([type="search"]):not([placeholder*="Buscar"]):not([placeholder*="buscar"]):not(.search-input),
              textarea:not(.search-input) {
                font-size: 12px;
              }
            }
            @media screen and (max-width: 768px) {
              input[type="search"],
              input[placeholder*="Buscar"],
              input[placeholder*="buscar"],
              .search-input {
                -webkit-user-scalable: 0 !important;
                user-scalable: 0 !important;
                min-height: 40px !important;
              }
              input[type="search"]::placeholder,
              input[placeholder*="Buscar"]::placeholder,
              .search-input::placeholder {
                font-size: 11px !important;
              }
            }
            @media screen and (min-width: 768px) {
              input::placeholder {
                font-size: 14px !important;
              }
            }
            * { -webkit-tap-highlight-color: transparent !important; }
            html { -webkit-text-size-adjust: 100% !important; }
          `,
          }}
        />
      </head>

      <body
        className={`${oxanium.variable} ${michroma.variable} antialiased`}
        style={{
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          WebkitTapHighlightColor: "transparent",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
          touchAction: "manipulation",
        }}
      >
        {/* ✅ GTM */}
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

        {/* ✅ GA4 */}
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

        {/* Structured Data */}
        <Organization />
        <WebSite />

        {/* App Providers */}
        <QueryProvider>{children}</QueryProvider>

        {/* Lazy Components */}
        <MusicPlayer />

        {/* Analytics */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
