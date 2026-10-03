import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const { slideTitle, bulletPoints, currentScript, style, audience, field } = body;
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
          ? 'Ngắn gọn, trực diện, đắt giá, 80-110 từ. Đi thẳng vào bản chất và kết luận.'
          : style === 'storytelling'
          ? 'Hấp dẫn, giàu cảm xúc, mở đầu bằng câu hỏi gợi mở hoặc ví dụ thực tế cuốn hút người nghe, 140-180 từ.'
          : style === 'academic'
          ? 'Trang trọng, chuyên sâu, phân tích logic đa chiều có luận cứ khoa học rõ ràng, 140-190 từ.'
          : 'Phong cách sư phạm chuẩn mực, truyền cảm hứng, giải thích dễ hiểu, kết nối học viên, 120-160 từ.';

      // Random variation seed/instruction so repeated clicks always provide fresh perspectives
      const randomVariations = [
        'Hãy bắt đầu bằng một câu hỏi kích thích tư duy người học trước khi giải thích các ý chính.',
        'Hãy nhấn mạnh vào ứng dụng thực tiễn và bài học kinh nghiệm từ nội dung này.',
        'Hãy làm nổi bật mối liên hệ nguyên nhân - kết quả giữa các luận điểm trên slide.',
        'Hãy dùng phép tương tự hoặc ví dụ minh họa trực quan sinh động để giải thích khái niệm.',
        'Hãy đặt mình vào tâm thế một diễn giả xuất sắc chia sẻ bài học cốt lõi với người học.'
      ];
      const randomHint = randomVariations[Math.floor(Math.random() * randomVariations.length)];

      // Grade-specific pedagogy and persona
      let audiencePedagogy = '';
      if (/tiểu học|lớp 1|lớp 2|lớp 3|lớp 4|lớp 5|primary/i.test(audience || '')) {
        audiencePedagogy = `* CẤP HỌC ĐẶC BIỆT: HỌC SINH TIỂU HỌC (Lớp 1 - 5, từ 6 đến 11 tuổi):
- VAI TRÒ: Thầy/Cô giáo tiểu học ân cần, giọng ấm áp, vui tươi, tràn đầy năng lượng tích cực.
- CÁCH XƯNG HÔ: "Thầy/Cô chào các con (hoặc các em học sinh thân yêu)..."
- NGÔN TỪ: Tuyệt đối dùng từ ngữ trong sáng, đơn giản, dễ hiểu, câu văn ngắn gọn, nhịp điệu sinh động. Tuyệt đối không dùng từ Hán-Việt khó hiểu hay thuật ngữ trừu tượng.
- VÍ DỤ: Minh họa bằng hình ảnh gần gũi với trẻ nhỏ (con vật, hoa lá, đồ chơi, hoạt hình, gia đình).`;
      } else if (/thcs|lớp 6|lớp 7|lớp 8|lớp 9|cấp 2|trung học cơ sở/i.test(audience || '')) {
        audiencePedagogy = `* CẤP HỌC ĐẶC BIỆT: HỌC SINH THCS (Lớp 6 - 9, từ 11 đến 15 tuổi):
- VAI TRÒ: Thầy/Cô giáo THCS nhiệt huyết, gợi mở, khơi dậy tinh thần khám phá.
- CÁCH XƯNG HÔ: "Thầy/Cô chào các em..."
- NGÔN TỪ: Hào hứng, khơi gợi tò mò, giải thích rõ nguyên nhân - kết quả, có tính logic nhưng dễ hiểu.
- PHƯƠNG PHÁP: Đặt câu hỏi tương tác ("Các em có bao giờ tự hỏi...", "Hãy cùng cô/thầy tìm hiểu vì sao...").`;
      } else if (/thpt|lớp 10|lớp 11|lớp 12|cấp 3|trung học phổ thông/i.test(audience || '')) {
        audiencePedagogy = `* CẤP HỌC ĐẶC BIỆT: HỌC SINH THPT (Lớp 10 - 12, từ 15 đến 18 tuổi):
- VAI TRÒ: Giáo viên THPT chuyên môn sâu, rèn luyện tư duy logic, phản biện và chuẩn bị cho các kỳ thi.
- CÁCH XƯNG HÔ: "Thầy/Cô và các em (hoặc các bạn học sinh)..."
- NGÔN TỪ: Chuẩn mực sư phạm, lập luận chặt chẽ, liên hệ thực tế đời sống và định hướng kiến thức trọng tâm.`;
      } else if (/đại học|cao đẳng|sinh viên/i.test(audience || '')) {
        audiencePedagogy = `* ĐỐI TƯỢNG: SINH VIÊN ĐẠI HỌC / CAO ĐẲNG:
- VAI TRÒ: Giảng viên đại học, chuyên gia học thuật.
- CÁCH XƯNG HÔ: "Chào các bạn sinh viên (hoặc quý học viên)..."
- NGÔN TỪ: Học thuật, phân tích chuyên môn sâu, hệ thống hóa logic cao.`;
      } else {
        audiencePedagogy = `* ĐỐI TƯỢNG: ${audience || 'Người học'}: Phong cách chuẩn mực, truyền cảm hứng, dễ hiểu, giàu tính ứng dụng thực tế.`;
      }

      const prompt = `Bạn là một chuyên gia sư phạm và biên soạn bài giảng E-Learning giáo dục hàng đầu.
Nhiệm vụ: Hãy biên soạn LỜI GIẢNG THUYẾT TRÌNH (speech/lecture script) cho slide sau sao cho TUÂN THỦ TUYỆT ĐỐI ĐỘ TUỔI VÀ CẤP HỌC ĐÃ CHỌN:

${audiencePedagogy}

- Tiêu đề slide: ${slideTitle || 'Nội dung bài học'}
- Các ý chính trên slide:
${Array.isArray(bulletPoints) ? bulletPoints.map((p: string, i: number) => `  ${i + 1}. ${p}`).join('\n') : bulletPoints || 'Nội dung cốt lõi'}
- Lời giảng cũ (tham khảo để viết hay hơn): ${currentScript || 'Chưa có'}
- Lĩnh vực: ${field || 'Giáo dục & Khoa học'}
- Đối tượng: ${audience || 'Học sinh'}
- Định hướng phong cách: ${styleGuide}
- Gợi ý sáng tạo: ${randomHint}

Yêu cầu bắt buộc:
1. Đúng chuẩn tâm lý lứa tuổi và ngôn từ của cấp học đã chỉ định ở trên.
2. Không kèm các ghi chú đạo diễn như "[Chào mừng]", "[Dừng 2 giây]", chỉ trả về duy nhất văn bản lời giảng thực tế tiếng Việt để phát thanh hoặc đọc.
3. Không trả về markdown, không có dấu ngoặc kép bọc ngoài.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.95,
          topP: 0.95,
        },
      });

      const newScript = response.text ? response.text.trim() : '';

      if (newScript) {
        const words = newScript.trim().split(/\s+/).filter(Boolean).length;
        const duration = Math.round((words / 140) * 60);

        return NextResponse.json({
          script: newScript,
          wordCount: words,
          duration,
        });
      }
    } catch (apiError) {
      console.error('Gemini 3.8 API call failed:', apiError);
    }
  }

  // Dynamic pedagogical fallback when API key is missing or quota exceeded
  // Generates randomized high-quality pedagogical scripts so every click is different
  const points = Array.isArray(bulletPoints) && bulletPoints.length > 0 
    ? bulletPoints 
    : ['nguyên lý cơ bản', 'ứng dụng thực tiễn', 'kết luận'];

  const isPrimary = /tiểu học|lớp 1|lớp 2|lớp 3|lớp 4|lớp 5|primary/i.test(audience || '');
  const isSecondary = /thcs|lớp 6|lớp 7|lớp 8|lớp 9|cấp 2|trung học cơ sở/i.test(audience || '');
  const isHighSchool = /thpt|lớp 10|lớp 11|lớp 12|cấp 3|trung học phổ thông/i.test(audience || '');

  let openers: string[] = [];
  let midsections: string[] = [];
  let conclusions: string[] = [];

  if (isPrimary) {
    openers = [
      `Thầy/Cô chào các con học sinh thân yêu! Hôm nay chúng mình cùng khám phá một bài học thật vui về "${slideTitle || 'bài học hôm nay'}" nhé.`,
      `Các con ơi, các con hãy nhìn lên màn hình nào! Chúng mình cùng tìm hiểu về "${slideTitle || 'điều kỳ diệu này'}" nhé.`,
      `Chào các bạn nhỏ đáng yêu! Bài học "${slideTitle || 'này'}" hôm nay sẽ có rất nhiều điều bất ngờ và thú vị đấy.`
    ];
    midsections = [
      `Các con hãy nhớ kỹ những điều ngộ nghĩnh này nhé: đầu tiên là ${points[0] || 'điều thật dễ thương'}; tiếp theo là ${points[1] || 'một điều rất thú vị'}; và cuối cùng là ${points[2] || 'kết quả thật tuyệt vời'}.`,
      `Giống như trong những câu chuyện cổ tích quen thuộc, ${points[0] || 'nội dung này'} giúp chúng mình hiểu thêm bao điều mới lạ về ${points.slice(1, 3).join(' và ')}.`
    ];
    conclusions = [
      `Các con hãy cùng nhắc lại theo cô/thầy để chúng mình nhớ bài thật lâu và nhận nhiều điểm mười nhé!`,
      `Bài học hôm nay thật dễ hiểu phải không nào? Các con hãy về kể lại cho bố mẹ cùng nghe nhé!`
    ];
  } else if (isSecondary) {
    openers = [
      `Thầy/Cô chào các em! Đến với slide "${slideTitle || 'bài học'}", chúng ta sẽ cùng giải mã một câu hỏi vô cùng lý thú.`,
      `Chào các em học sinh! Các em có bao giờ tự hỏi vì sao "${slideTitle || 'hiện tượng này'}" lại diễn ra không? Hãy cùng cô/thầy khám phá ngay nhé.`,
      `Chào các em! Phần kiến thức "${slideTitle || 'này'}" sẽ giúp các em hiểu rõ bản chất của bài học hôm nay.`
    ];
    midsections = [
      `Các em hãy chú ý đến chuỗi mắt xích nguyên nhân và kết quả: thứ nhất là ${points[0] || 'nền tảng cốt lõi'}; tiếp đến là ${points[1] || 'quá trình vận động'}; từ đó dẫn tới ${points[2] || 'kết luận quan trọng'}.`,
      `Để hiểu rõ hơn, các em hãy liên hệ ${points[0] || 'khái niệm này'} với những hiện tượng đời sống xung quanh ta như ${points.slice(1, 3).join(' hay ')}.`
    ];
    conclusions = [
      `Nắm vững quy luật này sẽ giúp các em giải quyết các bài tập một cách cực kỳ nhanh chóng và chính xác.`,
      `Các em hãy ghi nhanh ý chính này vào vở để chúng ta cùng thực hành trong phần bài tập nhé!`
    ];
  } else if (isHighSchool) {
    openers = [
      `Thầy/Cô và các em học sinh thân mến! Slide này đề cập đến một trọng tâm kiến thức rất hay xuất hiện trong các đề kiểm tra: "${slideTitle || 'chuyên đề này'}".`,
      `Chào các em! Chúng ta cùng đi sâu vào phần "${slideTitle || 'nội dung trọng tâm'}", đòi hỏi tư duy phân tích và lập luận logic chặt chẽ.`,
      `Tiếp tục bài giảng, chúng ta cùng nghiên cứu "${slideTitle || 'vấn đề cốt lõi'}" dưới góc nhìn khoa học và thực tiễn.`
    ];
    midsections = [
      `Hệ thống luận điểm các em cần nắm chắc gồm có: ${points[0] || 'khái niệm nền tảng'}, kết hợp với ${points[1] || 'nguyên lý hoạt động'} và ${points[2] || 'ứng dụng giải quyết bài toán thực tế'}.`,
      `Mối quan hệ bản chất ở đây là: khi ${points[0] || 'yếu tố đầu tiên'} biến đổi, nó sẽ kéo theo sự thay đổi của ${points.slice(1, 3).join(' và ')} theo đúng quy luật khoa học.`
    ];
    conclusions = [
      `Đây là kiến thức then chốt giúp các em đạt điểm tối đa trong các kỳ thi học kỳ và kỳ thi quốc gia.`,
      `Hãy rèn luyện thói quen tự suy luận từ bản chất để làm chủ kiến thức vững vàng nhất nhé.`
    ];
  } else {
    openers = [
      `Kính chào quý vị và các bạn học viên. Bước sang nội dung "${slideTitle || 'bài học'}", đây chính là mắt xích vô cùng then chốt mà chúng ta cần tập trung cao độ.`,
      `Chào các bạn. Ở slide này, chúng ta sẽ cùng mổ xẻ một vấn đề mang tính quyết định: "${slideTitle || 'chuyên đề này'}".`,
      `Thưa quý thầy cô và các bạn. Điểm sáng của bài giảng nằm ở phần "${slideTitle || 'trọng tâm'}", nơi các kiến thức lý thuyết được gắn liền với thực tiễn.`
    ];
    midsections = [
      `Cụ thể, ba điểm then chốt các bạn cần ghi nhớ: thứ nhất là ${points[0] || 'nội dung khởi đầu'}; thứ hai, ${points[1] || 'sự vận động và nguyên tắc'}; và đặc biệt là ${points[2] || 'kết quả đạt được'}.`,
      `Khi phân tích sâu, ta thấy ${points[0] || 'khái niệm then chốt'} đóng vai trò nền tảng. Tiếp đó, ${points[1] || 'các yếu tố bổ trợ'} sẽ giúp hoàn thiện bức tranh toàn diện, hướng tới ${points[2] || 'mục tiêu bài học'}.`
    ];
    conclusions = [
      `Nắm chắc những điều này sẽ giúp các bạn ứng dụng một cách bài bản và đạt hiệu quả tối ưu nhất.`,
      `Hãy chủ động ghi chú lại các ý quan trọng này để chúng ta cùng thực hành trong phần thảo luận tiếp theo.`
    ];
  }

  const randomOpener = openers[Math.floor(Math.random() * openers.length)];
  const randomMid = midsections[Math.floor(Math.random() * midsections.length)];
  const randomEnd = conclusions[Math.floor(Math.random() * conclusions.length)];

  const dynamicScript = `${randomOpener} ${randomMid} ${randomEnd}`;
  const words = dynamicScript.trim().split(/\s+/).filter(Boolean).length;

  return NextResponse.json({
    script: dynamicScript,
    wordCount: words,
    duration: Math.round((words / 140) * 60),
  });
}
