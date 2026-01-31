
# Sentinel Dual-Engine Risk Framework

Sentinel is a high-performance risk assessment platform that allows real-time switching between Cloud-scale inference (Cerebras) and Private Local execution (NVIDIA GPU).

## 1. Frontend Development Setup

To run the Sentinel UI locally on your machine:

1. **Prerequisites**: Ensure you have [Node.js](https://nodejs.org/) installed (which includes `npm`).
2. **Initialize Project**:
   ```bash
   # Create a new directory and enter it
   mkdir sentinel-app && cd sentinel-app
   
   # Initialize a Vite project (React + TypeScript)
   npm create vite@latest . -- --template react-ts
   
   # Install dependencies used in this app
   npm install lucide-react recharts @google/genai
   ```
3. **Copy Files**: Place the `App.tsx`, `index.html`, `types.ts`, and the `components/` & `services/` folders into your local project structure.
4. **Run Development Server**:
   ```bash
   npm run dev
   ```
5. **Access the App**: Open your browser to `http://localhost:5173`.

---

## 2. Local NVIDIA Setup (Ollama)

To utilize the **NVIDIA Local Mode**, you must have a local LLM server running on your machine using **Ollama**.

### Setup Steps

1.  **Install Ollama**: Download and install from [ollama.com](https://ollama.com).
2.  **Pull a Risk Model**: Open your terminal and pull a high-reasoning model:
    ```bash
    ollama pull llama3
    ```
3.  **Ensure API Accessibility**: Ollama serves an OpenAI-compatible API by default on `http://localhost:11434/v1`.
4.  **Hardware Optimization**: Ensure your NVIDIA GPU (RTX 3090/4090 recommended) is correctly recognized by Ollama. You can check this by running `ollama run llama3` and monitoring your GPU usage in Task Manager or `nvidia-smi`.

---

## 3. Architecture Overview

-   **Cloud Engine (Cerebras)**: Routes requests via the Cerebras SDK for sub-second inference on Wafer-Scale Engines. Best for high-throughput, non-private data.
-   **Local Engine (NVIDIA/Ollama)**: Routes requests via the local loopback to your GPU. Best for sensitive data privacy, offline testing, and cost-free execution.

## 4. Hardware Requirements

-   **NVIDIA RTX GPU**: Pascal architecture or newer (Ampere/Ada Lovelace preferred for FP16/BF16 performance).
-   **VRAM**: 
    - 8GB for Llama3 8B (Quantized)
    - 24GB for Llama3 70B (Quantized) or larger models.
-   **Drivers**: Latest NVIDIA Game Ready or Studio drivers.

## 5. Integration Details

The system tracks and compares:
1. **Network Latency**: Time for packets to reach Cerebras Cloud.
2. **VRAM Latency**: Time for the local GPU to process weights and generate tokens via Ollama.
