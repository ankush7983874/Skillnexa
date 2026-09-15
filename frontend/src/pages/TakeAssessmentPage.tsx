import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import { 
  CheckCircle2, XCircle, ArrowLeft, Send, 
  ShieldAlert, Camera, Mic, Maximize2, AlertTriangle, Clock, Eye, Activity
} from 'lucide-react';

interface ProctoringEvent {
  type: string;
  timestamp: Date;
  description: string;
}

export const TakeAssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [resultData, setResultData] = useState<any>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  // Proctoring State
  const [proctoringStarted, setProctoringStarted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const [proctoringEvents, setProctoringEvents] = useState<ProctoringEvent[]>([]);
  const [activeWarning, setActiveWarning] = useState<string | null>(null);

  // Per-question timer (60 seconds max per question, 10s min)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(60);
  const [questionTimeSpent, setQuestionTimeSpent] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const logProctoringEvent = (
    type: string,
    description: string,
    scorePenalty: number = 10,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'
  ) => {
    const event: ProctoringEvent = { type, timestamp: new Date(), description };
    setProctoringEvents((prev) => [event, ...prev]);
    setRiskScore((prev) => Math.min(100, prev + scorePenalty));
    setActiveWarning(description);
    setTimeout(() => {
      setActiveWarning((current) => (current === description ? null : current));
    }, 4000);

    if (attemptId) {
      apiClient
        .post('/assessments/proctored/event', {
          attemptId,
          type,
          severity,
          description,
        })
        .catch(() => {});
    }
  };

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        try {
          const pRes = await apiClient.post('/assessments/proctored/start', { assessmentId: id });
          if (pRes.data?.success) {
            const d = pRes.data.data;
            setAttemptId(d.attemptId);
            setAssessment(d.assessment);
            setQuestions(d.questions);
            if (d.currentQuestion !== undefined) setCurrentQuestionIndex(d.currentQuestion);
            if (d.answers) setAnswers(d.answers);
            if (d.riskScore) setRiskScore(d.riskScore);
            if (d.tabSwitchCount) setTabSwitches(d.tabSwitchCount);
            if (d.fullscreenExitCount) setFullscreenExits(d.fullscreenExitCount);
            return;
          }
        } catch (pe) {
          console.warn('Falling back to standard assessment route:', pe);
        }

        const res = await apiClient.get(`/assessments/${id}/take`);
        if (res.data?.success) {
          setAssessment(res.data.data.assessment);
          setQuestions(res.data.data.questions);
        }
      } catch (err) {
        console.error('Failed to fetch questions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  // Request Webcam & Microphone for AI Proctoring
  const startProctoringSession = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: true,
      });

      streamRef.current = stream;
      setCameraActive(true);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);
        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        let consecutiveLoudFrames = 0;
        const checkAudio = () => {
          if (!analyserRef.current) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setAudioLevel(Math.min(100, Math.round(average * 1.5)));

          if (average > 65) {
            consecutiveLoudFrames++;
            if (consecutiveLoudFrames === 15) {
              logProctoringEvent('AUDIO_ANOMALY', 'Warning: Unexpected audio detected. Please ensure you are completing the assessment without assistance.', 10);
            }
          } else {
            consecutiveLoudFrames = Math.max(0, consecutiveLoudFrames - 1);
          }

          animationFrameRef.current = requestAnimationFrame(checkAudio);
        };
        checkAudio();
      }

      setProctoringStarted(true);
    } catch (err) {
      console.warn('Media devices could not be started or permission denied:', err);
      logProctoringEvent('MEDIA_PERMISSION_DENIED', 'Warning: Your face is not visible. Please stay in front of the camera and enable webcam.', 20);
      setCameraActive(false);
      setProctoringStarted(true);
    }
  };

  const retryCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240, facingMode: 'user' },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
      setCameraActive(true);
      setActiveWarning(null);
    } catch (err) {
      setCameraActive(false);
      logProctoringEvent('CAMERA_DISABLED', 'Warning: Camera disabled or permission rejected.', 20, 'HIGH');
    }
  };

  // Crucial Fix: Attach MediaStream to Video element once DOM mounts
  useEffect(() => {
    if (proctoringStarted && cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current
        .play()
        .catch((err) => console.warn('Video element play execution error:', err));
    }
  }, [proctoringStarted, cameraActive]);

  useEffect(() => {
    if (!proctoringStarted) return;

    const handleFullscreenChange = () => {
      const full = !!document.fullscreenElement;
      if (!full) {
        setFullscreenExits((prev) => prev + 1);
        logProctoringEvent('FULLSCREEN_EXIT', 'Warning: Fullscreen mode exited during assessment.', 15);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
        logProctoringEvent('TAB_SWITCH', 'Warning: Please return to the assessment window. Tab switch detected.', 20);
      }
    };

    const handleWindowBlur = () => {
      logProctoringEvent('WINDOW_BLUR', 'Warning: Focus moved away from assessment window.', 5, 'LOW');
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey && ['c', 'v', 'u', 'p', 's', 'a'].includes(e.key.toLowerCase())) ||
        e.key === 'PrintScreen' ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        logProctoringEvent('COPY_ATTEMPT', 'Warning: Restricted keyboard copy/inspect action attempted.', 10, 'MEDIUM');
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logProctoringEvent('CONTEXT_MENU_ATTEMPT', 'Warning: Right-click context menu prevented.', 5, 'LOW');
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Assessment session in progress. Reloading logs a proctoring violation.';
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [proctoringStarted, attemptId]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!proctoringStarted || resultData || questions.length === 0) return;

    const timer = setInterval(() => {
      setQuestionTimeSpent((s) => s + 1);
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex((idx) => idx + 1);
            setQuestionTimeSpent(0);
            return 60;
          } else {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [proctoringStarted, currentQuestionIndex, questions.length, resultData]);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    if (attemptId) {
      apiClient
        .post('/assessments/proctored/answer', {
          attemptId,
          questionId,
          selectedOptionIndex: optionIndex,
          timeSpentSeconds: questionTimeSpent,
        })
        .catch(() => {});
    }
  };

  const handleNextQuestion = () => {
    if (questionTimeSpent < 10) {
      alert('Minimum time requirement: please spend at least 10 seconds reviewing this question before advancing.');
      return;
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setQuestionTimeLeft(60);
      setQuestionTimeSpent(0);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setQuestionTimeLeft(60);
      setQuestionTimeSpent(0);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answersPayload = Object.entries(answers).map(([qId, idx]) => ({
        questionId: qId,
        selectedOptionIndex: idx,
      }));

      let res;
      if (attemptId) {
        res = await apiClient.post('/assessments/proctored/submit', {
          attemptId,
          answers: answersPayload,
        });
      } else {
        res = await apiClient.post(`/assessments/${id}/submit`, {
          answers: answersPayload,
          proctoring: {
            riskScore,
            tabSwitches,
            fullscreenExits,
            events: proctoringEvents,
          },
        });
      }

      if (res.data?.success) {
        setResultData(res.data.data);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to submit assessment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center text-slate-400 font-sans">
        <div className="flex items-center space-x-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Initializing secure evaluation environment...</span>
        </div>
      </div>
    );
  }

  if (!proctoringStarted && !resultData) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-6 font-sans">
        <div className="max-w-xl w-full glass-panel rounded-3xl p-8 border border-indigo-500/30 space-y-6 shadow-2xl">
          <div className="flex items-center space-x-3 text-indigo-400">
            <ShieldAlert className="h-8 w-8" />
            <div>
              <h2 className="text-xl font-bold text-white">AI-Proctored Skill Assessment</h2>
              <p className="text-xs text-slate-400">SkillNexa Automated Proctoring Engine (Phase 10)</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 bg-slate-950/80 p-5 rounded-2xl border border-slate-800 leading-relaxed">
            <p className="font-semibold text-white">Before entering the assessment environment:</p>
            <ul className="space-y-2 list-disc list-inside text-slate-400">
              <li><strong className="text-slate-200">Fullscreen Mode:</strong> The assessment runs in enforced fullscreen. Exiting is logged as an anomaly.</li>
              <li><strong className="text-slate-200">Camera & Microphone:</strong> Required to verify face presence and background noise anomalies.</li>
              <li><strong className="text-slate-200">Tab Switching:</strong> Navigating away from this window generates immediate risk signals.</li>
              <li><strong className="text-slate-200">Timer:</strong> You have 60 seconds per question with automatic progression.</li>
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2.5">
              <Camera className="h-4 w-4 text-indigo-400" />
              <span>Camera Tracking: Active</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-2.5">
              <Mic className="h-4 w-4 text-indigo-400" />
              <span>Audio Anomaly: Active</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={() => navigate('/assessments')}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={startProctoringSession}
              className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
            >
              <Maximize2 className="h-4 w-4" />
              <span>Enter Secure Test</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resultData) {
    const result = resultData.result || resultData;
    const detailedFeedback = resultData.detailedFeedback || [];
    const scoreVal = result.score !== undefined ? result.score : result.correctCount !== undefined ? result.correctCount : 0;
    const totalVal = result.totalMarks !== undefined ? result.totalMarks : questions.length;
    const pctVal = result.percentage !== undefined ? result.percentage : result.skillScore !== undefined ? result.skillScore : Math.round((scoreVal / Math.max(1, totalVal)) * 100);
    const passedVal = result.passed !== undefined ? result.passed : pctVal >= (assessment?.passingScore || 60);

    const proctoringInfo = result?.proctoring || {
      riskScore: resultData.riskScore !== undefined ? resultData.riskScore : riskScore,
      integrityScore: resultData.integrityScore !== undefined ? resultData.integrityScore : Math.max(0, 100 - riskScore),
      riskLevel: resultData.riskLevel || (riskScore < 20 ? 'LOW' : riskScore < 50 ? 'MEDIUM' : riskScore < 80 ? 'HIGH' : 'CRITICAL'),
      status: resultData.status || (riskScore < 50 ? 'VERIFIED' : 'REVIEW_REQUIRED'),
      tabSwitches: resultData.tabSwitchCount !== undefined ? resultData.tabSwitchCount : tabSwitches,
      fullscreenExits: resultData.fullscreenExitCount !== undefined ? resultData.fullscreenExitCount : fullscreenExits,
      events: resultData.proctoringEvents || proctoringEvents,
      explanation: resultData.explanation,
      recommendation: resultData.recommendation,
      anomaliesDetected: resultData.anomaliesDetected,
    };

    const getRiskColor = (score: number) => {
      if (score <= 25) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      if (score <= 55) return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    };

    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 p-6 max-w-4xl mx-auto space-y-8 font-sans">
        <div className="glass-panel rounded-3xl p-8 border border-slate-800 text-center space-y-6">
          <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mx-auto shadow-xl ${passedVal ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
            {passedVal ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-white">Evaluation Results & Integrity Audit</h2>
            <p className="text-slate-400 text-sm">{result.assessmentTitle || assessment?.title}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-xl mx-auto py-2 font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-500">Skill Score</div>
              <div className="text-xl font-bold text-white">{scoreVal} / {totalVal} ({pctVal}%)</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-500">Integrity Score</div>
              <div className="text-xl font-bold text-emerald-400">{proctoringInfo.integrityScore !== undefined ? proctoringInfo.integrityScore : 100 - (proctoringInfo.riskScore || 0)}/100</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-500">Risk Level</div>
              <div className="text-sm font-bold text-blue-400 mt-1 uppercase">{proctoringInfo.riskLevel || 'LOW'}</div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-500">Outcome</div>
              <div className={`text-sm font-bold mt-1 ${passedVal ? 'text-emerald-400' : 'text-rose-400'}`}>
                {passedVal ? 'PASSED' : 'FAILED'}
              </div>
            </div>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-indigo-500/20 text-left space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-5 w-5 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">AI Proctoring Integrity Telemetry</h4>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getRiskColor(proctoringInfo.riskScore)}`}>
                Status: {proctoringInfo.status || 'VERIFIED'}
              </span>
            </div>

            {proctoringInfo.explanation && (
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                {proctoringInfo.explanation}
              </p>
            )}

            <div className="grid grid-cols-3 gap-3 text-xs pt-1">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">Tab Switches</span>
                <p className="text-sm font-bold text-white mt-0.5">{proctoringInfo.tabSwitches || 0}</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">Fullscreen Exits</span>
                <p className="text-sm font-bold text-white mt-0.5">{proctoringInfo.fullscreenExits || 0}</p>
              </div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-slate-500">Events Recorded</span>
                <p className="text-sm font-bold text-white mt-0.5">{proctoringInfo.events?.length || 0}</p>
              </div>
            </div>

            {proctoringInfo.events && proctoringInfo.events.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {proctoringInfo.events.map((evt: any, i: number) => (
                  <div key={i} className="text-[11px] text-slate-400 flex items-center justify-between p-1.5 bg-slate-900/60 rounded-lg">
                    <span className="text-rose-400 font-mono">[{evt.type}]</span>
                    <span className="truncate mx-2">{evt.description}</span>
                    <span className="text-slate-600 text-[10px]">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs leading-relaxed">
            Your capability score for <strong>{result.skillName}</strong> has been updated to <strong>{result.percentage}%</strong> in your student capability profile!
          </div>

          <button
            onClick={() => navigate('/assessments')}
            className="glass-button py-2.5 px-6 rounded-xl text-xs font-semibold text-white inline-flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Assessment Catalog</span>
          </button>
        </div>

        <section className="space-y-4">
          <h3 className="text-lg font-bold text-white">Detailed Explanation Breakdown</h3>
          <div className="space-y-4">
            {detailedFeedback.map((fb: any, idx: number) => (
              <div key={idx} className={`glass-card rounded-2xl p-5 border ${fb.isCorrect ? 'border-emerald-500/30' : 'border-rose-500/30'} space-y-3`}>
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-semibold text-white">Q{idx + 1}. {fb.questionText}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${fb.isCorrect ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {fb.isCorrect ? 'CORRECT' : 'INCORRECT'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <strong className="text-slate-300">Explanation: </strong> {fb.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 p-4 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      {activeWarning && (
        <div className="sticky top-4 z-50 p-3.5 bg-rose-950/90 border border-rose-500/60 rounded-2xl text-xs text-rose-200 flex items-center justify-between shadow-xl backdrop-blur-md animate-pulse">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
            <span className="font-semibold">{activeWarning}</span>
          </div>
          <span className="text-[10px] text-rose-300 bg-rose-900/60 px-2 py-0.5 rounded-full font-mono">
            Penalty +Risk
          </span>
        </div>
      )}

      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>{assessment?.title}</span>
            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] uppercase tracking-wider font-semibold">
              Proctored
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Question {currentQuestionIndex + 1} of {questions.length} • Passing: {assessment?.passingScore}%
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Mic className="h-3.5 w-3.5 text-indigo-400" />
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-75"
                style={{ width: `${Math.min(100, audioLevel * 2)}%` }}
              />
            </div>
          </div>

          <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold ${
            questionTimeLeft <= 15 ? 'bg-rose-950/60 border-rose-500/50 text-rose-400 animate-pulse' : 'bg-slate-950 border-slate-800 text-indigo-300'
          }`}>
            <Clock className="h-3.5 w-3.5" />
            <span>00:{questionTimeLeft.toString().padStart(2, '0')}</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <ShieldAlert className="h-3.5 w-3.5 text-slate-400" />
            <span className="text-slate-400">Risk:</span>
            <span className={`font-bold font-mono ${riskScore > 30 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {riskScore}%
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {currentQ && (
            <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 pb-3">
                <span className="font-semibold text-indigo-300">Question {currentQuestionIndex + 1}</span>
                <span>Auto-advances when timer hits 0</span>
              </div>

              <h3 className="text-base font-medium text-white leading-relaxed">
                {currentQ.questionText}
              </h3>

              <div className="space-y-2.5 pt-2">
                {currentQ.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[currentQ._id] === optIdx;
                  return (
                    <button
                      type="button"
                      key={optIdx}
                      onClick={() => handleSelectOption(currentQ._id, optIdx)}
                      className={`w-full text-left p-4 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                        isSelected
                          ? 'bg-indigo-600/20 border border-indigo-500 text-white shadow-lg shadow-indigo-600/10'
                          : 'bg-slate-950/80 border border-slate-800 text-slate-300 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      <span className="pr-4">{opt}</span>
                      <div className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${isSelected ? 'border-indigo-400 bg-indigo-500' : 'border-slate-700'}`}>
                        {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition"
            >
              ← Previous
            </button>

            <div className="flex items-center space-x-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentQuestionIndex(i);
                    setQuestionTimeLeft(60);
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition flex items-center justify-center ${
                    i === currentQuestionIndex
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : answers[questions[i]._id] !== undefined
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 transition"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5" />
                    <span>Submit</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <Camera className="h-3.5 w-3.5 text-indigo-400" />
                <span>Live Proctor Stream</span>
              </span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-bold border ${cameraActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                <span>{cameraActive ? '● Camera Live' : '● Camera Offline'}</span>
              </span>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-[10px] space-y-2 p-2 bg-slate-950/90 text-center">
                  <Camera className="h-6 w-6 text-rose-400 animate-bounce" />
                  <span className="font-semibold text-rose-300">Camera Offline / Unbound</span>
                  <button
                    onClick={retryCameraPermission}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition shadow"
                  >
                    Re-enable Camera
                  </button>
                </div>
              )}
              <div className="absolute bottom-2 left-2 flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[9px] text-slate-300 font-mono">
                <Activity className="h-2.5 w-2.5 text-emerald-400 animate-pulse" />
                <span>AI Face Tracking</span>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Tab Switches</span>
                <span className={`font-mono font-bold ${tabSwitches > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{tabSwitches}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span>Fullscreen Exits</span>
                <span className={`font-mono font-bold ${fullscreenExits > 0 ? 'text-rose-400' : 'text-slate-300'}`}>{fullscreenExits}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Total Warnings</span>
                <span className="font-mono text-amber-400 font-bold">{proctoringEvents.length}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-2">
            <h5 className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
              <Eye className="h-3.5 w-3.5 text-indigo-400" />
              <span>Proctoring Audit Feed</span>
            </h5>
            <div className="space-y-1.5 max-h-48 overflow-y-auto text-[10px] text-slate-400">
              {proctoringEvents.length === 0 ? (
                <div className="p-2 text-slate-500 text-center italic">No anomalies recorded. Integrity verified.</div>
              ) : (
                proctoringEvents.slice(0, 5).map((evt, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-0.5">
                    <div className="flex items-center justify-between font-mono text-[9px] text-rose-400">
                      <span>{evt.type}</span>
                      <span className="text-slate-500">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 leading-tight">{evt.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeAssessmentPage;

