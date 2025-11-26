import React, { useEffect, useRef } from 'react';
import { ChatMessage, Role, GroundingChunk } from '../types';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Simple formatter for code blocks and bold text
  const formatText = (text: string) => {
    const lines = text.split('\n');
    let inCodeBlock = false;
    
    return lines.map((line, index) => {
      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return (
          <div key={index} className="my-3 p-4 bg-gray-50 rounded-lg font-mono text-sm overflow-x-auto text-gray-800 border border-gray-200">
             {line.replace(/```\w*/, '') || 'Datos / Tabla'}
          </div>
        );
      }
      
      if (inCodeBlock) {
        return <div key={index} className="font-mono text-sm text-gray-600 whitespace-pre">{line}</div>;
      }

      // Basic bold formatting **bold**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      return (
        <div key={index} className={`min-h-[1.5em] ${line === '' ? 'h-2' : ''}`}>
           {parts.map((part, i) => {
             if (part.startsWith('**') && part.endsWith('**')) {
               return <strong key={i} className="font-semibold text-brand-dark">{part.slice(2, -2)}</strong>;
             }
             return <span key={i}>{part}</span>;
           })}
        </div>
      );
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-8 bg-white">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto opacity-0 animate-[fadeIn_0.5s_ease-in_forwards]">
          <div className="w-16 h-16 bg-brand-accent/10 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-light text-brand-dark mb-2">Portaware Intel</h2>
          <p className="text-sm text-gray-500 font-light mb-8 leading-relaxed">
            Analista de estrategia comercial especializado en industria plástica.
            Datos en tiempo real via Google Search.
          </p>
          <div className="grid gap-3 w-full">
            <div className="text-xs text-gray-500 border border-gray-100 rounded-lg p-3 bg-gray-50/50">
              "Analiza Farmacias Guadalajara como prospecto"
            </div>
            <div className="text-xs text-gray-500 border border-gray-100 rounded-lg p-3 bg-gray-50/50">
              "Benchmark Portaware vs Cubasa"
            </div>
          </div>
        </div>
      )}

      {messages.map((msg) => {
        const isUser = msg.role === Role.USER;
        return (
          <div 
            key={msg.id} 
            className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              flex max-w-[90%] lg:max-w-[85%] flex-col
              ${isUser ? 'items-end' : 'items-start'}
            `}>
              <div className={`
                px-6 py-5 rounded-2xl shadow-sm text-[15px] font-light leading-relaxed
                ${isUser 
                  ? 'bg-brand-accent text-white rounded-br-none' 
                  : 'bg-white border border-gray-100 text-brand-dark rounded-bl-none shadow-md shadow-gray-100/50'
                }
              `}>
                {formatText(msg.text)}
                
                {/* Grounding Sources (Search results) */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className={`mt-5 pt-4 border-t ${isUser ? 'border-white/20' : 'border-gray-100'}`}>
                    <p className={`text-[10px] uppercase tracking-wider font-semibold mb-2 flex items-center gap-1 ${isUser ? 'text-white/80' : 'text-gray-400'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Fuentes
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.groundingChunks.map((chunk, idx) => {
                         if (!chunk.web?.uri) return null;
                         return (
                          <a 
                            key={idx}
                            href={chunk.web.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`
                              text-xs px-2 py-1 rounded transition-colors truncate max-w-[200px] block
                              ${isUser 
                                ? 'bg-white/10 text-white hover:bg-white/20' 
                                : 'bg-gray-50 text-blue-600 hover:bg-gray-100'
                              }
                            `}
                          >
                            {chunk.web.title || chunk.web.uri}
                          </a>
                         );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-gray-400 mt-2 px-1 font-medium tracking-wide">
                {isUser ? 'TÚ' : 'PORTAWARE INTEL'}
              </span>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex justify-start w-full">
           <div className="bg-white border border-gray-100 px-6 py-5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
             <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
             <div className="w-1.5 h-1.5 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
           </div>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
