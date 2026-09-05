import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AX_PosterUploadZone({ onFilesSelected, isLoading, onSampleClick }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto my-8 px-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragOver
            ? 'border-[#0a2540] bg-[#f0f4f9] scale-[1.01] shadow-lg'
            : 'border-[#cbd5e1] hover:border-[#0a2540] bg-white hover:bg-slate-50/70 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <Loader2 size={38} className="animate-spin text-[#0a2540]" />
            <p className="text-sm font-bold text-[#0a2540]">جاري معالجة واستخراج الصفحات بدقة عالية...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#f1f5f9] text-[#0a2540] flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <UploadCloud size={32} />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-extrabold text-[#0a2540]">
                اسحب الصور أو ملف الـ PDF هنا، أو انقر للاختيار
              </h3>
              <p className="text-xs text-[#64748b] max-w-md mx-auto">
                يدعم كافة الصور (PNG, JPG, WEBP) وملفات الـ PDF متعددة الصفحات. سيتم تقسيمها وطباعتها على عدة صفحات A4 مع ميزة تخفيف الحبر والشف بالجاف.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-[11px] font-bold text-[#475569] bg-[#f1f5f9] px-3 py-1 rounded-[20px] border border-[#e2e8f0]">
                PNG / JPG / WEBP
              </span>
              <span className="text-[11px] font-bold text-[#475569] bg-[#f1f5f9] px-3 py-1 rounded-[20px] border border-[#e2e8f0]">
                PDF متعدد الصفحات
              </span>
              <span className="text-[11px] font-bold text-[#047857] bg-[#ecfdf5] px-3 py-1 rounded-[20px] border border-[#a7f3d0]">
                100% داخل المتصفح
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onSampleClick}
          className="flex items-center gap-2 text-xs font-bold text-[#0a2540] bg-[#f8fafc] hover:bg-[#e2e8f0] border border-[#cbd5e1] px-4 py-2 rounded-[30px] shadow-sm hover:-translate-y-0.5 transition-all"
        >
          <Sparkles size={14} className="text-[#f59e0b]" />
          <span>تجربة صورة رسمة نموذجية لاختبار الشف والتقسيم</span>
        </button>
      </div>
    </div>
  );
}
