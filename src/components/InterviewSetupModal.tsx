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
  Check,
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
    badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    level: 'Standard',
    icon: Zap,
    description: 'Realistic hiring manager pace. Balanced depth and follow-ups.',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  },
  {
    level: 'Challenging',
    icon: Flame,
    description: 'Rigorous bar-raiser questions probing edge cases and scale.',
    badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
  },
  {
    level: 'Brutal FAANG',
    icon: ShieldAlert,
    description: 'Extreme pressure, deep technical scrutiny, and zero hand-holding.',
    badgeColor: 'text-rose-500 bg-rose-500/10 border-rose-500/30',
  },
];

const INTERVIEW_TYPES: { type: InterviewType; desc: string }[] = [
  {
    type: 'Technical & Knowledge',
    desc: 'Core fundamentals, deep technical reasoning, and domain edge cases.',
  },
  {
    type: 'Behavioral & STAR',
    desc: 'Structured STAR stories, leadership principles, conflict, and ownership.',
  },
  {
    type: 'System Design & Architecture',
    desc: 'High-level architectures, scaling tradeoffs, APIs, and data modeling.',
  },
  {
    type: 'Case Study & Strategy',
    desc: 'Real-world business dilemmas, metric drops, and strategic prioritization.',
  },
  {
    type: 'Comprehensive Hybrid',
    desc: 'A balanced blend of technical knowledge and behavioral scenarios.',
  },
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

  const handleLaunch = () => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Sticky Header */}
        <div className="px-6 py-5 border-b border-outline-variant/50 flex items-start justify-between bg-surface-container-lowest shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1 text-primary">
              <Sliders className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Session Configuration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-on-surface">
              {domain.name}
            </h2>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Customize your interviewer persona, difficulty, and competency rubric.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isStarting}
            className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close configuration"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6">
          {/* Section 1: Target Role Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2.5">
              1. Select Specific Job Role
            </label>
            <div className="flex flex-wrap gap-2">
              {domain.roles.map((role) => {
                const isSelected = !isCustomRoleInput && selectedRole === role;
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsCustomRoleInput(false);
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary shadow-sm scale-[1.02]'
                        : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:border-primary/60 hover:bg-surface-container'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    <span>{role}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setIsCustomRoleInput(true)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isCustomRoleInput
                    ? 'bg-primary text-on-primary border-primary shadow-sm scale-[1.02]'
                    : 'bg-surface-container-low text-on-surface border-outline-variant/60 hover:border-primary/60 hover:bg-surface-container'
                }`}
              >
                {isCustomRoleInput && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>+ Custom Title</span>
              </button>
            </div>

            {isCustomRoleInput && (
              <div className="mt-3 animate-in fade-in duration-150">
                <input
                  type="text"
                  placeholder="Type your target role title (e.g., Staff iOS Architect)..."
                  value={customRoleText}
                  onChange={(e) => setCustomRoleText(e.target.value)}
                  autoFocus
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-primary bg-surface text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>
            )}
          </div>

          {/* Section 2: Seniority Level */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2.5">
              2. Candidate Seniority Tier
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {SENIORITIES.map((tier) => {
                const isSelected = seniority === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSeniority(tier)}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary font-bold shadow-sm scale-[1.02]'
                        : 'border-outline-variant/60 bg-surface-container-low text-on-surface hover:border-primary/50 hover:bg-surface-container'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    <span>{tier}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Interview Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2.5">
              3. Interview Evaluation Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {INTERVIEW_TYPES.map(({ type, desc }) => {
                const isSelected = interviewType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setInterviewType(type)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-primary bg-primary/10 shadow-sm ring-1 ring-primary/50'
                        : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                        {type}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-relaxed">{desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Difficulty Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2.5">
              4. Interviewer Persona & Difficulty
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DIFFICULTIES.map(({ level, icon: Icon, description, badgeColor }) => {
                const isSelected = difficulty === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-2 border-primary bg-primary/10 shadow-sm ring-1 ring-primary/50'
                        : 'border-outline-variant/60 bg-surface-container-lowest hover:border-primary/50 hover:bg-surface-container-low'
                    }`}
                  >
                    <div className={`p-2 rounded-xl border shrink-0 ${badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                          {level}
                        </span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </div>
                      <span className="text-[11px] text-on-surface-variant leading-relaxed block">
                        {description}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Question Set Size */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-on-surface mb-2.5">
              5. Question Set Size
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { count: 3, label: '3 Questions', desc: 'Fast (~10 mins)' },
                { count: 5, label: '5 Questions', desc: 'Standard (~20 mins)' },
                { count: 8, label: '8 Questions', desc: 'Full Loop (~35 mins)' },
              ].map(({ count, label, desc }) => {
                const isSelected = questionCount === count;
                return (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-on-primary border-primary font-bold shadow-sm scale-[1.02]'
                        : 'border-outline-variant/60 bg-surface-container-low text-on-surface hover:border-primary/50 hover:bg-surface-container'
                    }`}
                  >
                    <div className="text-xs font-bold">{label}</div>
                    <div className={`text-[10px] ${isSelected ? 'opacity-90' : 'text-on-surface-variant'}`}>
                      {desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sticky Action Footer - ALWAYS VISIBLE */}
        <div className="px-6 py-4 border-t border-outline-variant/50 bg-surface-container-lowest flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-on-surface-variant flex items-center gap-2 truncate">
            <span className="font-bold text-on-surface">{effectiveRole}</span>
            <span>•</span>
            <span>{seniority}</span>
            <span>•</span>
            <span className="text-primary font-semibold">{questionCount} Qs</span>
          </div>

          <div className="flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isStarting}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleLaunch}
              disabled={isStarting || !effectiveRole}
              className="m3-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 hover:scale-[1.02] cursor-pointer"
            >
              {isStarting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Track...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Enter Mock Interview Room</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
