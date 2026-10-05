import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STRICT_REWRITE_SYSTEM_INSTRUCTION = `Bạn là một trợ lý AI chuyên gia giáo dục và chuyển đổi tài liệu.
Nhiệm vụ của bạn là viết Kịch bản giọng đọc (Voiceover Script) cho trang slide bài giảng theo các quy tắc TUYỆT ĐỐI NGHIÊM NGẶT sau:

1. KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI, BỊA ĐẶT HOẶC SỬA ĐỔI nội dung, kiến thức, số liệu có sẵn trong slide gốc. Toàn bộ thông tin cốt lõi phải giữ nguyên chính xác 100% như tài liệu gốc.
2. Nhiệm vụ - Kịch bản giọng đọc (Voiceover Script): Dựa hoàn toàn vào nội dung của trang slide gốc được cung cấp, hãy viết lại thành lời giảng chi tiết, tự nhiên, truyền cảm để giáo viên đọc hoặc tạo giọng đọc AI (TTS), không làm thay đổi hay bóp méo ý nghĩa gốc. Tuyệt đối không đưa thêm kiến thức hay số liệu ngoài slide.`;

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const {
    slideNumber,
    slideTitle,
    originalSummary,
    originalText,
    bulletPoints,
    currentScript,
    style,
    audience,
    field,
  } = body;

  const sourceFacts = [
    originalSummary ? `Nội dung tóm tắt gốc (giữ nguyên):\n${originalSummary}` : '',
    Array.isArray(bulletPoints) && bulletPoints.length > 0
      ? `Các ý gốc trên slide:\n${bulletPoints.map((p: string, i: number) => `- ${p}`).join('\n')}`
      : '',
    originalText ? `Văn bản trích xuất nguyên bản từ PDF:\n${originalText}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const styleGuide =
        style === 'concise'
          ? 'Trình bày mạch lạc, rõ ràng, súc tích, diễn đạt trọn vẹn 100% thông tin và số liệu trên slide gốc.'
          : 'Lời giảng chi tiết, tự nhiên, truyền cảm để giáo viên đọc hoặc tạo giọng đọc AI (TTS), diễn đạt đầy đủ 100% thông tin và số liệu trên slide gốc.';

      let audiencePedagogy = '';
      if (/tiểu học|lớp 1|lớp 2|lớp 3|lớp 4|lớp 5|primary/i.test(audience || '')) {
        audiencePedagogy = 'Xưng hô "thầy/cô" và "các con/các em", giọng giảng ấm áp, rõ ràng, dễ hiểu.';
      } else if (/thcs|lớp 6|lớp 7|lớp 8|lớp 9|cấp 2|trung học cơ sở/i.test(audience || '')) {
        audiencePedagogy = 'Xưng hô "thầy/cô" và "các em", giọng giảng tự nhiên, truyền cảm, mạch lạc.';
      } else if (/thpt|lớp 10|lớp 11|lớp 12|cấp 3|trung học phổ thông/i.test(audience || '')) {
        audiencePedagogy = 'Xưng hô "thầy/cô" và "các em", giọng giảng chuẩn mực sư phạm, chặt chẽ.';
      } else {
        audiencePedagogy = `Đối tượng người học: ${audience || 'Học viên / Sinh viên'}. Giọng giảng chuyên nghiệp, tự nhiên, truyền cảm.`;
      }

      const prompt = `Hãy viết Kịch bản giọng đọc (Voiceover Script) cho [Slide số ${slideNumber || 1}]: "${slideTitle || 'Nội dung slide'}".

NGUỒN DỮ LIỆU GỐC TRÊN SLIDE (BẮT BUỘC GIỮ NGUYÊN 100% THÔNG TIN VÀ SỐ LIỆU):
${sourceFacts || slideTitle || 'Nội dung slide'}

YÊU CẦU NGHIÊM NGẶT:
1. KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI, BỊA ĐẶT HOẶC SỬA ĐỔI nội dung, kiến thức, số liệu có sẵn trong slide gốc. Toàn bộ thông tin cốt lõi phải giữ nguyên chính xác 100% như tài liệu gốc.
2. Dựa hoàn toàn vào nội dung của slide gốc ở trên, hãy viết lại thành lời giảng chi tiết, tự nhiên, truyền cảm để giáo viên đọc hoặc tạo giọng đọc AI (TTS), không làm thay đổi hay bóp méo ý nghĩa gốc.
3. Hướng dẫn xưng hô: ${audiencePedagogy}
4. Phong cách trình bày: ${styleGuide}
5. Chỉ trả về duy nhất văn bản lời giảng tiếng Việt hoàn chỉnh để đọc trực tiếp (không kèm ghi chú đạo diễn như [Chào mừng], [Dừng], không dùng markdown hay dấu ngoặc kép bọc ngoài).`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: STRICT_REWRITE_SYSTEM_INSTRUCTION,
          temperature: 0.2,
          topP: 0.85,
        },
      });

      const newScript = response.text ? response.text.trim() : '';

      if (newScript) {
        const words = newScript.trim().split(/\s+/).filter(Boolean).length;
        const duration = Math.max(20, Math.round((words / 140) * 60));

        return NextResponse.json({
          script: newScript,
          wordCount: words,
          duration,
        });
      }
    } catch (apiError) {
      console.error('Gemini 3.8 Rewrite API call failed:', apiError);
    }
  }

  // Fallback giữ nguyên 100% dữ liệu gốc của slide, tuyệt đối không bịa đặt
  const points =
    Array.isArray(bulletPoints) && bulletPoints.length > 0
      ? bulletPoints
      : originalSummary
      ? [originalSummary]
      : [slideTitle || 'Nội dung bài học'];

  const fallbackScript = `Ở slide số ${slideNumber || 1} với chủ đề "${slideTitle || 'Nội dung bài học'}", chúng ta cùng theo dõi chính xác các thông tin trọng tâm trong tài liệu gốc: ${points.join('. ')}. Các bạn hãy lưu ý ghi nhớ đầy đủ các nội dung và số liệu nguyên bản trên slide này.`;
  const words = fallbackScript.trim().split(/\s+/).filter(Boolean).length;

  return NextResponse.json({
    script: fallbackScript,
    wordCount: words,
    duration: Math.max(20, Math.round((words / 140) * 60)),
  });
}
