import React, { useState, useEffect } from 'react';
import {
  History,
  Calendar,
  Award,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  FolderOpen,
  ArrowRight,
  Sparkles,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  fetchUserInterviews,
  fetchInterviewQuestions,
} from '../services/firestoreService';
import { InterviewSession, Question } from '../types/interview';

interface CloudHistoryProps {
  onStartNew: () => void;
}

export const CloudHistory: React.FC<CloudHistoryProps> = ({ onStartNew }) => {
  const { user, signInWithGoogle } = useAuth();
  const [interviews, setInterviews] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);
  const [interviewQuestions, setInterviewQuestions] = useState<Record<string, Question[]>>({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await fetchUserInterviews(user.uid);
      setInterviews(data);
    } catch (err) {
      console.warn('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = async (interviewId: string) => {
    if (expandedInterviewId === interviewId) {
      setExpandedInterviewId(null);
      return;
    }

    setExpandedInterviewId(interviewId);
    if (!interviewQuestions[interviewId]) {
      setLoadingQuestions(true);
      try {
        const qList = await fetchInterviewQuestions(interviewId);
        setInterviewQuestions((prev) => ({ ...prev, [interviewId]: qList }));
      } catch (err) {
        console.warn('Failed to fetch questions for interview:', err);
      } finally {
        setLoadingQuestions(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-2">Cloud Storage Sign-In Required</h2>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto mb-6">
          Sign in with your Google account to automatically persist your interview loops, questions, rubrics, and scores to Google Cloud Firestore.
        </p>
        <button
          onClick={() => signInWithGoogle()}
          className="m3-btn-primary px-6 py-2.5 text-xs font-bold inline-flex items-center gap-2 shadow-md"
        >
          <span>Sign In With Google</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <History className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Cloud Storage</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Mock Interview History</h2>
          <p className="text-xs text-on-surface-variant">
            All your completed sessions synced securely to Google Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            disabled={loading}
            className="p-2 rounded-full border border-outline-variant hover:bg-surface-container text-on-surface-variant"
            title="Refresh from Cloud"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <button
            onClick={onStartNew}
            className="m3-btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Interview</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-xs text-on-surface-variant font-medium">Fetching sessions from Firestore...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="m3-card p-12 text-center max-w-lg mx-auto space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant mx-auto">
            <FolderOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-on-surface">No Mock Interviews Saved Yet</h3>
          <p className="text-xs text-on-surface-variant">
            You haven't conducted any mock interviews yet. Pick a domain and start your first session to build your readiness radar.
          </p>
          <button
            onClick={onStartNew}
            className="m3-btn-primary px-5 py-2 text-xs font-bold inline-flex items-center gap-1.5"
          >
            <span>Launch First Interview</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {interviews.map((session) => {
            const isExpanded = expandedInterviewId === session.interviewId;
            const questions = interviewQuestions[session.interviewId] || [];

            return (
              <div
                key={session.interviewId}
                className="m3-card overflow-hidden border border-outline-variant/60"
              >
                <div
                  onClick={() => handleToggleExpand(session.interviewId)}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-low/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-primary">
                        {session.domain}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
                        {session.seniority}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
                        {session.difficulty}
                      </span>
                      <span className="text-[11px] text-on-surface-variant/80 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-on-surface">
                      {session.role}
                    </h4>
                    <p className="text-xs text-on-surface-variant line-clamp-1">
                      {session.summaryFeedback || 'Completed evaluation loop.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-lg font-black text-on-surface">
                          {session.overallScore}%
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-medium uppercase">
                          Score
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
                        <Award className="w-6 h-6" />
                      </div>
                    </div>

                    <button
                      className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container"
                      aria-label="Expand interview questions"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Subcollection: Questions List */}
                {isExpanded && (
                  <div className="p-5 border-t border-outline-variant/40 bg-surface-container-low/30 space-y-4 animate-in fade-in duration-150">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-on-surface">
                      Evaluated Questions & Feedback
                    </h5>

                    {loadingQuestions && !questions.length ? (
                      <div className="py-6 text-center text-xs text-on-surface-variant">
                        Loading detailed questions from Firestore...
                      </div>
                    ) : questions.length === 0 ? (
                      <p className="text-xs text-on-surface-variant italic">
                        No recorded question responses found for this session.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {questions.map((q, idx) => (
                          <div
                            key={q.questionId || idx}
                            className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs space-y-2"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-on-surface">
                                Q{idx + 1}: {q.questionText}
                              </span>
                              {q.technicalScore !== undefined && (
                                <span className="font-bold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">
                                  {q.technicalScore}%
                                </span>
                              )}
                            </div>

                            {q.userAnswer && (
                              <p className="text-on-surface-variant italic bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                                "{q.userAnswer}"
                              </p>
                            )}

                            {q.modelAnswer && (
                              <div className="pt-1">
                                <span className="font-bold text-primary block">Benchmark Answer:</span>
                                <p className="text-on-surface-variant mt-0.5 whitespace-pre-line">
                                  {q.modelAnswer}
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
