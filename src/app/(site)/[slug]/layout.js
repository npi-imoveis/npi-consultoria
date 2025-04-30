import { Footer } from "../../components/ui/footer";
import { Header } from "../../components/ui/header";

export default function Layout({ children }) {
  return (
    <div>
      <Header effect={false} />
      {children}
      <Footer />
    </div>
  );
}
