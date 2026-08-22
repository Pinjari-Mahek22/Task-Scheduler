import React, { useState } from "react";
import {
  Trophy,
  Calendar,
  Users,
  ExternalLink,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Sparkles,
  MapPin,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import { HackathonItem, StudentProfile } from "../types";

interface HackathonRadarProps {
  hackathons: HackathonItem[];
  setHackathons: React.Dispatch<React.SetStateAction<HackathonItem[]>>;
  profile: StudentProfile;
}

export const HackathonRadar: React.FC<HackathonRadarProps> = ({
  hackathons,
  setHackathons,
  profile,
}) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedHackathonForTeam, setSelectedHackathonForTeam] = useState<HackathonItem | null>(null);

  // New Team Posting form
  const [newTeamName, setNewTeamName] = useState("");
  const [newRoles, setNewRoles] = useState("Full-Stack Developer, AI/ML Specialist");
  const [newContact, setNewContact] = useState(`${profile.name.toLowerCase().replace(/\s+/g, ".")}@pict.edu`);

  // New Hackathon Form
  const [newTitle, setNewTitle] = useState("");
  const [newOrganizer, setNewOrganizer] = useState("");
  const [newPlatform, setNewPlatform] = useState<any>("Unstop");
  const [newDeadline, setNewDeadline] = useState("2026-10-15");
  const [newEventDate, setNewEventDate] = useState("Nov 2026");
  const [newPrize, setNewPrize] = useState("₹1,00,000");
  const [newTeamSize, setNewTeamSize] = useState("3 - 4 Members");
  const [newMode, setNewMode] = useState<any>("Online");
  const [newLink, setNewLink] = useState("https://unstop.com");

  const allTags = Array.from(new Set(hackathons.flatMap((h) => h.tags)));

  const handlePostTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHackathonForTeam || !newTeamName.trim()) return;

    const rolesArr = newRoles.split(",").map((r) => r.trim()).filter(Boolean);
    const newTeamEntry = {
      id: `team-${Date.now()}`,
      teamName: newTeamName.trim(),
      neededRoles: rolesArr.length > 0 ? rolesArr : ["Full Stack Dev"],
      contact: newContact.trim() || "contact@student.edu",
    };

    setHackathons((prev) =>
      prev.map((h) => {
        if (h.id === selectedHackathonForTeam.id) {
          return {
            ...h,
            teamsLookingForMembers: [...h.teamsLookingForMembers, newTeamEntry],
          };
        }
        return h;
      })
    );

    setNewTeamName("");
    setShowTeamModal(false);
  };

  const handleAddHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newHack: HackathonItem = {
      id: `hack-${Date.now()}`,
      title: newTitle.trim(),
      organizer: newOrganizer.trim() || "Tech Organizers",
      platform: newPlatform,
      bannerBg: "from-indigo-500/20 to-cyan-500/20",
      mode: newMode,
      registrationDeadline: newDeadline,
      eventDate: newEventDate,
      prizePool: newPrize,
      teamSize: newTeamSize,
      tags: ["Engineering", "Hackathon", "Coding"],
      link: newLink,
      verified: true,
      teamsLookingForMembers: [],
    };

    setHackathons((prev) => [newHack, ...prev]);
    setShowAddModal(false);
  };

  const filteredHackathons = hackathons.filter((h) => {
    if (selectedTag !== "all" && !h.tags.includes(selectedTag)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        h.title.toLowerCase().includes(q) ||
        h.organizer.toLowerCase().includes(q) ||
        h.tags.some((t) => t.toLowerCase().includes(q))
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
              <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                National & Global Contests
              </span>
              <span className="text-xs text-zinc-500 font-medium">
                Verified SIH, Unstop, Devpost & TechFests
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
              Hackathon Radar & Teammate Matchmaker
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Find national hackathons, PPI (Pre-Placement Interview) opportunities, and recruit cross-functional engineering teammates.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Hackathon</span>
            </button>
          </div>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, tags, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedTag("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                selectedTag === "all"
                  ? "bg-indigo-600 text-white dark:bg-indigo-500"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              }`}
            >
              All Domains ({hackathons.length})
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedTag === tag
                    ? "bg-indigo-600 text-white dark:bg-indigo-500"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHackathons.map((hack) => (
          <div
            key={hack.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {hack.platform}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium">
                      {hack.organizer}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 mt-1.5">
                    {hack.title}
                  </h3>
                </div>

                <span className="shrink-0 px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {hack.prizePool}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hack.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                  >
                    #{t}
                  </span>
                ))}
              </div>

              {/* Meta information */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div>
                  <div className="text-[10px] text-zinc-400 font-medium uppercase">Format</div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{hack.mode}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 font-medium uppercase">Team Size</div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mt-0.5">{hack.teamSize}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 font-medium uppercase">Reg. Deadline</div>
                  <div className="font-semibold text-rose-600 dark:text-rose-400 mt-0.5">{hack.registrationDeadline}</div>
                </div>
              </div>

              {/* Teammates Seeking Box */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Teammates Looking to Form Squad ({hack.teamsLookingForMembers.length})</span>
                  </span>
                  <button
                    onClick={() => {
                      setSelectedHackathonForTeam(hack);
                      setShowTeamModal(true);
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    + Post Vacancy
                  </button>
                </div>

                {hack.teamsLookingForMembers.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic">
                    No teams posted yet. Be the first to start a squad!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {hack.teamsLookingForMembers.map((team) => (
                      <div
                        key={team.id}
                        className="p-2.5 rounded-lg border border-indigo-100 bg-indigo-50/40 dark:border-indigo-900/30 dark:bg-indigo-950/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">
                            {team.teamName}
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {team.neededRoles.map((role, rIdx) => (
                              <span
                                key={rIdx}
                                className="px-1.5 py-0.5 text-[9px] font-semibold rounded bg-white dark:bg-zinc-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800"
                              >
                                Need: {role}
                              </span>
                            ))}
                          </div>
                        </div>
                        <a
                          href={`mailto:${team.contact}?subject=Hackathon%20Team%20Inquiry%20for%20${encodeURIComponent(
                            hack.title
                          )}`}
                          className="shrink-0 px-2.5 py-1 text-[11px] font-semibold rounded bg-white hover:bg-zinc-100 text-indigo-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-indigo-300 border border-zinc-200 dark:border-zinc-700 text-center"
                        >
                          Connect via Email
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Register Link */}
            <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <span className="text-xs text-zinc-400">
                Dates: <span className="font-semibold text-zinc-600 dark:text-zinc-300">{hack.eventDate}</span>
              </span>
              <a
                href={hack.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
              >
                <span>Register on Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Post Team Requirement Modal */}
      {showTeamModal && selectedHackathonForTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Recruit Teammates for {selectedHackathonForTeam.title}
              </h3>
              <button
                onClick={() => setShowTeamModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handlePostTeam} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AlgoWarriors PICT"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Roles / Skills Needed (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Backend Dev, UI/UX Designer, ML Specialist"
                  value={newRoles}
                  onChange={(e) => setNewRoles(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Contact Email / Discord ID
                </label>
                <input
                  type="text"
                  required
                  value={newContact}
                  onChange={(e) => setNewContact(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm"
                >
                  Publish Team Vacancy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Hackathon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Submit Hackathon / Contest
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddHackathon} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Hackathon Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. InnoTech University Hackathon 2026"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Organizer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. IEEE / College Club"
                    value={newOrganizer}
                    onChange={(e) => setNewOrganizer(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Platform
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Unstop">Unstop</option>
                    <option value="Devpost">Devpost</option>
                    <option value="Smart India Hackathon">Smart India Hackathon</option>
                    <option value="Hack2Skill">Hack2Skill</option>
                    <option value="College TechFest">College TechFest</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹50,000"
                    value={newPrize}
                    onChange={(e) => setNewPrize(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Registration Deadline
                  </label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Official Registration URL
                </label>
                <input
                  type="url"
                  placeholder="https://unstop.com/..."
                  value={newLink}
                  onChange={(e) => setNewLink(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors shadow-sm"
                >
                  Add to Radar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
