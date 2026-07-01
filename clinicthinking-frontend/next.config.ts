const nextConfig = {
  typescript: {
    // !! PERINGATAN: Ini mematikan pengecekan tipe saat build !!
    // Hanya gunakan jika kamu yakin kodenya sudah benar
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

export default nextConfig;