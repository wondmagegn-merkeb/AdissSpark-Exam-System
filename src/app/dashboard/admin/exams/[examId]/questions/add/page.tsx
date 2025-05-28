
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, PlusCircle, Trash2 } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Exam, Question } from '@/lib/types';
import { ADMIN_EXAMS_STORAGE_KEY } from '@/lib/constants';

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 5;

const questionSchema = z.object({
  text: z.string().min(5, { message: "Question text must be at least 5 characters." }),
  options: z.array(
      z.object({ value: z.string().min(1, { message: "Option cannot be empty." }) })
    ).min(MIN_OPTIONS, { message: `Please provide at least ${MIN_OPTIONS} options.` })
     .max(MAX_OPTIONS, { message: `You can add a maximum of ${MAX_OPTIONS} options.` }),
  correctAnswer: z.string().min(1, { message: "Please select the correct answer." }),
  explanation: z.string().optional(),
});

type QuestionFormValues = z.infer<typeof questionSchema>;

export default function AddExamQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const examId = params.examId as string;

  const [examTitle, setExamTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      options: [{ value: '' }, { value: '' }], // Start with 2 empty options
      correctAnswer: undefined,
      explanation: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });

  const watchedOptions = form.watch("options");

  useEffect(() => {
    if (examId) {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      if (storedExams) {
        const exams: Exam[] = JSON.parse(storedExams);
        const currentExam = exams.find(e => e.id === examId);
        if (currentExam) {
          setExamTitle(currentExam.title);
        } else {
          toast({ title: "Error", description: "Exam not found.", variant: "destructive" });
          router.push('/dashboard/admin/exams');
        }
      }
    }
  }, [examId, toast, router]);

  const onSubmit = async (data: QuestionFormValues) => {
    setIsLoading(true);
    try {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      let exams: Exam[] = storedExams ? JSON.parse(storedExams) : [];
      const examIndex = exams.findIndex(e => e.id === examId);

      if (examIndex > -1) {
        const newQuestion: Question = {
          id: `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          text: data.text,
          options: data.options.map(opt => opt.value),
          correctAnswer: data.correctAnswer,
          explanation: data.explanation || undefined,
        };
        
        exams[examIndex].questions = [...(exams[examIndex].questions || []), newQuestion];
        exams[examIndex].questionCount = exams[examIndex].questions.length;

        localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(exams));
        toast({
          title: "Question Added",
          description: `The question has been added to "${examTitle}".`,
        });
        form.reset(); // Reset form for another entry
        // No redirect, stay on page to add more
      } else {
        toast({ title: "Error", description: "Exam not found for adding question.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error saving question:", error);
      toast({ title: "Error", description: "Failed to add question. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!examTitle && !isLoading) {
    return (
      <Card className="shadow-lg max-w-2xl mx-auto my-8">
        <CardHeader><CardTitle>Loading Exam Details...</CardTitle></CardHeader>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg max-w-2xl mx-auto my-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Add New Question to: {examTitle}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/admin/exams/${examId}/questions`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questions
          </Button>
        </div>
        <CardDescription>
          Fill in the details for the new question.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="text">Question Text</Label>
            <Textarea id="text" {...form.register("text")} disabled={isLoading} className="mt-1" rows={3} />
            {form.formState.errors.text && <p className="text-sm text-destructive mt-1">{form.formState.errors.text.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Options</Label>
            {fields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <Input
                  {...form.register(`options.${index}.value` as const)}
                  placeholder={`Option ${index + 1}`}
                  disabled={isLoading}
                  className="flex-grow"
                />
                {fields.length > MIN_OPTIONS && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={isLoading}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
                {form.formState.errors.options?.[index]?.value && <p className="text-sm text-destructive mt-1">{form.formState.errors.options?.[index]?.value?.message}</p>}
              </div>
            ))}
            {form.formState.errors.options && !form.formState.errors.options.root?.message && form.formState.errors.options.message && (
                 <p className="text-sm text-destructive mt-1">{form.formState.errors.options.message}</p>
            )}
             {fields.length < MAX_OPTIONS && (
                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: '' })} disabled={isLoading}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Option
                </Button>
            )}
          </div>
        
          <div>
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            <Controller
              name="correctAnswer"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || watchedOptions.every(opt => !opt.value.trim())}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select the correct answer" />
                  </SelectTrigger>
                  <SelectContent>
                    {watchedOptions.map((option, index) => (
                      option.value.trim() && <SelectItem key={index} value={option.value}>{option.value}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.correctAnswer && <p className="text-sm text-destructive mt-1">{form.formState.errors.correctAnswer.message}</p>}
          </div>

          <div>
            <Label htmlFor="explanation">Explanation (Optional)</Label>
            <Textarea id="explanation" {...form.register("explanation")} disabled={isLoading} className="mt-1" rows={2} />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push(`/dashboard/admin/exams/${examId}/questions`)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Question
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

    