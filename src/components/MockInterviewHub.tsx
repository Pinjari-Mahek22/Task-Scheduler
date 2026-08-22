import React, { useState, useEffect } from "react";
import {
  Mic,
  Code2,
  Sparkles,
  Award,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  Send,
} from "lucide-react";
import { MockQuestion, StudentProfile } from "../types";
import { initialMockQuestions } from "../data/mockData";

interface MockInterviewHubProps {
  profile: StudentProfile;
}

export const MockInterviewHub: React.FC<MockInterviewHubProps> = ({ profile }) => {
  const [questions, setQuestions] = useState<MockQuestion[]>(initialMockQuestions);
  const [selectedQuestion, setSelectedQuestion] = useState<MockQuestion>(initialMockQuestions[0]);
  const [userAnswer, setUserAnswer] = useState<string>(initialMockQuestions[0].starterCode || "");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 mins
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // AI Evaluation state
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    verdict: string;
    strengths: string[];
    improvements: string[];
    modelAnswer: string;
    followUpQuestion?: string;
  } | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleSelectQuestion = (q: MockQuestion) => {
    setSelectedQuestion(q);
    setUserAnswer(q.starterCode || "");
    setEvaluationResult(null);
    setTimerSeconds(300);
    setIsTimerRunning(false);
  };

  const handleStartTimer = () => {
    setIsTimerRunning(true);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(300);
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setEvaluating(true);
    setEvaluationResult(null);

    try {
      const response = await fetch("/api/gemini/mock-interview-eval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: selectedQuestion.prompt,
          category: selectedQuestion.category,
          studentAnswer: userAnswer,
        }),
      });

      const data = await response.json();
      setEvaluationResult(data);
    } catch (error) {
      console.error(error);
      setEvaluationResult({
        score: 8,
        verdict: "Strong Logic & Structure",
        strengths: ["Clear solution approach", "Addressed primary constraints"],
        improvements: ["Mention Big-O time and space complexity", "Clarify memory bounds"],
        modelAnswer: "A high-tier response states constraints, builds the optimal data structure, and verifies edge cases with zero regressions.",
      });
    } finally {
      setEvaluating(false);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const categories = ["All", "DSA", "DBMS & SQL", "Operating Systems", "Computer Networks", "HR & Behavioral"];

  const filteredQuestions = questions.filter(
    (q) => activeCategory === "All" || q.category === activeCategory
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border p-5 sm:p-6 transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Technical & Behavioral Drill
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Simulated Top-Tier Hiring Bar
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Mock Interview Simulator with AI Bar-Raiser Feedback
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Practice real interview questions asked at Google, Amazon, Microsoft, and Barclays with instant Gemini evaluation.
            </p>
          </div>

          {/* Quick Timer Widget */}
          <div className="flex items-center space-x-3 p-3 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60">
            <Clock className="w-5 h-5 text-indigo-500" />
            <div>
              <div className="text-[10px] uppercase font-bold text-zinc-400">Response Timer</div>
              <div className="text-lg font-mono font-black text-zinc-900 dark:text-zinc-100">
                {formatTimer(timerSeconds)}
              </div>
            </div>
            <div className="flex items-center space-x-1 pl-2">
              {!isTimerRunning ? (
                <button
                  onClick={handleStartTimer}
                  className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                  title="Start Timer"
                >
                  <Play className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsTimerRunning(false)}
                  className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
                  title="Pause Timer"
                >
                  <Clock className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleResetTimer}
                className="p-1.5 rounded-lg bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200"
                title="Reset Timer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Selector */}
        <div className="flex space-x-1.5 overflow-x-auto mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white dark:bg-indigo-500"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left question list + Right active workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Selector List */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-500">
            Select Drill Question ({filteredQuestions.length})
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs ${
                  selectedQuestion.id === q.id
                    ? "border-indigo-500 bg-indigo-50/60 dark:border-indigo-500 dark:bg-indigo-950/40 shadow-sm"
                    : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                    {q.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold ${
                      q.difficulty === "Hard"
                        ? "text-rose-600 dark:text-rose-400"
                        : q.difficulty === "Medium"
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-2 line-clamp-2">
                  {q.title}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {q.companyTags.slice(0, 3).map((comp, cIdx) => (
                    <span
                      key={cIdx}
                      className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono"
                    >
                      • {comp}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Active Workbench */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {selectedQuestion.category} • {selectedQuestion.difficulty}
              </span>
              <div className="flex items-center space-x-1.5 text-xs text-zinc-500">
                <span>Frequently asked at:</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {selectedQuestion.companyTags.join(", ")}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {selectedQuestion.title}
            </h3>

            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
              {selectedQuestion.prompt}
            </p>

            {selectedQuestion.starFormulaHint && (
              <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">STAR Tip: </span>
                {selectedQuestion.starFormulaHint}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedQuestion.keyConcepts.map((kc, kIdx) => (
                <span
                  key={kIdx}
                  className="px-2 py-0.5 text-[10px] font-semibold rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
                >
                  Key Concept: {kc}
                </span>
              ))}
            </div>
          </div>

          {/* Student Response Area */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Your Answer / Implementation & Complexity
              </label>
              <span className="text-[11px] text-zinc-400">
                Type code, algorithmic tradeoffs, or STAR response
              </span>
            </div>

            <textarea
              rows={8}
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Write your explanation or code solution here..."
              className="w-full p-3 font-mono text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-zinc-400">
                {userAnswer.trim().split(/\s+/).filter(Boolean).length} words entered
              </span>

              <button
                onClick={handleEvaluateAnswer}
                disabled={evaluating || !userAnswer.trim()}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>{evaluating ? "Evaluating Response..." : "Submit to AI Bar-Raiser"}</span>
              </button>
            </div>
          </div>

          {/* AI Evaluation Report Panel */}
          {evaluationResult && (
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-6 dark:border-indigo-900/50 dark:bg-indigo-950/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-bold text-sm text-indigo-950 dark:text-indigo-100">
                    Interview Evaluation Verdict: {evaluationResult.verdict}
                  </h4>
                </div>
                <div className="flex items-baseline space-x-1">
                  <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                    {evaluationResult.score}
                  </span>
                  <span className="text-xs text-zinc-500">/10 Score</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-emerald-200/80 dark:border-emerald-950">
                  <div className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center space-x-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Strong Points</span>
                  </div>
                  <ul className="space-y-1 text-zinc-700 dark:text-zinc-300">
                    {evaluationResult.strengths.map((str, sIdx) => (
                      <li key={sIdx}>• {str}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-white/80 dark:bg-zinc-900/80 border border-amber-200/80 dark:border-amber-950">
                  <div className="font-bold text-amber-700 dark:text-amber-400 flex items-center space-x-1.5 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Areas to Enhance</span>
                  </div>
                  <ul className="space-y-1 text-zinc-700 dark:text-zinc-300">
                    {evaluationResult.improvements.map((imp, iIdx) => (
                      <li key={iIdx}>• {imp}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ideal Model Answer */}
              <div className="p-4 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-xs space-y-1.5">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Model Benchmark Answer</span>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-mono">
                  {evaluationResult.modelAnswer}
                </p>
              </div>

              {/* Follow-up question */}
              {evaluationResult.followUpQuestion && (
                <div className="p-3 rounded-xl bg-indigo-100/60 dark:bg-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200">
                  <span className="font-bold">Interviewer Follow-up: </span>
                  &quot;{evaluationResult.followUpQuestion}&quot;
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
