
"use client";

import { useState, useMemo, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { Institution, DepartmentOrGradeEntry, StudentTypeFromRegistrationForm } from '@/lib/types';
import { 
  INSTITUTIONS_STORAGE_KEY, 
  STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM, 
  STUDENT_TYPE_TO_ADMIN_INSTITUTION_TYPE_MAP,
  DEPARTMENTS_GRADES_STORAGE_KEY 
} from '@/lib/constants';

const GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;

// Predefined list of departments for University and College students in the registration form
const HIGHER_ED_DEPARTMENTS = [
  "Computer Science", "Software Engineering", "Electrical Engineering", "Mechanical Engineering", 
  "Civil Engineering", "Architecture", "Medicine", "Pharmacy", "Nursing", 
  "Business Administration", "Accounting", "Economics", "Marketing Management", 
  "Law", "Journalism", "Psychology", "Sociology", "Political Science", 
  "Mathematics", "Physics", "Chemistry", "Biology", "Geology",
  "History", "Geography", "English Language and Literature", "Amharic Language and Literature",
  "Other" 
].sort();


const baseSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  gender: z.enum(GENDERS, {
    required_error: "Please select your gender.",
  }),
  // studentType is now defined in each specific schema as a literal
});

const primarySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[0]), // "Primary School"
  schoolNameSelection: z.string({ required_error: "Please select your school." }),
  otherSchoolName: z.string().optional(),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., Grade 5)." }),
});

const secondarySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[1]), // "Secondary School"
  schoolNameSelection: z.string({ required_error: "Please select your school." }),
  otherSchoolName: z.string().optional(),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., Grade 9)." }),
});

const highSchoolStudentSchema = baseSchema.extend({
  studentType: z.literal(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[2]), // "High School"
  schoolNameSelection: z.string({ required_error: "Please select your school." }),
  otherSchoolName: z.string().optional(),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., Grade 11)." }),
});

const preparatorySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[3]), // "Preparatory School"
  schoolNameSelection: z.string({ required_error: "Please select your school." }),
  otherSchoolName: z.string().optional(),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., Grade 12)." }),
});

const collegeStudentSchema = baseSchema.extend({
  studentType: z.literal(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[4]), // "College"
  institutionNameSelection: z.string({ required_error: "Please select your college." }),
  otherInstitutionName: z.string().optional(),
  departmentSelection: z.string({ required_error: "Please select your department." }),
  otherDepartment: z.string().optional(),
});

const universityStudentSchema = baseSchema.extend({
  studentType: z.literal(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[5]), // "University"
  institutionNameSelection: z.string({ required_error: "Please select your university." }),
  otherInstitutionName: z.string().optional(),
  departmentSelection: z.string({ required_error: "Please select your department." }),
  otherDepartment: z.string().optional(),
});

