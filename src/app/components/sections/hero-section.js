"use client";

import { useEffect, useState } from "react";
import { SearchHero } from "../ui/search-hero";
import { usePathname } from "next/navigation";

export function HeroSection() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <video
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/assets/video/video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      ></video>

      <div className="absolute top-0 left-0 w-full h-full bg-black/80"></div>

      <div className="relative flex flex-col items-center justify-end h-full text-center text-white pb-24 z-10">
        <Typewriter />

        <div className="mt-8">
          <SearchHero />
        </div>
      </div>
    </div>
  );
}

function Typewriter() {
  const words = ["Imóveis de Alto Padrão", "Sofisticação", "Elegância"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    const typingSpeed = isDeleting ? 50 : 100;
    const nextStep = isDeleting ? charIndex - 1 : charIndex + 1;

    const timeout = setTimeout(() => {
      setText(currentWord.substring(0, nextStep));
      setCharIndex(nextStep);

      if (!isDeleting && nextStep === currentWord.length) {
        setTimeout(() => setIsDeleting(true), 1000);
      } else if (isDeleting && nextStep === 0) {
        setIsDeleting(false);
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentWordIndex]);

  return (
    <h1 className="flex flex-col items-center text-center text-white text-xs sm:text-sm font-medium tracking-wide opacity-80">
      <span className="mb-1">Uma nova experiência em</span>
      <span className="text-sm sm:text-base font-bold text-zinc-400">{text}</span>
    </h1>
  );
}
