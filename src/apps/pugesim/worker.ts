import { runSimulation } from './simulation';
import type { SimulationInput, SimulationResult } from './simulation';

export interface WorkerRequest {
  id: number;
  input: SimulationInput;
}

export interface WorkerResponse {
  id: number;
  results: [SimulationResult, SimulationResult];
}

self.onmessage = (e: MessageEvent<WorkerRequest>) => {
  const { id, input } = e.data;
  const results = runSimulation(input);
  self.postMessage({ id, results } satisfies WorkerResponse);
};
