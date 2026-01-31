
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LatencyStats, InferenceEngine } from '../types';

interface LatencyMonitorProps {
  stats: LatencyStats[];
}

export const LatencyMonitor: React.FC<LatencyMonitorProps> = ({ stats }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Inference Latency (ms)</h3>
      
      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="engine" 
              stroke="#64748b" 
              fontSize={10} 
              tickFormatter={(val) => val === InferenceEngine.CEREBRAS ? 'CEREBRAS' : 'LOCAL'}
            />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', color: '#f8fafc' }}
              itemStyle={{ color: '#f8fafc' }}
            />
            <Bar dataKey="totalDuration" name="Total Time (ms)" radius={[4, 4, 0, 0]}>
              {stats.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.engine === InferenceEngine.CEREBRAS ? '#3b82f6' : '#10b981'} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="p-2 bg-slate-950 rounded border border-slate-800">
            <p className="text-[10px] text-slate-500 uppercase">{s.engine === InferenceEngine.CEREBRAS ? 'Cloud' : 'Edge'}</p>
            <p className="text-lg font-bold text-white mono leading-tight">{s.tps.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">T/s</span></p>
          </div>
        ))}
      </div>
    </div>
  );
};
