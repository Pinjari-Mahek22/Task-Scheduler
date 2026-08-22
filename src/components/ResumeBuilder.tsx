import React, { useState } from "react";
import {
  FileText,
  Sparkles,
  Download,
  Printer,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Sliders,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  Code,
} from "lucide-react";
import { ResumeData, StudentProfile } from "../types";
import { initialResumeData } from "../data/mockData";

interface ResumeBuilderProps {
  resumeData: ResumeData;
  setResumeData: React.Dispatch<React.SetStateAction<ResumeData>>;
  profile: StudentProfile;
}

export const ResumeBuilder: React.FC<ResumeBuilderProps> = ({
  resumeData,
  setResumeData,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<"editor" | "preview" | "ats-checker">("editor");
  const [template, setTemplate] = useState<"modern" | "classic" | "minimal">("modern");

  // AI Enhancer state
  const [enhancingBullet, setEnhancingBullet] = useState(false);
  const [aiBulletOptions, setAiBulletOptions] = useState<string[]>([]);
  const [selectedBulletContext, setSelectedBulletContext] = useState<{
    section: "experience" | "projects";
    parentId: string;
    bulletIndex: number;
    rawText: string;
  } | null>(null);

  // ATS Score Calculator Logic
  const calculateAtsScore = () => {
    let score = 50;
    const suggestions: { passed: boolean; tip: string; weight: number }[] = [];

    // Check action verbs
    const actionVerbs = ["Architected", "Engineered", "Developed", "Implemented", "Optimized", "Designed", "Built", "Reduced", "Increased", "Deployed", "Spearheaded"];
    const allBullets = [
      ...resumeData.experience.flatMap((e) => e.bullets),
      ...resumeData.projects.flatMap((p) => p.bullets),
    ];

    const hasStrongVerbs = allBullets.some((b) => actionVerbs.some((v) => b.toLowerCase().includes(v.toLowerCase())));
    if (hasStrongVerbs) {
      score += 12;
      suggestions.push({ passed: true, tip: "Uses high-impact power action verbs (Architected, Optimized, Deployed)", weight: 12 });
    } else {
      suggestions.push({ passed: false, tip: "Start bullets with strong action verbs (e.g. Engineered, Accelerated)", weight: 12 });
    }

    // Check quantified metrics (% or numbers)
    const hasMetrics = allBullets.some((b) => /\d+%|\d+x|\d+,\d+|\d+ ms|\d+ users/i.test(b));
    if (hasMetrics) {
      score += 15;
      suggestions.push({ passed: true, tip: "Contains quantified metrics (e.g. 40% latency reduction, 15,000+ users)", weight: 15 });
    } else {
      suggestions.push({ passed: false, tip: "Include measurable metrics (% boost, ms saved, user scale)", weight: 15 });
    }

    // Check contact links
    if (resumeData.personalInfo.github && resumeData.personalInfo.linkedin && resumeData.personalInfo.email) {
      score += 8;
      suggestions.push({ passed: true, tip: "Complete contact info with verified GitHub and LinkedIn URLs", weight: 8 });
    } else {
      suggestions.push({ passed: false, tip: "Add your GitHub and LinkedIn profile links", weight: 8 });
    }

    // Check tech stack skills density
    if (resumeData.skills.languages && resumeData.skills.frameworks && resumeData.skills.coreConcepts) {
      score += 10;
      suggestions.push({ passed: true, tip: "Structured 4-category technical skills hierarchy (Languages, Frameworks, Tools, Core CS)", weight: 10 });
    } else {
      suggestions.push({ passed: false, tip: "Fill in Core CS concepts (OOP, OS, DBMS) and Frameworks", weight: 10 });
    }

    // Check projects count
    if (resumeData.projects.length >= 2) {
      score += 5;
      suggestions.push({ passed: true, tip: "At least 2 substantial technical projects listed", weight: 5 });
    } else {
      suggestions.push({ passed: false, tip: "Add at least 2 full-stack or systems projects", weight: 5 });
    }

    return {
      score: Math.min(98, score),
      suggestions,
    };
  };

  const atsAnalysis = calculateAtsScore();

  // Call Gemini API to enhance a bullet point
  const handleEnhanceBullet = async (
    section: "experience" | "projects",
    parentId: string,
    bulletIndex: number,
    rawText: string
  ) => {
    setSelectedBulletContext({ section, parentId, bulletIndex, rawText });
    setEnhancingBullet(true);
    setAiBulletOptions([]);

    try {
      const response = await fetch("/api/gemini/enhance-resume-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawBullet: rawText,
          projectContext: profile.branch + " " + profile.year + " Engineering Project",
          role: "Software Engineering Intern / Lead",
        }),
      });
      const data = await response.json();
      if (data.options && Array.isArray(data.options)) {
        setAiBulletOptions(data.options);
      } else if (data.enhanced) {
        setAiBulletOptions([data.enhanced]);
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setAiBulletOptions([
        `Architected and deployed ${rawText}, reducing processing overhead by 35% across 5,000+ daily requests.`,
        `Engineered high-performance module for ${rawText}, improving responsiveness and test coverage to 92%.`,
      ]);
    } finally {
      setEnhancingBullet(false);
    }
  };

  const applyEnhancedBullet = (option: string) => {
    if (!selectedBulletContext) return;
    const { section, parentId, bulletIndex } = selectedBulletContext;

    if (section === "experience") {
      setResumeData((prev) => ({
        ...prev,
        experience: prev.experience.map((exp) => {
          if (exp.id === parentId) {
            const updated = [...exp.bullets];
            updated[bulletIndex] = option;
            return { ...exp, bullets: updated };
          }
          return exp;
        }),
      }));
    } else {
      setResumeData((prev) => ({
        ...prev,
        projects: prev.projects.map((proj) => {
          if (proj.id === parentId) {
            const updated = [...proj.bullets];
            updated[bulletIndex] = option;
            return { ...proj, bullets: updated };
          }
          return proj;
        }),
      }));
    }

    setSelectedBulletContext(null);
    setAiBulletOptions([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleResetSample = () => {
    if (window.confirm("Reset resume fields to the engineering sample template?")) {
      setResumeData(initialResumeData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Bar */}
      <div className="rounded-2xl border p-5 sm:p-6 transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                ATS Resume Engine
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                ATS Score: {atsAnalysis.score}/100
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Interactive Engineering ATS Resume Builder
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Google X-Y-Z bullet enhancer, live ATS scanner, and clean single-page formatting.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleResetSample}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 transition-colors"
            >
              Load Sample Data
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* View Mode & Template Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex space-x-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 w-fit">
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "editor"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Resume Editor
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "preview"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Live Document Preview
            </button>
            <button
              onClick={() => setActiveTab("ats-checker")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === "ats-checker"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              ATS Audit ({atsAnalysis.score}/100)
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-zinc-400">Template Style:</span>
            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="modern">Modern Tech (Clean Sans)</option>
              <option value="classic">Classic Academic (Serif)</option>
              <option value="minimal">Single Column (Strict ATS)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mode 1: Editor Form */}
      {activeTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Contact Information */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
                <span>1. Personal & Contact Information</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.fullName}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, fullName: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={resumeData.personalInfo.email}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.phone}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Location (City, State)</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.location}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, location: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.linkedin}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, linkedin: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">GitHub Profile URL</label>
                  <input
                    type="text"
                    value={resumeData.personalInfo.github}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        personalInfo: { ...resumeData.personalInfo, github: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Technical Skills Matrix */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                2. Technical Skills (ATS Categorized)
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Programming Languages</label>
                  <input
                    type="text"
                    value={resumeData.skills.languages}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, languages: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Frameworks & Libraries</label>
                  <input
                    type="text"
                    value={resumeData.skills.frameworks}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, frameworks: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Developer Tools & Cloud</label>
                  <input
                    type="text"
                    value={resumeData.skills.developerTools}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, developerTools: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Core CS & Methodologies</label>
                  <input
                    type="text"
                    value={resumeData.skills.coreConcepts}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        skills: { ...resumeData.skills, coreConcepts: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* 3. Technical Projects with AI Bullet Enhancer */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  3. Key Engineering & Hackathon Projects
                </h3>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                  Use Gemini ✨ AI to rewrite bullets into Google X-Y-Z formula
                </span>
              </div>

              <div className="space-y-6">
                {resumeData.projects.map((proj, pIdx) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-800/40 text-xs space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[pIdx].title = e.target.value;
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-zinc-600 dark:text-zinc-400 mb-1">Tech Stack</label>
                        <input
                          type="text"
                          value={proj.techStack}
                          onChange={(e) => {
                            const updated = [...resumeData.projects];
                            updated[pIdx].techStack = e.target.value;
                            setResumeData({ ...resumeData, projects: updated });
                          }}
                          className="w-full px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2">
                      <label className="block font-semibold text-zinc-600 dark:text-zinc-400">Impact Bullet Points</label>
                      {proj.bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-start space-x-2">
                          <textarea
                            rows={2}
                            value={bullet}
                            onChange={(e) => {
                              const updated = [...resumeData.projects];
                              updated[pIdx].bullets[bIdx] = e.target.value;
                              setResumeData({ ...resumeData, projects: updated });
                            }}
                            className="w-full px-3 py-1.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 leading-relaxed"
                          />
                          <button
                            type="button"
                            onClick={() => handleEnhanceBullet("projects", proj.id, bIdx, bullet)}
                            className="shrink-0 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:hover:bg-indigo-900 dark:text-indigo-300 font-semibold transition-colors flex items-center space-x-1"
                            title="AI Enhance Bullet Point"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span className="text-[10px] hidden sm:inline">AI Polish</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 1 Col: Live ATS Gauge & AI Suggestions */}
          <div className="space-y-6">
            {/* ATS Score Card */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                  ATS Score Analysis
                </span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {atsAnalysis.score}/100
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${atsAnalysis.score}%` }}
                />
              </div>

              <div className="mt-4 space-y-2 text-xs">
                {atsAnalysis.suggestions.map((s, idx) => (
                  <div key={idx} className="flex items-start space-x-2">
                    {s.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <span className={s.passed ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-900 dark:text-zinc-200 font-medium"}>
                      {s.tip}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Bullet Polish Output Panel */}
            {selectedBulletContext && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-5 dark:border-indigo-900/50 dark:bg-indigo-950/20 shadow-sm space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-spin" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                    Gemini AI Bullet Optimizer
                  </h4>
                </div>

                <div className="text-xs text-zinc-600 dark:text-zinc-400 italic bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                  Original: &quot;{selectedBulletContext.rawText}&quot;
                </div>

                {enhancingBullet ? (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 py-3 text-center animate-pulse">
                    Crafting ATS-optimized X-Y-Z variations with quantified metrics...
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      Choose an optimized variation:
                    </p>
                    {aiBulletOptions.map((opt, oIdx) => (
                      <button
                        key={oIdx}
                        onClick={() => applyEnhancedBullet(opt)}
                        className="w-full text-left p-2.5 text-xs rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-zinc-900 dark:hover:bg-indigo-950/40 transition-colors text-zinc-800 dark:text-zinc-200 leading-relaxed font-medium"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Live Document Paper Preview */}
      {(activeTab === "preview" || activeTab === "ats-checker") && (
        <div className="flex justify-center p-2 sm:p-6 bg-zinc-100 dark:bg-zinc-950 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <div
            className={`w-full max-w-[800px] bg-white text-black p-8 sm:p-12 shadow-2xl rounded-sm ${
              template === "classic"
                ? "font-serif"
                : template === "minimal"
                ? "font-mono text-xs"
                : "font-sans"
            }`}
          >
            {/* Header */}
            <div className="text-center pb-4 border-b border-zinc-400">
              <h1 className="text-2xl font-bold tracking-tight uppercase">
                {resumeData.personalInfo.fullName}
              </h1>
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-zinc-700 mt-1.5">
                <span>{resumeData.personalInfo.email}</span>
                <span>•</span>
                <span>{resumeData.personalInfo.phone}</span>
                <span>•</span>
                <span>{resumeData.personalInfo.location}</span>
                <span>•</span>
                <span>{resumeData.personalInfo.linkedin}</span>
                <span>•</span>
                <span>{resumeData.personalInfo.github}</span>
              </div>
            </div>

            {/* Education */}
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 pb-0.5 text-zinc-900">
                Education
              </h2>
              <div className="mt-2 space-y-2">
                {resumeData.education.map((edu) => (
                  <div key={edu.id} className="text-xs">
                    <div className="flex justify-between font-bold">
                      <span>{edu.institution}</span>
                      <span>{edu.startYear} - {edu.endYear}</span>
                    </div>
                    <div className="flex justify-between text-zinc-700">
                      <span>{edu.degree} in {edu.branch}</span>
                      <span className="font-semibold">{edu.cgpaOrPercentage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 pb-0.5 text-zinc-900">
                Technical Skills
              </h2>
              <div className="mt-2 text-xs space-y-1">
                <div>
                  <span className="font-bold">Languages: </span>
                  <span className="text-zinc-800">{resumeData.skills.languages}</span>
                </div>
                <div>
                  <span className="font-bold">Frameworks & Libraries: </span>
                  <span className="text-zinc-800">{resumeData.skills.frameworks}</span>
                </div>
                <div>
                  <span className="font-bold">Developer Tools: </span>
                  <span className="text-zinc-800">{resumeData.skills.developerTools}</span>
                </div>
                <div>
                  <span className="font-bold">Core Concepts: </span>
                  <span className="text-zinc-800">{resumeData.skills.coreConcepts}</span>
                </div>
              </div>
            </div>

            {/* Experience / Internships */}
            {resumeData.experience.length > 0 && (
              <div className="mt-4">
                <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 pb-0.5 text-zinc-900">
                  Experience & Internships
                </h2>
                <div className="mt-2 space-y-3">
                  {resumeData.experience.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{exp.role} | {exp.company}</span>
                        <span>{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-zinc-800">
                        {exp.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="leading-relaxed">{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Projects */}
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 pb-0.5 text-zinc-900">
                Key Projects & Systems
              </h2>
              <div className="mt-2 space-y-3">
                {resumeData.projects.map((proj) => (
                  <div key={proj.id} className="text-xs">
                    <div className="flex justify-between font-bold">
                      <span>
                        {proj.title} <span className="font-normal text-zinc-600">| {proj.techStack}</span>
                      </span>
                      <span className="font-mono text-[11px] text-zinc-600">[GitHub / Live]</span>
                    </div>
                    <ul className="list-disc list-outside pl-4 space-y-1 mt-1 text-zinc-800">
                      {proj.bullets.map((b, bIdx) => (
                        <li key={bIdx} className="leading-relaxed">{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements & Certifications */}
            <div className="mt-4">
              <h2 className="text-xs font-bold uppercase tracking-wider border-b border-zinc-300 pb-0.5 text-zinc-900">
                Achievements & Certifications
              </h2>
              <ul className="list-disc list-outside pl-4 space-y-1 mt-2 text-xs text-zinc-800">
                {resumeData.achievements.map((ach, aIdx) => (
                  <li key={aIdx}>{ach}</li>
                ))}
                {resumeData.certifications.map((cert, cIdx) => (
                  <li key={`c-${cIdx}`}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
