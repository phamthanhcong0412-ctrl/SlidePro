'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Stepper from '@/components/Stepper';
import Step1Upload from '@/components/Step1Upload';
import Step2Outline from '@/components/Step2Outline';
import Step3ScriptQuiz from '@/components/Step3ScriptQuiz';
import Step4Export from '@/components/Step4Export';
import ConfirmModal from '@/components/ConfirmModal';
import SlidePreviewModal from '@/components/SlidePreviewModal';
import FeedbackModal from '@/components/FeedbackModal';
import LibraryModal from '@/components/LibraryModal';
import AccountView from '@/components/AccountView';
import AuthModal from '@/components/AuthModal';
import { SAMPLE_PROJECTS } from '@/lib/sampleData';
import { LectureProject, StepType, UserProfile } from '@/types/presentation';
import { Gift, CheckCircle2, X, Sparkles, FolderKanban, Receipt, User } from 'lucide-react';

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<'editor' | 'library' | 'inbox' | 'history' | 'account'>('editor');
  const [currentStep, setCurrentStep] = useState<StepType>(1);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [welcomeToast, setWelcomeToast] = useState<string | null>(null);

  // Balance
  const [balance, setBalance] = useState(20000);

  // Active project - defaults to medical lecture matching user screenshots
  const [currentProject, setCurrentProject] = useState<LectureProject>(SAMPLE_PROJECTS[0]);
  const [savedProjects, setSavedProjects] = useState<LectureProject[]>(SAMPLE_PROJECTS);

  // Modals state
  const [confirmModalMode, setConfirmModalMode] = useState<'outline_to_script' | 'script_to_package' | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  // Check localStorage and screen width on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      }

      try {
        const stored = localStorage.getItem('slidepro_user');
        if (stored) {
          const parsed: UserProfile = JSON.parse(stored);
          setCurrentUser(parsed);
          setBalance(parsed.balance || 20000);
        } else {
          // App requires an account to use -> open Auth Gate!
          setIsAuthOpen(true);
        }

        const storedProjects = localStorage.getItem('slidepro_projects');
        if (storedProjects) {
          const parsedProjects: LectureProject[] = JSON.parse(storedProjects);
          if (Array.isArray(parsedProjects) && parsedProjects.length > 0) {
            setSavedProjects(parsedProjects);
            setCurrentProject(parsedProjects[0]);
          }
        }
      } catch {
        setIsAuthOpen(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Handle Authentication Success
  const handleLoginSuccess = (user: UserProfile, isNewUser: boolean) => {
    setCurrentUser(user);
    setBalance(user.balance);
    localStorage.setItem('slidepro_user', JSON.stringify(user));
    setIsAuthOpen(false);

    if (isNewUser) {
      setWelcomeToast('Chào mừng bạn đến với SlideEdu! Ứng dụng hoàn toàn miễn phí trọn đời, bạn có thể tạo slide bài giảng không giới hạn.');
      setTimeout(() => setWelcomeToast(null), 7000);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('slidepro_user');
    setCurrentUser(null);
    setIsAuthOpen(true);
  };

  // File loaded in Step 1
  const handleFileLoaded = (newProject: LectureProject) => {
    setCurrentProject(newProject);
    setSavedProjects((prev) => {
      const exists = prev.some((p) => p.id === newProject.id);
      const updated = exists
        ? prev.map((p) => (p.id === newProject.id ? newProject : p))
        : [newProject, ...prev];
      try {
        localStorage.setItem('slidepro_projects', JSON.stringify(updated));
      } catch (e) {
        console.warn('Cannot persist projects to localStorage', e);
      }
      return updated;
    });
  };

  // Delete lecture from Kho bài giảng
  const handleDeleteProject = (projectId: string) => {
    setSavedProjects((prev) => {
      const updated = prev.filter((p) => p.id !== projectId);
      try {
        localStorage.setItem('slidepro_projects', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    if (currentProject.id === projectId) {
      const remaining = savedProjects.filter((p) => p.id !== projectId);
      if (remaining.length > 0) {
        setCurrentProject(remaining[0]);
      }
    }
  };

  // Step 1 -> Step 2
  const handleProceedFromStep1 = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    setCurrentStep(2);
  };

  // Step 2 Continue -> Opens Confirm Modal 1 (Screen 3)
  const handleOpenConfirmFromStep2 = () => {
    setConfirmModalMode('outline_to_script');
  };

  // Confirm Modal 1 -> Moves to Step 3 (Screen 4)
  const handleConfirmStep2 = () => {
    setConfirmModalMode(null);

    // Calculate total desired questions from all knowledge units
    const totalQuestionsDesired = currentProject.units.reduce(
      (sum, u) => sum + (Number(u.questionCount) || 0),
      0
    ) || currentProject.quizzes.length;

    // Synchronize quizzes to match requested count exactly
    if (totalQuestionsDesired > 0 && currentProject.quizzes.length !== totalQuestionsDesired) {
      let updatedQuizzes = [...currentProject.quizzes];
      if (updatedQuizzes.length < totalQuestionsDesired) {
        const diff = totalQuestionsDesired - updatedQuizzes.length;
        const newQuizzes = Array.from({ length: diff }).map((_, i) => {
          const slideRef = currentProject.slides[i % currentProject.slides.length];
          const slideTitle = slideRef?.title || `Nội dung slide ${i + 1}`;
          return {
            id: `q-${Date.now()}-${updatedQuizzes.length + i + 1}`,
            question: `Câu hỏi ôn tập ${updatedQuizzes.length + i + 1}: Trọng tâm của phần "${slideTitle}" trong bài học là gì?`,
            options: [
              'Nắm vững bản chất nguyên lý và ứng dụng thực hành chính xác',
              'Bỏ qua các bước phân tích lý thuyết ban đầu',
              'Chỉ ghi nhớ máy móc mà không cần vận dụng',
              'Không cần tuân thủ quy trình chuẩn'
            ],
            correctIndex: 0,
            explanation: `Theo nội dung bài giảng tại slide ${slideRef?.pageNumber || 1}, việc hiểu sâu lý thuyết gắn liền với thực hành là yêu cầu bắt buộc.`
          };
        });
        updatedQuizzes = [...updatedQuizzes, ...newQuizzes];
      } else {
        updatedQuizzes = updatedQuizzes.slice(0, totalQuestionsDesired);
      }

      setCurrentProject((prev) => ({
        ...prev,
        quizzes: updatedQuizzes,
      }));
    }

    setCurrentStep(3);
  };

  // Step 3 Continue -> Opens Confirm Modal 2 (Screen 6)
  const handleOpenConfirmFromStep3 = () => {
    setConfirmModalMode('script_to_package');
  };

  // Confirm Modal 2 -> Moves to Step 4 (Screen 7)
  const handleConfirmStep3 = () => {
    setConfirmModalMode(null);
    setCurrentStep(4);
  };

  // New Lecture Action
  const handleNewLecture = () => {
    setActiveView('editor');
    setCurrentStep(1);
  };

  // Top-up Balance
  const handleAddBalance = (amount: number) => {
    setBalance((prev) => {
      const updated = prev + amount;
      if (currentUser) {
        const updatedUser = { ...currentUser, balance: updated };
        setCurrentUser(updatedUser);
        localStorage.setItem('slidepro_user', JSON.stringify(updatedUser));
      }
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#090d18] text-slate-100 flex flex-col font-sans relative">
      {/* Welcome Toast Notification */}
      {welcomeToast && (
        <div className="fixed top-20 right-5 z-50 max-w-md bg-gradient-to-r from-emerald-950 to-[#0e1f1c] border border-emerald-500/80 rounded-2xl p-4 shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-300">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex-1 text-xs">
            <strong className="text-emerald-300 font-bold block mb-0.5">Kích hoạt tài khoản thành công!</strong>
            <p className="text-slate-200 leading-relaxed">{welcomeToast}</p>
          </div>
          <button
            onClick={() => setWelcomeToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        balance={balance}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onNewLecture={handleNewLecture}
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeView={activeView}
          setActiveView={setActiveView}
          balance={balance}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
          onNewLecture={handleNewLecture}
          user={currentUser}
          onLogout={handleLogout}
          projects={savedProjects}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#0a0f1d] pb-16 lg:pb-0">
          {activeView === 'editor' && (
            <>
              {/* Stepper Navigation (indicator only, not clickable) */}
              <Stepper currentStep={currentStep} />

              {/* Step 1: Upload */}
              {currentStep === 1 && (
                <Step1Upload
                  onFileLoaded={handleFileLoaded}
                  onProceed={handleProceedFromStep1}
                  currentProject={currentProject}
                />
              )}

              {/* Step 2: Outline & Analysis (Duyệt dàn ý) */}
              {currentStep === 2 && (
                <Step2Outline
                  project={currentProject}
                  onUpdateProject={setCurrentProject}
                  onContinue={handleOpenConfirmFromStep2}
                />
              )}

              {/* Step 3: Script & Quiz (Tạo lời giảng/Quiz) */}
              {currentStep === 3 && (
                <Step3ScriptQuiz
                  project={currentProject}
                  onUpdateProject={setCurrentProject}
                  onContinue={handleOpenConfirmFromStep3}
                  onBack={() => setCurrentStep(2)}
                  onOpenPreview={() => setIsPreviewOpen(true)}
                />
              )}

              {/* Step 4: Packaging & PPTX Export */}
              {currentStep === 4 && (
                <Step4Export
                  project={currentProject}
                  onOpenPreview={() => setIsPreviewOpen(true)}
                  onBack={() => setCurrentStep(3)}
                  onNewLecture={handleNewLecture}
                  onGoToLibrary={() => setActiveView('library')}
                />
              )}
            </>
          )}

          {activeView === 'library' && (
            <LibraryModal
              projects={savedProjects}
              onSelectProject={(proj) => {
                setCurrentProject(proj);
                setActiveView('editor');
                setCurrentStep(2);
              }}
              onOpenPreview={(proj) => {
                setCurrentProject(proj);
                setIsPreviewOpen(true);
              }}
              onNewLecture={handleNewLecture}
              onDeleteProject={handleDeleteProject}
            />
          )}

          {activeView === 'history' && (
            <AccountView
              type="history"
              balance={balance}
              user={currentUser}
              onLogout={handleLogout}
              projects={savedProjects}
            />
          )}

          {activeView === 'account' && (
            <AccountView
              type="account"
              balance={balance}
              user={currentUser}
              onLogout={handleLogout}
              projects={savedProjects}
            />
          )}

          {activeView === 'inbox' && (
            <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-4">
              <h1 className="text-2xl font-bold text-white">Hộp thư thông báo</h1>
              <div className="bg-[#0d1424] border border-slate-800 rounded-2xl p-5 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold text-cyan-400">Hệ thống SlideEdu</span>
                  <span>18:00 Hôm nay</span>
                </div>
                <h3 className="text-sm font-bold text-white">
                  Chào mừng bạn đến với SlideEdu - Nền tảng Soạn bài giảng & Tạo Slide Giáo dục từ PDF
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  Tài khoản của bạn đã được kích hoạt thành công với gói Miễn phí trọn đời. Chúc bạn tạo nên những bài giảng PowerPoint và E-Learning chất lượng cao!
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (< lg) */}
      <nav className="h-14 bg-[#0d1424]/95 border-t border-slate-800 backdrop-blur-md sticky bottom-0 left-0 right-0 z-30 lg:hidden flex items-center justify-around px-2 select-none shrink-0 shadow-lg">
        <button
          onClick={() => {
            setActiveView('editor');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'editor' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Soạn bài</span>
        </button>

        <button
          onClick={() => {
            setActiveView('library');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'library' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FolderKanban className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Kho bài</span>
        </button>

        <button
          onClick={() => {
            setActiveView('history');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'history' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Nhật ký</span>
        </button>

        <button
          onClick={() => {
            setActiveView('account');
          }}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg min-h-[44px] transition-colors cursor-pointer ${
            activeView === 'account' ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <User className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Tài khoản</span>
        </button>
      </nav>

      {/* Auth Modal / Gate (Required to use) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => currentUser && setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        isGate={!currentUser}
      />

      {/* Confirmation Modals 1 & 2 */}
      <ConfirmModal
        isOpen={confirmModalMode !== null}
        onClose={() => setConfirmModalMode(null)}
        onConfirm={
          confirmModalMode === 'outline_to_script'
            ? handleConfirmStep2
            : handleConfirmStep3
        }
        project={currentProject}
        mode={confirmModalMode || 'outline_to_script'}
      />

      {/* Interactive Presentation Preview Modal (Screen 8) */}
      <SlidePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        project={currentProject}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
      />
    </div>
  );
}
