import React from 'react';
import { Trash2, Plus, CopyCheck, Image as ImageIcon, FileText, CheckSquare, Square, Sliders, Printer } from 'lucide-react';

export default function AX_PosterQueueBar({
  items = [],
  activeIndex = 0,
  checkedItemIds = new Set(),
  onToggleCheck,
  onSelectAll,
  onDeselectAll,
  onSelectIndex,
  onDeleteItem,
  onApplyToAll,
  onAddFiles,
  onPrintSelected,
  checkedCount = 0,
  totalCheckedPages = 0
}) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-t border-[#e2e8f0] px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4 mb-2.5">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-extrabold text-[#0a2540]">
            الصور والصفحات المرفوعة ({items.length}):
          </span>

          <div className="flex items-center gap-1 bg-[#f8fafc] border border-[#cbd5e1] p-0.5 rounded-[30px]">
            <button
              type="button"
              onClick={onSelectAll}
              className="px-3 py-1 text-[11px] font-extrabold text-[#0a2540] hover:bg-white rounded-[20px] transition-colors"
            >
              تحديد الكل للطباعة
            </button>
            <span className="text-[#cbd5e1]">|</span>
            <button
              type="button"
              onClick={onDeselectAll}
              className="px-3 py-1 text-[11px] font-bold text-[#64748b] hover:bg-white rounded-[20px] transition-colors"
            >
              إلغاء التحديد
            </button>
          </div>

          <button
            type="button"
            onClick={onApplyToAll}
            className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#0369a1] bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] px-3.5 py-1.5 rounded-[20px] transition-all hover:-translate-y-0.5"
            title="تطبيق إعدادات هذه الصفحة على الكل"
          >
            <CopyCheck size={13} />
            <span>تطبيق إعدادات الصورة النشطة على الكل</span>
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onPrintSelected}
            disabled={checkedCount === 0}
            className="flex items-center gap-2 text-xs font-extrabold text-white bg-gradient-to-r from-[#0a2540] to-[#1e3a8a] hover:from-[#113860] hover:to-[#1e40af] disabled:opacity-40 disabled:pointer-events-none px-5 py-2.5 rounded-[30px] shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Printer size={15} />
            <span>
              طباعة الصور المحددة ({checkedCount} من {items.length} صور - {totalCheckedPages} صفحة A4)
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex items-stretch gap-3 overflow-x-auto py-2">
        {items.map((item, idx) => {
          const isSelected = idx === activeIndex;
          const isChecked = checkedItemIds.has(item.id);
          const totalPages = (item.gridCols || 1) * (item.gridRows || 1);

          return (
            <div
              key={item.id || idx}
              className={`relative shrink-0 flex flex-col p-2.5 rounded-2xl border-2 transition-all min-w-[210px] max-w-[230px] ${
                isSelected
                  ? 'border-[#0a2540] bg-[#f0f4f9] shadow-md ring-2 ring-[#0a2540]/15'
                  : isChecked
                  ? 'border-[#93c5fd] bg-white shadow-xs'
                  : 'border-[#e2e8f0] bg-[#f8fafc] opacity-75 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <button
                  type="button"
                  onClick={() => onToggleCheck(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[20px] text-[11px] font-extrabold border transition-all ${
                    isChecked
                      ? 'bg-[#0a2540] text-white border-[#0a2540] shadow-xs'
                      : 'bg-white text-[#64748b] border-[#cbd5e1] hover:bg-[#f1f5f9]'
                  }`}
                  title={isChecked ? 'محددة للطباعة (اضغط للاستبعاد)' : 'اضغط للتحديد في الطباعة المجمعة'}
                >
                  {isChecked ? (
                    <CheckSquare size={13} className="text-white" />
                  ) : (
                    <Square size={13} className="text-[#94a3b8]" />
                  )}
                  <span>{isChecked ? 'محددة للطباعة ✓' : 'تحديد للطباعة'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onDeleteItem(idx)}
                  className="p-1 rounded-full text-[#94a3b8] hover:text-[#ef4444] hover:bg-[#fee2e2] transition-colors"
                  title="حذف هذه الصورة من القائمة"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div
                onClick={() => onSelectIndex(idx)}
                className="flex items-center gap-2.5 cursor-pointer py-1 flex-1"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-[#cbd5e1] shrink-0 relative">
                  <img
                    src={item.dataUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <span className="absolute bottom-0 inset-x-0 bg-[#0a2540] text-[8px] text-white text-center font-bold py-0.5">
                      نشطة
                    </span>
                  )}
                </div>

                <div className="text-right flex-1 min-w-0">
                  <p className="text-[11px] font-extrabold text-[#0a2540] truncate" title={item.name}>
                    {item.name || `صفحة ${idx + 1}`}
                  </p>
                  <p className="text-[10px] text-[#0369a1] font-bold">
                    {item.gridCols}×{item.gridRows} ({totalPages} صفحة A4)
                  </p>
                  <span className="text-[9px] text-[#64748b] block truncate">
                    تكبير: {Math.round((item.settings?.scale || 1) * 100)}% | حبر: {Math.round((item.settings?.faintInk || 0.06) * 100)}%
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[#e2e8f0]">
                <button
                  type="button"
                  onClick={() => onSelectIndex(idx)}
                  className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-[20px] text-[11px] font-extrabold transition-all ${
                    isSelected
                      ? 'bg-[#0a2540] text-white shadow-xs'
                      : 'bg-white hover:bg-[#f1f5f9] text-[#0a2540] border border-[#cbd5e1] shadow-xs'
                  }`}
                >
                  <Sliders size={12} />
                  <span>{isSelected ? 'قيد التعديل الآن في الشاشة' : 'فتح إعدادات الصورة'}</span>
                </button>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAddFiles}
          className="shrink-0 min-w-[130px] flex flex-col items-center justify-center gap-2 text-xs font-bold text-[#64748b] hover:text-[#0a2540] bg-[#f8fafc] hover:bg-[#f1f5f9] border-2 border-dashed border-[#cbd5e1] hover:border-[#0a2540] p-4 rounded-2xl transition-all"
        >
          <Plus size={22} className="text-[#0a2540]" />
          <span>إضافة المزيد</span>
        </button>
      </div>
    </div>
  );
}
