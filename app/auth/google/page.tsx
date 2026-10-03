'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProfile } from '@/types/presentation';

function GoogleLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [step, setStep] = useState<'email' | 'password'>('email');
  const [email, setEmail] = useState('boyeucongaibo.delpiero@gmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleEmailNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập email hoặc số điện thoại');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('password');
    }, 400);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const displayName = email.split('@')[0];
    const formattedName =
      displayName.charAt(0).toUpperCase() + displayName.slice(1);

    setTimeout(() => {
      const authenticatedUser: UserProfile = {
        id: `usr-google-${Date.now()}`,
        name: formattedName === 'Boyeucongaibo.delpiero' ? 'Thành Công (Google)' : formattedName,
        email: email.trim(),
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

      // Check if opened as popup or full page redirect
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
        }, 300);
      } else {
        // Normal web page redirect back to application
        window.location.href = redirectPath;
      }
    }, 700);
  };

  return (
    <div className="w-full max-w-[450px] bg-white sm:border sm:border-slate-200 sm:rounded-3xl p-8 sm:p-10 shadow-sm relative overflow-hidden text-slate-800">
      {/* Google Top Linear Progress Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden">
          <div className="h-full bg-blue-600 animate-pulse w-full" />
        </div>
      )}

      {/* Google Official Logo */}
      <div className="mb-4">
        <svg className="w-10 h-10" viewBox="0 0 24 24">
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
      </div>

      {step === 'email' ? (
        /* STEP 1: Email Form */
        <div>
          <h1 className="text-2xl font-normal text-slate-900 tracking-tight mb-2">
            Đăng nhập
          </h1>
          <p className="text-sm text-slate-600 mb-7">
            để tiếp tục tới <span className="font-semibold text-slate-900">SlidePro</span>
          </p>

          <form onSubmit={handleEmailNext} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="Email hoặc số điện thoại"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-lg text-base text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-500"
              />
              {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={() => setEmail('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Bạn quên địa chỉ email?
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Không phải máy tính của bạn? Hãy sử dụng chế độ Khách để đăng nhập một cách riêng tư.{' '}
              <span className="text-blue-600 font-medium cursor-pointer">Tìm hiểu thêm</span>
            </p>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => router.push(redirectPath)}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-medium text-white text-sm shadow-sm transition-all"
              >
                Tiếp theo
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* STEP 2: Password Form */
        <div>
          <button
            type="button"
            onClick={() => setStep('email')}
            className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              {email.charAt(0).toUpperCase()}
            </div>
            <span className="truncate max-w-[200px]">{email}</span>
            <span className="text-slate-400">▾</span>
          </button>

          <h1 className="text-2xl font-normal text-slate-900 tracking-tight mb-2">
            Chào mừng
          </h1>
          <p className="text-sm text-slate-600 mb-7">
            Nhập mật khẩu tài khoản Google của bạn
          </p>

          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            <div>
              <input
                type={showPassword ? 'text' : 'password'}
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn"
                className="w-full px-4 py-3.5 border border-slate-300 rounded-lg text-base text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors placeholder:text-slate-500"
              />

              <div className="flex items-center gap-2 mt-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  id="showPass"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="showPass" className="cursor-pointer select-none">
                  Hiện mật khẩu
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 font-medium text-white text-sm shadow-sm transition-all"
              >
                Đăng nhập
              </button>
            </div>
          </form>
        </div>
      )}
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
      <footer className="w-full max-w-[450px] flex items-center justify-between text-xs text-slate-500 py-4 px-2">
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
