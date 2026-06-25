"use client";

import { useEffect } from 'react';
import { Room, RoomEvent, Participant, DataPacket_Kind } from 'livekit-client';
import { useWhiteboardStore } from '@/store/useWhiteboardStore';
import { parseAiData } from '@/lib/data-parser'; // Import parser kita

export const useLiveKitConnection = (url: string, token: string, sessionId: string) => {
  const { processAiAction } = useWhiteboardStore();

  useEffect(() => {
    const room = new Room();

    const connect = async () => {
      try {
        await room.connect(url, token);
        console.log("LiveKit connected to session:", sessionId);

        room.on(RoomEvent.DataReceived, (
            payload: Uint8Array, 
            participant?: Participant, 
            kind?: DataPacket_Kind
        ) => {
          const decoder = new TextDecoder();
          const strData = decoder.decode(payload);
          const action = parseAiData(strData);

          if (action && action.sessionId === sessionId) {
            processAiAction(action);
          }
        });
      } catch (e) {
        console.error("LiveKit connection error:", e);
      }
    };

    connect();

    return () => { 
      room.disconnect(); 
    };
  }, [url, token, sessionId, processAiAction]);

  return { room: null }; 
};