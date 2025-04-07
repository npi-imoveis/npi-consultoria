import { Oxanium, Michroma } from "next/font/google";
import "./globals.css";
import QueryProvider from "./providers/QueryClientProvider";
import { WhatsappFloat } from "./components/ui/whatsapp";
import { Organization, WebSite } from "./components/structured-data";

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

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google Tag Manager - HEAD */}
        <script
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
      </head>

      <body className={`${oxanium.variable} ${michroma.variable} antialiased`}>
        <Organization />
        <WebSite />
        <QueryProvider>{children}</QueryProvider>
        <WhatsappFloat />
      </body>
    </html>
  );
}
