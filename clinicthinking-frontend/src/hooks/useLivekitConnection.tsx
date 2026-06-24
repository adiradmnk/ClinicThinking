"use client";

import { useEffect, useRef } from 'react';
import { Room, RoomEvent, Participant, DataPacket_Kind } from 'livekit-client';
import { useWhiteboardStore, WhiteboardAction } from '@/store/useWhiteboardStore'; // Pastikan path benar
import { parseAiData } from '@/lib/data-parser';

export const useLiveKitConnection = (url: string, token: string, sessionId: string) => {
  const { processAiAction } = useWhiteboardStore();
  // Gunakan useRef untuk menyimpan instance room agar stabil
  const roomRef = useRef<Room | null>(null);

  useEffect(() => {
    const room = new Room();
    roomRef.current = room;

    const connect = async () => {
      try {
        await room.connect(url, token);
        console.log("LiveKit connected to session:", sessionId);

        room.on(RoomEvent.DataReceived, (
            payload: Uint8Array, 
            _participant?: Participant, 
            _kind?: DataPacket_Kind
        ) => {
          const decoder = new TextDecoder();
          const strData = decoder.decode(payload);
          const action = parseAiData(strData);

          // Pastikan action valid dan sessionId cocok
          if (action && action.sessionId === sessionId) {
            /** * TYPE GUARD: 
             * Kita konversi action dari parser menjadi WhiteboardAction 
             * yang dikenal oleh Zustand store kita.
             */
            processAiAction(action as unknown as WhiteboardAction);
          }
        });
      } catch (e) {
        console.error("LiveKit connection error:", e);
      }
    };

    connect();

    // Cleanup: Pastikan disconnect dipanggil saat unmount
    return () => { 
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
    };
  }, [url, token, sessionId, processAiAction]);

  return { room: roomRef.current }; 
};