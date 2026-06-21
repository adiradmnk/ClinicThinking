import Navbar from "@/components/shared/navbar";
import Footer from "@/components/shared/footer";



export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="${fingerPaint.variable} flex flex-col min-h-screen">   
        <main className="flex-grow"> 
          {children}
        </main>
      </div>
    </>
  );
}