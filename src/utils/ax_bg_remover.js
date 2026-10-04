export function cloneCanvas(srcCanvas) {
  const c = document.createElement('canvas');
  c.width = srcCanvas.width;
  c.height = srcCanvas.height;
  const ctx = c.getContext('2d');
  ctx.drawImage(srcCanvas, 0, 0);
  return c;
}

export function colorDistance(r1, g1, b1, r2, g2, b2) {
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11);
}

export function detectBorderBackgroundColors(imgData, width, height) {
  const d = imgData.data;
  const samples = [];
  const stepX = Math.max(1, Math.floor(width / 20));
  const stepY = Math.max(1, Math.floor(height / 20));

  const addSample = (x, y) => {
    const idx = (y * width + x) * 4;
    if (d[idx + 3] > 128) {
      samples.push([d[idx], d[idx + 1], d[idx + 2]]);
    }
  };

  for (let x = 0; x < width; x += stepX) {
    addSample(x, 0);
    addSample(x, height - 1);
  }
  for (let y = 0; y < height; y += stepY) {
    addSample(0, y);
    addSample(width - 1, y);
  }

  if (samples.length === 0) return [[255, 255, 255]];
  return samples;
}

export function autoRemoveBackground(targetCanvas, originalCanvas, tolerance = 38, contiguousOnly = true) {
  const width = targetCanvas.width;
  const height = targetCanvas.height;
  const ctx = targetCanvas.getContext('2d');
  const srcCtx = (originalCanvas || targetCanvas).getContext('2d');
  const srcData = srcCtx.getImageData(0, 0, width, height);
  const outData = ctx.getImageData(0, 0, width, height);
  const d = srcData.data;
  const out = outData.data;

  const bgSamples = detectBorderBackgroundColors(srcData, width, height);

  const isBgMatch = (r, g, b) => {
    for (let i = 0; i < bgSamples.length; i++) {
      const s = bgSamples[i];
      if (colorDistance(r, g, b, s[0], s[1], s[2]) <= tolerance) {
        return true;
      }
    }
    return false;
  };

  if (!contiguousOnly) {
    for (let i = 0; i < d.length; i += 4) {
      if (isBgMatch(d[i], d[i + 1], d[i + 2])) {
        out[i + 3] = 0;
      }
    }
    softenAlphaEdges(out, width, height);
    ctx.putImageData(outData, 0, 0);
    return;
  }

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const pushIfValid = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    const idx = pos * 4;
    if (isBgMatch(d[idx], d[idx + 1], d[idx + 2])) {
      visited[pos] = 1;
      queue[tail++] = pos;
    }
  };

  for (let x = 0; x < width; x++) {
    pushIfValid(x, 0);
    pushIfValid(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfValid(0, y);
    pushIfValid(width - 1, y);
  }

  while (head < tail) {
    const pos = queue[head++];
    const idx = pos * 4;
    out[idx + 3] = 0;

    const x = pos % width;
    const y = (pos - x) / width;

    if (x > 0) pushIfValid(x - 1, y);
    if (x < width - 1) pushIfValid(x + 1, y);
    if (y > 0) pushIfValid(x, y - 1);
    if (y < height - 1) pushIfValid(x, y + 1);
  }

  softenAlphaEdges(out, width, height);
  ctx.putImageData(outData, 0, 0);
}

