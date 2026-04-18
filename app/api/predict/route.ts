import { NextRequest } from 'next/server';
import { runBinaryInference, runSeverityInference } from '@/lib/inference';
import type { ApiResponse } from '@/types/prediction';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File | null;
    const mode = (formData.get('mode') as string | null) ?? 'binary';

    if (!file) {
      return Response.json(
        { success: false, error: 'No image file provided. Send as form-data with key "image".' } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json(
        { success: false, error: `Invalid file type "${file.type}". Only JPG and PNG are accepted.` } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { success: false, error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum is 10MB.` } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = mode === 'severity'
      ? await runSeverityInference(buffer)
      : await runBinaryInference(buffer);

    return Response.json({ success: true, result } satisfies ApiResponse);
  } catch (error) {
    console.error('[OpthaEdgeDR] Prediction error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return Response.json(
      { success: false, error: `Prediction failed: ${message}` } satisfies ApiResponse,
      { status: 500 }
    );
  }
}
