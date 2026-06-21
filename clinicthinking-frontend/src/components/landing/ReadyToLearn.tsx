"use client";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";

export default function ReadyToLearn() {
  return (
    <section className="py-3 text-center flex flex-col items-center overflow-hidden">
      {/* mask-image linear-gradient membuat teks memudar ke bawah.
        black_40% artinya 40% bagian atas teks tetap solid.
        transparent_100% artinya bagian bawah teks perlahan menghilang.
      */}
      <div className="w-full px-0 [mask-image:linear-gradient(to_bottom,black_20%,transparent_75%)]"> 
        <TextHoverEffect text="CLINIC THINKING" duration={0.3} />
      </div>
    </section>
  );
}