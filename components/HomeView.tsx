import React from 'react';
import { ViewState } from '../types';
import { ArrowRight, BarChart3, Box, Zap, Map } from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: ViewState) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-xl">
        <div className="absolute inset-0 opacity-40">
           <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80" 
            alt="Logistic Warehouse" 
            className="w-full h-full object-cover"
           />
        </div>
        <div className="relative z-10 p-8 md:p-16 flex flex-col items-start justify-center min-h-[400px]">
          <span className="bg-blue-600/90 text-blue-50 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4 uppercase">
            Nueva Generación
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight max-w-2xl">
            Revolucionando la Logística con <span className="text-blue-400">Inteligencia Artificial</span>
          </h2>
          <p className="text-slate-300 text-lg md:text-xl mb-8 max-w-xl">
            Descubre cómo la IA predictiva y los asistentes autónomos están optimizando la cadena de suministro global.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
             <button 
              onClick={() => onNavigate(ViewState.CHAT)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/50"
             >
               Consultar Chatbot <ArrowRight size={18} />
             </button>
             <button 
               onClick={() => onNavigate(ViewState.CALL)}
               className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
             >
               Hablar con Asistente <Zap size={18} />
             </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Análisis Predictivo</h3>
          <p className="text-slate-600">
            Anticipa la demanda y optimiza el stock utilizando algoritmos avanzados que aprenden de tus datos históricos.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
            <Map size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Rutas Inteligentes</h3>
          <p className="text-slate-600">
            Optimización dinámica de rutas en tiempo real para reducir costos de combustible y tiempos de entrega.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center mb-4">
            <Box size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Gestión Autónoma</h3>
          <p className="text-slate-600">
            Sistemas capaces de tomar decisiones autónomas sobre reposición y gestión de almacenes.
          </p>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white rounded-3xl p-8 md:p-12 border border-slate-100 flex flex-col md:flex-row gap-12 items-center">
        <div className="md:w-1/2 space-y-6">
          <h3 className="text-3xl font-bold text-slate-800">¿Por qué integrar IA?</h3>
          <ul className="space-y-4">
            {[
              "Reducción del 30% en costos operativos.",
              "Mejora del 50% en tiempos de entrega.",
              "Mayor precisión en el inventario.",
              "Sostenibilidad mediante rutas eficientes."
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="md:w-1/2">
           <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" 
            alt="AI Data Visualization" 
            className="rounded-2xl shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500"
           />
        </div>
      </section>
    </div>
  );
};