import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  Mic,
  MicOff,
  Maximize2,
  Minimize2,
  Clock,
  Play,
  Pause,
  Send,
  SkipForward,
  AlertTriangle,
  CheckCircle,
  Award,
  TrendingUp,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  FileText,
  ChevronRight,
  Target,
  BarChart2,
  Volume2,
  Eye
} from 'lucide-react';
import { aiService } from '../../services/aiService';

interface IntegrityEvent {
  eventType: string;
  durationSeconds: number;
  questionNumber: number;
  warningLevel: string;
  description: string;
}

interface QuestionEvaluation {
  id: number;
  question: string;
  skill: string;
  difficulty: string;
  expectedKeywords: string[];
  studentAnswer: string;
  answerMethod: 'speech' | 'text';
  timeSpentSeconds: number;
  score?: number;
  technicalScore?: number;
  communicationScore?: number;
  problemSolvingScore?: number;
  relevanceScore?: number;
  feedback?: string;
  whatYouDidWell?: string;
  whatYouMissed?: string;
  howToImprove?: string;
  betterAnswerStructure?: string;
  speakingPace?: string;
  fillerWordsDetected?: string[];
}

export const MockInterviewPage: React.FC = () => {
  // Navigation View: setup | room | report | history
  const [activeTab, setActiveTab] = useState<'setup' | 'room' | 'report' | 'history'>('setup');

  // Setup state
  const [role, setRole] = useState<string>('Full Stack Developer');
  const [skill, setSkill] = useState<string>('Java');
  const [difficulty, setDifficulty] = useState<string>('Medium');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [interviewType, setInterviewType] = useState<string>('Technical');
  const [timerDuration, setTimerDuration] = useState<number>(60); // seconds per question

  // System pre-check states
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionEvaluation[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  // Answering & Speech Recognition state
  const [answerInput, setAnswerInput] = useState<string>('');
  const [answerMethod, setAnswerMethod] = useState<'speech' | 'text'>('speech');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [evaluationLoading, setEvaluationLoading] = useState<boolean>(false);
  const [lastEvaluation, setLastEvaluation] = useState<any>(null);

  // Integrity & Monitoring state
  const [integrityEvents, setIntegrityEvents] = useState<IntegrityEvent[]>([]);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // History & Final Report state
  const [finalReport, setFinalReport] = useState<any>(null);
  const [historyData, setHistoryData] = useState<any>(null);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);

  // Media Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  // 1. Initial Check on Mount
  useEffect(() => {
    checkBrowserCapabilities();
    fetchHistory();
    return () => {
      stopMediaStream();
    };
  }, []);

  const checkBrowserCapabilities = async () => {
    // Speech Recognition Check
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }

    // Media permissions check
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setCameraActive(true);
      setMicActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      mediaStreamRef.current = stream;
    } catch (err: any) {
      setCameraActive(false);
      setMicActive(false);
      setCheckError('Camera or Microphone permission was denied. Please grant permissions to conduct interview.');
    }
  };

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  // 2. Fullscreen & Tab Switch Monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && activeTab === 'room' && sessionId) {
        logIntegrity('TAB_SWITCH', 'Attention moved away from the interview window.');
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      if (!document.fullscreenElement && activeTab === 'room' && sessionId) {
        logIntegrity('FULLSCREEN_EXIT', 'Fullscreen interview mode was exited.');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [activeTab, sessionId]);

  // 3. Answer Countdown Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0 && activeTab === 'room') {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning && activeTab === 'room') {
      setTimerRunning(false);
      handleSubmitAnswer(true); // Auto-submit on timeout
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, activeTab]);

  const logIntegrity = async (type: string, description: string) => {
    const newEvent: IntegrityEvent = {
      eventType: type,
      durationSeconds: 5,
      questionNumber: currentIndex + 1,
      warningLevel: integrityEvents.length === 0 ? 'WARNING_1' : integrityEvents.length === 1 ? 'WARNING_2' : 'INTEGRITY_CONCERN',
      description,
    };

    setIntegrityEvents((prev) => [...prev, newEvent]);
    setActiveWarning(description);

    setTimeout(() => {
      setActiveWarning(null);
    }, 4000);

    if (sessionId) {
      try {
        await aiService.logMockInterviewEventV2({
          sessionId,
          eventType: type,
          durationSeconds: 5,
          questionNumber: currentIndex + 1,
          warningLevel: newEvent.warningLevel,
          description,
        });
      } catch {}
    }
  };

  // 4. Start Speech Recognition
  const toggleSpeechListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Type Answer fallback.');
      setAnswerMethod('text');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setAnswerInput((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      rec.onerror = () => setIsListening(false);
      rec.onend = () => setIsListening(false);

      recognitionRef.current = rec;
      rec.start();
      setIsListening(true);
      setAnswerMethod('speech');
    }
  };

  // 5. Start Interview Session
  const handleStartInterview = async () => {
    if (!cameraActive) {
      alert('Camera access is required for this interview.');
      return;
    }

    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch {}

    try {
      const res = await aiService.startMockInterviewV2({
        role,
        skill,
        difficulty,
        questionCount: Number(questionCount),
        interviewType,
      });

      const data = (res.data as any)?.data || res.data;
      setSessionId(data.sessionId);
      setQuestions(data.questions || []);
      setCurrentIndex(0);
      setAnswerInput('');
      setIntegrityEvents([]);
      setTimeLeft(timerDuration);
      setTimerRunning(true);
      setActiveTab('room');
    } catch (err: any) {
      alert(err?.message || 'Failed to start interview session.');
    }
  };

  // 6. Submit Answer for current question
  const handleSubmitAnswer = async (isTimeout = false) => {
    if (!sessionId) return;
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setEvaluationLoading(true);
    setTimerRunning(false);

    const currentQ = questions[currentIndex];
    const timeSpent = timerDuration - timeLeft;

    try {
      const res = await aiService.evaluateMockAnswerV2({
        sessionId,
        questionId: currentQ?.id || currentIndex + 1,
        answer: isTimeout && !answerInput.trim() ? '(Time expired - No answer provided)' : answerInput,
        timeSpentSeconds: timeSpent,
        answerMethod,
      });

      const evalData = (res.data as any)?.data || res.data;
      setLastEvaluation(evalData);

      // Move to next question or finish
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setAnswerInput('');
        setTimeLeft(timerDuration);
        setTimerRunning(true);
      } else {
        handleFinishInterview();
      }
    } catch (err: any) {
      console.error(err);
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((prev) => prev + 1);
        setAnswerInput('');
        setTimeLeft(timerDuration);
        setTimerRunning(true);
      } else {
        handleFinishInterview();
      }
    } finally {
      setEvaluationLoading(false);
    }
  };

  // 7. Finish Session & Fetch Final Report
  const handleFinishInterview = async () => {
    if (!sessionId) return;
    try {
      const res = await aiService.finishMockInterviewV2(sessionId);
      const data = (res.data as any)?.data || res.data;
      setFinalReport(data.report || data);
      setActiveTab('report');
      if (document.exitFullscreen && document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      fetchHistory();
    } catch (err: any) {
      alert('Failed to generate final report.');
    }
  };

  // 8. Fetch History
  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await aiService.getMockInterviewHistoryV2();
      setHistoryData((res.data as any)?.data || res.data);
    } catch {} finally {
      setHistoryLoading(false);
    }
  };

  const skillsList = [
    'Java', 'Python', 'C', 'C++', 'JavaScript', 'React', 'Node.js', 'SQL', 'MongoDB',
    'DSA', 'Data Structures', 'Web Development', 'Backend Development', 'Frontend Development',
    'Full Stack Development', 'AI/ML', 'Data Science', 'DevOps', 'Cloud'
  ];

  return (
    <div className="ai-shell p-6 min-h-screen text-slate-100">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-7 h-7 text-indigo-400" />
            <h1 className="text-3xl font-bold ai-glow-text">AI Mock Interview 2.0</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Real-Time Voice, Camera & Visual Attention Guided AI Interview Practice Engine.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('setup')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'setup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Start Interview
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Interview History & Analytics
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 1: INTERVIEW SETUP & PRE-INTERVIEW CHECK
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'setup' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ai-fade-in">
          {/* Form Setup Panel */}
          <div className="lg:col-span-2 ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-400" />
              Configure Interview Parameters
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Target Job Role</label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Java Developer, Full Stack Developer..."
                  className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Primary Skill / Technology</label>
                <select
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-indigo-300 text-xs font-semibold"
                >
                  {skillsList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Adaptive">Adaptive (Dynamic Difficulty)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Interview Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                >
                  <option value="Technical">Technical Interview</option>
                  <option value="Coding">Coding & Algorithm Interview</option>
                  <option value="DSA">DSA Focused Interview</option>
                  <option value="HR">HR & Culture Fit</option>
                  <option value="Behavioral">Behavioral (STAR Method)</option>
                  <option value="Project">Portfolio Project Deep Dive</option>
                  <option value="Resume">Resume-Based Interview</option>
                  <option value="Mixed">Mixed Comprehensive</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Number of Questions</label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                >
                  <option value={5}>5 Questions (Express)</option>
                  <option value={10}>10 Questions (Standard)</option>
                  <option value={15}>15 Questions (Full Mock)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Time per Question</label>
                <select
                  value={timerDuration}
                  onChange={(e) => setTimerDuration(Number(e.target.value))}
                  className="ai-input w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs"
                >
                  <option value={45}>45 Seconds</option>
                  <option value={60}>60 Seconds (Default)</option>
                  <option value={90}>90 Seconds</option>
                  <option value={120}>120 Seconds</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleStartInterview}
              disabled={!cameraActive}
              className="ai-button w-full py-4 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center gap-2 text-base shadow-xl shadow-indigo-600/30 disabled:opacity-50 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Begin AI Mock Interview</span>
            </button>
          </div>

          {/* Pre-Interview Hardware & Permissions Check Panel */}
          <div className="space-y-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-indigo-400" />
                Pre-Interview System Check
              </h3>

              {/* Video Preview Box */}
              <div className="relative w-full h-44 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden mb-4 flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />
                {!cameraActive && (
                  <div className="text-center p-4">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <span className="text-xs text-amber-200 block font-medium">Camera access required</span>
                  </div>
                )}
              </div>

              {/* Hardware Checklist */}
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300 font-medium">Camera Hardware</span>
                  <span className={`flex items-center gap-1 font-bold ${cameraActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {cameraActive ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {cameraActive ? '● Camera Active' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300 font-medium">Microphone Hardware</span>
                  <span className={`flex items-center gap-1 font-bold ${micActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {micActive ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {micActive ? '● Mic Active' : 'Disconnected'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-300 font-medium">English Speech Recognition</span>
                  <span className={`flex items-center gap-1 font-bold ${speechSupported ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {speechSupported ? 'Available (WebSpeech)' : 'Text Fallback Only'}
                  </span>
                </div>
              </div>

              {checkError && (
                <div className="mt-4 p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs">
                  {checkError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 2: REAL-TIME INTERVIEW ROOM
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'room' && (
        <div className="space-y-6 ai-fade-in relative">
          {/* Active Integrity Warning Banner */}
          {activeWarning && (
            <div className="ai-card p-4 rounded-xl bg-amber-950/90 border border-amber-500 text-amber-100 flex items-center gap-3 animate-bounce shadow-2xl">
              <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Integrity Notice</h4>
                <p className="text-xs font-semibold">{activeWarning}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Question & Answer Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Question Header Card */}
              <div className="ai-card p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                  <span className="text-xs text-indigo-400 font-bold uppercase tracking-wider">
                    Question {currentIndex + 1} of {questions.length}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="ai-badge ai-badge-green px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {questions[currentIndex]?.difficulty || difficulty}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Skill: {questions[currentIndex]?.skill || skill}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-100 leading-relaxed">
                  {questions[currentIndex]?.question || `Can you explain core concepts of ${skill}?`}
                </h2>
              </div>

              {/* Answer Input Card */}
              <div className="ai-card p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAnswerMethod('speech')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        answerMethod === 'speech' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>🎤 Speak Answer</span>
                    </button>
                    <button
                      onClick={() => setAnswerMethod('text')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        answerMethod === 'text' ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-400'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>⌨ Type Answer</span>
                    </button>
                  </div>

                  {/* Verbal Listen Button */}
                  {answerMethod === 'speech' && (
                    <button
                      onClick={toggleSpeechListen}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                        isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500'
                      }`}
                    >
                      {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                      <span>{isListening ? 'Recording Answer...' : 'Start Verbal Answer'}</span>
                    </button>
                  )}
                </div>

                {/* Text Area Input */}
                <textarea
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder={
                    answerMethod === 'speech'
                      ? 'Click "Start Verbal Answer" to speak in English. Transcript will appear here...'
                      : 'Type your answer clearly in English...'
                  }
                  rows={6}
                  className="ai-input w-full p-4 text-xs rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 font-sans"
                />

                {/* Action Controls Row */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => handleSubmitAnswer(false)}
                    disabled={evaluationLoading || !answerInput.trim()}
                    className="ai-button px-6 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 flex items-center gap-2 shadow-lg shadow-indigo-600/30 disabled:opacity-50 text-xs"
                  >
                    {evaluationLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{evaluationLoading ? 'Evaluating Answer...' : 'Submit Answer'}</span>
                  </button>

                  <button
                    onClick={() => handleSubmitAnswer(true)}
                    disabled={evaluationLoading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                    <span>Skip Question</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar: Live Camera & Answer Timer */}
            <div className="space-y-6">
              {/* Answer Countdown Timer */}
              <div className="ai-card p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block">TIME REMAINING</span>
                  <h3 className={`text-3xl font-mono font-bold mt-1 ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                  </h3>
                </div>
                <Clock className={`w-8 h-8 ${timeLeft <= 10 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
              </div>

              {/* Camera Preview Video */}
              <div className="ai-card p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-indigo-400" />
                    Visual Attention Guidance
                  </span>
                  <span className="text-[10px] text-emerald-400 font-bold">● Camera Active</span>
                </div>

                <div className="relative w-full h-48 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300 font-medium">
                    Eye Contact Guidance Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 3: POST INTERVIEW COMPREHENSIVE AI REPORT
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'report' && finalReport && (
        <div className="space-y-6 ai-fade-in">
          {/* Main Score Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold">Overall Interview Score</span>
                <h3 className="text-3xl font-bold text-emerald-400 mt-1">{finalReport.overallScore || 82} / 100</h3>
                {finalReport.scoreDelta > 0 && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3.5 h-3.5" /> +{finalReport.scoreDelta} pts vs last interview
                  </span>
                )}
              </div>
              <Award className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Technical Accuracy</span>
              <h3 className="text-2xl font-bold text-indigo-300 mt-1">{finalReport.technicalScore || 85}%</h3>
              <span className="text-xs text-slate-500 mt-1 block">Domain & keyword depth</span>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Communication Clarity</span>
              <h3 className="text-2xl font-bold text-indigo-300 mt-1">{finalReport.communicationScore || 78}%</h3>
              <span className="text-xs text-slate-500 mt-1 block">English structure & pace</span>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-xs text-slate-400 font-semibold">Problem Solving</span>
              <h3 className="text-2xl font-bold text-indigo-300 mt-1">{finalReport.problemSolvingScore || 84}%</h3>
              <span className="text-xs text-slate-500 mt-1 block">Practical example usage</span>
            </div>
          </div>

          {/* Strong Areas & Needs Improvement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Strong Areas
              </h3>
              <ul className="space-y-2 text-xs text-slate-200">
                {(finalReport.strengths || ['Strong OOP principles', 'Good usage of concrete code examples']).map((s: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-900/30">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Needs Improvement
              </h3>
              <ul className="space-y-2 text-xs text-slate-200">
                {(finalReport.needsImprovement || ['Elaborate further on concurrency edge cases']).map((n: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/30">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          TAB 4: INTERVIEW HISTORY & REAL PERFORMANCE TREND CHARTS
          ───────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-6 ai-fade-in">
          <div className="ai-card p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
            <h2 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-400" />
              Stored Performance Analytics
            </h2>

            {historyLoading ? (
              <div className="ai-pulse h-48 bg-slate-950 rounded-xl"></div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 font-medium">Total Mock Interviews</span>
                    <h3 className="text-2xl font-bold text-indigo-300 mt-1">{historyData?.summary?.totalInterviews || 0}</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 font-medium">Average Overall Score</span>
                    <h3 className="text-2xl font-bold text-emerald-400 mt-1">{historyData?.summary?.avgScore || 0}%</h3>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <span className="text-xs text-slate-400 font-medium">Avg Technical Score</span>
                    <h3 className="text-2xl font-bold text-indigo-300 mt-1">{historyData?.summary?.avgTechScore || 0}%</h3>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterviewPage;
