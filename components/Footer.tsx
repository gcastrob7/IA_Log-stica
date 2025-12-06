import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200 py-6 pb-24 md:pb-6 mt-auto">
      <div className="container mx-auto px-4 text-center max-w-5xl">
        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} La IA en la Logística. Potenciado por Google Gemini.
        </p>
        <p className="text-slate-400 text-xs mt-2">
          Desarrollado para demostración de capacidades AI en tiempo real.
        </p>
      </div>
    </footer>
  );
};