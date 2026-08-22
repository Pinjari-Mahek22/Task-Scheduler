export type EngineeringYear = "FY" | "SY" | "TY" | "Final Year";

export type EngineeringBranch =
  | "Computer Science & Engg (CSE)"
  | "Information Technology (IT)"
  | "AI & Data Science (AI/DS)"
  | "Electronics & Telecomm (ENTC)"
  | "Mechanical Engineering"
  | "Civil Engineering"
  | "Electrical Engineering";

export interface StudentProfile {
  name: string;
  year: EngineeringYear;
  semester: number;
  branch: EngineeringBranch;
  college: string;
  cgpa: number;
  targetCompanyType: "Tier-1 Product (FAANG/MNC)" | "FinTech / High-Frequency" | "Startup Unicorn" | "Core Engineering" | "Higher Studies (GATE/MS)";
  attendanceGoal: number; // e.g. 75
}

export type ClassType = "Lecture" | "Lab" | "Tutorial" | "Seminar";

export interface ScheduleItem {
  id: string;
  subject: string;
  code: string;
  type: ClassType;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  startTime: string; // "09:00"
  endTime: string;   // "10:00"
  room: string;
  faculty: string;
  batch?: string; // e.g. "Batch B1" or "All"
  attendedCount: number;
  totalConducted: number;
  color: string;
}

export type PriorityLevel = "High" | "Medium" | "Low";
export type SubmissionStatus = "Pending" | "In Progress" | "Submitted" | "Graded";
export type SubmissionFormat = "GitHub Repo" | "PDF Report" | "Lab Manual / Hardcopy" | "Google Form" | "Viva Demo";

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  dueDate: string; // ISO date string: YYYY-MM-DDTHH:mm
  priority: PriorityLevel;
  status: SubmissionStatus;
  format: SubmissionFormat;
  description: string;
  maxMarks?: number;
  score?: number;
  attachments?: string[];
  calendarSynced?: boolean;
}

export interface SkillCategory {
  id: string;
  name: string;
  icon: string;
  skills: {
    id: string;
    title: string;
    level: "Beginner" | "Intermediate" | "Advanced";
    status: "Not Started" | "Learning" | "Mastered";
    resourcesCount: number;
    practiceUrl?: string;
    importance: "Crucial for Placements" | "Recommended" | "Bonus";
  }[];
}

export interface HackathonItem {
  id: string;
  title: string;
  organizer: string;
  platform: "Smart India Hackathon" | "Unstop" | "Devpost" | "Hack2Skill" | "Kaggle" | "College TechFest";
  bannerBg: string;
  mode: "Online" | "Offline / In-Person" | "Hybrid";
  location?: string;
  registrationDeadline: string; // YYYY-MM-DD
  eventDate: string;
  prizePool: string;
  teamSize: string;
  tags: string[];
  link: string;
  verified: boolean;
  teamsLookingForMembers: {
    id: string;
    teamName: string;
    neededRoles: string[];
    contact: string;
  }[];
}

export interface MockQuestion {
  id: string;
  category: "DSA" | "DBMS & SQL" | "Operating Systems" | "Computer Networks" | "System Design" | "HR & Behavioral";
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  companyTags: string[];
  prompt: string;
  starterCode?: string;
  keyConcepts: string[];
  starFormulaHint?: string;
}

export interface PeerNote {
  id: string;
  title: string;
  subject: string;
  branch: EngineeringBranch;
  year: EngineeringYear;
  semester: number;
  authorName: string;
  authorCollege: string;
  uploadDate: string;
  upvotes: number;
  rating: number; // 1 to 5
  downloads: number;
  pageCount: number;
  description: string;
  contentSnippet: string;
  tags: string[];
  verifiedByFaculty: boolean;
  comments: {
    id: string;
    userName: string;
    userYear: string;
    comment: string;
    date: string;
  }[];
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
    location: string;
  };
  summary: string;
  education: {
    id: string;
    institution: string;
    degree: string;
    branch: string;
    startYear: string;
    endYear: string;
    cgpaOrPercentage: string;
  }[];
  skills: {
    languages: string;
    frameworks: string;
    developerTools: string;
    coreConcepts: string;
  };
  experience: {
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  }[];
  projects: {
    id: string;
    title: string;
    techStack: string;
    githubLink: string;
    liveLink: string;
    bullets: string[];
  }[];
  achievements: string[];
  certifications: string[];
}

export type ScheduleEntry = ScheduleItem;

export interface AiCoachMessage {
  id: string;
  sender: "user" | "coach";
  text: string;
  timestamp: string;
  actionableChecklist?: string[];
  suggestedNextTopics?: string[];
}

export interface PomodoroSession {
  id: string;
  durationMinutes: number;
  mode: "work" | "shortBreak" | "longBreak";
  completedAt: string;
  attachedAssignmentTitle?: string;
}

export interface NotificationItem {
  id: string;
  type: "assignment" | "hackathon" | "attendance" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLink?: string;
}
