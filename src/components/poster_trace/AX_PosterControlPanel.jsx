import React, { useState } from 'react';
import { Sliders, Grid, Layout, Sparkles, Moon, Sun, Scissors, Layers, Check, Printer, Move, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export default function AX_PosterControlPanel({
  settings,
  onChange,
  onApplyToAll,
  onPreparePrint,
  hasMultipleItems
}) {
  const [activeTab, setActiveTab] = useState('trace');

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
      <div className="flex border-b border-[#e2e8f0] bg-[#f8fafc]">
        <button
          type="button"
          onClick={() => setActiveTab('trace')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 text-xs font-bold transition-colors ${
            activeTab === 'trace'
              ? 'text-[#0a2540] border-b-2 border-[#0a2540] bg-white'
              : 'text-[#64748b] hover:text-[#0a2540]'
          }`}
        >
          <Sparkles size={14} />
          <span>الخطوط والشف والحبر</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tiling')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 text-xs font-bold transition-colors ${
            activeTab === 'tiling'
              ? 'text-[#0a2540] border-b-2 border-[#0a2540] bg-white'
              : 'text-[#64748b] hover:text-[#0a2540]'
          }`}
        >
          <Grid size={14} />
          <span>تقسيم البوستر ({settings.cols}×{settings.rows})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('layout')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 text-xs font-bold transition-colors ${
            activeTab === 'layout'
              ? 'text-[#0a2540] border-b-2 border-[#0a2540] bg-white'
              : 'text-[#64748b] hover:text-[#0a2540]'
          }`}
        >
          <Layout size={14} />
          <span>الاتجاه والمقاس</span>
        </button>
      </div>

      <div className="p-5 space-y-5 overflow-y-auto flex-1">
        {activeTab === 'trace' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-extrabold text-[#0a2540] block mb-2">
                وضع الألوان والطباعة
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateSetting('colorMode', 'bw')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    settings.colorMode === 'bw'
                      ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-sm'
                      : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-bold'
                  }`}
                >
                  <p className="text-xs">أبيض وأسود</p>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">(الافتراضي)</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSetting('colorMode', 'trace')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    settings.colorMode === 'trace'
                      ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-sm'
                      : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-bold'
                  }`}
                >
                  <p className="text-xs">خطوط شف وتحديد</p>
                  <span className="text-[10px] text-[#047857] font-bold block mt-0.5">للشف بالجاف</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSetting('colorMode', 'color')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    settings.colorMode === 'color'
                      ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-sm'
                      : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-bold'
                  }`}
                >
                  <p className="text-xs">ألوان كاملة</p>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">الملف الأصلي</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-extrabold text-[#0a2540]">
                    درجة خفة الحبر والخطوط (شف بالجاف):
                  </span>
                  <span className="font-mono font-bold text-[#0a2540] bg-white border border-[#cbd5e1] px-2 py-0.5 rounded-[12px]">
                    {Math.round(settings.faintInk * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-1 mb-2">
                  {[
                    { val: 0.02, label: '2% شبح' },
                    { val: 0.05, label: '5% باهت' },
                    { val: 0.10, label: '10% خفيف' },
                    { val: 0.20, label: '20% متوسط' },
                    { val: 0.50, label: '50% عادي' }
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
                <div className="flex justify-between text-[10px] text-[#64748b] mt-1 font-medium">
                  <span>1% (شبح باهت جداً بدون حبر)</span>
                  <span>100% (حبر داكن كامل)</span>
                </div>
              </div>

              {settings.colorMode === 'trace' && (
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-extrabold text-[#0a2540]">حساسية استخراج الخطوط (Threshold):</span>
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
                  <div className="flex justify-between text-[10px] text-[#64748b] mt-1 font-medium">
                    <span>خطوط وتفاصيل أكثر</span>
                    <span>خطوط رئيسية فقط</span>
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#475569]">التباين (Contrast):</span>
                  <span className="font-mono font-bold text-[#475569]">
                    {settings.contrast.toFixed(1)}x
                  </span>
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
                <span className="text-xs font-bold text-[#0a2540]">
                  عكس الألوان (خلفية بيضاء نقية وخطوط محددة)
                </span>
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
                    تبييض وحذف لون الخلفية (إزالة الظلال والاصفرار 100%)
                  </span>
                </label>

                {(settings.cleanBackground ?? true) && (
                  <div className="bg-white p-3 rounded-lg border border-[#cbd5e1] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#475569] font-bold">قوة تبييض الخلفية:</span>
                      <span className="font-mono font-bold text-[#0a2540]">
                        {settings.bgThreshold ?? 215}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { val: 190, label: 'تبييض قوي' },
                        { val: 215, label: 'تبييض متوازن' },
                        { val: 235, label: 'تبييض ناعم' }
                      ].map((p) => (
                        <button
                          key={p.val}
                          type="button"
                          onClick={() => updateSetting('bgThreshold', p.val)}
                          className={`py-1 px-1 rounded-[16px] text-[10px] font-bold border transition-all ${
                            (settings.bgThreshold ?? 215) === p.val
                              ? 'bg-[#0a2540] text-white border-[#0a2540]'
                              : 'bg-[#f8fafc] text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
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
                    <span className="text-[10px] text-[#64748b] block">
                      * يمسح أي رماديات أو ظلال في الورقة الأصلية ليتبقى فقط الخطوط الصافية.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tiling' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-extrabold text-[#0a2540] block mb-2">
                نماذج التقسيم السريعة (عدد صفحات A4)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {gridPresets.map((preset) => {
                  const isSelected = settings.cols === preset.cols && settings.rows === preset.rows;
                  return (
                    <button
                      key={`${preset.cols}-${preset.rows}`}
                      type="button"
                      onClick={() => {
                        onChange({ ...settings, cols: preset.cols, rows: preset.rows });
                      }}
                      className={`p-2.5 rounded-xl border-2 text-right transition-all ${
                        isSelected
                          ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-sm'
                          : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-semibold'
                      }`}
                    >
                      <p className="text-xs font-extrabold">{preset.label}</p>
                      <span className="text-[10px] text-[#64748b] block">{preset.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
              <label className="text-xs font-extrabold text-[#0a2540] block">
                تخصيص يدوي لأعمدة وصفوف التقسيم:
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#475569] font-bold block mb-1">عدد الأعمدة (بالعرض):</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.cols}
                    onChange={(e) => updateSetting('cols', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-center font-bold text-sm"
                  />
                </div>
                <div>
                  <span className="text-xs text-[#475569] font-bold block mb-1">عدد الصفوف (بالطول):</span>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.rows}
                    onChange={(e) => updateSetting('rows', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-center font-bold text-sm"
                  />
                </div>
              </div>
              <div className="text-center pt-1">
                <span className="inline-block bg-[#0a2540] text-white text-xs font-extrabold px-3 py-1 rounded-[20px]">
                  الإجمالي: {settings.cols * settings.rows} ورقة A4
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#0a2540]">
                  حجم ومقياس تكبير الرسمة (Scale):
                </span>
                <span className="font-mono font-bold text-[#0a2540] bg-white border border-[#cbd5e1] px-2.5 py-0.5 rounded-[12px] text-xs">
                  {Math.round((settings.scale || 1) * 100)}%
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { val: 1.0, label: '100% عادي' },
                  { val: 1.25, label: '125%' },
                  { val: 1.5, label: '150%' },
                  { val: 2.0, label: '200% ضعف' },
                  { val: 2.5, label: '250%' },
                  { val: 3.0, label: '300% 3 أضعاف' }
                ].map((p) => {
                  const isCur = Math.abs((settings.scale || 1) - p.val) < 0.04;
                  return (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => updateSetting('scale', p.val)}
                      className={`flex-1 min-w-[65px] py-1.5 px-2 rounded-[18px] text-xs font-bold border transition-all ${
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateSetting('scale', Math.max(0.25, parseFloat(((settings.scale || 1) - 0.1).toFixed(2))))}
                  className="px-2.5 py-1 bg-white hover:bg-[#e2e8f0] border border-[#cbd5e1] text-[#0a2540] font-extrabold rounded-[14px] text-xs"
                  title="تصغير (-10%)"
                >
                  -10%
                </button>
                <input
                  type="range"
                  min="0.25"
                  max="4.0"
                  step="0.05"
                  value={settings.scale || 1}
                  onChange={(e) => updateSetting('scale', parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-[#cbd5e1] rounded-lg appearance-none cursor-pointer accent-[#0a2540]"
                />
                <button
                  type="button"
                  onClick={() => updateSetting('scale', Math.min(4.0, parseFloat(((settings.scale || 1) + 0.1).toFixed(2))))}
                  className="px-2.5 py-1 bg-[#0a2540] hover:bg-[#123961] text-white font-extrabold rounded-[14px] text-xs shadow-sm"
                  title="تكبير (+10%)"
                >
                  +10%
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => updateSetting('fitMode', settings.fitMode === 'fill' ? 'fit' : 'fill')}
                  className={`text-xs font-bold px-3 py-1 rounded-[16px] border transition-all ${
                    settings.fitMode === 'fill'
                      ? 'bg-[#047857] text-white border-[#047857]'
                      : 'bg-white text-[#047857] border-[#a7f3d0] hover:bg-[#ecfdf5]'
                  }`}
                >
                  {settings.fitMode === 'fill' ? 'ملء كامل مساحة البوستر (Fill) ✓' : 'تفعيل ملء كامل البوستر (Fill)'}
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting('scale', 1)}
                  className="text-xs font-bold text-[#64748b] hover:text-[#0a2540] underline"
                >
                  إعادة ضبط 100%
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-extrabold text-[#0a2540]">
                    هامش أمان الطابعة الداخلي (لحماية أطراف الرسمة من القص):
                  </span>
                  <span className="font-mono font-bold text-[#0a2540] bg-white border border-[#cbd5e1] px-2 py-0.5 rounded-[12px]">
                    {settings.marginMm ?? 5} مم
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 8, 10].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => updateSetting('marginMm', m)}
                      className={`py-1.5 px-2 rounded-[20px] text-xs font-bold border transition-all ${
                        (settings.marginMm ?? 5) === m
                          ? 'bg-[#0a2540] text-white border-[#0a2540]'
                          : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      {m === 0 ? 'بدون (0 مم)' : `${m} مم`}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#64748b] block mt-1">
                  * يُنصح بـ 5 مم لطابعات A4 العادية لمنع بكرات السحب من قطع أطراف البوستر.
                </span>
              </div>

              <div className="pt-2 border-t border-[#e2e8f0]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-extrabold text-[#0a2540]">
                    هامش التداخل والركوب للصق الصفحات (Overlap):
                  </span>
                  <span className="font-mono font-bold text-[#0a2540] bg-white border border-[#cbd5e1] px-2 py-0.5 rounded-[12px]">
                    {settings.overlapMm ?? 10} مم
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 5, 10, 15].map((ov) => (
                    <button
                      key={ov}
                      type="button"
                      onClick={() => updateSetting('overlapMm', ov)}
                      className={`py-1.5 px-2 rounded-[20px] text-xs font-bold border transition-all ${
                        (settings.overlapMm ?? 10) === ov
                          ? 'bg-[#0a2540] text-white border-[#0a2540]'
                          : 'bg-white text-[#475569] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                      }`}
                    >
                      {ov === 0 ? 'بدون تداخل' : `${ov} مم`}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-[#64748b] block mt-1">
                  * يطبع شريطاً مكرراً بين الصفحات مع خط قص لتركيب الورق ولصقه بدقة 100%.
                </span>
              </div>

              <div className="pt-2 border-t border-[#e2e8f0]">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showCutGuides}
                    onChange={(e) => updateSetting('showCutGuides', e.target.checked)}
                    className="w-4 h-4 rounded text-[#0a2540] focus:ring-[#0a2540]"
                  />
                  <span className="text-xs font-bold text-[#0a2540]">
                    طباعة خطوط القص المنقطة (✂) وأرقام الصفحات وعلامات الزوايا (+)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'layout' && (
          <div className="space-y-5">
            <div>
              <label className="text-xs font-extrabold text-[#0a2540] block mb-2">
                اتجاه ورق الطباعة لكل صفحة
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSetting('orientation', 'portrait')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    settings.orientation === 'portrait'
                      ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-sm'
                      : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-semibold'
                  }`}
                >
                  <p className="text-xs">طولي (Portrait)</p>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">210 × 297 مم</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSetting('orientation', 'landscape')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    settings.orientation === 'landscape'
                      ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-sm'
                      : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-semibold'
                  }`}
                >
                  <p className="text-xs">عرضي (Landscape)</p>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">297 × 210 مم</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-[#0a2540] block mb-2">
                طريقة احتواء الصورة على الورق
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => updateSetting('fitMode', 'fit')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    settings.fitMode === 'fit'
                      ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-sm'
                      : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-semibold'
                  }`}
                >
                  <p className="text-xs">احتواء كامل (Fit)</p>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">بدون أي قص للأطراف</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSetting('fitMode', 'fill')}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    settings.fitMode === 'fill'
                      ? 'border-[#0a2540] bg-[#f0f4f9] text-[#0a2540] font-extrabold shadow-sm'
                      : 'border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] font-semibold'
                  }`}
                >
                  <p className="text-xs">ملء الورقة (Fill)</p>
                  <span className="text-[10px] text-[#64748b] block mt-0.5">تغطية المساحة بالكامل</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-[#f8fafc] rounded-xl border border-[#e2e8f0] space-y-3">
              <label className="text-xs font-extrabold text-[#0a2540] block">
                تحريك وموضع وتكبير الصورة:
              </label>

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#475569] font-bold">التحريك بالأسهم:</span>
                <div className="flex items-center gap-1 bg-white border border-[#cbd5e1] p-1 rounded-[20px]">
                  <button
                    type="button"
                    onClick={() => updateSetting('panX', (settings.panX || 0) + 5)}
                    className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"
                    title="يمين"
                  >
                    <ArrowRight size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('panY', (settings.panY || 0) - 5)}
                    className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"
                    title="أعلى"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('panY', (settings.panY || 0) + 5)}
                    className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"
                    title="أسفل"
                  >
                    <ArrowDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSetting('panX', (settings.panX || 0) - 5)}
                    className="p-1.5 hover:bg-[#f1f5f9] rounded-full text-[#0a2540]"
                    title="يسار"
                  >
                    <ArrowLeft size={14} />
                  </button>
                </div>

                {(settings.panX !== 0 || settings.panY !== 0 || settings.scale !== 1) && (
                  <button
                    type="button"
                    onClick={() => onChange({ ...settings, panX: 0, panY: 0, scale: 1 })}
                    className="text-[10px] font-bold text-[#0369a1] bg-[#e0f2fe] px-2.5 py-1 rounded-[14px] hover:bg-[#bae6fd]"
                  >
                    توسيط
                  </button>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#475569] font-bold">مقياس التكبير (Scale):</span>
                  <span className="font-mono font-bold text-[#0a2540]">
                    {Math.round((settings.scale || 1) * 100)}%
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-1 mb-2">
                  {[
                    { val: 1.0, label: '100%' },
                    { val: 1.25, label: '125%' },
                    { val: 1.5, label: '150%' },
                    { val: 2.0, label: '200%' },
                    { val: 2.5, label: '250%' },
                    { val: 3.0, label: '300%' },
                    { val: 3.5, label: '350%' },
                    { val: 4.0, label: '400%' }
                  ].map((p) => {
                    const isCur = Math.abs((settings.scale || 1) - p.val) < 0.04;
                    return (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => updateSetting('scale', p.val)}
                        className={`py-1 text-center rounded-[14px] text-xs font-bold border transition-all ${
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

              <span className="text-[10px] text-[#64748b] block">
                * يمكنك أيضاً سحب وتحريك الرسمة مباشرة بالماوس من شاشة المعاينة.
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#f8fafc] border-t border-[#e2e8f0] space-y-2">
        {onPreparePrint && (
          <button
            type="button"
            onClick={onPreparePrint}
            className="w-full flex items-center justify-center gap-2 bg-[#0a2540] hover:bg-[#123961] text-white px-4 py-3 rounded-[30px] font-extrabold text-xs shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Printer size={16} />
            <span>معاينة واختيار صفحات الطباعة ({settings.cols * settings.rows} صفحات)</span>
          </button>
        )}

        {hasMultipleItems && (
          <button
            type="button"
            onClick={onApplyToAll}
            className="w-full flex items-center justify-center gap-2 bg-white hover:bg-[#f1f5f9] text-[#0a2540] border border-[#cbd5e1] px-4 py-2.5 rounded-[30px] font-bold text-xs shadow hover:-translate-y-0.5 transition-all"
          >
            <Check size={15} />
            <span>تطبيق هذه الإعدادات على جميع الصور والصفحات</span>
          </button>
        )}
      </div>
    </div>
  );
}
