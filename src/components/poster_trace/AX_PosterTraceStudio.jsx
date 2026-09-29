import React, { useState, useEffect } from 'react';
import { PanelRightClose, PanelRightOpen, Sliders } from 'lucide-react';
import AX_PosterHeader from './AX_PosterHeader';
import AX_PosterUploadZone from './AX_PosterUploadZone';
import AX_PosterQueueBar from './AX_PosterQueueBar';
import AX_PosterControlPanel from './AX_PosterControlPanel';
import AX_PosterCanvasPreview from './AX_PosterCanvasPreview';
import AX_PosterPrintModal from './AX_PosterPrintModal';
import AX_WebIconsExporterModal from './AX_WebIconsExporterModal';
import { extractAllPdfPages } from '../../utils/ax_pdf_loader';
import { generatePosterTiles, getPosterTargetDimensions } from '../../utils/ax_poster_splitter';
import { renderCompositeCanvas } from '../../utils/ax_image_filters';
import {
  cloneCanvas,
  autoRemoveBackground,
  magicWandRemoveAtPoint,
  applyBrushStroke
} from '../../utils/ax_bg_remover';

const DEFAULT_ITEM_SETTINGS = {
  colorMode: 'color',
  faintInk: 0.06,
  threshold: 30,
  contrast: 1.1,
  invert: false,
  cleanBackground: false,
  bgThreshold: 215,
  bgFillType: 'white',
  bgCustomColor: '#e0f2fe',
  bgGradientColor1: '#e0f2fe',
  bgGradientColor2: '#fef9c3',
  bgRemoveTolerance: 38,
  bgContiguous: true,
  panX: 0,
  panY: 0,
  scale: 1,
  cols: 2,
  rows: 2,
  orientation: 'portrait',
  fitMode: 'fit',
  showCutGuides: true,
  overlapMm: 10,
  marginMm: 5
};

