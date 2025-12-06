import React, { useState } from 'react';
import { HomeView } from './components/HomeView';
import { ChatInterface } from './components/ChatInterface';
import { LiveCallInterface } from './components/LiveCallInterface';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Bot, Home, Phone } from 'lucide-react';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);

  const renderView = () => {
    switch (currentView) {
      case ViewState.HOME:
        return <HomeView onNavigate={setCurrentView} />;
      case ViewState.CHAT:
        return <ChatInterface />;
      case ViewState.CALL:
        return <LiveCallInterface />;
      default:
        return <HomeView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-5xl">
        {renderView()}
      </main>

      {/* Bottom Mobile Navigation / Floating Actions */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md shadow-2xl rounded-full px-6 py-3 border border-slate-200 flex gap-8 md:hidden z-50">
        <button 
          onClick={() => setCurrentView(ViewState.HOME)}
          className={`flex flex-col items-center ${currentView === ViewState.HOME ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Home size={24} />
        </button>
        <button 
          onClick={() => setCurrentView(ViewState.CHAT)}
          className={`flex flex-col items-center ${currentView === ViewState.CHAT ? 'text-blue-600' : 'text-slate-400'}`}
        >
          <Bot size={24} />
        </button>
        <button 
          onClick={() => setCurrentView(ViewState.CALL)}
          className={`flex flex-col items-center ${currentView === ViewState.CALL ? 'text-rose-500' : 'text-slate-400'}`}
        >
          <Phone size={24} />
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default App;