"use client";

/**
 * useWhiteboardSync — DEPRECATED
 * 
 * Hook ini sebelumnya memasang listener DataReceived untuk whiteboard.
 * Setelah refactor (Bug 3 fix), semua listener DataReceived dikonsolidasikan
 * ke RoomContent di page.tsx untuk menghindari duplikasi pemrosesan pesan.
 * 
 * File ini dipertahankan untuk kompatibilitas import, tapi hook tidak melakukan apa-apa.
 * Import di WhiteboardContainer sudah dihapus.
 */
export const useWhiteboardSync = (_sessionId: string) => {
  // Tidak ada listener di sini — semuanya ada di page.tsx (RoomContent)
};