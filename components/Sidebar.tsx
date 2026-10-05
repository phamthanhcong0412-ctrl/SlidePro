'use client';

import React from 'react';
import {
  Sparkles,
  FolderKanban,
  Mail,
  Receipt,
  User,
  MessageSquareHeart,
  HardDrive,
  LogOut,
  X
} from 'lucide-react';
import { LectureProject, UserProfile } from '@/types/presentation';
import { calculateTotalStorageMb, formatStorageDisplay } from '@/lib/storageUtils';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  activeView: 'editor' | 'library' | 'inbox' | 'history' | 'account';
  setActiveView: (view: 'editor' | 'library' | 'inbox' | 'history' | 'account') => void;
  balance?: number;
  onOpenFeedback: () => void;
  onNewLecture: () => void;
  user?: UserProfile | null;
  onLogout?: () => void;
  projects?: LectureProject[];
}

export default function Sidebar({
  isOpen,
  onClose,
  activeView,
  setActiveView,
  onOpenFeedback,
  onNewLecture,
  user,
  onLogout,
  projects = [],
}: SidebarProps) {
  if (!isOpen) return null;

  const storageInfo = formatStorageDisplay(calculateTotalStorageMb(projects));

  const handleItemClick = (action: () => void) => {
    action();
    if (typeof window !== 'undefined' && window.innerWidth < 1024 && onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay (< lg) */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside className="fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-[#0a0f1d] border-r border-slate-200 dark:border-slate-800/80 shadow-2xl flex flex-col justify-between p-4 select-none shrink-0 overflow-y-auto animate-in slide-in-from-left duration-200 lg:static lg:w-64 lg:h-auto lg:z-auto lg:shadow-none lg:min-h-[calc(100vh-4rem)] lg:animate-none transition-colors duration-200">
        <div className="space-y-5">
          {/* Mobile Header with Close button (visible only on < lg) */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">SlidePro Menu</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main CTA Button: Tạo bài giảng */}
          <button
            onClick={() => {
              handleItemClick(() => {
                setActiveView('editor');
                onNewLecture();
              });
            }}
            className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl flex items-center justify-center gap-2.5 font-semibold text-sm transition-all shadow-md active:scale-98 cursor-pointer ${
              activeView === 'editor'
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25 ring-1 ring-blue-400/40'
                : 'bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-300 shrink-0" />
            <span>Tạo bài giảng mới</span>
          </button>

          {/* Group 1: BÀI GIẢNG */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Bài giảng
            </div>
            <button
              onClick={() => handleItemClick(() => setActiveView('library'))}
              className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'library'
                  ? 'bg-cyan-50 dark:bg-slate-800/90 text-cyan-700 dark:text-cyan-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80 active:bg-slate-200 dark:active:bg-slate-800'
              }`}
            >
              <FolderKanban className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Kho bài giảng</span>
            </button>
            <button
              onClick={() => handleItemClick(() => setActiveView('inbox'))}
              className={`w-full min-h-[42px] flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'inbox'
                  ? 'bg-cyan-50 dark:bg-slate-800/90 text-cyan-700 dark:text-cyan-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80 active:bg-slate-200 dark:active:bg-slate-800'
              }`}
            >
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Hộp thư</span>
              </div>
              <span className="text-[10px] font-semibold bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 px-1.5 py-0.5 rounded-full border border-cyan-500/30">
                1
              </span>
            </button>
          </div>

          {/* Group 2: TÀI KHOẢN */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tài khoản
            </div>
            <button
              onClick={() => handleItemClick(() => setActiveView('history'))}
              className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'history'
                  ? 'bg-cyan-50 dark:bg-slate-800/90 text-cyan-700 dark:text-cyan-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80 active:bg-slate-200 dark:active:bg-slate-800'
              }`}
            >
              <Receipt className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Lịch sử giao dịch</span>
            </button>
            <button
              onClick={() => handleItemClick(() => setActiveView('account'))}
              className={`w-full min-h-[42px] flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                activeView === 'account'
                  ? 'bg-cyan-50 dark:bg-slate-800/90 text-cyan-700 dark:text-cyan-400 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/80 active:bg-slate-200 dark:active:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Tài khoản {user ? `(${user.name.split(' ')[0]})` : ''}</span>
            </button>
          </div>

          {/* Subscription Status Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#101728] border border-slate-200 dark:border-slate-800/80 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Gói sử dụng</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                Miễn phí trọn đời
              </span>
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400 shrink-0" />
                Tạo slide không giới hạn
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Đầy đủ tính năng phân tích AI & xuất PPTX
              </div>
            </div>

            {/* Storage Capacity Bar */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/70 space-y-1.5">
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-slate-400" />
                  Dung lượng
                </span>
                <span className="text-slate-700 dark:text-slate-300 font-semibold transition-all">
                  {storageInfo.usedFormatted} / {storageInfo.totalFormatted}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${storageInfo.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Feedback and Logout Button */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <button
            onClick={() => handleItemClick(onOpenFeedback)}
            className="flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 transition-all w-full justify-start active:bg-amber-100 dark:active:bg-amber-500/20 cursor-pointer"
          >
            <MessageSquareHeart className="w-3.5 h-3.5 shrink-0" />
            <span>+ Góp ý cho nhóm phát triển</span>
          </button>
          {user && onLogout && (
            <button
              onClick={() => handleItemClick(onLogout)}
              className="flex items-center gap-2 px-3 py-2 min-h-[40px] rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors w-full justify-start active:bg-red-100 dark:active:bg-red-950/30 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>Đăng xuất</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
