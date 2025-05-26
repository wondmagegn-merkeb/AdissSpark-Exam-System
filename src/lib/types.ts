
export interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null; // Added for avatar
  gender?: "male" | "female" | "other" | "prefer_not_to_say" | null;
  studentType?: 'primary_school' | 'secondary_school' | 'high_school' | 'preparatory_school' | 'university' | 'college' | null;
  institutionName?: string | null; // Stores the final name (selected, 'Other' text, school name, or generic institution)
  department?: string | null; // Stores final department (selected, 'Other' text) - primarily for university/college
  gradeLevel?: string | null; // For primary, secondary, high_school, preparatory
}

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
  type: 'note' | 'video';
  description: string;
  imageUrl?: string;
  isPremium: boolean; // True if requires subscription
  contentUrl?: string; // URL to the actual resource or a placeholder
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
