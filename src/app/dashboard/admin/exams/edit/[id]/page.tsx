
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Exam } from '@/lib/types';
import { ADMIN_EXAMS_STORAGE_KEY } from '@/lib/constants';

const examSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  questionCount: z.coerce.number().int().positive({ message: "Must be a positive number." }),
  durationMinutes: z.coerce.number().int().positive({ message: "Must be a positive number." }),
  isPremium: z.boolean().default(false),
});

type ExamFormValues = z.infer<typeof examSchema>;

export default function EditAdminExamPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const examId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [itemNotFound, setItemNotFound] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
  });
  
  const isPremium = watch('isPremium');

  useEffect(() => {
    if (examId) {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      if (storedExams) {
        const exams: Exam[] = JSON.parse(storedExams);
        const examToEdit = exams.find(exam => exam.id === examId);
        if (examToEdit) {
          setValue('title', examToEdit.title);
          setValue('description', examToEdit.description);
          setValue('questionCount', examToEdit.questionCount);
          setValue('durationMinutes', examToEdit.durationMinutes);
          setValue('isPremium', examToEdit.isPremium);
        } else {
          setItemNotFound(true);
          toast({
            title: "Error",
            description: "Exam not found in storage.",
            variant: "destructive",
          });
        }
      } else {
        setItemNotFound(true);
         toast({
            title: "Error",
            description: "No exam data found in storage.",
            variant: "destructive",
          });
      }
    }
  }, [examId, setValue, toast]);

  const onSubmit = async (data: ExamFormValues) => {
    setIsLoading(true);
    try {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      let exams: Exam[] = storedExams ? JSON.parse(storedExams) : [];
      
      const examIndex = exams.findIndex(exam => exam.id === examId);
      if (examIndex > -1) {
        // Preserve existing questions, only update metadata
        const existingQuestions = exams[examIndex].questions;
        exams[examIndex] = { ...exams[examIndex], ...data, questions: existingQuestions };
        localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(exams));
        toast({
          title: "Exam Updated",
          description: `${data.title} has been updated.`,
        });
        router.push('/dashboard/admin/exams');
      } else {
         toast({
          title: "Error",
          description: "Could not find exam to update.",
          variant: "destructive",
        });
        setItemNotFound(true);
      }
    } catch (error) {
      console.error("Error updating exam in localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to update exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (itemNotFound) {
    return (
      <Card className="shadow-lg max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" /> Exam Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The exam you are trying to edit does not exist or could not be loaded.</p>
          <Button onClick={() => router.push('/dashboard/admin/exams')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader>
         <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Edit Exam</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/exams')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams List
          </Button>
        </div>
        <CardDescription>
          Modify the details for the exam. Question management is handled separately.
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
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
