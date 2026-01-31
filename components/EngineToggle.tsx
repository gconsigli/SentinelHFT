
import React from 'react';
import { InferenceEngine } from '../types';
import { Cloud, Cpu, ShieldCheck, Zap } from 'lucide-react';

interface EngineToggleProps {
  currentEngine: InferenceEngine;
  onToggle: (engine: InferenceEngine) => void;
  isProcessing: boolean;
}

export const EngineToggle: React.FC<EngineToggleProps> = ({ currentEngine, onToggle, isProcessing }) => {
  return (
    <div className="flex flex-col gap-4 p-6 bg-slate-900/50 border border-slate-800 rounded-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Execution Engine</h3>
        <span className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${isProcessing ? 'bg-yellow-500/10 text-yellow-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
          <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-yellow-500 animate-pulse' : 'bg-emerald-500'}`} />
          {isProcessing ? 'Processing Request' : 'Engine Ready'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800">
        <button
          onClick={() => onToggle(InferenceEngine.CEREBRAS)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
            currentEngine === InferenceEngine.CEREBRAS
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
          }`}
        >
          <Zap size={18} />
          <div className="text-left">
            <p className="text-sm font-bold leading-none">Cerebras</p>
            <p className="text-[10px] opacity-70">Wafer-Scale Cloud</p>
          </div>
        </button>

        <button
          onClick={() => onToggle(InferenceEngine.NVIDIA_LOCAL)}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-md transition-all ${
            currentEngine === InferenceEngine.NVIDIA_LOCAL
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'
          }`}
        >
          <Cpu size={18} />
          <div className="text-left">
            <p className="text-sm font-bold leading-none">NVIDIA Local</p>
            <p className="text-[10px] opacity-70">Private RTX Engine</p>
          </div>
        </button>
      </div>

      <div className="mt-2 p-3 rounded bg-slate-950/50 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
        <ShieldCheck size={14} className="mt-0.5 text-blue-400 shrink-0" />
        <p>
          {currentEngine === InferenceEngine.CEREBRAS 
            ? "Optimized for maximum inference speed and large batch analysis via cloud compute."
            : "Data remains on-premise. Execution utilizes local NVIDIA VRAM via Ollama backend."}
        </p>
      </div>
    </div>
  );
};
