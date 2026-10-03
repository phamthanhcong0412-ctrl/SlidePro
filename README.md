# SlidePro - Chuyển đổi PDF thành Slide Bài giảng & Trắc nghiệm với AI

SlidePro là ứng dụng web thông minh giúp giáo viên, giảng viên và người thuyết trình tự động chuyển đổi tài liệu PDF thành bài giảng slide sinh động, kịch bản thuyết trình chi tiết và hệ thống câu hỏi trắc nghiệm ôn tập tương tác bằng AI.

![SlidePro Banner](https://ais-pre-lmvso7ctwetmwv7eug7dbu-968342222602.asia-southeast1.run.app/favicon.ico)

---

## ✨ Tính năng nổi bật

1. **Tải lên & Phân tích PDF Thông minh (Bước 1)**
   - Trích xuất toàn bộ nội dung văn bản từ các trang tài liệu PDF bằng thư viện `pdfjs-dist`.
   - Xem trước từng trang tài liệu, số trang, dung lượng file.

2. **Tự động xây dựng Dàn ý & Đơn vị kiến thức (Bước 2)**
   - Ứng dụng AI phân tích logic nội dung thành các đơn vị bài giảng (Knowledge Units) và Slide chi tiết.
   - Cho phép tùy chỉnh tiêu đề, mô tả, nội dung trọng tâm và số lượng câu hỏi trắc nghiệm cho từng phần.

3. **Kịch bản Thuyết trình & Ngân hàng Trắc nghiệm (Bước 3)**
   - Tự động sinh kịch bản giảng bài từng slide (slide-by-slide speaker notes).
   - Tự động sinh câu hỏi trắc nghiệm kèm 4 lựa chọn, đáp án chuẩn và lời giải thích chi tiết.
   - Thử nghiệm làm bài trắc nghiệm tương tác trực tiếp trên giao diện.

4. **Tùy biến Chủ đề & Xuất PowerPoint Chuẩn (.pptx) (Bước 4)**
   - Đa dạng chủ đề giao diện: Hiện đại Cyan, Tinh tế Emerald, Tối giản Indigo, Chuyên nghiệp Violet.
   - Xuất file `.pptx` tương thích hoàn toàn với Microsoft PowerPoint, Google Slides, WPS Office.
   - Tích hợp hiệu ứng trình chiếu, chuyển slide mượt mà.

5. **Hệ thống Quản lý & Tiện ích đi kèm**
   - Kho bài giảng mẫu & lưu trữ các dự án đã thực hiện.
   - Hệ thống tài khoản, nạp xu và lịch sử giao dịch.
   - Hộp thư thông báo và trung tâm phản hồi đóng góp ý kiến.

---

## 🛠 Công nghệ sử dụng

- **Frontend**: Next.js 15+ (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Animation**: Motion (`motion/react`), Canvas Confetti
- **Xử lý tài liệu**: `pdfjs-dist`, `pptxgenjs`
- **Trí tuệ nhân tạo**: Google Gemini API (`@google/genai`)

---

## 🚀 Hướng dẫn cài đặt & khởi chạy tại máy cục bộ

### 1. Clone repository
```bash
git clone https://github.com/phamthanhcong0412-ctrl/Ptcong.git
cd Ptcong
```

### 2. Cài đặt các gói phụ thuộc
```bash
npm install
# hoặc
pnpm install
# hoặc
bun install
```

### 3. Cấu hình biến môi trường
Tạo file `.env.local` dựa trên `.env.example`:
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 4. Khởi chạy máy chủ phát triển
```bash
npm run dev
```
Mở trình duyệt tại [http://localhost:3000](http://localhost:3000) để trải nghiệm ứng dụng.

---

## 📄 Bản quyền & Tác giả
- Phát triển bởi **Phạm Thành Công** ([@phamthanhcong0412-ctrl](https://github.com/phamthanhcong0412-ctrl)).
