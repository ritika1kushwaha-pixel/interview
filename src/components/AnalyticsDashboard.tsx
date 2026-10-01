import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Award,
  CheckCircle2,
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserInterviews } from '../services/firestoreService';
import { InterviewSession } from '../types/interview';

export const AnalyticsDashboard: React.FC<{ onStartPractice: () => void }> = ({
  onStartPractice,
}) => {
  const { user, userProfile } = useAuth();
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchUserInterviews(user ? user.uid : undefined);
      setSessions(data.filter((s) => s.status === 'completed'));
    } catch (err) {
      console.warn('Failed to load sessions for analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const total = sessions.length || userProfile?.totalInterviews || 0;
  const avgScore = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + (s.overallScore || 0), 0) / sessions.length)
    : userProfile?.averageScore || 0;

  const avgTech = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + (s.technicalScore || 0), 0) / sessions.length)
    : total > 0 ? avgScore + 2 : 75;

  const avgComm = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + (s.communicationScore || 0), 0) / sessions.length)
    : total > 0 ? avgScore - 1 : 70;

  const avgConf = sessions.length
    ? Math.round(sessions.reduce((acc, s) => acc + (s.confidenceScore || 0), 0) / sessions.length)
    : total > 0 ? avgScore - 3 : 72;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-in fade-in duration-150">
      {/* Header */}
      <div className="pb-4 border-b border-outline-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary mb-1">
            <BarChart3 className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Candidate Readiness</span>
          </div>
          <h2 className="text-2xl font-bold text-on-surface">Interview Competency Radar</h2>
          <p className="text-xs text-on-surface-variant">
            Track your mastery across technical depth, structured STAR storytelling, and executive impact.
          </p>
        </div>

        <button
          onClick={onStartPractice}
          className="m3-btn-primary px-5 py-2 text-xs font-bold self-start sm:self-center shadow-sm flex items-center gap-1.5"
        >
          <span>Start Practice Session</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="m3-card p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-bold">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Cumulative Average
            </span>
            <div className="text-3xl font-black text-on-surface mt-0.5">
              {total > 0 ? `${avgScore}%` : '—'}
            </div>
            <span className="text-[11px] text-primary font-medium">
              {total > 0 ? `Across ${total} completed sessions` : 'Complete 1 session to unlock'}
            </span>
          </div>
        </div>

        <div className="m3-card p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold">
            <Target className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Sessions Completed
            </span>
            <div className="text-3xl font-black text-on-surface mt-0.5">{total}</div>
            <span className="text-[11px] text-secondary font-medium">
              {user ? 'Cloud Firestore synced' : 'Local practice cache'}
            </span>
          </div>
        </div>

        <div className="m3-card p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-tertiary-container text-on-tertiary-container flex items-center justify-center font-bold">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Target Level
            </span>
            <div className="text-xl font-black text-on-surface mt-1 truncate">
              {userProfile?.seniority || (sessions[0]?.seniority) || 'Mid-Level'}
            </div>
            <span className="text-[11px] text-on-surface-variant truncate block">
              {userProfile?.targetRole || (sessions[0]?.role) || 'Full Stack Engineer'}
            </span>
          </div>
        </div>
      </div>

      {/* 3 Pillar Competency Progress Bars */}
      <div className="m3-card p-6 sm:p-8 space-y-6">
        <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <span>Core Evaluation Pillars</span>
        </h3>

        <div className="space-y-5">
          {/* Pillar 1 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface">1. Technical Knowledge & Correctness</span>
              <span className="font-bold text-primary">{Math.min(98, avgTech)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${Math.min(98, avgTech)}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Evaluates conceptual accuracy, algorithmic depth, architectural tradeoffs, and domain precision.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface">2. Communication & STAR Methodology</span>
              <span className="font-bold text-[#00897b]">{Math.min(98, avgComm)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full rounded-full bg-[#00897b] transition-all duration-700"
                style={{ width: `${Math.min(98, avgComm)}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Measures Situation-Task-Action-Result structure, conciseness, pacing, and lack of filler words.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-on-surface">3. Strategic Impact & Executive Presence</span>
              <span className="font-bold text-[#825500]">{Math.min(98, avgConf)}%</span>
            </div>
            <div className="w-full h-3 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className="h-full rounded-full bg-[#825500] transition-all duration-700"
                style={{ width: `${Math.min(98, avgConf)}%` }}
              />
            </div>
            <p className="text-[11px] text-on-surface-variant">
              Quantifiable metrics (revenue, % latency, efficiency), ownership language, and high-stakes leadership.
            </p>
          </div>
        </div>
      </div>

      {/* Candidate Readiness Checklist */}
      <div className="m3-card p-6 space-y-4">
        <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Interview Day Readiness Checklist</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-on-surface block">STAR Story Inventory</span>
              <span className="text-on-surface-variant leading-relaxed">
                Prepare 4-5 versatile real-world project stories that highlight technical adversity, conflict, and turnaround.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-on-surface block">Quantified Impact</span>
              <span className="text-on-surface-variant leading-relaxed">
                Ground every conclusion in hard numbers (% latency reduction, $ ARR generated, hours saved).
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-on-surface block">Clarifying Questions</span>
              <span className="text-on-surface-variant leading-relaxed">
                Always establish constraints, read/write ratios, and SLAs before diving into system design answers.
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/40 flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-on-surface block">Eye Contact & Confident Pacing</span>
              <span className="text-on-surface-variant leading-relaxed">
                Use the Webcam Mirror tool to practice calm breathing, steady posture, and conversational cadence.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
