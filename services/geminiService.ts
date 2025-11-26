import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

export const createChatSession = (config: AgentConfig): Chat => {
  // En Vite/Vercel, usamos VITE_API_KEY a través de import.meta.env
  // También revisamos process.env como respaldo por si acaso.
  const apiKey = import.meta.env.VITE_API_KEY || (typeof process !== 'undefined' ? process.env.API_KEY : undefined);

  if (!apiKey || apiKey.length < 10) {
    console.error("API Key no encontrada o inválida. Asegúrate de configurar la variable de entorno VITE_API_KEY en Vercel.");
    // No lanzamos error aquí para no romper la app al cargar, pero el primer mensaje fallará.
  }

  try {
    // Si apiKey es undefined, GoogleGenAI lanzará un error cuando se intente usar.
    const ai = new GoogleGenAI({ apiKey: apiKey || 'DUMMY_KEY_TO_PREVENT_INIT_CRASH' });
    const tools = config.useSearch ? [{ googleSearch: {} }] : [];

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
  } catch (error) {
    console.error("Error en streamMessage:", error);
    throw error;
  }
}
