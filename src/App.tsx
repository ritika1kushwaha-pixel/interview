import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { DomainSelector, CustomDomainMeta } from './components/DomainSelector';
import { InterviewSetupModal } from './components/InterviewSetupModal';
import { InterviewRoom } from './components/InterviewRoom';
import { InterviewSummaryModal } from './components/InterviewSummaryModal';
import { CloudHistory } from './components/CloudHistory';
import { SavedFlashcards } from './components/SavedFlashcards';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import {
  DifficultyLevel,
  DomainMeta,
  InterviewSession,
  InterviewType,
  Question,
  SeniorityLevel,
} from './types/interview';
import { requestInterviewQuestions } from './services/geminiClient';
import {
  createInterviewInCloud,
  updateUserStatsAfterInterview,
} from './services/firestoreService';

function MainApp() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'practice' | 'history' | 'flashcards' | 'analytics'>('practice');
  const [isDark, setIsDark] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Setup modal state
  const [selectedDomain, setSelectedDomain] = useState<DomainMeta | CustomDomainMeta | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  // Active Interview state
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [sessionQuestions, setSessionQuestions] = useState<Question[]>([]);

  // Completed Session state
  const [completedSession, setCompletedSession] = useState<InterviewSession | null>(null);
  const [completedQuestions, setCompletedQuestions] = useState<Question[]>([]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleStartInterview = async (config: {
    domainId: string;
    domainName: string;
    role: string;
    seniority: SeniorityLevel;
    difficulty: DifficultyLevel;
    interviewType: InterviewType;
    questionCount: number;
  }) => {
    setIsStarting(true);
    const interviewId = `int_${Date.now()}`;
    const effectiveUserId = user ? user.uid : 'guest_candidate';

    try {
      // 1. Generate tailored questions
      const generatedQuestions = await requestInterviewQuestions({
        domain: config.domainId,
        role: config.role,
        seniority: config.seniority,
        difficulty: config.difficulty,
        interviewType: config.interviewType,
        count: config.questionCount,
        interviewId,
        userId: effectiveUserId,
      });

      const newSession: InterviewSession = {
        interviewId,
        userId: effectiveUserId,
        title: `${config.role} - ${config.domainName}`,
        domain: config.domainName,
        role: config.role,
        seniority: config.seniority,
        difficulty: config.difficulty,
        interviewType: config.interviewType,
        status: 'in_progress',
        currentQuestionIndex: 0,
        totalQuestions: generatedQuestions.length,
        overallScore: 0,
        technicalScore: 0,
        communicationScore: 0,
        confidenceScore: 0,
        summaryFeedback: '',
        questions: generatedQuestions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 2. Persist to Firestore if authenticated
      if (user) {
        await createInterviewInCloud(newSession);
      }

      setSessionQuestions(generatedQuestions);
      setActiveSession(newSession);
      setSelectedDomain(null);
    } catch (err) {
      console.error('Failed to initialize interview:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteSession = async (
    completed: InterviewSession,
    finalQuestions: Question[]
  ) => {
    setCompletedSession(completed);
    setCompletedQuestions(finalQuestions);
    setActiveSession(null);

    // If signed in, update user cumulative score in Cloud Firestore
    if (user && completed.overallScore) {
      try {
        await updateUserStatsAfterInterview(user.uid, completed.overallScore);
      } catch (err) {
        console.warn('Failed to update user stats in cloud:', err);
      }
    }
  };

  const handleExitInterview = () => {
    setActiveSession(null);
    setSessionQuestions([]);
  };

  const handleRestart = () => {
    setCompletedSession(null);
    setCompletedQuestions([]);
    setCurrentTab('practice');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col font-sans transition-colors duration-150">
      <Header
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setActiveSession(null);
          setCompletedSession(null);
          setCurrentTab(tab);
        }}
        isDark={isDark}
        setIsDark={setIsDark}
        isInterviewActive={!!activeSession}
      />

      <main className="flex-1">
        {/* VIEW 1: Active Interview Room */}
        {activeSession ? (
          <InterviewRoom
            session={activeSession}
            questions={sessionQuestions}
            onCompleteSession={handleCompleteSession}
            onExit={handleExitInterview}
          />
        ) : completedSession ? (
          /* VIEW 2: Interview Complete Scorecard */
          <InterviewSummaryModal
            session={completedSession}
            questions={completedQuestions}
            onRestart={handleRestart}
            onGoToFlashcards={() => {
              setCompletedSession(null);
              setCurrentTab('flashcards');
            }}
          />
        ) : (
          /* VIEW 3: Standard Tabs */
          <>
            {currentTab === 'practice' && (
              <DomainSelector
                onSelectDomain={(domain) => setSelectedDomain(domain)}
              />
            )}

            {currentTab === 'history' && (
              <CloudHistory
                onStartNew={() => setCurrentTab('practice')}
              />
            )}

            {currentTab === 'flashcards' && <SavedFlashcards />}

            {currentTab === 'analytics' && (
              <AnalyticsDashboard
                onStartPractice={() => setCurrentTab('practice')}
              />
            )}
          </>
        )}
      </main>

      {/* Interview Setup Modal */}
      {selectedDomain && (
        <InterviewSetupModal
          domain={selectedDomain}
          onClose={() => setSelectedDomain(null)}
          onStart={handleStartInterview}
          isStarting={isStarting}
        />
      )}

      {/* Footer */}
      {!activeSession && (
        <footer className="mt-auto py-6 border-t border-outline-variant/30 text-center text-xs text-on-surface-variant bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>AceMock AI • Precision Mock Interviews & Rubrics</span>
            <span>Cloud Persistence with Google Cloud Firestore & Firebase Auth</span>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
