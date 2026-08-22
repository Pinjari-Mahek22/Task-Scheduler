import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  BookOpen,
  Filter,
  BarChart3,
} from "lucide-react";
import { ScheduleItem, ClassType, StudentProfile } from "../types";

interface ScheduleManagerProps {
  schedules: ScheduleItem[];
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  profile: StudentProfile;
}

export const ScheduleManager: React.FC<ScheduleManagerProps> = ({
  schedules = [],
  setSchedules,
  profile,
}) => {
  const days: ("Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday")[] = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const todayIndex = new Date().getDay(); // 0 is Sun, 1 is Mon...
  const currentDayName = todayIndex >= 1 && todayIndex <= 6 ? days[todayIndex - 1] : "Monday";

  const [selectedDay, setSelectedDay] = useState<string>(currentDayName);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "attendance">("daily");
  const [showAddModal, setShowAddModal] = useState(false);

  // New Schedule form state
  const [newSubject, setNewSubject] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<ClassType>("Lecture");
  const [newDay, setNewDay] = useState<"Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday">("Monday");
  const [newStartTime, setNewStartTime] = useState("09:00");
  const [newEndTime, setNewEndTime] = useState("10:00");
  const [newRoom, setNewRoom] = useState("LH-302");
  const [newFaculty, setNewFaculty] = useState("Prof. Sharma");

  // Handle Attendance changes
  const markAttendance = (id: string, attended: boolean) => {
    setSchedules((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newAttended = attended ? item.attendedCount + 1 : item.attendedCount;
          const newTotal = item.totalConducted + 1;
          return { ...item, attendedCount: newAttended, totalConducted: newTotal };
        }
        return item;
      })
    );
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const newItem: ScheduleItem = {
      id: `sch-${Date.now()}`,
      subject: newSubject.trim(),
      code: newCode.trim() || "CS" + Math.floor(100 + Math.random() * 900),
      type: newType,
      day: newDay,
      startTime: newStartTime,
      endTime: newEndTime,
      room: newRoom.trim() || "LH-101",
      faculty: newFaculty.trim() || "Faculty Member",
      batch: newType === "Lab" ? "Batch B1" : "All",
      attendedCount: 0,
      totalConducted: 0,
      color: ["indigo", "emerald", "amber", "purple", "rose", "sky"][Math.floor(Math.random() * 6)],
    };

    setSchedules((prev) => [...prev, newItem]);
    setNewSubject("");
    setNewCode("");
    setShowAddModal(false);
  };

  // Calculate overall attendance stats
  const totalAttended = schedules.reduce((acc, curr) => acc + curr.attendedCount, 0);
  const totalConducted = schedules.reduce((acc, curr) => acc + curr.totalConducted, 0);
  const overallPercentage = totalConducted > 0 ? ((totalAttended / totalConducted) * 100).toFixed(1) : "100.0";
  const numOverall = parseFloat(overallPercentage);

  const getFilteredSchedulesForDay = (day: string) => {
    return schedules
      .filter((s) => s.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getBunkAnalysis = (attended: number, total: number, target = profile.attendanceGoal || 75) => {
    if (total === 0) return { status: "safe", message: "No classes conducted yet" };
    const currentPercent = (attended / total) * 100;
    const targetDecimal = target / 100;

    if (currentPercent >= target) {
      // How many classes can be safely missed?
      // (attended) / (total + x) >= targetDecimal  =>  x <= (attended / targetDecimal) - total
      const canMiss = Math.floor(attended / targetDecimal - total);
      if (canMiss > 0) {
        return {
          status: "safe",
          currentPercent: currentPercent.toFixed(1),
          message: `Safe! You can miss ${canMiss} ${canMiss === 1 ? "class" : "classes"} and stay ≥${target}%`,
        };
      }
      return {
        status: "safe",
        currentPercent: currentPercent.toFixed(1),
        message: `Right at boundary! Don't miss next class.`,
      };
    } else {
      // How many consecutive classes must be attended to reach target?
      // (attended + x) / (total + x) >= targetDecimal => x >= (targetDecimal * total - attended) / (1 - targetDecimal)
      const mustAttend = Math.ceil((targetDecimal * total - attended) / (1 - targetDecimal));
      return {
        status: "danger",
        currentPercent: currentPercent.toFixed(1),
        message: `Warning: Must attend next ${mustAttend} ${mustAttend === 1 ? "class" : "classes"} consecutively to reach ${target}%`,
      };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Attendance Overview banner */}
      <div className="rounded-2xl border p-5 sm:p-6 transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {profile.year} • Semester {profile.semester}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {profile.branch}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Class Timetable & 75% Attendance Guard
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Live timetable, room allotments, and automated university attendance safety margins.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/60 min-w-[140px]">
              <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                Overall Attendance
              </div>
              <div className="flex items-baseline space-x-2 mt-1">
                <span
                  className={`text-2xl font-black ${
                    numOverall >= profile.attendanceGoal
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {overallPercentage}%
                </span>
                <span className="text-xs text-zinc-400">({totalAttended}/{totalConducted})</span>
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lecture/Lab</span>
            </button>
          </div>
        </div>

        {/* View Switcher & Day Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex space-x-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 w-fit">
            <button
              onClick={() => setViewMode("daily")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === "daily"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Daily Schedule
            </button>
            <button
              onClick={() => setViewMode("weekly")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === "weekly"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Weekly Grid
            </button>
            <button
              onClick={() => setViewMode("attendance")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === "attendance"
                  ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
              }`}
            >
              Attendance Calculator
            </button>
          </div>

          {viewMode === "daily" && (
            <div className="flex space-x-1 overflow-x-auto pb-1 scrollbar-none">
              {days.map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDay(d)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedDay === d
                      ? "bg-indigo-600 text-white font-semibold shadow-sm dark:bg-indigo-500"
                      : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                  }`}
                >
                  {d}
                  {d === currentDayName && (
                    <span className="ml-1.5 w-1.5 h-1.5 inline-block rounded-full bg-emerald-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mode 1: Daily Schedule View */}
      {viewMode === "daily" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Classes for {selectedDay} ({getFilteredSchedulesForDay(selectedDay).length} sessions)
            </h3>
            <span className="text-xs text-zinc-400">
              Click &apos;+ Attend&apos; or &apos;- Miss&apos; to keep live log
            </span>
          </div>

          {getFilteredSchedulesForDay(selectedDay).length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-200 p-8 text-center dark:border-zinc-800">
              <Calendar className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                No classes scheduled for {selectedDay}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                Enjoy your study & placement prep session or click &quot;Add Lecture/Lab&quot; above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getFilteredSchedulesForDay(selectedDay).map((item) => {
                const bunkInfo = getBunkAnalysis(item.attendedCount, item.totalConducted, profile.attendanceGoal);
                const percentNum = item.totalConducted > 0 ? (item.attendedCount / item.totalConducted) * 100 : 100;

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border p-4 transition-all duration-150 border-zinc-200 bg-white hover:border-indigo-200 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                            item.type === "Lab"
                              ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                              : item.type === "Seminar"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs font-mono font-bold text-zinc-400">
                          {item.code}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        <span>
                          {item.startTime} - {item.endTime}
                        </span>
                      </div>
                    </div>

                    <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-2">
                      {item.subject}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.room}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        <span>{item.faculty}</span>
                      </span>
                      {item.batch && (
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-medium">
                          {item.batch}
                        </span>
                      )}
                    </div>

                    {/* Attendance Mini Bar & Action */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-medium text-zinc-600 dark:text-zinc-400">
                          Attendance: {item.attendedCount}/{item.totalConducted} classes
                        </span>
                        <span
                          className={`font-bold ${
                            percentNum >= profile.attendanceGoal
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {percentNum.toFixed(1)}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            percentNum >= profile.attendanceGoal ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${Math.min(100, percentNum)}%` }}
                        />
                      </div>

                      {/* Bunk advice */}
                      <div className="flex items-center justify-between mt-3 text-[11px]">
                        <span
                          className={`font-medium ${
                            bunkInfo.status === "safe"
                              ? "text-emerald-700 dark:text-emerald-400"
                              : "text-rose-700 dark:text-rose-400"
                          }`}
                        >
                          {bunkInfo.message}
                        </span>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => markAttendance(item.id, true)}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 dark:text-emerald-300 font-semibold text-[11px] transition-colors"
                          >
                            + Attended
                          </button>
                          <button
                            onClick={() => markAttendance(item.id, false)}
                            className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 dark:text-rose-300 font-semibold text-[11px] transition-colors"
                          >
                            - Missed
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Weekly Timetable Grid */}
      {viewMode === "weekly" && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 overflow-x-auto shadow-sm">
          <table className="w-full min-w-[700px] text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 text-left font-bold text-zinc-500 uppercase tracking-wider w-28">
                  Day
                </th>
                <th className="p-3 text-left font-bold text-zinc-500 uppercase tracking-wider">
                  Scheduled Classes & Labs
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
              {days.map((day) => {
                const dayClasses = getFilteredSchedulesForDay(day);
                return (
                  <tr key={day} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100 align-top">
                      {day}
                      {day === currentDayName && (
                        <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {dayClasses.length === 0 ? (
                        <span className="text-zinc-400 italic">No scheduled sessions</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {dayClasses.map((c) => (
                            <div
                              key={c.id}
                              className="p-2 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50 text-xs min-w-[200px]"
                            >
                              <div className="flex items-center justify-between font-mono font-semibold text-[11px] text-indigo-600 dark:text-indigo-400">
                                <span>{c.startTime} - {c.endTime}</span>
                                <span className="uppercase text-[9px] px-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300">
                                  {c.type}
                                </span>
                              </div>
                              <div className="font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                                {c.subject}
                              </div>
                              <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 flex justify-between">
                                <span>{c.room}</span>
                                <span>{c.faculty.split(" ")[1] || c.faculty}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mode 3: Attendance Deep Dive & Bunk Predictor */}
      {viewMode === "attendance" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/50 dark:bg-indigo-950/20 flex items-start space-x-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed text-indigo-950 dark:text-indigo-200">
              <span className="font-bold">Automated 75% University Attendance Engine: </span>
              Under university ordinances, maintaining ≥75% in each theory and practical subject is mandatory to obtain exam hall tickets. The predictor below calculates exactly how many lectures you can safely bunk or how many you must attend consecutively to recover your eligibility.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schedules.map((item) => {
              const bunkInfo = getBunkAnalysis(item.attendedCount, item.totalConducted, profile.attendanceGoal);
              const percentNum = item.totalConducted > 0 ? (item.attendedCount / item.totalConducted) * 100 : 100;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border p-4 border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {item.subject}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                        {item.code} • {item.type}
                      </p>
                    </div>
                    <div
                      className={`text-right font-black text-lg ${
                        percentNum >= profile.attendanceGoal
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {percentNum.toFixed(1)}%
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          percentNum >= profile.attendanceGoal ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, percentNum)}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 text-xs font-medium flex items-center justify-between">
                    <span
                      className={
                        bunkInfo.status === "safe"
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400 font-semibold"
                      }
                    >
                      {bunkInfo.message}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {item.attendedCount} / {item.totalConducted} attended
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Add Timetable Class / Lab
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddClass} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Subject Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design & Analysis of Algorithms"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Subject Code
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CS305"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Session Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as ClassType)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Lecture">Lecture (Theory)</option>
                    <option value="Lab">Practical / Lab</option>
                    <option value="Tutorial">Tutorial</option>
                    <option value="Seminar">Seminar / TP</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Day
                  </label>
                  <select
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value as any)}
                    className="w-full px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {days.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Classroom / Lab
                  </label>
                  <input
                    type="text"
                    placeholder="LH-302 / Lab 4"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Faculty Name
                  </label>
                  <input
                    type="text"
                    placeholder="Prof. Name"
                    value={newFaculty}
                    onChange={(e) => setNewFaculty(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm"
                >
                  Save to Timetable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
