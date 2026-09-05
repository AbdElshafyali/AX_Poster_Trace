export function clamp(val, min = 0, max = 255) {
  return Math.min(max, Math.max(min, val));
}

export function adjustContrastBrightness(val, contrast = 1, brightness = 0) {
  return clamp((val - 128) * contrast + 128 + brightness);
}

export function renderPannedCanvas(
  sourceImgOrCanvas,
  targetWidth,
  targetHeight,
  panX = 0,
  panY = 0,
  scale = 1,
  fitMode = 'fit'
) {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  const sW = sourceImgOrCanvas.width;
  const sH = sourceImgOrCanvas.height;

  let drawW, drawH;
  if (fitMode === 'fill') {
    const sRatio = sW / sH;
    const tRatio = targetWidth / targetHeight;
    if (sRatio > tRatio) {
      drawH = targetHeight * scale;
      drawW = drawH * sRatio;
    } else {
      drawW = targetWidth * scale;
      drawH = drawW / sRatio;
    }
  } else {
    const sRatio = sW / sH;
    const tRatio = targetWidth / targetHeight;
    if (sRatio > tRatio) {
      drawW = targetWidth * scale;
      drawH = drawW / sRatio;
    } else {
      drawH = targetHeight * scale;
      drawW = drawH * sRatio;
    }
  }

  const centerX = (targetWidth - drawW) / 2;
  const centerY = (targetHeight - drawH) / 2;

  const finalX = centerX + (panX * targetWidth / 100);
  const finalY = centerY + (panY * targetHeight / 100);

  ctx.drawImage(sourceImgOrCanvas, 0, 0, sW, sH, finalX, finalY, drawW, drawH);
  return canvas;
}

export function applyWhiteBackgroundCleaner(ctx, width, height, bgThreshold = 215, faintInk = 1) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  const factor = clamp(faintInk, 0.01, 1);

  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    let finalVal;
    if (gray >= bgThreshold) {
      finalVal = 255;
    } else {
      const normalized = Math.round((gray / bgThreshold) * 255);
      finalVal = Math.round(255 - ((255 - normalized) * factor));
    }
    d[i] = finalVal;
    d[i + 1] = finalVal;
    d[i + 2] = finalVal;
  }
  ctx.putImageData(imgData, 0, 0);
}

export function applyGrayscale(
  ctx,
  width,
  height,
  contrast = 1,
  brightness = 0,
  faintInk = 1,
  cleanBackground = true,
  bgThreshold = 215
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  const factor = clamp(faintInk, 0.01, 1);

  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    let baseVal = gray;

    if (cleanBackground) {
      if (gray >= bgThreshold) {
        baseVal = 255;
      } else {
        baseVal = Math.round((gray / bgThreshold) * 255);
      }
    }

    if (baseVal < 255) {
      const adjusted = adjustContrastBrightness(baseVal, contrast, brightness);
      const finalVal = Math.round(255 - ((255 - adjusted) * factor));
      d[i] = finalVal;
      d[i + 1] = finalVal;
      d[i + 2] = finalVal;
    } else {
      d[i] = 255;
      d[i + 1] = 255;
      d[i + 2] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

export function applyColorAdjust(ctx, width, height, contrast = 1, brightness = 0) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = adjustContrastBrightness(d[i], contrast, brightness);
    d[i + 1] = adjustContrastBrightness(d[i + 1], contrast, brightness);
    d[i + 2] = adjustContrastBrightness(d[i + 2], contrast, brightness);
  }
  ctx.putImageData(imgData, 0, 0);
}

export function applySobelTraceOutline(
  ctx,
  width,
  height,
  faintInk = 0.06,
  threshold = 30,
  invert = false,
  cleanBackground = true,
  bgThreshold = 215
) {
  const srcData = ctx.getImageData(0, 0, width, height);
  const src = srcData.data;
  const outData = ctx.createImageData(width, height);
  const out = outData.data;

  const gray = new Uint8ClampedArray(width * height);
  for (let i = 0, j = 0; i < src.length; i += 4, j++) {
    const g = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
    if (cleanBackground && g >= bgThreshold) {
      gray[j] = 255;
    } else {
      gray[j] = g;
    }
  }

  const factor = clamp(faintInk, 0.01, 1);
  const minGray = Math.round(255 - (255 * factor));

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const gx =
        -gray[idx - width - 1] + gray[idx - width + 1] -
        2 * gray[idx - 1] + 2 * gray[idx + 1] -
        gray[idx + width - 1] + gray[idx + width + 1];

      const gy =
        -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1] +
        gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];

      const mag = Math.hypot(gx, gy);
      const isEdge = mag >= threshold;
      const outIdx = idx * 4;

      if (invert) {
        const val = isEdge ? 255 : minGray;
        out[outIdx] = val;
        out[outIdx + 1] = val;
        out[outIdx + 2] = val;
        out[outIdx + 3] = 255;
      } else {
        const edgeIntensity = clamp(mag / 255);
        const lineVal = Math.round(255 - ((255 - minGray) * edgeIntensity));
        const val = isEdge ? lineVal : 255;
        out[outIdx] = val;
        out[outIdx + 1] = val;
        out[outIdx + 2] = val;
        out[outIdx + 3] = 255;
      }
    }
  }

  for (let x = 0; x < width; x++) {
    const topIdx = x * 4;
    const botIdx = ((height - 1) * width + x) * 4;
    out[topIdx] = 255; out[topIdx + 1] = 255; out[topIdx + 2] = 255; out[topIdx + 3] = 255;
    out[botIdx] = 255; out[botIdx + 1] = 255; out[botIdx + 2] = 255; out[botIdx + 3] = 255;
  }
  for (let y = 0; y < height; y++) {
    const leftIdx = (y * width) * 4;
    const rightIdx = (y * width + (width - 1)) * 4;
    out[leftIdx] = 255; out[leftIdx + 1] = 255; out[leftIdx + 2] = 255; out[leftIdx + 3] = 255;
    out[rightIdx] = 255; out[rightIdx + 1] = 255; out[rightIdx + 2] = 255; out[rightIdx + 3] = 255;
  }

  ctx.putImageData(outData, 0, 0);
}
