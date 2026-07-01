'use client'

import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';

export default function LiveKitProvider({ 
  token, 
  children 
}: { 
  token: string; 
  children: React.ReactNode 
}) {
  return (
    <LiveKitRoom
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      token={token}
      connect={true}
      video={false}
      audio={true}
      // Tambahkan data-lk-theme agar style LiveKit terbaca lebih baik
      data-lk-theme="default" 
      style={{ display: 'contents' }} 
    >
      {children}
    </LiveKitRoom>
  );
}