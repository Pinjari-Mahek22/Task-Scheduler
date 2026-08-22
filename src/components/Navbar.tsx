import React, { useState } from "react";
import {
  GraduationCap,
  Calendar,
  CheckSquare,
  TrendingUp,
  FileText,
  Trophy,
  Mic,
  BookOpen,
  Timer,
  Bot,
  Bell,
  Sun,
  Moon,
  Terminal,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { EngineeringYear, EngineeringBranch, StudentProfile, NotificationItem } from "../types";

export type NavTab =
  | "schedule"
  | "assignments"
  | "placements"
  | "resume"
  | "hackathons"
  | "mock-interview"
  | "notes"
  | "pomodoro"
  | "ai-coach";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  profile: StudentProfile;
  setProfile: React.Dispatch<React.SetStateAction<StudentProfile>>;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  openRunGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  setProfile,
  isDarkMode,
  setIsDarkMode,
  notifications,
  markNotificationRead,
  openRunGuide,
}) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "schedule", label: "Timetable & Attendance", icon: <Calendar className="w-4 h-4" /> },
    { id: "assignments", label: "Assignments & Labs", icon: <CheckSquare className="w-4 h-4" />, badge: "2 Due" },
    { id: "placements", label: "Placement & Skills", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "resume", label: "ATS Resume Builder", icon: <FileText className="w-4 h-4" />, badge: "AI" },
    { id: "hackathons", label: "Hackathon Radar", icon: <Trophy className="w-4 h-4" />, badge: "SIH '26" },
    { id: "mock-interview", label: "Mock Interviews", icon: <Mic className="w-4 h-4" /> },
    { id: "notes", label: "Peer Notes Forum", icon: <BookOpen className="w-4 h-4" /> },
    { id: "pomodoro", label: "Pomodoro Room", icon: <Timer className="w-4 h-4" /> },
    { id: "ai-coach", label: "AI Career Coach", icon: <Bot className="w-4 h-4" />, badge: "Gemini" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b backdrop-blur-md transition-colors duration-200 border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & App Name */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab("schedule")}
              className="flex items-center space-x-2 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-zinc-50">
                    Engg<span className="text-indigo-600 dark:text-indigo-400">Nexus</span>
                  </span>
                  <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    v2.5 Pro
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium hidden sm:block">
                  Student Academic & Placement Hub
                </p>
              </div>
            </button>
          </div>

          {/* Quick Profile Badge & Year Selection */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:text-zinc-200"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{profile.year}</span>
              <span className="hidden md:inline text-zinc-400">|</span>
              <span className="hidden md:inline truncate max-w-[120px]">{profile.branch.split(" ")[0]}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* VS Code Setup & Export Help */}
            <button
              onClick={openRunGuide}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300 transition-colors"
              title="View VS Code run steps and package download instructions"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Run in VS Code</span>
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDrawer(!showNotifDrawer)}
                className="relative p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifsCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                    {unreadNotifsCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDrawer && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-zinc-200 bg-white p-3 shadow-xl dark:border-zinc-800 dark:bg-zinc-900 z-50">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                        Alerts & Deadlines
                      </span>
                    </div>
                    <span className="text-[11px] text-zinc-500">{notifications.length} updates</span>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-72 overflow-y-auto mt-2">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationRead(notif.id)}
                        className={`p-2.5 text-xs rounded-lg transition-colors cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${
                          !notif.read ? "bg-indigo-50/50 dark:bg-indigo-950/20" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span
                            className={`font-semibold ${
                              notif.type === "assignment"
                                ? "text-amber-600 dark:text-amber-400"
                                : notif.type === "hackathon"
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {notif.title}
                          </span>
                          <span className="text-[10px] text-zinc-400">{notif.timestamp}</span>
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-300 mt-1 leading-relaxed">{notif.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode (Late Night Study)"}
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-zinc-700" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-zinc-100 dark:border-zinc-800/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-all duration-150 relative ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                    : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900"
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Edit Student Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  Engineering Student Profile
                </h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Student Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Current Year</label>
                  <select
                    value={profile.year}
                    onChange={(e) => setProfile({ ...profile, year: e.target.value as EngineeringYear })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="SY">Second Year (SY / SE)</option>
                    <option value="TY">Third Year (TY / TE)</option>
                    <option value="Final Year">Final Year (B.Tech / BE)</option>
                    <option value="FY">First Year (FE)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Semester</label>
                  <select
                    value={profile.semester}
                    onChange={(e) => setProfile({ ...profile, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Engineering Branch</label>
                <select
                  value={profile.branch}
                  onChange={(e) => setProfile({ ...profile, branch: e.target.value as EngineeringBranch })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Computer Science & Engg (CSE)">Computer Science & Engg (CSE)</option>
                  <option value="Information Technology (IT)">Information Technology (IT)</option>
                  <option value="AI & Data Science (AI/DS)">AI & Data Science (AI/DS)</option>
                  <option value="Electronics & Telecomm (ENTC)">Electronics & Telecomm (ENTC)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Current CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={profile.cgpa}
                    onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Attendance Goal (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={profile.attendanceGoal}
                    onChange={(e) => setProfile({ ...profile, attendanceGoal: parseInt(e.target.value) || 75 })}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Target Placement Goal</label>
                <select
                  value={profile.targetCompanyType}
                  onChange={(e) => setProfile({ ...profile, targetCompanyType: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Tier-1 Product (FAANG/MNC)">Tier-1 Product (FAANG/MNC) - 20+ LPA</option>
                  <option value="FinTech / High-Frequency">FinTech / High-Frequency Trading - 25+ LPA</option>
                  <option value="Startup Unicorn">High Growth Startup Unicorn - 15+ LPA</option>
                  <option value="Core Engineering">Core Engineering Specialist (Tata, L&T, Siemens)</option>
                  <option value="Higher Studies (GATE/MS)">Higher Studies / Research (GATE / MS abroad)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm"
                >
                  Save Profile Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
