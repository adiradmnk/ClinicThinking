import React from "react";
import Script from 'next/script'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-surface/50">
      <main className="flex-grow flex items-center justify-center px-6">
        {/* Konten Register/Login */}
        <div className="w-full max-w-md">
          {children}
          <Script 
            src="https://accounts.google.com/gsi/client" 
            strategy="afterInteractive" 
          />
        </div>
      </main>

    </div>
  );
}

