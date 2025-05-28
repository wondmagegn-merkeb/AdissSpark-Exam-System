
export interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null; 
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  studentType?: StudentTypeFromRegistrationFormKey | null;
  institutionName?: string | null; 
  department?: string | null; 
  gradeLevel?: string | null; 
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
  subjectOrCourse: string; 
  imageUrl?: string;
  isPremium: boolean; 
  contentUrl?: string; 
  dataAiHint?: string;
}

export interface Question {
  id: string;
  text: string;
  option1: string;
  option2: string;
  option3: string;
  option4: string;
  correctAnswer: string; // Stores the text of the correct option (e.g., the content of option1, option2, etc.)
  explanation?: string; 
}

export interface Exam {
  id:string;
  title: string;
  description: string;
  durationMinutes: number; 
  isPremium: boolean;
  questionIds: string[]; // Array of IDs from the global question bank
  educationalLevel?: StudentTypeFromRegistrationForm;
  departmentOrGradeName?: string;
  // questionCount is now derived from questionIds.length
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
  dateCompleted: string; 
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

export type InstitutionType = StudentTypeFromRegistrationForm;
export type InstitutionStatus = 'active' | 'inactive';

export interface Institution {
  id: string;
  name: string;
  type: InstitutionType; 
  context: string;
  status: InstitutionStatus;
}

export type DepartmentOrGradeAssociatedLevel = StudentTypeFromRegistrationForm;

export interface DepartmentOrGradeEntry {
  id: string;
  name: string; 
  type: DepartmentOrGradeAssociatedLevel; 
}

export interface CourseOrSubjectEntry {
  id: string;
  name: string; 
  educationalLevel: StudentTypeFromRegistrationForm; 
  departmentOrGradeName?: string; 
}
