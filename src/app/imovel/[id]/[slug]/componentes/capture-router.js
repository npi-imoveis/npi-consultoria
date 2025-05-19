"use client";

import { usePathname } from "next/navigation";

export default function CaptureRouter() {
  const pathname = usePathname();
  console.log(pathname);
}
