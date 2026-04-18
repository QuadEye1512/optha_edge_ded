import { getBinarySession, getSeveritySession } from './modelLoader';
import { preprocessImage, preprocessImageInception } from './preprocessor';
import type {
  BinaryResult,
  SeverityResult,
  BinaryPrediction,
  SeverityPrediction,
} from '@/types/prediction';

const SEVERITY_LEVELS: SeverityResult['level'][] = [
  'No DR',
  'Mild',
  'Moderate',
  'Severe',
  'Proliferative',
];

// ── Helpers ──────────────────────────────────────────────────────────────────

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function softmax(logits: number[]): number[] {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - maxLogit));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sumExps);
}

// ── Binary (DR / Non-DR) ─────────────────────────────────────────────────────

function decodeBinary(rawOutput: Float32Array): BinaryResult {
  // Model may output a single logit (sigmoid) or a 2-class softmax
  let drProbability: number;

  if (rawOutput.length === 1) {
    drProbability = sigmoid(rawOutput[0]);
  } else {
    // Treat as [no-dr logit, dr logit] → softmax → take DR class
    const probs = softmax(Array.from(rawOutput));
    drProbability = probs[1];
  }

  const isDR = drProbability >= 0.5;
  return {
    prediction: isDR ? 'DR Detected' : 'No DR',
    probability: Math.round(drProbability * 10000) / 10000,
    confidence: Math.round((isDR ? drProbability : 1 - drProbability) * 10000) / 100,
  };
}

export async function runBinaryInference(imageBuffer: Buffer): Promise<BinaryPrediction> {
  const startTime = performance.now();

  const session = await getBinarySession();
  const inputTensor = await preprocessImage(imageBuffer);

  const feeds: Record<string, typeof inputTensor> = {};
  feeds[session.inputNames[0]] = inputTensor;

  const results = await session.run(feeds);
  const outputData = results[session.outputNames[0]].data as Float32Array;

  const binary = decodeBinary(outputData);
  const inferenceTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return { mode: 'binary', binary, inferenceTimeMs };
}

// ── Severity (EfficientNet-B0) ───────────────────────────────────────────────

function decodeSeverity(rawOutput: Float32Array): SeverityResult {
  const logits = Array.from(rawOutput);
  const probs = logits.length === 5 ? softmax(logits) : softmax(logits.slice(0, 5));

  const levelIndex = probs.indexOf(Math.max(...probs));
  // rawScore: weighted expected value on 0-4 scale for the progress bar
  const rawScore = probs.reduce((acc, p, i) => acc + p * i, 0);

  return {
    level: SEVERITY_LEVELS[levelIndex],
    rawScore: Math.round(rawScore * 10000) / 10000,
    levelIndex,
    probabilities: probs.map((p) => Math.round(p * 10000) / 10000),
  };
}

export async function runSeverityInference(imageBuffer: Buffer): Promise<SeverityPrediction> {
  const startTime = performance.now();

  const session = await getSeveritySession();
  const inputTensor = await preprocessImageInception(imageBuffer);

  const feeds: Record<string, typeof inputTensor> = {};
  feeds[session.inputNames[0]] = inputTensor;

  const results = await session.run(feeds);
  const outputData = results[session.outputNames[0]].data as Float32Array;

  const severity = decodeSeverity(outputData);
  const inferenceTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

  return { mode: 'severity', severity, inferenceTimeMs };
}
