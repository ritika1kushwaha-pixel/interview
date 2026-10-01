import { PREBUILT_QUESTIONS_BY_DOMAIN } from '../data/questionBanks';
import {
  DifficultyLevel,
  EvaluationResult,
  InterviewType,
  Question,
  SeniorityLevel,
} from '../types/interview';

export async function requestInterviewQuestions(params: {
  domain: string;
  role: string;
  seniority: SeniorityLevel;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
  count: number;
  interviewId: string;
  userId: string;
}): Promise<Question[]> {
  try {
    const res = await fetch('/api/interview/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        return data.questions.map((q: any, idx: number) => ({
          questionId: `q_${Date.now()}_${idx}`,
          interviewId: params.interviewId,
          userId: params.userId,
          order: idx,
          questionText: q.questionText,
          category: q.category || 'Domain Competency',
          hintSTAR: q.hintSTAR || {
            situation: 'Contextualize the challenge and scale.',
            task: 'Define your ownership and the desired goal.',
            action: 'Detail the concrete decisions and execution.',
            result: 'Quantify the outcome and key learnings.',
          },
          modelAnswer: q.modelAnswer || '',
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
      }
    }
  } catch (err) {
    console.warn('Network issue calling question generation, using curated bank:', err);
  }

  // Fallback: Use curated domain bank + dynamic generation
  const domainQuestions = PREBUILT_QUESTIONS_BY_DOMAIN[params.domain] || PREBUILT_QUESTIONS_BY_DOMAIN['tech'];
  const pool = [...domainQuestions];

  // If needed, generate custom questions based on role
  while (pool.length < params.count) {
    pool.push({
      questionText: `As a ${params.seniority} ${params.role}, how do you ensure high performance, reliability, and clear cross-functional alignment under tight deadlines?`,
      category: 'Execution & Leadership',
      difficulty: params.difficulty,
      seniority: params.seniority,
      type: params.interviewType,
      hintSTAR: {
        situation: `Think of a high-stakes project for a ${params.role}.`,
        task: 'Identify the key bottlenecks and competing stakeholder demands.',
        action: 'Describe how you prioritized tradeoffs, established metrics, and unblocked the team.',
        result: 'Conclude with quantifiable results and customer satisfaction.',
      },
      modelAnswer: `In my role as ${params.role}, I anchor execution on three tenets: rigorous prioritization using impact vs effort matrices, aggressive decoupling of critical-path dependencies, and real-time observability dashboards to detect bottlenecks early. During our last major delivery, this discipline enabled us to hit our release date 1 week early with zero P0 incidents.`,
    });
  }

  const selected = pool.slice(0, params.count);
  return selected.map((q, idx) => ({
    questionId: `q_${Date.now()}_${idx}`,
    interviewId: params.interviewId,
    userId: params.userId,
    order: idx,
    questionText: q.questionText,
    category: q.category,
    hintSTAR: q.hintSTAR,
    modelAnswer: q.modelAnswer,
    status: 'pending' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));
}

export async function requestAnswerEvaluation(params: {
  questionText: string;
  category: string;
  userAnswer: string;
  seniority: SeniorityLevel;
  role: string;
  difficulty: DifficultyLevel;
}): Promise<EvaluationResult> {
  try {
    const res = await fetch('/api/interview/evaluate-answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.useFallback && typeof data.overallScore === 'number') {
        return {
          technicalScore: Math.min(100, Math.max(0, data.technicalScore)),
          communicationScore: Math.min(100, Math.max(0, data.communicationScore)),
          confidenceScore: Math.min(100, Math.max(0, data.confidenceScore)),
          overallScore: Math.min(100, Math.max(0, data.overallScore)),
          strengths: Array.isArray(data.strengths) ? data.strengths : ['Clear articulation of core concepts'],
          improvements: Array.isArray(data.improvements) ? data.improvements : ['Provide more quantified business metrics'],
          modelAnswer: data.modelAnswer || 'Exemplary structured response demonstrating leadership and technical depth.',
          followUpQuestion: data.followUpQuestion || 'How would you scale this approach if user volume increased 10x?',
          summaryFeedback: data.summaryFeedback || 'Solid answer with good fundamentals. Focus on adding quantifiable metrics to elevate to top tier.',
        };
      }
    }
  } catch (err) {
    console.warn('Network issue calling evaluation, using precision heuristic evaluator:', err);
  }

  // Precision Heuristic Evaluator fallback
  const text = params.userAnswer.trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  const hasMetrics = /\b(\d+%|\$\d+|\d+x|\d+ms|\d+k|\d+M|\bzero\b)\b/i.test(text);
  const hasSTAR = /\b(situation|task|action|result|because|therefore|resolved|impact|launched|led)\b/i.test(text);
  const hasTechDepth = /\b(architecture|latency|throughput|scale|pipeline|tradeoff|consistency|security|optimized)\b/i.test(text);

  let technical = 70;
  let communication = 70;
  let confidence = 72;

  if (wordCount > 60) {
    technical += 10;
    communication += 8;
  }
  if (wordCount > 140) {
    technical += 6;
    communication += 8;
  }
  if (hasMetrics) {
    confidence += 10;
    communication += 6;
  }
  if (hasSTAR) {
    communication += 10;
  }
  if (hasTechDepth) {
    technical += 8;
  }

  if (wordCount < 25) {
    technical = Math.max(45, technical - 25);
    communication = Math.max(45, communication - 25);
    confidence = Math.max(45, confidence - 20);
  }

  const overall = Math.round((technical * 0.4) + (communication * 0.35) + (confidence * 0.25));

  const strengths: string[] = [];
  if (wordCount > 50) strengths.push('Good explanation with structured flow and clear pacing.');
  if (hasTechDepth) strengths.push('Effective use of domain terminology and architectural reasoning.');
  if (hasMetrics) strengths.push('Strong inclusion of quantifiable business impact or scale metrics.');
  if (strengths.length === 0) strengths.push('Addressed the prompt directly with direct intent.');

  const improvements: string[] = [];
  if (!hasMetrics) improvements.push('Ground your results in concrete metrics (e.g., % latency drop, revenue gain, team hours saved).');
  if (wordCount < 70) improvements.push('Expand on the specific execution actions you personally took rather than general statements.');
  if (!hasSTAR) improvements.push('Structure your answer more clearly using the STAR method: Situation, Task, Action, and Result.');

  return {
    technicalScore: Math.min(98, technical),
    communicationScore: Math.min(98, communication),
    confidenceScore: Math.min(98, confidence),
    overallScore: Math.min(98, overall),
    strengths,
    improvements,
    modelAnswer: `An ideal response for ${params.role} addresses the core premise immediately, articulates explicit constraints, walks through 2-3 evaluated tradeoffs with rationale, and concludes with verified outcomes and key learnings.`,
    followUpQuestion: `What were the biggest risks or edge cases in your approach, and how did you monitor for regressions?`,
    summaryFeedback: overall >= 85
      ? 'Outstanding performance. High technical rigor and crisp communication that commands authority.'
      : 'Solid baseline answer. Deepen your examples with concrete business metrics and explicit tradeoff explanations.',
  };
}
