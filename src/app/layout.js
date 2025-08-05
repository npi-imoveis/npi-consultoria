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
  display: "swap", // Melhora performance
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap", // Melhora performance
});

const GTM_ID = "GTM-NN6HZC";
const ANALYTICS_ID = "G-405E52JFGM";

// CRÍTICO: Viewport para prevenir zoom no iOS
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// Metadata básica (Next.js 14+ padrão)
export const metadata = {
  title: "NPi Consultoria - Imóveis de Alto Padrão",
  description: "Especialistas em imóveis de alto padrão com a melhor consultoria imobiliária.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* CRÍTICO: Meta viewport alternativo se export não funcionar */}
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </head>
      
      <body 
        className={`${oxanium.variable} ${michroma.variable} antialiased`}
        style={{
          // iOS otimizations
          WebkitTapHighlightColor: "transparent",
        }}
      >
        {/* GTM Script corrigido */}
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
        
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${ANALYTICS_ID}');
          `}
        </Script>

        <Organization />
        <WebSite />
        <QueryProvider>{children}</QueryProvider>
        <MusicPlayer />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