export function magicWandRemoveAtPoint(targetCanvas, startX, startY, tolerance = 32, contiguous = true) {
  const width = targetCanvas.width;
  const height = targetCanvas.height;
  if (startX < 0 || startX >= width || startY < 0 || startY >= height) return;

  const ctx = targetCanvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;

  const startIdx = (startY * width + startX) * 4;
  const tr = d[startIdx];
  const tg = d[startIdx + 1];
  const tb = d[startIdx + 2];

  if (!contiguous) {
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] > 0 && colorDistance(d[i], d[i + 1], d[i + 2], tr, tg, tb) <= tolerance) {
        d[i + 3] = 0;
      }
    }
    softenAlphaEdges(d, width, height);
    ctx.putImageData(imgData, 0, 0);
    return;
  }

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  let head = 0;
  let tail = 0;

  const startPos = startY * width + startX;
  visited[startPos] = 1;
  queue[tail++] = startPos;

  while (head < tail) {
    const pos = queue[head++];
    const idx = pos * 4;
    d[idx + 3] = 0;

    const x = pos % width;
    const y = (pos - x) / width;

    const neighbors = [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1]
    ];

    for (let n = 0; n < 4; n++) {
      const nx = neighbors[n][0];
      const ny = neighbors[n][1];
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const nPos = ny * width + nx;
        if (!visited[nPos]) {
          const nIdx = nPos * 4;
          if (d[nIdx + 3] > 0 && colorDistance(d[nIdx], d[nIdx + 1], d[nIdx + 2], tr, tg, tb) <= tolerance) {
            visited[nPos] = 1;
            queue[tail++] = nPos;
          }
        }
      }
    }
  }

  softenAlphaEdges(d, width, height);
  ctx.putImageData(imgData, 0, 0);
}

export function softenAlphaEdges(data, width, height) {
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      if (data[idx + 3] > 0) {
        const up = data[((y - 1) * width + x) * 4 + 3];
        const down = data[((y + 1) * width + x) * 4 + 3];
        const left = data[(y * width + (x - 1)) * 4 + 3];
        const right = data[(y * width + (x + 1)) * 4 + 3];
        if (up === 0 || down === 0 || left === 0 || right === 0) {
          data[idx + 3] = Math.round((data[idx + 3] + up + down + left + right) / 5);
        }
      }
    }
  }
}

export function applyBrushStroke(
  workingCanvas,
  originalCanvas,
  x0,
  y0,
  x1,
  y1,
  radius,
  mode = 'erase'
) {
  const ctx = workingCanvas.getContext('2d');
  const dist = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil(dist / Math.max(1, radius * 0.25)));

  ctx.save();
  for (let i = 0; i <= steps; i++) {
    const t = steps === 0 ? 0 : i / steps;
    const cx = x0 + (x1 - x0) * t;
    const cy = y0 + (y1 - y0) * t;

    if (mode === 'erase') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,1)';
      ctx.fill();
    } else if (mode === 'restore' && originalCanvas) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(originalCanvas, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

export function findContentBoundingBox(canvas, tolerance = 24) {
  const width = canvas.width;
  const height = canvas.height;
  const ctx = canvas.getContext('2d');
  const imgData = ctx.getImageData(0, 0, width, height);
  const d = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const alpha = d[idx + 3];
      if (alpha > 20) {
        const r = d[idx];
        const g = d[idx + 1];
        const b = d[idx + 2];
        const isWhite = r >= (255 - tolerance) && g >= (255 - tolerance) && b >= (255 - tolerance);
        if (!isWhite) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  }

  if (maxX < minX || maxY < minY) {
    return null;
  }

  return { minX, minY, maxX, maxY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

export function cropCanvas(sourceCanvas, cropX, cropY, cropW, cropH) {
  const w = Math.max(1, Math.round(cropW));
  const h = Math.max(1, Math.round(cropH));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  ctx.drawImage(sourceCanvas, cropX, cropY, cropW, cropH, 0, 0, w, h);
  return c;
}

export function autoTrimCanvas(sourceCanvas, padding = 12, tolerance = 24) {
  const box = findContentBoundingBox(sourceCanvas, tolerance);
  if (!box) return null;

  const x0 = Math.max(0, box.minX - padding);
  const y0 = Math.max(0, box.minY - padding);
  const x1 = Math.min(sourceCanvas.width, box.maxX + 1 + padding);
  const y1 = Math.min(sourceCanvas.height, box.maxY + 1 + padding);

  return cropCanvas(sourceCanvas, x0, y0, x1 - x0, y1 - y0);
}
