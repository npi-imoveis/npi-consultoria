import { Oxanium, Michroma } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryClientProvider";
import { MusicPlayer } from "./components/shared/music-player";
import { Organization, WebSite } from "./components/structured-data";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: true, // ✅ OTIMIZAÇÃO: Preload crítico
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: true, // ✅ OTIMIZAÇÃO: Preload crítico
});

const GTM_ID = "GTM-NN6HZC";
const ANALYTICS_ID = "G-405E52JFGM";

// METADATA SEM IMAGENS - Não interfere nas fotos de condomínio
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
  // OpenGraph SEM imagens específicas - deixa o sistema usar as imagens das páginas
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://npiconsultoria.com.br",
    siteName: "NPi Consultoria",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
    // REMOVIDO: images array para não interferir nas fotos de condomínio
  },
  twitter: {
    card: "summary_large_image",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
    // REMOVIDO: images para não interferir
  },
  // ✅ NOVO: Manifest e app metadata
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NPi Consultoria",
  },
};

// 🔥 CRÍTICO: Viewport específico para Chrome iOS (Android já funciona)
export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  minimumScale: 1.0,
  userScalable: false,
  // ✅ Chrome iOS específico
  viewportFit: "cover",
  shrinkToFit: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* 🔥 CRÍTICO: Meta viewport específico para Chrome iOS */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover"
        />
        
        {/* ✅ iOS específico: Safari + Chrome iOS */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NPi Consultoria" />
        
        {/* Meta tags essenciais SEM interferir em imagens */}
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        
        {/* ✅ Theme e color scheme para consistência iOS */}
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light" />
        
        {/* ✅ OTIMIZAÇÃO: DNS prefetch para performance */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Preconnect essenciais SEM preload de mídia */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* ✅ NOVO: Manifest PWA */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon otimizado */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* ✅ CSS inline refinado - Chrome iOS sem quebrar funcionalidade */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Crítico: Chrome iOS específico - font otimizado */
            input, textarea, select {
              font-size: 15.5px !important;
              -webkit-appearance: none !important;
              -webkit-text-size-adjust: none !important;
              -webkit-user-scalable: 0 !important;
              user-scalable: 0 !important;
            }
            
            /* Chrome iOS detection refinada */
            @supports (-webkit-appearance: none) and (not (-webkit-backdrop-filter: blur(1px))) {
              input, textarea, select {
                font-size: 15.5px !important;
                -webkit-user-scalable: 0 !important;
                user-scalable: 0 !important;
                -webkit-transform: translate3d(0,0,0) !important;
                transform: translate3d(0,0,0) !important;
              }
            }
            
            @media screen and (max-width: 768px) {
              input, textarea, select {
                font-size: 15.5px !important;
                -webkit-user-scalable: 0 !important;
                user-scalable: 0 !important;
                min-height: 40px !important;
              }
            }
            
            * {
              -webkit-tap-highlight-color: transparent !important;
            }
            
            html {
              -webkit-text-size-adjust: 100% !important;
            }
          `
        }} />
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
          // ✅ NOVO: Propriedades para prevenir zoom
          WebkitTextSizeAdjust: "100%",
          textSizeAdjust: "100%",
          touchAction: "manipulation",
        }}
      >
        {/* ✅ OTIMIZAÇÃO: GTM Script com priority */}
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

        {/* ✅ Structured data otimizado */}
        <Organization />
        <WebSite />
        
        {/* ✅ Query provider com error boundary */}
        <QueryProvider>
          {children}
        </QueryProvider>
        
        {/* ✅ Components com lazy loading */}
        <MusicPlayer />
        
        {/* ✅ Analytics otimizados */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
