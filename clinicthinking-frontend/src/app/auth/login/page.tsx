"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  autoComplete = "current-password",
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
        maskImage: "linear-gradient(to right, transparent 0%, black 35%)",
        WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 35%)",
      }}
    >
      <Image
        src={src}
        alt="ClinicThinking visual"
        fill
        className="object-cover object-center"
        priority
      />
      {/* bottom quote — sits outside mask so it stays fully visible */}
      <div className="absolute bottom-0 inset-x-0 px-10 pb-10 z-10">
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

/* ──────────────────────────────────────────────
   Input style helper
────────────────────────────────────────────── */
const inputCls =
  "w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400 transition-all placeholder:text-slate-400";

/* ──────────────────────────────────────────────
   Login Page
────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post<{ token: string }>("/api/auth/login", { email, password });
      if (res.success && res.data) {
        localStorage.setItem("token", res.data.token);
        router.push("/dashboard");
      } else {
        setError(res.error?.message || "Login gagal. Periksa kembali email dan password.");
      }
    } catch {
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1fr_1fr] bg-white">
      {/* ── LEFT: Form ── */}
      <div className="flex flex-col items-center justify-center px-8 py-16 lg:px-16">
        <div className="w-full max-w-sm">
          {/* Logo / Brand */}
          <div className="mb-10">
            <span className="font-serif text-black dark:text-white">Clinic Thinking</span>
            <h1 className="font-serif mt-6 text-2xl font-bold text-slate-800 leading-tight">
              Selamat datang kembali
            </h1>
            <p className="font-serif mt-1.5 text-sm text-slate-500">
              Masuk untuk melanjutkan sesi simulasi Anda
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} autoComplete="on" className="font-serif space-y-5">
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
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <PasswordField
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
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
              className="font-serif w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 active:scale-[.98] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 shadow-lg shadow-teal-500/20"
            >
              {loading ? (
                <>
                  <div className="font-serif w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle link */}
          <p className="font-serif mt-8 text-center text-sm text-slate-500">
            Belum punya akun?{" "}
            <Link
              href="/auth/register"
              className="text-teal-600 font-semibold hover:underline"
            >
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>

      {/* ── RIGHT: Image Panel ── */}
      <ImagePanel
        src="/mintoceon.png"
        quote="Setiap pasien adalah cerita. Setiap diagnosis adalah pemahaman yang lebih dalam."
      />
    </div>
  );
}