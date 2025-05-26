
// src/lib/constants.ts
import type { InstitutionType as AdminInstitutionType } from '@/lib/types';

export const INSTITUTIONS_STORAGE_KEY = 'admin_institutions_list';

// Used in Registration Form for the dropdown and Zod schema
export const STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM = [
  "Primary School",
  "Secondary School",
  "High School",
  "Preparatory School",
  "College",
  "University",
] as const;

// Type for the values submitted by the registration form's studentType select
export type StudentTypeFromRegistrationForm = typeof STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[number];


// Maps the user-friendly student type from registration form to the InstitutionType used in admin management
export const STUDENT_TYPE_TO_ADMIN_INSTITUTION_TYPE_MAP: Record<StudentTypeFromRegistrationForm, AdminInstitutionType> = {
  "Primary School": "Primary School",
  "Secondary School": "Secondary School",
  "High School": "High School",
  "Preparatory School": "Preparatory School",
  "College": "College",
  "University": "University",
};
