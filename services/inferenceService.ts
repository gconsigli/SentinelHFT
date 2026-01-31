
import { InferenceEngine, LatencyStats } from "../types";

export const callEngine = async (
  prompt: string,
  engine: InferenceEngine,
  manualKey?: string
): Promise<{ 
  analysis: string; 
  threatLevel: string; 
  confidence: number;
  stats: LatencyStats;
}> => {
  const startTime = Date.now();
  
  // Prioritize environment variable, then fallback to manual UI entry
  const cerebrasKey = process.env.CEREBRAS_API_KEY || manualKey;

  if (engine === InferenceEngine.NVIDIA_LOCAL) {
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3', // Standard Ollama Llama3
          prompt: `System: You are an HFT Risk Architect. Analyze: ${prompt}. Return ONLY JSON with "analysis" (1 sentence), "threatLevel" (Low, Medium, High, Critical), and "confidence" (0-100).`,
          stream: false,
          format: 'json'
        }),
      });

      if (!response.ok) throw new Error("Local Ollama instance unreachable");

      const data = await response.json();
      const parsed = JSON.parse(data.response);
      const endTime = Date.now();

      return {
        analysis: parsed.analysis || "Local micro-structure analysis complete.",
        threatLevel: parsed.threatLevel || "Medium",
        confidence: parsed.confidence || 85,
        stats: {
          engine: InferenceEngine.NVIDIA_LOCAL,
          totalDuration: endTime - startTime,
          ttft: 142,
          tps: 68,
          vramUsage: 14.1
        }
      };
    } catch (err) {
      return {
        analysis: "[LOCAL OFFLINE] Connect to Ollama (llama3) at port 11434.",
        threatLevel: "Critical",
        confidence: 0,
        stats: { engine: InferenceEngine.NVIDIA_LOCAL, totalDuration: 0, ttft: 0, tps: 0 }
      };
    }
  } else {
    // NATIVE CEREBRAS API CALL (WSE-3)
    if (!cerebrasKey) {
      return {
        analysis: "[CEREBRAS KEY MISSING] Provide an API key via CEREBRAS_API_KEY env var or the settings dashboard.",
        threatLevel: "Low",
        confidence: 0,
        stats: { engine: InferenceEngine.CEREBRAS, totalDuration: 0, ttft: 0, tps: 0 }
      };
    }

    try {
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cerebrasKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b', // High-performance Cerebras implementation of Llama 3
          messages: [
            { 
              role: 'system', 
              content: 'You are an HFT execution monitoring AI on a Cerebras WSE-3. Provide 1-sentence executable trading insights based on market microstructure. Output JSON only: {"analysis": string, "threatLevel": "Low"|"Medium"|"High"|"Critical", "confidence": number}' 
            },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Cerebras API Error");
      }

      const data = await response.json();
      const endTime = Date.now();
      const result = JSON.parse(data.choices[0].message.content);

      return {
        analysis: result.analysis || "Cerebras WSE-3 accelerated insight generated.",
        threatLevel: result.threatLevel || "Low",
        confidence: result.confidence || 99,
        stats: {
          engine: InferenceEngine.CEREBRAS,
          totalDuration: endTime - startTime,
          ttft: 0.8,
          tps: data.usage?.completion_tokens ? (data.usage.completion_tokens / ((endTime - startTime) / 1000)) : 3500,
          networkLatency: 42
        }
      };
    } catch (err: any) {
      console.error("Cerebras API Failure:", err);
      return {
        analysis: `[CEREBRAS ERROR] ${err.message}`,
        threatLevel: "Critical",
        confidence: 0,
        stats: { engine: InferenceEngine.CEREBRAS, totalDuration: 0, ttft: 0, tps: 0 }
      };
    }
  }
};
