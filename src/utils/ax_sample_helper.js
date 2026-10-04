import { cloneCanvas } from './ax_bg_remover';

export function createSamplePosterItem(defaultSettings) {
  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 1200;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 1200);

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(800, 520, 260, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 14;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(710, 470, 25, 0, Math.PI * 2);
  ctx.arc(890, 470, 25, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(800, 540, 140, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  ctx.font = 'bold 56px sans-serif';
  ctx.fillStyle = '#0a2540';
  ctx.textAlign = 'center';
  ctx.fillText('نموذج تجريبي لإزالة الخلفية والشف والتقسيم', 800, 950);

  const sampleId = `sample_${Date.now()}`;
  return {
    id: sampleId,
    name: 'رسمة_نموذجية.png',
    canvas,
    originalCanvas: cloneCanvas(canvas),
    undoStack: [],
    dataUrl: canvas.toDataURL('image/png'),
    width: 1600,
    height: 1200,
    settings: { ...defaultSettings }
  };
}
