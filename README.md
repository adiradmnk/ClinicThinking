# ClinicThinking - Frontend Client (OSCE Simulator)

ClinicThinking adalah platform simulator simulasi ujian OSCE (Objective Structured Clinical Examination) interaktif berbasis AI untuk mahasiswa kedokteran. Repositori ini berisi aplikasi client-side/frontend yang dibangun menggunakan **Next.js** dan memanfaatkan teknologi **WebRTC** untuk komunikasi suara real-time.

## Fitur Utama
- **Interactive Voice Chat Panel**: Berinteraksi langsung dengan pasien simulasi bertenaga AI menggunakan suara (voice-to-voice) dengan deteksi keheningan (silence detection) otomatis.
- **Infinite Whiteboard Canvas**: Visualisasi peta penalaran klinis (*clinical reasoning map*) menggunakan ReactFlow untuk menghubungkan Temuan Klinis (*findings*), Faktor Risiko (*risk factors*), Gejala (*symptoms*), dan Hipotesis Diagnostik (*hypotheses*).
- **Real-Time Bias & Hint Alert**: Notifikasi instan saat sistem mendeteksi bias berpikir kognitif mahasiswa (seperti *Premature Closure* dan *Anchoring Bias*).
- **SCT (Script Concordance Test) Module**: Evaluasi berbasis skenario Likert untuk menilai kesesuaian penalaran klinis mahasiswa terhadap panel ahli medis secara dinamis.
- **DTI (Diagnostic Thinking Inventory) Survey**: Kuesioner komprehensif pasca-simulasi untuk mengukur fleksibilitas berpikir dan struktur pengetahuan klinis.

## Teknologi & Library
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Vanilla CSS & Tailwind CSS (desain Bento-glassmorphism premium)
- **State Management**: Zustand (untuk whiteboard sync dan audio status)
- **WebRTC Client**: LiveKit Components React (`@livekit/components-react`)
- **Graphing**: ReactFlow (Infinite canvas whiteboard)
- **Icons**: Lucide React

## Persyaratan Sistem
- Node.js v20.x atau lebih baru
- Docker & Docker Compose (untuk menjalankan ekosistem lokal)

## Memulai Pengembangan Lokal

1. Clone repositori ini:
   ```bash
   git clone https://github.com/adiradmnk/ClinicThinking.git
   cd ClinicThinking/clinicthinking-frontend
   ```

2. Install dependency:
   ```bash
   npm install --legacy-peer-deps
   ```

3. Setup environment variables (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8081
   NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
   LIVEKIT_API_KEY=devkey
   LIVEKIT_API_SECRET=devsecret
   ```

4. Jalankan dev server:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

## Alur Kerja CI/CD (Deployment)
Repositori ini telah dikonfigurasi menggunakan **GitHub Actions** untuk deployment otomatis ke server VPS target via SSH. Setiap push ke branch `main` akan memicu penarikan kode terbaru dan me-rebuild docker container secara otomatis.

Pastikan Anda telah mendaftarkan variabel rahasia berikut di GitHub Secrets Anda:
- `VPS_HOST` (IP Publik VPS)
- `VPS_USER` (User login VPS, e.g., `root`)
- `VPS_SSH_KEY` (Kunci SSH Private)
