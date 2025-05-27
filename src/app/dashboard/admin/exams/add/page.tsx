
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Exam, Question } from '@/lib/types';
import { ADMIN_EXAMS_STORAGE_KEY } from '@/lib/constants';

const examSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  questionCount: z.coerce.number().int().positive({ message: "Must be a positive number." }),
  durationMinutes: z.coerce.number().int().positive({ message: "Must be a positive number." }),
  isPremium: z.boolean().default(false),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function AddAdminExamPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, reset, watch } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      description: '',
      questionCount: 10,
      durationMinutes: 30,
      isPremium: false,
    },
  });

  const isPremium = watch('isPremium');

  const onSubmit = async (data: ExamFormValues) => {
    setIsLoading(true);
    try {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      let exams: Exam[] = storedExams ? JSON.parse(storedExams) : [];
      
      // For now, questions array will be empty or have placeholder if needed.
      // A more complex UI would be needed to manage questions.
      const placeholderQuestions: Question[] = Array.from({ length: data.questionCount }, (_, i) => ({
        id: `q-${Date.now()}-${i}`,
        text: `Placeholder Question ${i + 1} for exam: ${data.title}`,
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "This is a placeholder explanation."
      }));

      const newExam: Exam = {
        id: `exam-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        questions: placeholderQuestions, // Add placeholder questions
      };
      exams.push(newExam);
      localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(exams));

      toast({
        title: "Exam Added",
        description: `${data.title} has been successfully added.`,
      });
      reset(); 
      // router.push('/dashboard/admin/exams'); // Optionally redirect
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
          Fill in the details for the new exam. Question management will be handled separately.
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
            <Textarea id="description" {...register("description")} disabled={isLoading} className="mt-1" rows={4} />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Input id="questionCount" type="number" {...register("questionCount")} disabled={isLoading} className="mt-1" />
              {errors.questionCount && <p className="text-sm text-destructive mt-1">{errors.questionCount.message}</p>}
            </div>
            <div>
              <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
              <Input id="durationMinutes" type="number" {...register("durationMinutes")} disabled={isLoading} className="mt-1" />
              {errors.durationMinutes && <p className="text-sm text-destructive mt-1">{errors.durationMinutes.message}</p>}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
                id="isPremium"
                checked={isPremium}
                onCheckedChange={(checked) => {
                    // @ts-ignore TODO: fix type error
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
