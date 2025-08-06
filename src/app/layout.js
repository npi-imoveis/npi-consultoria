import { Oxanium, Michroma } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryClientProvider";
import { MusicPlayer } from "./components/shared/music-player";
import { Organization, WebSite } from "./components/structured-data";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

// ✅ OTIMIZADO: Fontes com display swap para performance
const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false, // 🔧 CORRIGIDO: Remove preload desnecessário
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  preload: false, // 🔧 CORRIGIDO: Remove preload desnecessário
});

const GTM_ID = "GTM-NN6HZC";
const ANALYTICS_ID = "G-405E52JFGM";

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
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://npiconsultoria.com.br",
    siteName: "NPi Consultoria",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NPi Consultoria - Imóveis de Alto Padrão",
    description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
  },
  // 🔧 REMOVIDO: manifest.json por enquanto (tem erro de sintaxe)
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NPi Consultoria",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 5.0,
  minimumScale: 1.0,
  viewportFit: "cover",
  shrinkToFit: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* 🚀 CRITICAL CSS INLINE - Resolve 180ms CSS blocking */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Critical CSS above the fold */
              *,::before,::after{box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}
              html{line-height:1.5;-webkit-text-size-adjust:100%;-moz-tab-size:4;tab-size:4;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,"Noto Sans",sans-serif}
              body{margin:0;line-height:inherit;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
              img,video{max-width:100%;height:auto}
              
              /* Container utilities */
              .container{width:100%;margin-left:auto;margin-right:auto;padding-left:1rem;padding-right:1rem}
              @media (min-width:640px){.container{max-width:640px}}
              @media (min-width:768px){.container{max-width:768px;padding-left:0;padding-right:0}}
              @media (min-width:1024px){.container{max-width:1024px}}
              @media (min-width:1280px){.container{max-width:1280px}}
              
              /* Flex utilities */
              .flex{display:flex}
              .flex-col{flex-direction:column}
              @media (min-width:1024px){.lg\\:flex-row{flex-direction:row}}
              .w-full{width:100%}
              @media (min-width:1024px){.lg\\:w-\\[65\\%\\]{width:65%};.lg\\:w-\\[35\\%\\]{width:35%}}
              
              /* Spacing */
              .gap-4{gap:1rem}
              .mt-3{margin-top:0.75rem}
              .px-4{padding-left:1rem;padding-right:1rem}
              @media (min-width:768px){.md\\:px-0{padding-left:0;padding-right:0}}
              
              /* Background */
              .bg-white{background-color:#fff}
              .bg-zinc-200{background-color:#e4e4e7}
              
              /* Text */
              .text-black{color:#000}
              .text-sm{font-size:0.875rem;line-height:1.25rem}
              .font-semibold{font-weight:600}
              .font-bold{font-weight:700}
              .text-center{text-align:center}
              @media (min-width:768px){.md\\:text-right{text-align:right}}
              
              /* Image optimization classes */
              img[data-nimg="fill"]{position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;object-fit:cover}
              
              /* Layout optimization */
              .layout-optimized{min-height:1200px;contain:layout style paint;transform:translateZ(0);will-change:auto}
            `,
          }}
        />
        
        {/* 🔧 CORRIGIDO: Viewport acessível */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=5.0, minimum-scale=1.0, shrink-to-fit=no, viewport-fit=cover"
        />
        
        {/* 🔧 CORRIGIDO: Meta tags atualizadas */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NPi Consultoria" />
        
        <meta name="format-detection" content="telephone=no, email=no, address=no" />
        <meta name="theme-color" content="#000000" />
        <meta name="color-scheme" content="light" />
        
        {/* 🚀 OTIMIZADO: Apenas preconnect essenciais, sem preload desnecessário */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://npi-imoveis.s3.sa-east-1.amazonaws.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* 🚀 PRELOAD: Apenas recursos críticos */}
        <link 
          rel="preload" 
          href="/assets/images/bg-hub.png" 
          as="image" 
          media="(max-width: 768px)"
        />
        
        {/* ✅ Favicon otimizado */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        
        {/* 🔧 OTIMIZADO: CSS inline para iOS - sem user-scalable */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Chrome iOS otimizações */
            @supports (-webkit-appearance: none) and (not (-webkit-backdrop-filter: blur(1px))) {
              input, textarea, select {
                font-size: 16px !important;
                -webkit-text-size-adjust: 100% !important;
                -webkit-transform: translate3d(0,0,0) !important;
                transform: translate3d(0,0,0) !important;
              }
              
              input::placeholder, textarea::placeholder {
                font-size: 12px !important;
                opacity: 0.7 !important;
              }
            }
            
            /* Responsivo mobile */
            @media screen and (max-width: 768px) {
              input, textarea, select {
                min-height: 44px !important;
                -webkit-appearance: none !important;
                touch-action: manipulation !important;
              }
              
              input::placeholder {
                font-size: 12px !important;
              }
            }
            
            /* Desktop */
            @media screen and (min-width: 768px) {
              input::placeholder {
                font-size: 14px !important;
              }
            }
            
            /* Otimizações gerais */
            * {
              -webkit-tap-highlight-color: transparent !important;
            }
            
            html {
              -webkit-text-size-adjust: 100% !important;
            }
          `
        }} />
        
        {/* 🚀 DEFER: CSS não-crítico */}
        <link
          rel="stylesheet"
          href="/_next/static/css/app/layout.css"
          media="print"
          onLoad="this.media='all'"
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
          WebkitTextSizeAdjust: "100%",
          textSizeAdjust: "100%",
          touchAction: "manipulation",
        }}
      >
        {/* 🚀 OTIMIZADO: GTM com strategy afterInteractive */}
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

        <Organization />
        <WebSite />
        
        <QueryProvider>
          {children}
        </QueryProvider>
        
        <MusicPlayer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
