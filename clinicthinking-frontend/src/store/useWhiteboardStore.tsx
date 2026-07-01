

import { create } from 'zustand'
import { Node, Edge, addEdge, applyNodeChanges, applyEdgeChanges, Connection, NodeChange, EdgeChange } from 'reactflow'
import { api } from '@/lib/api'

export type NodeCategory = 'symptom' | 'risk_factor' | 'hypothesis' | 'finding' | 'missing' | 'bias_flag'

export interface ClinicalNodeData {
  label: string
  type: NodeCategory
  checklistRef?: string
  isBiased?: boolean
  isHinted?: boolean
  addedAtTurn?: number
}

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

export interface SimulationStep {
  text: string;       
  actions: WhiteboardAction[]; 
  timerAction?: 'start' | 'stop'; 
}

// whiteboard action dari ai
export type WhiteboardAction =
  | { type: 'add_node'; data: { id: string; label: string; type: NodeCategory; checklist_ref?: string } }
  | { type: 'add_edge'; data: { id: string; source: string; target: string; label?: string } }
  | { type: 'trigger_hint'; data: { checklist_id: string; hint_message: string; target_node_id?: string } }
  | { type: 'flag_bias'; data: { bias_type: 'premature_closure' | 'anchoring_bias'; description: string; affected_hypothesis?: string } }
  | { type: 'update_hypothesis'; data: { id: string; label: string } }
  | { type: 'no_action'; data: null }

// store tempat penyimpanan
interface WhiteboardState {
  sessionId: string | null;
  nodes: Node<ClinicalNodeData>[]
  edges: Edge[]
  biasEvents: BiasEvent[]
  hintQueue: HintEvent[]
  turnCount: number
  completedChecklistIds: Set<string>
  lastAction: WhiteboardAction | null
  highlightNode: (nodeId: string, color: string) => void;
  processSimulationStep: (step: SimulationStep) => void;
  initSession: (sessionId: string) => Promise<{ role: 'ai' | 'user'; content: string; audioDurationMs?: number }[]>;
  processAiAction: (action: WhiteboardAction) => void;

  // Actions
  applyAIAction: (action: WhiteboardAction, turn: number) => void
  onNodesChange: (changes: any) => void
  onEdgesChange: (changes: any) => void
  onConnect: (connection: any) => void
  dismissHint: (hintId: string) => void
  dismissBias: (biasId: string) => void
  reset: () => void
}



// Auto-layout: posisi node berdasarkan tipe agar tidak tumpang tindih dengan koordinat yang rapi
const NODE_POSITIONS: Record<NodeCategory, { baseX: number; baseY: number }> = {
  risk_factor: { baseX: 80,   baseY: 80  },
  symptom:     { baseX: 360,  baseY: 80  },
  finding:     { baseX: 640,  baseY: 80  },
  hypothesis:  { baseX: 920,  baseY: 180 },
  missing:     { baseX: 80,   baseY: 360 },
  bias_flag:   { baseX: 920,  baseY: 420 },
}

function getNodePosition(type: NodeCategory, existingNodes: Node[], index: number) {
  const base = NODE_POSITIONS[type] || { baseX: 200, baseY: 200 }
  const sameTypeNodes = existingNodes.filter(n => n.data?.type === type)
  const row = sameTypeNodes.length
  return {
    x: base.baseX,
    y: base.baseY + row * 160, // Jarak vertikal 160px agar node tidak menumpuk
  }
}

let biasCounter = 0
let hintCounter = 0

