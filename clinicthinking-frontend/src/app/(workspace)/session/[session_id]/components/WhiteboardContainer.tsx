"use client";
import React, { useEffect } from 'react';
import ReactFlow, { Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useWhiteboardStore } from '@/store/useWhiteboardStore';
import { useWhiteboardSync } from '@/hooks/UseWhiteBoardSync'; // Import sync
import { useLiveKitConnection } from '@/hooks/useLivekitConnection'; // Import connection
import WhiteboardOverlay from './WhiteboardOverlay';

export default function WhiteboardContainer({ sessionId }: { sessionId: string }) {
  const { nodes, edges, onNodesChange, onEdgesChange, initSession } = useWhiteboardStore();
  
  // Sinkronisasi data ke localStorage
  useWhiteboardSync(sessionId);
  
  // Koneksi ke AI (Token biasanya didapat dari API internal)
  useLiveKitConnection(process.env.NEXT_PUBLIC_LIVEKIT_URL!, "YOUR_TOKEN", sessionId);

  useEffect(() => {
    initSession(sessionId);
  }, [sessionId, initSession]);

  return (
    <div className="relative w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden bg-white">
      <WhiteboardOverlay isLoading={false} />
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={(changes) => onNodesChange(changes)}
        onEdgesChange={(changes) => onEdgesChange(changes)}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
}