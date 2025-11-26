import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

// Instancia global lazy-loaded
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (aiClient) return aiClient;

  // IMPORTANTE: Leemos la API KEY desde la variable de entorno estándar de Vite
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Falta VITE_GEMINI_API_KEY en variables de entorno");
    throw new Error("Configuración incompleta: VITE_GEMINI_API_KEY no encontrada. Revisa tu panel de Vercel (Settings > Environment Variables).");
  }

  aiClient = new GoogleGenAI({ apiKey: apiKey });
  return aiClient;
};

export const createChatSession = (config: AgentConfig) => {
  try {
    const ai = getClient();
    // En el nuevo SDK @google/genai, configuramos las herramientas así:
    const tools = config.useSearch ? [{ googleSearch: {} }] : [];

    console.log("Inicializando chat con modelo:", config.model);

    // Creación de chat con SDK moderno
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
    // 1. Llamada de streaming con el nuevo SDK
    const resultStream = await chat.sendMessageStream({
      message: message,
    });

    // 2. Iteración correcta: El nuevo SDK devuelve un iterable asíncrono directo
    for await (const chunk of resultStream) {
      // Casteo seguro para TypeScript
      const responseChunk = chunk as GenerateContentResponse;
      
      const text = responseChunk.text || '';
      // Acceso seguro a los datos de grounding (fuentes)
      const groundingChunks = responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      yield { text, groundingChunks };
    }
  } catch (error: any) {
    console.error("❌ Error en stream:", error);
    const msg = error.toString();

    // Mensajes de error amigables para depuración
    if (msg.includes("404")) throw new Error("Error 404: El modelo configurado no existe. Asegúrate de usar 'gemini-2.5-flash'.");
    if (msg.includes("400") || msg.includes("API_KEY")) throw new Error("Error de API Key. Verifica que VITE_GEMINI_API_KEY esté configurada en Vercel.");
    
    throw error;
  }
}
