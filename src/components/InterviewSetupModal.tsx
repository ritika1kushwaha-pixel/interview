import React, { useState } from 'react';
import {
  X,
  Play,
  Sliders,
  CheckCircle2,
  Sparkles,
  Zap,
  Flame,
  Coffee,
  ShieldAlert,
} from 'lucide-react';
import {
  DifficultyLevel,
  DomainMeta,
  InterviewType,
  SeniorityLevel,
} from '../types/interview';
import { CustomDomainMeta } from './DomainSelector';

interface InterviewSetupModalProps {
  domain: DomainMeta | CustomDomainMeta;
  onClose: () => void;
  onStart: (config: {
    domainId: string;
    domainName: string;
    role: string;
    seniority: SeniorityLevel;
    difficulty: DifficultyLevel;
    interviewType: InterviewType;
    questionCount: number;
  }) => void;
  isStarting: boolean;
}

const SENIORITIES: SeniorityLevel[] = [
  'Entry-Level',
  'Mid-Level',
  'Senior',
  'Lead / Staff',
  'Executive',
];

const DIFFICULTIES: {
  level: DifficultyLevel;
  icon: React.ElementType;
  description: string;
  badgeColor: string;
}[] = [
  {
    level: 'Friendly',
    icon: Coffee,
    description: 'Supportive, encouraging interviewer. Great for warm-ups.',
    badgeColor: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    level: 'Standard',
    icon: Zap,
    description: 'Realistic hiring manager pace. Balanced depth and follow-ups.',
    badgeColor: 'text-indigo-600 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    level: 'Challenging',
    icon: Flame,
    description: 'Rigorous bar-raiser questions probing edge cases and scale.',
    badgeColor: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  },
  {
    level: 'Brutal FAANG',
    icon: ShieldAlert,
    description: 'Extreme pressure, deep technical scrutiny, and zero hand-holding.',
    badgeColor: 'text-red-600 bg-red-500/10 border-red-500/30',
  },
];

const INTERVIEW_TYPES: { type: InterviewType; desc: string }[] = [
  { type: 'Technical & Knowledge', desc: 'Core fundamentals, deep technical reasoning, and domain edge cases.' },
  { type: 'Behavioral & STAR', desc: 'Structured STAR stories, leadership principles, conflict, and ownership.' },
  { type: 'System Design & Architecture', desc: 'High-level architectures, scaling tradeoffs, APIs, and data modeling.' },
  { type: 'Case Study & Strategy', desc: 'Real-world business dilemmas, metric drops, and strategic prioritization.' },
  { type: 'Comprehensive Hybrid', desc: 'A balanced blend of technical knowledge and behavioral scenarios.' },
];

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  domain,
  onClose,
  onStart,
  isStarting,
}) => {
  const [selectedRole, setSelectedRole] = useState(domain.roles[0] || 'Specialist');
  const [isCustomRoleInput, setIsCustomRoleInput] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');
  const [seniority, setSeniority] = useState<SeniorityLevel>('Mid-Level');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Standard');
  const [interviewType, setInterviewType] = useState<InterviewType>('Technical & Knowledge');
  const [questionCount, setQuestionCount] = useState<number>(3);

  const effectiveRole = isCustomRoleInput && customRoleText.trim() ? customRoleText.trim() : selectedRole;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({
      domainId: domain.id,
      domainName: domain.name,
      role: effectiveRole,
      seniority,
      difficulty,
      interviewType,
      questionCount,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isStarting}
          className="absolute top-5 right-5 p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1 text-primary">
          <Sliders className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">Session Configuration</span>
        </div>
        <h2 className="text-2xl font-bold text-on-surface mb-1">
          {domain.name}
        </h2>
        <p className="text-xs text-on-surface-variant mb-6">
          Customize your interviewer persona, difficulty, and competency rubric.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Role Selection */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-2">
              Select Specific Job Role
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {domain.roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    setSelectedRole(role);
                    setIsCustomRoleInput(false);
                  }}
                  className={`m3-chip text-xs ${
                    !isCustomRoleInput && selectedRole === role ? 'm3-chip-selected' : ''
                  }`}
                >
                  {!isCustomRoleInput && selectedRole === role && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                  )}
                  {role}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setIsCustomRoleInput(true)}
                className={`m3-chip text-xs ${isCustomRoleInput ? 'm3-chip-selected' : ''}`}
              >
                {isCustomRoleInput && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                + Custom Title
              </button>
            </div>

            {isCustomRoleInput && (
              <input
                type="text"
                required
                placeholder="Type your exact job title..."
                value={customRoleText}
                onChange={(e) => setCustomRoleText(e.target.value)}
                className="w-full mt-2 text-xs px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary"
              />
            )}
          </div>

          {/* Seniority Level */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-2">
              Candidate Seniority Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SENIORITIES.map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSeniority(tier)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-semibold border transition-all text-center ${
                    seniority === tier
                      ? 'bg-primary-container text-on-primary-container border-primary font-bold shadow-sm'
                      : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant hover:border-outline-variant'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-2">
              Interview Evaluation Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {INTERVIEW_TYPES.map(({ type, desc }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setInterviewType(type)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    interviewType === type
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-on-surface">{type}</span>
                    {interviewType === type && <CheckCircle2 className="w-3.5 h-3.5 text-primary" />}
                  </div>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">{desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-2">
              Interviewer Persona & Difficulty
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DIFFICULTIES.map(({ level, icon: Icon, description, badgeColor }) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setDifficulty(level)}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-3 ${
                    difficulty === level
                      ? 'border-primary bg-primary-container/20 ring-1 ring-primary'
                      : 'border-outline-variant/50 bg-surface-container-lowest hover:border-outline-variant'
                  }`}
                >
                  <div className={`p-2 rounded-xl border ${badgeColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-on-surface block mb-0.5">{level}</span>
                    <span className="text-[11px] text-on-surface-variant leading-relaxed">
                      {description}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div>
            <label className="block text-xs font-bold text-on-surface mb-2">
              Question Set Size
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { count: 3, label: '3 Questions', desc: 'Fast (~10 mins)' },
                { count: 5, label: '5 Questions', desc: 'Standard (~20 mins)' },
                { count: 8, label: '8 Questions', desc: 'Full Loop (~35 mins)' },
              ].map(({ count, label, desc }) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setQuestionCount(count)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    questionCount === count
                      ? 'bg-primary-container text-on-primary-container border-primary font-bold'
                      : 'border-outline-variant/60 bg-surface-container-low text-on-surface-variant'
                  }`}
                >
                  <div className="text-xs font-bold">{label}</div>
                  <div className="text-[10px] opacity-75">{desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-outline-variant/40">
            <button
              type="button"
              onClick={onClose}
              disabled={isStarting}
              className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isStarting}
              className="m3-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
            >
              {isStarting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Interview Track...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Enter Mock Interview Room</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
