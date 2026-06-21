"use client";
import { useState } from "react";
import { motion } from "framer-motion";

export default function DemoVideo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-20 px-6 border-t border-b border-l border-r border-black/20">
      {/* Container utama dengan background image */}
      <div 
        className="w-full max-w-6xl mx-auto h-[400px] relative rounded-none overflow-hidden flex items-center bg-cover bg-center"
        style={{ backgroundImage: "url('/mintbeach.png')" }} // Ganti dengan path gambarmu
      >
        {/* Overlay hitam tipis agar teks menonjol */}
        <div className="absolute inset-0 bg-black/40 " />

        {/* Konten teks dan tombol */}
        <div className="relative z-10 pl-16">
          <h2 className="text-white text-5xl font-serif font-bold max-w-md leading-tight mb-8">
            Membangun Infrastruktur AI Simulasi OSCE
          </h2>
          
          <button 
            onClick={() => setIsOpen(true)}
            className="bg-white text-black px-6 py-3 font-medium flex items-center gap-2 hover:bg-gray-100 transition-all"
          >
            Tonton Sekarang <span>&gt;</span>
          </button>
        </div>
      </div>
      
      {/* (Modal Video tetap sama seperti kode sebelumnya...) */}
    </section>
  );
}