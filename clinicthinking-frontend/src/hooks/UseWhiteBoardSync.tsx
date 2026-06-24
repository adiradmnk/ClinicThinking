"use client";

import { useEffect, useRef } from 'react';
import { useWhiteboardStore } from '@/store/useWhiteboardStore';


export const useWhiteboardSync = (sessionId: string) => {
  const { nodes, edges } = useWhiteboardStore();
  const isInitialized = useRef(false);

  useEffect(() => {
    const savedData = localStorage.getItem(`whiteboard-${sessionId}`);
    if (savedData && !isInitialized.current) {
      const { savedNodes, savedEdges } = JSON.parse(savedData);
      useWhiteboardStore.getState().onNodesChange(savedNodes);
      useWhiteboardStore.getState().onEdgesChange(savedEdges);
      isInitialized.current = true;
    }
  }, [sessionId]);

  useEffect(() => {
    if (nodes.length > 0 || edges.length > 0) {
      localStorage.setItem(
        `whiteboard-${sessionId}`, 
        JSON.stringify({ savedNodes: nodes, savedEdges: edges })
      );
    }
  }, [nodes, edges, sessionId]);
};