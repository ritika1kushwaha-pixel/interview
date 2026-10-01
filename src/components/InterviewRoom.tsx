import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Clock,
  Send,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Code,
  FileText,
  SkipForward,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  X,
  Play,
  Pause,
} from 'lucide-react';
import {
  EvaluationResult,
  InterviewSession,
  Question,
} from '../types/interview';
import { EvaluationCard } from './EvaluationCard';
import { requestAnswerEvaluation } from '../services/geminiClient';
import {
  saveQuestionToCloud,
  updateInterviewInCloud,
  saveFeedbackBookmark,
} from '../services/firestoreService';

interface InterviewRoomProps {
  session: InterviewSession;
  questions: Question[];
  onCompleteSession: (completedSession: InterviewSession, finalQuestions: Question[]) => void;
  onExit: () => void;
}

export const InterviewRoom: React.FC<InterviewRoomProps> = ({
  session,
  questions: initialQuestions,
  onCompleteSession,
  onExit,
}) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(session.currentQuestionIndex || 0);
  const [candidateAnswer, setCandidateAnswer] = useState('');
  const [scratchpad, setScratchpad] = useState('');
  const [activeTab, setActiveTab] = useState<'answer' | 'star' | 'scratchpad'>('answer');

  // Audio / Speech-to-Text State
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Video Preview State
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Text-To-Speech (Interviewer Voice)
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);

  // Timer State
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Evaluation State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<EvaluationResult | null>(null);

  // Exit confirmation modal
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const currentQ = questions[currentIndex] || questions[0];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let fullTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            fullTranscript += event.results[i][0].transcript + ' ';
          }
          if (fullTranscript.trim()) {
            setCandidateAnswer((prev) => {
              // Smoothly merge or append
              return fullTranscript.trim();
            });
            setSpeechError(null);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition event error:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone permission blocked. Please allow microphone access or type directly.');
            setIsRecording(false);
          } else if (event.error === 'no-speech') {
            // benign
          } else {
            setIsRecording(false);
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch (e) {
        console.warn('Failed to construct SpeechRecognition:', e);
        setSpeechSupported(false);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !currentEvaluation) {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, currentEvaluation]);

  // Clean up video stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // When question index changes
  useEffect(() => {
    setCandidateAnswer(currentQ.userAnswer || '');
    setCurrentEvaluation(null);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setSpeechError(null);
  }, [currentIndex]);

  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsInterviewerSpeaking(true);
      utterance.onend = () => setIsInterviewerSpeaking(false);
      utterance.onerror = () => setIsInterviewerSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS error:', err);
      setIsInterviewerSpeaking(false);
    }
  };

  const toggleInterviewerVoice = () => {
    if (isInterviewerSpeaking) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
      setIsInterviewerSpeaking(false);
    } else {
      speakQuestion(currentQ.questionText);
    }
  };

  const toggleSpeechRecording = () => {
    if (!speechSupported || !recognitionRef.current) {
      setSpeechError('Speech recognition is not supported in this browser. Please type your answer.');
      return;
    }

    setSpeechError(null);

    if (isRecording) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err: any) {
        console.warn('Speech recognition start failed:', err);
        // If already started, toggle off
        setIsRecording(false);
      }
    }
  };

  const toggleVideo = async () => {
    setVideoError(null);
    if (isVideoOn) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setIsVideoOn(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsVideoOn(true);
      } catch (err: any) {
        console.warn('Camera access denied or unavailable:', err);
        setVideoError('Camera access unavailable or blocked. Please check browser camera permissions.');
        setIsVideoOn(false);
      }
    }
  };

  // Re-attach video stream if videoRef re-mounts
  useEffect(() => {
    if (isVideoOn && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isVideoOn]);

  const insertSampleAnswer = () => {
    const sample = currentQ.modelAnswer
      ? `In my previous role, I addressed this directly. First, I established the baseline metrics and aligned key stakeholders around our primary SLA goals. Next, I designed a partitioned architecture with automated failover and telemetry alerting. As a direct result, we improved throughput by 42% and reduced incident response times to zero P0 outages.`
      : `To solve this challenge, I evaluated the trade-offs between speed and consistency. I implemented a modular solution with idempotent processing, which resulted in a 35% reduction in latency and saved 12 engineering hours per week.`;

    setCandidateAnswer(sample);
  };

  const handleSubmitAnswer = async () => {
    if (!candidateAnswer.trim() || isEvaluating) return;

    if (isRecording && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecording(false);
    }

    setIsEvaluating(true);
    setIsTimerRunning(false);

    try {
      const evaluation = await requestAnswerEvaluation({
        questionText: currentQ.questionText,
        category: currentQ.category,
        userAnswer: candidateAnswer,
        seniority: session.seniority,
        role: session.role,
        difficulty: session.difficulty,
      });

      setCurrentEvaluation(evaluation);

      // Update question state
      const updatedQuestion: Question = {
        ...currentQ,
        userAnswer: candidateAnswer,
        audioDurationSeconds: secondsElapsed,
        status: 'evaluated',
        technicalScore: evaluation.technicalScore,
        communicationScore: evaluation.communicationScore,
        confidenceScore: evaluation.confidenceScore,
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        modelAnswer: evaluation.modelAnswer,
        followUpQuestion: evaluation.followUpQuestion,
        updatedAt: new Date().toISOString(),
      };

      const nextQuestions = [...questions];
      nextQuestions[currentIndex] = updatedQuestion;
      setQuestions(nextQuestions);

      // Persist question
      await saveQuestionToCloud(session.interviewId, updatedQuestion);
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSkipQuestion = async () => {
    const updatedQuestion: Question = {
      ...currentQ,
      status: 'skipped',
      updatedAt: new Date().toISOString(),
    };
    const nextQuestions = [...questions];
    nextQuestions[currentIndex] = updatedQuestion;
    setQuestions(nextQuestions);

    await saveQuestionToCloud(session.interviewId, updatedQuestion);
    handleNextQuestion();
  };

  const handleNextQuestion = async () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      await updateInterviewInCloud(session.interviewId, {
        currentQuestionIndex: nextIdx,
      });
    } else {
      // Finished all questions! Compute composite scores
      const evaluated = questions.filter((q) => q.status === 'evaluated' && q.technicalScore !== undefined);
      const avgTech = evaluated.length
        ? Math.round(evaluated.reduce((acc, q) => acc + (q.technicalScore || 0), 0) / evaluated.length)
        : 75;
      const avgComm = evaluated.length
        ? Math.round(evaluated.reduce((acc, q) => acc + (q.communicationScore || 0), 0) / evaluated.length)
        : 75;
      const avgConf = evaluated.length
        ? Math.round(evaluated.reduce((acc, q) => acc + (q.confidenceScore || 0), 0) / evaluated.length)
        : 75;
      const overall = Math.round((avgTech * 0.4) + (avgComm * 0.35) + (avgConf * 0.25));

      const completedSession: InterviewSession = {
        ...session,
        status: 'completed',
        overallScore: overall,
        technicalScore: avgTech,
        communicationScore: avgComm,
        confidenceScore: avgConf,
        summaryFeedback: `Candidate completed ${evaluated.length} questions demonstrating clear competency for ${session.role}.`,
        updatedAt: new Date().toISOString(),
      };

      await updateInterviewInCloud(session.interviewId, {
        status: 'completed',
        overallScore: overall,
        technicalScore: avgTech,
        communicationScore: avgComm,
        confidenceScore: avgConf,
        summaryFeedback: completedSession.summaryFeedback,
      });

      onCompleteSession(completedSession, questions);
    }
  };

  const handleSaveBookmark = async (takeaway: string, modelAnswer: string) => {
    await saveFeedbackBookmark({
      feedbackId: `fb_${Date.now()}`,
      userId: session.userId,
      interviewId: session.interviewId,
      questionText: currentQ.questionText,
      domain: session.domain,
      keyTakeaway: takeaway,
      modelAnswer: modelAnswer,
      category: currentQ.category,
    });
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/50">
              {currentQ.category}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-on-surface flex items-center gap-2 mt-0.5">
            <span>{session.role}</span>
            <span className="text-xs font-normal text-on-surface-variant">
              ({session.seniority} • {session.difficulty})
            </span>
          </h2>
        </div>

        {/* Controls: Timer, Cam, Exit */}
        <div className="flex items-center gap-2.5">
          {/* Answer Timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-bold border transition-colors ${
              secondsElapsed > 180
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/40'
                : 'bg-surface-container text-on-surface-variant border-outline-variant/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTimer(secondsElapsed)}</span>
            <span className="text-[10px] font-sans font-normal opacity-75 hidden sm:inline">(Rec: 2-3m)</span>
          </div>

          {/* Video Toggle */}
          <button
            onClick={toggleVideo}
            title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On for Posture Practice'}
            className={`p-2 rounded-full border transition-all ${
              isVideoOn
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
            }`}
          >
            {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          {/* Exit Button */}
          <button
            onClick={() => setShowExitConfirm(true)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container border border-outline-variant/40"
          >
            Exit
          </button>
        </div>
      </div>

      {/* Camera Alert if any */}
      {videoError && (
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
          <span>{videoError}</span>
          <button onClick={() => setVideoError(null)} className="p-1 text-on-surface-variant hover:text-on-surface">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Video Self-Check Mirror Preview (if enabled) */}
      {isVideoOn && (
        <div className="relative w-52 h-36 sm:w-64 sm:h-44 rounded-2xl overflow-hidden border-2 border-primary shadow-xl bg-black mx-auto sm:ml-auto">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
          />
          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white backdrop-blur-sm">
            Mirror Feed Active
          </span>
        </div>
      )}

      {/* Interviewer Persona Card */}
      <div className="m3-card-elevated p-6 relative overflow-hidden border border-outline-variant/60">
        <div className="flex items-start gap-4">
          {/* Avatar with speaking wave */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#5944d1] to-[#006874] flex items-center justify-center text-white font-black text-lg shadow-md">
              AI
            </div>
            {isInterviewerSpeaking && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-black/80 px-2 py-0.5 rounded-full">
                <span className="w-1 bg-primary rounded-full audio-bar-1" />
                <span className="w-1 bg-primary rounded-full audio-bar-2" />
                <span className="w-1 bg-primary rounded-full audio-bar-3" />
                <span className="w-1 bg-primary rounded-full audio-bar-4" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Interviewer Question
              </span>
              <button
                onClick={toggleInterviewerVoice}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant hover:text-on-surface border border-outline-variant/40 transition-colors"
              >
                {isInterviewerSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-primary" />
                    <span>Stop Audio</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Play Audio</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-base sm:text-lg font-semibold text-on-surface leading-relaxed">
              "{currentQ.questionText}"
            </p>
          </div>
        </div>
      </div>

      {/* If evaluated, show Evaluation Card! */}
      {currentEvaluation ? (
        <EvaluationCard
          question={currentQ}
          evaluation={currentEvaluation}
          onNext={handleNextQuestion}
          onSaveBookmark={handleSaveBookmark}
          isLastQuestion={currentIndex === questions.length - 1}
        />
      ) : (
        /* Candidate Answer Workspace */
        <div className="m3-card p-6 space-y-4">
          {/* Workspace Tabs: Answer, STAR Coach, Scratchpad */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-outline-variant/40 pb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('answer')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'answer'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Your Answer</span>
              </button>
              <button
                onClick={() => setActiveTab('star')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'star'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>STAR Prompt Guide</span>
              </button>
              <button
                onClick={() => setActiveTab('scratchpad')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  activeTab === 'scratchpad'
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Technical Scratchpad</span>
              </button>
            </div>

            {/* Voice Dictation Status */}
            <div className="flex items-center gap-2">
              <button
                onClick={insertSampleAnswer}
                className="px-2.5 py-1 rounded-full text-xs font-medium text-primary hover:bg-primary-container/30 border border-primary/30 transition-colors"
                title="Paste a sample answer to test evaluation quickly"
              >
                + Try Sample Answer
              </button>
              {speechSupported && (
                <button
                  onClick={toggleSpeechRecording}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border transition-all ${
                    isRecording
                      ? 'bg-red-500 text-white border-red-600 animate-pulse shadow-md shadow-red-500/20'
                      : 'bg-surface-container text-primary border-outline-variant hover:bg-primary-container/40'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'Listening (Speak now)' : 'Speak Answer'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Speech Error Banner if any */}
          {speechError && (
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
              <span>{speechError}</span>
              <button onClick={() => setSpeechError(null)} className="p-1 text-on-surface-variant hover:text-on-surface">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: Answer Editor */}
          {activeTab === 'answer' && (
            <div>
              <textarea
                rows={6}
                value={candidateAnswer}
                onChange={(e) => setCandidateAnswer(e.target.value)}
                placeholder="Speak your answer using the microphone or type here... Aim to structure your response with concrete examples and quantifiable impact."
                className="w-full text-sm p-4 rounded-2xl border border-outline-variant bg-surface text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed resize-y font-sans"
              />
              <div className="flex items-center justify-between text-[11px] text-on-surface-variant mt-2 px-1">
                <span>
                  Word count: {candidateAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </span>
                <span className="italic">
                  {candidateAnswer.trim().split(/\s+/).filter(Boolean).length < 25
                    ? 'Tip: Provide sufficient detail for a comprehensive evaluation score.'
                    : 'Great length. Ready for precision AI review.'}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: STAR Framework Helper */}
          {activeTab === 'star' && currentQ.hintSTAR && (
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-3 animate-in fade-in duration-150">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Recommended STAR Framework Structure
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <span className="font-bold text-primary block mb-0.5">S • Situation</span>
                  <p className="text-on-surface-variant">{currentQ.hintSTAR.situation}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <span className="font-bold text-secondary block mb-0.5">T • Task</span>
                  <p className="text-on-surface-variant">{currentQ.hintSTAR.task}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <span className="font-bold text-[#825500] block mb-0.5">A • Action</span>
                  <p className="text-on-surface-variant">{currentQ.hintSTAR.action}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/40">
                  <span className="font-bold text-emerald-600 block mb-0.5">R • Result</span>
                  <p className="text-on-surface-variant">{currentQ.hintSTAR.result}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Technical Scratchpad */}
          {activeTab === 'scratchpad' && (
            <div className="space-y-2 animate-in fade-in duration-150">
              <textarea
                rows={5}
                value={scratchpad}
                onChange={(e) => setScratchpad(e.target.value)}
                placeholder="// Code scratchpad, API signature drafts, or system design notes..."
                className="w-full text-xs font-mono p-3 rounded-2xl border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:border-primary"
              />
              <span className="text-[10px] text-on-surface-variant block">
                Use this scratchpad for pseudo-code or architectural outlines.
              </span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-outline-variant/40">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCandidateAnswer('')}
                disabled={!candidateAnswer}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:bg-surface-container disabled:opacity-40 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Clear
              </button>
              <button
                type="button"
                onClick={handleSkipQuestion}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-on-surface-variant hover:bg-surface-container flex items-center gap-1"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Skip Question
              </button>
            </div>

            <button
              onClick={handleSubmitAnswer}
              disabled={!candidateAnswer.trim() || isEvaluating}
              className="m3-btn-primary px-6 py-2.5 text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 hover:scale-[1.02] cursor-pointer"
            >
              {isEvaluating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Evaluating Technical Depth & STAR...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Answer for Evaluation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-on-surface">Leave Interview Session?</h3>
            <p className="text-xs text-on-surface-variant">
              Your answered questions and progress will remain saved in your history. You can return anytime.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowExitConfirm(false)}
                className="px-4 py-2 rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
              >
                Resume
              </button>
              <button
                onClick={() => {
                  setShowExitConfirm(false);
                  onExit();
                }}
                className="px-5 py-2 rounded-full text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-sm"
              >
                Leave Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
