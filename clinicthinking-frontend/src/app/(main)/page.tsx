"use client";
import { useState } from "react";
import { Navbar, NavBody, NavItems, NavbarLogo, NavbarButton, MobileNav, MobileNavHeader, MobileNavToggle, MobileNavMenu } from "@/components/ui/resizable-navbar";
import Footer from "@/components/shared/footer";
import Hero from "@/components/landing/Hero";
import ProductShowcase from "@/components/landing/ProductShowcase";
import ReviewSlider from "@/components/landing/ReviewSlider";
import { FeaturesBento } from "@/components/landing/FeaturesBento";
import Team from "@/components/landing/team";
import DemoVideo from "@/components/landing/DemoVideo";
import ReadyToLearn from "@/components/landing/ReadyToLearn";
import Trustedn from "@/components/landing/TrustedBy";


export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const navItems = [
    { name: "About", link: "#about" },
    { name: "Product", link: "#product" },
    { name: "Team", link: "#team" },
  ];
  return (
    <main className="text-black font-serif"> {/* Tambahkan background gelap sebagai base */}
      <Navbar>
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <NavbarButton variant="primary">Login</NavbarButton>
        </NavBody>
        
        {/* Mobile View */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
          </MobileNavHeader>
          <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
            {navItems.map((item) => (
               <a key={item.name} href={item.link} className="px-4 py-2 text-black dark:text-white">{item.name}</a>
            ))}
            <NavbarButton variant="dark" className="w-full">Login</NavbarButton>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      {/* Wrapper untuk Efek Background Memudar */}
      <div className="relative w-full">
        {/* Gambar Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center h-[100vh]" 
          style={{ backgroundImage: "url('/mintsky.png')" }} 
        />
        
        {/* Gradasi Overlay (Fade to bottom) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#e8f1f2]/60 to-[#e8f1f2] h-[100vh]" />

        {/* Konten Hero */}
        <div className="relative z-10">
          
          <Hero />
        </div>
      </div>

      {/* Sisa konten (berada di bawah background) */}
      <div className="relative z-10">
        <ProductShowcase />
        <Trustedn />
        <div id="product"><FeaturesBento /></div>
        <DemoVideo />
        <ReviewSlider />
        <div id="team"><Team /></div>
        <Footer />
        <ReadyToLearn />
        
      </div>
    </main>
  );
}