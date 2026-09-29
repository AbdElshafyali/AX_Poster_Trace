export function clamp(val, min = 0, max = 255) {
  return Math.min(max, Math.max(min, val));
}

export function adjustContrastBrightness(val, contrast = 1, brightness = 0) {
  return clamp((val - 128) * contrast + 128 + brightness);
}

export function getDrawBounds(
  sW,
  sH,
  targetWidth,
  targetHeight,
  panX = 0,
  panY = 0,
  scale = 1,
  fitMode = 'fit'
) {
  let drawW, drawH;
  const sRatio = sW / sH;
  const tRatio = targetWidth / targetHeight;
  if (fitMode === 'fill') {
    if (sRatio > tRatio) {
      drawH = targetHeight * scale;
      drawW = drawH * sRatio;
    } else {
      drawW = targetWidth * scale;
      drawH = drawW / sRatio;
    }
  } else {
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

  return { finalX, finalY, drawW, drawH };
}

export function renderPannedCanvas(
  sourceImgOrCanvas,
  targetWidth,
  targetHeight,
  panX = 0,
  panY = 0,
  scale = 1,
  fitMode = 'fit',
  transparentBg = false
) {
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');

  if (!transparentBg) {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
  }

  const sW = sourceImgOrCanvas.width;
  const sH = sourceImgOrCanvas.height;
  const { finalX, finalY, drawW, drawH } = getDrawBounds(
    sW,
    sH,
    targetWidth,
    targetHeight,
    panX,
    panY,
    scale,
    fitMode
  );

  ctx.drawImage(sourceImgOrCanvas, 0, 0, sW, sH, finalX, finalY, drawW, drawH);
  return canvas;
}

export function drawBackgroundFill(ctx, width, height, settings, bgImageCanvas = null, forPrint = false) {
  const bgType = settings.bgFillType || 'white';

  if (bgType === 'transparent') {
    if (forPrint) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
    } else {
      const size = 16;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#e2e8f0';
      for (let y = 0; y < height; y += size) {
        for (let x = 0; x < width; x += size) {
          if (((x / size) + (y / size)) % 2 === 0) {
            ctx.fillRect(x, y, size, size);
          }
        }
      }
    }
    return;
  }

  if (bgType === 'color') {
    ctx.fillStyle = settings.bgCustomColor || '#ffffff';
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (bgType === 'gradient') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, settings.bgGradientColor1 || '#e0f2fe');
    grad.addColorStop(1, settings.bgGradientColor2 || '#fef9c3');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    return;
  }

  if (bgType === 'image' && bgImageCanvas) {
    const sRatio = bgImageCanvas.width / bgImageCanvas.height;
    const tRatio = width / height;
    let dW, dH;
    if (sRatio > tRatio) {
      dH = height;
      dW = dH * sRatio;
    } else {
      dW = width;
      dH = dW / sRatio;
    }
    const dx = (width - dW) / 2;
    const dy = (height - dH) / 2;
    ctx.drawImage(bgImageCanvas, dx, dy, dW, dH);
    return;
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
}

export function applyGrayscale(
  ctx,
  width,
  height,
  contrast = 1,
  brightness = 0,
  faintInk = 1,
  cleanBackground = true,
  bgThreshold = 215,
  makeWhiteTransparent = false
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  const factor = clamp(faintInk, 0.01, 1);

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 15) {
      d[i + 3] = 0;
      continue;
    }
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
      if (makeWhiteTransparent) {
        d[i + 3] = 0;
      } else {
        d[i] = 255;
        d[i + 1] = 255;
        d[i + 2] = 255;
      }
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

export function applyColorAdjust(
  ctx,
  width,
  height,
  contrast = 1,
  brightness = 0,
  cleanBackground = false,
  bgThreshold = 215,
  makeWhiteTransparent = false
) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] < 15) {
      d[i + 3] = 0;
      continue;
    }
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    if (cleanBackground && gray >= bgThreshold) {
      if (makeWhiteTransparent) {
        d[i + 3] = 0;
      } else {
        d[i] = 255;
        d[i + 1] = 255;
        d[i + 2] = 255;
      }
      continue;
    }
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
  bgThreshold = 215,
  makeWhiteTransparent = false
) {
  const srcData = ctx.getImageData(0, 0, width, height);
  const src = srcData.data;
  const outData = ctx.createImageData(width, height);
  const out = outData.data;

  const gray = new Uint8ClampedArray(width * height);
  const alphaArr = new Uint8ClampedArray(width * height);

  for (let i = 0, j = 0; i < src.length; i += 4, j++) {
    alphaArr[j] = src[i + 3];
    if (src[i + 3] < 15) {
      gray[j] = 255;
      continue;
    }
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
      const outIdx = idx * 4;

      if (alphaArr[idx] < 15) {
        out[outIdx + 3] = 0;
        continue;
      }

      const gx =
        -gray[idx - width - 1] + gray[idx - width + 1] -
        2 * gray[idx - 1] + 2 * gray[idx + 1] -
        gray[idx + width - 1] + gray[idx + width + 1];

      const gy =
        -gray[idx - width - 1] - 2 * gray[idx - width] - gray[idx - width + 1] +
        gray[idx + width - 1] + 2 * gray[idx + width] + gray[idx + width + 1];

      const mag = Math.hypot(gx, gy);
      const isEdge = mag >= threshold;

      if (invert) {
        const val = isEdge ? 255 : minGray;
        out[outIdx] = val;
        out[outIdx + 1] = val;
        out[outIdx + 2] = val;
        out[outIdx + 3] = 255;
      } else {
        if (!isEdge && makeWhiteTransparent) {
          out[outIdx + 3] = 0;
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
  }

  ctx.putImageData(outData, 0, 0);
}

export function renderCompositeCanvas(
  sourceCanvas,
  targetWidth,
  targetHeight,
  settings,
  bgImageCanvas = null,
  forPrint = false
) {
  const hasCustomBg = (settings.bgFillType && settings.bgFillType !== 'white') || Boolean(bgImageCanvas);

  const fgCanvas = renderPannedCanvas(
    sourceCanvas,
    targetWidth,
    targetHeight,
    settings.panX || 0,
    settings.panY || 0,
    settings.scale || 1,
    settings.fitMode || 'fit',
    true
  );

  const fgCtx = fgCanvas.getContext('2d');

  if (settings.colorMode === 'trace') {
    applySobelTraceOutline(
      fgCtx,
      targetWidth,
      targetHeight,
      settings.faintInk,
      settings.threshold,
      settings.invert,
      settings.cleanBackground ?? true,
      settings.bgThreshold ?? 215,
      hasCustomBg
    );
  } else if (settings.colorMode === 'bw') {
    applyGrayscale(
      fgCtx,
      targetWidth,
      targetHeight,
      settings.contrast,
      0,
      settings.faintInk,
      settings.cleanBackground ?? true,
      settings.bgThreshold ?? 215,
      hasCustomBg
    );
  } else {
    applyColorAdjust(
      fgCtx,
      targetWidth,
      targetHeight,
      settings.contrast,
      0,
      settings.cleanBackground ?? false,
      settings.bgThreshold ?? 215,
      hasCustomBg
    );
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d');

  drawBackgroundFill(finalCtx, targetWidth, targetHeight, settings, bgImageCanvas, forPrint);
  finalCtx.drawImage(fgCanvas, 0, 0);

  return finalCanvas;
}
