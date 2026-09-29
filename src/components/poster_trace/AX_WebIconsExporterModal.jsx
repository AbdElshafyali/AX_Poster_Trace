import React, { useState, useEffect } from 'react';
import { X, Download, PackageCheck, Copy, Check, Layers, FolderDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { WEB_ASSET_PRESETS, renderAssetSizeCanvas, triggerDataUrlDownload, saveAssetsToChosenFolder } from '../../utils/ax_web_assets_generator';

export default function AX_WebIconsExporterModal({
  isOpen,
  onClose,
  sourceCanvas,
  defaultBgColor = '#ffffff',
  itemName = 'AX_Logo'
}) {
  const [paddingPercent, setPaddingPercent] = useState(10);
  const [bgMode, setBgMode] = useState('transparent');
  const [bgColor, setBgColor] = useState(defaultBgColor || '#ffffff');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.08);
  const [generatedAssets, setGeneratedAssets] = useState([]);
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [isSavingToFolder, setIsSavingToFolder] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState(null);

  useEffect(() => {
    if (!isOpen || !sourceCanvas) return;

    const list = WEB_ASSET_PRESETS.map((preset) => {
      const c = renderAssetSizeCanvas(sourceCanvas, preset, {
        paddingPercent,
        bgMode,
        bgColor,
        watermarkOpacity
      });
      return {
        ...preset,
        actualWidth: c.width,
        actualHeight: c.height,
        dataUrl: c.toDataURL('image/png')
      };
    });
    setGeneratedAssets(list);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
  }, [isOpen, sourceCanvas, paddingPercent, bgMode, bgColor, watermarkOpacity]);

  if (!isOpen || !sourceCanvas) return null;

  const handleSaveToFolder = async () => {
    setIsSavingToFolder(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    const safeFolderName = `AX_Logo_Kit_${itemName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_')}`;

    try {
      const result = await saveAssetsToChosenFolder(generatedAssets, safeFolderName);
      if (result && result.success) {
        setSaveSuccessMsg(`تم إنشاء الفولدر وحفظ جميع الصور وملفات طريقة الربط بنجاح في: ${result.path}`);
      } else if (result && result.canceled) {
        setSaveErrorMsg('تم إلغاء اختيار الفولدر.');
      }
    } catch (err) {
      setSaveErrorMsg(err.message || 'حدث خطأ أثناء حفظ الفولدر.');
    } finally {
      setIsSavingToFolder(false);
    }
  };

  const handleDownloadAllSeparately = () => {
    generatedAssets.forEach((asset, idx) => {
      setTimeout(() => {
        triggerDataUrlDownload(asset.dataUrl, asset.fileName);
      }, idx * 220);
    });
  };

  const headSnippet = `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
<link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#0a2540" />
<meta property="og:image" content="/og-image.png" />
<script>
  window.__deferredPwaPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    window.__deferredPwaPrompt = e;
    window.dispatchEvent(new Event('ax-pwa-ready'));
  });
</script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(headSnippet);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0f172a]/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div className="bg-white border border-[#cbd5e1] rounded-2xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#0a2540] text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold">
                تصدير اللوجو والأيقونات في فولدر مخصص مع ملفات طريقة الربط
              </h2>
              <p className="text-[11px] text-sky-200 font-medium">
                تحديد فولدر على جهازك لحفظ 11 مقاساً قياسياً + ملف manifest.json + ملف شرح طريقة الربط
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSavingToFolder}
              onClick={handleSaveToFolder}
              className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2 rounded-[30px] text-xs font-extrabold shadow-md transition-all hover:-translate-y-0.5"
            >
              <FolderDown size={16} />
              <span>
                {isSavingToFolder ? 'جاري فتح نافذة الفولدر والحفظ...' : 'حفظ في فولدر من اختيارك + ملف طريقة الربط'}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="px-5 py-2.5 bg-[#ecfdf5] border-b border-[#a7f3d0] flex items-center gap-2 text-xs font-bold text-[#047857]">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="px-5 py-2.5 bg-[#fff1f2] border-b border-[#fecdd3] flex items-center gap-2 text-xs font-bold text-[#be123c]">
            <AlertCircle size={16} className="shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        <div className="px-5 py-3 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0a2540]">نوع خلفية الأيقونات:</span>
            <div className="flex items-center bg-white p-0.5 rounded-[24px] border border-[#cbd5e1]">
              <button
                type="button"
                onClick={() => setBgMode('transparent')}
                className={`px-3 py-1 rounded-[20px] text-xs font-extrabold transition-all ${
                  bgMode === 'transparent' ? 'bg-[#0a2540] text-white' : 'text-[#475569] hover:text-[#0a2540]'
                }`}
              >
                شفاف بدون خلفية (PNG)
              </button>
              <button
                type="button"
                onClick={() => setBgMode('solid')}
                className={`px-3 py-1 rounded-[20px] text-xs font-extrabold transition-all ${
                  bgMode === 'solid' ? 'bg-[#0a2540] text-white' : 'text-[#475569] hover:text-[#0a2540]'
                }`}
              >
                لون خلفية موحد
              </button>
            </div>

            {bgMode === 'solid' && (
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-7 h-7 rounded-full cursor-pointer border border-[#cbd5e1]"
                title="اختر لون خلفية الأيقونة"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0a2540]">هامش أمان اللوجو:</span>
            <div className="flex items-center gap-1">
              {[0, 8, 14, 20].map((pad) => (
                <button
                  key={pad}
                  type="button"
                  onClick={() => setPaddingPercent(pad)}
                  className={`px-2.5 py-1 rounded-[16px] text-xs font-extrabold border ${
                    paddingPercent === pad
                      ? 'bg-[#0a2540] text-white border-[#0a2540]'
                      : 'bg-white text-[#475569] border-[#cbd5e1]'
                  }`}
                >
                  {pad}%
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-[#0a2540]">شفافية خلفية الموقع:</span>
            <div className="flex items-center gap-1">
              {[
                { val: 0.06, label: '6% مائية' },
                { val: 0.12, label: '12% متوسطة' },
                { val: 0.25, label: '25% واضحة' },
                { val: 1.0, label: '100% كاملة' }
              ].map((op) => (
                <button
                  key={op.val}
                  type="button"
                  onClick={() => setWatermarkOpacity(op.val)}
                  className={`px-2.5 py-1 rounded-[16px] text-[11px] font-extrabold border ${
                    Math.abs(watermarkOpacity - op.val) < 0.01
                      ? 'bg-[#047857] text-white border-[#047857]'
                      : 'bg-white text-[#475569] border-[#cbd5e1]'
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-5 overflow-y-auto flex-1 bg-[#f1f5f9]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {generatedAssets.map((asset) => (
              <div
                key={asset.id}
                className="bg-white rounded-2xl border border-[#cbd5e1] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                <div className="px-3.5 py-2 bg-[#f8fafc] border-b border-[#e2e8f0] flex items-center justify-between">
                  <span className="text-[11px] font-extrabold text-[#0369a1] bg-[#e0f2fe] px-2.5 py-0.5 rounded-full">
                    {asset.category}
                  </span>
                  <span className="font-mono text-xs font-extrabold text-[#0a2540] bg-white border border-[#cbd5e1] px-2.5 py-0.5 rounded-full" dir="ltr">
                    {asset.actualWidth} × {asset.actualHeight} px
                  </span>
                </div>

                <div
                  className="h-36 flex items-center justify-center p-4 relative border-b border-[#f1f5f9]"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0'
                  }}
                >
                  <img
                    src={asset.dataUrl}
                    alt={asset.title}
                    className="max-h-28 max-w-full object-contain drop-shadow-xs"
                  />
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#0a2540]">
                      {asset.title}
                    </h3>
                    <p className="text-[11px] text-[#64748b] font-medium mt-1 leading-relaxed">
                      {asset.usage}
                    </p>
                    <div className="mt-2 inline-block bg-[#f1f5f9] border border-[#cbd5e1] px-2.5 py-0.5 rounded-full">
                      <span className="font-mono text-[11px] font-bold text-[#0f172a]" dir="ltr">
                        {asset.fileName}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => triggerDataUrlDownload(asset.dataUrl, asset.fileName)}
                    className="w-full flex items-center justify-center gap-2 bg-[#0a2540] hover:bg-[#123961] text-white py-2 px-4 rounded-[30px] text-xs font-extrabold shadow-xs hover:-translate-y-0.5 transition-all"
                  >
                    <Download size={14} />
                    <span>تنزيل منفصل ({asset.actualWidth}×{asset.actualHeight})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-5 py-3.5 bg-white border-t border-[#e2e8f0] flex items-center justify-between flex-wrap gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySnippet}
              className="flex items-center gap-1.5 bg-[#f1f5f9] hover:bg-[#e2e8f0] text-[#0a2540] border border-[#cbd5e1] px-4 py-2 rounded-[30px] text-xs font-extrabold transition-all"
            >
              {copiedHtml ? <Check size={14} className="text-[#047857]" /> : <Copy size={14} />}
              <span>
                {copiedHtml ? 'تم نسخ كود <head> بنجاح ✓' : 'نسخ كود الربط لـ index.html'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleDownloadAllSeparately}
              className="flex items-center gap-1.5 bg-white hover:bg-[#f8fafc] text-[#475569] border border-[#cbd5e1] px-3.5 py-2 rounded-[30px] text-xs font-bold transition-all"
            >
              <PackageCheck size={14} />
              <span>تنزيل الملفات للمتصفح</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSavingToFolder}
              onClick={handleSaveToFolder}
              className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-6 py-2.5 rounded-[30px] text-xs font-extrabold shadow-md transition-all hover:-translate-y-0.5"
            >
              <FolderDown size={16} />
              <span>
                {isSavingToFolder
                  ? 'جاري حفظ الفولدر...'
                  : 'حفظ الحزمة في فولدر تختار مكانه (مع ملف طريقة الربط)'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
