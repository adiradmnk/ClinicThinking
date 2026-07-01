

export interface AIAction {
  type: 'add_node' | 'add_edge' | 'update_node' | 'delete_node' | 'trigger_hint' | 'flag_bias' | 'update_hypothesis' | 'no_action';
  sessionId: string;
  data: any;
}

export const parseAiData = (rawJson: string): AIAction | null => {
  try {
    const action = JSON.parse(rawJson);
    if (!action.type) return null; 

    return {
        type: action.type,
        sessionId: action.sessionId || "default",
        data: action.data || {}
    } as AIAction;
  } catch (error) {
    return null;
  }
};