import React from 'react';
import { Truck, MessageSquareText, Mic } from 'lucide-react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-5xl">
        <div 
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onViewChange(ViewState.HOME)}
        >
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none">Logística AI</h1>
            <p className="text-xs text-slate-500 font-medium">Operaciones Inteligentes</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          <button
            onClick={() => onViewChange(ViewState.HOME)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentView === ViewState.HOME 
                ? 'bg-slate-100 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Inicio
          </button>
          <button
            onClick={() => onViewChange(ViewState.CHAT)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentView === ViewState.CHAT 
                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <MessageSquareText size={16} />
            Chat Asistente
          </button>
          <button
            onClick={() => onViewChange(ViewState.CALL)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentView === ViewState.CALL 
                ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Mic size={16} />
            Llamada en Vivo
          </button>
        </nav>
      </div>
    </header>
  );
};