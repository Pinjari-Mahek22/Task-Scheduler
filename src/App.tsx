import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { ScheduleManager } from "./components/ScheduleManager";
import { AssignmentTracker } from "./components/AssignmentTracker";
import { PlacementSkillsHub } from "./components/PlacementSkillsHub";
import { ResumeBuilder } from "./components/ResumeBuilder";
import { HackathonRadar } from "./components/HackathonRadar";
import { MockInterviewHub } from "./components/MockInterviewHub";
import { PeerNotesForum } from "./components/PeerNotesForum";
import { PomodoroRoom } from "./components/PomodoroRoom";
import { AiCareerCoach } from "./components/AiCareerCoach";
import {
  initialStudentProfile,
  initialSchedule,
  initialAssignments,
  initialSkillCategories,
  initialResumeData,
  initialHackathons,
  initialNotifications,
} from "./data/mockData";
import {
  StudentProfile,
  ScheduleEntry,
  Assignment,
  SkillCategory,
  ResumeData,
  HackathonItem,
  NotificationItem,
} from "./types";
import { Sparkles, Calendar, BookOpen, Trophy, Clock, FileText, CheckCircle2 } from "lucide-react";

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    | "schedule"
    | "assignments"
    | "skills"
    | "resume"
    | "hackathons"
    | "interviews"
    | "notes"
    | "pomodoro"
    | "coach"
  >("schedule");

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem("enggnexus_theme");
    return saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  // Profile state with local storage
  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem("enggnexus_profile");
      return saved ? JSON.parse(saved) : initialStudentProfile;
    } catch {
      return initialStudentProfile;
    }
  });

  // State data
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(() => {
    try {
      const saved = localStorage.getItem("enggnexus_schedule");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialSchedule;
    } catch {
      return initialSchedule;
    }
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    try {
      const saved = localStorage.getItem("enggnexus_assignments");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialAssignments;
    } catch {
      return initialAssignments;
    }
  });

  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>(() => {
    try {
      const saved = localStorage.getItem("enggnexus_skills");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialSkillCategories;
    } catch {
      return initialSkillCategories;
    }
  });

  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    try {
      const saved = localStorage.getItem("enggnexus_resume");
      return saved ? JSON.parse(saved) : initialResumeData;
    } catch {
      return initialResumeData;
    }
  });

  const [hackathons, setHackathons] = useState<HackathonItem[]>(() => {
    try {
      const saved = localStorage.getItem("enggnexus_hackathons");
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialHackathons;
    } catch {
      return initialHackathons;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  // Sync dark mode class with root html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("enggnexus_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("enggnexus_theme", "light");
    }
  }, [isDarkMode]);

  // Persist states
  useEffect(() => {
    localStorage.setItem("enggnexus_profile", JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem("enggnexus_schedule", JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem("enggnexus_assignments", JSON.stringify(assignments));
  }, [assignments]);

  useEffect(() => {
    localStorage.setItem("enggnexus_skills", JSON.stringify(skillCategories));
  }, [skillCategories]);

  useEffect(() => {
    localStorage.setItem("enggnexus_resume", JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    localStorage.setItem("enggnexus_hackathons", JSON.stringify(hackathons));
  }, [hackathons]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Quick summary counts for hero banner
  const pendingAssignments = assignments.filter((a) => a.status !== "Submitted").length;
  const verifiedHackathons = hackathons.length;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 font-sans transition-colors duration-200">
      {/* Top Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        setProfile={setProfile}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Quick Breadcrumb / Active Context Indicator (hidden in print) */}
        <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">{profile.college}</span>
            <span>/</span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">{profile.year} • {profile.branch}</span>
            <span>/</span>
            <span className="capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Synced with SPPU / Academic Portal</span>
            </div>
          </div>
        </div>

        {/* Tab Content Rendering */}
        {activeTab === "schedule" && (
          <ScheduleManager
            schedules={schedule}
            setSchedules={setSchedule}
            profile={profile}
          />
        )}

        {activeTab === "assignments" && (
          <AssignmentTracker
            assignments={assignments}
            setAssignments={setAssignments}
          />
        )}

        {activeTab === "skills" && (
          <PlacementSkillsHub
            skillCategories={skillCategories}
            setSkillCategories={setSkillCategories}
            profile={profile}
          />
        )}

        {activeTab === "resume" && (
          <ResumeBuilder
            resumeData={resumeData}
            setResumeData={setResumeData}
            profile={profile}
          />
        )}

        {activeTab === "hackathons" && (
          <HackathonRadar
            hackathons={hackathons}
            setHackathons={setHackathons}
            profile={profile}
          />
        )}

        {activeTab === "interviews" && (
          <MockInterviewHub profile={profile} />
        )}

        {activeTab === "notes" && (
          <PeerNotesForum profile={profile} />
        )}

        {activeTab === "pomodoro" && (
          <PomodoroRoom assignments={assignments} />
        )}

        {activeTab === "coach" && (
          <AiCareerCoach profile={profile} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 mt-16 py-8 text-xs text-zinc-500 dark:text-zinc-400 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-zinc-900 dark:text-zinc-100">EnggNexus</span>
            <span>•</span>
            <span>Comprehensive Academic & Placement OS for Engineering Students (SY/TY/Final Year)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span>Powered by Gemini 2.5 AI & Web Audio Synthesizer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
