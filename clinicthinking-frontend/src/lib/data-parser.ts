

export interface AIAction {
  type: 'add_node' | 'add_edge' | 'update_node' | 'delete_node';
  sessionId: string;
  data: any;
}

export const parseAiData = (rawJson: string): AIAction | null => {
  try {
    const action = JSON.parse(rawJson);

    if (!action.type || !action.sessionId || !action.data) {
      console.warn("Data AI tidak valid: Format JSON tidak lengkap.", action);
      return null;
    }

    const validTypes = ['add_node', 'add_edge', 'update_node', 'delete_node'];
    if (!validTypes.includes(action.type)) {
      console.warn("Data AI tidak valid: Tipe action tidak dikenal.", action.type);
      return null;
    }

    return action as AIAction;
  } catch (error) {
    console.error("Gagal parsing JSON dari AI:", error);
    return null;
  }
};