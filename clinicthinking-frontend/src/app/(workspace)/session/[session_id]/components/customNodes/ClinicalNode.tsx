// frontend/src/components/whiteboard/ClinicalNode.tsx
// Custom React Flow node — tampil berbeda per tipe klinis
// Mendukung: symptom, risk_factor, hypothesis, finding, bias_flag, missing

import React, { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ClinicalNodeData, NodeCategory } from '@/store/useWhiteboardStore'

// ─── Visual Config per Node Type ─────────────────────────────────
const NODE_CONFIG: Record<NodeCategory, {
  bg: string; border: string; text: string
  icon: string; label: string
}> = {
  symptom: {
    bg: '#eff6ff', border: '#3b82f6', text: '#1e40af',
    icon: '🩺', label: 'Gejala',
  },
  risk_factor: {
    bg: '#fef9c3', border: '#eab308', text: '#854d0e',
    icon: '⚠️', label: 'Faktor Risiko',
  },
  hypothesis: {
    bg: '#f0fdf4', border: '#22c55e', text: '#14532d',
    icon: '🧠', label: 'Hipotesis',
  },
  finding: {
    bg: '#faf5ff', border: '#a855f7', text: '#581c87',
    icon: '🔬', label: 'Temuan',
  },
  missing: {
    bg: '#fff7ed', border: '#f97316', text: '#7c2d12',
    icon: '❓', label: 'Belum Digali',
  },
  bias_flag: {
    bg: '#fef2f2', border: '#ef4444', text: '#7f1d1d',
    icon: '🚨', label: 'Bias Terdeteksi',
  },
}

interface ClinicalNodeProps extends NodeProps<ClinicalNodeData> {}

export const ClinicalNode = memo(({ data, selected }: ClinicalNodeProps) => {
  const config = NODE_CONFIG[data.type] || NODE_CONFIG.finding
  const isBiased = data.isBiased
  const isHinted = data.isHinted

  return (
    <div
      style={{
        background: isBiased ? '#fef2f2' : config.bg,
        border: `2px solid ${isBiased ? '#ef4444' : isHinted ? '#f97316' : config.border}`,
        borderRadius: 10,
        padding: '8px 12px',
        minWidth: 140,
        maxWidth: 180,
        boxShadow: selected
          ? `0 0 0 3px ${config.border}40, 0 4px 12px rgba(0,0,0,0.1)`
          : isBiased
          ? '0 0 0 3px #ef444440, 0 2px 8px rgba(239,68,68,0.2)'
          : isHinted
          ? '0 0 0 3px #f9741640, 0 2px 8px rgba(249,115,22,0.2)'
          : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.25s ease',
        position: 'relative',
        animation: isHinted ? 'pulse 1.5s ease-in-out infinite' : 'none',
      }}
    >
      {/* Type badge */}
      <div style={{
        position: 'absolute',
        top: -10,
        left: 8,
        background: isBiased ? '#ef4444' : config.border,
        color: 'white',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.04em',
        padding: '1px 6px',
        borderRadius: 4,
        textTransform: 'uppercase',
      }}>
        {isBiased ? 'BIAS' : config.label}
      </div>

      {/* Icon + Label */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>{isBiased ? '🚨' : config.icon}</span>
        <span style={{
          color: isBiased ? '#7f1d1d' : config.text,
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1.4,
          fontFamily: "'Inter', sans-serif",
        }}>
          {data.label}
        </span>
      </div>

      {/* Turn indicator */}
      {data.addedAtTurn !== undefined && (
        <div style={{
          position: 'absolute',
          bottom: -8,
          right: 6,
          background: '#e5e7eb',
          color: '#6b7280',
          fontSize: 8,
          fontWeight: 600,
          padding: '1px 5px',
          borderRadius: 3,
        }}>
          T{data.addedAtTurn}
        </div>
      )}

      {/* Checklist ref badge */}
      {data.checklistRef && (
        <div style={{
          position: 'absolute',
          bottom: -8,
          left: 6,
          background: config.border,
          color: 'white',
          fontSize: 8,
          fontWeight: 700,
          padding: '1px 5px',
          borderRadius: 3,
          opacity: 0.8,
        }}>
          {data.checklistRef}
        </div>
      )}

      {/* React Flow handles */}
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: config.border, width: 8, height: 8, border: '2px solid white' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{ background: config.border, width: 8, height: 8, border: '2px solid white' }}
      />
    </div>
  )
})

ClinicalNode.displayName = 'ClinicalNode'