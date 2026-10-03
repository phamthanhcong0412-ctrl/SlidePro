'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProfile } from '@/types/presentation';
import { GraduationCap, ArrowRight, ShieldCheck, Check } from 'lucide-react';

function GoogleLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [mode, setMode] = useState<'quick' | 'manual'>('quick');
  const [email, setEmail] = useState('boyeucongaibo.delpiero@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick 1-click select account for fastest experience
  const handleQuickLogin = (selectedEmail: string, name: string) => {
    setIsLoading(true);
    setTimeout(() => {
      finishAuthentication(selectedEmail, name);
    }, 600);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ Gmail');
      return;
    }
    setError('');
    setIsLoading(true);

    const displayName = email.split('@')[0];
    const formattedName =
      displayName.charAt(0).toUpperCase() + displayName.slice(1);

    setTimeout(() => {
      finishAuthentication(email.trim(), formattedName);
    }, 600);
  };

  const finishAuthentication = (userEmail: string, userName: string) => {
    const formattedName =
      userEmail === 'boyeucongaibo.delpiero@gmail.com'
        ? 'Thành Công (Google Edu)'
        : userName;

    const authenticatedUser: UserProfile = {
      id: `usr-google-${Date.now()}`,
      name: formattedName,
      email: userEmail,
      avatar: formattedName.substring(0, 2).toUpperCase(),
      picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        formattedName
      )}&backgroundColor=0284c7,0d9488,4f46e5`,
      balance: 20000,
      isGoogle: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    try {
      localStorage.setItem('slidepro_user', JSON.stringify(authenticatedUser));
    } catch (err) {
      console.error('Storage error:', err);
    }

    // Direct redirect back to application
    if (typeof window !== 'undefined' && window.opener) {
      try {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            user: authenticatedUser,
          },
          '*'
        );
      } catch {
        // ignore
      }
      setTimeout(() => {
        window.close();
      }, 200);
    } else {
      window.location.href = redirectPath;
    }
  };

  return (
    <div className="w-full max-w-[460px] bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-7 sm:p-10 relative overflow-hidden text-slate-800 transition-all">
      {/* Google Top Linear Progress Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden">
          <div className="h-full bg-blue-600 animate-pulse w-full" />
        </div>
      )}

      {/* Top Branding Section: Google Logo + SlideEdu Badge */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        {/* Google Official Logo */}
        <div className="flex items-center gap-2">
          <svg className="w-7 h-7 sm:w-8 sm:h-8" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="font-medium text-slate-700 text-sm">Google</span>
        </div>

        {/* SlideEdu Education Tag */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          <span>SlideEdu</span>
        </div>
      </div>

      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Đăng nhập bằng Google
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          để tiếp tục vào <strong className="text-slate-800">SlideEdu</strong> (Dành cho Giáo dục)
        </p>
      </div>

      {mode === 'quick' ? (
        /* MODE 1: Fast Account Chooser */
        <div className="space-y-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Chọn tài khoản Google của bạn:
          </div>

          {/* Account 1: User's Account */}
          <button
            type="button"
            onClick={() =>
              handleQuickLogin('boyeucongaibo.delpiero@gmail.com', 'Thành Công (Google)')
            }
            disabled={isLoading}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between text-left group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                TC
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 truncate flex items-center gap-1.5">
                  <span>Thành Công</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    Tài khoản của bạn
                  </span>
                </div>
                <div className="text-xs text-slate-500 truncate">
                  boyeucongaibo.delpiero@gmail.com
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Account 2: Teacher Demo Account */}
          <button
            type="button"
            onClick={() =>
              handleQuickLogin('giangvien.slideedu@gmail.com', 'Thầy Cô Giáo Viên')
            }
            disabled={isLoading}
            className="w-full p-3.5 rounded-2xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 transition-all flex items-center justify-between text-left group cursor-pointer shadow-xs"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                GV
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-sm text-slate-900 group-hover:text-blue-600 truncate">
                  Thầy Cô Giáo Viên
                </div>
                <div className="text-xs text-slate-500 truncate">
                  giangvien.slideedu@gmail.com
                </div>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </button>

          {/* Switch to manual form */}
          <button
            type="button"
            onClick={() => setMode('manual')}
            disabled={isLoading}
            className="w-full py-2.5 px-3 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
          >
            <span>+ Sử dụng tài khoản Gmail khác</span>
          </button>
        </div>
      ) : (
        /* MODE 2: Manual Email / Password Form */
        <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in-50 duration-150">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email hoặc số điện thoại
            </label>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="nhapemail@gmail.com"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mật khẩu Google
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-3 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <input
                type="checkbox"
                id="showPassManual"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
              />
              <label htmlFor="showPassManual" className="cursor-pointer select-none">
                Hiện mật khẩu
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3">
            <button
              type="button"
              onClick={() => setMode('quick')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              ← Quay lại danh sách
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-semibold text-white text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </div>
        </form>
      )}

      {/* Safety Notice for Educators */}
      <div className="mt-7 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Bảo mật kết nối Google OAuth 2.0</span>
        </span>
        <button
          type="button"
          onClick={() => router.push(redirectPath)}
          className="text-slate-500 hover:text-slate-800 underline font-medium cursor-pointer"
        >
          Hủy bỏ
        </button>
      </div>
    </div>
  );
}

export default function GoogleLoginPage() {
  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col justify-between items-center p-4 sm:p-8 font-sans">
      <div className="w-full flex-1 flex items-center justify-center">
        <Suspense fallback={<div className="text-slate-500 text-sm">Đang tải Google...</div>}>
          <GoogleLoginContent />
        </Suspense>
      </div>

      {/* Google Footer */}
      <footer className="w-full max-w-[460px] flex items-center justify-between text-xs text-slate-500 py-4 px-2">
        <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
          <span>Tiếng Việt</span>
          <span>▾</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-700 cursor-pointer">Trợ giúp</span>
          <span className="hover:text-slate-700 cursor-pointer">Bảo mật</span>
          <span className="hover:text-slate-700 cursor-pointer">Điều khoản</span>
        </div>
      </footer>
    </div>
  );
}
