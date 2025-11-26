import React from 'react';
import { AgentConfig, ModelType } from '../types';
import { MODEL_OPTIONS, DEFAULT_SYSTEM_INSTRUCTION } from '../constants';

interface SidebarProps {
  config: AgentConfig;
  setConfig: React.Dispatch<React.SetStateAction<AgentConfig>>;
  isOpen: boolean;
  onClose: () => void;
  onResetChat: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, isOpen, onClose, onResetChat }) => {
  
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConfig(prev => ({ ...prev, model: e.target.value }));
  };

  const handleInstructionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setConfig(prev => ({ ...prev, systemInstruction: e.target.value }));
  };

  const toggleSearch = () => {
    setConfig(prev => ({ ...prev, useSearch: !prev.useSearch }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Content */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-slate-900 border-r border-slate-700 
        transform transition-transform duration-300 ease-in-out z-30
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:h-screen overflow-y-auto flex flex-col
      `}>
        <div className="p-6 flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold text-blue-400 tracking-tight leading-tight">Portaware<br/><span className="text-slate-100 font-light">Inteligencia Comercial</span></h1>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Config Section */}
          <div className="space-y-6">
            
            {/* Model Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Modelo de Análisis</label>
              <select 
                value={config.model} 
                onChange={handleModelChange}
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              >
                {MODEL_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* System Instruction */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Instrucción del Sistema
              </label>
              <textarea
                rows={8}
                value={config.systemInstruction}
                onChange={handleInstructionChange}
                placeholder="Define el comportamiento del analista..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 resize-none font-mono"
              />
              <button 
                onClick={() => setConfig(prev => ({ ...prev, systemInstruction: DEFAULT_SYSTEM_INSTRUCTION }))}
                className="text-xs text-blue-400 mt-1 hover:text-blue-300 underline"
              >
                Restaurar Analista Portaware
              </button>
            </div>

            {/* Tools */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Herramientas de Investigación</label>
              <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm text-slate-200">Google Search</span>
                </div>
                <button 
                  onClick={toggleSearch}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${config.useSearch ? 'bg-blue-600' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.useSearch ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Vital para obtener datos actualizados de BMV, reportes anuales y presencia de competencia.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 bg-slate-900">
           <button 
            onClick={onResetChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors text-sm font-medium"
           >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
             Nuevo Análisis
           </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;