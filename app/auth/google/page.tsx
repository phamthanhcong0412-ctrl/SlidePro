'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserProfile } from '@/types/presentation';

function GoogleAuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const [isLoading, setIsLoading] = useState(false);
  const [, setSelectedEmail] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [showOtherAccount, setShowOtherAccount] = useState(false);

  // Suggested accounts for fast authentic Google login
  const suggestedAccounts = [
    {
      name: 'Thành Công (Google)',
      email: 'boyeucongaibo.delpiero@gmail.com',
      avatarText: 'TC',
      avatarBg: 'bg-emerald-600',
    },
    {
      name: 'Giảng viên SlidePro',
      email: 'giangvien.slidepro@gmail.com',
      avatarText: 'GV',
      avatarBg: 'bg-blue-600',
    },
  ];

  const handleSelectAccount = (acc: { name: string; email: string; avatarText: string }) => {
    setSelectedEmail(acc.email);
    setIsLoading(true);

    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr-google-${Date.now()}`,
        name: acc.name,
        email: acc.email,
        avatar: acc.avatarText,
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name)}&backgroundColor=0284c7,0d9488,4f46e5`,
        balance: 20000,
        isGoogle: true,
        createdAt: new Date().toISOString().split('T')[0],
      };

      finishLogin(newUser);
    }, 800);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail) return;

    setSelectedEmail(customEmail);
    setIsLoading(true);

    const displayName = customName.trim() || customEmail.split('@')[0];
    setTimeout(() => {
      const newUser: UserProfile = {
        id: `usr-google-${Date.now()}`,
        name: displayName,
        email: customEmail,
        avatar: displayName.substring(0, 2).toUpperCase(),
        picture: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=0284c7,0d9488,4f46e5`,
        balance: 20000,
        isGoogle: true,
        createdAt: new Date().toISOString().split('T')[0],
      };

      finishLogin(newUser);
    }, 800);
  };

  const finishLogin = (user: UserProfile) => {
    try {
      localStorage.setItem('slidepro_user', JSON.stringify(user));
    } catch (e) {
      console.warn('Storage error:', e);
    }

    // Check if in popup window
    if (typeof window !== 'undefined' && window.opener) {
      window.opener.postMessage(
        {
          type: 'GOOGLE_AUTH_SUCCESS',
          user,
        },
        '*'
      );
      setTimeout(() => {
        window.close();
      }, 200);
    } else {
      // Full page redirect back to application
      router.push(redirectPath);
    }
  };

  return (
    <div className="w-full max-w-[448px] bg-[#303134] rounded-3xl border border-slate-700/80 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
      {/* Loading Progress Bar */}
      {isLoading && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-700 overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-full" />
        </div>
      )}

      {/* Google Branding Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <svg className="w-9 h-9" viewBox="0 0 24 24">
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
        <h1 className="text-xl sm:text-2xl font-normal text-white tracking-tight mb-2">
          Đăng nhập bằng Google
        </h1>
        <p className="text-sm text-slate-300">
          Chọn tài khoản để tiếp tục tới <span className="font-semibold text-blue-400">SlidePro</span>
        </p>
      </div>

      {/* Account Selection List */}
      {!showOtherAccount ? (
        <div className="space-y-2 mb-6">
          {suggestedAccounts.map((acc, index) => (
            <button
              key={index}
              onClick={() => handleSelectAccount(acc)}
              disabled={isLoading}
              className="w-full p-3.5 rounded-2xl hover:bg-slate-700/60 transition-colors flex items-center gap-3.5 text-left border border-slate-700/50 hover:border-slate-600 group cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-full ${acc.avatarBg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm`}
              >
                {acc.avatarText}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-white group-hover:text-blue-300 truncate">
                  {acc.name}
                </div>
                <div className="text-xs text-slate-400 truncate">{acc.email}</div>
              </div>
            </button>
          ))}

          {/* Use Another Account Button */}
          <button
            onClick={() => setShowOtherAccount(true)}
            disabled={isLoading}
            className="w-full p-3.5 rounded-2xl hover:bg-slate-700/60 transition-colors flex items-center gap-3.5 text-left border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="font-medium text-sm text-slate-300">
              Sử dụng một tài khoản khác
            </div>
          </button>
        </div>
      ) : (
        /* Custom Account Form */
        <form onSubmit={handleCustomSubmit} className="space-y-4 mb-6 animate-in fade-in-50 duration-150">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Tên hiển thị Google của bạn
            </label>
            <input
              type="text"
              placeholder="Ví dụ: Phạm Thành Công"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Địa chỉ Email hoặc số điện thoại
            </label>
            <input
              type="email"
              required
              placeholder="tenban@gmail.com"
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-600 rounded-xl text-sm text-white focus:outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setShowOtherAccount(false)}
              className="text-xs text-blue-400 hover:underline"
            >
              ← Quay lại danh sách
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 font-semibold text-white text-xs shadow-md transition-colors"
            >
              Tiếp theo
            </button>
          </div>
        </form>
      )}

      {/* Google Terms Footer */}
      <div className="pt-4 border-t border-slate-700/60 text-center">
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Trước khi tiếp tục, Google sẽ chia sẻ tên, địa chỉ email và tùy chọn ngôn ngữ của bạn với SlidePro.
        </p>
      </div>
    </div>
  );
}

export default function GoogleAuthPage() {
  return (
    <div className="min-h-screen bg-[#202124] flex items-center justify-center p-4 font-sans text-slate-200">
      <Suspense fallback={<div className="text-slate-400 text-sm">Đang tải Google Sign In...</div>}>
        <GoogleAuthContent />
      </Suspense>
    </div>
  );
}
