'use client';

import React, { useState } from 'react';
import { Package, X, Sparkles, AlertCircle, Loader2, GraduationCap, Check } from 'lucide-react';
import { LectureProject } from '@/types/presentation';
import { LEARNER_AUDIENCES } from '@/lib/sampleData';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  project: LectureProject;
  onUpdateProject?: (updated: LectureProject) => void;
  mode: 'outline_to_script' | 'script_to_package';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  project,
  onUpdateProject,
  mode,
}: ConfirmModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isOutlineStep = mode === 'outline_to_script';

  const handleAudienceChange = (newAudience: string) => {
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        audience: newAudience,
      });
    }
  };

  const handleActionConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onConfirm();
    }, 850);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#131b2e] border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-40"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-700 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
            <Package className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {isOutlineStep ? 'Xác nhận soạn nội dung' : 'Xác nhận nội dung bài giảng'}
          </h2>
        </div>

        {/* Badges Grid matching screenshot 3 and 6 */}
        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#0b101d] border border-slate-800/90 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Đơn vị kiến thức
              </span>
              <span className="text-xl font-bold text-white">
                {project.units.length}
              </span>
            </div>

            <div className="bg-[#0b101d] border border-slate-800/90 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Câu hỏi
              </span>
              <span className="text-xl font-bold text-white">
                {project.units.reduce((sum, u) => sum + (Number(u.questionCount) || 0), 0) || project.quizzes.length}
              </span>
            </div>
          </div>

          {/* Cấp học / Đối tượng người học - Directly editable in ConfirmModal */}
          <div className="bg-[#0b101d] border border-cyan-900/50 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Đối tượng / Cấp học (Chạm để đổi):
                </span>
              </div>
              <span className="text-[10px] text-cyan-300 font-medium bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-md">
                Tùy chọn
              </span>
            </div>

            <select
              value={project.audience}
              onChange={(e) => handleAudienceChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-cyan-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {LEARNER_AUDIENCES.map((aud) => (
                <option key={aud} value={aud} className="bg-slate-900 text-white">
                  {aud}
                </option>
              ))}
            </select>

            {/* Quick 3-Grade Pills for instant tapping on mobile */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              {[
                { label: 'Học sinh Tiểu học (Lớp 1 - 5)', short: '🎒 Tiểu học' },
                { label: 'Học sinh THCS (Lớp 6 - 9)', short: '📘 THCS' },
                { label: 'Học sinh THPT (Lớp 10 - 12)', short: '🎓 THPT' },
              ].map((item) => {
                const isSelected = project.audience === item.label || project.audience.includes(item.short.replace(/[^\w]/g, ''));
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleAudienceChange(item.label)}
                    className={`py-1.5 px-1.5 rounded-lg text-[11px] font-semibold transition-all border text-center cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-bold shadow-xs'
                        : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.short}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Warning / Prompt Box */}
        <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 mb-6 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-200/90 leading-relaxed">
            {isOutlineStep
              ? 'Bạn cần kiểm tra kỹ và nhấn Xác nhận để tiếp tục AI tạo kịch bản thuyết trình và câu hỏi.'
              : 'Mỗi đơn vị kiến thức là một bài giảng E-Learning. Nhấn Xác nhận để đóng gói và xuất PowerPoint.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-40"
          >
            Quay lại
          </button>
          <button
            onClick={handleActionConfirm}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-80"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Xác nhận</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
