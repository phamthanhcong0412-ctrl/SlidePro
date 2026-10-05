import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface RawSlideInput {
  pageNumber: number;
  text: string;
  thumbnailUrl?: string;
}

const STRICT_SYSTEM_INSTRUCTION = `Bạn là một trợ lý AI chuyên gia giáo dục và chuyển đổi tài liệu.
Nhiệm vụ của bạn là xử lý file PDF slide bài giảng được cung cấp bởi người dùng theo các quy tắc SAO CHÉP VÀ XỬ LÝ TUYỆT ĐỐI NGHIÊM NGẶT sau đây:

1. KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI, BỊA ĐẶT HOẶC SỬA ĐỔI nội dung, kiến thức, số liệu có sẵn trong file PDF của slide. Toàn bộ thông tin cốt lõi phải giữ nguyên chính xác 100% như tài liệu gốc.
2. Nhiệm vụ 1 - Kịch bản giọng đọc (Voiceover Script): Dựa hoàn toàn vào nội dung từng trang của slide gốc, hãy viết lại thành lời giảng chi tiết, tự nhiên, truyền cảm để giáo viên đọc hoặc tạo giọng đọc AI (TTS), không làm thay đổi hay bóp méo ý nghĩa gốc.
3. Nhiệm vụ 2 - Câu hỏi Quiz: Dựa hoàn toàn trên kiến thức có trong slide đó, hãy tạo ra các câu hỏi trắc nghiệm (kèm đáp án và giải thích ngắn gọn) để học sinh kiểm tra kiến thức. Tuyệt đối không đưa vào các kiến thức ngoài slide.

Đầu ra cần trình bày rõ ràng theo từng slide:
- [Slide số X]
- Nội dung tóm tắt gốc (giữ nguyên): Giữ nguyên chính xác 100% mọi thuật ngữ, định nghĩa, công thức, danh sách và số liệu trên trang slide gốc.
- Kịch bản giọng đọc: Lời giảng tự nhiên, truyền cảm, giải thích mạch lạc dựa 100% trên nội dung có trong trang slide đó (không dùng ghi chú đạo diễn như [Dừng], [Nhấn mạnh]).
- Câu hỏi Quiz ôn tập: Câu hỏi trắc nghiệm 4 lựa chọn (kèm đáp án đúng và giải thích ngắn gọn) trích xuất 100% từ thông tin trên trang slide đó, tuyệt đối không đưa kiến thức bên ngoài vào.`;

function buildAudienceToneGuide(audience?: string): string {
  if (/tiểu học|lớp 1|lớp 2|lớp 3|lớp 4|lớp 5|primary/i.test(audience || '')) {
    return 'Xưng hô "thầy/cô" và "các con/các em", giọng đọc ấm áp, gần gũi, dễ hiểu nhưng TUYỆT ĐỐI giữ nguyên 100% kiến thức và số liệu gốc trên slide.';
  }
  if (/thcs|lớp 6|lớp 7|lớp 8|lớp 9|cấp 2/i.test(audience || '')) {
    return 'Xưng hô "thầy/cô" và "các em", giọng đọc truyền cảm, mạch lạc, rõ ràng nhưng TUYỆT ĐỐI giữ nguyên 100% kiến thức và số liệu gốc trên slide.';
  }
  if (/thpt|lớp 10|lớp 11|lớp 12|cấp 3/i.test(audience || '')) {
    return 'Xưng hô "thầy/cô" và "các em", phong cách sư phạm chuẩn mực, chặt chẽ nhưng TUYỆT ĐỐI giữ nguyên 100% kiến thức và số liệu gốc trên slide.';
  }
  return `Đối tượng người học: ${audience || 'Học sinh / Sinh viên'}. Phong cách sư phạm chuẩn mực, tự nhiên, truyền cảm và giữ nguyên 100% kiến thức, số liệu gốc trên slide.`;
}

