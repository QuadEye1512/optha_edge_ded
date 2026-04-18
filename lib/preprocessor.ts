import sharp from 'sharp';
import * as ort from 'onnxruntime-node';

// ImageNet normalization (for the binary model)
const MEAN = [0.485, 0.456, 0.406];
const STD  = [0.229, 0.224, 0.225];

/** 224×224 with ImageNet normalization — for the binary DR model */
export async function preprocessImage(imageBuffer: Buffer): Promise<ort.Tensor> {
  const { data, info } = await sharp(imageBuffer)
    .resize(224, 224, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixelCount = width * height;
  const float32Data = new Float32Array(channels * pixelCount);

  for (let c = 0; c < channels; c++) {
    for (let i = 0; i < pixelCount; i++) {
      const v = data[i * channels + c] / 255.0;
      float32Data[c * pixelCount + i] = (v - MEAN[c]) / STD[c];
    }
  }

  return new ort.Tensor('float32', float32Data, [1, 3, 224, 224]);
}

/**
/**
 * 224×224 with ImageNet normalization — for the severity model (EfficientNet-B0)
 * The EfficientNet-B0 exported models expect 224×224 inputs and standard
 * ImageNet mean/std normalization.
 */
export async function preprocessImageInception(imageBuffer: Buffer): Promise<ort.Tensor> {
  const { data, info } = await sharp(imageBuffer)
    .resize(224, 224, { fit: 'cover' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixelCount = width * height;
  const float32Data = new Float32Array(channels * pixelCount);

  for (let c = 0; c < channels; c++) {
    for (let i = 0; i < pixelCount; i++) {
      const v = data[i * channels + c] / 255.0;
      float32Data[c * pixelCount + i] = (v - MEAN[c]) / STD[c];
    }
  }

  return new ort.Tensor('float32', float32Data, [1, 3, 224, 224]);
}
