import React from 'react';
import { Eraser, Wand2, Sparkles, Undo2, RotateCcw, ImagePlus, Palette, Move, Brush, Check, Trash2 } from 'lucide-react';

export default function AX_BackgroundTabPanel({
  settings,
  onUpdateSetting,
  activeTool,
  onSelectTool,
  brushSize,
  onBrushSizeChange,
  onAutoRemoveBg,
  onUndoBgEdit,
  onResetOriginalImage,
  canUndo,
  onUploadBgImage,
  onClearBgImage,
  hasCustomBgImage,
  onOpenWebIconsExport
}) {
  const colorPresets = [
    { hex: '#ffffff', label: 'أبيض' },
    { hex: '#fefce8', label: 'سكري' },
    { hex: '#e0f2fe', label: 'سماوي' },
    { hex: '#dcfce7', label: 'أخضر فاتح' },
    { hex: '#fce7f3', label: 'وردي' },
    { hex: '#fef08a', label: 'أصفر' },
    { hex: '#f1f5f9', label: 'رمادي فاتح' },
    { hex: '#0f172a', label: 'داكن' }
  ];

  const gradientPresets = [
    { c1: '#e0f2fe', c2: '#fef9c3', label: 'سماوي وذهبي' },
    { c1: '#fce7f3', c2: '#e0e7ff', label: 'وردي وبنفسجي' },
    { c1: '#dcfce7', c2: '#e0f2fe', label: 'أخضر وسماوي' },
    { c1: '#f8fafc', c2: '#cbd5e1', label: 'فضي ناعم' }
  ];

  return (
    <div className="space-y-4">
      <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#0a2540]">
            1. عزل وإزالة الخلفية التلقائي (محلياً):
          </span>
          <span className="text-[10px] font-bold text-[#047857] bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-0.5 rounded-full">
            يعمل بدون إنترنت
          </span>
        </div>

        <button
          type="button"
          onClick={onAutoRemoveBg}
          className="w-full flex items-center justify-center gap-2 bg-[#0a2540] hover:bg-[#123961] text-white py-2.5 px-4 rounded-[30px] font-extrabold text-xs shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <Sparkles size={15} />
          <span>إزالة الخلفية تلقائياً بضغطة واحدة</span>
        </button>

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-bold text-[#475569]">حساسية التقاط لون الخلفية:</span>
            <span className="font-mono font-bold text-[#0a2540] bg-white border border-[#cbd5e1] px-2 py-0.5 rounded-[12px]">
              {settings.bgRemoveTolerance ?? 38}
            </span>
          </div>
          <input
            type="range"
            min="8"
            max="110"
            step="2"
            value={settings.bgRemoveTolerance ?? 38}
            onChange={(e) => onUpdateSetting('bgRemoveTolerance', parseInt(e.target.value))}
            className="w-full h-1.5 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0a2540]"
          />
          <div className="flex justify-between text-[10px] text-[#64748b] mt-1">
            <span>حذف ناعم (حواف فقط)</span>
            <span>حذف عميق (ألوان متقاربة)</span>
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={settings.bgContiguous ?? true}
            onChange={(e) => onUpdateSetting('bgContiguous', e.target.checked)}
            className="w-4 h-4 rounded text-[#0a2540] focus:ring-[#0a2540]"
          />
          <span className="text-[11px] font-bold text-[#0a2540]">
            حذف الخلفية المتصلة بالحواف فقط (حماية ألوان داخل الرسمة)
          </span>
        </label>
      </div>

      <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#0a2540]">
            2. الممحاة اليدوية والاسترجاع (لو مسحت بالخطأ):
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onSelectTool('erase')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[30px] text-xs font-extrabold border transition-all ${
              activeTool === 'erase'
                ? 'bg-[#dc2626] text-white border-[#dc2626] shadow-md -translate-y-0.5'
                : 'bg-white text-[#dc2626] border-[#fecaca] hover:bg-[#fef2f2]'
            }`}
          >
            <Eraser size={14} />
            <span>ممحاة مسح يدوي</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('restore')}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-[30px] text-xs font-extrabold border transition-all ${
              activeTool === 'restore'
                ? 'bg-[#047857] text-white border-[#047857] shadow-md -translate-y-0.5'
                : 'bg-white text-[#047857] border-[#a7f3d0] hover:bg-[#ecfdf5]'
            }`}
          >
            <Brush size={14} />
            <span>فرشاة استرجاع الممسوح</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('wand')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[30px] text-xs font-extrabold border transition-all ${
              activeTool === 'wand'
                ? 'bg-[#7c3aed] text-white border-[#7c3aed] shadow-md -translate-y-0.5'
                : 'bg-white text-[#7c3aed] border-[#ddd6fe] hover:bg-[#f5f3ff]'
            }`}
          >
            <Wand2 size={14} />
            <span>عصا سحرية (حذف لون باللمس)</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTool('move')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-[30px] text-xs font-extrabold border transition-all ${
              activeTool === 'move'
                ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-md'
                : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
            }`}
          >
            <Move size={14} />
            <span>وضع التحريك العادي</span>
          </button>
        </div>

        {(activeTool === 'erase' || activeTool === 'restore') && (
          <div className="bg-white p-3 rounded-xl border border-[#cbd5e1] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-[#0a2540]">
                {activeTool === 'erase' ? 'حجم الممحاة اليدوية:' : 'حجم فرشاة الاسترجاع:'}
              </span>
              <span className="font-mono font-bold text-[#0a2540] bg-[#f1f5f9] px-2 py-0.5 rounded-[12px]">
                {brushSize}px
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {[
                { val: 12, label: 'دقيق 12' },
                { val: 28, label: 'متوسط 28' },
                { val: 50, label: 'كبير 50' },
                { val: 85, label: 'عريض 85' }
              ].map((b) => (
                <button
                  key={b.val}
                  type="button"
                  onClick={() => onBrushSizeChange(b.val)}
                  className={`py-1 px-1.5 rounded-[20px] text-[10px] font-extrabold border transition-all ${
                    brushSize === b.val
                      ? 'bg-[#0a2540] text-white border-[#0a2540]'
                      : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>

            <input
              type="range"
              min="4"
              max="120"
              step="2"
              value={brushSize}
              onChange={(e) => onBrushSizeChange(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0a2540]"
            />
            <span className="text-[10px] text-[#047857] font-bold block">
              {activeTool === 'erase'
                ? 'مرر الماوس أو إصبعك على الصورة لمسح أي جزء غير مرغوب.'
                : 'مرر الفرشاة على أي مكان مسحته بالخطأ لإعادته كما كان فوراً.'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            disabled={!canUndo}
            onClick={onUndoBgEdit}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[30px] text-xs font-extrabold border transition-all ${
              canUndo
                ? 'bg-white hover:bg-[#f1f5f9] text-[#0a2540] border-[#cbd5e1] shadow-xs hover:-translate-y-0.5'
                : 'bg-[#f1f5f9] text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed'
            }`}
          >
            <Undo2 size={14} />
            <span>تراجع عن آخر مسحة</span>
          </button>

          <button
            type="button"
            onClick={onResetOriginalImage}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-[30px] text-xs font-extrabold bg-[#fff1f2] hover:bg-[#ffe4e6] text-[#be123c] border border-[#fecdd3] transition-all hover:-translate-y-0.5"
          >
            <RotateCcw size={14} />
            <span>استعادة الأصل بالكامل</span>
          </button>
        </div>
      </div>

      <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
        <span className="text-xs font-extrabold text-[#0a2540] block">
          3. تغيير الخلفية الجديدة:
        </span>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'white', label: 'أبيض نقي' },
            { id: 'transparent', label: 'شفاف (بدون)' },
            { id: 'color', label: 'لون مخصص' },
            { id: 'gradient', label: 'تدرج لوني' },
            { id: 'image', label: 'صورة خلفية' }
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onUpdateSetting('bgFillType', t.id)}
              className={`py-2 px-2 rounded-[20px] text-xs font-extrabold border transition-all ${
                (settings.bgFillType || 'white') === t.id
                  ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-xs'
                  : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {settings.bgFillType === 'color' && (
          <div className="bg-white p-3 rounded-xl border border-[#cbd5e1] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0a2540]">اختر لون الخلفية:</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.bgCustomColor || '#e0f2fe'}
                  onChange={(e) => onUpdateSetting('bgCustomColor', e.target.value)}
                  className="w-8 h-8 rounded-full cursor-pointer border border-[#cbd5e1]"
                />
                <span className="font-mono text-xs font-bold text-[#475569]">
                  {settings.bgCustomColor || '#e0f2fe'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {colorPresets.map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => onUpdateSetting('bgCustomColor', c.hex)}
                  className={`flex items-center gap-1.5 p-1.5 rounded-[16px] border text-[10px] font-extrabold transition-all ${
                    (settings.bgCustomColor || '#e0f2fe') === c.hex
                      ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540]'
                      : 'border-[#e2e8f0] text-[#475569] hover:bg-[#f8fafc]'
                  }`}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {settings.bgFillType === 'gradient' && (
          <div className="bg-white p-3 rounded-xl border border-[#cbd5e1] space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#475569]">اللون 1:</span>
                <input
                  type="color"
                  value={settings.bgGradientColor1 || '#e0f2fe'}
                  onChange={(e) => onUpdateSetting('bgGradientColor1', e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border border-[#cbd5e1]"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#475569]">اللون 2:</span>
                <input
                  type="color"
                  value={settings.bgGradientColor2 || '#fef9c3'}
                  onChange={(e) => onUpdateSetting('bgGradientColor2', e.target.value)}
                  className="w-7 h-7 rounded-full cursor-pointer border border-[#cbd5e1]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {gradientPresets.map((g, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onUpdateSetting('bgGradientColor1', g.c1);
                    setTimeout(() => onUpdateSetting('bgGradientColor2', g.c2), 10);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded-[16px] border border-[#e2e8f0] hover:border-[#0a2540] text-[10px] font-extrabold text-[#0a2540]"
                >
                  <span
                    className="w-5 h-3.5 rounded-full border border-black/10 shrink-0"
                    style={{ background: `linear-gradient(135deg, ${g.c1}, ${g.c2})` }}
                  />
                  <span>{g.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {settings.bgFillType === 'image' && (
          <div className="bg-white p-3 rounded-xl border border-[#cbd5e1] space-y-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onUploadBgImage}
                className="flex-1 flex items-center justify-center gap-1.5 bg-[#0a2540] hover:bg-[#123961] text-white py-2 px-3 rounded-[24px] text-xs font-extrabold transition-all"
              >
                <ImagePlus size={14} />
                <span>اختيار صورة خلفية من جهازك</span>
              </button>

              {hasCustomBgImage && (
                <button
                  type="button"
                  onClick={onClearBgImage}
                  className="p-2 bg-[#fef2f2] hover:bg-[#fee2e2] text-[#dc2626] rounded-full border border-[#fecaca]"
                  title="حذف صورة الخلفية"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {onOpenWebIconsExport && (
        <div className="p-4 bg-[#f5f3ff] rounded-xl border border-[#ddd6fe] space-y-2">
          <span className="text-xs font-extrabold text-[#4c1d95] block">
            4. تصدير اللوجو لجميع مقاسات المواقع والـ PWA:
          </span>
          <p className="text-[11px] text-[#6d28d9] font-medium">
            تنزيل الصورة بعد التعديل بجميع مقاسات أيقونة تاب الموقع (Favicon)، أيقونات تطبيق الـ PWA، وخلفية الموقع المائية مع كتابة وظيفة كل مقاس تحته.
          </p>
          <button
            type="button"
            onClick={onOpenWebIconsExport}
            className="w-full flex items-center justify-center gap-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white py-2.5 px-4 rounded-[30px] font-extrabold text-xs shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Sparkles size={15} />
            <span>فتح وتنزيل جميع مقاسات اللوجو والـ PWA والتاب</span>
          </button>
        </div>
      )}
    </div>
  );
}
