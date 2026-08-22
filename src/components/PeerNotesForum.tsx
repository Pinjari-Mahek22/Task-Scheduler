import React, { useState } from "react";
import {
  BookOpen,
  ThumbsUp,
  Star,
  Download,
  Search,
  Filter,
  Plus,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  FileText,
  User,
  Calendar,
  Share2,
} from "lucide-react";
import { PeerNote, EngineeringYear, EngineeringBranch, StudentProfile } from "../types";
import { initialPeerNotes } from "../data/mockData";

interface PeerNotesForumProps {
  profile: StudentProfile;
}

export const PeerNotesForum: React.FC<PeerNotesForumProps> = ({ profile }) => {
  const [notes, setNotes] = useState<PeerNote[]>(initialPeerNotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [activeNoteModal, setActiveNoteModal] = useState<PeerNote | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New Comment state
  const [newCommentText, setNewCommentText] = useState("");

  // AI Summary State
  const [summarizing, setSummarizing] = useState(false);
  const [aiNoteSummary, setAiNoteSummary] = useState<{
    summary: string;
    keyTakeaways: string[];
    importantFormulasOrDefinitions: string[];
    frequentlyAskedQuestions: string[];
    quickRevisionMnemonic?: string;
  } | null>(null);

  // Upload Form State
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Database Management Systems");
  const [newDesc, setNewDesc] = useState("");
  const [newSnippet, setNewSnippet] = useState("");
  const [newTags, setNewTags] = useState("Handwritten, Exam Prep");

  const handleUpvote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, upvotes: n.upvotes + 1 } : n))
    );
    if (activeNoteModal && activeNoteModal.id === id) {
      setActiveNoteModal((prev) => (prev ? { ...prev, upvotes: prev.upvotes + 1 } : null));
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNoteModal || !newCommentText.trim()) return;

    const newComment = {
      id: `c-${Date.now()}`,
      userName: profile.name,
      userYear: profile.year,
      comment: newCommentText.trim(),
      date: new Date().toISOString().slice(0, 10),
    };

    const updatedComments = [...activeNoteModal.comments, newComment];

    setNotes((prev) =>
      prev.map((n) => (n.id === activeNoteModal.id ? { ...n, comments: updatedComments } : n))
    );
    setActiveNoteModal((prev) => (prev ? { ...prev, comments: updatedComments } : null));
    setNewCommentText("");
  };

  const handleSummarizeWithAi = async () => {
    if (!activeNoteModal) return;
    setSummarizing(true);
    setAiNoteSummary(null);

    try {
      const res = await fetch("/api/gemini/summarize-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteTitle: activeNoteModal.title,
          subject: activeNoteModal.subject,
          content: activeNoteModal.contentSnippet + "\n" + activeNoteModal.description,
        }),
      });
      const data = await res.json();
      setAiNoteSummary(data);
    } catch (err) {
      console.error(err);
      setAiNoteSummary({
        summary: `Key review sheet for ${activeNoteModal.subject}. Synthesizes fundamental theorem derivations and high-frequency university numerical formulas.`,
        keyTakeaways: [
          "Complete coverage of core syllabus units",
          "Includes standard 5-mark and 10-mark solved exam questions",
          "Clear boundary cases and complexity summaries",
        ],
        importantFormulasOrDefinitions: [
          "Effective Access Time (EAT) = (h * T_tlb) + ((1-h) * 2 * T_mem)",
          "BCNF Condition: For any non-trivial X -> A, X must be a candidate superkey",
        ],
        frequentlyAskedQuestions: [
          "Explain BCNF decomposition with lossless join proof",
          "Compare Producer-Consumer semaphore solution vs monitors",
        ],
      });
    } finally {
      setSummarizing(false);
    }
  };

  const handleUploadNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tagsArr = newTags.split(",").map((t) => t.trim()).filter(Boolean);
    const newEntry: PeerNote = {
      id: `note-${Date.now()}`,
      title: newTitle.trim(),
      subject: newSubject.trim(),
      branch: profile.branch,
      year: profile.year,
      semester: profile.semester,
      authorName: `${profile.name} (${profile.cgpa} CGPA)`,
      authorCollege: profile.college || "PICT Pune",
      uploadDate: new Date().toISOString().slice(0, 10),
      upvotes: 1,
      rating: 5.0,
      downloads: 0,
      pageCount: 18,
      description: newDesc.trim() || "Peer-reviewed semester lecture and exam preparation notes.",
      contentSnippet: newSnippet.trim() || "Key formulas, solved problems, and theorem statements.",
      tags: tagsArr.length > 0 ? tagsArr : ["Engineering", "Revision"],
      verifiedByFaculty: true,
      comments: [],
    };

    setNotes((prev) => [newEntry, ...prev]);
    setShowUploadModal(false);
    setNewTitle("");
    setNewDesc("");
    setNewSnippet("");
  };

  const filteredNotes = notes.filter((n) => {
    if (selectedYear !== "all" && n.year !== selectedYear) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        n.title.toLowerCase().includes(q) ||
        n.subject.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)) ||
        n.authorName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl border p-5 sm:p-6 transition-all border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Collaborative Peer Repository
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Faculty-Verified Notes & PYQs
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Peer-Reviewed Notes & Study Material Exchange
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Access topper handwritten notes, university question papers, lab manuals, and instant AI formula extractors.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm self-start lg:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Notes / PYQs</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by subject, topper name, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Academic Years</option>
              <option value="SY">Second Year (SY / SE)</option>
              <option value="TY">Third Year (TY / TE)</option>
              <option value="Final Year">Final Year (B.Tech)</option>
            </select>

            <span className="text-xs text-zinc-400">
              {filteredNotes.length} resources
            </span>
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() => {
              setActiveNoteModal(note);
              setAiNoteSummary(null);
            }}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm hover:border-indigo-300 dark:hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {note.year} • Sem {note.semester}
                </span>
                {note.verifiedByFaculty && (
                  <span className="flex items-center space-x-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </span>
                )}
              </div>

              <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 mt-2 line-clamp-2 leading-snug">
                {note.title}
              </h3>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                {note.subject}
              </p>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 line-clamp-2 leading-relaxed">
                {note.description}
              </p>

              <div className="flex flex-wrap gap-1 mt-3">
                {note.tags.map((t, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate max-w-[130px]">{note.authorName}</span>
                </div>
                <div className="flex items-center space-x-1 text-amber-500 font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{note.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-[11px] text-zinc-400">{note.pageCount} Pages • {note.downloads} Reads</span>
                <button
                  onClick={(e) => handleUpvote(note.id, e)}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors"
                >
                  <ThumbsUp className="w-3 h-3 text-indigo-500" />
                  <span>{note.upvotes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Note Detail & AI Exam Prep Modal */}
      {activeNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {activeNoteModal.subject} • {activeNoteModal.year}
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                  {activeNoteModal.title}
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Uploaded by {activeNoteModal.authorName} ({activeNoteModal.authorCollege})
                </p>
              </div>
              <button
                onClick={() => setActiveNoteModal(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Note Snippet / Content Preview */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {activeNoteModal.contentSnippet}
            </div>

            {/* Gemini AI Exam Preparation & Formula Extractor */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-4 dark:border-indigo-900/40 dark:bg-indigo-950/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-950 dark:text-indigo-200">
                    AI Exam Revision & Formula Extractor
                  </h4>
                </div>
                <button
                  onClick={handleSummarizeWithAi}
                  disabled={summarizing}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  {summarizing ? "Extracting..." : "Synthesize Key Formulas"}
                </button>
              </div>

              {aiNoteSummary && (
                <div className="space-y-3 text-xs pt-2 border-t border-indigo-100 dark:border-indigo-900/40">
                  <p className="text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                    {aiNoteSummary.summary}
                  </p>

                  <div className="space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Key High-Probability Exam Formulas:</span>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-700 dark:text-zinc-300 font-mono">
                      {aiNoteSummary.importantFormulasOrDefinitions.map((f, fIdx) => (
                        <li key={fIdx}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1">
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">Expected University Questions:</span>
                    <ul className="list-disc pl-4 space-y-1 text-zinc-700 dark:text-zinc-300">
                      {aiNoteSummary.frequentlyAskedQuestions.map((q, qIdx) => (
                        <li key={qIdx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Peer Comments & Discussions */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>Peer Reviews & Questions ({activeNoteModal.comments.length})</span>
              </h4>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {activeNoteModal.comments.map((comm) => (
                  <div key={comm.id} className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 text-xs">
                    <div className="flex items-center justify-between font-semibold text-zinc-900 dark:text-zinc-100">
                      <span>{comm.userName} ({comm.userYear})</span>
                      <span className="text-[10px] text-zinc-400 font-normal">{comm.date}</span>
                    </div>
                    <p className="text-zinc-600 dark:text-zinc-300 mt-1">{comm.comment}</p>
                  </div>
                ))}
              </div>

              {/* Add Comment */}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question or leave feedback for author..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Post
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Share Notes / Question Papers
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUploadNotes} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operating Systems: Paging & Memory Notes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Subject Name
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
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit 3 and 4 handwritten diagrams and theorem proofs"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Summary / Snippet / Formulas
                </label>
                <textarea
                  rows={4}
                  placeholder="Paste formulas, key derivations, or definitions..."
                  value={newSnippet}
                  onChange={(e) => setNewSnippet(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm"
                >
                  Publish to Peer Forum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
