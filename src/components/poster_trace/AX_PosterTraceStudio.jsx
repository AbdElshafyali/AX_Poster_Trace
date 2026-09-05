import React, { useState, useEffect } from 'react';
import { PanelRightClose, PanelRightOpen, Sliders } from 'lucide-react';
import AX_PosterHeader from './AX_PosterHeader';
import AX_PosterUploadZone from './AX_PosterUploadZone';
import AX_PosterQueueBar from './AX_PosterQueueBar';
import AX_PosterControlPanel from './AX_PosterControlPanel';
import AX_PosterCanvasPreview from './AX_PosterCanvasPreview';
import AX_PosterPrintModal from './AX_PosterPrintModal';
import { extractAllPdfPages } from '../../utils/ax_pdf_loader';
import { generatePosterTiles, getPosterTargetDimensions } from '../../utils/ax_poster_splitter';
import { applyGrayscale, applySobelTraceOutline, applyColorAdjust, renderPannedCanvas } from '../../utils/ax_image_filters';

const DEFAULT_ITEM_SETTINGS = {
  colorMode: 'trace',
  faintInk: 0.06,
  threshold: 30,
  contrast: 1.2,
  invert: false,
  cleanBackground: true,
  bgThreshold: 215,
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
  const [generatedTiles, setGeneratedTiles] = useState([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileViewMode, setMobileViewMode] = useState('split');

  useEffect(() => {
    handleSampleClick();
  }, []);

  const activeItem = items[activeIndex] || null;

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
              dataUrl: canvas.toDataURL('image/jpeg', 0.92),
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

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(800, 520, 260, 0, Math.PI * 2);
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
    ctx.fillText('نموذج تجريبي للشف والتحديد والتقسيم', 800, 950);

    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText('AXONID Multi-Page Poster & Trace Studio', 800, 1030);

    const sampleId = `sample_${Date.now()}`;
    setItems([{
      id: sampleId,
      name: 'رسمة_نموذجية_للشف.png',
      canvas,
      dataUrl: canvas.toDataURL('image/png'),
      width: 1600,
      height: 1200,
      settings: { ...DEFAULT_ITEM_SETTINGS, colorMode: 'trace', faintInk: 0.06 }
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectAllItems = () => {
    setCheckedItemIds(new Set(items.map((it) => it.id)));
  };

  const deselectAllItems = () => {
    setCheckedItemIds(new Set());
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
    const panned = renderPannedCanvas(
      item.canvas,
      targetW,
      targetH,
      s.panX || 0,
      s.panY || 0,
      s.scale || 1,
      s.fitMode || 'fit'
    );

    const canvas = document.createElement('canvas');
    canvas.width = panned.width;
    canvas.height = panned.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(panned, 0, 0);

    if (s.colorMode === 'trace') {
      applySobelTraceOutline(
        ctx,
        canvas.width,
        canvas.height,
        s.faintInk,
        s.threshold,
        s.invert,
        s.cleanBackground ?? true,
        s.bgThreshold ?? 215
      );
    } else if (s.colorMode === 'bw') {
      applyGrayscale(
        ctx,
        canvas.width,
        canvas.height,
        s.contrast,
        0,
        s.faintInk,
        s.cleanBackground ?? true,
        s.bgThreshold ?? 215
      );
    } else if (s.colorMode === 'color') {
      applyColorAdjust(ctx, canvas.width, canvas.height, s.contrast, 0);
    }
    return canvas;
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
    }, 50);
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
                <span className="text-xs font-extrabold text-[#0a2540]">طريقة العرض:</span>
                <div className="flex items-center bg-[#f1f5f9] p-0.5 rounded-[20px] border border-[#cbd5e1]">
                  <button
                    type="button"
                    onClick={() => setMobileViewMode('split')}
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-[16px] transition-all ${
                      mobileViewMode === 'split'
                        ? 'bg-[#0a2540] text-white shadow-xs'
                        : 'text-[#64748b] hover:text-[#0a2540]'
                    }`}
                  >
                    شاشة منقسمة
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileViewMode('canvas')}
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-[16px] transition-all ${
                      mobileViewMode === 'canvas'
                        ? 'bg-[#0a2540] text-white shadow-xs'
                        : 'text-[#64748b] hover:text-[#0a2540]'
                    }`}
                  >
                    الصورة كاملة
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileViewMode('settings')}
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-[16px] transition-all ${
                      mobileViewMode === 'settings'
                        ? 'bg-[#0a2540] text-white shadow-xs'
                        : 'text-[#64748b] hover:text-[#0a2540]'
                    }`}
                  >
                    الإعدادات فقط
                  </button>
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
                ${mobileViewMode === 'split' ? 'h-[40vh] shrink-0 border-b border-[#e2e8f0] lg:border-b-0 lg:h-full' : 'h-full'}
              `}
            >
              <AX_PosterCanvasPreview
                item={activeItem}
                settings={activeItem.settings}
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
                lg:h-full lg:shrink-0 lg:border-l lg:border-[#e2e8f0] lg:shadow-sm
                ${isSidebarCollapsed ? 'lg:w-[60px]' : 'lg:w-[380px] xl:w-[420px]'}
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
                    className="p-2.5 rounded-full bg-[#0a2540] text-white hover:bg-[#123961] shadow-md transition-all hover:scale-105"
                    title="فتح قائمة الإعدادات الجانبية"
                  >
                    <PanelRightOpen size={18} />
                  </button>
                  <span className="text-[11px] font-bold text-[#64748b] [writing-mode:vertical-rl] rotate-180 tracking-wider">
                    لوحة الإعدادات الجانبية
                  </span>
                </div>
              ) : (
                <div className="h-full flex flex-col relative overflow-hidden">
                  <div className="hidden lg:flex items-center justify-between px-4 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] text-xs font-extrabold text-[#0a2540]">
                    <span className="flex items-center gap-1.5">
                      <Sliders size={14} />
                      <span>لوحة التحكم والإعدادات الجانبية</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsSidebarCollapsed(true)}
                      className="p-1 hover:bg-[#e2e8f0] rounded-lg text-[#64748b] hover:text-[#0a2540] transition-colors"
                      title="تصغير القائمة الجانبية لتوسيع شاشة المعاينة"
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
              onSelectAll={selectAllItems}
              onDeselectAll={deselectAllItems}
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
