"use client";
import { motion } from "framer-motion";

export default function TrustedBy() {
  const universities = [
    { name: "UI", logo: "/logos/fkui.png" },
    { name: "UGM", logo: "/logos/ugm.png" },
    { name: "UNAIR", logo: "/logos/unair.png" },
    { name: "UNPAD", logo: "/logos/unpad.png" },
    { name: "UNDIP", logo: "/logos/undip.png" },
  ];

  // Kita gandakan array-nya agar panjang dan mulus saat looping
  const duplicatedUniversities = [...universities, ...universities, ...universities];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto overflow-hidden">
      <p className="text-center text-xs font-serif opacity-50 tracking-widest mb-10">
        DIGUNAKAN OLEH MAHASISWA KEDOKTERAN DARI
      </p>
      
      <div className="flex w-full overflow-hidden mask-fade">
        <motion.div 
          className="flex gap-x-16 items-center"
          animate={{ x: ["0%", "-33.33%"] }} // Kita geser hanya sepertiga karena data sudah diduplikasi 3x
          transition={{ 
            ease: "linear", 
            duration: 30, // Kecepatan konstan
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          {duplicatedUniversities.map((uni, idx) => (
            <div key={idx} className="h-10 w-auto flex-shrink-0 grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300">
              <img 
                src={uni.logo} 
                alt={uni.name} 
                className="h-full w-auto object-contain" 
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}