import React, { useEffect, useRef, useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, Printer, Eraser, Brush, Wand2, Undo2, Sparkles, Crop, Check, X } from 'lucide-react';
import { renderCompositeCanvas, getDrawBounds } from '../../utils/ax_image_filters';
import { getPosterTargetDimensions } from '../../utils/ax_poster_splitter';

export default function AX_PosterCanvasPreview({
  item,
  settings,
  canvasVersion,
  activeTool = 'move',
  onSelectTool,
  brushSize = 28,
  onBrushStrokeStart,
  onBrushStrokeMove,
  onWandClick,
  onAutoRemoveBg,
  onAutoTrim,
  onConfirmCrop,
  onUndoBgEdit,
  onResetOriginalImage,
  canUndo,
  onPreparePrint,
  onPanChange,
  onScaleChange,
  onFitModeChange
}) {
  const canvasRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState(null);
  const [cropBox, setCropBox] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const lastBrushPointRef = useRef(null);
  const cropStartRef = useRef(null);

  useEffect(() => {
    if (!item || !item.canvas) return;
    setIsProcessing(true);

    const timer = setTimeout(() => {
      renderProcessedImage();
      setIsProcessing(false);
    }, 25);

    return () => clearTimeout(timer);
  }, [item, settings, canvasVersion]);

  useEffect(() => {
    if (activeTool !== 'crop') {
      setCropBox(null);
      cropStartRef.current = null;
    }
  }, [activeTool]);

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

    const composite = renderCompositeCanvas(
      sourceCanvas,
      targetW,
      targetH,
      settings,
      item.bgImageCanvas || null,
      false
    );

    canvas.width = composite.width;
    canvas.height = composite.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(composite, 0, 0);
  };

  const mapClientToSourceCoords = (clientX, clientY) => {
    const canvas = canvasRef.current;
    if (!canvas || !item || !item.canvas) return null;
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const canvasX = ((clientX - rect.left) / rect.width) * canvas.width;
    const canvasY = ((clientY - rect.top) / rect.height) * canvas.height;

    const { finalX, finalY, drawW, drawH } = getDrawBounds(
      item.canvas.width,
      item.canvas.height,
      canvas.width,
      canvas.height,
      settings.panX || 0,
      settings.panY || 0,
      settings.scale || 1,
      settings.fitMode || 'fit'
    );

    const srcX = ((canvasX - finalX) / drawW) * item.canvas.width;
    const srcY = ((canvasY - finalY) / drawH) * item.canvas.height;
    const scaleFactor = item.canvas.width / rect.width;
    const srcRadius = Math.max(2, (brushSize / 2) * scaleFactor);

    return { srcX, srcY, srcRadius, relX: clientX - rect.left, relY: clientY - rect.top };
  };

  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (activeTool === 'crop') {
      const pt = mapClientToSourceCoords(clientX, clientY);
      if (pt) {
        cropStartRef.current = pt;
        setCropBox({
          x: pt.relX,
          y: pt.relY,
          w: 0,
          h: 0,
          srcX0: pt.srcX,
          srcY0: pt.srcY,
          srcX1: pt.srcX,
          srcY1: pt.srcY
        });
        setIsDragging(true);
      }
      return;
    }

    if (activeTool === 'wand') {
      const pt = mapClientToSourceCoords(clientX, clientY);
      if (pt && onWandClick) {
        onWandClick(Math.round(pt.srcX), Math.round(pt.srcY));
      }
      return;
    }

    if (activeTool === 'erase' || activeTool === 'restore') {
      const pt = mapClientToSourceCoords(clientX, clientY);
      if (pt) {
        setIsDragging(true);
        if (onBrushStrokeStart) onBrushStrokeStart();
        lastBrushPointRef.current = pt;
        if (onBrushStrokeMove) {
          onBrushStrokeMove(pt.srcX, pt.srcY, pt.srcX, pt.srcY, pt.srcRadius, activeTool);
        }
      }
      return;
    }

    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      panX: settings.panX || 0,
      panY: settings.panY || 0
    };
  };

  const handlePointerMove = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    if (activeTool === 'erase' || activeTool === 'restore') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        setCursorPos({
          x: clientX - rect.left,
          y: clientY - rect.top
        });
      }
    } else if (cursorPos) {
      setCursorPos(null);
    }

    if (!isDragging) return;

    if (activeTool === 'crop' && cropStartRef.current) {
      const pt = mapClientToSourceCoords(clientX, clientY);
      if (pt) {
        const start = cropStartRef.current;
        const rx = Math.min(start.relX, pt.relX);
        const ry = Math.min(start.relY, pt.relY);
        const rw = Math.abs(pt.relX - start.relX);
        const rh = Math.abs(pt.relY - start.relY);

        setCropBox({
          x: rx,
          y: ry,
          w: rw,
          h: rh,
          srcX: Math.max(0, Math.min(start.srcX, pt.srcX)),
          srcY: Math.max(0, Math.min(start.srcY, pt.srcY)),
          srcW: Math.abs(pt.srcX - start.srcX),
          srcH: Math.abs(pt.srcY - start.srcY)
        });
      }
      return;
    }

    if (activeTool === 'erase' || activeTool === 'restore') {
      const pt = mapClientToSourceCoords(clientX, clientY);
      if (pt && lastBrushPointRef.current && onBrushStrokeMove) {
        onBrushStrokeMove(
          lastBrushPointRef.current.srcX,
          lastBrushPointRef.current.srcY,
          pt.srcX,
          pt.srcY,
          pt.srcRadius,
          activeTool
        );
        lastBrushPointRef.current = pt;
      }
      return;
    }

    if (!onPanChange) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    const stepX = (dx / 300) * 50;
    const stepY = (dy / 250) * 50;
    const newPanX = Math.round(dragStartRef.current.panX + stepX);
    const newPanY = Math.round(dragStartRef.current.panY + stepY);
    onPanChange(newPanX, newPanY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    lastBrushPointRef.current = null;
  };

  const handleApplyCrop = () => {
    if (cropBox && cropBox.srcW > 10 && cropBox.srcH > 10 && onConfirmCrop) {
      onConfirmCrop(cropBox.srcX, cropBox.srcY, cropBox.srcW, cropBox.srcH);
      setCropBox(null);
    }
  };

  const handleCancelCrop = () => {
    setCropBox(null);
    if (onSelectTool) onSelectTool('move');
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

  if (!item) return null;

  const cols = settings.cols || 1;
  const rows = settings.rows || 1;
  const totalPages = cols * rows;
  const a4WidthMm = settings.orientation === 'landscape' ? 297 : 210;
  const a4HeightMm = settings.orientation === 'landscape' ? 210 : 297;
  const totalWidthCm = ((cols * a4WidthMm) / 10).toFixed(1);
  const totalHeightCm = ((rows * a4HeightMm) / 10).toFixed(1);

  return (
    <div
      onMouseUp={handlePointerUp}
      onTouchEnd={handlePointerUp}
      className="bg-white flex flex-col h-full overflow-hidden"
    >
      <div className="bg-[#f8fafc] border-b border-[#e2e8f0] px-3 py-2 flex items-center justify-between flex-wrap gap-2 z-20">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-white p-0.5 rounded-[24px] border border-[#cbd5e1] shadow-2xs">
            <button
              type="button"
              onClick={() => onSelectTool && onSelectTool('move')}
              className={`flex items-center gap-1 px-3 py-1 rounded-[20px] text-xs font-extrabold transition-all ${
                activeTool === 'move' ? 'bg-[#0a2540] text-white shadow-2xs' : 'text-[#475569] hover:text-[#0a2540]'
              }`}
              title="تحريك البوستر بالماوس"
            >
              <Move size={13} />
              <span>تحريك</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTool && onSelectTool(activeTool === 'crop' ? 'move' : 'crop')}
              className={`flex items-center gap-1 px-3 py-1 rounded-[20px] text-xs font-extrabold transition-all ${
                activeTool === 'crop' ? 'bg-[#0284c7] text-white shadow-2xs' : 'text-[#0284c7] hover:bg-[#f0f9ff]'
              }`}
              title="تحديد مستطيل وقص الصورة يدوياً"
            >
              <Crop size={13} />
              <span>قص يدوي</span>
            </button>

            {onAutoTrim && (
              <button
                type="button"
                onClick={onAutoTrim}
                className="flex items-center gap-1 px-3 py-1 rounded-[20px] text-xs font-extrabold text-[#047857] hover:bg-[#ecfdf5] transition-all"
                title="قص الفراغات الشفافة والبيضاء المحيطة باللوجو وتكبيره فوراً"
              >
                <Sparkles size={13} />
                <span>قص الحواف وتكبير اللوجو</span>
              </button>
            )}
          </div>

          <div className="h-5 w-px bg-[#cbd5e1] hidden sm:block mx-0.5" />

          <div className="flex items-center bg-white p-0.5 rounded-[24px] border border-[#cbd5e1] shadow-2xs">
            <button
              type="button"
              onClick={onAutoRemoveBg}
              className="flex items-center gap-1 px-3 py-1 rounded-[20px] text-xs font-extrabold text-[#0a2540] hover:bg-[#f1f5f9] transition-all"
              title="إزالة الخلفية تلقائياً بضغطة واحدة"
            >
              <Sparkles size={13} />
              <span>عزل الخلفية</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTool && onSelectTool(activeTool === 'erase' ? 'move' : 'erase')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[20px] text-xs font-extrabold transition-all ${
                activeTool === 'erase' ? 'bg-[#dc2626] text-white shadow-2xs' : 'text-[#dc2626] hover:bg-[#fef2f2]'
              }`}
              title="ممحاة مسح يدوي"
            >
              <Eraser size={13} />
              <span>ممحاة</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTool && onSelectTool(activeTool === 'restore' ? 'move' : 'restore')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[20px] text-xs font-extrabold transition-all ${
                activeTool === 'restore' ? 'bg-[#047857] text-white shadow-2xs' : 'text-[#047857] hover:bg-[#ecfdf5]'
              }`}
              title="فرشاة استرجاع الأجزاء الممسوحة"
            >
              <Brush size={13} />
              <span>استرجاع</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTool && onSelectTool(activeTool === 'wand' ? 'move' : 'wand')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[20px] text-xs font-extrabold transition-all ${
                activeTool === 'wand' ? 'bg-[#7c3aed] text-white shadow-2xs' : 'text-[#7c3aed] hover:bg-[#f5f3ff]'
              }`}
              title="عصا سحرية لحذف أي لون باللمس"
            >
              <Wand2 size={13} />
              <span>عصا</span>
            </button>
          </div>

          <div className="h-5 w-px bg-[#cbd5e1] hidden sm:block mx-0.5" />

          {canUndo && (
            <button
              type="button"
              onClick={onUndoBgEdit}
              className="flex items-center gap-1 px-2.5 py-1 rounded-[20px] text-xs font-extrabold bg-white hover:bg-[#f1f5f9] text-[#0a2540] border border-[#cbd5e1] shadow-2xs"
              title="تراجع عن آخر خطوة"
            >
              <Undo2 size={13} />
              <span>تراجع</span>
            </button>
          )}

          {onResetOriginalImage && (
            <button
              type="button"
              onClick={onResetOriginalImage}
              className="flex items-center gap-1 px-2 py-1 rounded-[20px] text-[11px] font-bold text-[#64748b] hover:text-[#0a2540] hover:bg-[#e2e8f0]"
              title="استعادة الصورة الأصلية كما كانت"
            >
              <RotateCcw size={12} />
              <span>استعادة الأصل</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onScaleChange && (
            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-[20px] border border-[#cbd5e1] shadow-2xs">
              <span className="text-[11px] font-extrabold text-[#0a2540]">حجم الرسمة:</span>
              <button
                type="button"
                onClick={() => onScaleChange(Math.max(0.2, parseFloat(((settings.scale || 1) - 0.1).toFixed(2))))}
                className="w-5 h-5 flex items-center justify-center bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0a2540] font-extrabold rounded-full text-xs"
              >
                -
              </button>
              <button
                type="button"
                onClick={() => onScaleChange(1)}
                className="px-1.5 py-0.5 text-[11px] font-mono font-extrabold text-[#0a2540] bg-[#e0f2fe] rounded"
              >
                {Math.round((settings.scale || 1) * 100)}%
              </button>
              <button
                type="button"
                onClick={() => onScaleChange(Math.min(4.0, parseFloat(((settings.scale || 1) + 0.1).toFixed(2))))}
                className="w-5 h-5 flex items-center justify-center bg-[#0a2540] text-white font-extrabold rounded-full text-xs"
              >
                +
              </button>
            </div>
          )}

          <div className="flex items-center gap-0.5 bg-white border border-[#cbd5e1] p-0.5 rounded-[20px]">
            <button type="button" onClick={() => setZoom(z => Math.max(0.4, z - 0.15))} className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#475569]"><ZoomOut size={13} /></button>
            <span className="text-[10px] font-mono font-bold text-[#0a2540] px-1">{Math.round(zoom * 100)}%</span>
            <button type="button" onClick={() => setZoom(z => Math.min(2.5, z + 0.15))} className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#475569]"><ZoomIn size={13} /></button>
          </div>

          <span className="hidden md:inline-block bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] text-[11px] font-extrabold px-2.5 py-1 rounded-[20px]">
            {cols}×{rows} ({totalWidthCm}×{totalHeightCm} سم)
          </span>
        </div>
      </div>

      <div
        onMouseMove={handlePointerMove}
        onTouchMove={handlePointerMove}
        onMouseLeave={() => setCursorPos(null)}
        className="flex-1 overflow-auto p-3 sm:p-6 bg-[#f1f5f9] flex flex-col items-center justify-center min-h-0 relative"
      >
        {isProcessing && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white/95 px-4 py-1.5 rounded-full shadow-md border border-[#e2e8f0] flex items-center gap-2">
            <div className="w-20 h-2 bg-[#cbd5e1] rounded-full animate-pulse" />
            <span className="text-[11px] font-extrabold text-[#0a2540]">تحديث المعاينة...</span>
          </div>
        )}

        {activeTool === 'crop' && (
          <div className="absolute top-3 z-30 bg-[#0284c7] text-white px-4 py-1.5 rounded-full shadow-md text-xs font-extrabold flex items-center gap-2 animate-bounce">
            <Crop size={14} />
            <span>اسحب بالماوس لتحديد مستطيل القص</span>
          </div>
        )}

        <div
          onMouseDown={handlePointerDown}
          onTouchStart={handlePointerDown}
          onWheel={handleWheel}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className={`transition-transform duration-150 relative shadow-2xl rounded-sm bg-white overflow-hidden select-none ${
            activeTool === 'crop'
              ? 'cursor-crosshair ring-2 ring-[#0284c7]'
              : activeTool === 'erase' || activeTool === 'restore' || activeTool === 'wand'
              ? 'cursor-crosshair ring-2 ring-[#047857]'
              : isDragging
              ? 'cursor-grabbing ring-2 ring-[#0a2540]'
              : 'cursor-grab'
          }`}
        >
          <canvas
            ref={canvasRef}
            className="max-w-[85vw] lg:max-w-[70vw] max-h-[42vh] sm:max-h-[56vh] lg:max-h-[72vh] object-contain block pointer-events-none"
          />

          {cursorPos && (activeTool === 'erase' || activeTool === 'restore') && (
            <div
              style={{
                width: `${brushSize}px`,
                height: `${brushSize}px`,
                left: `${cursorPos.x - brushSize / 2}px`,
                top: `${cursorPos.y - brushSize / 2}px`
              }}
              className={`pointer-events-none absolute rounded-full border-2 z-30 ${
                activeTool === 'erase'
                  ? 'border-[#dc2626] bg-[#dc2626]/20'
                  : 'border-[#047857] bg-[#047857]/20'
              }`}
            />
          )}

          {cropBox && cropBox.w > 4 && cropBox.h > 4 && (
            <div
              style={{
                left: `${cropBox.x}px`,
                top: `${cropBox.y}px`,
                width: `${cropBox.w}px`,
                height: `${cropBox.h}px`
              }}
              className="absolute border-2 border-dashed border-[#0284c7] bg-[#0284c7]/20 z-30 pointer-events-none"
            >
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-1.5 pointer-events-auto bg-white p-1 rounded-full shadow-lg border border-[#cbd5e1]">
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  className="flex items-center gap-1 bg-[#047857] hover:bg-[#065f46] text-white px-3 py-1 rounded-full text-xs font-extrabold shadow-xs"
                >
                  <Check size={13} />
                  <span>تأكيد القص</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  className="p-1 text-[#dc2626] hover:bg-[#fef2f2] rounded-full"
                  title="إلغاء"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

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

        <div className="mt-3 flex items-center gap-2 bg-white/95 backdrop-blur-xs border border-[#cbd5e1] px-3 py-1 rounded-[30px] shadow-xs z-10 flex-wrap justify-center">
          <span className="text-[11px] font-bold text-[#64748b] flex items-center gap-1">
            <Move size={12} />
            <span>ضبط الموضع:</span>
          </span>
          <button type="button" onClick={() => shiftPan(5, 0)} className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"><ArrowRight size={13} /></button>
          <button type="button" onClick={() => shiftPan(0, -5)} className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"><ArrowUp size={13} /></button>
          <button type="button" onClick={() => shiftPan(0, 5)} className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"><ArrowDown size={13} /></button>
          <button type="button" onClick={() => shiftPan(-5, 0)} className="p-1 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"><ArrowLeft size={13} /></button>

          {(settings.panX !== 0 || settings.panY !== 0 || (settings.scale && settings.scale !== 1)) && (
            <button
              type="button"
              onClick={() => {
                resetPan();
                if (onScaleChange) onScaleChange(1);
              }}
              className="flex items-center gap-1 text-[10px] font-bold text-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 rounded-[12px]"
            >
              <RotateCcw size={11} />
              <span>توسيط</span>
            </button>
          )}

          {onFitModeChange && (
            <button
              type="button"
              onClick={() => onFitModeChange(settings.fitMode === 'fill' ? 'fit' : 'fill')}
              className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border transition-all ${
                settings.fitMode === 'fill' ? 'bg-[#047857] text-white border-[#047857]' : 'bg-white text-[#047857] border-[#a7f3d0]'
              }`}
            >
              {settings.fitMode === 'fill' ? 'ملء البوستر ✓' : 'ملء البوستر'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
