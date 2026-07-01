'use client';
import { useLocalParticipant } from '@livekit/components-react';
import { Mic, MicOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export const MicrophoneButton = () => {
  const { localParticipant } = useLocalParticipant();
  // State lokal untuk memaksa update UI
  const [isMicOn, setIsMicOn] = useState(false);

  useEffect(() => {
    if (!localParticipant) return;
    
    // Fungsi sinkronisasi status
    const update = () => setIsMicOn(localParticipant.isMicrophoneEnabled);
    
    // Update saat pertama kali render
    update();
    
    // Pasang listener untuk setiap perubahan track
    localParticipant.on('trackMuted', update);
    localParticipant.on('trackUnmuted', update);
    
    return () => {
      localParticipant.off('trackMuted', update);
      localParticipant.off('trackUnmuted', update);
    };
  }, [localParticipant]);

  return (
    <button 
      onClick={() => localParticipant?.setMicrophoneEnabled(!isMicOn)}
      className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg border transition-all ${
        isMicOn ? 'bg-white text-gray-700' : 'bg-red-500 text-white border-red-600'
      }`}
    >
      {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
    </button>
  );
};