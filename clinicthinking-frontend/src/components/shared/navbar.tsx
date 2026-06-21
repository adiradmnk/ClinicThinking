"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from 'next/link';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fungsi untuk class glass
  const glassStyle = isScrolled 
    ? "bg-white/10 backdrop-blur-md border border-white/20 shadow-lg" 
    : "bg-transparent border-transparent";

  return (
    <motion.nav 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 pt-4 pointer-events-none"
    >
      {/* 1. LOGO (Kiri) */}
      <div className="flex font-serif text-black items-center h-[50px] pointer-events-auto"> 
        Clinic Thinking
      </div>

      {/* 2. MENU (Tengah - Terpisah) */}
      <div className={`flex items-center gap-8 px-8 h-[50px] rounded-full transition-all duration-500 pointer-events-auto ${glassStyle}`}>
        <Link href="/about" className="text-sm font-serif text-black hover:text-black/50 transition">About</Link>
        <Link href="/product" className="text-sm font-serif text-black hover:text-black/50 transition">Product</Link>
        <Link href="/team" className="text-sm font-serif text-black hover:text-black/50 transition">Team</Link>
      </div>

      {/* 3. LOGIN (Kanan - Terpisah dengan efek Glass sendiri) */}
      <Link 
        href="/auth/login" 
        className={`flex items-center px-6 h-[50px] rounded-full transition-all duration-500 pointer-events-auto text-sm font-serif text-black hover:bg-black/5 ${glassStyle}`}
      >
        Login
      </Link>
    </motion.nav>
  );
}