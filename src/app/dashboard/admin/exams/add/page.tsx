
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Exam, StudentTypeFromRegistrationForm, DepartmentOrGradeEntry } from '@/lib/types';
import { ADMIN_EXAMS_STORAGE_KEY, STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM, DEPARTMENTS_GRADES_STORAGE_KEY } from '@/lib/constants';

const examSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  educationalLevel: z.enum(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM, { required_error: "Please select an educational level." }),
  departmentOrGradeName: z.string().optional(),
  durationMinutes: z.coerce.number().int().positive({ message: "Must be a positive number." }),
  isPremium: z.boolean().default(false),
  questionIdsInput: z.string().refine(val => {
    if (!val.trim()) return true; // Optional, can be empty
    const ids = val.split(',').map(id => id.trim());
    return ids.every(id => id.length > 0); // If not empty, all parts must be non-empty
  }, {message: "Question IDs must be a comma-separated list of non-empty strings, or empty."}).optional(),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function AddAdminExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [fetchedDeptGrades, setFetchedDeptGrades] = useState<string[]>([]);

  const { control, register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      description: '',
      educationalLevel: undefined,
      departmentOrGradeName: undefined,
      durationMinutes: 30,
      isPremium: false,
      questionIdsInput: '',
    },
  });

  const isPremium = watch('isPremium');
  const watchedEducationalLevel = watch("educationalLevel");

  useEffect(() => {
    if (watchedEducationalLevel) {
      const storedDeptGrades = localStorage.getItem(DEPARTMENTS_GRADES_STORAGE_KEY);
      let relevantNames: string[] = [];
      if (storedDeptGrades) {
        const allDeptGrades: DepartmentOrGradeEntry[] = JSON.parse(storedDeptGrades);
        relevantNames = allDeptGrades
          .filter(item => item.type === watchedEducationalLevel)
          .map(item => item.name)
          .sort();
      }
      setFetchedDeptGrades(relevantNames);
      setValue('departmentOrGradeName', undefined); 
    } else {
      setFetchedDeptGrades([]);
      setValue('departmentOrGradeName', undefined);
    }
  }, [watchedEducationalLevel, setValue]);

  const getDeptGradeLabel = () => {
    if (!watchedEducationalLevel) return "Department / Grade";
    if (["University", "College"].includes(watchedEducationalLevel)) return "Department";
    return "Grade";
  };

  const onSubmit = async (data: ExamFormValues) => {
    setIsLoading(true);
    try {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      let exams: Exam[] = storedExams ? JSON.parse(storedExams) : [];
      
      const questionIds = data.questionIdsInput?.split(',').map(id => id.trim()).filter(id => id) || [];

      const newExam: Exam = {
        id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: data.title,
        description: data.description,
        educationalLevel: data.educationalLevel,
        departmentOrGradeName: data.departmentOrGradeName || undefined,
        durationMinutes: data.durationMinutes,
        isPremium: data.isPremium,
        questionIds: questionIds,
      };
      exams.push(newExam);
      localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(exams));

      toast({
        title: "Exam Added",
        description: `${data.title} has been successfully added.`,
      });
      reset(); 
    } catch (error) {
      console.error("Error saving exam to localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to add exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Add New Exam</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/exams')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams List
          </Button>
        </div>
        <CardDescription>
          Fill in the details for the new exam. Link questions from the global bank using their IDs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} disabled={isLoading} className="mt-1" />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} disabled={isLoading} className="mt-1" rows={3} />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <Label htmlFor="educationalLevel">Educational Level</Label>
            <Controller
              name="educationalLevel"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select educational level" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM.map(level => (
                       <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.educationalLevel && <p className="text-sm text-destructive mt-1">{errors.educationalLevel.message}</p>}
          </div>
          
          {watchedEducationalLevel && fetchedDeptGrades.length > 0 && (
            <div>
              <Label htmlFor="departmentOrGradeName">{getDeptGradeLabel()}</Label>
              <Controller
                name="departmentOrGradeName"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || fetchedDeptGrades.length === 0}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Select ${getDeptGradeLabel().toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {fetchedDeptGrades.map(name => (
                         <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.departmentOrGradeName && <p className="text-sm text-destructive mt-1">{errors.departmentOrGradeName.message}</p>}
            </div>
          )}
          {watchedEducationalLevel && fetchedDeptGrades.length === 0 && (
             <p className="text-sm text-muted-foreground mt-1">
                No specific {getDeptGradeLabel().toLowerCase()}s found for {watchedEducationalLevel}. You can add them in 'Manage Departments & Grades'.
            </p>
          )}

            <div>
              <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
              <Input id="durationMinutes" type="number" {...register("durationMinutes")} disabled={isLoading} className="mt-1" />
              {errors.durationMinutes && <p className="text-sm text-destructive mt-1">{errors.durationMinutes.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="questionIdsInput">Question IDs (Comma-separated)</Label>
              <Textarea id="questionIdsInput" {...register("questionIdsInput")} disabled={isLoading} className="mt-1" rows={2} placeholder="e.g., gq1,gq2,gq5" />
              {errors.questionIdsInput && <p className="text-sm text-destructive mt-1">{errors.questionIdsInput.message}</p>}
              <p className="text-xs text-muted-foreground mt-1">Enter IDs of questions from the global question bank.</p>
            </div>
          
          <div className="flex items-center space-x-2">
            <Switch
                id="isPremium"
                checked={isPremium}
                onCheckedChange={(checked) => {
                    setValue('isPremium', checked);
                }}
                disabled={isLoading}
            />
            <Label htmlFor="isPremium" className="cursor-pointer">
                Is this a Premium Exam?
            </Label>
             {errors.isPremium && <p className="text-sm text-destructive mt-1">{errors.isPremium.message}</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/exams')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Exam
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
