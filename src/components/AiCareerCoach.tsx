import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  Compass,
  ArrowRight,
  RefreshCw,
  Award,
  Zap,
} from "lucide-react";
import { AiCoachMessage, StudentProfile } from "../types";

interface AiCareerCoachProps {
  profile: StudentProfile;
}

export const AiCareerCoach: React.FC<AiCareerCoachProps> = ({ profile }) => {
  const [messages, setMessages] = useState<AiCoachMessage[]>([
    {
      id: "msg-welcome",
      sender: "coach",
      text: `Hello ${profile.name}! I'm your dedicated Engineering Career & Academic Coach. I'm calibrated to your profile as a **${profile.year} ${profile.branch} student** targeting **${profile.targetCompanyType}**.\n\nWhether you need a custom roadmap for Google/Amazon/FinTech placements, strategies to balance your 8.5+ CGPA with LeetCode/Hackathons, or guidance on getting off-campus referrals—ask me anything!`,
      timestamp: new Date().toISOString(),
      actionableChecklist: [
        `Complete your ${profile.year} core subject notes`,
        "Aim for 350+ LeetCode problems",
        "Participate in at least 2 national hackathons (SIH/Flipkart GRiD)",
      ],
    },
  ]);

  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const samplePrompts = [
    `How should a ${profile.year} student prepare for Tier-1 Product Companies?`,
    "How do I balance semester exams (8.5+ CGPA) with LeetCode & Hackathons?",
    "What kind of Full-Stack / GenAI projects stand out on a resume?",
    "How do I get off-campus referrals from Senior SDEs on LinkedIn?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: AiCoachMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setLoading(true);

    try {
      // Build conversation history
      const history = messages.map((m) => ({
        role: m.sender === "coach" ? "model" : "user",
        text: m.text,
      }));

      const res = await fetch("/api/gemini/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: query,
          studentProfile: profile,
          conversationHistory: history,
        }),
      });

      const data = await res.json();

      const coachMsg: AiCoachMessage = {
        id: `coach-${Date.now()}`,
        sender: "coach",
        text: data.reply || "Keep up the structured practice and focus on fundamentals!",
        timestamp: new Date().toISOString(),
        actionableChecklist: data.actionableSteps,
        suggestedNextTopics: data.suggestedTopics,
      };

      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: AiCoachMessage = {
        id: `coach-${Date.now()}`,
        sender: "coach",
        text: `As a ${profile.year} student, your highest ROI strategy right now is: \n1. **Core CS Foundations**: Deep understanding of DBMS transactions (ACID), OS thread synchronization, and TCP/IP handshakes.\n2. **DSA Consistency**: Practice 2 problems daily on NeetCode 150 roadmap.\n3. **Standout Projects**: Deploy full-stack apps with Docker and clear README architecture diagrams.`,
        timestamp: new Date().toISOString(),
        actionableChecklist: ["Solve 2 LeetCode Mediums daily", "Review Operating Systems virtual memory notes"],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border p-5 sm:p-6 transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Engineering Mentor</span>
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Target: {profile.targetCompanyType}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              AI Career Coach & Academic Advisor
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Personalized guidance on tier-1 placement prep, academic-career balance, hackathon project ideation, and interview readiness.
            </p>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex space-x-2 overflow-x-auto mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 pb-1 scrollbar-none">
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 transition-colors whitespace-nowrap"
            >
              💡 {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col h-[650px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {messages.map((msg) => {
            const isCoach = msg.sender === "coach";

            return (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 ${
                  isCoach ? "justify-start" : "justify-end flex-row-reverse space-x-reverse"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isCoach
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200"
                  }`}
                >
                  {isCoach ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isCoach
                      ? "bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-zinc-900 dark:text-zinc-100"
                      : "bg-indigo-600 text-white font-medium"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Actionable checklist if present */}
                  {msg.actionableChecklist && msg.actionableChecklist.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700 text-xs">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1.5 flex items-center space-x-1">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Actionable Next Steps:</span>
                      </span>
                      <ul className="space-y-1.5 text-zinc-700 dark:text-zinc-300">
                        {msg.actionableChecklist.map((step, sIdx) => (
                          <li key={sIdx} className="flex items-start space-x-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested topics buttons */}
                  {msg.suggestedNextTopics && msg.suggestedNextTopics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-2">
                      {msg.suggestedNextTopics.map((top, tIdx) => (
                        <button
                          key={tIdx}
                          onClick={() => handleSendMessage(top)}
                          className="px-2 py-1 text-[11px] font-semibold rounded bg-white hover:bg-zinc-100 text-indigo-600 dark:bg-zinc-900 dark:hover:bg-zinc-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors"
                        >
                          → {top}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse flex items-center space-x-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Formulating personalized engineering strategy...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={`Ask your career coach (e.g. "How should I structure my SY/TY roadmap for Google?")`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={loading || !inputText.trim()}
              className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
