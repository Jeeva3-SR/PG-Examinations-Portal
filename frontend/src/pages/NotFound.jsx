import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white font-sans p-6 relative overflow-hidden">
      {/* Structural Abstract Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(99,102,241,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Container Block */}
      <div className="w-full max-w-lg text-center space-y-8 relative z-10">
        
        {/* Large Premium 404 Fluid Header Graphic */}
        <div className="space-y-2">
          <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent drop-shadow-xl select-none animate-pulse">
            404
          </h1>
          <div className="h-1 w-20 bg-indigo-500 rounded-full mx-auto shadow-lg shadow-indigo-500/50" />
        </div>

        {/* Text Area */}
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Page not Found
          </h2>
          <p className="text-sm md:text-base text-slate-400 max-w-md mx-auto leading-relaxed font-medium">
            The resource endpoint parameters you requested do not exist or have been moved out of the active core directory map.
          </p>
        </div>

        {/* The Single Isolated Control Action */}
        <div className="pt-4 max-w-xs mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="w-full bg-white text-slate-950 hover:bg-slate-100 font-bold rounded-xl py-3.5 px-6 transition-all shadow-lg hover:shadow-white/10 flex items-center justify-center space-x-2 transform active:scale-[0.98] group"
          >
            <svg 
              className="w-5 h-5 text-slate-800 transform group-hover:-translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="tracking-wide">Step Back to Previous Page</span>
          </button>
        </div>

      </div>

      {/* Minimal Footer Element */}
      <footer className="absolute bottom-6 text-center text-[10px] font-semibold text-slate-600 uppercase tracking-widest pointer-events-none">
        PG Examinations Portal
      </footer>
    </div>
  );
};

export default NotFound;