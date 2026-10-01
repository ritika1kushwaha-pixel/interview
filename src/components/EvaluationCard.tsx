import React, { useState } from 'react';
import {
  Award,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Volume2,
} from 'lucide-react';
import { EvaluationResult, Question } from '../types/interview';

interface EvaluationCardProps {
  question: Question;
  evaluation: EvaluationResult;
  onNext: () => void;
  onSaveBookmark: (takeaway: string, modelAnswer: string) => Promise<void>;
  isLastQuestion: boolean;
}

export const EvaluationCard: React.FC<EvaluationCardProps> = ({
  question,
  evaluation,
  onNext,
  onSaveBookmark,
  isLastQuestion,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [isPlayingFollowUp, setIsPlayingFollowUp] = useState(false);

  const getScoreBadge = (score: number) => {
    if (score >= 88) return { label: 'Strong Hire (A+)', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300' };
    if (score >= 75) return { label: 'Hire (A)', color: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 border-blue-300' };
    if (score >= 60) return { label: 'Borderline (B)', color: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 border-amber-300' };
    return { label: 'Needs Polish (C)', color: 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border-rose-300' };
  };

  const badge = getScoreBadge(evaluation.overallScore);

  const handleBookmark = async () => {
    if (isSaved || isSaving) return;
    setIsSaving(true);
    try {
      const takeaway = evaluation.improvements[0]
        ? `Improvement: ${evaluation.improvements[0]}. Summary: ${evaluation.summaryFeedback}`
        : evaluation.summaryFeedback;
      await onSaveBookmark(takeaway, evaluation.modelAnswer);
      setIsSaved(true);
    } catch (err) {
      console.error('Failed to save bookmark:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSpeakFollowUp = () => {
    if ('speechSynthesis' in window && evaluation.followUpQuestion) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(evaluation.followUpQuestion);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingFollowUp(true);
      utterance.onend = () => setIsPlayingFollowUp(false);
      utterance.onerror = () => setIsPlayingFollowUp(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="m3-card p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      {/* Top Banner: Verdict & Overall Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              AI Precision Evaluation
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <h3 className="text-xl font-bold text-on-surface">
            Performance Breakdown
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
            {evaluation.summaryFeedback}
          </p>
        </div>

        {/* Big Overall Score Circle */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="w-18 h-18 rounded-2xl bg-primary-container text-on-primary-container flex flex-col items-center justify-center border border-primary/20 shadow-inner">
            <span className="text-2xl font-black tracking-tight">{evaluation.overallScore}%</span>
            <span className="text-[10px] font-bold uppercase opacity-80">Composite</span>
          </div>
        </div>
      </div>

      {/* 3 Core Pillars: Technical Knowledge, Communication, Confidence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Pillar 1: Technical Knowledge */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-on-surface">Technical Depth</span>
            <span className="text-xs font-black text-primary">{evaluation.technicalScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${evaluation.technicalScore}%` }}
            />
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1.5 block">
            Domain correctness & precision
          </span>
        </div>

        {/* Pillar 2: Communication & Structure */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-on-surface">Communication</span>
            <span className="text-xs font-black text-secondary">{evaluation.communicationScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-[#00897b] transition-all duration-700"
              style={{ width: `${evaluation.communicationScore}%` }}
            />
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1.5 block">
            STAR structure, pacing & clarity
          </span>
        </div>

        {/* Pillar 3: Confidence & Impact */}
        <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/50">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-on-surface">Strategic Impact</span>
            <span className="text-xs font-black text-[#825500]">{evaluation.confidenceScore}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-[#825500] transition-all duration-700"
              style={{ width: `${evaluation.confidenceScore}%` }}
            />
          </div>
          <span className="text-[10px] text-on-surface-variant mt-1.5 block">
            Metrics, ownership & leadership
          </span>
        </div>
      </div>

      {/* Two Columns: Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            What You Nailed
          </h4>
          <ul className="space-y-1.5 text-xs text-on-surface leading-relaxed">
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold mt-0.5">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Growth */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            How To Level Up
          </h4>
          <ul className="space-y-1.5 text-xs text-on-surface leading-relaxed">
            {evaluation.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold mt-0.5">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Follow-up Probing Question */}
      {evaluation.followUpQuestion && (
        <div className="p-4 rounded-2xl bg-surface-container-high border border-outline-variant/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 text-primary mt-0.5">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wide text-primary">
                Interviewer Follow-Up Probe:
              </span>
              <p className="text-xs text-on-surface font-medium italic mt-0.5">
                "{evaluation.followUpQuestion}"
              </p>
            </div>
          </div>
          <button
            onClick={handleSpeakFollowUp}
            className={`p-2 rounded-xl border border-outline-variant hover:bg-surface-container text-xs font-semibold flex items-center gap-1.5 shrink-0 ${
              isPlayingFollowUp ? 'text-primary animate-pulse' : 'text-on-surface-variant'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Listen</span>
          </button>
        </div>
      )}

      {/* Expandable Model Answer */}
      <div className="border border-outline-variant/60 rounded-2xl overflow-hidden bg-surface-container-lowest">
        <button
          onClick={() => setShowModelAnswer(!showModelAnswer)}
          className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors"
        >
          <div className="flex items-center gap-2 text-primary">
            <Lightbulb className="w-4 h-4" />
            <span>Exemplary 10/10 Benchmark Answer</span>
          </div>
          {showModelAnswer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showModelAnswer && (
          <div className="p-4 border-t border-outline-variant/40 bg-surface-container-low/40 text-xs text-on-surface-variant leading-relaxed">
            <p className="whitespace-pre-line">{evaluation.modelAnswer}</p>
          </div>
        )}
      </div>

      {/* Action Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-outline-variant/40">
        <button
          onClick={handleBookmark}
          disabled={isSaved || isSaving}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all ${
            isSaved
              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
              : 'border-outline-variant hover:bg-surface-container text-on-surface'
          }`}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          <span>{isSaved ? 'Saved to Revision Vault' : 'Bookmark Key Insight'}</span>
        </button>

        <button
          onClick={onNext}
          className="m3-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md hover:scale-[1.02]"
        >
          <span>{isLastQuestion ? 'View Full Interview Scorecard' : 'Next Mock Question'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