function buildStrictVerbatimFallback(
  normalizedSlides: RawSlideInput[],
  title: string,
  field: string,
  audience: string
) {
  const processedSlides = normalizedSlides.map((s, idx) => {
    const pageNum = s.pageNumber || idx + 1;
    const rawLines = (s.text || '')
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    const slideTitle = rawLines[0] || `[Slide số ${pageNum}] ${title || 'Nội dung slide'}`;
    const bodyLines = rawLines.length > 1 ? rawLines.slice(1) : rawLines;
    const originalSummary =
      rawLines.join('\n') || `Nội dung gốc trang slide số ${pageNum}.`;
    const points =
      bodyLines.length > 0
        ? bodyLines
        : [originalSummary];

    const script = `Ở slide số ${pageNum} với chủ đề "${slideTitle}", chúng ta cùng tìm hiểu các nội dung chính trong tài liệu: ${bodyLines.join('. ')}. Các bạn hãy lưu ý nắm vững chính xác các thông tin và số liệu được trình bày trên slide này.`;
    const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
    const duration = Math.max(20, Math.round((wordCount / 140) * 60));

    const keyPoint = points[0] || slideTitle;
    const slideQuiz = [
      {
        id: `q-s${pageNum}-1`,
        slideNumber: pageNum,
        question: `[Slide số ${pageNum}] Theo nội dung gốc trong slide "${slideTitle}", thông tin nào sau đây được nêu trực tiếp trong bài?`,
        options: [
          keyPoint,
          'Thông tin này không xuất hiện trong nội dung slide gốc',
          'Slide gốc phủ nhận hoàn toàn nội dung trên',
          'Tài liệu gốc bỏ qua nội dung này',
        ],
        correctIndex: 0,
        explanation: `Theo đúng nội dung gốc tại Slide số ${pageNum}: "${keyPoint}".`,
      },
    ];

    return {
      pageNumber: pageNum,
      title: slideTitle,
      originalSummary,
      points,
      script,
      quizzes: slideQuiz,
      duration,
      wordCount,
    };
  });

  const allQuizzes = processedSlides.flatMap((s) => s.quizzes || []);

  return {
    overview: `Tài liệu bài giảng "${title || 'Bài giảng PDF'}" gồm ${processedSlides.length} slide, được trích xuất nguyên bản 100% nội dung gốc kèm kịch bản giọng đọc và câu hỏi trắc nghiệm ôn tập cho từng slide.`,
    units: [
      {
        title: title || 'Nội dung bài giảng gốc',
        type: 'theory',
        startSlide: processedSlides[0]?.pageNumber || 1,
        endSlide: processedSlides[processedSlides.length - 1]?.pageNumber || processedSlides.length,
        mainContent: processedSlides
          .map((s) => `[Slide số ${s.pageNumber}] ${s.title}: ${s.originalSummary}`)
          .join('\n\n')
          .slice(0, 1500),
        questionCount: allQuizzes.length,
      },
    ],
    slides: processedSlides,
    quizzes: allQuizzes,
  };
}

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { title, textSnippets, slidesInput, field, audience } = body;

  const normalizedSlides: RawSlideInput[] =
    Array.isArray(slidesInput) && slidesInput.length > 0
      ? slidesInput.map((item: any, idx: number) => ({
          pageNumber: Number(item.pageNumber) || idx + 1,
          text: String(item.text || '').trim(),
          thumbnailUrl: typeof item.thumbnailUrl === 'string' ? item.thumbnailUrl : undefined,
        }))
      : Array.isArray(textSnippets) && textSnippets.length > 0
      ? textSnippets.map((snippet: string, idx: number) => ({
          pageNumber: idx + 1,
          text: String(snippet || '').trim(),
        }))
      : [{ pageNumber: 1, text: title || 'Nội dung bài giảng' }];

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      buildStrictVerbatimFallback(
        normalizedSlides,
        title || 'Bài giảng PDF',
        field || 'Giáo dục',
        audience || 'Người học'
      )
    );
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

    const audienceGuide = buildAudienceToneGuide(audience);

    // Xây dựng parts đa phương thức (kết hợp hình ảnh từng trang PDF + văn bản trích xuất)
    const contentParts: Array<any> = [];

    contentParts.push({
      text: `Hãy xử lý chính xác tuyệt đối các trang slide PDF bài giảng dưới đây theo đúng quy tắc hệ thống.
Thông tin chung:
- Tên tài liệu: ${title || 'Bài giảng PDF'}
- Lĩnh vực: ${field || 'Giáo dục & Đào tạo'}
- Hướng dẫn giọng đọc theo cấp học: ${audienceGuide}

QUY TẮC BẮT BUỘC CHO TỪNG SLIDE:
1. KHÔNG ĐƯỢC TỰ Ý THAY ĐỔI, BỊA ĐẶT HOẶC SỬA ĐỔI nội dung, kiến thức, số liệu có sẵn trong file PDF của slide. Toàn bộ thông tin cốt lõi phải giữ nguyên chính xác 100% như tài liệu gốc (kể cả con số, ngày tháng, công thức, thuật ngữ). Nếu văn bản trích xuất bị thiếu chữ do font PDF, hãy đọc trực tiếp từ ảnh chụp trang slide đi kèm để lấy đủ 100% chữ và số liệu gốc.
2. Nhiệm vụ 1 - Kịch bản giọng đọc (script): Dựa hoàn toàn vào nội dung từng trang của slide gốc, viết lại thành lời giảng chi tiết, tự nhiên, truyền cảm để giáo viên đọc hoặc tạo giọng đọc AI (TTS), không làm thay đổi hay bóp méo ý nghĩa gốc.
3. Nhiệm vụ 2 - Câu hỏi Quiz (quizzes): Dựa hoàn toàn trên kiến thức có trong slide đó, tạo ra 1 đến 2 câu hỏi trắc nghiệm 4 lựa chọn (kèm đáp án đúng correctIndex từ 0-3 và giải thích ngắn gọn explanation) để học sinh kiểm tra kiến thức. Tuyệt đối không đưa vào các kiến thức ngoài slide.

Dưới đây là dữ liệu gốc của ${normalizedSlides.length} slide:`,
    });

    for (const slideItem of normalizedSlides) {
      if (
        slideItem.thumbnailUrl &&
        slideItem.thumbnailUrl.startsWith('data:image/')
      ) {
        const commaIndex = slideItem.thumbnailUrl.indexOf(',');
        const metaPart = slideItem.thumbnailUrl.substring(0, commaIndex);
        const base64Data = slideItem.thumbnailUrl.substring(commaIndex + 1);
        const mimeMatch = metaPart.match(/data:(image\/[a-zA-Z0-9.+-]+);base64/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

        if (base64Data) {
          contentParts.push({
            inlineData: {
              mimeType,
              data: base64Data,
            },
          });
        }
      }

      contentParts.push({
        text: `\n=== [Slide số ${slideItem.pageNumber}] ===\nVăn bản trích xuất từ PDF trang ${slideItem.pageNumber}:\n${
          slideItem.text || '(Trang slide dạng hình ảnh - hãy đọc trực tiếp văn bản và số liệu từ ảnh chụp trang slide ở trên)'
        }\n==========================================\n`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: contentParts },
      config: {
        systemInstruction: STRICT_SYSTEM_INSTRUCTION,
        temperature: 0.1,
        topP: 0.85,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: {
              type: Type.STRING,
              description:
                'Tóm tắt tổng quan nội dung tài liệu dựa hoàn toàn 100% vào thông tin có trong các slide gốc, không bịa đặt.',
            },
            units: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'Tên đơn vị kiến thức bám sát nội dung gốc.',
                  },
                  type: {
                    type: Type.STRING,
                    description: 'Loại nội dung: theory, practice, summary, hoặc discussion.',
                  },
                  startSlide: {
                    type: Type.INTEGER,
                    description: 'Slide bắt đầu.',
                  },
                  endSlide: {
                    type: Type.INTEGER,
                    description: 'Slide kết thúc.',
                  },
                  mainContent: {
                    type: Type.STRING,
                    description: 'Tóm tắt các nội dung gốc có trong phạm vi các slide của phần này.',
                  },
                  questionCount: {
                    type: Type.INTEGER,
                    description: 'Tổng số câu hỏi trắc nghiệm của phần này.',
                  },
                },
                required: ['title', 'type', 'startSlide', 'endSlide', 'mainContent', 'questionCount'],
              },
            },
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  pageNumber: {
                    type: Type.INTEGER,
                    description: 'Số thứ tự của [Slide số X].',
                  },
                  title: {
                    type: Type.STRING,
                    description: 'Tiêu đề gốc của Slide số X (giữ nguyên chính xác theo slide gốc).',
                  },
                  originalSummary: {
                    type: Type.STRING,
                    description:
                      'Nội dung tóm tắt gốc (giữ nguyên): Sao chép và giữ nguyên chính xác 100% nội dung, kiến thức, công thức, danh mục và số liệu có trên trang slide gốc. Tuyệt đối không tự ý sửa đổi hay bịa đặt.',
                  },
                  points: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.STRING,
                    },
                    description:
                      'Danh sách các ý/dòng thông tin cốt lõi giữ nguyên chính xác 100% từ nội dung gốc của trang slide.',
                  },
                  script: {
                    type: Type.STRING,
                    description:
                      'Kịch bản giọng đọc (Voiceover Script): Lời giảng chi tiết, tự nhiên, truyền cảm để giáo viên đọc hoặc tạo giọng đọc AI (TTS), dựa hoàn toàn vào nội dung của trang slide gốc, không làm thay đổi hay bóp méo ý nghĩa gốc.',
                  },
                  quizzes: {
                    type: Type.ARRAY,
                    description:
                      'Câu hỏi Quiz ôn tập của riêng Slide số X: Dựa hoàn toàn trên kiến thức có trong slide đó (kèm đáp án và giải thích ngắn gọn). Tuyệt đối không đưa vào kiến thức ngoài slide.',
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        question: {
                          type: Type.STRING,
                          description: 'Nội dung câu hỏi trắc nghiệm kiểm tra kiến thức có ngay trên slide này.',
                        },
                        options: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.STRING,
                          },
                          description: '4 phương án lựa chọn (A, B, C, D).',
                        },
                        correctIndex: {
                          type: Type.INTEGER,
                          description: 'Chỉ số của đáp án đúng (0, 1, 2, hoặc 3).',
                        },
                        explanation: {
                          type: Type.STRING,
                          description:
                            'Giải thích ngắn gọn vì sao đáp án đúng, trích dẫn trực tiếp thông tin/số liệu có trên slide này.',
                        },
                      },
                      required: ['question', 'options', 'correctIndex', 'explanation'],
                    },
                  },
                },
                required: [
                  'pageNumber',
                  'title',
                  'originalSummary',
                  'points',
                  'script',
                  'quizzes',
                ],
              },
            },
          },
          required: ['overview', 'units', 'slides'],
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

    // Chuẩn hóa dữ liệu trả về cho từng slide
    const normalizedOutputSlides = (Array.isArray(parsed.slides) ? parsed.slides : []).map(
      (s: any, idx: number) => {
        const pageNum = Number(s.pageNumber) || normalizedSlides[idx]?.pageNumber || idx + 1;
        const scriptText = String(s.script || '').trim();
        const words = scriptText.split(/\s+/).filter(Boolean).length;
        const duration = Math.max(20, Math.round((words / 140) * 60));

        const points =
          Array.isArray(s.points) && s.points.length > 0
            ? s.points.map((p: any) => String(p).trim()).filter(Boolean)
            : String(s.originalSummary || normalizedSlides[idx]?.text || '')
                .split('\n')
                .map((l: string) => l.trim())
                .filter(Boolean);

        const originalSummary =
          String(s.originalSummary || '').trim() || points.join('\n');

        const slideQuizzes = (Array.isArray(s.quizzes) ? s.quizzes : []).map(
          (q: any, qIdx: number) => ({
            id: `q-s${pageNum}-${qIdx + 1}-${Date.now()}`,
            slideNumber: pageNum,
            question: String(q.question || '').trim(),
            options:
              Array.isArray(q.options) && q.options.length >= 2
                ? q.options.slice(0, 4).map((o: any) => String(o))
                : ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
            correctIndex:
              typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3
                ? q.correctIndex
                : 0,
            explanation: String(
              q.explanation || `Dựa trực tiếp trên nội dung gốc tại Slide số ${pageNum}.`
            ).trim(),
          })
        );

        return {
          pageNumber: pageNum,
          title: String(s.title || `Slide số ${pageNum}`).trim(),
          originalSummary,
          points,
          script: scriptText,
          quizzes: slideQuizzes,
          duration,
          wordCount: words,
        };
      }
    );

    const allQuizzes = normalizedOutputSlides.flatMap((s: any) => s.quizzes || []);

    return NextResponse.json({
      overview: parsed.overview || '',
      units: Array.isArray(parsed.units) ? parsed.units : [],
      slides: normalizedOutputSlides,
      quizzes: allQuizzes,
    });
  } catch (error) {
    console.error('Gemini Analyze API Error:', error);
    return NextResponse.json(
      buildStrictVerbatimFallback(
        normalizedSlides,
        title || 'Bài giảng PDF',
        field || 'Giáo dục',
        audience || 'Người học'
      )
    );
  }
}