export const useWhiteboardStore = create<WhiteboardState>((set, get) => ({
  sessionId: null,
  nodes: [] as Node<ClinicalNodeData>[],
  edges: [] as Edge[],
  biasEvents: [],
  hintQueue: [],
  turnCount: 0,
  completedChecklistIds: new Set<string>(),
  lastAction: null,

  initSession: async (sessionId: string) => {
      set({ sessionId });
      const chatHistory: { role: 'ai' | 'user'; content: string; audioDurationMs?: number }[] = [];

      try {
          const res = await api.get<{ events: any[] }>(`/api/sessions/${sessionId}/events`);

          if (res.success && res.data?.events) {
              res.data.events.forEach((event) => {
                  // Parse event_data dari DB (bisa berupa stringified JSON)
                  const rawData = typeof event.event_data === 'string'
                      ? JSON.parse(event.event_data)
                      : event.event_data;

                  if (!rawData) return;

                  // 1. Ekstrak pesan chat history untuk dikembalikan ke page.tsx
                  if (event.event_type === 'ai_response' || rawData.type === 'chat_message') {
                      const msgRole = rawData.role || 'ai';
                      const msgContent = rawData.content || '';
                      
                      // Cek duplikasi di array sementara berdasarkan isi pesan & role
                      const isDuplicate = chatHistory.some(m => m.role === msgRole && m.content === msgContent);
                      if (!isDuplicate) {
                          chatHistory.push({
                              role: msgRole,
                              content: msgContent,
                              audioDurationMs: rawData.audio_duration_ms || undefined
                          });
                      }
                  }

                  // 2. Ekstrak whiteboard action
                  const action = rawData.type === 'ai_action' && rawData.payload
                      ? rawData.payload
                      : (rawData.type && rawData.type !== 'chat_message' ? rawData : null);

                  if (action && action.type && action.type !== 'no_action') {
                      const turn = event.sequence_number;
                      get().applyAIAction(action, turn);
                  }
              });
          }
      } catch (e) {
          console.error("Gagal memuat whiteboard:", e);
      }

      return chatHistory;
  },
  highlightNode: (nodeId: string, color: string) => {
    set((state) => ({
      nodes: state.nodes.map((node) => 
        node.id === nodeId 
          ? { 
              ...node, 
              // Kamu bisa menambahkan style CSS atau data marker
              data: { ...node.data, isBiased: true } 
            } 
          : node
      ),
    }));
  },

  processSimulationStep: (step: SimulationStep) => {
    const { applyAIAction, turnCount } = get();

    // 1. Eksekusi semua aksi Whiteboard (Animasi)
    step.actions.forEach((action) => {
      applyAIAction(action, turnCount + 1);
    });

    // 2. Trigger timer jika ada (Logika timer akan kita buat di page.tsx atau store)
    if (step.timerAction === 'start') {
      console.log("⏱️ Timer simulasi dimulai!");
      // Kamu bisa tambahkan logic di sini jika timer dikelola oleh store
    }
  },
  

  processAiAction: (action: WhiteboardAction) => {
    // Guard: abaikan jika action null/undefined atau tipe no_action
    if (!action || !action.type || action.type === 'no_action') return;
    console.log('[WhiteboardStore] Memproses AI Action:', action.type, action);
    get().applyAIAction(action, get().turnCount + 1);
  },

  applyAIAction: (action: WhiteboardAction, turn: number) => {
    set(state => {
      const newState = { ...state, lastAction: action, turnCount: turn }

      switch (action.type) {
        case 'add_node': {
          const { id, label, type, checklist_ref } = action.data
          // Jangan duplikasi node dengan ID yang sama
          if (state.nodes.find(n => n.id === id)) {
            console.warn(`[WhiteboardStore] add_node dibatalkan: Node ID '${id}' sudah ada di whiteboard.`);
            break;
          }

          console.log(`[WhiteboardStore] Menambahkan Node: [ID: ${id}] [Label: "${label}"] [Type: ${type}] [ChecklistRef: ${checklist_ref || 'none'}]`);

          const position = getNodePosition(type, state.nodes, state.nodes.length)
          const newNode: Node<ClinicalNodeData> = {
            id,
            type: 'clinicalNode',  
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
          if (state.edges.find(e => e.id === id)) {
            console.warn(`[WhiteboardStore] add_edge dibatalkan: Edge ID '${id}' sudah terpasang.`);
            break;
          }

          // Verifikasi keberadaan source dan target node
          const sourceExists = state.nodes.some(n => n.id === source);
          const targetExists = state.nodes.some(n => n.id === target);

          if (!sourceExists || !targetExists) {
            console.error(
              `[WhiteboardStore] ERROR add_edge: Gagal menghubungkan node. ` +
              `Source Node '${source}' ada? ${sourceExists}. ` +
              `Target Node '${target}' ada? ${targetExists}. ` +
              `Pastikan node dibuat sebelum menghubungkannya!`
            );
            break;
          }

          console.log(`[WhiteboardStore] Menghubungkan Node: [Edge: ${id}] [Source: ${source}] ──(${label || 'relation'})──> [Target: ${target}]`);

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

  dismissBias: (biasId) =>
    set(state => ({
      biasEvents: state.biasEvents.filter(b => b.id !== biasId),
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