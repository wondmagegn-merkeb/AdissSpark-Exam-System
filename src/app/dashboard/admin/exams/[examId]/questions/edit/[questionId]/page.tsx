
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
import { ArrowLeft, Save, HelpCircle, PlusCircle, Trash2 } from "lucide-react";
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

export default function EditExamQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const examId = params.examId as string;
  const questionId = params.questionId as string;

  const [examTitle, setExamTitle] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      options: [],
      correctAnswer: undefined,
      explanation: '',
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "options"
  });
  const watchedOptions = form.watch("options");


  useEffect(() => {
    if (examId && questionId) {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      if (storedExams) {
        const exams: Exam[] = JSON.parse(storedExams);
        const currentExam = exams.find(e => e.id === examId);
        if (currentExam) {
          setExamTitle(currentExam.title);
          const questionToEdit = (currentExam.questions || []).find(q => q.id === questionId);
          if (questionToEdit) {
            form.reset({
              text: questionToEdit.text,
              options: questionToEdit.options.map(opt => ({ value: opt })),
              correctAnswer: questionToEdit.correctAnswer,
              explanation: questionToEdit.explanation || '',
            });
          } else {
            setNotFound(true);
            toast({ title: "Error", description: "Question not found in this exam.", variant: "destructive" });
          }
        } else {
          setNotFound(true);
          toast({ title: "Error", description: "Exam not found.", variant: "destructive" });
        }
      } else {
        setNotFound(true);
      }
    }
  }, [examId, questionId, toast, form, router]);

  const onSubmit = async (data: QuestionFormValues) => {
    setIsLoading(true);
    try {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      let exams: Exam[] = storedExams ? JSON.parse(storedExams) : [];
      const examIndex = exams.findIndex(e => e.id === examId);

      if (examIndex > -1) {
        const questionIndex = (exams[examIndex].questions || []).findIndex(q => q.id === questionId);
        if (questionIndex > -1) {
          exams[examIndex].questions[questionIndex] = {
            ...exams[examIndex].questions[questionIndex],
            text: data.text,
            options: data.options.map(opt => opt.value),
            correctAnswer: data.correctAnswer,
            explanation: data.explanation || undefined,
          };
          localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(exams));
          toast({
            title: "Question Updated",
            description: `The question in "${examTitle}" has been updated.`,
          });
          router.push(`/dashboard/admin/exams/${examId}/questions`);
        } else {
          toast({ title: "Error", description: "Question not found to update.", variant: "destructive" });
        }
      } else {
        toast({ title: "Error", description: "Exam not found for updating question.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Error updating question:", error);
      toast({ title: "Error", description: "Failed to update question. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  if (notFound) {
    return (
      <Card className="shadow-lg max-w-lg mx-auto my-8">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive flex items-center">
            <HelpCircle className="mr-2 h-6 w-6" /> Question or Exam Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The question or exam you are trying to edit could not be found. It might have been deleted or the ID is incorrect.
          </p>
          <Button onClick={() => router.push(`/dashboard/admin/exams/${examId}/questions`)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Questions List
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!examTitle && !isLoading) {
     return (
      <Card className="shadow-lg max-w-2xl mx-auto my-8">
        <CardHeader><CardTitle>Loading Question Details...</CardTitle></CardHeader>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg max-w-2xl mx-auto my-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Edit Question for: {examTitle}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/admin/exams/${examId}/questions`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questions
          </Button>
        </div>
        <CardDescription>
          Modify the details for this question.
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
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

    