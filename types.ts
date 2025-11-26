export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  isStreaming?: boolean;
  groundingChunks?: GroundingChunk[];
  timestamp: number;
}

export interface AgentConfig {
  model: string;
  systemInstruction: string;
  useSearch: boolean;
  temperature: number;
}

export enum ModelType {
  // El modelo más económico, rápido y estable (Recomendado para Vercel gratuito)
  FLASH = 'gemini-1.5-flash',
  // Modelo de mayor razonamiento
  PRO = 'gemini-1.5-pro'
}