export default function AX_PosterTraceStudio() {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [checkedItemIds, setCheckedItemIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isWebIconsModalOpen, setIsWebIconsModalOpen] = useState(false);
  const [generatedTiles, setGeneratedTiles] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState('split');
  const [activeTool, setActiveTool] = useState('move');
  const [brushSize, setBrushSize] = useState(28);
  const [canvasVersion, setCanvasVersion] = useState(0);

  useEffect(() => {
    handleSampleClick();
  }, []);

  const activeItem = items[activeIndex] || null;

  const pushUndoSnapshot = (item) => {
    if (!item || !item.canvas) return;
    const ctx = item.canvas.getContext('2d');
    const snap = ctx.getImageData(0, 0, item.canvas.width, item.canvas.height);
    if (!item.undoStack) item.undoStack = [];
    if (item.undoStack.length >= 12) item.undoStack.shift();
    item.undoStack.push(snap);
  };

  const handleAutoRemoveBg = () => {
    if (!activeItem || !activeItem.canvas) return;
    pushUndoSnapshot(activeItem);
    autoRemoveBackground(
      activeItem.canvas,
      activeItem.originalCanvas || activeItem.canvas,
      activeItem.settings.bgRemoveTolerance ?? 38,
      activeItem.settings.bgContiguous ?? true
    );
    if ((activeItem.settings.bgFillType || 'white') === 'white') {
      handleUpdateSettings({ ...activeItem.settings, bgFillType: 'transparent' });
    }
    setCanvasVersion((v) => v + 1);
  };

  const handleWandClick = (srcX, srcY) => {
    if (!activeItem || !activeItem.canvas) return;
    pushUndoSnapshot(activeItem);
    magicWandRemoveAtPoint(
      activeItem.canvas,
      srcX,
      srcY,
      activeItem.settings.bgRemoveTolerance ?? 38,
      activeItem.settings.bgContiguous ?? true
    );
    if ((activeItem.settings.bgFillType || 'white') === 'white') {
      handleUpdateSettings({ ...activeItem.settings, bgFillType: 'transparent' });
    }
    setCanvasVersion((v) => v + 1);
  };

  const handleBrushStrokeStart = () => {
    if (!activeItem) return;
    pushUndoSnapshot(activeItem);
  };

  const handleBrushStrokeMove = (x0, y0, x1, y1, radius, mode) => {
    if (!activeItem || !activeItem.canvas) return;
    applyBrushStroke(
      activeItem.canvas,
      activeItem.originalCanvas || activeItem.canvas,
      x0,
      y0,
      x1,
      y1,
      radius,
      mode
    );
    setCanvasVersion((v) => v + 1);
  };

  const handleUndoBgEdit = () => {
    if (!activeItem || !activeItem.undoStack || activeItem.undoStack.length === 0) return;
    const prevData = activeItem.undoStack.pop();
    const ctx = activeItem.canvas.getContext('2d');
    ctx.putImageData(prevData, 0, 0);
    setCanvasVersion((v) => v + 1);
  };

  const handleResetOriginalImage = () => {
    if (!activeItem || !activeItem.originalCanvas) return;
    pushUndoSnapshot(activeItem);
    const ctx = activeItem.canvas.getContext('2d');
    ctx.clearRect(0, 0, activeItem.canvas.width, activeItem.canvas.height);
    ctx.drawImage(activeItem.originalCanvas, 0, 0);
    setCanvasVersion((v) => v + 1);
  };

  const handleUploadBgImage = () => {
    if (!activeItem) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = img.width;
        bgCanvas.height = img.height;
        bgCanvas.getContext('2d').drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        setItems((prev) => {
          const updated = [...prev];
          updated[activeIndex] = {
            ...updated[activeIndex],
            bgImageCanvas: bgCanvas,
            settings: { ...updated[activeIndex].settings, bgFillType: 'image' }
          };
          return updated;
        });
        setCanvasVersion((v) => v + 1);
      };
      img.src = url;
    };
    input.click();
  };

  const handleClearBgImage = () => {
    if (!activeItem) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[activeIndex] = {
        ...updated[activeIndex],
        bgImageCanvas: null,
        settings: { ...updated[activeIndex].settings, bgFillType: 'white' }
      };
      return updated;
    });
    setCanvasVersion((v) => v + 1);
  };

  const handleFilesSelected = async (files) => {
    setIsLoading(true);
    const newItems = [];

    for (const file of files) {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        try {
          const pdfPages = await extractAllPdfPages(file);
          for (const page of pdfPages) {
            newItems.push({
              id: `${Date.now()}_${Math.random()}`,
              name: page.fileName,
              canvas: page.canvas,
              originalCanvas: cloneCanvas(page.canvas),
              undoStack: [],
              dataUrl: page.dataUrl,
              width: page.width,
              height: page.height,
              settings: { ...DEFAULT_ITEM_SETTINGS }
            });
          }
        } catch (err) {
          console.error('PDF error:', err);
        }
      } else if (file.type.startsWith('image/')) {
        const img = new Image();
        const objUrl = URL.createObjectURL(file);
        await new Promise((resolve) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            newItems.push({
              id: `${Date.now()}_${Math.random()}`,
              name: file.name,
              canvas,
              originalCanvas: cloneCanvas(canvas),
              undoStack: [],
              dataUrl: canvas.toDataURL('image/png'),
              width: img.width,
              height: img.height,
              settings: { ...DEFAULT_ITEM_SETTINGS }
            });
            URL.revokeObjectURL(objUrl);
            resolve();
          };
          img.src = objUrl;
        });
      }
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      setCheckedItemIds((prev) => {
        const next = new Set(prev);
        newItems.forEach((it) => next.add(it.id));
        return next;
      });
      if (items.length === 0) setActiveIndex(0);
    }
    setIsLoading(false);
  };

  const handleSampleClick = () => {
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
    setItems([{
      id: sampleId,
      name: 'رسمة_نموذجية.png',
      canvas,
      originalCanvas: cloneCanvas(canvas),
      undoStack: [],
      dataUrl: canvas.toDataURL('image/png'),
      width: 1600,
      height: 1200,
      settings: { ...DEFAULT_ITEM_SETTINGS }
    }]);
    setCheckedItemIds(new Set([sampleId]));
    setActiveIndex(0);
  };

  const handleUpdateSettings = (newSettings) => {
    if (!activeItem) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[activeIndex] = {
        ...updated[activeIndex],
        settings: newSettings
      };
      return updated;
    });
  };

  const handleApplyToAll = () => {
    if (!activeItem) return;
    const currentSettings = activeItem.settings;
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        settings: { ...currentSettings }
      }))
    );
  };

  const handleDeleteItem = (idx) => {
    const deletedId = items[idx]?.id;
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      if (activeIndex >= next.length) {
        setActiveIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
    if (deletedId) {
      setCheckedItemIds((prev) => {
        const next = new Set(prev);
        next.delete(deletedId);
        return next;
      });
    }
  };

  const toggleItemCheck = (id) => {
    setCheckedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const checkedItems = items.filter((it) => checkedItemIds.has(it.id));
  const totalCheckedPages = checkedItems.reduce(
    (acc, it) => acc + (it.settings.cols * it.settings.rows),
    0
  );

  const getProcessedCanvas = (item) => {
    const s = item.settings;
    const { width: targetW, height: targetH } = getPosterTargetDimensions(
      s.cols,
      s.rows,
      s.orientation,
      item.canvas
    );
    return renderCompositeCanvas(
      item.canvas,
      targetW,
      targetH,
      s,
      item.bgImageCanvas || null,
      true
    );
  };

  const handlePrepareBatchPrint = (targetItems = null) => {
    const toPrint = targetItems || (checkedItems.length > 0 ? checkedItems : [activeItem].filter(Boolean));
    if (toPrint.length === 0) return;

    setIsLoading(true);
    setTimeout(() => {
      let combinedTiles = [];
      let globalPageNum = 1;

      for (const item of toPrint) {
        const processedCanvas = getProcessedCanvas(item);
        const s = item.settings;
        const tiles = generatePosterTiles(
          processedCanvas,
          s.cols,
          s.rows,
          s.orientation,
          s.showCutGuides,
          s.overlapMm,
          s.marginMm
        );

        tiles.forEach((tile) => {
          combinedTiles.push({
            ...tile,
            pageNumber: globalPageNum++,
            originalPageNumber: tile.pageNumber,
            itemName: item.name
          });
        });
      }

      combinedTiles = combinedTiles.map((t) => ({
        ...t,
        totalCount: combinedTiles.length
      }));

      setGeneratedTiles(combinedTiles);
      setIsLoading(false);
      setIsPrintModalOpen(true);
    }, 40);
  };

  const totalPosterPages = activeItem
    ? activeItem.settings.cols * activeItem.settings.rows
    : 1;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans select-none text-right" dir="rtl">
      <AX_PosterHeader
        activeItem={activeItem}
        totalPages={totalPosterPages}
        checkedCount={checkedItems.length}
        totalCheckedPages={totalCheckedPages}
        onReset={() => {
          setItems([]);
          setCheckedItemIds(new Set());
        }}
        onPrintAll={() => handlePrepareBatchPrint()}
        onExportPdf={() => handlePrepareBatchPrint()}
        onOpenWebIconsExport={() => setIsWebIconsModalOpen(true)}
      />

      {items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <AX_PosterUploadZone
            onFilesSelected={handleFilesSelected}
            isLoading={isLoading}
            onSampleClick={handleSampleClick}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-[calc(100vh-68px)] overflow-hidden">
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            <div className="lg:hidden flex items-center justify-between px-3 py-1.5 bg-white border-b border-[#e2e8f0] shrink-0 z-20">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-[#0a2540]">العرض:</span>
                <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-[20px] border border-[#cbd5e1]">
                  {[
                    { id: 'split', label: 'منقسمة' },
                    { id: 'canvas', label: 'الصورة' },
                    { id: 'settings', label: 'الإعدادات' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMobileViewMode(m.id)}
                      className={`px-2.5 py-1 text-[10px] font-extrabold rounded-[16px] ${
                        mobileViewMode === m.id ? 'bg-[#0a2540] text-white' : 'text-[#64748b]'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#0369a1] bg-[#e0f2fe] px-2 py-0.5 rounded-[12px]">
                {activeItem?.settings?.cols}×{activeItem?.settings?.rows} A4
              </span>
            </div>

            <div
              className={`
                flex-1 min-w-0 flex flex-col overflow-hidden bg-[#f1f5f9] relative order-1 lg:order-2
                ${mobileViewMode === 'settings' ? 'hidden lg:flex' : 'flex'}
                ${mobileViewMode === 'split' ? 'h-[42vh] shrink-0 border-b border-[#e2e8f0] lg:border-b-0 lg:h-full' : 'h-full'}
              `}
            >
              <AX_PosterCanvasPreview
                item={activeItem}
                settings={activeItem.settings}
                canvasVersion={canvasVersion}
                activeTool={activeTool}
                onSelectTool={setActiveTool}
                brushSize={brushSize}
                onBrushStrokeStart={handleBrushStrokeStart}
                onBrushStrokeMove={handleBrushStrokeMove}
                onWandClick={handleWandClick}
                onAutoRemoveBg={handleAutoRemoveBg}
                onUndoBgEdit={handleUndoBgEdit}
                canUndo={Boolean(activeItem?.undoStack?.length)}
                onPreparePrint={() => handlePrepareBatchPrint([activeItem])}
                onPanChange={(newPanX, newPanY) => {
                  handleUpdateSettings({ ...activeItem.settings, panX: newPanX, panY: newPanY });
                }}
                onScaleChange={(newScale) => {
                  handleUpdateSettings({ ...activeItem.settings, scale: newScale });
                }}
                onFitModeChange={(newFitMode) => {
                  handleUpdateSettings({ ...activeItem.settings, fitMode: newFitMode });
                }}
              />
            </div>

            <div
              className={`
                transition-all duration-300 ease-in-out z-20 flex flex-col bg-white order-2 lg:order-1
                lg:h-full lg:shrink-0 lg:border-l lg:border-[#e2e8f0] lg:shadow-xs
                ${isSidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-[390px] xl:w-[430px]'}
                ${mobileViewMode === 'canvas' ? 'hidden lg:flex' : 'flex'}
                ${mobileViewMode === 'split' ? 'flex-1 overflow-y-auto lg:h-full' : ''}
                ${mobileViewMode === 'settings' ? 'flex-1 h-full' : ''}
              `}
            >
              {isSidebarCollapsed ? (
                <div className="hidden lg:flex flex-col items-center py-4 gap-4 h-full bg-[#f8fafc]">
                  <button
                    type="button"
                    onClick={() => setIsSidebarCollapsed(false)}
                    className="p-2.5 rounded-full bg-[#0a2540] text-white hover:bg-[#123961] shadow-md"
                  >
                    <PanelRightOpen size={18} />
                  </button>
                </div>
              ) : (
                <div className="h-full flex flex-col relative overflow-hidden">
                  <div className="hidden lg:flex items-center justify-between px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] text-xs font-extrabold text-[#0a2540]">
                    <span className="flex items-center gap-1.5">
                      <Sliders size={14} />
                      <span>لوحة التحكم وإزالة الخلفية</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(true)}
                      className="p-1 hover:bg-[#e2e8f0] rounded-lg text-[#64748b]"
                    >
                      <PanelRightClose size={16} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-hidden flex flex-col">
                    <AX_PosterControlPanel
                      settings={activeItem.settings}
                      onChange={handleUpdateSettings}
                      onApplyToAll={handleApplyToAll}
                      onPreparePrint={() => handlePrepareBatchPrint([activeItem])}
                      hasMultipleItems={items.length > 1}
                      activeTool={activeTool}
                      onSelectTool={setActiveTool}
                      brushSize={brushSize}
                      onBrushSizeChange={setBrushSize}
                      onAutoRemoveBg={handleAutoRemoveBg}
                      onUndoBgEdit={handleUndoBgEdit}
                      onResetOriginalImage={handleResetOriginalImage}
                      canUndo={Boolean(activeItem?.undoStack?.length)}
                      onUploadBgImage={handleUploadBgImage}
                      onClearBgImage={handleClearBgImage}
                      hasCustomBgImage={Boolean(activeItem?.bgImageCanvas)}
                      onOpenWebIconsExport={() => setIsWebIconsModalOpen(true)}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 z-30">
            <AX_PosterQueueBar
              items={items.map((it) => ({
                ...it,
                gridCols: it.settings.cols,
                gridRows: it.settings.rows
              }))}
              activeIndex={activeIndex}
              checkedItemIds={checkedItemIds}
              onToggleCheck={toggleItemCheck}
              onSelectAll={() => setCheckedItemIds(new Set(items.map((it) => it.id)))}
              onDeselectAll={() => setCheckedItemIds(new Set())}
              onSelectIndex={setActiveIndex}
              onDeleteItem={handleDeleteItem}
              onApplyToAll={handleApplyToAll}
              onAddFiles={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = 'image/*,.pdf';
                input.onchange = (e) => handleFilesSelected(Array.from(e.target.files));
                input.click();
              }}
              onPrintSelected={() => handlePrepareBatchPrint()}
              checkedCount={checkedItems.length}
              totalCheckedPages={totalCheckedPages}
            />
          </div>
        </div>
      )}

      <AX_WebIconsExporterModal
        isOpen={isWebIconsModalOpen}
        onClose={() => setIsWebIconsModalOpen(false)}
        sourceCanvas={activeItem?.canvas || null}
        defaultBgColor={activeItem?.settings?.bgCustomColor || '#ffffff'}
        itemName={activeItem?.name || 'AX_Logo'}
      />

      <AX_PosterPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        tiles={generatedTiles}
        title={
          checkedItems.length > 1
            ? `طباعة مجمعة (${checkedItems.length} صور - ${totalCheckedPages} صفحة)`
            : activeItem
            ? activeItem.name
            : 'بوستر'
        }
      />
    </div>
  );
}
