import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

export const createChatSession = (config: AgentConfig): Chat => {
  // CRÍTICO: En Vercel, la variable debe llamarse VITE_API_KEY para ser visible en el frontend.
  const apiKey = import.meta.env.VITE_API_KEY;

  if (!apiKey || apiKey.length < 10) {
    console.error("❌ ERROR CRÍTICO: API Key no encontrada.");
    console.error("Solución en Vercel: Ve a Settings > Environment Variables y agrega 'VITE_API_KEY' con tu clave.");
    
    // Devolvemos un objeto dummy para que no crashee la UI inmediatamente,
    // el error saltará cuando intenten enviar mensaje.
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
    // Si es un error 400/404, es probable que la KEY sea inválida o el modelo no exista.
    if (error.toString().includes("400") || error.toString().includes("API key not valid")) {
      throw new Error("Tu API Key es inválida o no está configurada correctamente en Vercel (Revisa VITE_API_KEY).");
    }
    if (error.toString().includes("404")) {
      throw new Error("El modelo seleccionado no está disponible para tu clave API. Intenta con Gemini 1.5 Flash.");
    }
    throw error;
  }
}
