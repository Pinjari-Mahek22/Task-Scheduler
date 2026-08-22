import React, { useState } from "react";
import {
  TrendingUp,
  CheckCircle2,
  CircleDot,
  ExternalLink,
  Code2,
  Cpu,
  Layers,
  Network,
  Sparkles,
  Award,
  BookOpen,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { SkillCategory, StudentProfile } from "../types";

interface PlacementSkillsHubProps {
  skillCategories: SkillCategory[];
  setSkillCategories: React.Dispatch<React.SetStateAction<SkillCategory[]>>;
  profile: StudentProfile;
}

export const PlacementSkillsHub: React.FC<PlacementSkillsHubProps> = ({
  skillCategories,
  setSkillCategories,
  profile,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const cycleSkillStatus = (categoryId: string, skillId: string) => {
    setSkillCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryId) {
          return {
            ...cat,
            skills: cat.skills.map((s) => {
              if (s.id === skillId) {
                const nextStatus =
                  s.status === "Not Started"
                    ? "Learning"
                    : s.status === "Learning"
                    ? "Mastered"
                    : "Not Started";
                return { ...s, status: nextStatus };
              }
              return s;
            }),
          };
        }
        return cat;
      })
    );
  };

  // Compute skill statistics
  let totalSkillsCount = 0;
  let masteredCount = 0;
  let learningCount = 0;

  skillCategories.forEach((cat) => {
    cat.skills.forEach((s) => {
      totalSkillsCount++;
      if (s.status === "Mastered") masteredCount++;
      if (s.status === "Learning") learningCount++;
    });
  });

  const readinessScore = Math.round(((masteredCount * 1.0 + learningCount * 0.4) / totalSkillsCount) * 100);

  const roadmapMilestones = [
    {
      semester: "SY • Sem 3 & 4",
      title: "Foundational Mastery & DSA Core",
      points: [
        "Master C++/Java STL, solve 150+ LeetCode (Arrays, Trees, Strings, Linked Lists)",
        "Deep dive into Object Oriented Programming (OOP) & Database Management Systems",
        "Build 1 polished Full-Stack web project & push clean Git commits",
      ],
      badge: profile.year === "SY" ? "Current Stage" : "Completed",
    },
    {
      semester: "TY • Sem 5 & 6",
      title: "Advanced DSA, System Design & Hackathons",
      points: [
        "Solve 350+ LeetCode (DP, Graphs, Tries, Sliding Window)",
        "Participate in Smart India Hackathon (SIH), Flipkart GRiD, or Devpost Hackathons",
        "Master Operating Systems internals (Paging, Semaphores) & Computer Networks",
        "Craft ATS-friendly 1-page Resume & prepare STAR behavioral answers",
      ],
      badge: profile.year === "TY" ? "Current Stage" : "Upcoming",
    },
    {
      semester: "Final Year • Sem 7 & 8",
      title: "On-Campus Day-1 Hiring & Off-Campus Blitz",
      points: [
        "Company-specific coding test simulations & live mock interviews",
        "Capstone Major Project viva demo & deployment with Docker/Cloud",
        "Negotiate Tier-1 Product & FinTech job offers",
      ],
      badge: profile.year === "Final Year" ? "Current Stage" : "Future Milestone",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Placement Readiness Banner */}
      <div className="rounded-2xl border p-5 sm:p-6 transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Industry Skills Dashboard
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Target: {profile.targetCompanyType}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Engineering Placement & Technical Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
              Curated syllabus matrices for Tier-1 Product, FinTech, and Core Engineering interviews. Click any skill chip to update your preparation status.
            </p>
          </div>

          {/* Readiness Gauge Card */}
          <div className="p-4 sm:p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/40 dark:bg-indigo-950/20 min-w-[260px]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                Placement Readiness
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded bg-indigo-600 text-white">
                {readinessScore}%
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${readinessScore}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center mt-3 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs">
              <div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400">{masteredCount}</div>
                <div className="text-[10px] text-zinc-500">Mastered</div>
              </div>
              <div>
                <div className="font-bold text-amber-600 dark:text-amber-400">{learningCount}</div>
                <div className="text-[10px] text-zinc-500">Learning</div>
              </div>
              <div>
                <div className="font-bold text-zinc-400">{totalSkillsCount - masteredCount - learningCount}</div>
                <div className="text-[10px] text-zinc-500">To Do</div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 overflow-x-auto mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === "all"
                ? "bg-indigo-600 text-white dark:bg-indigo-500"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            All Tracks ({totalSkillsCount})
          </button>
          {skillCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-indigo-600 text-white dark:bg-indigo-500"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              {cat.name.split(" ")[0]} ({cat.skills.length})
            </button>
          ))}
        </div>
      </div>

      {/* Skills Matrix Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skillCategories
          .filter((cat) => selectedCategory === "all" || cat.id === selectedCategory)
          .map((cat) => (
            <div
              key={cat.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm"
            >
              <div className="flex items-center space-x-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-zinc-500">
                    {cat.skills.filter((s) => s.status === "Mastered").length} of {cat.skills.length} mastered
                  </p>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 mt-3">
                {cat.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="py-3 flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100 leading-snug">
                          {skill.title}
                        </span>
                        {skill.practiceUrl && (
                          <a
                            href={skill.practiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            title="Open practice problems"
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-zinc-500">
                        <span
                          className={`font-semibold ${
                            skill.importance === "Crucial for Placements"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-zinc-400"
                          }`}
                        >
                          {skill.importance}
                        </span>
                        <span>•</span>
                        <span>{skill.level}</span>
                      </div>
                    </div>

                    {/* Status Toggle Button */}
                    <button
                      onClick={() => cycleSkillStatus(cat.id, skill.id)}
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        skill.status === "Mastered"
                          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300"
                          : skill.status === "Learning"
                          ? "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300"
                          : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}
                      title="Click to cycle: Not Started -> Learning -> Mastered"
                    >
                      {skill.status}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* Semester by Semester Placement Roadmap Guide */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex items-center space-x-2 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
            Semester-by-Semester Placement Strategy for {profile.year} Students
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {roadmapMilestones.map((m, idx) => (
            <div
              key={idx}
              className="rounded-xl border p-4 border-zinc-200 bg-zinc-50/50 dark:border-zinc-800 dark:bg-zinc-800/40 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {m.semester}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      m.badge === "Current Stage"
                        ? "bg-emerald-500 text-white"
                        : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {m.badge}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2">
                  {m.title}
                </h4>
                <ul className="space-y-2 mt-3 text-xs text-zinc-600 dark:text-zinc-300">
                  {m.points.map((p, pIdx) => (
                    <li key={pIdx} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
