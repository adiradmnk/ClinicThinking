import React from 'react';
import { Handle, Position } from 'reactflow';

export default function DiagnosisNode({ data }: { data: { label: string; confidence: number } }) {
  return (
    <div className="diagnosis-node-style px-4 py-2 rounded-md min-w-[150px]">
      <Handle type="target" position={Position.Top} className="!bg-red-500" />
      <div className="flex flex-col">
        <div className="text-xs font-bold text-red-800 uppercase tracking-wider">Diagnosis</div>
        <div className="text-sm font-bold text-red-950">{data.label}</div>
        <div className="text-[10px] text-red-700 mt-1">Confidence: {data.confidence}%</div>
      </div>
    </div>
  );
}