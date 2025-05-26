
"use client";

import { useState } from 'react';
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

const GENDERS = ["male", "female", "other", "prefer_not_to_say"] as const;
const STUDENT_TYPES = [
  "primary_school", 
  "secondary_school", 
  "high_school", 
  "preparatory_school", 
  "college",
  "university", 
] as const;

const UNIVERSITIES = ["Addis Ababa University", "Bahir Dar University", "Mekelle University", "Jimma University", "Hawassa University", "Other"] as const;
const COLLEGES = ["Admas University College", "Unity University", "St. Mary's University College", "CPU College", "Rift Valley University College", "Other"] as const;
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

// Schemas for each student type
const primarySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal("primary_school"),
  schoolName: z.string().min(2, { message: "School name must be at least 2 characters." }),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., 1-8)." }),
});

const secondarySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal("secondary_school"),
  schoolName: z.string().min(2, { message: "School name must be at least 2 characters." }),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., 7-10)." }),
});

const highSchoolStudentSchema = baseSchema.extend({
  studentType: z.literal("high_school"),
  schoolName: z.string().min(2, { message: "School name must be at least 2 characters." }),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., 9-10 or 11-12)." }),
});

const preparatorySchoolStudentSchema = baseSchema.extend({
  studentType: z.literal("preparatory_school"),
  schoolName: z.string().min(2, { message: "School name must be at least 2 characters." }),
  gradeLevel: z.string().min(1, { message: "Grade level is required (e.g., 11-12)." }),
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
      schoolName: '',
      // @ts-expect-error
      gradeLevel: '',
    },
  });

  const watchedStudentType = form.watch("studentType");
  const watchedInstitution = form.watch("institutionNameSelection" as any);
  const watchedDepartment = form.watch("departmentSelection" as any);

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    registerUser(data as any);
  }

  const studentTypeLabel = watchedStudentType === 'university' ? "I am an..." : "I am a...";

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
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value as string} disabled={isLoading}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value as string} disabled={isLoading}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value as string} disabled={isLoading}>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value as string} disabled={isLoading}>
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
                  name="schoolName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>School Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Example Primary School" {...field} value={field.value ?? ''} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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

