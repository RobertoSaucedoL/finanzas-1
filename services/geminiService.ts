import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

export const createChatSession = (config: AgentConfig): Chat => {
  // En Vercel, las variables de entorno deben empezar con VITE_
  const apiKey = import.meta.env.VITE_API_KEY || import.meta.env.API_KEY;

  if (!apiKey || apiKey.length < 10) {
    console.error("❌ ERROR CRÍTICO: API Key no encontrada.");
    console.error("Asegúrate de configurar VITE_API_KEY en las variables de entorno de Vercel.");
    throw new Error("Falta configuración de API Key. Revisa la configuración de Vercel (VITE_API_KEY).");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey });
    const tools = config.useSearch ? [{ googleSearch: {} }] : [];

    console.log("Inicializando chat con modelo:", config.model);

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
  chat: Chat,
  message: string
): AsyncGenerator<{ text: string; groundingChunks?: any[] }, void, unknown> {
  
  try {
    const resultStream = await chat.sendMessageStream({
      message: message,
    });

    for await (const chunk of resultStream) {
      const responseChunk = chunk as GenerateContentResponse;
      const text = responseChunk.text || '';
      const groundingChunks = responseChunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      yield { text, groundingChunks };
    }
  } catch (error: any) {
    console.error("❌ Error en streamMessage:", error);
    
    const errorMsg = error.toString();
    
    // Mejor manejo de errores comunes en Vercel/Google API
    if (errorMsg.includes("400") || errorMsg.includes("API_KEY_INVALID")) {
      throw new Error("API Key inválida (Error 400). Verifica que la variable 'VITE_API_KEY' en Vercel sea correcta y comience con AIza.");
    }
    
    if (errorMsg.includes("404")) {
      throw new Error(`Modelo no encontrado (Error 404). Verifica que constants.ts esté usando 'gemini-1.5-flash'. Error: ${errorMsg}`);
    }

    if (errorMsg.includes("fetch") || errorMsg.includes("Network")) {
      throw new Error("Error de conexión. Verifica tu internet.");
    }

    throw error;
  }
}
