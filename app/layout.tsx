import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SlideEdu - Nền tảng Tạo Slide & Soạn Bài Giảng Giáo Dục từ PDF',
  description: 'Ứng dụng thông minh phục vụ giáo dục, chuyển đổi giáo án tài liệu PDF thành bài giảng slide sinh động, tự động phân tích dàn ý, tạo kịch bản thuyết trình và xuất PowerPoint (.pptx).',
  openGraph: {
    title: 'SlideEdu - Nền tảng Tạo Slide & Soạn Bài Giảng Giáo Dục từ PDF',
    description: 'Ứng dụng thông minh phục vụ giáo dục, chuyển đổi giáo án tài liệu PDF thành bài giảng slide sinh động, tự động phân tích dàn ý, tạo kịch bản thuyết trình và xuất PowerPoint (.pptx).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SlideEdu - Nền tảng Tạo Slide & Soạn Bài Giảng Giáo Dục từ PDF',
    description: 'Ứng dụng thông minh phục vụ giáo dục, chuyển đổi giáo án tài liệu PDF thành bài giảng slide sinh động, tự động phân tích dàn ý, tạo kịch bản thuyết trình và xuất PowerPoint (.pptx).',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body className="bg-[#0b101b] text-slate-100 antialiased min-h-screen selection:bg-cyan-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
