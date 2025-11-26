import React, { useState, useRef, useCallback, useEffect } from 'react';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import { createChatSession, streamMessage } from './services/geminiService';
import { AgentConfig, ChatMessage, Role, GroundingChunk } from './types';
import { DEFAULT_CONFIG } from './constants';

const App: React.FC = () => {
  const [config] = useState<AgentConfig>(DEFAULT_CONFIG);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Ref para almacenar la sesión de chat activa
  // Nota: No tipamos estrictamente con 'Chat' aquí para evitar conflictos de importación
  // si el SDK cambia, ya que 'any' en el ref lo maneja el servicio.
  const chatSessionRef = useRef<any>(null);
  
  // Initialize chat session
  const initChat = useCallback(() => {
    try {
      chatSessionRef.current = createChatSession(config);
      setMessages([]);
      console.log("Portaware Intel Agent inicializado OK.");
    } catch (e) {
      console.error("Error al inicializar:", e);
    }
  }, [config]);

  // Initial setup
  useEffect(() => {
    if (!chatSessionRef.current) {
      initChat();
    }
  }, [initChat]);

  const handleSendMessage = async (text: string) => {
    if (!chatSessionRef.current) {
        // Intento de recuperación si la sesión se perdió
        initChat();
        if(!chatSessionRef.current) return; 
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: Role.USER,
      text: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Placeholder para la respuesta de la IA
    const aiMessageId = (Date.now() + 1).toString();
    const aiPlaceholder: ChatMessage = {
      id: aiMessageId,
      role: Role.MODEL,
      text: '',
      isStreaming: true,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, aiPlaceholder]);

    try {
      const stream = streamMessage(chatSessionRef.current, text);
      
      let fullText = '';
      let finalGroundingChunks: GroundingChunk[] = [];

      for await (const chunk of stream) {
        fullText += chunk.text;
        if (chunk.groundingChunks) {
            finalGroundingChunks = [...finalGroundingChunks, ...chunk.groundingChunks];
        }

        // Update UI with streaming text
        setMessages(prev => prev.map(msg => 
          msg.id === aiMessageId 
            ? { ...msg, text: fullText, groundingChunks: finalGroundingChunks }
            : msg
        ));
      }

      // Final update to mark streaming as done
      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, isStreaming: false }
          : msg
      ));

    } catch (error: any) {
      console.error("Error sending message:", error);
      let errorMsg = "Lo siento, ocurrió un error al procesar tu solicitud.";
      
      if (error.message.includes("VITE_GEMINI_API_KEY")) {
        errorMsg = "Error de configuración: Falta la API Key en Vercel.";
      }

      setMessages(prev => prev.map(msg => 
        msg.id === aiMessageId 
          ? { ...msg, text: errorMsg, isStreaming: false }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white text-brand-dark overflow-hidden font-light">
      {/* Main Content - Full Width */}
      <div className="flex-1 flex flex-col h-full relative w-full max-w-5xl mx-auto border-x border-gray-100 shadow-sm">
        
        {/* Header Minimalista */}
        <header className="p-5 border-b border-gray-100 flex items-center justify-between bg-white z-10">
           <div>
             <h1 className="text-xl font-bold tracking-tight text-brand-dark">Portaware</h1>
             <p className="text-xs text-[#D98918] font-medium tracking-wide uppercase">Inteligencia Comercial</p>
           </div>
           
           <button 
             onClick={initChat} 
             className="p-2 text-gray-400 hover:text-brand-accent transition-colors"
             title="Nuevo Análisis"
           >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
             </svg>
           </button>
        </header>

        {/* Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
           <MessageList messages={messages} isLoading={isLoading} />
           <InputArea onSendMessage={handleSendMessage} disabled={isLoading} />
        </main>
      </div>
    </div>
  );
};

export default App;
