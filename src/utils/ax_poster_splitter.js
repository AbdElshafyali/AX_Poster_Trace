export const A4_RATIO_PORTRAIT = 210 / 297;
export const A4_RATIO_LANDSCAPE = 297 / 210;

export function getA4Dimensions(orientation = 'portrait', dpi = 150) {
  const mmToInch = 1 / 25.4;
  if (orientation === 'landscape') {
    return {
      width: Math.round(297 * mmToInch * dpi),
      height: Math.round(210 * mmToInch * dpi)
    };
  }
  return {
    width: Math.round(210 * mmToInch * dpi),
    height: Math.round(297 * mmToInch * dpi)
  };
}

export function getPosterTargetDimensions(cols = 1, rows = 1, orientation = 'portrait', itemCanvas = null) {
  const pageWmm = orientation === 'landscape' ? 297 : 210;
  const pageHmm = orientation === 'landscape' ? 210 : 297;
  const totalWmm = Math.max(1, cols) * pageWmm;
  const totalHmm = Math.max(1, rows) * pageHmm;
  const ratio = totalWmm / totalHmm;

  const maxSource = itemCanvas ? Math.max(itemCanvas.width, itemCanvas.height) : 2000;
  const baseRes = Math.max(2000, Math.min(3600, maxSource));

  let width, height;
  if (ratio >= 1) {
    width = baseRes;
    height = Math.round(baseRes / ratio);
  } else {
    height = baseRes;
    width = Math.round(baseRes * ratio);
  }
  return { width, height, ratio, totalWmm, totalHmm };
}

export function createTileCanvas(
  sourceCanvas,
  sx,
  sy,
  sWidth,
  sHeight,
  targetWidth,
  targetHeight,
  marginPx = 0
) {
  const tileCanvas = document.createElement('canvas');
  tileCanvas.width = targetWidth;
  tileCanvas.height = targetHeight;
  const ctx = tileCanvas.getContext('2d');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  const drawX = marginPx;
  const drawY = marginPx;
  const drawW = Math.max(1, targetWidth - (2 * marginPx));
  const drawH = Math.max(1, targetHeight - (2 * marginPx));

  ctx.drawImage(sourceCanvas, sx, sy, sWidth, sHeight, drawX, drawY, drawW, drawH);
  return tileCanvas;
}

export function drawCutGuides(
  ctx,
  width,
  height,
  pageNum,
  totalPages,
  col,
  row,
  marginPx = 0,
  overlapPx = 0
) {
  ctx.save();

  const safeLeft = marginPx;
  const safeTop = marginPx;
  const safeRight = width - marginPx;
  const safeBottom = height - marginPx;
  const safeW = safeRight - safeLeft;
  const safeH = safeBottom - safeTop;

  if (marginPx > 0) {
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(safeLeft, safeTop, safeW, safeH);
  }

  if (overlapPx > 0 && col > 0) {
    const cutX = safeLeft + overlapPx;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(cutX, safeTop);
    ctx.lineTo(cutX, safeBottom);
    ctx.stroke();

    ctx.fillStyle = '#e11d48';
    ctx.font = 'bold 11px Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✂ خط القص واللصق', cutX + 2, safeTop + 24);
  }

  if (overlapPx > 0 && row > 0) {
    const cutY = safeTop + overlapPx;
    ctx.strokeStyle = '#f43f5e';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(safeLeft, cutY);
    ctx.lineTo(safeRight, cutY);
    ctx.stroke();
  }

  ctx.setLineDash([]);
  ctx.fillStyle = '#0a2540';
  ctx.font = 'bold 12px monospace, Tahoma';
  ctx.textAlign = 'right';
  ctx.fillText(
    `صفحة ${pageNum} من ${totalPages} [عمود ${col + 1}، صف ${row + 1}]`,
    safeRight - 10,
    safeBottom - 10
  );

  const markLen = 16;
  const corners = [
    [safeLeft, safeTop, 1, 1],
    [safeRight, safeTop, -1, 1],
    [safeLeft, safeBottom, 1, -1],
    [safeRight, safeBottom, -1, -1]
  ];

  ctx.strokeStyle = '#0a2540';
  ctx.lineWidth = 1.5;
  for (const [cx, cy, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + dx * markLen, cy);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy + dy * markLen);
    ctx.stroke();
  }

  ctx.restore();
}

export function checkIfTileIsBlank(canvas, marginPx = 0) {
  try {
    const ctx = canvas.getContext('2d');
    const safeX = marginPx + 4;
    const safeY = marginPx + 4;
    const safeW = Math.max(1, canvas.width - (2 * marginPx) - 8);
    const safeH = Math.max(1, canvas.height - (2 * marginPx) - 8);

    const imgData = ctx.getImageData(safeX, safeY, safeW, safeH);
    const data = imgData.data;
    let nonWhitePixels = 0;
    const step = 32;
    let sampledCount = 0;

    for (let i = 0; i < data.length; i += step) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      sampledCount++;
      if (r < 242 || g < 242 || b < 242) {
        nonWhitePixels++;
      }
    }

    const ratio = nonWhitePixels / Math.max(1, sampledCount);
    return ratio < 0.0008;
  } catch {
    return false;
  }
}

export function generatePosterTiles(
  sourceCanvas,
  cols = 1,
  rows = 1,
  orientation = 'portrait',
  showGuides = true,
  overlapMm = 10,
  marginMm = 5
) {
  const tiles = [];
  const dpi = 200;
  const a4 = getA4Dimensions(orientation, dpi);
  const totalTiles = cols * rows;

  const mmToPx = dpi / 25.4;
  const marginPx = Math.round(Math.max(0, marginMm) * mmToPx);
  const overlapPx = Math.round(Math.max(0, overlapMm) * mmToPx);

  const tileSourceWidth = sourceCanvas.width / cols;
  const tileSourceHeight = sourceCanvas.height / rows;

  const pageWmm = orientation === 'landscape' ? 297 : 210;
  const pageHmm = orientation === 'landscape' ? 210 : 297;
  const overlapSrcX = tileSourceWidth * (overlapMm / pageWmm);
  const overlapSrcY = tileSourceHeight * (overlapMm / pageHmm);

  let pageIndex = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sx = Math.max(0, c * tileSourceWidth - (c > 0 ? overlapSrcX : 0));
      const sy = Math.max(0, r * tileSourceHeight - (r > 0 ? overlapSrcY : 0));
      const sw = Math.min(
        sourceCanvas.width - sx,
        tileSourceWidth + (c > 0 ? overlapSrcX : 0)
      );
      const sh = Math.min(
        sourceCanvas.height - sy,
        tileSourceHeight + (r > 0 ? overlapSrcY : 0)
      );

      const tileCanvas = createTileCanvas(
        sourceCanvas,
        sx,
        sy,
        sw,
        sh,
        a4.width,
        a4.height,
        marginPx
      );

      const isBlank = checkIfTileIsBlank(tileCanvas, marginPx);

      if (showGuides && totalTiles > 1) {
        const ctx = tileCanvas.getContext('2d');
        drawCutGuides(
          ctx,
          a4.width,
          a4.height,
          pageIndex,
          totalTiles,
          c,
          r,
          marginPx,
          overlapPx
        );
      }

      tiles.push({
        col: c,
        row: r,
        pageNumber: pageIndex,
        totalCount: totalTiles,
        canvas: tileCanvas,
        dataUrl: tileCanvas.toDataURL('image/jpeg', 0.95),
        orientation,
        marginMm,
        overlapMm,
        isBlank
      });
      pageIndex++;
    }
  }

  return tiles;
}
