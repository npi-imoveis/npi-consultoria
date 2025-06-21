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
});

const michroma = Michroma({
  variable: "--font-michroma",
  subsets: ["latin"],
  weight: ["400"],
});

const GTM_ID = "GTM-NN6HZC";
const ANALYTICS_ID = "G-405E52JFGM";

// ADICIONE ESTE BLOCO DE CÓDIGO
export const metadata = {
  title: "NPI Consultoria Imobiliária - Teste de Metadados",
  description: "Esta é uma descrição de teste para verificar a renderização do head.",
  robots: "noindex, nofollow", // Para garantir que não indexe este teste
  // Você pode adicionar outras propriedades de metadados aqui se quiser testar
  // openGraph: { ... },
  // twitter: { ... },
};
// FIM DO BLOCO ADICIONADO

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`${oxanium.variable} ${michroma.variable} antialiased`}>
        <Script
          id="gtm-script"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtag/js?id='+i+dl;f.parentNode.insertBefore(j,f );
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
            function gtag( ){dataLayer.push(arguments);}
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
