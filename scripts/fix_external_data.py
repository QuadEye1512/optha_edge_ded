"""
fix_external_data.py
--------------------
Inline external .onnx.data sidecars into their ONNX files so ONNX Runtime
can load the model directly from a buffer without looking for external files.

Usage:
    python scripts/fix_external_data.py [model_filename.onnx ...]

If no filenames are provided, the script will attempt to fix both:
  - efficientnet_b0_binary.onnx
  - efficientnet_b0_severity.onnx

Requires: pip install onnx
"""

import os
import shutil
import sys
import onnx
from onnx.external_data_helper import load_external_data_for_model

ROOT = os.path.join(os.path.dirname(__file__), '..')
MODELS_DIR = os.path.join(ROOT, 'models')

DEFAULTS = [
    'efficientnet_b0_binary.onnx',
    'efficientnet_b0_severity.onnx',
]


def fix_model(filename: str):
    src = os.path.join(MODELS_DIR, filename)
    if not os.path.exists(src):
        print(f'SKIP: model not found: {src}')
        return

    data_file = src + '.data'
    if not os.path.exists(data_file):
        print(f'OK: no external data for {filename} — nothing to do')
        return

    bak = src + '.bak'
    print(f'Loading model: {src}')
    model = onnx.load(src, load_external_data=False)
    print(f'Inlining external data from: {data_file}')
    load_external_data_for_model(model, MODELS_DIR)
    shutil.copy2(src, bak)
    onnx.save(model, src)
    print(f'Fixed and saved: {src} (backup: {bak})')


def main():
    targets = sys.argv[1:] or DEFAULTS
    for t in targets:
        fix_model(t)


if __name__ == '__main__':
    main()
