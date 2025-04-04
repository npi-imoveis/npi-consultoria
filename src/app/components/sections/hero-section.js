"use client";

import { useEffect, useState } from "react";
import { SearchHero } from "../ui/search-hero";

export function HeroSection() {
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

      {/* Imagem de fundo */}
      {/* <img
        className="absolute top-0 left-0 w-full h-full object-cover"
        src="/assets/images/imoveis/imovel.jpg" // Substitua pelo caminho da sua imagem
        alt=""
      /> */}

      <div className="absolute top-0 left-0 w-full h-full bg-black/80"></div>

      <div className="relative flex flex-col items-center justify-end h-full text-center text-white pb-24">
        <Typewriter />

        <div className="mt-8">
          <SearchHero />
        </div>
      </div>
    </div>
  );
}

function Typewriter() {
  const words = ["Alto Padrão", "Sofisticação", "Elegância"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [text, setText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    const typingSeed = isDeleting ? 50 : 100;
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
    }, typingSeed);
    return () => clearTimeout(timeout);
  }, [charIndex, isDeleting, currentWordIndex, words]);

  return (
    <div className="w-full h-full flex flex-col justify-end items-center">
      <span>Uma nova experiência em</span>
      <span className="text-xl h-8 font-bold text-zinc-400">{text}</span>
    </div>
  );
}
