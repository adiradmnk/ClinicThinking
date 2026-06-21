"use client";
import {
  ScrollVelocityContainer,
  ScrollVelocityRow,
} from "@/components/ui/scroll-based-velocity";

export default function ReviewSlider() {
  const reviews = [
    { name: "Dr. Budi", text: "Kasus realistis.", size: "w-[300px]" },
    { name: "Andi, Co-Ass", text: "Fitur bias detection membantu.", size: "w-[400px]" },
    { name: "Dr. Siska", text: "Reasoning map mengubah cara diagnosa.", size: "w-[350px]" },
    { name: "Budi, Mahasiswa", text: "Sangat membantu untuk ujian.", size: "w-[300px]" },
  ];

  return (
    <section className="py-20 overflow-hidden bg-[#e8f1f2]">
      <h2 className="text-4xl font-serif text-center mb-12">Apa Kata Pengguna?</h2>
      
      {/* Container utama untuk menampung dua baris */}
      <ScrollVelocityContainer className="mask-fade-horizontal flex flex-col gap-6">
        
        {/* Baris 1: Kanan ke Kiri */}
        <ScrollVelocityRow baseVelocity={5} direction={1} className="whitespace-nowrap">
          <div className="flex gap-6 px-3">
            {reviews.map((rev, i) => (
              <ReviewCard key={`top-${i}`} {...rev} />
            ))}
          </div>
        </ScrollVelocityRow>

        {/* Baris 2: Kiri ke Kanan (direction={-1}) */}
        <ScrollVelocityRow baseVelocity={5} direction={-1} className="whitespace-nowrap">
          <div className="flex gap-6 px-3">
            {reviews.map((rev, i) => (
              <ReviewCard key={`bottom-${i}`} {...rev} />
            ))}
          </div>
        </ScrollVelocityRow>

      </ScrollVelocityContainer>
    </section>
  );
}

// Komponen Card agar kode bersih
function ReviewCard({ name, text, size }: { name: string; text: string; size: string }) {
  return (
    <div className={`
      bg-white/30 backdrop-blur-md border border-white/40
      rounded-none p-8 flex flex-col justify-between shrink-0 ${size} min-h-[200px]
    `}>
      <p className="italic opacity-90 text-lg font-serif truncate">"{text}"</p>
      <p className="font-bold border-t border-black/10 pt-4 mt-auto">{name}</p>
    </div>
  );
}