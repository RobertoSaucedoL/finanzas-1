import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

// Instancia global lazy-loaded
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (aiClient) return aiClient;

  // Accedemos a la variable de entorno usando sintaxis estándar de Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Falta VITE_GEMINI_API_KEY en variables de entorno");
    throw new Error("Configuración incompleta: VITE_GEMINI_API_KEY no encontrada. Revisa tu panel de Vercel.");
  }

  aiClient = new GoogleGenAI({ apiKey: apiKey });
  return aiClient;
};

export const createChatSession = (config: AgentConfig) => {
  try {
    const ai = getClient();
    const tools = config.useSearch ? [{ googleSearch: {} }] : [];

    console.log("Inicializando chat con modelo:", config.model);

    // Creación de chat con SDK moderno @google/genai
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
    console.error("Error crítico al crear sesión:", error);
    throw error;
  }
};

export async function* streamMessage(
  chat: any, 
  message: string
): AsyncGenerator<{ text: string; groundingChunks?: any[] }, void, unknown> {
  
  try {
    // Llamada de streaming moderna
    const resultStream = await chat.sendMessageStream({
      message: message,
    });

    // Iteración asíncrona estándar (resuelve el error 'p is not async iterable')
    for await (const chunk of resultStream) {
      // Casteo seguro al tipo de respuesta
      const responseChunk = chunk as GenerateContentResponse;
      
      const text = responseChunk.text || '';
      const groundingChunks = responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      yield { text, groundingChunks };
    }
  } catch (error: any) {
    console.error("❌ Error en stream:", error);
    const msg = error.toString();

    if (msg.includes("404")) throw new Error("Error 404: El modelo configurado no existe. Verifica 'constants.ts'.");
    if (msg.includes("400") || msg.includes("API_KEY")) throw new Error("Error de API Key. Verifica VITE_GEMINI_API_KEY en Vercel.");
    
    throw error;
  }
}
