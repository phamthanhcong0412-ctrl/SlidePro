'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CreditCard,
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeft,
  Globe,
  LogOut,
  LogIn,
  ChevronDown
} from 'lucide-react';
import { UserProfile } from '@/types/presentation';

interface HeaderProps {
  balance?: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onNewLecture: () => void;
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export default function Header({
  isSidebarOpen,
  onToggleSidebar,
  onNewLecture,
  user,
  onOpenAuth,
  onLogout,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(true);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0d1424] px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand & Left Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 active:bg-slate-800 transition-colors cursor-pointer"
          title={isSidebarOpen ? 'Thu gọn thanh bên' : 'Mở rộng thanh bên'}
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>

        <div
          onClick={onNewLecture}
          className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1 min-w-0">
            <span className="font-bold text-lg sm:text-xl tracking-tight text-white font-sans truncate">
              Slide<span className="text-cyan-400">Edu</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-cyan-500/80 bg-cyan-950/80 border border-cyan-800/50 px-1.5 py-0.2 rounded shrink-0">
              EDU AI
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Free Forever Plan Badge */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold">Miễn phí</span>
          <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            Trọn đời
          </span>
        </div>

        {/* Language Switcher - compact on mobile */}
        <button
          onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
          title="Chuyển đổi ngôn ngữ"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'vi' ? 'VN' : 'EN'}</span>
        </button>

        {/* Theme Toggle - hidden on tiny mobile, accessible in menu */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="hidden sm:flex p-2 min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
          title="Đổi giao diện Sáng/Tối"
        >
          {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* User Profile Badge & Menu */}
        {user ? (
          <div className="relative pl-1 sm:pl-2 border-l border-slate-800">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 min-h-[40px] rounded-xl hover:bg-slate-800/70 transition-colors text-left"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name}
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover shadow-sm ring-2 ring-cyan-500/50 shrink-0"
                />
              ) : (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-slate-800 shrink-0">
                  {user.avatar || 'PI'}
                </div>
              )}
              <div className="hidden md:block text-xs">
                <div className="font-semibold text-slate-200 max-w-[100px] truncate">{user.name}</div>
                <div className="text-[10px] text-emerald-400 font-medium">Gói Miễn phí trọn đời</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2.5 border-b border-slate-800">
                  <div className="font-semibold text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
                  <div className="text-[11px] text-emerald-400 font-bold mt-1">
                    Gói sử dụng: Miễn phí không giới hạn
                  </div>
                </div>

                <div className="py-1 border-b border-slate-800/60 md:hidden">
                  <button
                    onClick={() => {
                      setLang(lang === 'vi' ? 'en' : 'vi');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-300 hover:bg-slate-800/60 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngôn ngữ</span>
                    </span>
                    <span className="text-[11px] text-cyan-400 font-semibold">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDark(!isDark);
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-300 hover:bg-slate-800/60 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {isDark ? <Moon className="w-3.5 h-3.5 text-slate-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                      <span>Giao diện</span>
                    </span>
                    <span className="text-[11px] text-slate-400">{isDark ? 'Tối' : 'Sáng'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-red-400 hover:bg-red-950/30 flex items-center gap-2 transition-colors mt-1 font-medium min-h-[44px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Đăng xuất tài khoản</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 min-h-[38px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Đăng nhập</span>
          </button>
        )}
      </div>
    </header>
  );
}
