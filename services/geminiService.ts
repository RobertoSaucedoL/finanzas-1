import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

// Instancia global lazy-loaded
let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (aiClient) return aiClient;

  // IMPORTANTE: Buscamos la clave en TODAS las variables posibles.
  // Gracias al cambio en vite.config.ts, ahora podemos leer 'API_KEY' directa también.
  const apiKey = 
    import.meta.env.VITE_GEMINI_API_KEY || 
    import.meta.env.VITE_API_KEY || 
    import.meta.env.API_KEY; // Esta funcionará si la llamaste solo API_KEY en Vercel

  if (!apiKey || apiKey.length === 0) {
    console.error("❌ ERROR CRÍTICO: No se encontró ninguna API Key.");
    throw new Error("Falta la API Key. Asegúrate de tener 'VITE_GEMINI_API_KEY' o 'API_KEY' en las variables de entorno de Vercel.");
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
    
    // Detectar error de API Key (código 400 o mensaje explícito)
    if (msg.includes("400") || msg.includes("API Key") || msg.includes("API_KEY")) {
      throw new Error("Error de API Key. Vercel no está pasando la clave. Verifica Settings > Environment Variables.");
    }
    
    throw error;
  }
}
