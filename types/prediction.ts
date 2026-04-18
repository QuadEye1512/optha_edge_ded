export interface BinaryResult {
  prediction: 'DR Detected' | 'No DR';
  probability: number; // 0-1 sigmoid output
  confidence: number;  // percentage 0-100
}

export interface SeverityResult {
  level: 'No DR' | 'Mild' | 'Moderate' | 'Severe' | 'Proliferative';
  rawScore: number;    // mapped 0-4 for the progress bar
  levelIndex: number;  // 0-4 integer
  probabilities: number[]; // per-class softmax probabilities (5 values)
}

export interface BinaryPrediction {
  mode: 'binary';
  binary: BinaryResult;
  inferenceTimeMs: number;
}

export interface SeverityPrediction {
  mode: 'severity';
  severity: SeverityResult;
  inferenceTimeMs: number;
}

export type PredictionResult = BinaryPrediction | SeverityPrediction;

export interface ApiResponse {
  success: boolean;
  result?: PredictionResult;
  error?: string;
}