const registerSchema = z.discriminatedUnion("studentType", [
  primarySchoolStudentSchema,
  secondarySchoolStudentSchema,
  highSchoolStudentSchema,
  preparatorySchoolStudentSchema,
  collegeStudentSchema,
  universityStudentSchema,
], { 
  errorMap: (issue, ctx) => {
    if (issue.code === z.ZodIssueCode.invalid_union_discriminator) {
      return { message: 'Please select your student type.' };
    }
    return { message: ctx.defaultError };
  }
}).superRefine((data, ctx) => {
  if (["Primary School", "Secondary School", "High School", "Preparatory School"].includes(data.studentType)) {
    const schoolData = data as Extract<RegisterFormValues, { studentType: "Primary School" | "Secondary School" | "High School" | "Preparatory School" }>;
    if (schoolData.schoolNameSelection === "Other" && (!schoolData.otherSchoolName || schoolData.otherSchoolName.trim().length < 2)) {
      ctx.addIssue({
        path: ["otherSchoolName"],
        message: "Please specify your school name (min 2 chars).",
        code: z.ZodIssueCode.custom
      });
    }
  }
  if (data.studentType === "University" || data.studentType === "College") {
    const higherEdData = data as Extract<RegisterFormValues, { studentType: "University" | "College" }>;
    if (higherEdData.institutionNameSelection === "Other" && (!higherEdData.otherInstitutionName || higherEdData.otherInstitutionName.trim().length < 2)) {
      ctx.addIssue({
        path: ["otherInstitutionName"],
        message: `Please specify your ${higherEdData.studentType.toLowerCase()} name (min 2 chars).`,
        code: z.ZodIssueCode.custom
      });
    }
    if (higherEdData.departmentSelection === "Other" && (!higherEdData.otherDepartment || higherEdData.otherDepartment.trim().length < 2)) {
      ctx.addIssue({
        path: ["otherDepartment"],
        message: "Please specify your department name (min 2 chars).",
        code: z.ZodIssueCode.custom
      });
    }
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const [allAdminInstitutions, setAllAdminInstitutions] = useState<Institution[]>([]);
  
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      gender: undefined,
      studentType: undefined, 
      institutionNameSelection: undefined,
      otherInstitutionName: '',
      departmentSelection: undefined,
      otherDepartment: '',
      schoolNameSelection: undefined, 
      otherSchoolName: '',
      gradeLevel: '',
    },
  });

  useEffect(() => {
    const storedInstitutions = localStorage.getItem(INSTITUTIONS_STORAGE_KEY);
    if (storedInstitutions) {
      try {
        const parsedInstitutions: Institution[] = JSON.parse(storedInstitutions);
        setAllAdminInstitutions(parsedInstitutions.filter(inst => inst.status === 'active'));
      } catch (e) {
        console.error("Failed to parse institutions from localStorage:", e);
        setAllAdminInstitutions([]); 
      }
    } else {
      setAllAdminInstitutions([]); 
    }
  }, []);

  const watchedStudentType = form.watch("studentType");
  const watchedInstitutionSelection = form.watch("institutionNameSelection" as keyof RegisterFormValues);
  const watchedDepartmentSelection = form.watch("departmentSelection" as keyof RegisterFormValues);
  const watchedSchoolNameSelection = form.watch("schoolNameSelection" as keyof RegisterFormValues);

  const studentTypeLabel = useMemo(() => {
    if (watchedStudentType === STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[5]) return "I am an..."; // University
    return "I am a...";
  }, [watchedStudentType]);

  const relevantInstitutionsForDropdown = useMemo(() => {
    if (!watchedStudentType) return ["Other"];
    const targetAdminType = STUDENT_TYPE_TO_ADMIN_INSTITUTION_TYPE_MAP[watchedStudentType as StudentTypeFromRegistrationForm];
    if (!targetAdminType) return ["Other"];
    
    const activeInstitutions = allAdminInstitutions
        .filter(inst => inst.type === targetAdminType) // Already filtered by status in useEffect
        .map(inst => inst.name)
        .sort();
    return activeInstitutions.length > 0 ? activeInstitutions.concat("Other") : ["Other"];
  }, [watchedStudentType, allAdminInstitutions]);


  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    console.log("Registration Data:", data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    registerUser(data); 
  }

  const departmentOptionsForDropdown = useMemo(() => {
    return HIGHER_ED_DEPARTMENTS; // Using the predefined list
  }, []);

  return (
    <Card className="w-full max-w-lg shadow-xl">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>Enter your details to get started with ADDISSPARK.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="johndoe123" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="m@example.com" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDERS.map(gender => (
                        <SelectItem key={gender} value={gender}>
                          {gender.charAt(0).toUpperCase() + gender.slice(1).replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="studentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{studentTypeLabel}</FormLabel>
                  <Select onValueChange={(value) => {
                      const studentTypeValue = value as StudentTypeFromRegistrationForm | undefined;
                      field.onChange(studentTypeValue); 
                      form.setValue("institutionNameSelection" as any, undefined);
                      form.setValue("otherInstitutionName" as any, '');
                      form.setValue("departmentSelection" as any, undefined);
                      form.setValue("otherDepartment" as any, '');
                      form.setValue("schoolNameSelection" as any, undefined);
                      form.setValue("otherSchoolName" as any, '');
                      form.setValue("gradeLevel" as any, '');
                      form.clearErrors(); 
                  }} value={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your student type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM.map(type => (
                         <SelectItem key={type} value={type}>
                          {type} Student
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {(watchedStudentType === STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[5] || // University
              watchedStudentType === STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[4]    // College
            ) && form.getValues().studentType && ( 
              <>
                <FormField
                  control={form.control}
                  name={"institutionNameSelection" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{watchedStudentType} Name</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value as string | undefined} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={`Select your ${watchedStudentType?.toLowerCase()}`} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {relevantInstitutionsForDropdown.length > 1 || (relevantInstitutionsForDropdown.length === 1 && relevantInstitutionsForDropdown[0] !== "Other") 
                            ? relevantInstitutionsForDropdown.map(inst => <SelectItem key={inst} value={inst}>{inst}</SelectItem>) 
                            : <SelectItem value="Other" disabled={true}>Other</SelectItem> }
                           {(relevantInstitutionsForDropdown.length === 1 && relevantInstitutionsForDropdown[0] === "Other") && <SelectItem value="no-active" disabled>No active {watchedStudentType?.toLowerCase()}s listed. Select Other.</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedInstitutionSelection === 'Other' && (
                  <FormField
                    control={form.control}
                    name={"otherInstitutionName" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify {watchedStudentType} Name</FormLabel>
                        <FormControl>
                          <Input placeholder={`e.g., New Vision ${watchedStudentType}`} {...field} value={field.value ?? ''} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name={"departmentSelection" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value as string | undefined} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departmentOptionsForDropdown.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedDepartmentSelection === 'Other' && (
                  <FormField
                    control={form.control}
                    name={"otherDepartment" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify Department Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Biomedical Engineering" {...field} value={field.value ?? ''} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {(watchedStudentType === STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[0] || 
              watchedStudentType === STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[1] || 
              watchedStudentType === STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[2] || 
              watchedStudentType === STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM[3]    
            ) && form.getValues().studentType && ( 
              <>
                <FormField
                  control={form.control}
                  name={"schoolNameSelection" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value as string | undefined} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your school" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {relevantInstitutionsForDropdown.length > 1 || (relevantInstitutionsForDropdown.length === 1 && relevantInstitutionsForDropdown[0] !== "Other") 
                            ? relevantInstitutionsForDropdown.map(school => (<SelectItem key={school} value={school}>{school}</SelectItem>)) 
                            : <SelectItem value="Other" disabled={true}>Other</SelectItem> }
                           {(relevantInstitutionsForDropdown.length === 1 && relevantInstitutionsForDropdown[0] === "Other") && <SelectItem value="no-active" disabled>No active schools listed. Select Other.</SelectItem>}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedSchoolNameSelection === 'Other' && (
                   <FormField
                    control={form.control}
                    name={"otherSchoolName" as any}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify School Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., My Local School" {...field} value={field.value ?? ''} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name={"gradeLevel" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade Level</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Grade 5 or 11" {...field} value={field.value ?? ''} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isValid}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Button variant="link" className="p-0 h-auto" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}

      