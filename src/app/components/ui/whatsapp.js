import Image from "next/image";
import Link from "next/link";

export function WhatsappFloat() {
  return (
    <div className="fixed bottom-5 right-5 z-[9999]">
      <Link
        href="https://web.whatsapp.com/send?phone=5511969152222"
        target="_blank"
      >
        <Image src="/assets/images/whatsapp.png" height={48} width={48} alt="logo" />
      </Link>
    </div>
  );
}
