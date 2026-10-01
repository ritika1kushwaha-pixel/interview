export type SeniorityLevel =
  | 'Entry-Level'
  | 'Mid-Level'
  | 'Senior'
  | 'Lead / Staff'
  | 'Executive';

export type DifficultyLevel =
  | 'Friendly'
  | 'Standard'
  | 'Challenging'
  | 'Brutal FAANG';

export type InterviewType =
  | 'Technical & Knowledge'
  | 'Behavioral & STAR'
  | 'System Design & Architecture'
  | 'Case Study & Strategy'
  | 'Comprehensive Hybrid';

export interface QuestionHintSTAR {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface Question {
  questionId: string;
  interviewId: string;
  userId: string;
  order: number;
  questionText: string;
  category: string;
  hintSTAR?: QuestionHintSTAR;
  userAnswer?: string;
  audioDurationSeconds?: number;
  status: 'pending' | 'answered' | 'evaluated' | 'skipped';
  technicalScore?: number;
  communicationScore?: number;
  confidenceScore?: number;
  strengths?: string[];
  improvements?: string[];
  modelAnswer?: string;
  followUpQuestion?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewSession {
  interviewId: string;
  userId: string;
  title: string;
  domain: string;
  role: string;
  seniority: SeniorityLevel;
  difficulty: DifficultyLevel;
  interviewType: InterviewType;
  status: 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;
  totalQuestions: number;
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  summaryFeedback: string;
  questions?: Question[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedFeedbackItem {
  feedbackId: string;
  userId: string;
  interviewId: string;
  questionText: string;
  domain: string;
  keyTakeaway: string;
  modelAnswer: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationResult {
  technicalScore: number;
  communicationScore: number;
  confidenceScore: number;
  overallScore: number;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followUpQuestion: string;
  summaryFeedback: string;
}

export interface DomainMeta {
  id: string;
  name: string;
  badge: string;
  description: string;
  icon: string;
  roles: string[];
  exampleQuestions: string[];
}

export interface UserProfileData {
  userId: string;
  email: string;
  displayName: string;
  targetRole: string;
  targetDomain: string;
  seniority: string;
  totalInterviews: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}
