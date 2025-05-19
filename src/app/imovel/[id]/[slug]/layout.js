import { Header } from "@/app/components/ui/header";
import { Footer } from "@/app/components/ui/footer";

export default function Layout({ children }) {
  return (
    <div>
      <Header effect={false} />
      {children}
      <Footer />
    </div>
  );
}
