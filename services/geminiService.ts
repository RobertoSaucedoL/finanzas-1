import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AgentConfig } from "../types";

export const createChatSession = (config: AgentConfig): Chat => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
    console.error("Error crítico en streamMessage:", error);
    throw error;
  }
