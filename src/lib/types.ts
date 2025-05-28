
export interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null; // Added for avatar
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  studentType?: StudentTypeFromRegistrationFormKey | null;
  institutionName?: string | null; // Stores the final name (selected, 'Other' text, school name, or generic institution)
  department?: string | null; // Stores final department (selected, 'Other' text) - primarily for university/college
  gradeLevel?: string | null; // For primary, secondary, high_school, preparatory
}

export type StudentTypeFromRegistrationForm = 
  | "Primary School" 
  | "Secondary School" 
  | "High School" 
  | "Preparatory School" 
  | "College" 
  | "University";

export type StudentTypeFromRegistrationFormKey = 
  | 'primary_school'
  | 'secondary_school'
  | 'high_school'
  | 'preparatory_school'
  | 'college'
  | 'university';


export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  external?: boolean;
  label?: string;
  description?: string;
  requiresSubscription?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'note' | 'video' | 'book';
  description: string;
  subjectOrCourse: string; // This will store the subject (for school) or course/field (for uni/college)
  imageUrl?: string;
  isPremium: boolean; // True if requires subscription
  contentUrl?: string; // URL to the actual resource or a placeholder
  dataAiHint?: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string; // The string content of the correct option
  explanation?: string; // Optional explanation
}

export interface Exam {
  id:string;
  title: string;
  description: string;
  questionCount: number;
  durationMinutes: number; // Duration in minutes
  isPremium: boolean;
  questions: Question[];
  educationalLevel?: StudentTypeFromRegistrationForm;
  departmentOrGradeName?: string;
}

export interface StudyPlanData {
  targetExamDate: string;
  currentKnowledgeLevel: string;
  examType: string;
  topics: string;
}

export interface StudyPlanOutput {
  studyPlan: string;
}

// Updated ChatMessage for user-to-user chat
export interface ChatMessage {
  id: string; 
  text: string;
  senderId: string;
  senderName?: string | null; 
  timestamp: Date;
}

export interface ExamHistoryEntry {
  examId: string;
  examTitle: string;
  dateCompleted: string; // ISO string
  score: number;
  totalQuestions: number;
  percentageScore: number;
}

export interface FeedbackEntry {
  id: string;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  subject: string;
  message: string;
  submittedAt: Date;
  status: 'new' | 'in_progress' | 'resolved' | 'archived';
}

export interface AgentEntry {
  id: string;
  name: string;
  description: string;
  type: 'faq_bot' | 'support_chat' | 'study_planner';
  status: 'active' | 'inactive' | 'maintenance';
  lastUpdated: Date;
}

// Used for "Manage Institutions" admin page
export type InstitutionType = StudentTypeFromRegistrationForm;
export type InstitutionStatus = 'active' | 'inactive';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType; // "Primary School", "University", etc.
  context: string;
  status: InstitutionStatus;
}

// Used for the "Manage Departments & Grades" admin page
export type DepartmentOrGradeAssociatedLevel = StudentTypeFromRegistrationForm;

export interface DepartmentOrGradeEntry {
  id: string;
  name: string; // e.g., "Computer Science" or "Grade 9"
  type: DepartmentOrGradeAssociatedLevel; // e.g., "University", "High School"
}

// Used for the "Manage Courses & Subjects" admin page
export interface CourseOrSubjectEntry {
  id: string;
  name: string; // e.g., "Calculus I" or "Physics Grade 9"
  educationalLevel: StudentTypeFromRegistrationForm; // e.g., "University", "High School"
  departmentOrGradeName?: string; // Stores the name of the selected department or grade (e.g., "Computer Science" or "Grade 9")
}

