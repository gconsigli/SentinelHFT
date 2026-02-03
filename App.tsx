
import React, { useState, useEffect, useRef } from 'react';
import { InferenceEngine, RiskReport, LatencyStats } from './types';
import { callEngine } from './services/inferenceService';
import { 
  Shield, 
  Activity, 
  Zap, 
  Cpu, 
  TrendingUp,
  Radio,
  Volume2,
  Box,
  Terminal as TerminalIcon,
  BarChart3,
  Wifi,
  WifiOff,
  Key,
  Settings,
  Lock,
  Github
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

const ASSET_METADATA: Record<string, { name: string, basePrice: number, vol: number }> = {
  'NVDA': { name: 'NVIDIA Corporation', basePrice: 143.44, vol: 0.0004 },
  'BTC': { name: 'Bitcoin / USD', basePrice: 67432.18, vol: 0.0012 },
  'AAPL': { name: 'Apple Inc.', basePrice: 178.92, vol: 0.0002 },
  'TSLA': { name: 'Tesla, Inc.', basePrice: 248.76, vol: 0.0008 },
};

const App: React.FC = () => {
  const [currentEngine, setCurrentEngine] = useState<InferenceEngine>(InferenceEngine.CEREBRAS);
  const [reports, setReports] = useState<RiskReport[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [riskScore, setRiskScore] = useState(44.8);
  const [selectedAsset, setSelectedAsset] = useState('NVDA');
  const [apiStatus, setApiStatus] = useState<'connected' | 'error' | 'idle'>('idle');
  const [cerebrasKey, setCerebrasKey] = useState(localStorage.getItem('cerebras_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  
  // Env Var Detection
  const hasEnvKey = !!process.env.CEREBRAS_API_KEY;

  const [price, setPrice] = useState(ASSET_METADATA['NVDA'].basePrice);
  const [chartData, setChartData] = useState<{time: number, value: number}[]>([]);
  const [ticks, setTicks] = useState<any[]>([]);
  const [perfHistory, setPerfHistory] = useState<{name: string, Cerebras: number, Nvidia: number}[]>([]);

  const lastPriceRef = useRef(ASSET_METADATA['NVDA'].basePrice);
  const chartCounterRef = useRef(40);

  // Persistence for API Key
  useEffect(() => {
    if (cerebrasKey) {
      localStorage.setItem('cerebras_key', cerebrasKey);
    }
  }, [cerebrasKey]);

  // 1. Reset everything when switching assets
  useEffect(() => {
    const assetInfo = ASSET_METADATA[selectedAsset];
    const base = assetInfo.basePrice;
    lastPriceRef.current = base;
    setPrice(base);
    
    const initialChart = Array.from({ length: 40 }).map((_, i) => ({ 
      time: i, 
      value: base + (Math.random() - 0.5) * (base * 0.005) 
    }));
    setChartData(initialChart);
    chartCounterRef.current = 40;
    setTicks([]);
    
    runAnalysis();
  }, [selectedAsset]);

  // 2. High-Frequency Market Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      const assetInfo = ASSET_METADATA[selectedAsset];
      const change = lastPriceRef.current * (Math.random() - 0.5) * assetInfo.vol;
      const newPrice = lastPriceRef.current + change;
      lastPriceRef.current = newPrice;
      setPrice(newPrice);

      setTicks(prev => [{
        price: newPrice.toLocaleString(undefined, { minimumFractionDigits: selectedAsset === 'BTC' ? 2 : 4 }),
        change: ((change / newPrice) * 100).toFixed(4),
        time: new Date().toLocaleTimeString('en-GB', { hour12: false }) + '.' + Math.floor(Math.random() * 999)
      }, ...prev].slice(0, 20));

      setChartData(prev => {
        const nextTime = chartCounterRef.current++;
        return [...prev, { time: nextTime, value: newPrice }].slice(-60);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [selectedAsset]);

  // 3. AI Inference Analysis
  const runAnalysis = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const prompt = `HFT ALERT: Asset ${selectedAsset} at price $${lastPriceRef.current.toFixed(2)}. Current risk profile: ${riskScore}%. Analyze order flow microstructure.`;
    
    try {
      const result = await callEngine(prompt, currentEngine, cerebrasKey);
      setApiStatus(result.confidence > 0 ? 'connected' : 'error');
      
      const newReport: RiskReport = {
        timestamp: new Date().toLocaleTimeString(),
        engine: currentEngine,
        scenario: prompt,
        analysis: result.analysis,
        threatLevel: result.threatLevel as any,
        confidenceScore: result.confidence,
        latency: result.stats
      };

      setReports(prev => [newReport, ...prev].slice(0, 30));
      
      setPerfHistory(prev => {
        const newPoint = {
          name: new Date().toLocaleTimeString().split(' ')[0],
          Cerebras: currentEngine === InferenceEngine.CEREBRAS ? result.stats.totalDuration : (prev[prev.length-1]?.Cerebras || 0),
          Nvidia: currentEngine === InferenceEngine.NVIDIA_LOCAL ? result.stats.totalDuration : (prev[prev.length-1]?.Nvidia || 0),
        };
        return [...prev, newPoint].slice(-10);
      });

      const threatMultiplier = { 'Critical': 12, 'High': 6, 'Medium': 2, 'Low': -4 }[result.threatLevel as any] || 0;
      setRiskScore(prev => Math.min(99.9, Math.max(5.0, prev + (Math.random() * 2) + threatMultiplier)));
    } catch (err) {
      setApiStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    const analysisTimer = setInterval(runAnalysis, 4000);
    return () => clearInterval(analysisTimer);
  }, [currentEngine, selectedAsset, cerebrasKey]);

  return (
    <div className="flex flex-col h-screen bg-[#020617] text-slate-300 overflow-hidden select-none font-['Inter']">
      <header className="h-14 border-b border-slate-800/50 bg-[#0b0e14] flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-1.5 rounded shadow-lg shadow-blue-500/20">
            <Shield className="text-white" size={18} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tighter text-slate-100 uppercase">Sentinel</h1>
            <p className="text-[10px] text-slate-500 mono leading-none uppercase tracking-widest">WSE-3 Hybrid Cluster</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {currentEngine === InferenceEngine.CEREBRAS && !cerebrasKey && !hasEnvKey && (
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-blue-500/10 border border-blue-500/30 text-[10px] text-blue-300">
              <Key size={12} />
              <span>Add your Cerebras API key in <button type="button" onClick={() => setShowSettings(true)} className="font-bold underline hover:text-blue-200">Settings</button> (gear icon) to use the demo.</span>
            </div>
          )}
          {currentEngine === InferenceEngine.NVIDIA_LOCAL && (
            <div className="flex items-center gap-2 px-3 py-2 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-300">
              <Cpu size={12} />
              <span>NVIDIA Local works only when running the app locally.</span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-slate-900/80 border border-slate-800 text-[10px] font-bold">
            {apiStatus === 'connected' ? <Wifi size={12} className="text-emerald-500" /> : <WifiOff size={12} className="text-red-500" />}
            <span className={apiStatus === 'connected' ? "text-emerald-500 uppercase" : "text-red-500 uppercase"}>
              {currentEngine}: {apiStatus === 'connected' ? 'Link Stable' : 'Link Interrupted'}
            </span>
          </div>

          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded relative transition-colors ${showSettings ? 'bg-blue-600/20 text-blue-400' : 'hover:bg-slate-800 text-slate-500'}`}
          >
            <Settings size={18} />
            {hasEnvKey && <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-[#0b0e14]" title="Env Var Loaded" />}
          </button>

          <button 
            onClick={() => setCurrentEngine(currentEngine === InferenceEngine.CEREBRAS ? InferenceEngine.NVIDIA_LOCAL : InferenceEngine.CEREBRAS)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-bold transition-all ${
              currentEngine === InferenceEngine.CEREBRAS 
                ? 'bg-blue-900/40 border-blue-500/50 text-blue-400 shadow-lg shadow-blue-500/10' 
                : 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400'
            }`}
          >
            {currentEngine === InferenceEngine.CEREBRAS ? <Zap size={12} className="animate-pulse" /> : <Cpu size={12} />}
            <span className="uppercase tracking-wider">{currentEngine}</span>
          </button>

          <a
            href="https://github.com/gconsigli/SentinelHFT"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
            aria-label="View on GitHub"
          >
            <Github size={18} />
          </a>
        </div>
      </header>

      {showSettings && (
        <div className="absolute top-16 right-6 w-80 bg-[#0f172a] border border-slate-800 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key size={14} className="text-blue-500" />
                <p className="text-[10px] font-bold uppercase text-slate-100">Auth Configuration</p>
              </div>
              {hasEnvKey && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-bold text-emerald-400">
                  <Lock size={8} /> ENV LOADED
                </div>
              )}
           </div>
           
           <div className="space-y-3">
             <div>
                <p className="text-[9px] text-slate-500 uppercase font-bold mb-1 ml-1 tracking-widest">Cerebras API Key</p>
                <input 
                  type="password"
                  value={cerebrasKey}
                  onChange={(e) => setCerebrasKey(e.target.value)}
                  placeholder={hasEnvKey ? "Using System Environment Variable" : "csk-..."}
                  disabled={hasEnvKey}
                  className={`w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs mono text-blue-400 outline-none focus:border-blue-500 ${hasEnvKey ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
             </div>
             <p className="text-[9px] text-slate-500 italic leading-tight px-1">
               {hasEnvKey 
                 ? "Key securely loaded from CEREBRAS_API_KEY env var. Manual entry disabled." 
                 : "No environment variable found. Enter key manually to enable Wafer-Scale cloud inference."}
             </p>
           </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        <aside className="w-72 flex flex-col gap-4 shrink-0 overflow-hidden">
          <div className="bg-[#0b0e14] border border-slate-800 rounded p-4 flex flex-col items-center">
            <p className="w-full text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Probability Map</p>
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: riskScore }, { value: 100 - riskScore }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    startAngle={225}
                    endAngle={-45}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={riskScore > 75 ? "#ef4444" : riskScore > 40 ? "#f59e0b" : "#10b981"} />
                    <Cell fill="#1e293b" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                <p className={`text-[9px] font-bold uppercase ${riskScore > 40 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {riskScore > 75 ? 'Critical' : riskScore > 40 ? 'Elevated' : 'Stable'}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold mono text-slate-100">{riskScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#0b0e14] border border-slate-800 rounded p-4 flex flex-col overflow-hidden">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Asset Monitoring</p>
            <div className="flex flex-col gap-2 overflow-y-auto custom-scrollbar pr-1">
              {Object.entries(ASSET_METADATA).map(([symbol, meta]) => (
                <div 
                  key={symbol} 
                  onClick={() => setSelectedAsset(symbol)}
                  className={`group p-3 rounded border transition-all cursor-pointer ${
                    selectedAsset === symbol 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-blue-500/5' 
                    : 'bg-slate-900/30 border-transparent hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-slate-100">{symbol}</span>
                    <span className="text-xs font-bold mono text-slate-100">
                      ${symbol === selectedAsset ? price.toLocaleString(undefined, { minimumFractionDigits: 2 }) : meta.basePrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[9px] text-slate-500 uppercase font-bold truncate pr-2">{meta.name}</span>
                    <span className={`text-[9px] font-bold mono ${symbol === 'BTC' ? 'text-red-400' : 'text-emerald-500'}`}>
                      {symbol === 'BTC' ? '-1.12%' : '+0.45%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 flex flex-col gap-4 overflow-hidden">
          <div className="bg-[#0b0e14] border border-slate-800 rounded p-6 h-[45%] flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{selectedAsset}</h2>
                  <span className="bg-slate-800 text-[9px] font-bold px-1.5 py-0.5 rounded text-slate-400 tracking-widest uppercase">Real-Time Telemetry</span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{ASSET_METADATA[selectedAsset].name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold mono text-slate-100">${price.toLocaleString(undefined, { minimumFractionDigits: selectedAsset === 'BTC' ? 2 : 4 })}</p>
                <p className={`text-xs font-bold mono ${price >= ASSET_METADATA[selectedAsset].basePrice ? 'text-emerald-500' : 'text-red-500'}`}>
                   {((price - ASSET_METADATA[selectedAsset].basePrice) / ASSET_METADATA[selectedAsset].basePrice * 100).toFixed(4)}%
                  <TrendingUp size={12} className="inline ml-1"/>
                </p>
              </div>
            </div>
            
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={price >= ASSET_METADATA[selectedAsset].basePrice ? "#10b981" : "#ef4444"} stopOpacity={0.15}/>
                      <stop offset="95%" stopColor={price >= ASSET_METADATA[selectedAsset].basePrice ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2} />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke={price >= ASSET_METADATA[selectedAsset].basePrice ? "#10b981" : "#ef4444"} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex-1 flex gap-4 min-h-0">
            <div className="w-[45%] bg-[#0b0e14] border border-slate-800 rounded p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Radio size={12} className="text-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-100">Live Tick Flow</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar mono text-[10px]">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 border-b border-slate-800/30">
                      <th className="pb-1 font-bold uppercase">Price</th>
                      <th className="pb-1 font-bold uppercase">Δ %</th>
                      <th className="pb-1 font-bold uppercase">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticks.map((t, i) => (
                      <tr key={i} className="border-b border-slate-800/10 hover:bg-slate-900/20 transition-colors">
                        <td className={`py-1 ${parseFloat(t.change) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>${t.price}</td>
                        <td className={parseFloat(t.change) >= 0 ? 'text-emerald-500' : 'text-red-500'}>{t.change}%</td>
                        <td className="text-slate-600 text-[9px]">{t.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex-1 bg-[#0b0e14] border border-slate-800 rounded p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 px-1">
                  <BarChart3 size={12} className="text-blue-400" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-100">Benchmark: Latency (ms)</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase font-mono tracking-tighter">Cerebras</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[8px] font-bold text-slate-500 uppercase font-mono tracking-tighter">Nvidia</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={perfHistory} margin={{ top: 0, right: 0, left: -35, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.2} />
                    <XAxis dataKey="name" hide />
                    <YAxis fontSize={8} tick={{ fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', fontSize: '10px' }}
                    />
                    <Bar dataKey="Cerebras" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Nvidia" fill="#10b981" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>

        <aside className="w-80 bg-[#0b0e14] border border-slate-800 rounded flex flex-col shrink-0 overflow-hidden shadow-2xl relative">
          <header className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/30">
            <div className="flex items-center gap-2">
              <TerminalIcon size={14} className="text-blue-500" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-100">Intelligence stream</p>
            </div>
            <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-blue-400 animate-ping' : 'bg-emerald-500'}`} />
          </header>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar bg-black/20">
            {reports.length === 0 && !isProcessing && (
              <div className="flex flex-col items-center justify-center h-full text-slate-700">
                <Activity size={32} className="mb-4 opacity-10 animate-pulse" />
                <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 text-center px-4 uppercase leading-relaxed">Awaiting WSE-3 data packets...</p>
              </div>
            )}
            {reports.map((report, i) => (
              <div 
                key={i} 
                className={`p-3 rounded border flex flex-col gap-2 transition-all animate-in fade-in slide-in-from-right-2 duration-300 ${
                  report.threatLevel === 'Critical' 
                  ? 'bg-red-500/10 border-red-500/40 shadow-lg shadow-red-500/5' 
                  : report.threatLevel === 'High'
                  ? 'bg-orange-500/5 border-orange-500/30'
                  : 'bg-emerald-500/5 border-emerald-500/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className={`shrink-0 p-1 rounded-sm mt-0.5 ${
                    report.threatLevel === 'Critical' ? 'bg-red-500/20 text-red-500' : 
                    report.threatLevel === 'High' ? 'bg-orange-500/20 text-orange-500' : 'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    <Box size={10} />
                  </div>
                  <div className="flex-1">
                    <p className={`text-[11px] leading-snug font-medium mb-1 ${report.threatLevel === 'Critical' ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                      {report.analysis}
                    </p>
                    <div className="flex items-center justify-between text-[8px] font-bold text-slate-600 mono uppercase border-t border-slate-800/30 pt-1 mt-1">
                      <span>{report.timestamp}</span>
                      <span className="text-blue-500/70">{report.engine} ({report.latency.totalDuration}ms)</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <footer className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
             <div className="flex items-center gap-2 overflow-hidden">
                <div className={`p-1 rounded-full ${isProcessing ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-500'}`}>
                  <Volume2 size={10} className={isProcessing ? 'animate-pulse' : ''} />
                </div>
                <p className="text-[9px] text-slate-500 font-bold truncate uppercase tracking-tighter">
                  {reports[0]?.analysis || 'Awaiting Next Signal'}
                </p>
             </div>
             <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] font-bold text-blue-400 uppercase tracking-widest">
                {reports.length}
             </div>
          </footer>
        </aside>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-in { animation: fade-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default App;
