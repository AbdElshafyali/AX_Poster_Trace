import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Loader2, Printer } from 'lucide-react';
import { applyGrayscale, applySobelTraceOutline, applyColorAdjust, renderPannedCanvas } from '../../utils/ax_image_filters';
import { getPosterTargetDimensions } from '../../utils/ax_poster_splitter';

export default function AX_PosterCanvasPreview({ item, settings, onPreparePrint, onPanChange, onScaleChange, onFitModeChange }) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  useEffect(() => {
    if (!item || !item.canvas) return;
    setIsProcessing(true);

    const timer = setTimeout(() => {
      renderProcessedImage();
      setIsProcessing(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [item, settings]);

  const renderProcessedImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !item || !item.canvas) return;

    const sourceCanvas = item.canvas;
    const { width: targetW, height: targetH } = getPosterTargetDimensions(
      settings.cols,
      settings.rows,
      settings.orientation,
      sourceCanvas
    );

    const panned = renderPannedCanvas(
      sourceCanvas,
      targetW,
      targetH,
      settings.panX || 0,
      settings.panY || 0,
      settings.scale || 1,
      settings.fitMode || 'fit'
    );

    canvas.width = panned.width;
    canvas.height = panned.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(panned, 0, 0);

    if (settings.colorMode === 'trace') {
      applySobelTraceOutline(
        ctx,
        canvas.width,
        canvas.height,
        settings.faintInk,
        settings.threshold,
        settings.invert,
        settings.cleanBackground ?? true,
        settings.bgThreshold ?? 215
      );
    } else if (settings.colorMode === 'bw') {
      applyGrayscale(
        ctx,
        canvas.width,
        canvas.height,
        settings.contrast,
        0,
        settings.faintInk,
        settings.cleanBackground ?? true,
        settings.bgThreshold ?? 215
      );
    } else if (settings.colorMode === 'color') {
      applyColorAdjust(ctx, canvas.width, canvas.height, settings.contrast, 0);
    }
  };

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: settings.panX || 0,
      panY: settings.panY || 0
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !onPanChange) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const stepX = (dx / 300) * 50;
    const stepY = (dy / 250) * 50;
    const newPanX = Math.round(dragStartRef.current.panX + stepX);
    const newPanY = Math.round(dragStartRef.current.panY + stepY);
    onPanChange(newPanX, newPanY);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const shiftPan = (dx, dy) => {
    if (!onPanChange) return;
    onPanChange((settings.panX || 0) + dx, (settings.panY || 0) + dy);
  };

  const resetPan = () => {
    if (!onPanChange) return;
    onPanChange(0, 0);
  };

  const handleWheel = (e) => {
    if (e.ctrlKey && onScaleChange) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.05 : -0.05;
      const next = Math.max(0.25, Math.min(4.0, parseFloat(((settings.scale || 1) + delta).toFixed(2))));
      onScaleChange(next);
    }
  };

  if (!item) {
    return null;
  }

  const cols = settings.cols || 1;
  const rows = settings.rows || 1;
  const totalPages = cols * rows;

  const a4WidthMm = settings.orientation === 'landscape' ? 297 : 210;
  const a4HeightMm = settings.orientation === 'landscape' ? 210 : 297;
  const totalWidthCm = ((cols * a4WidthMm) / 10).toFixed(1);
  const totalHeightCm = ((rows * a4HeightMm) / 10).toFixed(1);

  return (
    <div
      onMouseUp={handleMouseUp}
      className="bg-white flex flex-col h-full overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-[#e2e8f0] bg-[#f8fafc] flex-wrap gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-extrabold text-[#0a2540]">
            المعاينة الحية لتقسيم البوستر:
          </span>
          <span className="bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] text-xs font-extrabold px-3 py-1 rounded-[20px]">
            {cols} أعمدة × {rows} صفوف ({totalPages} صفحات A4)
          </span>
          <span className="text-[11px] font-mono text-[#64748b] bg-white border border-[#e2e8f0] px-2 py-0.5 rounded-[12px]">
            المقاس الكلي: {totalWidthCm} سم × {totalHeightCm} سم
          </span>
          <span className="text-[11px] font-bold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-0.5 rounded-[12px]">
            حجم الرسمة: {Math.round((settings.scale || 1) * 100)}%
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {onPreparePrint && (
            <button
              type="button"
              onClick={onPreparePrint}
              className="flex items-center gap-1.5 text-xs font-extrabold text-white bg-[#0a2540] hover:bg-[#123961] px-4 py-1.5 rounded-[30px] shadow hover:-translate-y-0.5 transition-all"
            >
              <Printer size={14} />
              <span>معاينة واختيار الصفحات للطباعة</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-white border border-[#cbd5e1] p-1 rounded-[30px] shadow-sm">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
              className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#475569] transition-colors"
            >
              <ZoomOut size={14} />
            </button>
            <span className="text-[11px] font-mono font-bold text-[#0a2540] px-1 min-w-[42px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
              className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#475569] transition-colors"
            >
              <ZoomIn size={14} />
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#475569] transition-colors"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div
        onMouseMove={handleMouseMove}
        className="flex-1 overflow-auto p-3 sm:p-6 bg-[#f1f5f9] flex flex-col items-center justify-center min-h-0 relative"
      >
        {isProcessing && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0a2540] bg-white px-4 py-2 rounded-[30px] shadow-md border border-[#e2e8f0]">
              <Loader2 size={16} className="animate-spin text-[#0a2540]" />
              <span>جاري معالجة الفلتر والخطوط...</span>
            </div>
          </div>
        )}

        <div
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className={`transition-transform duration-150 relative shadow-2xl rounded-sm bg-white overflow-hidden select-none ${
            isDragging ? 'cursor-grabbing ring-2 ring-[#0a2540]' : 'cursor-grab'
          }`}
        >
          <canvas ref={canvasRef} className="max-w-[85vw] lg:max-w-[70vw] max-h-[32vh] sm:max-h-[50vh] lg:max-h-[68vh] object-contain block pointer-events-none" />

          <div
            className="absolute inset-0 pointer-events-none grid"
            style={{
              gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`
            }}
          >
            {Array.from({ length: totalPages }).map((_, idx) => {
              const colIdx = idx % cols;
              const rowIdx = Math.floor(idx / cols);
              return (
                <div
                  key={idx}
                  className="border border-[#0284c7]/40 border-dashed relative flex items-center justify-center bg-sky-500/5"
                >
                  <span className="bg-[#0a2540]/80 text-white font-mono text-[11px] font-bold px-2 py-0.5 rounded-[12px] shadow">
                    صفحة {idx + 1}
                  </span>
                  <span className="absolute bottom-1 right-1 text-[9px] text-[#0369a1] font-mono font-bold bg-white/90 px-1 rounded">
                    [{colIdx + 1}, {rowIdx + 1}]
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2.5 bg-white/95 backdrop-blur-xs border border-[#cbd5e1] px-4 py-2 rounded-[30px] shadow-sm z-10 flex-wrap justify-center">
          {onScaleChange && (
            <div className="flex items-center gap-1.5 border-l border-[#cbd5e1] pl-3 ml-1">
              <span className="text-[11px] font-extrabold text-[#0a2540] flex items-center gap-1">
                <Maximize2 size={13} />
                <span>تكبير الرسمة:</span>
              </span>

              <button
                type="button"
                onClick={() => onScaleChange(Math.max(0.2, parseFloat(((settings.scale || 1) - 0.1).toFixed(2))))}
                className="w-7 h-7 flex items-center justify-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0a2540] font-extrabold rounded-full transition-all text-xs"
                title="تصغير (-10%)"
              >
                -
              </button>

              <button
                type="button"
                onClick={() => onScaleChange(1)}
                className="min-w-[48px] px-2 py-0.5 text-[11px] font-mono font-extrabold text-[#0a2540] bg-[#e0f2fe] border border-[#bae6fd] rounded-[14px] hover:bg-[#bae6fd] transition-all text-center"
                title="اضغط للرجوع للوضع الطبيعي 100%"
              >
                {Math.round((settings.scale || 1) * 100)}%
              </button>

              <button
                type="button"
                onClick={() => onScaleChange(Math.min(4.0, parseFloat(((settings.scale || 1) + 0.1).toFixed(2))))}
                className="w-7 h-7 flex items-center justify-center bg-[#0a2540] hover:bg-[#123961] text-white font-extrabold rounded-full transition-all text-xs shadow-sm"
                title="تكبير (+10%)"
              >
                +
              </button>

              <div className="flex items-center gap-1 mr-1">
                {[
                  { val: 1.0, label: '100%' },
                  { val: 1.3, label: '130%' },
                  { val: 1.6, label: '160%' },
                  { val: 2.0, label: '200%' },
                  { val: 3.0, label: '300%' }
                ].map((p) => {
                  const isCur = Math.abs((settings.scale || 1) - p.val) < 0.05;
                  return (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => onScaleChange(p.val)}
                      className={`px-2 py-0.5 text-[10px] font-extrabold rounded-[12px] border transition-all ${
                        isCur
                          ? 'bg-[#0a2540] text-white border-[#0a2540]'
                          : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {onFitModeChange && (
                <button
                  type="button"
                  onClick={() => onFitModeChange(settings.fitMode === 'fill' ? 'fit' : 'fill')}
                  className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-[14px] border transition-all ${
                    settings.fitMode === 'fill'
                      ? 'bg-[#047857] text-white border-[#047857]'
                      : 'bg-white text-[#047857] border-[#a7f3d0] hover:bg-[#ecfdf5]'
                  }`}
                  title="ملء مساحة البوستر بالكامل أو احتواء"
                >
                  {settings.fitMode === 'fill' ? 'ملء (Fill) ✓' : 'ملء البوستر'}
                </button>
              )}
            </div>
          )}

          <span className="text-[11px] font-bold text-[#64748b] flex items-center gap-1">
            <Move size={13} />
            <span>تحريك:</span>
          </span>

          <button
            type="button"
            onClick={() => shiftPan(5, 0)}
            className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#0a2540] font-bold"
            title="تحريك لليمين"
          >
            <ArrowRight size={14} />
          </button>
          <button
            type="button"
            onClick={() => shiftPan(0, -5)}
            className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#0a2540] font-bold"
            title="تحريك للأعلى"
          >
            <ArrowUp size={14} />
          </button>
          <button
            type="button"
            onClick={() => shiftPan(0, 5)}
            className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#0a2540] font-bold"
            title="تحريك للأسفل"
          >
            <ArrowDown size={14} />
          </button>
          <button
            type="button"
            onClick={() => shiftPan(-5, 0)}
            className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#0a2540] font-bold"
            title="تحريك لليسار"
          >
            <ArrowLeft size={14} />
          </button>

          {(settings.panX !== 0 || settings.panY !== 0 || (settings.scale && settings.scale !== 1)) && (
            <button
              type="button"
              onClick={() => {
                resetPan();
                if (onScaleChange) onScaleChange(1);
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-[#0369a1] bg-[#e0f2fe] hover:bg-[#bae6fd] px-2 py-0.5 rounded-[12px] transition-colors"
            >
              <RotateCcw size={11} />
              <span>إعادة توسيط وضبط</span>
            </button>
          )}

          <span className="text-[10px] font-mono text-[#64748b] border-r border-[#cbd5e1] pr-2 mr-1">
            X: {settings.panX || 0}% | Y: {settings.panY || 0}%
          </span>
        </div>
      </div>
    </div>
  );
}
