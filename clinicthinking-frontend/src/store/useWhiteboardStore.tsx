// frontend/src/stores/whiteboardStore.ts
// Zustand store — single source of truth untuk semua state whiteboard
// Ini yang mengubah perintah AI menjadi perubahan visual di React Flow

import { create } from 'zustand'
import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges } from 'reactflow'

// ─── Node Types ────────────────────────────────────────────────────
export type NodeCategory = 'symptom' | 'risk_factor' | 'hypothesis' | 'finding' | 'missing' | 'bias_flag'

export interface ClinicalNodeData {
  label: string
  type: NodeCategory
  checklistRef?: string
  isBiased?: boolean
  isHinted?: boolean
  addedAtTurn?: number
}

// ─── Bias / Hint Events ────────────────────────────────────────────
export interface BiasEvent {
  id: string
  biasType: 'premature_closure' | 'anchoring_bias'
  description: string
  affectedHypothesis?: string
  detectedAtTurn: number
}

export interface HintEvent {
  id: string
  checklistId: string
  message: string
  targetNodeId?: string
  turn: number
}

// ─── Whiteboard Actions (dari AI) ─────────────────────────────────
export type WhiteboardAction =
  | { type: 'add_node'; data: { id: string; label: string; type: NodeCategory; checklist_ref?: string } }
  | { type: 'add_edge'; data: { id: string; source: string; target: string; label?: string } }
  | { type: 'trigger_hint'; data: { checklist_id: string; hint_message: string; target_node_id?: string } }
  | { type: 'flag_bias'; data: { bias_type: 'premature_closure' | 'anchoring_bias'; description: string; affected_hypothesis?: string } }
  | { type: 'update_hypothesis'; data: { id: string; label: string } }
  | { type: 'no_action'; data: null }

// ─── Store ────────────────────────────────────────────────────────
interface WhiteboardState {
  nodes: Node<ClinicalNodeData>[]
  edges: Edge[]
  biasEvents: BiasEvent[]
  hintQueue: HintEvent[]
  turnCount: number
  completedChecklistIds: Set<string>
  lastAction: WhiteboardAction | null
  initSession: (sessionId: string) => void;
  processAiAction: (action: WhiteboardAction) => void;

  // Actions
  applyAIAction: (action: WhiteboardAction, turn: number) => void
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (connection: any) => void
  dismissHint: (hintId: string) => void
  reset: () => void
}

// Auto-layout: posisi node berdasarkan tipe agar tidak tumpang tindih
const NODE_POSITIONS: Record<NodeCategory, { baseX: number; baseY: number }> = {
  risk_factor: { baseX: 80,  baseY: 80  },
  symptom:     { baseX: 340, baseY: 80  },
  finding:     { baseX: 340, baseY: 300 },
  hypothesis:  { baseX: 620, baseY: 180 },
  missing:     { baseX: 80,  baseY: 300 },
  bias_flag:   { baseX: 620, baseY: 380 },
}

function getNodePosition(type: NodeCategory, existingNodes: Node[], index: number) {
  const base = NODE_POSITIONS[type] || { baseX: 200, baseY: 200 }
  const sameTypeNodes = existingNodes.filter(n => n.data?.type === type)
  const row = Math.floor(sameTypeNodes.length / 2)
  const col = sameTypeNodes.length % 2
  return {
    x: base.baseX + col * 200 + (Math.random() * 20 - 10),
    y: base.baseY + row * 120,
  }
}

let biasCounter = 0
let hintCounter = 0

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  nodes: [],
  edges: [],
  biasEvents: [],
  hintQueue: [],
  turnCount: 0,
  completedChecklistIds: new Set(),
  lastAction: null,

  initSession: (sessionId) => set({ /* logika inisialisasi */ }),
  processAiAction: (action) => {
    // Panggil applyAIAction yang sudah ada
    get().applyAIAction(action, get().turnCount + 1);
  },

  applyAIAction: (action: WhiteboardAction, turn: number) => {
    set(state => {
      const newState = { ...state, lastAction: action, turnCount: turn }

      switch (action.type) {
        case 'add_node': {
          const { id, label, type, checklist_ref } = action.data
          // Jangan duplikasi node dengan ID yang sama
          if (state.nodes.find(n => n.id === id)) break

          const position = getNodePosition(type, state.nodes, state.nodes.length)
          const newNode: Node<ClinicalNodeData> = {
            id,
            type: 'clinicalNode',  // custom React Flow node type
            position,
            data: {
              label,
              type,
              checklistRef: checklist_ref,
              addedAtTurn: turn,
            },
          }

          newState.nodes = [...state.nodes, newNode]
          if (checklist_ref) {
            newState.completedChecklistIds = new Set([...state.completedChecklistIds, checklist_ref])
          }
          break
        }

        case 'add_edge': {
          const { id, source, target, label } = action.data
          if (state.edges.find(e => e.id === id)) break

          const newEdge: Edge = {
            id,
            source,
            target,
            label,
            animated: true,
            style: { stroke: '#64a0c8', strokeWidth: 1.5 },
            labelStyle: { fill: '#6b7280', fontSize: 10 },
          }
          newState.edges = addEdge(newEdge, state.edges)
          break
        }

        case 'trigger_hint': {
          const hint: HintEvent = {
            id: `hint-${++hintCounter}`,
            checklistId: action.data.checklist_id,
            message: action.data.hint_message,
            targetNodeId: action.data.target_node_id,
            turn,
          }
          newState.hintQueue = [...state.hintQueue, hint]

          // Pulse animation: tandai node target
          if (action.data.target_node_id) {
            newState.nodes = state.nodes.map(n =>
              n.id === action.data.target_node_id
                ? { ...n, data: { ...n.data, isHinted: true } }
                : n
            )
          }
          break
        }

        case 'flag_bias': {
          const bias: BiasEvent = {
            id: `bias-${++biasCounter}`,
            biasType: action.data.bias_type,
            description: action.data.description,
            affectedHypothesis: action.data.affected_hypothesis,
            detectedAtTurn: turn,
          }
          newState.biasEvents = [...state.biasEvents, bias]

          // Merah-kan node hipotesis yang terpengaruh
          if (action.data.affected_hypothesis) {
            newState.nodes = state.nodes.map(n =>
              n.data?.label?.toLowerCase().includes(action.data.affected_hypothesis!.toLowerCase())
                ? { ...n, data: { ...n.data, isBiased: true } }
                : n
            )
          }
          break
        }

        case 'update_hypothesis': {
          newState.nodes = state.nodes.map(n =>
            n.id === action.data.id
              ? { ...n, data: { ...n.data, label: action.data.label } }
              : n
          )
          break
        }

        case 'no_action':
        default:
          break
      }

      return newState
    })
  },

  onNodesChange: (changes) =>
    set(state => ({ nodes: applyNodeChanges(changes, state.nodes) })),

  onEdgesChange: (changes) =>
    set(state => ({ edges: applyEdgeChanges(changes, state.edges) })),

  onConnect: (connection) =>
    set(state => ({ edges: addEdge({ ...connection, animated: true }, state.edges) })),

  dismissHint: (hintId) =>
    set(state => ({
      hintQueue: state.hintQueue.filter(h => h.id !== hintId),
    })),

  reset: () =>
    set({
      nodes: [],
      edges: [],
      biasEvents: [],
      hintQueue: [],
      turnCount: 0,
      completedChecklistIds: new Set(),
      lastAction: null,
    }),
}))