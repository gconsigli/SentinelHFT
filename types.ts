
export enum InferenceEngine {
  CEREBRAS = 'CEREBRAS',
  NVIDIA_LOCAL = 'NVIDIA_LOCAL'
}

export interface LatencyStats {
  engine: InferenceEngine;
  ttft: number; // Time to First Token (ms)
  tps: number;  // Tokens Per Second
  totalDuration: number; // ms
  vramUsage?: number; // GB (Local only)
  networkLatency?: number; // ms (Cloud only)
}

export interface RiskReport {
  timestamp: string;
  engine: InferenceEngine;
  scenario: string;
  analysis: string;
  threatLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  confidenceScore: number;
  latency: LatencyStats;
}

export interface EngineConfig {
  localEndpoint: string;
  cerebrasApiKey: string;
  modelName: string;
}
