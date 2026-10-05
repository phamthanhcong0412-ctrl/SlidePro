import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const STRICT_QUIZ_SYSTEM_INSTRUCTION = `Bạn là một trợ lý AI chuyên gia giáo dục và chuyển đổi tài liệu.
Nhiệm vụ của bạn là tạo Câu hỏi Quiz ôn tập từ nội dung slide bài giảng theo các quy tắc TUYỆT ĐỐI NGHIÊM NGẶT sau:

1. KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI, BỊA ĐẶT HOẶC SỬA ĐỔI nội dung, kiến thức, số liệu có sẵn trong file PDF của slide. Toàn bộ thông tin cốt lõi phải giữ nguyên chính xác 100% như tài liệu gốc.
2. Nhiệm vụ - Câu hỏi Quiz: Dựa hoàn toàn trên kiến thức có trong slide đó, hãy tạo ra các câu hỏi trắc nghiệm (kèm đáp án và giải thích ngắn gọn) để học sinh kiểm tra kiến thức. Tuyệt đối không đưa vào các kiến thức ngoài slide.`;

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { title, slides, slideNumber, count, audience } = body;
  const slideList = Array.isArray(slides) ? slides : [];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const fallbackQuizzes = slideList.slice(0, count || 3).map((s: any, idx: number) => {
      const pNum = s.pageNumber || slideNumber || idx + 1;
      const firstFact =
        (Array.isArray(s.points) && s.points[0]) ||
        s.originalSummary ||
        s.title ||
        `Nội dung tại Slide số ${pNum}`;
      return {
        id: `q-s${pNum}-${Date.now()}-${idx + 1}`,
        slideNumber: pNum,
        question: `[Slide số ${pNum}] Theo nội dung trong slide "${s.title || `Slide ${pNum}`}", thông tin nào sau đây đúng với tài liệu gốc?`,
        options: [
          String(firstFact),
          'Thông tin này không được đề cập trong slide gốc',
          'Số liệu và khái niệm này nằm ngoài phạm vi slide',
          'Nội dung trái ngược với thông tin trình bày trên slide',
        ],
        correctIndex: 0,
        explanation: `Căn cứ trực tiếp theo nội dung gốc tại Slide số ${pNum}: "${firstFact}".`,
      };
    });

    return NextResponse.json({ quizzes: fallbackQuizzes });
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const slidesFormatted = slideList
      .map((s: any, idx: number) => {
        const pNum = s.pageNumber || slideNumber || idx + 1;
        const summary = s.originalSummary || '';
        const pts = Array.isArray(s.points) ? s.points.join('\n- ') : '';
        return `=== [Slide số ${pNum}]: ${s.title || ''} ===
Nội dung tóm tắt gốc (giữ nguyên):
${summary}
Các ý gốc trên slide:
- ${pts}`;
      })
      .join('\n\n');

    const prompt = `Hãy tạo ${count || Math.max(1, slideList.length)} câu hỏi trắc nghiệm ôn tập (4 lựa chọn A, B, C, D) dựa HOÀN TOÀN vào nội dung có trong các slide dưới đây.

QUY TẮC TUYỆT ĐỐI NGHIÊM NGẶT:
1. KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI, BỊA ĐẶT HOẶC SỬA ĐỔI nội dung, kiến thức, số liệu có sẵn trong slide.
2. Mỗi câu hỏi phải gắn chính xác với số trang slide (slideNumber) chứa kiến thức đó.
3. Câu hỏi, đáp án đúng và giải thích ngắn gọn (explanation) phải lấy 100% từ kiến thức/số liệu có mặt trên slide đó. Tuyệt đối KHÔNG đưa vào các kiến thức ngoài slide.
4. Đối tượng học sinh: ${audience || 'Học sinh / Sinh viên'}.

DỮ LIỆU GỐC CỦA SLIDE:
${slidesFormatted}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: STRICT_QUIZ_SYSTEM_INSTRUCTION,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  slideNumber: {
                    type: Type.INTEGER,
                    description: 'Số thứ tự của [Slide số X] mà câu hỏi này trích xuất kiến thức.',
                  },
                  question: {
                    type: Type.STRING,
                    description: 'Câu hỏi kiểm tra kiến thức dựa hoàn toàn vào nội dung trên Slide số X.',
                  },
                  options: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                    description: '4 phương án trả lời (A, B, C, D).',
                  },
                  correctIndex: {
                    type: Type.INTEGER,
                    description: 'Chỉ số phương án đúng (0, 1, 2, hoặc 3).',
                  },
                  explanation: {
                    type: Type.STRING,
                    description: 'Giải thích ngắn gọn vì sao đáp án đúng dựa trực tiếp vào thông tin trên Slide số X.',
                  },
                },
                required: ['slideNumber', 'question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['quizzes'],
        },
      },
    });

    const responseText = response.text || '';
    let jsonStr = responseText.replace(/```(?:json)?/gi, '').trim();
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(jsonStr);

    const quizzes = (Array.isArray(parsed.quizzes) ? parsed.quizzes : []).map(
      (q: any, idx: number) => {
        const sNum = Number(q.slideNumber) || slideNumber || slideList[idx % Math.max(1, slideList.length)]?.pageNumber || 1;
        return {
          id: `q-s${sNum}-${Date.now()}-${idx + 1}`,
          slideNumber: sNum,
          question: String(q.question || '').trim(),
          options:
            Array.isArray(q.options) && q.options.length >= 2
              ? q.options.slice(0, 4).map((o: any) => String(o))
              : ['Phương án A', 'Phương án B', 'Phương án C', 'Phương án D'],
          correctIndex:
            typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3
              ? q.correctIndex
              : 0,
          explanation: String(q.explanation || `Trích xuất trực tiếp từ Slide số ${sNum}.`).trim(),
        };
      }
    );

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error('Gemini Quiz API Error:', error);
    const fallbackQuizzes = slideList.slice(0, count || 2).map((s: any, idx: number) => {
      const pNum = s.pageNumber || slideNumber || idx + 1;
      const firstFact =
        (Array.isArray(s.points) && s.points[0]) ||
        s.originalSummary ||
        s.title ||
        `Nội dung tại Slide số ${pNum}`;
      return {
        id: `q-s${pNum}-${Date.now()}-${idx + 1}`,
        slideNumber: pNum,
        question: `[Slide số ${pNum}] Theo nội dung trong slide "${s.title || `Slide ${pNum}`}", thông tin nào sau đây đúng với tài liệu gốc?`,
        options: [
          String(firstFact),
          'Thông tin này không được đề cập trong slide gốc',
          'Số liệu và khái niệm này nằm ngoài phạm vi slide',
          'Nội dung trái ngược với thông tin trình bày trên slide',
        ],
        correctIndex: 0,
        explanation: `Căn cứ trực tiếp theo nội dung gốc tại Slide số ${pNum}: "${firstFact}".`,
      };
    });
    return NextResponse.json({ quizzes: fallbackQuizzes });
  }
}
