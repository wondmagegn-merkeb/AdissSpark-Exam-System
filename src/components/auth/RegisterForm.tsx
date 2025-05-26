
"use client";

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import type { InstitutionType as AdminInstitutionType } from '@/app/dashboard/admin/universities/page';


const GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
const STUDENT_TYPES = [
  "primary_school", 
  "secondary_school", 
  "high_school", 
  "preparatory_school", 
  "college",
  "university", 
] as const;

// Mock data simulating schools/institutions added by an admin
// In a real app, this would be fetched from a backend or global state.
const MOCK_ADMIN_INSTITUTIONS: { name: string, type: AdminInstitutionType }[] = [
  { name: "Bright Kids Primary", type: "Primary School" },
  { name: "Future Leaders Primary", type: "Primary School" },
  { name: "Advanced Secondary School", type: "Secondary School" },
  { name: "City Central Secondary", type: "Secondary School" },
  { name: "Pioneer High School", type: "High School" },
  { name: "Regional High School", type: "High School" },
  { name: "Elite Preparatory School", type: "Preparatory School" },
  { name: "Top Achievers Prep", type: "Preparatory School" },
  { name: "Addis Ababa University", type: "University" },
  { name: "Bahir Dar University", type: "University" },
  { name: "Mekelle University", type: "University" },
  { name: "Admas University College", type: "College" },
  { name: "Unity University", type: "College" },
];


const UNIVERSITIES = MOCK_ADMIN_INSTITUTIONS.filter(inst => inst.type === "University").map(inst => inst.name).concat("Other");
const COLLEGES = MOCK_ADMIN_INSTITUTIONS.filter(inst => inst.type === "College").map(inst => inst.name).concat("Other");
const DEPARTMENTS = ["Computer Science", "Software Engineering", "Electrical Engineering", "Civil Engineering", "Mechanical Engineering", "Medicine", "Nursing", "Pharmacy", "Economics", "Management", "Accounting", "Law", "Other"] as const;


const baseSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  gender: z.enum(GENDERS, {
    required_error: "Please select your gender.",
  }),
  studentType: z.enum(STUDENT_TYPES, {
    required_error: "Please select your student type.",
  }),
});

const schoolSchemaFields = {
  schoolNameSelection: z.string({ required_error: "Please select your school." }),
  otherSchoolName: z.string().optional(),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., Grade 5 or 11)." }),
};

const primarySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal("primary_school"),
  ...schoolSchemaFields,
}).superRefine((data, ctx) => {
  if (data.schoolNameSelection === "Other" && (!data.otherSchoolName || data.otherSchoolName.trim().length < 2)) {
    ctx.addIssue({
      path: ["otherSchoolName"],
      message: "Please specify your school name (min 2 chars).",
      code: z.ZodIssueCode.custom
    });
  }
});

const secondarySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal("secondary_school"),
  ...schoolSchemaFields,
}).superRefine((data, ctx) => {
  if (data.schoolNameSelection === "Other" && (!data.otherSchoolName || data.otherSchoolName.trim().length < 2)) {
    ctx.addIssue({
      path: ["otherSchoolName"],
      message: "Please specify your school name (min 2 chars).",
      code: z.ZodIssueCode.custom
    });
  }
});

const highSchoolStudentSchema = baseSchema.extend({
  studentType: z.literal("high_school"),
  ...schoolSchemaFields,
}).superRefine((data, ctx) => {
  if (data.schoolNameSelection === "Other" && (!data.otherSchoolName || data.otherSchoolName.trim().length < 2)) {
    ctx.addIssue({
      path: ["otherSchoolName"],
      message: "Please specify your school name (min 2 chars).",
      code: z.ZodIssueCode.custom
    });
  }
});

const preparatorySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal("preparatory_school"),
  ...schoolSchemaFields,
}).superRefine((data, ctx) => {
  if (data.schoolNameSelection === "Other" && (!data.otherSchoolName || data.otherSchoolName.trim().length < 2)) {
    ctx.addIssue({
      path: ["otherSchoolName"],
      message: "Please specify your school name (min 2 chars).",
      code: z.ZodIssueCode.custom
    });
  }
});

const collegeStudentSchema = baseSchema.extend({
  studentType: z.literal("college"),
  institutionNameSelection: z.string({ required_error: "Please select your college." }),
  otherInstitutionName: z.string().optional(),
  departmentSelection: z.string({ required_error: "Please select your department." }),
  otherDepartment: z.string().optional(),
});

