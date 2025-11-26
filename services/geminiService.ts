import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

export const createChatSession = (config: AgentConfig): Chat => {
  // En Vercel y Vite, las variables de entorno se acceden así.
  // Asegúrate de tener VITE_API_KEY configurada en Vercel.
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    console.error("❌ ERROR CRÍTICO: API Key no encontrada o inválida.");
    console.error("En Vercel: Ve a Settings > Environment Variables y asegura que se llame 'VITE_API_KEY'.");
    
    throw new Error("Falta configuración de API Key (VITE_API_KEY)");
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
    
    if (errorMsg.includes("400") || errorMsg.includes("API_KEY_INVALID")) {
      throw new Error("API Key inválida. Verifica que tu VITE_API_KEY en Vercel sea correcta y no tenga espacios.");
    }
    
    if (errorMsg.includes("404")) {
      throw new Error(`El modelo solicitado no está disponible. Asegúrate de usar 'gemini-1.5-flash'. Error original: ${errorMsg}`);
    }

    if (errorMsg.includes("fetch")) {
      throw new Error("Error de conexión. Verifica tu internet o si la API de Google tiene interrupciones.");
    }

    throw error;
  }
}
