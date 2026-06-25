import React from 'react';
import { Handle, Position } from 'reactflow';

export default function SymptomNode({ data }: { data: { label: string; details: string } }) {
  return (
    <div className="symptom-node-style px-4 py-2 rounded-md min-w-[150px]">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="flex flex-col">
        <div className="text-xs font-bold text-blue-800 uppercase tracking-wider">Gejala</div>
        <div className="text-sm font-medium text-blue-950">{data.label}</div>
        <div className="text-[10px] text-blue-600 mt-1">{data.details}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500" />
    </div>
  );
}