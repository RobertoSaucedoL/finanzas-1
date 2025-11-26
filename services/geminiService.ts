import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AgentConfig, ChatMessage } from "../types";

// Instancia global lazy-loaded para evitar errores al inicio si falta la key
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (aiClient) return aiClient;

  // Vite expone variables con import.meta.env
  // Se requiere que la variable empiece con VITE_ para ser visible en el frontend
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey) {
    throw new Error("API Key no encontrada. Asegúrate de configurar la variable de entorno VITE_API_KEY en Vercel.");
  }

  aiClient = new GoogleGenAI({ apiKey: apiKey });
  return aiClient;
};

export const createChatSession = (config: AgentConfig) => {
  try {
    const ai = getClient();
    const tools = config.useSearch ? [{ googleSearch: {} }] : [];

    console.log("Inicializando chat con modelo:", config.model);

    // Creamos el chat usando el nuevo SDK @google/genai
    return ai.chats.create({
      model: config.model,
      config: {
        systemInstruction: config.systemInstruction,
        temperature: config.temperature,
        tools: tools,
      },
      history: [], 
    });
  } catch (error) {
    console.error("Error al crear la sesión de chat:", error);
    throw error;
  }
};

export async function* streamMessage(
  chat: any, // Tipo Chat del SDK
  message: string
): AsyncGenerator<{ text: string; groundingChunks?: any[] }, void, unknown> {
  
  try {
    // Llamada de streaming correcta para @google/genai
    const resultStream = await chat.sendMessageStream({
      message: message,
    });

    for await (const chunk of resultStream) {
      // El chunk es de tipo GenerateContentResponse
      const responseChunk = chunk as GenerateContentResponse;
      
      const text = responseChunk.text || '';
      const groundingChunks = responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      yield { text, groundingChunks };
    }
  } catch (error: any) {
    console.error("❌ Error en streamMessage:", error);
    
    const errorMsg = error.toString();
    
    // Manejo de errores específicos
    if (errorMsg.includes("404")) {
      throw new Error(`Modelo no encontrado (Error 404). El modelo configurado '${chat.model}' puede estar deprecado o mal escrito.`);
    }
    
    if (errorMsg.includes("400") || errorMsg.includes("API_KEY_INVALID")) {
      throw new Error("API Key inválida (Error 400). Verifica tu configuración en Vercel.");
    }

    throw error;
  }
}
