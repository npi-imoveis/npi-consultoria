import { Header } from "../components/ui/header";
import { Footer } from "../components/ui/footer";
export default function Layout({ children }) {
  return (
    <div className="h-screen overflow-hidden">
      <Header effect={false} />
      {children}
      {/* Footer oculto para layout full-screen */}
      <div className="hidden">
        <Footer />
      </div>
    </div>
  );
}
