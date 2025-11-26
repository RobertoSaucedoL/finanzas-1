import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

// Helper para obtener el cliente de forma segura y perezosa (lazy)
const getClient = () => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    console.error("CRÍTICO: No se encontró la API KEY. Asegúrate de configurar la variable de entorno API_KEY en Vercel o en tu archivo .env");
    // Retornamos un cliente dummy o lanzamos error controlado para no romper la UI inmediatamente
    throw new Error("API Key no configurada");
  }
  return new GoogleGenAI({ apiKey });
};

export const createChatSession = (config: AgentConfig): Chat => {
  try {
    const ai = getClient();
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
    console.error("Error in streamMessage:", error);
    throw error;
  }
}