import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SlidePro - Nền tảng Tạo Slide & Soạn Bài Giảng Giáo Dục Thông Minh',
  description:
    'Ứng dụng AI thông minh chuyển đổi giáo án tài liệu PDF thành bài giảng slide sinh động, tự động phân tích dàn ý, tạo kịch bản thuyết trình và xuất PowerPoint (.pptx).',
  openGraph: {
    title: 'SlidePro - Nền tảng Tạo Slide & Soạn Bài Giảng Giáo Dục Thông Minh',
    description:
      'Ứng dụng AI thông minh chuyển đổi giáo án tài liệu PDF thành bài giảng slide sinh động, tự động phân tích dàn ý, tạo kịch bản thuyết trình và xuất PowerPoint (.pptx).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlidePro - Nền tảng Tạo Slide & Soạn Bài Giảng Giáo Dục Thông Minh',
    description:
      'Ứng dụng AI thông minh chuyển đổi giáo án tài liệu PDF thành bài giảng slide sinh động, tự động phân tích dàn ý, tạo kịch bản thuyết trình và xuất PowerPoint (.pptx).',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body
        className="bg-slate-50 dark:bg-[#0b101b] text-slate-900 dark:text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-white transition-colors duration-200"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
