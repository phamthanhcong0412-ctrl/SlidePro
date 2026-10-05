export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  picture?: string;
  balance: number;
  isGoogle: boolean;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  slideNumber?: number; // Liên kết trực tiếp với [Slide số X]
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Slide {
  id: string;
  pageNumber: number;
  title: string;
  originalText?: string; // Toàn bộ văn bản gốc trích xuất từ trang PDF
  originalSummary?: string; // Nội dung tóm tắt gốc (giữ nguyên 100% thông tin, số liệu từ slide gốc)
  points: string[]; // Các ý cốt lõi giữ nguyên từ slide gốc
  script: string; // Kịch bản giọng đọc (Voiceover Script) do AI biên soạn bám sát gốc
  quizzes?: QuizQuestion[]; // Câu hỏi Quiz ôn tập dựa hoàn toàn trên kiến thức trong slide này
  duration: number; // Thời lượng ước tính (giây)
  wordCount: number;
  thumbnailUrl?: string;
  rotation?: number; // 0, 90, 180, 270 degrees
}

export interface KnowledgeUnit {
  id: string;
  title: string;
  type: 'theory' | 'practice' | 'summary' | 'discussion';
  startSlide: number;
  endSlide: number;
  mainContent: string;
  questionCount: number;
}

export interface LectureProject {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  totalPages: number;
  overview: string;
  field: string;
  audience: string;
  units: KnowledgeUnit[];
  slides: Slide[];
  quizzes: QuizQuestion[];
  status: 'draft' | 'analyzed' | 'packaged';
  createdAt: string;
  voice: string;
  voiceSpeed: number;
}

export type StepType = 1 | 2 | 3 | 4;
