import React, { useState } from 'react';
import { X, Printer, Download, CheckSquare, Square, AlertCircle, Loader2, Zap, CheckCircle2 } from 'lucide-react';
import { jsPDF } from 'jspdf';

export default function AX_PosterPrintModal({ isOpen, onClose, tiles = [], title = 'مستند بوستر' }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDirectPrinting, setIsDirectPrinting] = useState(false);
  const [directPrintStatus, setDirectPrintStatus] = useState(null);

  const [selectedPages, setSelectedPages] = useState(() => {
    const nonBlank = tiles.filter(t => !t.isBlank).map(t => t.pageNumber);
    return new Set(nonBlank.length > 0 ? nonBlank : tiles.map(t => t.pageNumber));
  });

  if (!isOpen || !tiles || tiles.length === 0) {
    return null;
  }

  const togglePage = (pageNum) => {
    setSelectedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageNum)) {
        next.delete(pageNum);
      } else {
        next.add(pageNum);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPages(new Set(tiles.map(t => t.pageNumber)));
  };

  const deselectAll = () => {
    setSelectedPages(new Set());
  };

  const selectOnlyNonBlank = () => {
    setSelectedPages(new Set(tiles.filter(t => !t.isBlank).map(t => t.pageNumber)));
  };

  const selectSinglePage = (pageNum) => {
    setSelectedPages(new Set([pageNum]));
  };

  const printableTiles = tiles.filter(t => selectedPages.has(t.pageNumber));
  const hasBlankTiles = tiles.some(t => t.isBlank);

  const generatePdfDoc = () => {
    if (printableTiles.length === 0) return null;
    const firstTile = printableTiles[0];
    const isLandscape = firstTile.orientation === 'landscape';
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = isLandscape ? 297 : 210;
    const pageHeight = isLandscape ? 210 : 297;

    for (let i = 0; i < printableTiles.length; i++) {
      if (i > 0) {
        doc.addPage('a4', isLandscape ? 'landscape' : 'portrait');
      }
      const tile = printableTiles[i];
      doc.addImage(tile.dataUrl, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
    }
    return doc;
  };

  const handleDirectPrint = async () => {
    if (printableTiles.length === 0) return;
    setIsDirectPrinting(true);
    setDirectPrintStatus(null);
    try {
      const doc = generatePdfDoc();
      if (!doc) return;
      const arrayBuffer = doc.output('arraybuffer');

      const res = await fetch('/api/direct-print', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/pdf'
        },
        body: arrayBuffer
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setDirectPrintStatus({
          type: 'success',
          msg: `تم إرسال ${printableTiles.length} صفحة مباشرة إلى الطابعة الافتراضية بنجاح!`
        });
      } else {
        setDirectPrintStatus({
          type: 'error',
          msg: data.error || 'تعذر الإرسال المباشر للطابعة، يمكنك استخدام زر طباعة المتصفح.'
        });
      }
    } catch {
      setDirectPrintStatus({
        type: 'error',
        msg: 'تعذر الاتصال بخدمة الطباعة المباشرة، يمكنك استخدام زر طباعة المتصفح.'
      });
    } finally {
      setIsDirectPrinting(false);
    }
  };

  const handleBrowserPrint = () => {
    if (printableTiles.length === 0) return;
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (printableTiles.length === 0) return;
    setIsExporting(true);
    try {
      const doc = generatePdfDoc();
      if (!doc) return;
      const cleanTitle = title.replace(/[\\/:*?"<>|]/g, '-');
      doc.save(`بوستر_${cleanTitle}_${printableTiles.length}صفحة.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 print:p-0 print:bg-white">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-[#cbd5e1] overflow-hidden flex flex-col max-h-[92vh] print:max-w-none print:max-h-none print:border-none print:shadow-none print:rounded-none">
        
        <div className="px-6 py-3.5 border-b border-[#e2e8f0] bg-[#f8fafc] print:hidden space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#e0f2fe] text-[#0369a1]">
                <Printer size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0a2540]">
                  المعاينة واختيار الصفحات للطباعة
                </h3>
                <p className="text-xs text-[#64748b]">
                  محدد للطباعة {printableTiles.length} من إجمالي {tiles.length} صفحة
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                disabled={isDirectPrinting || printableTiles.length === 0}
                onClick={handleDirectPrint}
                className="flex items-center gap-2 text-xs font-extrabold text-white bg-gradient-to-r from-[#047857] to-[#059669] hover:from-[#065f46] hover:to-[#047857] px-5 py-2.5 rounded-[30px] shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isDirectPrinting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                <span>طباعة مباشرة للطابعة فوراً ({printableTiles.length})</span>
              </button>

              <button
                type="button"
                disabled={printableTiles.length === 0}
                onClick={handleBrowserPrint}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0a2540] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] px-4 py-2 rounded-[30px] shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                <Printer size={15} />
                <span>طباعة المتصفح</span>
              </button>

              <button
                type="button"
                disabled={isExporting || printableTiles.length === 0}
                onClick={handleDownloadPdf}
                className="flex items-center gap-1.5 text-xs font-bold text-[#0a2540] bg-white border border-[#cbd5e1] hover:bg-[#f1f5f9] px-4 py-2 rounded-[30px] shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isExporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                <span>تنزيل PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-[#64748b] hover:bg-[#f1f5f9] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {directPrintStatus && (
            <div
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in duration-150 ${
                directPrintStatus.type === 'success'
                  ? 'bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46]'
                  : 'bg-[#fff1f2] border border-[#fecdd3] text-[#be123c]'
              }`}
            >
              <div className="flex items-center gap-2">
                {directPrintStatus.type === 'success' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{directPrintStatus.msg}</span>
              </div>
              <button
                type="button"
                onClick={() => setDirectPrintStatus(null)}
                className="text-[11px] underline opacity-75 hover:opacity-100"
              >
                إغلاق
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0] flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#0a2540]">تحديد الصفحات:</span>
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1 rounded-[20px] bg-white border border-[#cbd5e1] text-[#0a2540] font-bold hover:bg-[#f1f5f9] transition-colors"
              >
                تحديد الكل ({tiles.length})
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1 rounded-[20px] bg-white border border-[#cbd5e1] text-[#64748b] font-bold hover:bg-[#f1f5f9] transition-colors"
              >
                إلغاء التحديد
              </button>
              {hasBlankTiles && (
                <button
                  type="button"
                  onClick={selectOnlyNonBlank}
                  className="px-3 py-1 rounded-[20px] bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] font-bold hover:bg-[#ffe4e6] transition-colors flex items-center gap-1.5"
                >
                  <AlertCircle size={13} />
                  <span>استبعاد الصفحات البيضاء الفارغة تلقائياً</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#64748b]">
              <span>* الطباعة المباشرة ترسل للطابعة فوراً بمقاس A4 وبلا هوامش دون فتح نوافذ المتصفح.</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#f1f5f9] print:p-0 print:bg-white print:overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto print:block print:gap-0 print:max-w-none">
            {tiles.map((tile) => {
              const isSelected = selectedPages.has(tile.pageNumber);
              return (
                <div
                  key={tile.pageNumber}
                  className={`bg-white rounded-xl shadow-md border overflow-hidden flex flex-col transition-all print:rounded-none print:shadow-none print:border-none print:m-0 ${
                    isSelected
                      ? 'border-[#0a2540] ring-2 ring-[#0a2540]/10 print:block print:w-[210mm] print:h-[297mm] print:overflow-hidden print:break-after-page print:page-break-after-always'
                      : 'border-[#cbd5e1] opacity-40 hover:opacity-75 print:hidden hidden'
                  }`}
                >
                  <div className="px-4 py-2.5 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between text-xs font-bold text-[#0a2540] print:hidden">
                    <button
                      type="button"
                      onClick={() => togglePage(tile.pageNumber)}
                      className="flex items-center gap-2 text-right focus:outline-none"
                    >
                      {isSelected ? (
                        <CheckSquare size={16} className="text-[#0a2540]" />
                      ) : (
                        <Square size={16} className="text-[#94a3b8]" />
                      )}
                      <span className="flex items-center gap-1.5 flex-wrap">
                        {tile.itemName && (
                          <span className="bg-[#e0f2fe] text-[#0369a1] px-2 py-0.5 rounded-[10px] text-[10px] font-extrabold ml-1">
                            {tile.itemName}
                          </span>
                        )}
                        <span>
                          صفحة {tile.pageNumber} من {tile.totalCount} [عمود {tile.col + 1}، صف {tile.row + 1}]
                        </span>
                      </span>
                    </button>

                    <div className="flex items-center gap-2">
                      {tile.isBlank && (
                        <span className="bg-[#fff1f2] text-[#be123c] border border-[#fecdd3] text-[10px] font-extrabold px-2 py-0.5 rounded-[12px] flex items-center gap-1">
                          <AlertCircle size={11} />
                          <span>ورقة فارغة</span>
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => selectSinglePage(tile.pageNumber)}
                        className="text-[10px] text-[#0369a1] hover:underline font-bold bg-[#e0f2fe] px-2 py-0.5 rounded-[12px]"
                      >
                        طباعة هذه فقط
                      </button>
                    </div>
                  </div>

                  <div
                    onClick={() => togglePage(tile.pageNumber)}
                    className="p-2 flex items-center justify-center bg-white cursor-pointer select-none print:p-0 print:w-[210mm] print:h-[297mm]"
                  >
                    <img
                      src={tile.dataUrl}
                      alt={`ورقة ${tile.pageNumber}`}
                      className="w-full h-auto object-contain block print:w-[210mm] print:h-[297mm] print:object-contain"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
