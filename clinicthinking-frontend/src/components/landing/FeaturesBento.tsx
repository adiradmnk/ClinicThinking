"use client";
import { BrainCircuit, MessageSquareText, GitBranch, LayoutDashboard } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Text3DFlip from "@/components/ui/text-3d-flip";

const features = [
{
    Icon: MessageSquareText,
    name: "AI Anamnesis",
    description: "Data medis terstruktur otomatis.",
    className: "col-span-3 lg:col-span-1 min-h-[300px] rounded-none",
    // Masukkan Lottie di sini
    background: (
      <div className="absolute inset-0 flex items-center justify-center opacity-80">
        <DotLottieReact
          src="https://lottie.host/042716a2-bf77-497a-bd80-0b001bde256b/03iknNaT45.lottie"
          loop
          autoplay
        />
      </div>
    ),
    href: "#",
    cta: "Lihat detail",
  },
  
  {
    Icon: BrainCircuit,
    name: "Reasoning Map",
    description: "Visualisasi langkah berpikir klinis.",
    className: "col-span-3 lg:col-span-2 min-h-[300px] rounded-none",
    background: (
      <div className="absolute inset-0 flex items-center justify-right opacity-80">
        <DotLottieReact
          src="https://lottie.host/227f93bb-649c-4a7f-91c7-98627562b7b1/9jAjc5uTmB.lottie"
          loop
          autoplay
        />
      </div>
    ),
    href: "#",
    cta: "Lihat detail",
  },
  {
    Icon: GitBranch,
    name: "Bias Detection",
    description: "Identifikasi bias kognitif dalam diagnosa.",
    className: "col-span-3 lg:col-span-2 min-h-[300px] rounded-none",
    background: (
      <div className="absolute inset-0 flex items-center justify-right opacity-80">
        <DotLottieReact
          src="https://lottie.host/dda4dfab-6007-4dc8-af64-87df4d8df9e0/tpWT3YhVQ6.lottie"
          loop
          autoplay
        />
      </div>
    ),
    href: "#",
    cta: "Lihat detail",
  },
  {
    Icon: LayoutDashboard,
    name: "SCT Feedback",
    description: "Umpan balik intuisi klinis.",
    className: "col-span-3 lg:col-span-1 min-h-[300px] rounded-none",
    background: (
      <div className="absolute inset-0 flex justify-end items-center p-6 opacity-80">
        <DotLottieReact
          src="https://lottie.host/7371c7ba-d584-419f-b42d-f3718f69f211/v83YQ9lYUn.lottie"
          loop
          autoplay
        />
      </div>
    ),
    href: "#",
    cta: "Lihat detail",
  },
];

export function FeaturesBento() {
  return (
    <section id="product" className="w-full">
      {/* 1. Hero Section */}
      <div className="w-full relative py-24 flex flex-col items-center justify-center overflow-hidden">
        <img
          src="/mintoceon.png"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 z-0" />
        
        <div className="relative z-10 flex flex-col items-center px-6">
          <Text3DFlip
            as="h2"
            className="text-4xl font-serif text-center max-w-[600px] leading-tight"
            rotateDirection="top" // Efek flip ke atas
            staggerFrom="center"  // Animasi mulai dari tengah teks
          >
            Memudahkan konsep berantakan menjadi tersusun
          </Text3DFlip>
        </div>
      </div>

      {/* 2. Bento Grid Section */}
      <div className="w-full py-16 px-6">
        <BentoGrid className="max-w-6xl mx-auto gap-6 md:grid-rows-2">
          {features.map((feature, idx) => (
            <BentoCard key={idx} {...feature} />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}