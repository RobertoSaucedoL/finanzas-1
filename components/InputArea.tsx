import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSendMessage: (text: string) => void;
  disabled: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, disabled }) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-4 lg:p-6 bg-white border-t border-gray-100">
      <form 
        onSubmit={handleSubmit}
        className="relative max-w-4xl mx-auto bg-gray-50 rounded-xl border border-gray-200 transition-all focus-within:border-brand-accent focus-within:ring-1 focus-within:ring-brand-accent/20"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Escribe tu consulta de estrategia..."
          rows={1}
          className="w-full bg-transparent text-brand-dark placeholder-gray-400 p-4 pr-12 rounded-xl resize-none focus:outline-none scrollbar-hide font-light"
          style={{ minHeight: '56px', maxHeight: '150px' }}
        />
        
        <button
          type="submit"
          disabled={!text.trim() || disabled}
          className={`
            absolute right-2 bottom-2 p-2 rounded-lg transition-colors
            ${(!text.trim() || disabled) 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-brand-accent hover:bg-brand-accent/10 cursor-pointer'
            }
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
      <p className="text-center text-[10px] text-gray-400 mt-3 font-light">
        Portaware Intel v1.0 • Powered by Gemini 3.0 Pro
      </p>
    </div>
  );
};

export default InputArea;