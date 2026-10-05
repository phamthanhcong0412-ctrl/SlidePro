'use client';

import React, { useState, useEffect } from 'react';
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

  // Sync theme with documentElement and localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('slidepro_theme');
      if (stored === 'light') {
        setIsDark(false);
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
      } else {
        setIsDark(true);
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.style.backgroundColor = '#090d18';
        document.body.style.color = '#f8fafc';
      }
    } catch {
      setIsDark(true);
    }
  }, []);

  const handleToggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    try {
      if (nextDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.style.backgroundColor = '#090d18';
        document.body.style.color = '#f8fafc';
        localStorage.setItem('slidepro_theme', 'dark');
        window.dispatchEvent(new CustomEvent('slidepro-theme-change', { detail: 'dark' }));
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.style.backgroundColor = '#f8fafc';
        document.body.style.color = '#0f172a';
        localStorage.setItem('slidepro_theme', 'light');
        window.dispatchEvent(new CustomEvent('slidepro-theme-change', { detail: 'light' }));
      }
    } catch {}
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-[#0d1424] text-slate-900 dark:text-white px-3 sm:px-4 flex items-center justify-between sticky top-0 z-30 select-none transition-colors backdrop-blur-sm">
      {/* Brand & Left Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:bg-slate-200 dark:active:bg-slate-800 transition-colors cursor-pointer"
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
            <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white font-sans truncate">
              Slide<span className="text-cyan-500 dark:text-cyan-400">Pro</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] uppercase font-semibold text-cyan-700 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800/50 px-1.5 py-0.2 rounded shrink-0">
              STUDIO
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Free Forever Plan Badge */}
        <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[38px] rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-medium">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
          <span className="font-semibold">Miễn phí</span>
          <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-500/30">
            Trọn đời
          </span>
        </div>

        {/* Language Switcher */}
        <button
          onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 min-h-[38px] rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
          title="Chuyển đổi ngôn ngữ"
        >
          <Globe className="w-3.5 h-3.5 text-slate-400" />
          <span>{lang === 'vi' ? 'VN' : 'EN'}</span>
        </button>

        {/* Theme Toggle Button (Light / Dark) */}
        <button
          onClick={handleToggleTheme}
          className="flex p-2 min-h-[38px] min-w-[38px] items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/60 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang giao diện Tối'}
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-sky-600" />
          )}
        </button>

        {/* User Profile Badge & Menu */}
        {user ? (
          <div className="relative pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1.5 sm:gap-2 p-1 min-h-[40px] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors text-left cursor-pointer"
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
                  {user.avatar || 'TC'}
                </div>
              )}
              <div className="hidden md:block text-xs">
                <div className="font-semibold text-slate-800 dark:text-slate-200 max-w-[100px] truncate">{user.name}</div>
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Gói Miễn phí trọn đời</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <div className="px-3.5 py-2.5 border-b border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    Gói sử dụng: Miễn phí không giới hạn
                  </div>
                </div>

                <div className="py-1 border-b border-slate-200 dark:border-slate-800/60 md:hidden">
                  <button
                    onClick={() => {
                      setLang(lang === 'vi' ? 'en' : 'vi');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>Ngôn ngữ</span>
                    </span>
                    <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">{lang === 'vi' ? 'Tiếng Việt' : 'English'}</span>
                  </button>
                  <button
                    onClick={() => {
                      handleToggleTheme();
                      setShowUserMenu(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-sky-600" />}
                      <span>Giao diện</span>
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{isDark ? 'Tối' : 'Sáng'}</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors mt-1 font-medium min-h-[44px] cursor-pointer"
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
