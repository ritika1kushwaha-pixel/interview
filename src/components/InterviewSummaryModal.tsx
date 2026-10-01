import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Award,
  CheckCircle,
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { InterviewSession, Question } from '../types/interview';

interface InterviewSummaryModalProps {
  session: InterviewSession;
  questions: Question[];
  onRestart: () => void;
  onGoToFlashcards: () => void;
}

export const InterviewSummaryModal: React.FC<InterviewSummaryModalProps> = ({
  session,
  questions,
  onRestart,
  onGoToFlashcards,
}) => {
  const [expandedQIndex, setExpandedQIndex] = React.useState<number | null>(null);

  useEffect(() => {
    // Fire festive celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  }, []);

  const getVerdict = (score: number) => {
    if (score >= 88) return { grade: 'A+ (Strong Hire)', desc: 'Exceptional mastery across technical depth, structured STAR communication, and executive impact.' };
    if (score >= 75) return { grade: 'A (Hire)', desc: 'Solid hire-level performance with clear conceptual clarity and strong problem-solving.' };
    if (score >= 60) return { grade: 'B (Borderline)', desc: 'Capable candidate. Needs more quantifiable metrics and sharper STAR structuring.' };
    return { grade: 'C (Developing)', desc: 'Focus on core technical fundamentals and eliminating generalities in your answers.' };
  };

  const verdict = getVerdict(session.overallScore);

  const handleDownloadMarkdown = () => {
    let md = `# Interview Scorecard - ${session.role} (${session.domain})\n\n`;
    md += `**Date:** ${new Date().toLocaleDateString()}\n`;
    md += `**Seniority:** ${session.seniority} | **Difficulty:** ${session.difficulty}\n`;
    md += `**Overall Score:** ${session.overallScore}% (${verdict.grade})\n\n`;
    md += `### Scorecard Breakdown\n`;
    md += `- **Technical Knowledge & Depth:** ${session.technicalScore}%\n`;
    md += `- **Communication & STAR Structure:** ${session.communicationScore}%\n`;
    md += `- **Confidence & Strategic Impact:** ${session.confidenceScore}%\n\n`;
    md += `### Questions & AI Evaluations\n\n`;

    questions.forEach((q, idx) => {
      md += `#### Question ${idx + 1}: ${q.questionText}\n`;
      md += `**Category:** ${q.category} | **Status:** ${q.status}\n\n`;
      if (q.userAnswer) {
        md += `**Your Answer:**\n${q.userAnswer}\n\n`;
      }
      if (q.technicalScore !== undefined) {
        md += `**Score:** Tech: ${q.technicalScore}% | Comm: ${q.communicationScore}% | Confidence: ${q.confidenceScore}%\n\n`;
      }
      if (q.strengths?.length) {
        md += `**Strengths:**\n${q.strengths.map((s) => `- ${s}`).join('\n')}\n\n`;
      }
      if (q.improvements?.length) {
        md += `**Areas for Improvement:**\n${q.improvements.map((i) => `- ${i}`).join('\n')}\n\n`;
      }
      if (q.modelAnswer) {
        md += `**Model Benchmark Answer:**\n${q.modelAnswer}\n\n`;
      }
      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Interview_Scorecard_${session.role.replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-in fade-in zoom-in-95 duration-200 space-y-6">
      {/* Top Hero Banner */}
      <div className="m3-card-elevated p-8 text-center relative overflow-hidden border border-outline-variant/60">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#5944d1] to-[#825500] text-white flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Trophy className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary-container text-on-primary-container mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interview Simulation Complete</span>
        </div>
        <h2 className="text-3xl font-black text-on-surface tracking-tight mb-2">
          {session.role}
        </h2>
        <p className="text-xs text-on-surface-variant max-w-lg mx-auto mb-6">
          {session.seniority} • {session.difficulty} • {questions.length} Questions Evaluated
        </p>

        {/* Big Composite Verdict */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-sm flex items-center justify-between gap-4">
          <div className="text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
              Verdict
            </span>
            <div className="text-lg font-black text-on-surface">{verdict.grade}</div>
            <p className="text-xs text-on-surface-variant mt-0.5">{verdict.desc}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-primary text-on-primary flex flex-col items-center justify-center shrink-0 font-black shadow-md">
            <span className="text-xl leading-none">{session.overallScore}%</span>
            <span className="text-[9px] uppercase opacity-80 mt-0.5">Composite</span>
          </div>
        </div>
      </div>

      {/* 3 Pillar Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="m3-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Technical Knowledge
          </span>
          <div className="text-2xl font-black text-on-surface mt-1">{session.technicalScore}%</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Accuracy, depth & architectural trade-offs</p>
        </div>
        <div className="m3-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-secondary">
            Communication & STAR
          </span>
          <div className="text-2xl font-black text-on-surface mt-1">{session.communicationScore}%</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Story structure, pacing & conciseness</p>
        </div>
        <div className="m3-card p-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#825500]">
            Strategic Impact
          </span>
          <div className="text-2xl font-black text-on-surface mt-1">{session.confidenceScore}%</div>
          <p className="text-[11px] text-on-surface-variant mt-1">Ownership, metrics & executive presence</p>
        </div>
      </div>

      {/* Question by Question Review Accordion */}
      <div className="m3-card p-6 space-y-4">
        <h3 className="text-base font-bold text-on-surface flex items-center justify-between">
          <span>Question-by-Question Deep Dive</span>
          <span className="text-xs text-on-surface-variant font-normal">
            Click to expand answers & model benchmarks
          </span>
        </h3>

        <div className="space-y-3">
          {questions.map((q, idx) => {
            const isExpanded = expandedQIndex === idx;
            return (
              <div
                key={q.questionId || idx}
                className="border border-outline-variant/60 rounded-2xl overflow-hidden bg-surface-container-low/40"
              >
                <button
                  onClick={() => setExpandedQIndex(isExpanded ? null : idx)}
                  className="w-full p-4 text-left flex items-start justify-between gap-3 hover:bg-surface-container transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">Q{idx + 1}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40">
                        {q.category}
                      </span>
                      {q.status === 'evaluated' && (
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          Score: {q.technicalScore}%
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-on-surface">
                      {q.questionText}
                    </p>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant shrink-0 mt-1" />}
                </button>

                {isExpanded && (
                  <div className="p-4 border-t border-outline-variant/40 bg-surface-container-lowest space-y-3 text-xs leading-relaxed animate-in fade-in duration-150">
                    {/* Candidate Answer */}
                    <div>
                      <span className="font-bold text-on-surface block mb-1">Your Spoken / Written Answer:</span>
                      <p className="text-on-surface-variant italic bg-surface-container-low p-3 rounded-xl border border-outline-variant/30">
                        "{q.userAnswer || 'No answer recorded.'}"
                      </p>
                    </div>

                    {/* Strengths & Improvements */}
                    {q.strengths?.length ? (
                      <div>
                        <span className="font-bold text-emerald-600 block mb-1">Strengths:</span>
                        <ul className="list-disc list-inside text-on-surface-variant space-y-0.5">
                          {q.strengths.map((s, sIdx) => (
                            <li key={sIdx}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {q.improvements?.length ? (
                      <div>
                        <span className="font-bold text-amber-600 block mb-1">Areas for Growth:</span>
                        <ul className="list-disc list-inside text-on-surface-variant space-y-0.5">
                          {q.improvements.map((i, iIdx) => (
                            <li key={iIdx}>{i}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {/* Model Answer */}
                    {q.modelAnswer && (
                      <div>
                        <span className="font-bold text-primary block mb-1">High-Bar Benchmark Answer:</span>
                        <p className="text-on-surface-variant whitespace-pre-line bg-primary/5 p-3 rounded-xl border border-primary/20">
                          {q.modelAnswer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="px-4 py-2 rounded-full text-xs font-semibold border border-outline-variant hover:bg-surface-container text-on-surface flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-full text-xs font-semibold border border-outline-variant hover:bg-surface-container text-on-surface flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGoToFlashcards}
            className="px-4 py-2 rounded-full text-xs font-semibold text-primary hover:bg-surface-container transition-colors"
          >
            Review Saved Insights
          </button>
          <button
            onClick={onRestart}
            className="m3-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md hover:scale-[1.02]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Practice Another Track</span>
          </button>
        </div>
      </div>
    </div>
  );
};
