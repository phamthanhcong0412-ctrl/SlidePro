import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { slideTitle, bulletPoints, currentScript, style, audience, field } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // High-quality pedagogical fallback when API key is not configured
      const pointsText = Array.isArray(bulletPoints) && bulletPoints.length > 0 
        ? bulletPoints.slice(0, 3).join('. ') 
        : 'nội dung trọng tâm của bài';

      const fallbackScript = `Kính chào quý vị và các bạn học viên. Tại slide này, chúng ta cùng phân tích sâu về "${slideTitle || 'chuyên đề'}". Điểm cốt lõi cần ghi nhớ là: ${pointsText}. Việc thấu hiểu các nguyên lý cơ bản kết hợp vận dụng tình huống thực tiễn sẽ giúp chúng ta nắm chắc kiến thức và ứng dụng đạt kết quả cao nhất.`;
      const words = fallbackScript.trim().split(/\s+/).length;

      return NextResponse.json({
        script: fallbackScript,
        wordCount: words,
        duration: Math.round((words / 140) * 60),
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const styleGuide = style === 'concise' 
      ? 'Ngắn gọn, súc tích, đi thẳng vào các luận điểm chính, khoảng 90-120 từ.'
      : style === 'storytelling'
      ? 'Sinh động, giàu cảm xúc, kết nối người nghe bằng câu chuyện minh họa thực tế, khoảng 140-180 từ.'
      : style === 'academic'
      ? 'Trang trọng, học thuật chuyên sâu, phân tích logic có luận chứng rõ ràng, khoảng 140-190 từ.'
      : 'Phong cách sư phạm chuẩn mực, truyền cảm hứng, dễ hiểu, kết nối trực tiếp với người học, khoảng 120-160 từ.';

    const prompt = `Bạn là một giảng viên đại học xuất sắc, chuyên gia thuyết trình và biên soạn bài giảng E-Learning giáo dục hàng đầu.
Nhiệm vụ: Viết lại (hoặc biên soạn mới) lời giảng thuyết trình (speech/lecture script) cho slide sau:

- Tiêu đề slide: ${slideTitle || 'Nội dung bài học'}
- Các ý chính trên slide:
${Array.isArray(bulletPoints) ? bulletPoints.map((p, i) => `  ${i + 1}. ${p}`).join('\n') : bulletPoints || 'Nội dung cốt lõi'}
- Lời giảng hiện tại (tham khảo): ${currentScript || 'Chưa có'}
- Lĩnh vực: ${field || 'Giáo dục & Khoa học'}
- Đối tượng người học: ${audience || 'Học sinh / Sinh viên'}
- Yêu cầu phong cách: ${styleGuide}

Quy tắc bắt buộc:
1. Lời giảng phải hoàn toàn bằng tiếng Việt tự nhiên, ấm áp, rõ ràng, giàu tính sư phạm.
2. Không kèm các ghi chú như "[Chào mừng]", "[Nghỉ 2 giây]", chỉ trả về duy nhất văn bản lời giảng thực tế để phát thanh hoặc đọc trực tiếp.
3. Không trả về markdown hay dấu ngoặc kép bọc ngoài.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const newScript = response.text ? response.text.trim() : '';

    if (!newScript) {
      throw new Error('Gemini returned empty text');
    }

    const words = newScript.trim().split(/\s+/).length;
    const duration = Math.round((words / 140) * 60);

    return NextResponse.json({
      script: newScript,
      wordCount: words,
      duration,
    });
  } catch (error) {
    console.error('Gemini Rewrite API Error:', error);
    const { slideTitle, bulletPoints } = await req.json().catch(() => ({}));
    const pointsText = Array.isArray(bulletPoints) && bulletPoints.length > 0 
      ? bulletPoints.slice(0, 3).join('. ') 
      : 'nội dung trọng tâm';

    const fallbackScript = `Kính chào quý vị và các bạn học viên. Tại slide "${slideTitle || 'bài học'}", chúng ta cần đặc biệt lưu ý: ${pointsText}. Hãy liên hệ chặt chẽ giữa lý thuyết với thực hành để đạt kết quả tối ưu.`;
    const words = fallbackScript.trim().split(/\s+/).length;

    return NextResponse.json({
      script: fallbackScript,
      wordCount: words,
      duration: Math.round((words / 140) * 60),
    });
  }
}
