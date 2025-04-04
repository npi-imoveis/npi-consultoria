import { Header } from "../components/ui/header";
import { Footer } from "../components/ui/footer";
export default function Layout({ children }) {
  return (
    <div>
      <Header effect={false} />
      {children}
      <Footer />
    </div>
  );
}
