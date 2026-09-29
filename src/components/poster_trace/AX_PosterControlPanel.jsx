import React, { useState } from 'react';
import { Grid, Layout, Sparkles, Eraser, Check, Printer, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import AX_BackgroundTabPanel from './AX_BackgroundTabPanel';

export default function AX_PosterControlPanel({
  settings,
  onChange,
  onApplyToAll,
  onPreparePrint,
  hasMultipleItems,
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
  const [activeTab, setActiveTab] = useState('bg');

  const updateSetting = (key, value) => {
    onChange({ ...settings, [key]: value });
  };

  const gridPresets = [
    { cols: 1, rows: 1, label: '1×1 (ورقة واحدة A4)', desc: '~30 × 21 سم' },
    { cols: 2, rows: 1, label: '2×1 (ورقتين بالعرض)', desc: '~42 × 30 سم' },
    { cols: 1, rows: 2, label: '1×2 (ورقتين بالطول)', desc: '~60 × 21 سم' },
    { cols: 2, rows: 2, label: '2×2 (4 ورقات بوستر كبير)', desc: '~60 × 42 سم' },
    { cols: 3, rows: 2, label: '3×2 (6 ورقات بوستر جداري)', desc: '~63 × 60 سم' },
    { cols: 3, rows: 3, label: '3×3 (9 ورقات بوستر ضخم)', desc: '~90 × 63 سم' },
    { cols: 4, rows: 3, label: '4×3 (12 ورقة لوحة عملاقة)', desc: '~90 × 84 سم' },
    { cols: 4, rows: 4, label: '4×4 (16 ورقة مقاس جدار)', desc: '~120 × 84 سم' }
  ];

  return (
    <div className="bg-white overflow-hidden flex flex-col h-full">
      <div className="grid grid-cols-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
        <button
          type="button"
          onClick={() => setActiveTab('bg')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1.5 text-[11px] font-extrabold transition-colors ${
            activeTab === 'bg'
              ? 'text-[#0a2540] border-b-2 border-[#0a2540] bg-white'
              : 'text-[#64748b] hover:text-[#0a2540]'
          }`}
        >
          <Eraser size={13} />
          <span>الخلفية والممحاة</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('trace')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1.5 text-[11px] font-extrabold transition-colors ${
            activeTab === 'trace'
              ? 'text-[#0a2540] border-b-2 border-[#0a2540] bg-white'
              : 'text-[#64748b] hover:text-[#0a2540]'
          }`}
        >
          <Sparkles size={13} />
          <span>الشف والحبر</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tiling')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1.5 text-[11px] font-extrabold transition-colors ${
            activeTab === 'tiling'
              ? 'text-[#0a2540] border-b-2 border-[#0a2540] bg-white'
              : 'text-[#64748b] hover:text-[#0a2540]'
          }`}
        >
          <Grid size={13} />
          <span>التقسيم ({settings.cols}×{settings.rows})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1.5 text-[11px] font-extrabold transition-colors ${
            activeTab === 'layout'
              ? 'text-[#0a2540] border-b-2 border-[#0a2540] bg-white'
              : 'text-[#64748b] hover:text-[#0a2540]'
          }`}
        >
          <Layout size={13} />
          <span>الاتجاه والمقاس</span>
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {activeTab === 'bg' && (
          <AX_BackgroundTabPanel
            settings={settings}
            onUpdateSetting={updateSetting}
            activeTool={activeTool}
            onSelectTool={onSelectTool}
            brushSize={brushSize}
            onBrushSizeChange={onBrushSizeChange}
            onAutoRemoveBg={onAutoRemoveBg}
            onUndoBgEdit={onUndoBgEdit}
            onResetOriginalImage={onResetOriginalImage}
            canUndo={canUndo}
            onUploadBgImage={onUploadBgImage}
            onClearBgImage={onClearBgImage}
            hasCustomBgImage={hasCustomBgImage}
            onOpenWebIconsExport={onOpenWebIconsExport}
          />
        )}

        {activeTab === 'trace' && (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-extrabold text-[#0a2540] block mb-2">
                وضع الألوان والطباعة
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bw', title: 'أبيض وأسود', sub: '(الافتراضي)' },
                  { id: 'trace', title: 'خطوط شف وتحديد', sub: 'للشف بالجاف' },
                  { id: 'color', title: 'ألوان كاملة', sub: 'الملف الأصلي' }
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => updateSetting('colorMode', m.id)}
                    className={`p-2.5 rounded-xl border-2 text-center transition-all ${
                      settings.colorMode === m.id
                        ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-xs'
                        : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-bold'
                    }`}
                  >
                    <p className="text-xs">{m.title}</p>
                    <span className="text-[10px] text-[#047857] block mt-0.5">{m.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-[#0a2540]">درجة خفة الحبر والخطوط:</span>
                  <span className="font-mono font-bold text-[#0a2540] bg-white border border-[#cbd5e1] px-2 py-0.5 rounded-[12px]">
                    {Math.round(settings.faintInk * 100)}%
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1 mb-2">
                  {[
                    { val: 0.02, label: '2% شبح' },
                    { val: 0.05, label: '5% باهت' },
                    { val: 0.1, label: '10% خفيف' },
                    { val: 0.2, label: '20% متوسط' },
                    { val: 0.5, label: '50% عادي' }
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => updateSetting('faintInk', preset.val)}
                      className={`py-1 px-1 rounded-[16px] text-[10px] font-bold border transition-all ${
                        Math.abs(settings.faintInk - preset.val) < 0.02
                          ? 'bg-[#0a2540] text-white border-[#0a2540]'
                          : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="1"
                  step="0.01"
                  value={settings.faintInk}
                  onChange={(e) => updateSetting('faintInk', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0a2540]"
                />
              </div>

              {settings.colorMode === 'trace' && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-extrabold text-[#0a2540]">حساسية استخراج الخطوط:</span>
                    <span className="font-mono font-bold text-[#0a2540] bg-white border border-[#cbd5e1] px-2 py-0.5 rounded-[12px]">
                      {settings.threshold}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={settings.threshold}
                    onChange={(e) => updateSetting('threshold', parseInt(e.target.value))}
                    className="w-full h-2 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0a2540]"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#475569]">التباين (Contrast):</span>
                  <span className="font-mono font-bold text-[#475569]">{settings.contrast.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={settings.contrast}
                  onChange={(e) => updateSetting('contrast', parseFloat(e.target.value))}
                  className="w-full h-2 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0a2540]"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={settings.invert}
                  onChange={(e) => updateSetting('invert', e.target.checked)}
                  className="w-4 h-4 rounded text-[#0a2540] focus:ring-[#0a2540]"
                />
                <span className="text-xs font-bold text-[#0a2540]">عكس الألوان</span>
              </label>

              <div className="pt-3 border-t border-[#e2e8f0] space-y-2.5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cleanBackground ?? true}
                    onChange={(e) => updateSetting('cleanBackground', e.target.checked)}
                    className="w-4 h-4 rounded text-[#0a2540] focus:ring-[#0a2540]"
                  />
                  <span className="text-xs font-extrabold text-[#0a2540]">
                    تبييض وحذف ظلال الورقة تلقائياً
                  </span>
                </label>

                {(settings.cleanBackground ?? true) && (
                  <div className="bg-white p-3 rounded-lg border border-[#cbd5e1] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569] font-bold">قوة تبييض الخلفية:</span>
                      <span className="font-mono font-bold text-[#0a2540]">{settings.bgThreshold ?? 215}</span>
                    </div>
                    <input
                      type="range"
                      min="160"
                      max="245"
                      step="5"
                      value={settings.bgThreshold ?? 215}
                      onChange={(e) => updateSetting('bgThreshold', parseInt(e.target.value))}
                      className="w-full h-1.5 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0a2540]"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tiling' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {gridPresets.map((preset) => {
                const isSelected = settings.cols === preset.cols && settings.rows === preset.rows;
                return (
                  <button
                    key={`${preset.cols}-${preset.rows}`}
                    type="button"
                    onClick={() => onChange({ ...settings, cols: preset.cols, rows: preset.rows })}
                    className={`p-2.5 rounded-xl border-2 text-right transition-all ${
                      isSelected
                        ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-xs'
                        : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-semibold'
                    }`}
                  >
                    <p className="text-xs font-extrabold">{preset.label}</p>
                    <span className="text-[10px] text-[#64748b] block">{preset.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-[#475569] font-bold block mb-1">عدد الأعمدة:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.cols}
                    onChange={(e) => updateSetting('cols', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-center font-bold text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs text-[#475569] font-bold block mb-1">عدد الصفوف:</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.rows}
                    onChange={(e) => updateSetting('rows', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-1.5 border border-[#cbd5e1] rounded-lg text-center font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-[#0a2540]">هامش أمان الطابعة الداخلي:</span>
                  <span className="font-mono font-bold text-[#0a2540]">{settings.marginMm ?? 5} مم</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 8, 10].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateSetting('marginMm', m)}
                      className={`py-1 px-2 rounded-[20px] text-xs font-bold border ${
                        (settings.marginMm ?? 5) === m
                          ? 'bg-[#0a2540] text-white border-[#0a2540]'
                          : 'bg-white text-[#475569] border-[#cbd5e1]'
                      }`}
                    >
                      {m} مم
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#e2e8f0]">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-[#0a2540]">هامش التداخل للصق (Overlap):</span>
                  <span className="font-mono font-bold text-[#0a2540]">{settings.overlapMm ?? 10} مم</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15].map((ov) => (
                    <button
                      key={ov}
                      type="button"
                      onClick={() => updateSetting('overlapMm', ov)}
                      className={`py-1 px-2 rounded-[20px] text-xs font-bold border ${
                        (settings.overlapMm ?? 10) === ov
                          ? 'bg-[#0a2540] text-white border-[#0a2540]'
                          : 'bg-white text-[#475569] border-[#cbd5e1]'
                      }`}
                    >
                      {ov} مم
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={settings.showCutGuides}
                  onChange={(e) => updateSetting('showCutGuides', e.target.checked)}
                  className="w-4 h-4 rounded text-[#0a2540]"
                />
                <span className="text-xs font-bold text-[#0a2540]">
                  طباعة خطوط القص وأرقام الصفحات
                </span>
              </label>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSetting('orientation', 'portrait')}
                className={`p-3 rounded-xl border-2 text-center ${
                  settings.orientation === 'portrait'
                    ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold'
                    : 'border-[#e2e8f0] text-[#64748b] font-semibold'
                }`}
              >
                <p className="text-xs">طولي (Portrait)</p>
              </button>
              <button
                type="button"
                onClick={() => updateSetting('orientation', 'landscape')}
                className={`p-3 rounded-xl border-2 text-center ${
                  settings.orientation === 'landscape'
                    ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold'
                    : 'border-[#e2e8f0] text-[#64748b] font-semibold'
                }`}
              >
                <p className="text-xs">عرضي (Landscape)</p>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => updateSetting('fitMode', 'fit')}
                className={`p-3 rounded-xl border-2 text-center ${
                  settings.fitMode === 'fit'
                    ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold'
                    : 'border-[#e2e8f0] text-[#64748b] font-semibold'
                }`}
              >
                <p className="text-xs">احتواء كامل (Fit)</p>
              </button>
              <button
                type="button"
                onClick={() => updateSetting('fitMode', 'fill')}
                className={`p-3 rounded-xl border-2 text-center ${
                  settings.fitMode === 'fill'
                    ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold'
                    : 'border-[#e2e8f0] text-[#64748b] font-semibold'
                }`}
              >
                <p className="text-xs">ملء الورقة (Fill)</p>
              </button>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#475569] font-bold">التحريك بالأسهم:</span>
                <div className="flex items-center gap-1 bg-white border border-[#cbd5e1] p-1 rounded-[20px]">
                  <button type="button" onClick={() => updateSetting('panX', (settings.panX || 0) + 5)} className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"><ArrowRight size={14} /></button>
                  <button type="button" onClick={() => updateSetting('panY', (settings.panY || 0) - 5)} className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"><ArrowUp size={14} /></button>
                  <button type="button" onClick={() => updateSetting('panY', (settings.panY || 0) + 5)} className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"><ArrowDown size={14} /></button>
                  <button type="button" onClick={() => updateSetting('panX', (settings.panX || 0) - 5)} className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"><ArrowLeft size={14} /></button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#475569] font-bold">مقياس التكبير (Scale):</span>
                  <span className="font-mono font-bold text-[#0a2540]">{Math.round((settings.scale || 1) * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.25"
                  max="4.0"
                  step="0.05"
                  value={settings.scale || 1}
                  onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0a2540]"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3.5 bg-[#f8fafc] border-t border-[#e2e8f0] space-y-2">
        {onPreparePrint && (
          <button
            type="button"
            onClick={onPreparePrint}
            className="w-full flex items-center justify-center gap-2 bg-[#0a2540] hover:bg-[#123961] text-white px-4 py-2.5 rounded-[30px] font-extrabold text-xs shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Printer size={16} />
            <span>معاينة واختيار صفحات الطباعة ({settings.cols * settings.rows} صفحات)</span>
          </button>
        )}

        {hasMultipleItems && (
          <button
            type="button"
            onClick={onApplyToAll}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#f1f5f9] text-[#0a2540] border border-[#cbd5e1] px-4 py-2 rounded-[30px] font-bold text-xs shadow-xs hover:-translate-y-0.5 transition-all"
          >
            <Check size={15} />
            <span>تطبيق هذه الإعدادات على جميع الصور</span>
          </button>
        )}
      </div>
    </div>
  );
}
