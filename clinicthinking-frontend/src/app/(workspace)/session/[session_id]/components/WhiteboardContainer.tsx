"use client";
import React, { useEffect } from 'react';
import ReactFlow from 'reactflow';
import 'reactflow/dist/style.css';

import { useWhiteboardStore } from '@/store/useWhiteboardStore';
import WhiteboardOverlay from './WhiteboardOverlay';
import { ClinicalNode } from './customNodes/ClinicalNode';
import { useLocalParticipant } from '@livekit/components-react';

const nodeTypes = { clinicalNode: ClinicalNode };

/**
 * WhiteboardContainer: Menampilkan whiteboard ReactFlow.
 * 
 * Tombol mic dipindah ke ChatPanel agar UI lebih terpadu.
 * Komponen ini murni menampilkan graph klinis.
 * 
 * MicStatusSync tetap di sini karena membutuhkan LiveKit context
 * untuk mensinkronkan status hardware mic ke parent.
 */
export default function WhiteboardContainer({
  sessionId,
  onMicStatusChange,
  isMicOn,
}: {
  sessionId: string;
  onMicStatusChange?: (enabled: boolean) => void;
  isMicOn: boolean;
}) {
  const { nodes, edges, onNodesChange, onEdgesChange } = useWhiteboardStore();

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden">
      {/* Sinkronisasi status mic hardware ke state parent */}
      <MicStatusSync onMicStatusChange={onMicStatusChange} />

      {/* Overlay (hints, bias alerts) */}
      <WhiteboardOverlay isLoading={false} />

      {/* Whiteboard graph */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        style={{ background: 'linear-gradient(180deg, #e8f8f5 0%, #d1f2eb 100%)' }}
        panOnDrag={true}        // Diaktifkan agar whiteboard bisa digeser (infinite canvas)
        zoomOnScroll={true}     // Diaktifkan agar bisa zoom out/in menggunakan scroll
        zoomOnPinch={true}      // Diaktifkan agar bisa zoom out/in menggunakan trackpad pinch
        nodesDraggable={true}   // Diaktifkan agar mahasiswa bisa memindahkan posisi node sesuka hati
        nodesConnectable={false}
        elementsSelectable={true}
        fitView
        fitViewOptions={{ padding: 0.2 }}
      >
        {/* Autocenter focus & camera sliding effect */}
        <CanvasAutocenter nodes={nodes} />

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
            </div>
          </div>
        )}
      </ReactFlow>
    </div>
  );
}

import { useReactFlow, Node } from 'reactflow';

/**
 * CanvasAutocenter: Efek transisi otomatis memfokuskan kamera (ngeslide)
 * ke node terbaru yang ditambahkan dengan animasi smooth.
 */
function CanvasAutocenter({ nodes }: { nodes: Node[] }) {
  const { setCenter, fitView } = useReactFlow();

  useEffect(() => {
    if (nodes.length === 0) return;

    // Ambil node terbaru berdasarkan indeks/addedAtTurn tertinggi
    const latestNode = nodes[nodes.length - 1];
    if (latestNode && latestNode.position) {
      console.log(`[Whiteboard-Autocenter] Memfokuskan kamera ke node baru: ${latestNode.id}`);
      
      // Animasi geser (slide) kamera ke koordinat node baru, dengan zoom level 1.1x
      setCenter(latestNode.position.x + 90, latestNode.position.y + 50, {
        zoom: 1.0,
        duration: 800, // 800ms durasi transisi meluncur (slide)
      });

      // Opsional: Setelah meluncur ke node baru, buat jeda sedikit lalu panggil fitView
      // agar seluruh node tetap muat terlihat di layar
      const timer = setTimeout(() => {
        fitView({ duration: 800, padding: 0.25 });
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [nodes, setCenter, fitView]);

  return null;
}

/**
 * MicStatusSync: Menyinkronkan status mic hardware LiveKit ke state parent.
 * Harus dipasang di dalam LiveKitRoom context.
 */
function MicStatusSync({ onMicStatusChange }: { onMicStatusChange?: (enabled: boolean) => void }) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (!localParticipant) return;

    const updateMicStatus = () => {
      onMicStatusChange?.(localParticipant.isMicrophoneEnabled);
    };

    updateMicStatus();

    localParticipant.on('trackMuted', updateMicStatus);
    localParticipant.on('trackUnmuted', updateMicStatus);
    localParticipant.on('trackPublished', updateMicStatus);
    localParticipant.on('trackUnpublished', updateMicStatus);

    return () => {
      localParticipant.off('trackMuted', updateMicStatus);
      localParticipant.off('trackUnmuted', updateMicStatus);
      localParticipant.off('trackPublished', updateMicStatus);
      localParticipant.off('trackUnpublished', updateMicStatus);
    };
  }, [localParticipant, onMicStatusChange]);

  return null;
}