"use client";

import { Mail} from "lucide-react";

// Definisi interface untuk menghindari error 'any'
interface TeamMember {
  name: string;
  role: string;
  bio: string;
}

// Data tim dengan tipe data yang jelas
const team: TeamMember[] = [
  {
    name: "Adriana Ainurrahmah Damanik",
    role: "Tech",
    bio: "",
  },
  {
    name: "Dyah Zafira Wibowo",
    role: "Project Leader",
    bio: "",
  },
  {
    name: "Nadya Sekar",
    role: "Tech",
    bio: "",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-serif font-bold text-center mb-16">Our Developer</h2>
        
        {/* Layout grid yang rapi dan benar penulisannya */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {team.map((member) => (
            <div key={member.name} className="group flex flex-col items-center text-center">
              {/* Foto placeholder */}
              <div className="w-24 h-24 rounded-full bg-neutral-200 mb-6 transition-transform group-hover:scale-105" />
              
              <h3 className="text-lg font-bold mb-1">{member.name}</h3>
              <p className="text-sm text-black-600 mb-4 font-medium">{member.role}</p>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
                {member.bio}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}