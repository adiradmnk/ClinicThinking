"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    // TODO: sambungin ke backend nanti
    // const res = await fetch("http://localhost:8000/auth/forgot-password", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ email }),
    // });
    // const data = await res.json();
    // if (res.ok) {
    //   setSent(true);
    // } else {
    //   alert(data.message);
    // }

    console.log("Forgot password untuk:", email);
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-100">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-teal-700">Clinic Thinking</h1>
          <p className="text-gray-500 text-sm mt-1">Reset password</p>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Link reset password udah dikirim ke{" "}
              <span className="font-semibold">{email}</span>. Cek email kamu ya!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Kirim Link Reset"}
            </button>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Ingat password?{" "}
          <Link href="/auth/login" className="text-teal-600 font-medium hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}