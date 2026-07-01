import Link from "next/link";
export default function Footer() {
  return (
    <footer className="">
      <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        
        {/* Brand Info - Diberi ruang lebih */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tighter">Clinic Thinking</h2>
          <p className="text-sm text-neutral-500 max-w-sm leading-relaxed">
            Membangun generasi dokter masa depan dengan penalaran klinis yang tajam, berbasis bukti, dan presisi.
          </p>
        </div>

        {/* Links */}
        <div className="space-y-4">
          <h3 className="font-semibold text-neutral-900">Platform</h3>
          <ul className="space-y-3 text-sm text-neutral-500">
            <Link href="/auth/login" className="hover:text-black transition cursor-pointer">Login</Link>
            <li className=""></li>
            <Link href="/auth/register" className="hover:text-black transition cursor-pointer">Register</Link>
            <li className=""></li>
            <Link href="/product" className="hover:text-black transition cursor-pointer">Product</Link>
          </ul>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="font-semibold text-neutral-900">Kontak</h3>
          <p className="text-sm text-neutral-500 hover:text-black transition">tim@clinicthinking.com</p>
          <div className="flex gap-4 pt-2">
            {/* Tambahkan ikon sosial media di sini jika perlu */}
            <span className="text-xs text-neutral-400">© 2026 ClinicThinking</span>
          </div>
        </div>
      </div>
    </footer>
  );
}