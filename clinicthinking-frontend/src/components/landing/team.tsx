"use client";

import React from "react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import {
  Cpu,
  Server,
  Lightbulb,
  Stethoscope,
} from "lucide-react";

/* ─────────────────────────────────────────────
   LinkedIn SVG inline
───────────────────────────────────────────── */
const LinkedinIcon = () => (
  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

/* ─────────────────────────────────────────────
   Card background — full-bleed photo with
   a persistent gradient scrim and a hover
   overlay that reveals role + LinkedIn
───────────────────────────────────────────── */
function MemberBackground({
  photo,
  name,
  role,
  linkedin,
  color,
  initials,
  photoStyle,
}: {
  photo: string | null;
  name: string;
  role: string;
  linkedin?: string;
  color: string;
  initials: string;
  photoStyle?: React.CSSProperties;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* ── Photo / Placeholder ── */}
      {photo ? (
        <img
          src={photo}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={photoStyle}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center ${color} transition-transform duration-700 group-hover:scale-105`}
        >
          <span className="text-white text-6xl font-black tracking-tight select-none opacity-20">
            {initials}
          </span>
        </div>
      )}

      {/* ── Static scrim (always) ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

    </div>
  );
}

/* ─────────────────────────────────────────────
   Team data
   Ganti photo: null → "/photos/nama.jpg" kalau sudah ada
───────────────────────────────────────────── */
const team = [
  {
    name: "Adriana Ainurrahmah Damanik",
    role: "AI Engineer",
    description: "Sistem reasoning AI & pipeline TTS/STT real-time.",
    photo: "/profile/adira.jpeg",
    linkedin: "https://www.linkedin.com/in/adriana-damanik",
    color: "bg-teal-600",
    initials: "AD",
    Icon: Cpu,
    photoStyle: {
      objectPosition: "center 47%", 
      transform: "scale(1.0)",     
    } as React.CSSProperties,
  },
  {
    name: "Dyah Zafira Wibowo",
    role: "Backend Engineer",
    description: "API, database schema, dan infrastruktur sesi simulasi.",
    photo: "/profile/dyah.png",
    linkedin: "#",
    color: "bg-sky-600",
    initials: "DZ",
    Icon: Server,
  },
  {
    name: "Nadya Sekar",
    role: "Product Manager",
    description: "Menjembatani kebutuhan klinis dengan roadmap produk.",
    photo: "/profile/nadya.jpeg",
    linkedin: "#",
    color: "bg-violet-600",
    initials: "NS",
    Icon: Lightbulb,
  },
  {
    name: "Pasya Abhinaya Arrafi",
    role: "Field Expert",
    description: "Validasi klinis skenario OSCE dan standar tata laksana.",
    photo: "/profile/pasya.png",
    linkedin: "#",
    color: "bg-emerald-600",
    initials: "FE",
    Icon: Stethoscope,
  },
];

/* ─────────────────────────────────────────────
   Section
───────────────────────────────────────────── */
export default function TeamSection() {
  return (
    <section id="team" className="w-full py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="mb-10">
          <span className="text-xl font-bold uppercase tracking-widest text-black-600">
            The People Behind It
          </span>
        </div>

        {/* 4-column bento grid */}
        <BentoGrid className="grid-cols-2 md:grid-cols-4 auto-rows-[420px] gap-4">
          {team.map((member) => (
            <BentoCard
              key={member.name}
              name={member.name}
              className="col-span-1"
              Icon={member.Icon}
              description={member.role}
              href={member.linkedin ?? "#"}
              cta="Lihat LinkedIn"
              background={
                <MemberBackground
                  photo={member.photo}
                  name={member.name}
                  role={member.role}
                  linkedin={member.linkedin}
                  color={member.color}
                  initials={member.initials}
                  photoStyle={member.photoStyle}
                />
              }
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}