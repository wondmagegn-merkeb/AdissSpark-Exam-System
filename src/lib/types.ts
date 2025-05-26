
export interface User {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null; // Added for avatar
  gender?: string | null;
  institutionName?: string | null;
  studyDetails?: string | null;
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

export interface Exam {
  id:string;
  title: string;
  description: string;
  questionCount: number;
  durationMinutes: number; // Duration in minutes
  isPremium: boolean;
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
