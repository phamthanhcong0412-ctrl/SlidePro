import { LectureProject } from '@/types/presentation';

export const SAMPLE_PROJECTS: LectureProject[] = [
  {
    id: 'sample-medical',
    title: 'Sinh lý bệnh và chẩn đoán lâm sàng chèn ép tim',
    fileName: 'Sinh_ly_benh_chen_ep_tim.pdf',
    fileSize: '4.2 MB',
    totalPages: 3,
    field: 'Khoa học sự sống & Sức khoẻ',
    audience: 'Sinh viên đại học/cao đẳng',
    overview:
      'Bài giảng trình bày về cơ chế sinh lý bệnh cùng các triệu chứng lâm sàng (cơ năng và thực thể) và tiêu chuẩn cận lâm sàng để chẩn đoán xác định hội chứng chèn ép tim cấp.',
    voice: 'Nữ - Giọng Bắc (Hà Nội)',
    voiceSpeed: 1,
    status: 'analyzed',
    createdAt: '2026-10-01',
    units: [
      {
        id: 'unit-1',
        title: 'Sinh lý bệnh và chẩn đoán lâm sàng chèn ép tim',
        type: 'theory',
        startSlide: 1,
        endSlide: 3,
        mainContent: `- [Slide số 1] Đại cương và Cơ chế sinh lý bệnh chèn ép tim
- [Slide số 2] Triệu chứng lâm sàng: Cơ năng và Thực thể (Tam chứng Beck, mạch nghịch > 10 mmHg)
- [Slide số 3] Cận lâm sàng & Tiêu chuẩn chẩn đoán xác định (ECG, X-quang, Siêu âm tim)`,
        questionCount: 3,
      },
    ],
    slides: [
      {
        id: 's-1',
        pageNumber: 1,
        title: 'Đại cương và Cơ chế sinh lý bệnh chèn ép tim',
        originalText:
          'Đại cương và Cơ chế sinh lý bệnh chèn ép tim\n- Chèn ép tim cấp là tình trạng cấp cứu nội khoa - ngoại khoa tim mạch.\n- Sự tích tụ dịch trong khoang màng ngoài tim làm tăng áp lực trong khoang.\n- Gây cản trở đổ đầy tâm thất trong thời kỳ tâm trương, giảm thể tích tống máu.\n- Hậu quả: Giảm cung lượng tim nghiêm trọng và tụt huyết áp động mạch.',
        originalSummary:
          '• Chèn ép tim cấp là tình trạng cấp cứu nội khoa - ngoại khoa tim mạch.\n• Sự tích tụ dịch trong khoang màng ngoài tim làm tăng áp lực trong khoang.\n• Gây cản trở đổ đầy tâm thất trong thời kỳ tâm trương, giảm thể tích tống máu.\n• Hậu quả: Giảm cung lượng tim nghiêm trọng và tụt huyết áp động mạch.',
        points: [
          'Chèn ép tim cấp là tình trạng cấp cứu nội khoa - ngoại khoa tim mạch.',
          'Sự tích tụ dịch trong khoang màng ngoài tim làm tăng áp lực trong khoang.',
          'Gây cản trở đổ đầy tâm thất trong thời kỳ tâm trương, giảm thể tích tống máu.',
          'Hậu quả: Giảm cung lượng tim nghiêm trọng và tụt huyết áp động mạch.',
        ],
        script:
          'Chào các bạn sinh viên, ở slide số 1 chúng ta cùng đi vào phần Đại cương và Cơ chế sinh lý bệnh của chèn ép tim. Chèn ép tim cấp là một tình trạng cấp cứu nội khoa và ngoại khoa tim mạch. Về cơ chế, khi dịch tích tụ trong khoang màng ngoài tim sẽ làm tăng áp lực trong khoang này. Áp lực tăng cao gây cản trở trực tiếp quá trình đổ đầy tâm thất trong thời kỳ tâm trương, từ đó làm giảm thể tích tống máu. Hậu quả cuối cùng là dẫn đến giảm cung lượng tim nghiêm trọng và gây tụt huyết áp động mạch.',
        quizzes: [
          {
            id: 'q-1',
            slideNumber: 1,
            question:
              'Theo nội dung Slide số 1, sự tích tụ dịch làm tăng áp lực trong khoang màng ngoài tim gây ra cơ chế trực tiếp nào sau đây?',
            options: [
              'Cản trở đổ đầy tâm thất trong thời kỳ tâm trương, làm giảm thể tích tống máu và giảm cung lượng tim',
              'Tăng thể tích đổ đầy tâm thất trong thời kỳ tâm thu',
              'Làm tăng cung lượng tim và tăng huyết áp động mạch',
              'Gây giãn nở tự do khoang màng ngoài tim mà không ảnh hưởng huyết áp',
            ],
            correctIndex: 0,
            explanation:
              'Theo nội dung gốc tại Slide số 1: Sự tích tụ dịch làm tăng áp lực trong khoang màng ngoài tim, gây cản trở đổ đầy tâm thất trong thời kỳ tâm trương, giảm thể tích tống máu, dẫn đến giảm cung lượng tim nghiêm trọng và tụt huyết áp động mạch.',
          },
        ],
        duration: 57,
        wordCount: 157,
        rotation: 0,
      },
      {
        id: 's-2',
        pageNumber: 2,
        title: 'Triệu chứng lâm sàng: Cơ năng và Thực thể',
        originalText:
          'Triệu chứng lâm sàng: Cơ năng và Thực thể\n- Triệu chứng cơ năng: Khó thở tăng dần khi nằm, đau tức ngực sau xương ức, cảm giác lo sợ hoảng hốt.\n- Tam chứng Beck điển hình: Tụt huyết áp động mạch, Tĩnh mạch cổ nổi to, Tiếng tim mờ xa xăm.\n- Dấu hiệu mạch nghịch (Pulsus paradoxus): Huyết áp tâm thu giảm trên 10 mmHg khi hít vào sâu.\n- Nhịp tim nhanh phản xạ, da tái lạnh vã mồ hôi do suy tuần hoàn cấp.',
        originalSummary:
          '• Triệu chứng cơ năng: Khó thở tăng dần khi nằm, đau tức ngực sau xương ức, cảm giác lo sợ hoảng hốt.\n• Tam chứng Beck điển hình: Tụt huyết áp động mạch, Tĩnh mạch cổ nổi to, Tiếng tim mờ xa xăm.\n• Dấu hiệu mạch nghịch (Pulsus paradoxus): Huyết áp tâm thu giảm trên 10 mmHg khi hít vào sâu.\n• Nhịp tim nhanh phản xạ, da tái lạnh vã mồ hôi do suy tuần hoàn cấp.',
        points: [
          'Triệu chứng cơ năng: Khó thở tăng dần khi nằm, đau tức ngực sau xương ức, cảm giác lo sợ hoảng hốt.',
          'Tam chứng Beck điển hình: Tụt huyết áp động mạch, Tĩnh mạch cổ nổi to, Tiếng tim mờ xa xăm.',
          'Dấu hiệu mạch nghịch (Pulsus paradoxus): Huyết áp tâm thu giảm trên 10 mmHg khi hít vào sâu.',
          'Nhịp tim nhanh phản xạ, da tái lạnh vã mồ hôi do suy tuần hoàn cấp.',
        ],
        script:
          'Chuyển sang slide số 2 về Triệu chứng lâm sàng gồm cơ năng và thực thể. Về triệu chứng cơ năng, người bệnh có biểu hiện khó thở tăng dần khi nằm, đau tức ngực sau xương ức và cảm giác lo sợ hoảng hốt. Về triệu chứng thực thể, các bạn cần nắm vững Tam chứng Beck điển hình bao gồm: tụt huyết áp động mạch, tĩnh mạch cổ nổi to và tiếng tim mờ xa xăm. Bên cạnh đó là dấu hiệu mạch nghịch Pulsus paradoxus với huyết áp tâm thu giảm trên 10 mmHg khi hít vào sâu, kèm nhịp tim nhanh phản xạ, da tái lạnh và vã mồ hôi do suy tuần hoàn cấp.',
        quizzes: [
          {
            id: 'q-2',
            slideNumber: 2,
            question:
              'Theo Slide số 2, Tam chứng Beck điển hình và dấu hiệu mạch nghịch (Pulsus paradoxus) được xác định với thông số nào?',
            options: [
              'Tụt huyết áp động mạch, tĩnh mạch cổ nổi to, tiếng tim mờ xa xăm; mạch nghịch có huyết áp tâm thu giảm trên 10 mmHg khi hít vào sâu',
              'Huyết áp tăng, tĩnh mạch cổ xẹp, tiếng tim đập mạnh; huyết áp tâm thu tăng trên 10 mmHg',
              'Khó thở giảm khi nằm, nhịp tim chậm, huyết áp tâm trương giảm trên 20 mmHg',
              'Đau ngực giảm khi nằm ngửa, da ấm hồng, không có tĩnh mạch cổ nổi',
            ],
            correctIndex: 0,
            explanation:
              'Theo đúng Slide số 2: Tam chứng Beck gồm tụt huyết áp động mạch, tĩnh mạch cổ nổi to, tiếng tim mờ xa xăm; dấu hiệu mạch nghịch là huyết áp tâm thu giảm trên 10 mmHg khi hít vào sâu.',
          },
        ],
        duration: 62,
        wordCount: 168,
        rotation: 0,
      },
      {
        id: 's-3',
        pageNumber: 3,
        title: 'Cận lâm sàng & Tiêu chuẩn chẩn đoán xác định',
        originalText:
          'Cận lâm sàng & Tiêu chuẩn chẩn đoán xác định\n- Điện tâm đồ (ECG): Điện thế thấp lan tỏa ở các chuyển đạo ngoại vi, hiện tượng luân phiên điện học (Electrical alternans).\n- X-quang ngực thẳng: Bóng tim to dạng "bình nước", phổi sáng do giảm tưới máu.\n- Siêu âm tim (Tiêu chuẩn vàng): Khoang màng ngoài tim nhiều dịch, dấu hiệu đè sụp nhĩ phải thời kỳ cuối tâm trương và thất phải đầu tâm trương.\n- Xử trí khẩn cấp: Chọc hút màng ngoài tim giải áp cấp cứu dưới hướng dẫn siêu âm.',
        originalSummary:
          '• Điện tâm đồ (ECG): Điện thế thấp lan tỏa ở các chuyển đạo ngoại vi, hiện tượng luân phiên điện học (Electrical alternans).\n• X-quang ngực thẳng: Bóng tim to dạng "bình nước", phổi sáng do giảm tưới máu.\n• Siêu âm tim (Tiêu chuẩn vàng): Khoang màng ngoài tim nhiều dịch, dấu hiệu đè sụp nhĩ phải thời kỳ cuối tâm trương và thất phải đầu tâm trương.\n• Xử trí khẩn cấp: Chọc hút màng ngoài tim giải áp cấp cứu dưới hướng dẫn siêu âm.',
        points: [
          'Điện tâm đồ (ECG): Điện thế thấp lan tỏa ở các chuyển đạo ngoại vi, hiện tượng luân phiên điện học (Electrical alternans).',
          'X-quang ngực thẳng: Bóng tim to dạng "bình nước", phổi sáng do giảm tưới máu.',
          'Siêu âm tim (Tiêu chuẩn vàng): Khoang màng ngoài tim nhiều dịch, dấu hiệu đè sụp nhĩ phải thời kỳ cuối tâm trương và thất phải đầu tâm trương.',
          'Xử trí khẩn cấp: Chọc hút màng ngoài tim giải áp cấp cứu dưới hướng dẫn siêu âm.',
        ],
        script:
          'Tại slide số 3, chúng ta xem xét các phương pháp Cận lâm sàng và Tiêu chuẩn chẩn đoán xác định. Thứ nhất, trên Điện tâm đồ ECG ghi nhận điện thế thấp lan tỏa ở các chuyển đạo ngoại vi và hiện tượng luân phiên điện học Electrical alternans. Thứ hai, trên X-quang ngực thẳng thấy hình ảnh bóng tim to dạng bình nước và phổi sáng do giảm tưới máu. Thứ ba, Siêu âm tim là tiêu chuẩn vàng, cho thấy khoang màng ngoài tim nhiều dịch kèm dấu hiệu đè sụp nhĩ phải thời kỳ cuối tâm trương và thất phải đầu tâm trương. Về xử trí khẩn cấp, cần tiến hành chọc hút màng ngoài tim giải áp cấp cứu dưới hướng dẫn siêu âm.',
        quizzes: [
          {
            id: 'q-3',
            slideNumber: 3,
            question:
              'Theo Slide số 3, phương pháp cận lâm sàng nào là "Tiêu chuẩn vàng" và có dấu hiệu đặc trưng gì?',
            options: [
              'Siêu âm tim: Khoang màng ngoài tim nhiều dịch, đè sụp nhĩ phải cuối tâm trương và thất phải đầu tâm trương',
              'X-quang ngực thẳng: Bóng tim nhỏ và phổi ứ huyết nặng',
              'Điện tâm đồ (ECG): Điện thế cao ở tất cả các chuyển đạo ngoại vi',
              'Siêu âm tim: Không có dịch khoang màng ngoài tim, chỉ đè sụp thất trái thì tâm thu',
            ],
            correctIndex: 0,
            explanation:
              'Theo đúng nội dung gốc tại Slide số 3: Siêu âm tim là tiêu chuẩn vàng với hình ảnh khoang màng ngoài tim nhiều dịch, dấu hiệu đè sụp nhĩ phải thời kỳ cuối tâm trương và thất phải đầu tâm trương.',
          },
        ],
        duration: 68,
        wordCount: 182,
        rotation: 0,
      },
    ],
    quizzes: [
      {
        id: 'q-1',
        slideNumber: 1,
        question:
          'Theo nội dung Slide số 1, sự tích tụ dịch làm tăng áp lực trong khoang màng ngoài tim gây ra cơ chế trực tiếp nào sau đây?',
        options: [
          'Cản trở đổ đầy tâm thất trong thời kỳ tâm trương, làm giảm thể tích tống máu và giảm cung lượng tim',
          'Tăng thể tích đổ đầy tâm thất trong thời kỳ tâm thu',
          'Làm tăng cung lượng tim và tăng huyết áp động mạch',
          'Gây giãn nở tự do khoang màng ngoài tim mà không ảnh hưởng huyết áp',
        ],
        correctIndex: 0,
        explanation:
          'Theo nội dung gốc tại Slide số 1: Sự tích tụ dịch làm tăng áp lực trong khoang màng ngoài tim, gây cản trở đổ đầy tâm thất trong thời kỳ tâm trương, giảm thể tích tống máu, dẫn đến giảm cung lượng tim nghiêm trọng và tụt huyết áp động mạch.',
      },
      {
        id: 'q-2',
        slideNumber: 2,
        question:
          'Theo Slide số 2, Tam chứng Beck điển hình và dấu hiệu mạch nghịch (Pulsus paradoxus) được xác định với thông số nào?',
        options: [
          'Tụt huyết áp động mạch, tĩnh mạch cổ nổi to, tiếng tim mờ xa xăm; mạch nghịch có huyết áp tâm thu giảm trên 10 mmHg khi hít vào sâu',
          'Huyết áp tăng, tĩnh mạch cổ xẹp, tiếng tim đập mạnh; huyết áp tâm thu tăng trên 10 mmHg',
          'Khó thở giảm khi nằm, nhịp tim chậm, huyết áp tâm trương giảm trên 20 mmHg',
          'Đau ngực giảm khi nằm ngửa, da ấm hồng, không có tĩnh mạch cổ nổi',
        ],
        correctIndex: 0,
        explanation:
          'Theo đúng Slide số 2: Tam chứng Beck gồm tụt huyết áp động mạch, tĩnh mạch cổ nổi to, tiếng tim mờ xa xăm; dấu hiệu mạch nghịch là huyết áp tâm thu giảm trên 10 mmHg khi hít vào sâu.',
      },
      {
        id: 'q-3',
        slideNumber: 3,
        question:
          'Theo Slide số 3, phương pháp cận lâm sàng nào là "Tiêu chuẩn vàng" và có dấu hiệu đặc trưng gì?',
        options: [
          'Siêu âm tim: Khoang màng ngoài tim nhiều dịch, đè sụp nhĩ phải cuối tâm trương và thất phải đầu tâm trương',
          'X-quang ngực thẳng: Bóng tim nhỏ và phổi ứ huyết nặng',
          'Điện tâm đồ (ECG): Điện thế cao ở tất cả các chuyển đạo ngoại vi',
          'Siêu âm tim: Không có dịch khoang màng ngoài tim, chỉ đè sụp thất trái thì tâm thu',
        ],
        correctIndex: 0,
        explanation:
          'Theo đúng nội dung gốc tại Slide số 3: Siêu âm tim là tiêu chuẩn vàng với hình ảnh khoang màng ngoài tim nhiều dịch, dấu hiệu đè sụp nhĩ phải thời kỳ cuối tâm trương và thất phải đầu tâm trương.',
      },
    ],
  },
  {
    id: 'sample-ai',
    title: 'Nhập môn Trí tuệ nhân tạo và Machine Learning',
    fileName: 'Intro_AI_Machine_Learning.pdf',
    fileSize: '3.8 MB',
    totalPages: 3,
    field: 'Công nghệ thông tin & Khoa học dữ liệu',
    audience: 'Sinh viên đại học/cao đẳng',
    overview:
      'Tổng quan nền tảng về Trí tuệ nhân tạo, phân loại Học máy có giám sát, không giám sát, học tăng cường và ứng dụng thực tiễn của Generative AI.',
    voice: 'Nam - Giọng Bắc (Hà Nội)',
    voiceSpeed: 1,
    status: 'analyzed',
    createdAt: '2026-10-01',
    units: [
      {
        id: 'unit-ai-1',
        title: 'Nền tảng Trí tuệ nhân tạo & Machine Learning',
        type: 'theory',
        startSlide: 1,
        endSlide: 3,
        mainContent: `- [Slide số 1] Tổng quan: AI, Học máy và Học sâu (AI ⊃ Machine Learning ⊃ Deep Learning)
- [Slide số 2] Phân loại các phương pháp Học máy chủ đạo (Supervised, Unsupervised, Reinforcement, Self-supervised Learning)
- [Slide số 3] Xu hướng Generative AI và Ứng dụng thực tiễn`,
        questionCount: 3,
      },
    ],
    slides: [
      {
        id: 's-ai-1',
        pageNumber: 1,
        title: 'Tổng quan: AI, Học máy và Học sâu',
        originalSummary:
          '• AI (Trí tuệ nhân tạo): Phạm trù rộng lớn mô phỏng tư duy thông minh của con người.\n• Machine Learning (Học máy): Tập con của AI, tập trung vào thuật toán tự học từ dữ liệu.\n• Deep Learning (Học sâu): Sử dụng mạng nơ-ron nhiều tầng phỏng theo vỏ não sinh học.\n• Mối quan hệ phân cấp: AI ⊃ Machine Learning ⊃ Deep Learning.',
        points: [
          'AI (Trí tuệ nhân tạo): Phạm trù rộng lớn mô phỏng tư duy thông minh của con người.',
          'Machine Learning (Học máy): Tập con của AI, tập trung vào thuật toán tự học từ dữ liệu.',
          'Deep Learning (Học sâu): Sử dụng mạng nơ-ron nhiều tầng phỏng theo vỏ não sinh học.',
          'Mối quan hệ phân cấp: AI ⊃ Machine Learning ⊃ Deep Learning.',
        ],
        script:
          'Xin chào các bạn học viên, tại slide số 1 chúng ta cùng tìm hiểu Tổng quan về AI, Học máy và Học sâu. Trước hết, AI tức Trí tuệ nhân tạo là phạm trù rộng lớn mô phỏng tư duy thông minh của con người. Tiếp theo, Machine Learning hay Học máy là tập con của AI, tập trung vào các thuật toán tự học từ dữ liệu. Trong khi đó, Deep Learning hay Học sâu sử dụng mạng nơ-ron nhiều tầng phỏng theo vỏ não sinh học. Như vậy, mối quan hệ phân cấp chuẩn xác là AI bao hàm Machine Learning, và Machine Learning bao hàm Deep Learning.',
        quizzes: [
          {
            id: 'q-ai-1',
            slideNumber: 1,
            question:
              'Theo nội dung gốc tại Slide số 1, mối quan hệ phân cấp giữa AI, Machine Learning và Deep Learning được biểu diễn như thế nào?',
            options: [
              'AI ⊃ Machine Learning ⊃ Deep Learning',
              'Deep Learning ⊃ Machine Learning ⊃ AI',
              'Machine Learning ⊃ AI ⊃ Deep Learning',
              'Ba lĩnh vực hoàn toàn tách biệt nhau',
            ],
            correctIndex: 0,
            explanation:
              'Theo nội dung gốc trên Slide số 1: Mối quan hệ phân cấp là AI ⊃ Machine Learning ⊃ Deep Learning (Machine Learning là tập con của AI, Deep Learning sử dụng mạng nơ-ron nhiều tầng).',
          },
        ],
        duration: 52,
        wordCount: 140,
        rotation: 0,
      },
      {
        id: 's-ai-2',
        pageNumber: 2,
        title: 'Phân loại các phương pháp Học máy chủ đạo',
        originalSummary:
          '• Học có giám sát (Supervised Learning): Dữ liệu có nhãn đầu ra (Hồi quy, Phân loại).\n• Học không giám sát (Unsupervised Learning): Tìm kiếm cấu trúc ẩn trong dữ liệu (Phân cụm, Giảm số chiều).\n• Học tăng cường (Reinforcement Learning): Học thông qua tương tác môi trường và hàm phần thưởng.\n• Self-supervised Learning: Phương pháp nền tảng huấn luyện các mô hình ngôn ngữ lớn (LLM).',
        points: [
          'Học có giám sát (Supervised Learning): Dữ liệu có nhãn đầu ra (Hồi quy, Phân loại).',
          'Học không giám sát (Unsupervised Learning): Tìm kiếm cấu trúc ẩn trong dữ liệu (Phân cụm, Giảm số chiều).',
          'Học tăng cường (Reinforcement Learning): Học thông qua tương tác môi trường và hàm phần thưởng.',
          'Self-supervised Learning: Phương pháp nền tảng huấn luyện các mô hình ngôn ngữ lớn (LLM).',
        ],
        script:
          'Bước sang slide số 2, chúng ta phân loại các phương pháp Học máy chủ đạo. Thứ nhất là Học có giám sát Supervised Learning, sử dụng dữ liệu có nhãn đầu ra cho các bài toán Hồi quy và Phân loại. Thứ hai là Học không giám sát Unsupervised Learning, chuyên tìm kiếm cấu trúc ẩn trong dữ liệu như Phân cụm và Giảm số chiều. Thứ ba là Học tăng cường Reinforcement Learning, học thông qua tương tác môi trường và hàm phần thưởng. Cuối cùng là Self-supervised Learning, phương pháp nền tảng dùng để huấn luyện các mô hình ngôn ngữ lớn LLM.',
        quizzes: [
          {
            id: 'q-ai-2',
            slideNumber: 2,
            question:
              'Theo Slide số 2, phương pháp học máy nào sử dụng dữ liệu có nhãn đầu ra cho bài toán Hồi quy và Phân loại?',
            options: [
              'Học có giám sát (Supervised Learning)',
              'Học không giám sát (Unsupervised Learning)',
              'Học tăng cường (Reinforcement Learning)',
              'Self-supervised Learning',
            ],
            correctIndex: 0,
            explanation:
              'Theo đúng Slide số 2: Học có giám sát (Supervised Learning) sử dụng dữ liệu có nhãn đầu ra (Hồi quy, Phân loại).',
          },
        ],
        duration: 58,
        wordCount: 155,
        rotation: 0,
      },
      {
        id: 's-ai-3',
        pageNumber: 3,
        title: 'Xu hướng Generative AI và Ứng dụng thực tiễn',
        originalSummary:
          '• Sự bùng nổ của kiến trúc Transformer và mô hình nền tảng đa phương thức (Multimodal).\n• Ứng dụng xử lý ngôn ngữ tự nhiên, tạo ảnh, sinh mã lập trình và phân tích khoa học.\n• Thách thức đạo đức: Bản quyền dữ liệu, ảo giác thông tin (Hallucination) và an toàn AI.\n• Tương lai: Tự động hóa thông minh (Agentic AI) giải quyết các tác vụ phức tạp.',
        points: [
          'Sự bùng nổ của kiến trúc Transformer và mô hình nền tảng đa phương thức (Multimodal).',
          'Ứng dụng xử lý ngôn ngữ tự nhiên, tạo ảnh, sinh mã lập trình và phân tích khoa học.',
          'Thách thức đạo đức: Bản quyền dữ liệu, ảo giác thông tin (Hallucination) và an toàn AI.',
          'Tương lai: Tự động hóa thông minh (Agentic AI) giải quyết các tác vụ phức tạp.',
        ],
        script:
          'Ở slide số 3, chúng ta tìm hiểu Xu hướng Generative AI và Ứng dụng thực tiễn. Hiện nay là sự bùng nổ của kiến trúc Transformer và các mô hình nền tảng đa phương thức Multimodal. Chúng được ứng dụng rộng rãi trong xử lý ngôn ngữ tự nhiên, tạo ảnh, sinh mã lập trình và phân tích khoa học. Tuy nhiên, các thách thức đạo đức đặt ra gồm bản quyền dữ liệu, ảo giác thông tin Hallucination và an toàn AI. Hướng tới tương lai là xu thế tự động hóa thông minh Agentic AI nhằm giải quyết các tác vụ phức tạp.',
        quizzes: [
          {
            id: 'q-ai-3',
            slideNumber: 3,
            question:
              'Theo Slide số 3, những thách thức đạo đức nào được nêu ra đối với Generative AI?',
            options: [
              'Bản quyền dữ liệu, ảo giác thông tin (Hallucination) và an toàn AI',
              'Chỉ có vấn đề tốc độ tính toán phần cứng',
              'Không thể xử lý ngôn ngữ tự nhiên hay sinh mã lập trình',
              'Không hỗ trợ mô hình đa phương thức (Multimodal)',
            ],
            correctIndex: 0,
            explanation:
              'Theo đúng nội dung gốc tại Slide số 3: Thách thức đạo đức gồm Bản quyền dữ liệu, ảo giác thông tin (Hallucination) và an toàn AI.',
          },
        ],
        duration: 50,
        wordCount: 135,
        rotation: 0,
      },
    ],
    quizzes: [
      {
        id: 'q-ai-1',
        slideNumber: 1,
        question:
          'Theo nội dung gốc tại Slide số 1, mối quan hệ phân cấp giữa AI, Machine Learning và Deep Learning được biểu diễn như thế nào?',
        options: [
          'AI ⊃ Machine Learning ⊃ Deep Learning',
          'Deep Learning ⊃ Machine Learning ⊃ AI',
          'Machine Learning ⊃ AI ⊃ Deep Learning',
          'Ba lĩnh vực hoàn toàn tách biệt nhau',
        ],
        correctIndex: 0,
        explanation:
          'Theo nội dung gốc trên Slide số 1: Mối quan hệ phân cấp là AI ⊃ Machine Learning ⊃ Deep Learning.',
      },
      {
        id: 'q-ai-2',
        slideNumber: 2,
        question:
          'Theo Slide số 2, phương pháp học máy nào sử dụng dữ liệu có nhãn đầu ra cho bài toán Hồi quy và Phân loại?',
        options: [
          'Học có giám sát (Supervised Learning)',
          'Học không giám sát (Unsupervised Learning)',
          'Học tăng cường (Reinforcement Learning)',
          'Self-supervised Learning',
        ],
        correctIndex: 0,
        explanation:
          'Theo đúng Slide số 2: Học có giám sát (Supervised Learning) sử dụng dữ liệu có nhãn đầu ra (Hồi quy, Phân loại).',
      },
      {
        id: 'q-ai-3',
        slideNumber: 3,
        question:
          'Theo Slide số 3, những thách thức đạo đức nào được nêu ra đối với Generative AI?',
        options: [
          'Bản quyền dữ liệu, ảo giác thông tin (Hallucination) và an toàn AI',
          'Chỉ có vấn đề tốc độ tính toán phần cứng',
          'Không thể xử lý ngôn ngữ tự nhiên hay sinh mã lập trình',
          'Không hỗ trợ mô hình đa phương thức (Multimodal)',
        ],
        correctIndex: 0,
        explanation:
          'Theo đúng nội dung gốc tại Slide số 3: Thách thức đạo đức gồm Bản quyền dữ liệu, ảo giác thông tin (Hallucination) và an toàn AI.',
      },
    ],
  },
];

