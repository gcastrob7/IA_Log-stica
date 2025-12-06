import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { API_KEY, CHAT_MODEL_NAME } from "../constants";

export class GeminiChatService {
  private ai: GoogleGenAI;
  private chatSession: Chat | null = null;

  constructor() {
    // Usamos la API KEY importada directamente de constants.ts
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  public async startChat(history: { role: string; parts: { text: string }[] }[] = []) {
    this.chatSession = this.ai.chats.create({
      model: CHAT_MODEL_NAME,
      config: {
        systemInstruction: "Eres un asistente virtual experto en logística y cadena de suministro. Tus respuestas son concisas, profesionales y enfocadas en cómo la tecnología y la IA mejoran los procesos logísticos.",
      },
      history: history, // Initialize with previous context if needed
    });
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.chatSession) {
      await this.startChat();
    }

    if (!this.chatSession) {
        throw new Error("Failed to initialize chat session");
    }

    try {
      const response: GenerateContentResponse = await this.chatSession.sendMessage({
        message: message,
      });
      return response.text || "Lo siento, no pude generar una respuesta.";
    } catch (error) {
      console.error("Error sending message to Gemini:", error);
      throw error;
    }
  }
}

export const chatService = new GeminiChatService();