const universityStudentSchema = baseSchema.extend({
  studentType: z.literal("university"),
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
]).superRefine((data, ctx) => {
  if (data.studentType === "university" || data.studentType === "college") {
    if (data.institutionNameSelection === "Other" && (!data.otherInstitutionName || data.otherInstitutionName.trim().length < 2)) {
      ctx.addIssue({
        path: ["otherInstitutionName"],
        message: `Please specify your ${data.studentType} name (min 2 chars).`,
        code: z.ZodIssueCode.custom
      });
    }
    if (data.departmentSelection === "Other" && (!data.otherDepartment || data.otherDepartment.trim().length < 2)) {
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
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      gender: undefined,
      studentType: undefined,
      // @ts-expect-error - RHF needs a default for all union paths
      institutionNameSelection: undefined,
      otherInstitutionName: '',
      // @ts-expect-error
      departmentSelection: undefined,
      otherDepartment: '',
      // @ts-expect-error
      schoolNameSelection: undefined, 
      otherSchoolName: '',
      // @ts-expect-error
      gradeLevel: '',
    },
  });

  const watchedStudentType = form.watch("studentType");
  const watchedInstitution = form.watch("institutionNameSelection" as any); // For University/College
  const watchedDepartment = form.watch("departmentSelection" as any); // For University/College
  const watchedSchoolNameSelection = form.watch("schoolNameSelection" as any); // For School levels

  const studentTypeLabel = useMemo(() => {
    if (watchedStudentType === 'university') return "I am an...";
    return "I am a...";
  }, [watchedStudentType]);

  const relevantSchools = useMemo(() => {
    if (!watchedStudentType) return [];
    const typeMap = {
        'primary_school': 'Primary School',
        'secondary_school': 'Secondary School',
        'high_school': 'High School',
        'preparatory_school': 'Preparatory School',
    };
    const currentSchoolType = typeMap[watchedStudentType as keyof typeof typeMap];
    if (!currentSchoolType) return [];
    
    return MOCK_ADMIN_INSTITUTIONS
        .filter(inst => inst.type === currentSchoolType)
        .map(inst => inst.name)
        .concat("Other");
  }, [watchedStudentType]);


  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    registerUser(data as any);
  }


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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                      field.onChange(value);
                      // Reset dependent fields when student type changes
                      form.resetField("institutionNameSelection" as any);
                      form.resetField("otherInstitutionName" as any);
                      form.resetField("departmentSelection" as any);
                      form.resetField("otherDepartment" as any);
                      form.resetField("schoolNameSelection" as any);
                      form.resetField("otherSchoolName" as any);
                      form.resetField("gradeLevel" as any);
                  }} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your student type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STUDENT_TYPES.map(type => (
                         <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1).replace(/_/g, ' ')} Student
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* University Student Fields */}
            {watchedStudentType === 'university' && (
              <>
                <FormField
                  control={form.control}
                  name="institutionNameSelection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University Name</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value as string | undefined} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your university" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {UNIVERSITIES.map(uni => <SelectItem key={uni} value={uni}>{uni}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedInstitution === 'Other' && (
                  <FormField
                    control={form.control}
                    name="otherInstitutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify University Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Gondar University" {...field} value={field.value ?? ''} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="departmentSelection"
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
                          {DEPARTMENTS.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedDepartment === 'Other' && (
                  <FormField
                    control={form.control}
                    name="otherDepartment"
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

            {/* College Student Fields */}
            {watchedStudentType === 'college' && (
              <>
                <FormField
                  control={form.control}
                  name="institutionNameSelection"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>College Name</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value as string | undefined} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your college" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COLLEGES.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedInstitution === 'Other' && (
                  <FormField
                    control={form.control}
                    name="otherInstitutionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify College Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., New Vision College" {...field} value={field.value ?? ''} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="departmentSelection"
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
                          {DEPARTMENTS.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedDepartment === 'Other' && (
                  <FormField
                    control={form.control}
                    name="otherDepartment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify Department Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Marketing Management" {...field} value={field.value ?? ''} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </>
            )}

            {/* Primary, Secondary, High School, Preparatory Student Fields */}
            {(watchedStudentType === 'primary_school' ||
              watchedStudentType === 'secondary_school' ||
              watchedStudentType === 'high_school' ||
              watchedStudentType === 'preparatory_school') && (
              <>
                <FormField
                  control={form.control}
                  name="schoolNameSelection"
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
                          {relevantSchools.map(school => (
                            <SelectItem key={school} value={school}>{school}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {watchedSchoolNameSelection === 'Other' && (
                   <FormField
                    control={form.control}
                    name="otherSchoolName"
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
                  name="gradeLevel"
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
