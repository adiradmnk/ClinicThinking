"use client";

import { useEffect, useRef } from 'react';
import { Room, RoomEvent, Participant, DataPacket_Kind } from 'livekit-client';
import { useWhiteboardStore, WhiteboardAction } from '@/store/useWhiteboardStore'; // Pastikan path benar
import { parseAiData } from '@/lib/data-parser';

export const useLiveKitConnection = (url: string, token: string, sessionId: string) => {
  const { processAiAction } = useWhiteboardStore();
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    // 1. Inisialisasi Room
    const room = new Room();
    roomRef.current = room;

    const handleDataReceived = (payload: Uint8Array) => {
      const decoder = new TextDecoder();
      const strData = decoder.decode(payload);
      
      // 1. Parse string JSON menjadi object biasa (any) terlebih dahulu
      const rawData = JSON.parse(strData);
      
      // 2. Lakukan pengecekan sessionId (sesuai logika kamu sebelumnya)
      // Catatan: Pastikan AI kamu juga mengirimkan sessionId di dalam payload JSON-nya
      if (rawData && (rawData.sessionId === sessionId || !rawData.sessionId)) {
        
        // 3. Kirim bagian 'actions' ke store whiteboard kamu
        if (rawData.actions) {
          processAiAction(rawData as unknown as WhiteboardAction);
        }

        // 4. Ambil properti 'text' dengan aman untuk Web Speech API (TTS)
        if (rawData.text) {
          const speech = new SpeechSynthesisUtterance(rawData.text);
          speech.lang = 'id-ID'; // Set suara Bahasa Indonesia
          speech.rate = 1.0;     // Kecepatan bicara normal
          window.speechSynthesis.speak(speech);
        }
      }
    };

    // 3. Pasang listener SEBELUM koneksi
    room.on(RoomEvent.DataReceived, handleDataReceived);

    // 4. Koneksi
    const connect = async () => {
      try {
        await room.connect(url, token);
        console.log("LiveKit connected to session:", sessionId);
      } catch (e) {
        console.error("LiveKit connection error:", e);
      }
    };

    connect();

    // 5. Cleanup yang rapi
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived); // Hapus listener
      room.disconnect();                                     // Putus koneksi
      roomRef.current = null;
    };
  }, [url, token, sessionId, processAiAction]);

  return { room: roomRef.current }; 
};