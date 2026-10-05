'use client';

import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Play,
  Pause,
  Edit3,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  Eye,
  Download,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Wand2,
  GraduationCap,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import { LectureProject, Slide, QuizQuestion } from '@/types/presentation';
import { LEARNER_AUDIENCES } from '@/lib/sampleData';
import {
  playLectureAudio,
  stopAnyPlayingAudio,
  getVoiceProfile,
  VOICE_PROFILES,
} from '@/lib/ttsService';
import { exportToPowerPoint } from '@/lib/exportPptx';

interface Step3ScriptQuizProps {
  project: LectureProject;
  onUpdateProject: (updated: LectureProject) => void;
  onContinue: () => void;
  onBack: () => void;
  onOpenPreview: () => void;
}

export default function Step3ScriptQuiz({
  project,
  onUpdateProject,
  onContinue,
  onBack,
  onOpenPreview,
}: Step3ScriptQuizProps) {
  const [activeTab, setActiveTab] = useState<
    'per_slide' | 'script' | 'quiz' | 'formatted'
  >('per_slide');
  const [selectedVoice, setSelectedVoice] = useState(
    project.voice || 'Nữ - Giọng Bắc (Hà Nội)'
  );
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [editedScriptText, setEditedScriptText] = useState('');
  const [editedOriginalSummary, setEditedOriginalSummary] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isGeneratingAiQuiz, setIsGeneratingAiQuiz] = useState(false);
  const [generatingQuizSlideNum, setGeneratingQuizSlideNum] = useState<
    number | null
  >(null);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);

  // Real Google AI Rewrite States
  const [rewritingSlideId, setRewritingSlideId] = useState<string | null>(null);
  const [isRewritingAll, setIsRewritingAll] = useState(false);
  const [isModalRewriting, setIsModalRewriting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      stopAnyPlayingAudio();
    };
  }, []);

  // Helper to get quizzes belonging to a specific slide pageNumber
  const getQuizzesForSlide = (slide: Slide, slideIndex: number): QuizQuestion[] => {
    const pageNum = slide.pageNumber || slideIndex + 1;
    const matched = project.quizzes.filter((q) => q.slideNumber === pageNum);
    if (matched.length > 0) return matched;
    if (Array.isArray(slide.quizzes) && slide.quizzes.length > 0) {
      return slide.quizzes;
    }
    // If legacy quizzes have no slideNumber, map by index
    const legacyWithoutSlideNum = project.quizzes.filter(
      (q) => typeof q.slideNumber !== 'number'
    );
    if (legacyWithoutSlideNum[slideIndex]) {
      return [
        {
          ...legacyWithoutSlideNum[slideIndex],
          slideNumber: pageNum,
        },
      ];
    }
    return [];
  };

  // Build formatted standard output string matching user's exact specification
  const buildStandardFormattedText = (): string => {
    return project.slides
      .map((slide, idx) => {
        const pageNum = slide.pageNumber || idx + 1;
        const originalContent =
          slide.originalSummary ||
          (Array.isArray(slide.points) && slide.points.length > 0
            ? slide.points.map((p) => `  • ${p}`).join('\n')
            : slide.title);
        const slideQuizzes = getQuizzesForSlide(slide, idx);

        const quizBlock =
          slideQuizzes.length > 0
            ? slideQuizzes
                .map((q, qIdx) => {
                  const opts = (q.options || [])
                    .map(
                      (opt, oIdx) =>
                        `    ${String.fromCharCode(65 + oIdx)}. ${opt}`
                    )
                    .join('\n');
                  const correctLetter = String.fromCharCode(
                    65 + (q.correctIndex || 0)
                  );
                  const correctText = q.options?.[q.correctIndex || 0] || '';
                  return `  Câu ${qIdx + 1}: ${q.question}\n${opts}\n    -> Đáp án đúng: ${correctLetter} (${correctText})\n    -> Giải thích: ${q.explanation}`;
                })
                .join('\n\n')
            : '  (Chưa có câu hỏi cho slide này)';

        return `[Slide số ${pageNum}] - ${slide.title}
- Nội dung tóm tắt gốc (giữ nguyên):
${originalContent}

- Kịch bản giọng đọc:
${slide.script}

- Câu hỏi Quiz ôn tập:
${quizBlock}`;
      })
      .join('\n\n--------------------------------------------------\n\n');
  };

  const handleCopyStandardOutput = async () => {
    try {
      await navigator.clipboard.writeText(buildStandardFormattedText());
      setCopiedFormatted(true);
      showNotification('Đã sao chép toàn bộ nội dung chuẩn theo từng Slide!');
      setTimeout(() => setCopiedFormatted(false), 3000);
    } catch {
      showNotification('Không thể sao chép tự động, vui lòng bôi đen văn bản.');
    }
  };

  const handleSpeech = (text: string, slideId: string) => {
    if (isPlayingAudio === slideId) {
      stopAnyPlayingAudio();
      setIsPlayingAudio(null);
      return;
    }

    setIsPlayingAudio(slideId);
    playLectureAudio({
      text,
      voiceNameOrId: selectedVoice,
      playbackId: slideId,
      onStart: () => setIsPlayingAudio(slideId),
      onEnd: () => setIsPlayingAudio(null),
      onError: () => setIsPlayingAudio(null),
    });
  };

  const handleOpenEditModal = (slide: Slide) => {
    setEditingSlideId(slide.id);
    setEditedScriptText(slide.script);
    setEditedOriginalSummary(
      slide.originalSummary || slide.points.join('\n') || ''
    );
  };

  const handleSaveScript = (slideId: string) => {
    const wordCount = editedScriptText
      .trim()
      .split(/\s+/)
      .filter(Boolean).length;
    const duration = Math.max(20, Math.round((wordCount / 140) * 60));
    const updatedPoints = editedOriginalSummary
      .split('\n')
      .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
      .filter(Boolean);

    const updatedSlides = project.slides.map((s) =>
      s.id === slideId
        ? {
            ...s,
            originalSummary: editedOriginalSummary,
            points: updatedPoints.length > 0 ? updatedPoints : s.points,
            script: editedScriptText,
            wordCount,
            duration,
          }
        : s
    );

    onUpdateProject({
      ...project,
      slides: updatedSlides,
    });
    setEditingSlideId(null);
    showNotification('Đã lưu cập nhật cho slide!');
  };

  // Real Google Gemini AI Rewrite for a single slide (strictly preserving original content)
  const handleAiPolishScript = async (
    slideId: string,
    style: string = 'pedagogical'
  ) => {
    const slide = project.slides.find((s) => s.id === slideId);
    if (!slide || rewritingSlideId) return;

    setRewritingSlideId(slideId);
    try {
      const res = await fetch('/api/gemini/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideNumber: slide.pageNumber,
          slideTitle: slide.title,
          originalSummary: slide.originalSummary,
          originalText: slide.originalText,
          bulletPoints: slide.points,
          currentScript: slide.script,
          style,
          audience: project.audience,
          field: project.field,
        }),
      });

      const data = await res.json();
      if (data.script) {
        const updatedSlides = project.slides.map((s) =>
          s.id === slideId
            ? {
                ...s,
                script: data.script,
                wordCount:
                  data.wordCount ||
                  data.script.trim().split(/\s+/).filter(Boolean).length,
                duration:
                  data.duration || Math.round((data.wordCount / 140) * 60),
              }
            : s
        );

        onUpdateProject({
          ...project,
          slides: updatedSlides,
        });
        showNotification(
          `✨ Đã viết lại Kịch bản giọng đọc cho [Slide số ${slide.pageNumber}] (Giữ nguyên 100% ý gốc)!`
        );
      }
    } catch (err) {
      console.error('Gemini rewrite error:', err);
      showNotification('Không thể kết nối đến AI, vui lòng thử lại.');
    } finally {
      setRewritingSlideId(null);
    }
  };

  // Re-analyze all slides strictly (originalSummary + script + per-slide quiz)
  const handleRewriteAllWithAi = async () => {
    if (isRewritingAll || project.slides.length === 0) return;
    setIsRewritingAll(true);
    showNotification(
      '✨ AI đang xử lý lại toàn bộ Slide theo quy tắc sao chép nghiêm ngặt 100%...'
    );

    try {
      const BATCH_SIZE = 5;
      const totalSlides = project.slides.length;
      const totalBatches = Math.ceil(totalSlides / BATCH_SIZE);
      const updatedSlidesMap = new Map<number, Slide>();

      for (let b = 0; b < totalBatches; b++) {
        const startIdx = b * BATCH_SIZE;
        const batchSlides = project.slides.slice(
          startIdx,
          startIdx + BATCH_SIZE
        );

        const res = await fetch('/api/gemini/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: project.title,
            field: project.field,
            audience: project.audience,
            slidesInput: batchSlides.map((s) => ({
              pageNumber: s.pageNumber,
              text: s.originalText || s.originalSummary || s.points.join('\n'),
              thumbnailUrl: s.thumbnailUrl,
            })),
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.slides)) {
            data.slides.forEach((aiSlide: any, idx: number) => {
              const origSlide =
                batchSlides[idx] ||
                batchSlides.find((bs) => bs.pageNumber === aiSlide.pageNumber);
              if (!origSlide) return;

              const pNum = origSlide.pageNumber;
              const slideQuizzes: QuizQuestion[] = Array.isArray(
                aiSlide.quizzes
              )
                ? aiSlide.quizzes.map((q: any, qIdx: number) => ({
                    id: q.id || `q-s${pNum}-${qIdx + 1}-${Date.now()}`,
                    slideNumber: pNum,
                    question: q.question,
                    options: Array.isArray(q.options) ? q.options : [],
                    correctIndex:
                      typeof q.correctIndex === 'number' ? q.correctIndex : 0,
                    explanation: q.explanation || '',
                  }))
                : origSlide.quizzes || [];

              updatedSlidesMap.set(pNum, {
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
                duration: aiSlide.duration || origSlide.duration,
                wordCount: aiSlide.wordCount || origSlide.wordCount,
              });
            });
          }
        }
      }

      const finalSlides = project.slides.map(
        (s) => updatedSlidesMap.get(s.pageNumber) || s
      );
      const allQuizzes = finalSlides.flatMap((s) => s.quizzes || []);

      onUpdateProject({
        ...project,
        slides: finalSlides,
        quizzes: allQuizzes.length > 0 ? allQuizzes : project.quizzes,
      });
      showNotification(
        '🎉 Đã hoàn tất chuẩn hóa Nội dung gốc, Kịch bản giọng đọc và Quiz cho toàn bộ Slide!'
      );
    } catch (err) {
      console.error('Batch rewrite error:', err);
    } finally {
      setIsRewritingAll(false);
    }
  };

  // Google AI rewrite inside the edit modal
  const handleModalAiRewrite = async (style: string = 'pedagogical') => {
    if (!editingSlideId || isModalRewriting) return;
    const slide = project.slides.find((s) => s.id === editingSlideId);
    if (!slide) return;

    setIsModalRewriting(true);
    try {
      const res = await fetch('/api/gemini/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideNumber: slide.pageNumber,
          slideTitle: slide.title,
          originalSummary: editedOriginalSummary || slide.originalSummary,
          originalText: slide.originalText,
          bulletPoints: slide.points,
          currentScript: editedScriptText || slide.script,
          style,
          audience: project.audience,
          field: project.field,
        }),
      });

      const data = await res.json();
      if (data.script) {
        setEditedScriptText(data.script);
        showNotification(
          '✨ AI đã viết lại Kịch bản giọng đọc bám sát 100% nội dung gốc!'
        );
      }
    } catch (err) {
      console.error('Modal AI rewrite error:', err);
    } finally {
      setIsModalRewriting(false);
    }
  };

  // Generate AI Quiz strictly for a specific slide [Slide số X]
  const handleGenerateSlideAiQuiz = async (slide: Slide) => {
    if (generatingQuizSlideNum !== null) return;
    const pageNum = slide.pageNumber;
    setGeneratingQuizSlideNum(pageNum);

    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          slideNumber: pageNum,
          slides: [
            {
              pageNumber: pageNum,
              title: slide.title,
              originalSummary: slide.originalSummary,
              points: slide.points,
            },
          ],
          count: 1,
          audience: project.audience,
        }),
      });

      const data = await res.json();
      if (data.quizzes && data.quizzes.length > 0) {
        const newQuestions: QuizQuestion[] = data.quizzes.map(
          (q: QuizQuestion) => ({
            ...q,
            slideNumber: pageNum,
          })
        );

        const updatedSlides = project.slides.map((s) =>
          s.pageNumber === pageNum
            ? {
                ...s,
                quizzes: [...(s.quizzes || []), ...newQuestions],
              }
            : s
        );

        onUpdateProject({
          ...project,
          slides: updatedSlides,
          quizzes: [...project.quizzes, ...newQuestions],
        });
        showNotification(
          `✨ Đã tạo thêm câu hỏi Quiz bám sát kiến thức [Slide số ${pageNum}]!`
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingQuizSlideNum(null);
    }
  };

  // Generate AI Quizzes across all slides
  const handleGenerateAiQuiz = async () => {
    setIsGeneratingAiQuiz(true);
    try {
      const res = await fetch('/api/gemini/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          slides: project.slides.map((s) => ({
            pageNumber: s.pageNumber,
            title: s.title,
            originalSummary: s.originalSummary,
            points: s.points,
          })),
          count: Math.min(project.slides.length, 5),
          audience: project.audience,
        }),
      });

      const data = await res.json();
      if (data.quizzes && data.quizzes.length > 0) {
        onUpdateProject({
          ...project,
          quizzes: [...project.quizzes, ...data.quizzes],
        });
        showNotification(
          '✨ Đã tạo thêm các câu hỏi Quiz dựa hoàn toàn trên nội dung các slide!'
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingAiQuiz(false);
    }
  };

  const handleAddManualQuiz = (slideNumber: number = 1) => {
    const targetSlide =
      project.slides.find((s) => s.pageNumber === slideNumber) ||
      project.slides[0];
    const firstPoint =
      targetSlide?.points?.[0] ||
      targetSlide?.originalSummary ||
      'Nội dung chính trong slide';

    const newQuiz: QuizQuestion = {
      id: `q-s${slideNumber}-${Date.now()}`,
      slideNumber,
      question: `[Slide số ${slideNumber}] Câu hỏi kiểm tra kiến thức trong slide "${
        targetSlide?.title || `Slide ${slideNumber}`
      }":`,
      options: [
        firstPoint.slice(0, 120),
        'Phương án B',
        'Phương án C',
        'Phương án D',
      ],
      correctIndex: 0,
      explanation: `Dựa trực tiếp vào nội dung trên Slide số ${slideNumber}.`,
    };

    const updatedSlides = project.slides.map((s) =>
      s.pageNumber === slideNumber
        ? { ...s, quizzes: [...(s.quizzes || []), newQuiz] }
        : s
    );

    onUpdateProject({
      ...project,
      slides: updatedSlides,
      quizzes: [...project.quizzes, newQuiz],
    });
  };

  const handleDeleteQuiz = (id: string) => {
    const updatedQuizzes = project.quizzes.filter((q) => q.id !== id);
    const updatedSlides = project.slides.map((s) => ({
      ...s,
      quizzes: (s.quizzes || []).filter((q) => q.id !== id),
    }));
    onUpdateProject({
      ...project,
      slides: updatedSlides,
      quizzes: updatedQuizzes,
    });
  };

  const handleUpdateQuiz = (id: string, updated: Partial<QuizQuestion>) => {
    const updatedQuizzes = project.quizzes.map((q) =>
      q.id === id ? { ...q, ...updated } : q
    );
    const updatedSlides = project.slides.map((s) => ({
      ...s,
      quizzes: (s.quizzes || []).map((q) =>
        q.id === id ? { ...q, ...updated } : q
      ),
    }));
    onUpdateProject({
      ...project,
      slides: updatedSlides,
      quizzes: updatedQuizzes,
    });
  };

  const handleExportPowerPoint = async () => {
    setIsExportingPptx(true);
    try {
      await exportToPowerPoint(project);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExportingPptx(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3.5 sm:p-6 pt-6 sm:pt-8 max-w-7xl mx-auto w-full">
      <div className="space-y-4">
        {/* Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Kết quả xử lý AI theo từng Slide
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Trình bày rõ ràng theo từng slide: Nội dung tóm tắt gốc (giữ nguyên 100%) · Kịch bản giọng đọc · Câu hỏi Quiz ôn tập
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span>{project.slides.length} slide gốc</span>
            <span>·</span>
            <span>{project.quizzes.length} câu hỏi Quiz</span>
          </div>
        </div>

        {/* Strict Rule Verification Banner */}
        <div className="bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200 shadow-2xs">
          <div className="flex items-start sm:items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            <div className="leading-relaxed">
              <strong>Chế độ Sao chép &amp; Xử lý Nghiêm ngặt:</strong> Toàn bộ nội dung cốt lõi, kiến thức và số liệu giữ nguyên 100% theo tài liệu PDF gốc. Kịch bản giọng đọc và Câu hỏi Quiz chỉ sử dụng kiến thức có sẵn trong từng slide.
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyStandardOutput}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shrink-0 transition-colors cursor-pointer"
          >
            {copiedFormatted ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Đã sao chép chuẩn</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép đầu ra chuẩn</span>
              </>
            )}
          </button>
        </div>

        {/* Voice Selection & Quick Action Toolbar */}
        <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs shadow-xs text-slate-800 dark:text-slate-200">
          {/* 4 Voice Options Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-600 dark:text-slate-400 font-medium shrink-0">
              Giọng đọc AI (TTS):
            </span>

            <div className="flex items-center gap-1.5 flex-wrap">
              {VOICE_PROFILES.map((vp) => {
                const isCurrent = getVoiceProfile(selectedVoice).id === vp.id;
                return (
                  <button
                    key={vp.id}
                    type="button"
                    onClick={() => {
                      stopAnyPlayingAudio();
                      setIsPlayingAudio(null);
                      setSelectedVoice(vp.name);
                      onUpdateProject({ ...project, voice: vp.name });
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-cyan-600 text-white shadow-xs font-bold ring-2 ring-cyan-400/50'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                    }`}
                    title={`${vp.name} - ${vp.description}`}
                  >
                    <span>{vp.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                const profile = getVoiceProfile(selectedVoice);
                handleSpeech(profile.sampleText, 'sample-voice');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] rounded-lg transition-colors cursor-pointer text-xs font-semibold shadow-xs ${
                isPlayingAudio === 'sample-voice'
                  ? 'bg-cyan-600 text-white animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-cyan-500" />
              <span>
                {isPlayingAudio === 'sample-voice' ? 'Đang đọc...' : 'Nghe thử'}
              </span>
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleRewriteAllWithAi}
              disabled={isRewritingAll}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              {isRewritingAll ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý lại...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>AI chuẩn hóa lại toàn bộ Slide</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenPreview}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-amber-600/20 text-amber-700 dark:text-amber-300 hover:bg-amber-600/30 border border-amber-500/30 font-medium transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Trình chiếu</span>
            </button>

            <button
              onClick={handleExportPowerPoint}
              disabled={isExportingPptx}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExportingPptx ? 'Đang tạo...' : 'Tải PPTX'}</span>
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('per_slide')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'per_slide'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Theo từng Slide (Đầy đủ 3 mục)</span>
          </button>

          <button
            onClick={() => setActiveTab('formatted')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'formatted'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Văn bản chuẩn theo từng Slide</span>
          </button>

          <button
            onClick={() => setActiveTab('script')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'script'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Chỉ xem Kịch bản giọng đọc ({project.slides.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`min-h-[40px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'quiz'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Chỉ xem Câu hỏi Quiz ({project.quizzes.length})</span>
          </button>
        </div>

        {/* ================= TAB 1: THEO TỪNG SLIDE (ĐẦY ĐỦ 3 MỤC CHUẨN PROMPT) ================= */}
        {activeTab === 'per_slide' && (
          <div className="space-y-6">
            {project.slides.map((slide, sIdx) => {
              const pageNum = slide.pageNumber || sIdx + 1;
              const isPlaying = isPlayingAudio === slide.id;
              const isRewritingThis = rewritingSlideId === slide.id;
              const slideQuizzes = getQuizzesForSlide(slide, sIdx);
              const isGeneratingThisSlideQuiz =
                generatingQuizSlideNum === pageNum;

              return (
                <div
                  key={slide.id || pageNum}
                  className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Slide Header Banner: [Slide số X] */}
                  <div className="bg-slate-100/90 dark:bg-[#131d33] border-b border-slate-200 dark:border-slate-800 px-4 sm:px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-xs font-bold shrink-0">
                        [Slide số {pageNum}]
                      </span>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                        {slide.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                        ~{slide.duration} giây · {slide.wordCount} từ
                      </span>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(slide)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 text-xs font-medium cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3 text-amber-500" />
                        <span>Chỉnh sửa</span>
                      </button>
                    </div>
                  </div>

                  {/* Slide Body: 3 Required Sections */}
                  <div className="p-4 sm:p-5 space-y-5">
                    {/* SECTION 1: Nội dung tóm tắt gốc (giữ nguyên) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      {/* Original PDF Thumbnail Preview */}
                      <div className="lg:col-span-4 space-y-2">
                        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 flex items-center justify-center min-h-[160px]">
                          {slide.thumbnailUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={slide.thumbnailUrl}
                              alt={`Slide số ${pageNum}`}
                              className="max-h-[190px] w-auto object-contain rounded shadow-xs"
                            />
                          ) : (
                            <div className="w-full p-3 text-left space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                              <div className="font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1">
                                {slide.title}
                              </div>
                              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                                {slide.points.slice(0, 4).map((pt, i) => (
                                  <li key={i}>{pt}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Verbatim Original Content */}
                      <div className="lg:col-span-8 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            • Nội dung tóm tắt gốc (giữ nguyên 100% như tài liệu PDF gốc):
                          </span>
                        </div>
                        <div className="bg-emerald-50/40 dark:bg-[#0f1a2c] border border-emerald-200/80 dark:border-emerald-900/50 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                          {slide.originalSummary ||
                            slide.points.map((p) => `• ${p}`).join('\n')}
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: Kịch bản giọng đọc (Voiceover Script) */}
                    <div className="space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400">
                          • Kịch bản giọng đọc (Voiceover Script):
                        </span>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleSpeech(slide.script, slide.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isPlaying
                                ? 'bg-amber-600 text-white animate-pulse'
                                : 'bg-cyan-600/15 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-600/25 border border-cyan-500/30'
                            }`}
                          >
                            {isPlaying ? (
                              <>
                                <Pause className="w-3.5 h-3.5" />
                                <span>Dừng đọc</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3.5 h-3.5" />
                                <span>Đọc lời giảng AI (TTS)</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAiPolishScript(slide.id)}
                            disabled={isRewritingThis || isRewritingAll}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 hover:border-cyan-500 disabled:opacity-50 cursor-pointer"
                          >
                            {isRewritingThis ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
                                <span>Đang viết lại...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-cyan-500" />
                                <span>AI viết lại (Giữ nguyên ý gốc)</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#12192c] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {slide.script}
                      </div>
                    </div>

                    {/* SECTION 3: Câu hỏi Quiz ôn tập (của riêng Slide số X) */}
                    <div className="space-y-3 pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          • Câu hỏi Quiz ôn tập ([Slide số {pageNum}] — Chỉ dựa trên kiến thức trong slide này):
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleGenerateSlideAiQuiz(slide)}
                            disabled={isGeneratingThisSlideQuiz}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                          >
                            {isGeneratingThisSlideQuiz ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                <span>Đang tạo...</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3" />
                                <span>+ Tạo thêm Quiz từ Slide {pageNum}</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddManualQuiz(pageNum)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Thủ công</span>
                          </button>
                        </div>
                      </div>

                      {slideQuizzes.length === 0 ? (
                        <div className="bg-slate-50 dark:bg-slate-900/50 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500">
                          Chưa có câu hỏi Quiz cho Slide số {pageNum}. Nhấn{' '}
                          <strong>&ldquo;+ Tạo thêm Quiz từ Slide {pageNum}&rdquo;</strong> để AI tạo câu hỏi bám sát nội dung slide này.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {slideQuizzes.map((q, qIdx) => (
                            <div
                              key={q.id || qIdx}
                              className="bg-slate-50/80 dark:bg-[#101729] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-2.5"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[11px] shrink-0 mt-1">
                                    Câu {qIdx + 1}
                                  </span>
                                  <input
                                    type="text"
                                    value={q.question}
                                    onChange={(e) =>
                                      handleUpdateQuiz(q.id, {
                                        question: e.target.value,
                                      })
                                    }
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-cyan-500"
                                  />
                                </div>
                                <button
                                  onClick={() => handleDeleteQuiz(q.id)}
                                  className="text-slate-400 hover:text-red-500 p-1 cursor-pointer"
                                  title="Xóa câu hỏi"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 sm:pl-6">
                                {(q.options || []).map((opt, optIdx) => {
                                  const isCorrect = q.correctIndex === optIdx;
                                  const letter = String.fromCharCode(
                                    65 + optIdx
                                  );
                                  return (
                                    <div
                                      key={optIdx}
                                      onClick={() =>
                                        handleUpdateQuiz(q.id, {
                                          correctIndex: optIdx,
                                        })
                                      }
                                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer text-xs transition-colors ${
                                        isCorrect
                                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-900 dark:text-emerald-200'
                                          : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                      }`}
                                    >
                                      <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                          isCorrect
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                      >
                                        {letter}
                                      </span>
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const newOpts = [...q.options];
                                          newOpts[optIdx] = e.target.value;
                                          handleUpdateQuiz(q.id, {
                                            options: newOpts,
                                          });
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className="bg-transparent border-none text-xs w-full focus:outline-none"
                                      />
                                      {isCorrect && (
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 ml-auto" />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>

                              <div className="pl-2 sm:pl-6 flex items-center gap-2 text-[11px]">
                                <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                                  Giải thích:
                                </span>
                                <input
                                  type="text"
                                  value={q.explanation}
                                  onChange={(e) =>
                                    handleUpdateQuiz(q.id, {
                                      explanation: e.target.value,
                                    })
                                  }
                                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= TAB 2: VĂN BẢN CHUẨN THEO TỪNG SLIDE ================= */}
        {activeTab === 'formatted' && (
          <div className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Đầu ra trình bày chuẩn theo từng Slide
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Định dạng chuẩn gồm: [Slide số X] · Nội dung tóm tắt gốc (giữ nguyên) · Kịch bản giọng đọc · Câu hỏi Quiz ôn tập
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyStandardOutput}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
              >
                {copiedFormatted ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép toàn bộ văn bản</span>
                  </>
                )}
              </button>
            </div>

            <pre className="w-full bg-slate-50 dark:bg-[#090e1a] border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs text-slate-800 dark:text-slate-200 font-sans whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
              {buildStandardFormattedText()}
            </pre>
          </div>
        )}

        {/* ================= TAB 3: CHỈ XEM KỊCH BẢN GIỌNG ĐỌC ================= */}
        {activeTab === 'script' && (
          <div className="space-y-4">
            {project.slides.map((slide, sIdx) => {
              const isPlaying = isPlayingAudio === slide.id;
              const isRewritingThis = rewritingSlideId === slide.id;

              return (
                <div
                  key={slide.id}
                  className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 grid shadow-sm grid-cols-1 md:grid-cols-12 gap-5 items-start"
                >
                  <div className="md:col-span-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>[Slide số {slide.pageNumber || sIdx + 1}]</span>
                      <span className="text-[11px] text-slate-400">
                        ~{slide.duration} giây · {slide.wordCount} từ
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line max-h-36 overflow-y-auto">
                      <strong className="block text-emerald-600 dark:text-emerald-400 mb-1">
                        Nội dung tóm tắt gốc (giữ nguyên):
                      </strong>
                      {slide.originalSummary || slide.points.join('\n')}
                    </div>

                    <button
                      onClick={() => handleSpeech(slide.script, slide.id)}
                      className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-600 text-white animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Dừng phát âm thanh</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Tạo giọng giảng bài (Nghe)</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="md:col-span-8 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Kịch bản giọng đọc cho [Slide số {slide.pageNumber || sIdx + 1}]
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleAiPolishScript(slide.id)}
                          disabled={isRewritingThis || isRewritingAll}
                          className="flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline disabled:opacity-50 cursor-pointer"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>
                            {isRewritingThis ? 'Đang viết lại...' : 'AI viết lại'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(slide)}
                          className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Sửa lời giảng</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-[#12192c] border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed min-h-[120px]">
                      {slide.script}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= TAB 4: CHỈ XEM CÂU HỎI QUIZ ================= */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Danh sách {project.quizzes.length} câu hỏi Quiz ôn tập (Bám sát 100% từng Slide gốc)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGenerateAiQuiz}
                  disabled={isGeneratingAiQuiz}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {isGeneratingAiQuiz ? 'Đang tạo...' : '+ Thêm câu hỏi bằng AI'}
                  </span>
                </button>
                <button
                  onClick={() => handleAddManualQuiz(1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Thủ công</span>
                </button>
              </div>
            </div>

            {project.quizzes.map((q, qIdx) => (
              <div
                key={q.id || qIdx}
                className="bg-white dark:bg-[#0d1424] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="px-2 py-1 rounded-lg bg-blue-600/15 text-blue-600 dark:text-cyan-400 font-bold text-xs shrink-0 mt-0.5">
                      [Slide số {q.slideNumber || (qIdx % project.slides.length) + 1}]
                    </span>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) =>
                        handleUpdateQuiz(q.id, { question: e.target.value })
                      }
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-semibold"
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="text-slate-500 hover:text-red-400 transition-colors p-1 cursor-pointer"
                    title="Xoá câu hỏi"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = q.correctIndex === optIdx;
                    const letter = String.fromCharCode(65 + optIdx);

                    return (
                      <div
                        key={optIdx}
                        onClick={() =>
                          handleUpdateQuiz(q.id, { correctIndex: optIdx })
                        }
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isCorrect
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {letter}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...q.options];
                            newOpts[optIdx] = e.target.value;
                            handleUpdateQuiz(q.id, { options: newOpts });
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="bg-transparent border-none text-xs w-full focus:outline-none"
                        />
                        {isCorrect && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-auto" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pl-4">
                  <input
                    type="text"
                    value={q.explanation}
                    placeholder="Giải thích lý do đáp án đúng..."
                    onChange={(e) =>
                      handleUpdateQuiz(q.id, { explanation: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-[#101729] border border-slate-300 dark:border-slate-800/80 rounded-lg px-3 py-1.5 text-[11px] text-slate-700 dark:text-slate-400 italic focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Script & Original Summary Edit Modal */}
      {editingSlideId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-[#131b2e] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4 text-slate-900 dark:text-white max-h-[90vh] overflow-y-auto">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Chỉnh sửa Nội dung gốc &amp; Kịch bản giọng đọc
                </h3>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                  <GraduationCap className="w-3 h-3 text-cyan-400" />
                  <span>Cấp học:</span>
                  <select
                    value={project.audience}
                    onChange={(e) =>
                      onUpdateProject({ ...project, audience: e.target.value })
                    }
                    className="bg-transparent text-cyan-600 dark:text-cyan-300 font-semibold focus:outline-none cursor-pointer"
                  >
                    {LEARNER_AUDIENCES.map((aud) => (
                      <option
                        key={aud}
                        value={aud}
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        {aud}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleModalAiRewrite('pedagogical')}
                  disabled={isModalRewriting}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600 text-white text-[11px] font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isModalRewriting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>AI viết lại bám sát gốc</span>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block">
                Nội dung tóm tắt gốc (giữ nguyên):
              </label>
              <textarea
                rows={4}
                value={editedOriginalSummary}
                onChange={(e) => setEditedOriginalSummary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-600 dark:text-cyan-400 block">
                Kịch bản giọng đọc (Voiceover Script):
              </label>
              <textarea
                rows={6}
                value={editedScriptText}
                onChange={(e) => setEditedScriptText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 leading-relaxed font-sans"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>
                {editedScriptText.trim().split(/\s+/).filter(Boolean).length} từ
                (~
                {Math.round(
                  (editedScriptText.trim().split(/\s+/).filter(Boolean).length /
                    140) *
                    60
                )}{' '}
                giây)
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSlideId(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveScript(editingSlideId)}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm cursor-pointer"
                >
                  Lưu cập nhật
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50 bg-white dark:bg-[#0d162a] border border-cyan-500/40 text-slate-900 dark:text-cyan-200 shadow-2xl px-4 py-2.5 rounded-xl flex items-center gap-2.5 text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
        >
          Quay lại
        </button>

        <button
          onClick={onContinue}
          className="min-h-[44px] px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 cursor-pointer"
        >
          <span>Tiếp tục đóng gói &amp; xuất bản</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
