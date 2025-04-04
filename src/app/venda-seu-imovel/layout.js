import { Header } from "@/app/components/ui/header";

export default function Layout({ children }) {
  return (
    <div>
      <Header  />
      {children}
    </div>
  );
}
