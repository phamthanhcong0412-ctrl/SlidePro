'use client';

import React from 'react';
import { User, Receipt, CreditCard, Shield, Clock, PlusCircle, LogOut } from 'lucide-react';
import { LectureProject, UserProfile } from '@/types/presentation';
import { calculateTotalStorageMb, formatStorageDisplay } from '@/lib/storageUtils';

interface AccountViewProps {
  type: 'account' | 'history';
  balance?: number;
  user?: UserProfile | null;
  onLogout?: () => void;
  projects?: LectureProject[];
}

export default function AccountView({
  type,
  user,
  onLogout,
  projects = [],
}: AccountViewProps) {
  const storage = formatStorageDisplay(calculateTotalStorageMb(projects));
  const activities = [
    { id: 'ACT-9025', desc: 'Khởi tạo tài khoản giảng viên & kích hoạt quyền tạo slide không giới hạn', type: 'Tài khoản', time: 'Vừa xong', status: 'Hoạt động' },
    { id: 'ACT-9012', desc: 'Biên soạn bài giảng Y khoa chèn ép tim cấp (3 slide, 2 câu trắc nghiệm)', type: 'Tạo slide', time: 'Hôm nay 18:02', status: 'Hoàn tất' },
    { id: 'ACT-8910', desc: 'Xuất file thuyết trình chuẩn Microsoft PowerPoint (.pptx)', type: 'Xuất PPTX', time: 'Hôm qua 14:30', status: 'Thành công' },
  ];

  if (type === 'history') {
    return (
      <div className="flex-1 p-3.5 sm:p-6 max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Receipt className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              <span>Nhật ký hoạt động</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">Lịch sử tạo slide bài giảng, phân tích tài liệu PDF và xuất PowerPoint</p>
          </div>
        </div>

        <div className="bg-[#0d1424] border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
          {activities.map((act) => (
            <div key={act.id} className="p-3.5 sm:p-4 flex items-center justify-between hover:bg-slate-900/40 transition-colors text-xs gap-3">
              <div className="space-y-1 min-w-0">
                <div className="font-semibold text-slate-200 truncate">{act.desc}</div>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Mã: {act.id}</span>
                  <span>•</span>
                  <span>{act.time}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="font-semibold text-cyan-300">
                  {act.type}
                </div>
                <span className="text-[10px] text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                  {act.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3.5 sm:p-6 max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <User className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            <span>Thông tin tài khoản</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Quản lý hồ sơ giảng viên, gói dịch vụ và cài đặt xuất bản slide</p>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="self-start sm:self-auto min-h-[38px] px-3.5 py-1.5 rounded-xl border border-red-800/60 bg-red-950/30 hover:bg-red-950/60 active:bg-red-950 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        <div className="md:col-span-1 bg-[#0d1424] border border-slate-800 rounded-2xl p-5 sm:p-6 text-center space-y-4">
          {user?.picture ? (
            <img
              src={user.picture}
              alt={user.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover shadow-xl mx-auto ring-4 ring-cyan-500/40"
            />
          ) : (
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-lg sm:text-xl font-bold text-white shadow-xl mx-auto ring-4 ring-slate-800">
              {user?.avatar || 'PI'}
            </div>
          )}
          <div>
            <h3 className="text-base font-bold text-white">{user?.name || 'Pixels'}</h3>
            <p className="text-xs text-slate-400">{user?.email || 'mrpixelvns@gmail.com'}</p>
          </div>
          <div className="pt-2 border-t border-slate-800 text-xs text-emerald-400 font-semibold">
            {user?.isGoogle ? 'Đăng nhập Google • Miễn phí trọn đời' : 'Tài khoản Giảng viên Tiêu chuẩn'}
          </div>
        </div>

        <div className="md:col-span-2 bg-[#0d1424] border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Gói tài khoản</span>
              <span className="text-[11px] text-emerald-400 font-medium">✓ Miễn phí 100% trọn đời • Không giới hạn lượt tạo slide</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Đang kích hoạt
              </span>
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:justify-between text-slate-300 gap-0.5 sm:gap-2">
              <span className="text-slate-400">Định dạng xuất bản mặc định:</span>
              <span className="font-semibold text-white">Microsoft PowerPoint (.pptx) + SCORM</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between text-slate-300 gap-0.5 sm:gap-2">
              <span className="text-slate-400">Tỉ lệ khung hình:</span>
              <span className="font-semibold text-white">16:9 Màn ảnh rộng (Widescreen)</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between text-slate-300 gap-0.5 sm:gap-2">
              <span className="text-slate-400">Tự động chèn Speaker Notes:</span>
              <span className="font-semibold text-emerald-400">Bật (Lời giảng AI)</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between text-slate-300 gap-0.5 sm:gap-2">
              <span className="text-slate-400">Dung lượng đám mây đã dùng:</span>
              <span className="font-semibold text-cyan-300">
                {storage.usedFormatted} / {storage.totalFormatted} ({storage.percentage}%)
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between text-slate-300 gap-0.5 sm:gap-2">
              <span className="text-slate-400">Trạng thái xác thực:</span>
              <span className="font-semibold text-cyan-400">Đã kích hoạt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
