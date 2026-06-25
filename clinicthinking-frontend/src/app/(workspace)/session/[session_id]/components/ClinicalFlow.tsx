"use client";

import React, { useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  ConnectionMode,
  applyNodeChanges, 
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  NodeTypes
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWhiteboardStore } from '@/store/useWhiteboardStore';
import SymptomNode from './customNodes/SymptomNode';
import DiagnosisNode from './customNodes/DiagnosisNode';

const nodeTypes: NodeTypes = {
  symptom: SymptomNode,
  diagnosis: DiagnosisNode,
};

export default function ClinicalFlow() {
    const { nodes, onNodesChange: storeOnNodesChange } = useWhiteboardStore();
    const { edges, onEdgesChange: storeOnEdgesChange } = useWhiteboardStore();

    const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
        storeOnNodesChange(changes); 
    },
    [storeOnNodesChange]
    );

    const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
        storeOnEdgesChange(changes);
    },
    [storeOnEdgesChange]
    );

  return (
    <div className="w-full h-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes} 
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        connectionMode={ConnectionMode.Loose}
        fitView
        defaultEdgeOptions={{ type: 'smoothstep', animated: true }}
      >
        <Background gap={20} size={1} color="#CBD5E1" />
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            if (n.type === 'symptom') return '#3B82F6';
            if (n.type === 'diagnosis') return '#EF4444';
            return '#64748B';
          }}
          maskColor="rgba(241, 245, 249, 0.6)"
        />
      </ReactFlow>
    </div>
  );
}