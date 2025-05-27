
// src/lib/constants.ts
import type { InstitutionType as AdminInstitutionType, StudentTypeFromRegistrationFormKey } from '@/lib/types';
import type { StudentTypeFromRegistrationForm } from '@/lib/types';

export const INSTITUTIONS_STORAGE_KEY = 'admin_institutions_list';
export const DEPARTMENTS_GRADES_STORAGE_KEY = 'admin_departments_grades_list';
export const ADMIN_EXAMS_STORAGE_KEY = 'admin_exams_list';
export const ADMIN_RESOURCES_STORAGE_KEY = 'admin_resources_list';


// Used in Registration Form for the dropdown and Zod schema
export const STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM: StudentTypeFromRegistrationForm[] = [
  "Primary School",
  "Secondary School",
  "High School",
  "Preparatory School",
  "College",
  "University",
] as const;


// Maps the user-friendly student type from registration form to the InstitutionType used in admin management
export const STUDENT_TYPE_TO_ADMIN_INSTITUTION_TYPE_MAP: Record<StudentTypeFromRegistrationForm, AdminInstitutionType> = {
  "Primary School": "Primary School",
  "Secondary School": "Secondary School",
  "High School": "High School",
  "Preparatory School": "Preparatory School",
  "College": "College",
  "University": "University",
};

// Maps the user-friendly student type from registration form to the key stored in user object
export const STUDENT_TYPE_FORM_TO_KEY_MAP: Record<StudentTypeFromRegistrationForm, StudentTypeFromRegistrationFormKey> = {
  "Primary School": "primary_school",
  "Secondary School": "secondary_school",
  "High School": "high_school",
  "Preparatory School": "preparatory_school",
  "College": "college",
  "University": "university",
};

export const RESOURCE_ADMIN_TYPES: Resource['type'][] = ["note", "video", "book"];
