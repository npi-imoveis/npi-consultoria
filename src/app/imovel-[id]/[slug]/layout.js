import { Header } from "@/app/components/ui/header";
import { Footer } from "@/app/components/ui/footer";
import { WhatsappFloat } from "@/app/components/ui/whatsapp";
export default function Layout({ children }) {
  return (
    <div>
      <Header effect={false} />
      {children}

      <Footer />
    </div>
  );
}
