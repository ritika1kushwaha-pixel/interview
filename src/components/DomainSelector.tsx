import React, { useState } from 'react';
import {
  Code2,
  BrainCircuit,
  Briefcase,
  TrendingUp,
  Megaphone,
  Handshake,
  Activity,
  Users,
  Award,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Building,
} from 'lucide-react';
import { DOMAINS } from '../data/questionBanks';
import { DomainMeta } from '../types/interview';

interface DomainSelectorProps {
  onSelectDomain: (domain: DomainMeta | CustomDomainMeta) => void;
}

export interface CustomDomainMeta {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: string;
  roles: string[];
  exampleQuestions: string[];
  targetCompany?: string;
  isCustom: true;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Code2,
  BrainCircuit,
  Briefcase,
  TrendingUp,
  Megaphone,
  Handshake,
  Activity,
  Users,
  Award,
};

export const DomainSelector: React.FC<DomainSelectorProps> = ({ onSelectDomain }) => {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customDomainName, setCustomDomainName] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [customFocus, setCustomFocus] = useState('');

  const handleLaunchCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRole.trim()) return;

    const custom: CustomDomainMeta = {
      id: `custom_${Date.now()}`,
      name: customDomainName.trim() || `${customRole} Assessment`,
      badge: customCompany.trim() ? customCompany : 'Custom Field',
      description: customFocus.trim() || `Tailored mock interview for ${customRole}`,
      icon: 'Briefcase',
      roles: [customRole.trim()],
      exampleQuestions: [
        `Walk through your philosophy and execution model as a ${customRole}.`,
        `Describe a key challenge you solved in this domain.`,
      ],
      targetCompany: customCompany.trim(),
      isCustom: true,
    };

    onSelectDomain(custom);
    setShowCustomModal(false);
  };

  return (
    <div className="py-6">
      {/* Hero Title */}
      <div className="text-center max-w-3xl mx-auto mb-10 px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-container text-on-primary-container mb-3 border border-primary/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Every Field & Specialty • Precise AI Rubrics</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight mb-4">
          Master Any Interview With{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#825500]">
            Precision Feedback
          </span>
        </h1>
        <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Simulate realistic hiring loops with voice dictation, speech playback, and multi-dimensional scoring across technical depth, communication, and executive impact.
        </p>
      </div>

      {/* Grid of Domains */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-7xl mx-auto px-4 sm:px-6">
        {DOMAINS.map((domain) => {
          const IconComponent = ICON_MAP[domain.icon] || Briefcase;
          return (
            <div
              key={domain.id}
              className="m3-card group p-6 flex flex-col justify-between hover:border-primary/60 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
              onClick={() => onSelectDomain(domain)}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none group-hover:scale-125 transition-transform" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-primary border border-outline-variant/60 group-hover:bg-primary group-hover:text-on-primary transition-colors">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant border border-outline-variant/40">
                    {domain.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {domain.name}
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 line-clamp-2 leading-relaxed">
                  {domain.description}
                </p>

                {/* Popular Roles Chips */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80 mb-2">
                    Popular Roles:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {domain.roles.slice(0, 3).map((role, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-surface-container text-on-surface-variant border border-outline-variant/40"
                      >
                        {role}
                      </span>
                    ))}
                    {domain.roles.length > 3 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md text-on-surface-variant/70">
                        +{domain.roles.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action trigger */}
              <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-semibold text-primary">
                <span>Start Mock Interview</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}

        {/* Custom Field Card */}
        <div
          onClick={() => setShowCustomModal(true)}
          className="m3-card p-6 flex flex-col justify-between border-dashed border-2 border-primary/40 bg-surface-container-low/50 hover:bg-surface-container-low hover:border-primary cursor-pointer group transition-all"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-on-surface mb-2 group-hover:text-primary transition-colors">
              Custom Field & Dream Company
            </h3>
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
              Targeting a niche specialization or specific company (Google, McKinsey, Goldman Sachs, Tesla, Startups)? Tailor exact questions and rubrics on the fly.
            </p>
          </div>

          <div className="pt-3 border-t border-outline-variant/40 flex items-center justify-between text-xs font-semibold text-primary">
            <span>Configure Custom Role</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Custom Field Builder Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <h3 className="text-xl font-bold text-on-surface mb-1 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Build Custom Interview Track
            </h3>
            <p className="text-xs text-on-surface-variant mb-5">
              Specify your target job title, company, and focus areas to generate hyper-realistic questions.
            </p>

            <form onSubmit={handleLaunchCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Target Job Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Staff iOS Engineer, Biotech Regulatory Affairs, Private Equity Associate"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Target Company / Organization (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Google, Apple, McKinsey, OpenAI, Stripe, NHS"
                  value={customCompany}
                  onChange={(e) => setCustomCompany(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Domain / Category Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Enterprise Software, Deep Tech, FinTech"
                  value={customDomainName}
                  onChange={(e) => setCustomDomainName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Key Focus Areas & Skills (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Distributed Consensus, Swift Concurrency, FDA compliance, LBO modeling"
                  value={customFocus}
                  onChange={(e) => setCustomFocus(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-outline-variant/40">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 rounded-full text-xs font-medium text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!customRole.trim()}
                  className="m3-btn-primary px-5 py-2 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span>Continue to Setup</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
