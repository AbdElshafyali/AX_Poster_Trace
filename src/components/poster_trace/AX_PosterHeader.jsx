import React, { useState, useEffect } from 'react';
import { Printer, Download, RotateCcw, Layers, Smartphone, CheckCircle2 } from 'lucide-react';

export default function AX_PosterHeader({
  onPrintAll,
  onExportPdf,
  onOpenWebIconsExport,
  onReset,
  activeItem,
  totalPages,
  checkedCount = 1,
  totalCheckedPages = 1
}) {
  const [deferredPrompt, setDeferredPrompt] = useState(() => window.__deferredPwaPrompt || null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
    }

    const syncPrompt = () => {
      if (window.__deferredPwaPrompt) {
        setDeferredPrompt(window.__deferredPwaPrompt);
      }
    };

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.__deferredPwaPrompt = e;
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      window.__deferredPwaPrompt = null;
      setDeferredPrompt(null);
      setIsInstalled(true);
    };

    syncPrompt();
    window.addEventListener('ax-pwa-ready', syncPrompt);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('ax-pwa-ready', syncPrompt);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallPwa = async () => {
    const activePrompt = deferredPrompt || window.__deferredPwaPrompt;
    if (activePrompt) {
      activePrompt.prompt();
      await activePrompt.userChoice;
      window.__deferredPwaPrompt = null;
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="bg-white border-b border-[#e2e8f0] px-6 py-3.5 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0a2540] to-[#1e40af] text-white flex items-center justify-center shadow-md">
            <Layers size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-[#0a2540]">
                مستودع تقسيم البوسترات وإزالة الخلفية وخطوط الشف
              </h1>
              <span className="bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe] text-[11px] font-bold px-2.5 py-0.5 rounded-[20px]">
                AX_Poster_Trace
              </span>
            </div>
            <p className="text-xs text-[#64748b] font-medium mt-0.5">
              طباعة الصور والـ PDF على عدة صفحات A4 مع عزل الخلفية وتخفيف الحبر للتحديد بالجاف
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {!isInstalled && (deferredPrompt || window.__deferredPwaPrompt) && (
            <button
              type="button"
              onClick={handleInstallPwa}
              className="flex items-center gap-2 text-xs font-extrabold text-white bg-[#047857] hover:bg-[#065f46] px-4 py-2 rounded-[30px] shadow-md hover:-translate-y-0.5 transition-all"
            >
              <Smartphone size={15} />
              <span>تثبيت التطبيق على الجهاز</span>
            </button>
          )}

          {isInstalled && (
            <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-3 py-1.5 rounded-[30px]">
              <CheckCircle2 size={14} />
              <span>نسخة سطح المكتب</span>
            </span>
          )}

          {activeItem && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-bold text-[#64748b] hover:text-[#0f172a] bg-[#f1f5f9] hover:bg-[#e2e8f0] px-3.5 py-2 rounded-[30px] transition-all hover:-translate-y-0.5"
            >
              <RotateCcw size={14} />
              <span>ملف جديد</span>
            </button>
          )}

          <button
            type="button"
            disabled={!activeItem}
            onClick={onOpenWebIconsExport}
            className="flex items-center gap-2 text-xs font-extrabold text-white bg-[#7c3aed] hover:bg-[#6d28d9] disabled:opacity-40 disabled:pointer-events-none px-4 py-2 rounded-[30px] shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Download size={15} />
            <span>تنزيل مقاسات اللوجو والـ PWA والتاب</span>
          </button>

          <button
            type="button"
            disabled={!activeItem}
            onClick={onExportPdf}
            className="flex items-center gap-2 text-xs font-bold text-[#0a2540] bg-white border border-[#cbd5e1] hover:bg-[#f8fafc] disabled:opacity-40 disabled:pointer-events-none px-4 py-2 rounded-[30px] shadow-xs hover:-translate-y-0.5 transition-all"
          >
            <Download size={15} />
            <span>
              {checkedCount > 1
                ? `تصدير PDF (${checkedCount} صور)`
                : 'تصدير PDF مقسم'}
            </span>
          </button>

          <button
            type="button"
            disabled={!activeItem}
            onClick={onPrintAll}
            className="flex items-center gap-2 text-xs font-extrabold text-white bg-gradient-to-r from-[#0a2540] to-[#1e3a8a] hover:from-[#113860] hover:to-[#1e40af] disabled:opacity-40 disabled:pointer-events-none px-5 py-2 rounded-[30px] shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Printer size={16} />
            <span>
              {checkedCount > 1
                ? `معاينة وطباعة المحددة (${checkedCount} صور - ${totalCheckedPages} صفحة A4)`
                : `معاينة وطباعة (${totalPages || 1} صفحة A4)`}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
