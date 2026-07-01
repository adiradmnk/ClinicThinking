import React, { memo, useEffect, useState } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { ClinicalNodeData, NodeCategory } from '@/store/useWhiteboardStore'


const NODE_CONFIG: Record<NodeCategory, {
  accent: string; tint: string; text: string
  icon: string; label: string
}> = {
  symptom: {
    accent: '#3b82f6', tint: '#eff6ff', text: '#1e3a8a',
    icon: '🩺', label: 'Gejala',
  },
  risk_factor: {
    accent: '#eab308', tint: '#fefce8', text: '#713f12',
    icon: '⚠️', label: 'Faktor Risiko',
  },
  hypothesis: {
    accent: '#22c55e', tint: '#f0fdf4', text: '#14532d',
    icon: '🧠', label: 'Hipotesis',
  },
  finding: {
    accent: '#a855f7', tint: '#faf5ff', text: '#581c87',
    icon: '🔬', label: 'Temuan',
  },
  missing: {
    accent: '#f97316', tint: '#fff7ed', text: '#7c2d12',
    icon: '❓', label: 'Belum Digali',
  },
  bias_flag: {
    accent: '#ef4444', tint: '#fef2f2', text: '#7f1d1d',
    icon: '🚨', label: 'Bias Terdeteksi',
  },
}

const BIAS_ACCENT = '#ef4444'
const HINT_ACCENT = '#f97316'

// Inject keyframes once for the whole app, not once per node instance.
let stylesInjected = false
function ensureGlobalStyles() {
  if (stylesInjected || typeof document === 'undefined') return
  stylesInjected = true
  const style = document.createElement('style')
  style.setAttribute('data-clinical-node-styles', 'true')
  style.textContent = `
    @keyframes clinicalNodeHintPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(249,115,22,0.32), 0 6px 16px rgba(15,23,42,0.06); }
      50% { box-shadow: 0 0 0 6px rgba(249,115,22,0.14), 0 6px 16px rgba(15,23,42,0.06); }
    }
    @keyframes clinicalNodeBiasPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.35), 0 6px 16px rgba(15,23,42,0.07); }
      50% { box-shadow: 0 0 0 7px rgba(239,68,68,0.16), 0 6px 16px rgba(15,23,42,0.07); }
    }
  `
  document.head.appendChild(style)
}

interface ClinicalNodeProps extends NodeProps<ClinicalNodeData> {}

export const ClinicalNode = memo(({ data, selected }: ClinicalNodeProps) => {
  const [isHovered, setIsHovered] = useState(false)
  useEffect(() => { ensureGlobalStyles() }, [])

  const config = NODE_CONFIG[data.type] || NODE_CONFIG.finding
  const isBiased = !!data.isBiased
  const isHinted = !!data.isHinted && !isBiased

  const accent = isBiased ? BIAS_ACCENT : isHinted ? HINT_ACCENT : config.accent
  const displayIcon = isBiased ? '🚨' : config.icon
  const displayLabel = isBiased ? 'Bias Terdeteksi' : config.label

  // Base elevation; hover/selected/state add on top of this rather than replacing it.
  const baseShadow = '0 1px 2px rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.06)'
  const hoverShadow = '0 4px 10px rgba(15,23,42,0.08), 0 2px 4px rgba(15,23,42,0.06)'
  const selectedRing = `0 0 0 3px ${accent}33`

  let boxShadow = baseShadow
  if (selected) boxShadow = `${selectedRing}, ${hoverShadow}`
  else if (isHovered) boxShadow = hoverShadow

  const animation = isBiased
    ? 'clinicalNodeBiasPulse 1.8s ease-in-out infinite'
    : isHinted
    ? 'clinicalNodeHintPulse 1.8s ease-in-out infinite'
    : undefined

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        minWidth: 168,
        maxWidth: 216,
        borderRadius: 14,
        padding: '10px 13px 12px',
        background: `linear-gradient(165deg, ${config.tint} 0%, #ffffff 62%)`,
        border: `1px solid ${isBiased || isHinted ? `${accent}55` : `${accent}30`}`,
        boxShadow: animation ? undefined : boxShadow,
        transform: isHovered && !isBiased ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        animation,
        fontFamily: "'Inter', -apple-system, sans-serif",
        cursor: 'default',
      }}
    >
      {/* Top chip: icon + category label, sits inline (no overflow) */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          background: isBiased ? accent : `${accent}1a`,
          color: isBiased ? '#ffffff' : config.text,
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
          padding: '2.5px 7px',
          borderRadius: 6,
          marginBottom: 7,
        }}
      >
        <span style={{ fontSize: 11, lineHeight: 1 }}>{displayIcon}</span>
        {displayLabel}
      </div>

      {/* Main label */}
      <div
        style={{
          color: '#0f172a',
          fontSize: 12.5,
          fontWeight: 600,
          lineHeight: 1.45,
          letterSpacing: '-0.005em',
        }}
      >
        {data.label}
      </div>

      {/* Footer row: checklist ref (left) + turn indicator (right) */}
      {(data.checklistRef || data.addedAtTurn !== undefined) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
            paddingTop: 6,
            borderTop: '1px solid rgba(15,23,42,0.06)',
          }}
        >
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: accent,
              opacity: 0.85,
            }}
          >
            {data.checklistRef || ''}
          </span>
          {data.addedAtTurn !== undefined && (
            <span
              style={{
                fontSize: 9,
                fontWeight: 600,
                color: '#94a3b8',
              }}
            >
              T{data.addedAtTurn}
            </span>
          )}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: accent,
          width: 8,
          height: 8,
          border: '2px solid #ffffff',
          boxShadow: '0 1px 2px rgba(15,23,42,0.15)',
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: accent,
          width: 8,
          height: 8,
          border: '2px solid #ffffff',
          boxShadow: '0 1px 2px rgba(15,23,42,0.15)',
        }}
      />
    </div>
  )
})

ClinicalNode.displayName = 'ClinicalNode'