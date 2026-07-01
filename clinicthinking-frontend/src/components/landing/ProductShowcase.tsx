import { Safari } from "@/components/ui/safari";

export default function ProductShowcase() {
  return (
    <section className="py-16 px-6 max-w-5xl mx-auto">
      {/* Container utama dengan efek floating */}
      <div className="relative">
        
        {/* Menggunakan komponen Safari sebagai mockup */}
        <Safari 
          url="clinicthinking.com"// Pastikan gambar ini ada di folder public
          className="shadow-2xl rounded-xl"
          videoSrc="/video/productdemo.mov"
        />
        
      </div>
    </section>
  );
}