'use client';

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  FileCheck,
  Sparkles,
  HelpCircle,
  FileSpreadsheet,
  Loader2,
  Cpu,
  GraduationCap,
  Check,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_PROJECTS } from '@/lib/sampleData';
import { LectureProject, Slide, QuizQuestion, KnowledgeUnit } from '@/types/presentation';
import { parsePdfFile } from '@/lib/pdfUtils';

interface Step1UploadProps {
  onFileLoaded: (project: LectureProject) => void;
  onProceed: () => void;
  currentProject: LectureProject | null;
}

export default function Step1Upload({
  onFileLoaded,
  onProceed,
  currentProject,
}: Step1UploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [selectedAudience, setSelectedAudience] = useState<string>(
    currentProject?.audience || 'Sinh viên đại học/cao đẳng'
  );
  const [showHowToConvert, setShowHowToConvert] = useState(false);

  // Processing state when user clicks "Bắt đầu xử lý"
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStage, setProcessStage] = useState('');
  const [processProgress, setProcessProgress] = useState(0);

  const [selectedFileMeta, setSelectedFileMeta] = useState<{
    name: string;
    size: string;
  } | null>(
    currentProject
      ? { name: currentProject.fileName, size: currentProject.fileSize }
      : null
  );

  const handleFileChange = async (file: File) => {
    if (!file) return;
    setIsLoading(true);
    setUploadError(null);

    const mb = file.size / (1024 * 1024);
    const calculatedSize =
      mb >= 0.1
        ? `${mb.toFixed(1)} MB`
        : `${Math.max(10, Math.round(file.size / 1024))} KB`;

    setSelectedFileMeta({
      name: file.name,
      size: calculatedSize,
    });

    try {
      const parsed = await parsePdfFile(file);
      const totalSlidesCount = parsed.slides.length || parsed.totalPages || 1;

      // Tự động nhận diện lĩnh vực dựa trên tên file và nội dung trang đầu
      const lowerInfo = (
        file.name +
        ' ' +
        (parsed.title || '') +
        ' ' +
        (parsed.slides[0]?.text || '')
      ).toLowerCase();
      let detectedField = 'Khoa học & Đào tạo';
      if (
        /html|css|javascript|web|lập trình|code|react|python|cntt|công nghệ|software|ai|machine learning|tin học|dữ liệu/i.test(
          lowerInfo
        )
      ) {
        detectedField = 'Công nghệ thông tin & Khoa học dữ liệu';
      } else if (
        /tim|bệnh|y khoa|sức khoẻ|sức khỏe|dược|y tế|triệu chứng|chẩn đoán|lâm sàng|sinh lý/i.test(
          lowerInfo
        )
      ) {
        detectedField = 'Khoa học sự sống & Sức khoẻ';
      } else if (
        /kinh tế|marketing|quản trị|kinh doanh|tài chính|kế toán|thị trường|doanh nghiệp/i.test(
          lowerInfo
        )
      ) {
        detectedField = 'Kinh tế & Quản trị kinh doanh';
      } else if (/toán|vật lý|hóa học|cơ khí|kỹ thuật|điện/i.test(lowerInfo)) {
        detectedField = 'Khoa học tự nhiên & Kỹ thuật';
      } else if (/tiếng anh|ngôn ngữ|english|kỹ năng/i.test(lowerInfo)) {
        detectedField = 'Ngoại ngữ & Kỹ năng mềm';
      }

      // Khởi tạo dữ liệu nguyên bản 100% từ các trang PDF (status = 'draft' để AI xử lý sâu khi bấm Bắt đầu xử lý)
      const draftSlides: Slide[] = parsed.slides.map((s, idx) => {
        const pageNum = s.pageNumber || idx + 1;
        const lines = s.text
          ? s.text
              .split('\n')
              .map((l) => l.trim())
              .filter(Boolean)
          : [];
        const slideTitle = lines[0] || `Slide số ${pageNum}`;
        const bodyLines = lines.length > 1 ? lines.slice(1) : lines;
        const verbatimSummary =
          lines.join('\n') || `(Trang slide số ${pageNum} - Đang chờ AI đọc nội dung từ hình ảnh slide)`;

        return {
          id: `slide-${pageNum}`,
          pageNumber: pageNum,
          title: slideTitle,
          originalText: s.text || '',
          originalSummary: verbatimSummary,
          points: bodyLines.length > 0 ? bodyLines : [verbatimSummary],
          script: '',
          quizzes: [],
          duration: 45,
          wordCount: 0,
          thumbnailUrl: s.thumbnailUrl,
          rotation: 0,
        };
      });

      const combinedOriginal = draftSlides
        .map((s) => `[Slide số ${s.pageNumber}] ${s.title}\n${s.originalSummary}`)
        .join('\n\n')
        .slice(0, 1500);

      const newProject: LectureProject = {
        id: `proj-${Date.now()}`,
        title: parsed.title || file.name.replace(/\.pdf$/i, ''),
        fileName: file.name,
        fileSize: calculatedSize,
        totalPages: totalSlidesCount,
        field: detectedField,
        audience: selectedAudience,
        overview: `Tài liệu PDF "${file.name}" gồm ${totalSlidesCount} slide gốc. Nhấn "Bắt đầu xử lý" để AI sao chép nghiêm ngặt 100% nội dung gốc, viết Kịch bản giọng đọc và tạo Câu hỏi Quiz ôn tập cho từng slide.`,
        voice: 'Nữ - Giọng Bắc (Hà Nội)',
        voiceSpeed: 1,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0],
        units: [
          {
            id: `unit-${Date.now()}`,
            title: parsed.title || file.name.replace(/\.pdf$/i, ''),
            type: 'theory',
            startSlide: 1,
            endSlide: totalSlidesCount,
            mainContent: combinedOriginal || 'Nội dung gốc trích xuất từ tài liệu PDF.',
            questionCount: totalSlidesCount,
          },
        ],
        slides: draftSlides,
        quizzes: [],
      };

      onFileLoaded(newProject);
    } catch (e: any) {
      console.error(e);
      setUploadError(
        e?.message || 'Không thể đọc tệp PDF này. Vui lòng thử lại với tệp PDF hợp lệ.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: LectureProject) => {
    setUploadError(null);
    setSelectedFileMeta({
      name: sample.fileName,
      size: sample.fileSize,
    });
    const newInstance: LectureProject = {
      ...sample,
      id: `proj-${Date.now()}`,
      audience: selectedAudience,
      createdAt: new Date().toISOString().split('T')[0],
    };
    onFileLoaded(newInstance);
  };

  // Thực thi xử lý AI nghiêm ngặt theo từng slide khi bấm "Bắt đầu xử lý"
  const handleStartProcessing = async () => {
    if (!currentProject || isProcessing) return;

    setIsProcessing(true);
    setProcessProgress(12);
    setProcessStage(
      'Đang kiểm tra dữ liệu gốc & hình ảnh từng trang slide PDF (giữ nguyên 100% số liệu & kiến thức)...'
    );

    try {
      const updatedAudience = selectedAudience || currentProject.audience;
      const totalSlides = currentProject.slides.length;

      // Nếu là file PDF người dùng tải lên (status === 'draft' hoặc chưa có script/quiz chuẩn)
      const needsAiAnalysis =
        currentProject.status === 'draft' ||
        currentProject.slides.some((s) => !s.script || !s.originalSummary);

      if (needsAiAnalysis && totalSlides > 0) {
        // Chia theo lô tối đa 5 slide/lần gọi để đảm bảo AI xử lý chi tiết 100% từng slide, không bao giờ bị cắt cụt
        const BATCH_SIZE = 5;
        const analyzedSlidesMap = new Map<number, Slide>();
        let aiOverview = currentProject.overview;
        let aiUnits: KnowledgeUnit[] = [];

        const totalBatches = Math.ceil(totalSlides / BATCH_SIZE);

        for (let b = 0; b < totalBatches; b++) {
          const startIdx = b * BATCH_SIZE;
          const batchSlides = currentProject.slides.slice(
            startIdx,
            startIdx + BATCH_SIZE
          );
          const firstPage = batchSlides[0]?.pageNumber || startIdx + 1;
          const lastPage =
            batchSlides[batchSlides.length - 1]?.pageNumber ||
            startIdx + batchSlides.length;

          const progressBase = 20 + Math.round((b / totalBatches) * 65);
          setProcessProgress(progressBase);
          setProcessStage(
            `AI đang xử lý nghiêm ngặt [Slide số ${firstPage}] đến [Slide số ${lastPage}] / ${totalSlides}: Sao chép nội dung gốc, viết Kịch bản giọng đọc & tạo Quiz...`
          );

          const res = await fetch('/api/gemini/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: currentProject.title,
              field: currentProject.field,
              audience: updatedAudience,
              slidesInput: batchSlides.map((s) => ({
                pageNumber: s.pageNumber,
                text: s.originalText || s.originalSummary || s.points.join('\n'),
                thumbnailUrl: s.thumbnailUrl,
              })),
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (b === 0 && data.overview) {
              aiOverview = data.overview;
            }
            if (Array.isArray(data.units) && data.units.length > 0) {
              aiUnits.push(
                ...data.units.map((u: any, uIdx: number) => ({
                  id: `unit-${Date.now()}-${b}-${uIdx}`,
                  title: u.title || `Phần ${b + 1}: Slide ${firstPage}–${lastPage}`,
                  type: u.type || 'theory',
                  startSlide: Number(u.startSlide) || firstPage,
                  endSlide: Number(u.endSlide) || lastPage,
                  mainContent: u.mainContent || '',
                  questionCount: Number(u.questionCount) || batchSlides.length,
                }))
              );
            }

            if (Array.isArray(data.slides)) {
              data.slides.forEach((aiSlide: any, idx: number) => {
                const origSlide = batchSlides[idx] || batchSlides.find((bs) => bs.pageNumber === aiSlide.pageNumber);
                if (!origSlide) return;

                const pNum = origSlide.pageNumber;
                const slideQuizzes: QuizQuestion[] = Array.isArray(aiSlide.quizzes)
                  ? aiSlide.quizzes.map((q: any, qIdx: number) => ({
                      id: q.id || `q-s${pNum}-${qIdx + 1}-${Date.now()}`,
                      slideNumber: pNum,
                      question: q.question,
                      options: Array.isArray(q.options) ? q.options : [],
                      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
                      explanation: q.explanation || '',
                    }))
                  : [];

                analyzedSlidesMap.set(pNum, {
                  ...origSlide,
                  title: aiSlide.title || origSlide.title,
                  originalSummary:
                    aiSlide.originalSummary || origSlide.originalSummary,
                  points:
                    Array.isArray(aiSlide.points) && aiSlide.points.length > 0
                      ? aiSlide.points
                      : origSlide.points,
                  script: aiSlide.script || origSlide.script,
                  quizzes: slideQuizzes,
                  duration: aiSlide.duration || 55,
                  wordCount: aiSlide.wordCount || 130,
                });
              });
            }
          }
        }

        const finalSlides: Slide[] = currentProject.slides.map(
          (s) => analyzedSlidesMap.get(s.pageNumber) || s
        );

        const allFinalQuizzes: QuizQuestion[] = finalSlides.flatMap(
          (s) => s.quizzes || []
        );

        const finalUnits: KnowledgeUnit[] =
          aiUnits.length > 0
            ? [
                {
                  id: `unit-main-${Date.now()}`,
                  title: currentProject.title,
                  type: 'theory',
                  startSlide: 1,
                  endSlide: finalSlides.length,
                  mainContent: finalSlides
                    .map(
                      (s) =>
                        `[Slide số ${s.pageNumber}] ${s.title}\n${s.originalSummary}`
                    )
                    .join('\n\n')
                    .slice(0, 2000),
                  questionCount: allFinalQuizzes.length,
                },
              ]
            : currentProject.units.map((u) => ({
                ...u,
                questionCount: allFinalQuizzes.length,
              }));

        const analyzedProject: LectureProject = {
          ...currentProject,
          audience: updatedAudience,
          overview: aiOverview,
          units: finalUnits,
          slides: finalSlides,
          quizzes: allFinalQuizzes,
          status: 'analyzed',
        };

        setProcessProgress(100);
        setProcessStage(
          'Hoàn tất xử lý AI nghiêm ngặt cho toàn bộ slide! Đang chuyển sang màn hình Duyệt dàn ý...'
        );
        onFileLoaded(analyzedProject);
      } else {
        // Dự án mẫu hoặc đã phân tích
        onFileLoaded({ ...currentProject, audience: updatedAudience });
        setProcessProgress(100);
        setProcessStage('Đã tải dữ liệu bài giảng chuẩn! Đang chuyển sang màn hình tiếp theo...');
      }

      setTimeout(() => {
        setIsProcessing(false);
        onProceed();
      }, 450);
    } catch (err) {
      console.error('Error processing PDF with AI:', err);
      setIsProcessing(false);
      onProceed();
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-6 max-w-5xl mx-auto w-full relative">
      {/* Top Title Section */}
      <div className="text-center pt-4 sm:pt-6 pb-4 sm:pb-5 space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Tải lên bài giảng PDF & Chuyển đổi AI Nghiêm ngặt
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-2xl mx-auto px-2">
          Sao chép và giữ nguyên chính xác 100% nội dung, kiến thức, số liệu gốc trên từng trang PDF; tự động biên soạn{' '}
          <strong className="text-cyan-600 dark:text-cyan-400">Kịch bản giọng đọc (Voiceover Script)</strong> và{' '}
          <strong className="text-amber-600 dark:text-amber-400">Câu hỏi Quiz ôn tập</strong> theo từng slide.
        </p>
      </div>

      {/* Main Drag & Drop Card */}
      <div className="max-w-2xl mx-auto w-full space-y-4 sm:space-y-5">
        {/* Strict Processing Rules Notice Card */}
        <div className="bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/70 rounded-2xl p-3.5 sm:p-4 text-xs space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>CAM KẾT XỬ LÝ AI TUYỆT ĐỐI NGHIÊM NGẶT THEO TỪNG SLIDE:</span>
          </div>
          <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-6 list-disc text-[11.5px] leading-relaxed">
            <li>
              <strong>Giữ nguyên 100% tài liệu gốc:</strong> Không tự ý thay đổi, bịa đặt hoặc sửa đổi nội dung, kiến thức, số liệu có sẵn trong file PDF.
            </li>
            <li>
              <strong>Kịch bản giọng đọc (Voiceover Script):</strong> Viết lời giảng chi tiết, tự nhiên, truyền cảm bám sát 100% nội dung từng trang slide gốc.
            </li>
            <li>
              <strong>Câu hỏi Quiz ôn tập:</strong> Tạo câu hỏi trắc nghiệm kèm đáp án và giải thích ngắn gọn dựa hoàn toàn trên kiến thức có trong slide đó.
            </li>
          </ul>
        </div>

        {uploadError && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 rounded-xl p-3 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{uploadError}</span>
          </div>
        )}

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 relative overflow-hidden active:scale-[0.99] ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10 scale-[1.01]'
              : selectedFileMeta
              ? 'border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 dark:border-slate-700/80 bg-white dark:bg-[#101729]/70 hover:border-cyan-500 hover:bg-slate-50 dark:hover:border-slate-500 dark:hover:bg-[#121b30] shadow-sm'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) =>
              e.target.files?.[0] && handleFileChange(e.target.files[0])
            }
            accept=".pdf"
            className="hidden"
          />

          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-600/90 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 mb-3 sm:mb-4">
            {isLoading ? (
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : selectedFileMeta ? (
              <FileCheck className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-200" />
            ) : (
              <UploadCloud className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            )}
          </div>

          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-1 px-2 break-all line-clamp-2">
            {selectedFileMeta
              ? selectedFileMeta.name
              : 'Kéo và thả file PDF vào đây'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 sm:mb-4">
            {selectedFileMeta
              ? `Kích thước: ${selectedFileMeta.size} • ${currentProject?.slides.length || 0} trang slide đã trích xuất nguyên bản`
              : 'hoặc'}
          </p>

          <button
            type="button"
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/20 transition-colors"
          >
            {selectedFileMeta ? 'Chọn file PDF khác' : 'Chọn file từ thiết bị'}
          </button>

          {/* Info line */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5 sm:mt-6 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            <span>Định dạng PDF</span>
            <span>·</span>
            <span>Tối đa 100 MB</span>
            <span>·</span>
            <span>1 slide = 1 trang gốc (Giữ nguyên 100% nội dung & số liệu)</span>
          </div>
        </div>

        {/* Grade / Audience Selector Card */}
        <div className="bg-white dark:bg-[#0d1527] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 flex items-center justify-center">
                <GraduationCap className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Chọn cấp học để AI điều chỉnh cách xưng hô trong Kịch bản giọng đọc:
              </span>
            </div>
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
              Đang chọn:{' '}
              <strong className="text-slate-900 dark:text-white">
                {selectedAudience.split('(')[0].trim()}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
            {[
              {
                label: 'Học sinh Tiểu học (Lớp 1 - 5)',
                short: 'Tiểu học',
                age: 'Lớp 1 - 5',
                desc: 'Ấm áp, gần gũi, giữ nguyên kiến thức gốc',
                badgeBg:
                  'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/40',
              },
              {
                label: 'Học sinh THCS (Lớp 6 - 9)',
                short: 'THCS',
                age: 'Lớp 6 - 9',
                desc: 'Mạch lạc, rõ ràng, giữ nguyên kiến thức gốc',
                badgeBg:
                  'from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/40',
              },
              {
                label: 'Học sinh THPT (Lớp 10 - 12)',
                short: 'THPT',
                age: 'Lớp 10 - 12',
                desc: 'Chuẩn mực, logic, bám sát 100% slide gốc',
                badgeBg:
                  'from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/40',
              },
              {
                label: 'Sinh viên đại học/cao đẳng',
                short: 'Đại học / CĐ',
                age: '18+ tuổi',
                desc: 'Học thuật, chuyên sâu, chuẩn xác 100%',
                badgeBg:
                  'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/40',
              },
              {
                label: 'Chuyên viên / Người đi làm',
                short: 'Người đi làm',
                age: 'Doanh nghiệp',
                desc: 'Chuyên nghiệp, súc tích, đúng số liệu gốc',
                badgeBg:
                  'from-rose-500/20 to-pink-500/20 text-rose-300 border-rose-500/40',
              },
              {
                label: 'Đại chúng (Mọi lứa tuổi)',
                short: 'Mọi lứa tuổi',
                age: 'Phổ thông',
                desc: 'Tự nhiên, truyền cảm, trung thực với gốc',
                badgeBg:
                  'from-slate-500/20 to-zinc-500/20 text-slate-300 border-slate-500/40',
              },
            ].map((item) => {
              const isSelected = selectedAudience === item.label;
              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setSelectedAudience(item.label);
                    if (currentProject) {
                      onFileLoaded({ ...currentProject, audience: item.label });
                    }
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between min-h-[64px] ${
                    isSelected
                      ? `bg-gradient-to-r ${item.badgeBg} ring-2 ring-cyan-400 shadow-sm shadow-cyan-500/20 scale-[1.01]`
                      : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-xs font-bold ${
                          isSelected
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.short}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        ({item.age})
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-cyan-400 stroke-[3]" />
                    )}
                  </div>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {item.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Samples */}
        <div className="bg-white dark:bg-[#0f172a]/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Hoặc thử nhanh với bài giảng mẫu đã chuẩn hóa:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => handleSelectSample(SAMPLE_PROJECTS[0])}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 text-left transition-colors group min-h-[48px] shadow-2xs"
            >
              <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-300 truncate">
                  {SAMPLE_PROJECTS[0].title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {SAMPLE_PROJECTS[0].totalPages} slide · Y khoa & Sức khoẻ
                </div>
              </div>
            </button>

            <button
              onClick={() => handleSelectSample(SAMPLE_PROJECTS[1])}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 text-left transition-colors group min-h-[48px] shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-300 truncate">
                  {SAMPLE_PROJECTS[1].title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {SAMPLE_PROJECTS[1].totalPages} slide · Công nghệ & AI
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Expandable Accordion Help */}
        <div className="border border-slate-200 dark:border-slate-800/80 rounded-xl overflow-hidden bg-white dark:bg-[#101729]/50 shadow-2xs">
          <button
            onClick={() => setShowHowToConvert(!showHowToConvert)}
            className="w-full px-3.5 sm:px-4 py-3 min-h-[44px] flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 text-left pr-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="line-clamp-2">
                Cách chuyển PowerPoint, Google Slides, Keynote sang PDF
              </span>
            </div>
            {showHowToConvert ? (
              <ChevronUp className="w-4 h-4 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 shrink-0" />
            )}
          </button>

          {showHowToConvert && (
            <div className="px-3.5 sm:px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 space-y-2 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-[#0d1322] leading-relaxed">
              <p>
                <strong>• Microsoft PowerPoint:</strong> Vào menu{' '}
                <em>File &gt; Export (hoặc Save As) &gt; Chọn định dạng PDF (*.pdf)</em>.
              </p>
              <p>
                <strong>• Google Slides:</strong> Chọn{' '}
                <em>Tệp &gt; Tải xuống &gt; Tài liệu PDF (.pdf)</em>.
              </p>
              <p>
                <strong>• Apple Keynote:</strong> Chọn{' '}
                <em>File &gt; Export To &gt; PDF...</em>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
          {selectedFileMeta ? (
            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 truncate">
              <FileCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">
                Đã chọn: {selectedFileMeta.name} ({selectedFileMeta.size} ·{' '}
                {currentProject?.slides.length || 0} slide)
              </span>
            </span>
          ) : (
            'Chọn một file PDF để bắt đầu xử lý.'
          )}
        </div>

        <button
          onClick={handleStartProcessing}
          disabled={!currentProject || isLoading || isProcessing}
          className={`min-h-[44px] px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            currentProject && !isLoading && !isProcessing
              ? 'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-500/25 cursor-pointer hover:scale-[1.02]'
              : 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-800'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-cyan-300" />
              <span>AI đang xử lý từng slide...</span>
            </>
          ) : (
            <>
              <span>Bắt đầu xử lý AI theo từng Slide</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Processing Overlay Modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-cyan-500/30 rounded-2xl shadow-2xl p-6 text-center space-y-5 text-slate-900 dark:text-white">
            <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
              <Cpu className="w-8 h-8 animate-pulse text-cyan-400" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">
                Trợ lý AI đang xử lý nghiêm ngặt file PDF Slide
              </h3>
              <p className="text-xs text-cyan-600 dark:text-cyan-300 font-medium min-h-[36px] flex items-center justify-center leading-relaxed px-2">
                {processStage}
              </p>
            </div>

            {/* Animated Progress Bar */}
            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-slate-700">
                <div
                  style={{ width: `${processProgress}%` }}
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-full transition-all duration-300 ease-out"
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                <span>Sao chép nguyên bản 100% · Kịch bản giọng đọc · Câu hỏi Quiz</span>
                <span className="font-semibold text-cyan-500 dark:text-cyan-400">
                  {processProgress}%
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Không tự ý thay đổi, bịa đặt hay thêm bớt kiến thức ngoài slide gốc</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
