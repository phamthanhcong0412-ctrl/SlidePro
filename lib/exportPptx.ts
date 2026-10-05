import pptxgen from 'pptxgenjs';
import { LectureProject } from '@/types/presentation';

export async function exportProjectToPptx(project: LectureProject): Promise<void> {
  const pptx = new pptxgen();

  // Widescreen 16:9 Standard Presentation Layout
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'SlidePro Studio (@phamthanhcong0412-ctrl)';
  pptx.title = project.title || 'SlidePro Presentation';
  pptx.subject = project.field || 'Giao An Dien Tu';
  pptx.company = 'SlidePro Enterprise';

  // Define Theme Colors (High contrast, WCAG compliant)
  const COLOR_BG_DARK = '0F172A'; // Slate 900
  const COLOR_PRIMARY = '0284C7'; // Sky 600
  const COLOR_ACCENT = '38BDF8'; // Sky 400
  const COLOR_TEXT_LIGHT = 'F8FAFC'; // Slate 50
  const COLOR_TEXT_MUTED = '94A3B8'; // Slate 400
  const COLOR_CARD_BG = '1E293B'; // Slate 800
  const COLOR_ACCENT_ORANGE = 'F97316'; // Orange 500

  // Standard safe fonts
  const FONT_TITLE = 'Arial';
  const FONT_BODY = 'Calibri';

  // ================= 1. COVER SLIDE =================
  const coverSlide = pptx.addSlide();
  coverSlide.background = { color: COLOR_BG_DARK };

  // Decorative top accent band
  coverSlide.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: '100%',
    h: 0.15,
    fill: { color: COLOR_PRIMARY },
    line: { type: 'none' },
  });

  // Category / Field Tag
  if (project.field) {
    coverSlide.addText(project.field.toUpperCase(), {
      x: 1.0,
      y: 1.2,
      w: 9.5,
      h: 0.4,
      fontSize: 12,
      fontFace: FONT_TITLE,
      color: COLOR_ACCENT,
      bold: true,
      charSpacing: 2,
    });
  }

  // Main Title (Dynamic size to avoid overlapping)
  const titleLength = (project.title || '').length;
  const titleFontSize = titleLength > 60 ? 26 : titleLength > 35 ? 30 : 34;

  coverSlide.addText(project.title || 'Bài giảng Điện tử', {
    x: 1.0,
    y: 1.7,
    w: 11.3,
    h: 1.8,
    fontSize: titleFontSize,
    fontFace: FONT_TITLE,
    color: COLOR_TEXT_LIGHT,
    bold: true,
    valign: 'top',
    wrap: true,
  });

  // Overview / Subtitle
  if (project.overview) {
    coverSlide.addText(project.overview, {
      x: 1.0,
      y: 3.7,
      w: 11.0,
      h: 1.3,
      fontSize: 14,
      fontFace: FONT_BODY,
      color: COLOR_TEXT_MUTED,
      italic: true,
      wrap: true,
      lineSpacing: 20,
    });
  }

  // Target audience badge & Metadata box
  coverSlide.addShape(pptx.ShapeType.roundRect, {
    x: 1.0,
    y: 5.3,
    w: 5.8,
    h: 1.1,
    rectRadius: 0.1,
    fill: { color: COLOR_CARD_BG },
    line: { color: '334155', width: 1 },
  });

  coverSlide.addText(
    [
      { text: 'Đối tượng: ', options: { bold: true, color: COLOR_ACCENT, fontSize: 12 } },
      { text: `${project.audience || 'Học viên'}\n`, options: { color: COLOR_TEXT_LIGHT, fontSize: 12 } },
      { text: 'Quy mô: ', options: { bold: true, color: COLOR_TEXT_MUTED, fontSize: 11 } },
      {
        text: `${project.slides?.length || 0} slide bài giảng • ${project.quizzes?.length || 0} câu hỏi củng cố`,
        options: { color: COLOR_TEXT_MUTED, fontSize: 11 },
      },
    ],
    {
      x: 1.2,
      y: 5.4,
      w: 5.4,
      h: 0.9,
      fontFace: FONT_BODY,
      valign: 'middle',
      wrap: true,
    }
  );

  coverSlide.addNotes(
    `Slide mở đầu bài giảng: "${project.title}".\nLĩnh vực: ${project.field || 'Chung'}.\nĐối tượng: ${project.audience || 'Tất cả'}.\n\nLời mở đầu gợi ý: "Xin nhiệt liệt chào mừng các bạn đến với buổi học hôm nay. Chúng ta sẽ cùng nghiên cứu nội dung chuyên sâu về ${project.title}."`
  );

  // ================= 2. CONTENT SLIDES =================
  (project.slides || []).forEach((slideData, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: 'F8FAFC' }; // High-contrast clean light background

    // Top primary bar
    slide.addShape(pptx.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.1,
      fill: { color: COLOR_PRIMARY },
      line: { type: 'none' },
    });

    // Slide Header: Index and Title
    slide.addText(`PHẦN ${idx + 1} / ${project.slides.length}`, {
      x: 0.8,
      y: 0.45,
      w: 4.0,
      h: 0.3,
      fontSize: 11,
      fontFace: FONT_TITLE,
      color: COLOR_PRIMARY,
      bold: true,
    });

    const slideTitleLen = (slideData.title || '').length;
    const sTitleSize = slideTitleLen > 50 ? 20 : 23;

    slide.addText(slideData.title || `Nội dung phần ${idx + 1}`, {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.8,
      fontSize: sTitleSize,
      fontFace: FONT_TITLE,
      color: '0F172A',
      bold: true,
      valign: 'middle',
      wrap: true,
    });

    // Content Box Left: Bullet Points (Using native bullet: true to avoid glyph corruption)
    const points = slideData.points || [];
    const ptCount = points.length;
    const ptFontSize = ptCount > 4 ? 13 : 15;
    const ptSpacing = ptCount > 4 ? 8 : 12;

    const bulletItems = points.map((pt) => ({
      text: pt,
      options: {
        fontSize: ptFontSize,
        color: '334155',
        bullet: true,
        spaceAfter: ptSpacing,
      },
    }));

    slide.addText(bulletItems as any, {
      x: 0.8,
      y: 1.75,
      w: 7.6,
      h: 4.8,
      fontFace: FONT_BODY,
      valign: 'top',
      wrap: true,
      lineSpacing: ptFontSize + 8,
    });

    // Content Box Right: Key Highlights / Script Spotlight
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 8.8,
      y: 1.75,
      w: 3.7,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: 'EFF6FF' },
      line: { color: 'BAE6FD', width: 1.5 },
    });

    slide.addText('GHI CHÚ TRỌNG TÂM', {
      x: 9.1,
      y: 2.0,
      w: 3.1,
      h: 0.35,
      fontSize: 11,
      fontFace: FONT_TITLE,
      color: COLOR_PRIMARY,
      bold: true,
    });

    const scriptText = slideData.script || '';
    const trimmedScript =
      scriptText.length > 280 ? scriptText.substring(0, 277) + '...' : scriptText;

    slide.addText(trimmedScript, {
      x: 9.1,
      y: 2.45,
      w: 3.1,
      h: 3.8,
      fontSize: 12,
      fontFace: FONT_BODY,
      color: '1E3A8A',
      italic: true,
      wrap: true,
      lineSpacing: 18,
      valign: 'top',
    });

    // Slide Footer
    slide.addText(`${project.title || 'SlidePro'} • SlidePro Enterprise`, {
      x: 0.8,
      y: 6.85,
      w: 8.0,
      h: 0.3,
      fontSize: 9,
      fontFace: FONT_BODY,
      color: '94A3B8',
    });

    slide.addText(`Trang ${idx + 1}`, {
      x: 11.3,
      y: 6.85,
      w: 1.2,
      h: 0.3,
      fontSize: 9,
      fontFace: FONT_BODY,
      color: '94A3B8',
      align: 'right',
    });

    // Embed Speaker Notes directly into PowerPoint
    slide.addNotes(
      `[SLIDE SỐ ${slideData.pageNumber || idx + 1}]\n\n- Nội dung tóm tắt gốc (giữ nguyên):\n${slideData.originalSummary || (slideData.points || []).join('\n')}\n\n- Kịch bản giọng đọc (~${slideData.duration || 60} giây / ${slideData.wordCount || 100} từ):\n${slideData.script || ''}`
    );
  });

  // ================= 3. QUIZ SLIDES =================
  if (project.quizzes && project.quizzes.length > 0) {
    project.quizzes.forEach((q, qIdx) => {
      const qSlide = pptx.addSlide();
      qSlide.background = { color: COLOR_BG_DARK };

      qSlide.addText(
        `CÂU HỎI QUIZ ÔN TẬP #${qIdx + 1}${q.slideNumber ? ` • [SLIDE SỐ ${q.slideNumber}]` : ''}`,
        {
          x: 1.0,
          y: 0.55,
          w: 10.0,
          h: 0.4,
          fontSize: 12,
          fontFace: FONT_TITLE,
          color: COLOR_ACCENT_ORANGE,
          bold: true,
        }
      );

      const qLen = (q.question || '').length;
      const qSize = qLen > 80 ? 18 : 21;

      qSlide.addText(q.question || `Câu hỏi ôn tập ${qIdx + 1}`, {
        x: 1.0,
        y: 1.05,
        w: 11.3,
        h: 1.4,
        fontSize: qSize,
        fontFace: FONT_TITLE,
        color: COLOR_TEXT_LIGHT,
        bold: true,
        valign: 'middle',
        wrap: true,
      });

      // Render 4 answer choices in a 2x2 grid
      (q.options || []).forEach((opt, optIdx) => {
        const row = Math.floor(optIdx / 2);
        const col = optIdx % 2;
        const posX = 1.0 + col * 5.8;
        const posY = 2.65 + row * 1.85;
        const letter = String.fromCharCode(65 + optIdx);

        qSlide.addShape(pptx.ShapeType.roundRect, {
          x: posX,
          y: posY,
          w: 5.5,
          h: 1.65,
          rectRadius: 0.12,
          fill: { color: COLOR_CARD_BG },
          line: { color: '334155', width: 1 },
        });

        qSlide.addText(
          [
            { text: `${letter}. `, options: { bold: true, color: COLOR_ACCENT, fontSize: 15 } },
            { text: opt, options: { color: COLOR_TEXT_LIGHT, fontSize: 13 } },
          ],
          {
            x: posX + 0.25,
            y: posY + 0.15,
            w: 5.0,
            h: 1.35,
            fontFace: FONT_BODY,
            valign: 'middle',
            wrap: true,
            lineSpacing: 18,
          }
        );
      });

      // Quiz Speaker Notes with Answer Key & Explanation
      qSlide.addNotes(
        `[ĐÁP ÁN VÀ HƯỚNG DẪN GIẢI THÍCH]\n\nĐáp án đúng: ${String.fromCharCode(65 + q.correctIndex)}. ${q.options[q.correctIndex] || ''}\n\nGiải thích chi tiết:\n${q.explanation || ''}`
      );
    });
  }

  // ================= 4. SUMMARY / END SLIDE =================
  const endSlide = pptx.addSlide();
  endSlide.background = { color: COLOR_BG_DARK };

  endSlide.addText('TỔNG KẾT BÀI HỌC', {
    x: 1.0,
    y: 2.2,
    w: 11.3,
    h: 0.4,
    fontSize: 14,
    fontFace: FONT_TITLE,
    color: COLOR_ACCENT,
    bold: true,
    align: 'center',
  });

  endSlide.addText('Chúc các bạn học tập tốt và đạt kết quả cao!', {
    x: 1.0,
    y: 2.8,
    w: 11.3,
    h: 1.2,
    fontSize: 30,
    fontFace: FONT_TITLE,
    color: COLOR_TEXT_LIGHT,
    bold: true,
    align: 'center',
    wrap: true,
  });

  endSlide.addText('Bài giảng được tối ưu và xuất tự động bởi SlidePro Studio', {
    x: 1.0,
    y: 4.3,
    w: 11.3,
    h: 0.5,
    fontSize: 13,
    fontFace: FONT_BODY,
    color: COLOR_TEXT_MUTED,
    italic: true,
    align: 'center',
  });

  // Write file out
  const sanitizedName = (project.title || 'SlidePro_Presentation')
    .replace(/[^\w\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '_');

  await pptx.writeFile({ fileName: `${sanitizedName}.pptx` });
}

// Backwards-compatible aliases for all modal & step components
export const exportToPowerPoint = exportProjectToPptx;
export default exportProjectToPptx;
