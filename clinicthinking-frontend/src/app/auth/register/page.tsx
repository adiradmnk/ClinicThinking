"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { INSTITUTIONS } from "@/lib/institutions";

/* ──────────────────────────────────────────────
   Typewriter
────────────────────────────────────────────── */
function Typewriter({ text, speed = 60 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    setDisplayed("");
    setIdx(0);
  }, [text]);

  useEffect(() => {
    if (idx >= text.length) return;
    const t = setTimeout(() => {
      setDisplayed((p) => p + text[idx]);
      setIdx((p) => p + 1);
    }, speed);
    return () => clearTimeout(t);
  }, [idx, text, speed]);

  return (
    <span>
      {displayed}
      <span className="animate-pulse opacity-70">|</span>
    </span>
  );
}

/* ──────────────────────────────────────────────
   PasswordField
────────────────────────────────────────────── */
function PasswordField({
  value,
  onChange,
  placeholder = "••••••••",
  autoComplete = "new-password",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all placeholder:text-slate-400 pe-10"
      />
      <button
        type="button"
        onClick={() => setShow((p) => !p)}
        className="absolute inset-y-0 right-0 w-10 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Right Panel (image + quote)
────────────────────────────────────────────── */
function ImagePanel({ src, quote }: { src: string; quote: string }) {
  return (
    <div
      className="hidden lg:block relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to left, transparent 0%, black 35%)",
        WebkitMaskImage: "linear-gradient(to left, transparent 0%, black 35%)",
      }}
    >
      <Image
        src={src}
        alt="ClinicThinking visual"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute bottom-0 inset-x-0 px-10 pb-10 z-10 text-right">
        <p className="text-slate-800 text-lg font-semibold leading-snug">
          "<Typewriter text={quote} speed={55} />"
        </p>
        <cite className="block mt-2 text-xs text-slate-500 not-italic tracking-wide">
          — ClinicThinking
        </cite>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Label helper
────────────────────────────────────────────── */
function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
      {children}
    </label>
  );
}

const inputCls =
  "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all placeholder:text-slate-400";

/* ──────────────────────────────────────────────
   Register Page
────────────────────────────────────────────── */
export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
        institution,
        cohort_year: null,
      });
      if (res.success) {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2000);
      } else {
        setError(res.error?.message || "Registrasi gagal. Coba lagi.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1fr_1fr] bg-white">
      {/* ── LEFT: Image Panel ── */}
      <ImagePanel
        src="/mintsky.png"
        quote="Mulailah perjalananmu. Setiap langkah kecil membentuk dokter yang luar biasa."
      />

      {/* ── RIGHT: Form ── */}
      <div className="flex flex-col items-center justify-center px-8 py-16 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="mb-10">
            <span className="font-serif text-black dark:text-white">Clinic Thinking</span>
            <h1 className="font-serif mt-3 text-2xl font-bold text-slate-800 leading-tight">
              Buat akun baru
            </h1>
            <p className="font-serif mt-1.5 text-sm text-slate-500">
              Daftarkan diri dan mulai simulasi OSCE pertamamu
            </p>
          </div>

          {/* Success state */}
          {success ? (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-serif text-sm font-semibold text-teal-700">Akun berhasil dibuat!</p>
              <p className="font-serif text-xs text-slate-500 mt-1">Mengarahkan ke halaman login...</p>
            </div>
          ) : (
            <form onSubmit={handleRegister} autoComplete="on" className="font-serif space-y-4">
              <div>
                <FieldLabel htmlFor="name">Nama Lengkap</FieldLabel>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="dr. Budi Santoso"
                  autoComplete="name"
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
                  className={inputCls}
                />
              </div>

              <div>
                <FieldLabel htmlFor="institution">Institusi / Fakultas Kedokteran</FieldLabel>
                <select
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  required
                  className={`${inputCls} appearance-none bg-no-repeat bg-[right_1rem_center] bg-[length:1em_1em] cursor-pointer`}
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`
                  }}
                >
                  <option value="" disabled className="text-slate-400">Pilih Institusi...</option>
                  {INSTITUTIONS.map((inst) => (
                    <option key={inst} value={inst}>
                      {inst}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <FieldLabel>Password</FieldLabel>
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  autoComplete="new-password"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-[.98] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-teal-500/20 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Mendaftar...
                  </>
                ) : (
                  <>
                    Daftar Sekarang
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle link */}
          {!success && (
            <p className="font-serif mt-8 text-center text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link
                href="/auth/login"
                className="text-teal-600 font-semibold hover:underline"
              >
                Masuk di sini
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}