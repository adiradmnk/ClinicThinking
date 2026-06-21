import { MorphingText } from "@/components/ui/morphing-text";

export default function Hero() {
  const texts = ["DIAGNOSIS", "PROGNOSIS", "PEMIKIRAN"];

  return (
    <section id="about" className="pt-45 pb-0 px-6 text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Judul dengan teks statis di kiri dan morphing di kanan */}
        <h1 className="text-4xl md:text-5xl font-serif text-black leading-tight mb-6">
          Asah Penalaran Klinis dengan AI, <br/>
          Tingkatkan akurasi<span className="text-black-600">
             {/* Container MorphingText */}
             <div className="inline-block align-middle w-[295px] h-[60px]">
               <MorphingText texts={texts} />
             </div>
          </span>
        </h1>
        
        {/* Penjelasan */}
        <p className="text-lg font-serif text-black/70 mb-10 max-w-xl mx-auto">
          Simulasi Klinis Berbasis AI untuk Dokter Masa Depan
        </p>

      </div>
    </section>
  );
}