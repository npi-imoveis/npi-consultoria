import { Header } from "@/app/components/ui/header";
import { Footer } from "../components/ui/footer";

export default function Layout({ children }) {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
}
