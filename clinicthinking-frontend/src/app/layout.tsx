import { Playfair_Display, Inter, Geist } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

// 1. Inisialisasi Font
const serif = Playfair_Display({ 
  subsets: ['latin'], 
  variable: '--font-serif' 
});

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // 2. Terapkan variabel font ke tag <html>
    <html lang="id" className={cn(serif.variable, "font-sans", geist.variable)}>
      {/* 3. Terapkan font default ke body (biasanya font sans) */}
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}