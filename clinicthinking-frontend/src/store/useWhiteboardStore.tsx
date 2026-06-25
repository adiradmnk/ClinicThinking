import { create } from 'zustand';
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'reactflow';

interface WhiteboardState {
  sessionId: string | null;
  nodes: Node[];
  edges: Edge[];
  initSession: (id: string) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  processAiAction: (action: { type: string; data: any }) => void;
}

export const useWhiteboardStore = create<WhiteboardState>((set) => ({
  sessionId: null,
  nodes: [],
  edges: [],
  initSession: (id) => set({ sessionId: id, nodes: [], edges: [] }),
  
  onNodesChange: (changes) => set((state) => ({ 
    nodes: applyNodeChanges(changes, state.nodes) 
  })),
  
  onEdgesChange: (changes) => set((state) => ({ 
    edges: applyEdgeChanges(changes, state.edges) 
  })),
  
  processAiAction: (action) => set((state) => {
    switch (action.type) {
      case 'ADD_NODE': return { nodes: [...state.nodes, action.data] };
      case 'ADD_EDGE': return { edges: [...state.edges, action.data] };
      default: return state;
    }
  }),
}));