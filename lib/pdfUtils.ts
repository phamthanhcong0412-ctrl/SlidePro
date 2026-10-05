'use client';

/**
 * Trích xuất chính xác 100% văn bản gốc, cấu trúc dòng, số liệu và tạo ảnh chụp từng trang slide PDF
 * để gửi cho Gemini AI phân tích đa phương thức (văn bản + hình ảnh slide).
 */
export async function parsePdfFile(file: File): Promise<{
  title: string;
  totalPages: number;
  slides: Array<{
    pageNumber: number;
    text: string;
    thumbnailUrl: string;
  }>;
}> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Thiết lập worker CDN ổn định cho pdfjs-dist
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    }

    const arrayBuffer = await file.arrayBuffer();

    let pdf: any;
    try {
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0)),
        useSystemFonts: true,
      });
      pdf = await loadingTask.promise;
    } catch (workerErr) {
      console.warn('Retrying PDF load with fallback worker:', workerErr);
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const retryTask = pdfjsLib.getDocument({
        data: new Uint8Array(arrayBuffer.slice(0)),
        useSystemFonts: true,
      });
      pdf = await retryTask.promise;
    }

    const totalPages = pdf.numPages;
    const slides: Array<{
      pageNumber: number;
      text: string;
      thumbnailUrl: string;
    }> = [];

    // Hỗ trợ trích xuất tối đa 50 trang slide
    const maxPages = Math.min(totalPages, 50);

    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Ghép văn bản theo tọa độ Y để giữ nguyên 100% thứ tự dòng, số liệu, công thức và gạch đầu dòng trên slide
      const rawItems = (textContent.items || []) as Array<any>;
      let reconstructedLines: string[] = [];
      let currentLine = '';
      let lastY: number | null = null;

      for (const item of rawItems) {
        if (!('str' in item)) continue;
        const str = String(item.str);
        const y = Array.isArray(item.transform) ? Math.round(item.transform[5]) : null;
        const hasEOL = Boolean(item.hasEOL);

        if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
          if (currentLine.trim()) {
            reconstructedLines.push(currentLine.trim());
          }
          currentLine = str;
        } else {
          if (currentLine && !currentLine.endsWith(' ') && !str.startsWith(' ')) {
            currentLine += ' ' + str;
          } else {
            currentLine += str;
          }
        }

        if (hasEOL) {
          if (currentLine.trim()) {
            reconstructedLines.push(currentLine.trim());
          }
          currentLine = '';
          lastY = null;
        } else {
          lastY = y;
        }
      }

      if (currentLine.trim()) {
        reconstructedLines.push(currentLine.trim());
      }

      const pageText = reconstructedLines
        .map((line) => line.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
        .join('\n');

      // Render trang slide ra ảnh JPEG rõ nét để vừa làm preview vừa gửi cho Gemini Vision đọc chữ/bảng biểu/số liệu
      const viewport = page.getViewport({ scale: 1.15 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      let thumbUrl = '';
      if (context) {
        await page.render({ canvasContext: context, viewport }).promise;
        thumbUrl = canvas.toDataURL('image/jpeg', 0.82);
      }

      slides.push({
        pageNumber: i,
        text: pageText,
        thumbnailUrl: thumbUrl,
      });
    }

    return {
      title: file.name.replace(/\.[^/.]+$/, ''),
      totalPages,
      slides,
    };
  } catch (error) {
    console.error('PDF.js client parsing error:', error);
    throw new Error('Không thể đọc tệp PDF. Vui lòng kiểm tra lại định dạng tệp PDF.');
  }
}