export const LECTURE_FIELDS = [
  'Khoa học sự sống & Sức khoẻ',
  'Công nghệ thông tin & Khoa học dữ liệu',
  'Kinh tế & Quản trị kinh doanh',
  'Khoa học tự nhiên & Kỹ thuật',
  'Khoa học xã hội & Nhân văn',
  'Sư phạm & Giáo dục',
  'Ngoại ngữ & Kỹ năng mềm',
  'Khác',
];

export const LEARNER_AUDIENCES = [
  'Học sinh Tiểu học (Lớp 1 - 5)',
  'Học sinh THCS (Lớp 6 - 9)',
  'Học sinh THPT (Lớp 10 - 12)',
  'Sinh viên đại học/cao đẳng',
  'Chuyên viên / Người đi làm',
  'Đại chúng (Mọi lứa tuổi)',
];

export const LECTURE_TYPES = [
  { value: 'theory', label: 'Lý thuyết' },
  { value: 'practice', label: 'Thực hành' },
  { value: 'summary', label: 'Tổng kết / Ôn tập' },
  { value: 'discussion', label: 'Thảo luận chuyên đề' },
];

export const VOICE_OPTIONS = [
  {
    id: 'female-young',
    name: 'Nữ - Giọng Bắc (Hà Nội)',
    lang: 'vi-VN',
    gender: 'female',
    region: 'Bắc',
    shortLabel: 'Nữ Bắc',
  },
  {
    id: 'male-inspiring',
    name: 'Nam - Giọng Bắc (Hà Nội)',
    lang: 'vi-VN',
    gender: 'male',
    region: 'Bắc',
    shortLabel: 'Nam Bắc',
  },
  {
    id: 'female-south',
    name: 'Nữ - Giọng Nam (Nam Bộ)',
    lang: 'vi-VN',
    gender: 'female',
    region: 'Nam',
    shortLabel: 'Nữ Nam',
  },
  {
    id: 'male-pro',
    name: 'Nam - Giọng Nam (Nam Bộ)',
    lang: 'vi-VN',
    gender: 'male',
    region: 'Nam',
    shortLabel: 'Nam Nam',
  },
];
