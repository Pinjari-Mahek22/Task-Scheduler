import React, { useState } from "react";
import {
  CheckSquare,
  Clock,
  Calendar,
  AlertCircle,
  Plus,
  ExternalLink,
  Download,
  Share2,
  Filter,
  CheckCircle2,
  FileCode,
  FileText,
  BookMarked,
  Sparkles,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Assignment, PriorityLevel, SubmissionFormat, SubmissionStatus } from "../types";
import {
  downloadIcsFile,
  generateAssignmentIcs,
  generateFullCalendarIcs,
  getGoogleCalendarUrl,
} from "../utils/calendarSync";

interface AssignmentTrackerProps {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
}

export const AssignmentTracker: React.FC<AssignmentTrackerProps> = ({
  assignments,
  setAssignments,
}) => {
  const [filterSubject, setFilterSubject] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);

  // New assignment form state
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Database Management Systems");
  const [newDueDate, setNewDueDate] = useState(
    new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString().slice(0, 16)
  );
  const [newPriority, setNewPriority] = useState<PriorityLevel>("High");
  const [newFormat, setNewFormat] = useState<SubmissionFormat>("PDF Report");
  const [newDescription, setNewDescription] = useState("");
  const [newMaxMarks, setNewMaxMarks] = useState(25);

  const subjects = Array.from(new Set(assignments.map((a) => a.subject)));

  const handleToggleStatus = (id: string) => {
    setAssignments((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus: SubmissionStatus = item.status === "Submitted" ? "In Progress" : "Submitted";
          if (newStatus === "Submitted") {
            confetti({
              particleCount: 80,
              spread: 60,
              origin: { y: 0.7 },
            });
          }
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: Assignment = {
      id: `ass-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject,
      dueDate: newDueDate,
      priority: newPriority,
      status: "Pending",
      format: newFormat,
      description: newDescription.trim() || "Complete practical assignment according to university guidelines.",
      maxMarks: newMaxMarks,
      calendarSynced: false,
    };

    setAssignments((prev) => [newItem, ...prev]);
    setNewTitle("");
    setNewDescription("");
    setShowAddModal(false);
  };

  const handleExportFullCalendar = () => {
    const icsContent = generateFullCalendarIcs(assignments, []);
    downloadIcsFile("EnggNexus_Student_Deadlines.ics", icsContent);
  };

  const calculateTimeRemaining = (dueDateStr: string) => {
    const now = Date.now();
    const target = new Date(dueDateStr).getTime();
    const diff = target - now;

    if (diff < 0) {
      const hoursAgo = Math.abs(Math.floor(diff / (1000 * 60 * 60)));
      return { text: `Overdue by ${hoursAgo}h`, isOverdue: true, isUrgent: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days === 0) {
      return { text: `Due in ${hours}h`, isOverdue: false, isUrgent: true };
    } else if (days === 1) {
      return { text: `Due Tomorrow`, isOverdue: false, isUrgent: true };
    } else {
      return { text: `Due in ${days} days`, isOverdue: false, isUrgent: false };
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filterSubject !== "all" && a.subject !== filterSubject) return false;
    if (filterStatus !== "all") {
      if (filterStatus === "pending" && a.status === "Submitted") return false;
      if (filterStatus === "submitted" && a.status !== "Submitted") return false;
    }
    return true;
  });

  const pendingCount = assignments.filter((a) => a.status !== "Submitted").length;
  const submittedCount = assignments.filter((a) => a.status === "Submitted").length;

  return (
    <div className="space-y-6">
      {/* Header Banner & Calendar Sync */}
      <div className="rounded-2xl border p-5 sm:p-6 transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Academic Task & Lab Hub
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                {pendingCount} Pending • {submittedCount} Submitted
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Assignments & Lab Submissions Tracker
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Automatic countdown timers, university submission formats, and 1-click personal calendar sync.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportFullCalendar}
              className="flex items-center space-x-2 px-3 py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-200 text-xs font-semibold transition-colors"
              title="Download .ICS file to import into Google Calendar, Apple Calendar, or Outlook"
            >
              <Download className="w-4 h-4 text-indigo-500" />
              <span>Export All to .ICS Calendar</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Assignment</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Only</option>
              <option value="submitted">Submitted Only</option>
            </select>
          </div>

          <div className="text-xs text-zinc-400">
            Showing {filteredAssignments.length} assignment records
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAssignments.map((ass) => {
          const timeInfo = calculateTimeRemaining(ass.dueDate);
          const isDone = ass.status === "Submitted";
          const gcalUrl = getGoogleCalendarUrl(ass);

          return (
            <div
              key={ass.id}
              className={`rounded-2xl border p-5 transition-all duration-200 bg-white dark:bg-zinc-900 shadow-sm ${
                isDone
                  ? "border-emerald-200/80 bg-emerald-50/10 dark:border-emerald-950/40"
                  : timeInfo.isOverdue
                  ? "border-rose-300 dark:border-rose-900/60"
                  : timeInfo.isUrgent
                  ? "border-amber-300 dark:border-amber-900/60"
                  : "border-zinc-200 dark:border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${
                      ass.priority === "High"
                        ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                        : ass.priority === "Medium"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {ass.priority} Priority
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                    {ass.format}
                  </span>
                </div>

                {/* Urgency Badge */}
                <div
                  className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    isDone
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : timeInfo.isOverdue
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 animate-pulse"
                      : timeInfo.isUrgent
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{isDone ? "Submitted" : timeInfo.text}</span>
                </div>
              </div>

              {/* Title & Subject */}
              <h3 className={`font-bold text-base mt-3 text-zinc-900 dark:text-zinc-100 ${isDone ? "line-through opacity-75" : ""}`}>
                {ass.title}
              </h3>
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-0.5">
                {ass.subject}
              </p>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed line-clamp-2">
                {ass.description}
              </p>

              {/* Deadline time format */}
              <div className="flex items-center space-x-2 text-xs text-zinc-500 dark:text-zinc-400 mt-3 font-mono">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  Due: {new Date(ass.dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at{" "}
                  {new Date(ass.dueDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
                {ass.maxMarks && <span className="text-zinc-400">({ass.maxMarks} Marks)</span>}
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <button
                  onClick={() => handleToggleStatus(ass.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isDone
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : "border border-zinc-300 hover:bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isDone ? "Mark as Incomplete" : "Mark as Submitted"}</span>
                </button>

                {/* Calendar Sync Options */}
                <div className="flex items-center space-x-2">
                  <a
                    href={gcalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300"
                    title="Add to Google Calendar directly"
                  >
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>+ Google Cal</span>
                  </a>

                  <button
                    onClick={() => {
                      const ics = generateAssignmentIcs(ass);
                      downloadIcsFile(`${ass.title.slice(0, 20)}.ics`, ics);
                    }}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800"
                    title="Download .ICS for this assignment"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                New Assignment / Practical Submission
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAssignment} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Assignment 4: Multithreading in OS"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as PriorityLevel)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Due Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Format
                  </label>
                  <select
                    value={newFormat}
                    onChange={(e) => setNewFormat(e.target.value as SubmissionFormat)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="PDF Report">PDF Report</option>
                    <option value="GitHub Repo">GitHub Repo</option>
                    <option value="Lab Manual / Hardcopy">Lab Manual / Hardcopy</option>
                    <option value="Viva Demo">Viva / Project Demo</option>
                    <option value="Google Form">Google Form</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description / Questions / Rubric
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide details, problem statement, or submission link..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm"
                >
                  Create & Schedule Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
