
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Exam, Question } from '@/lib/types';
import { ADMIN_EXAMS_STORAGE_KEY } from '@/lib/constants';

const questionSchema = z.object({
  text: z.string().min(5, { message: "Question text must be at least 5 characters." }),
  option1: z.string().min(1, { message: "Option 1 cannot be empty." }),
  option2: z.string().min(1, { message: "Option 2 cannot be empty." }),
  option3: z.string().min(1, { message: "Option 3 cannot be empty." }),
  option4: z.string().min(1, { message: "Option 4 cannot be empty." }),
  correctAnswer: z.string().min(1, { message: "Please select the correct answer." }), // Will store the text of the correct option
  explanation: z.string().optional(),
}).refine(data => { // Ensure correct answer is one of the options
    const options = [data.option1, data.option2, data.option3, data.option4];
    return options.includes(data.correctAnswer);
}, {
    message: "Correct answer must match one of the provided options.",
    path: ["correctAnswer"],
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
      option1: '',
      option2: '',
      option3: '',
      option4: '',
      correctAnswer: undefined,
      explanation: '',
    },
  });

  const watchedOptions = [
    form.watch("option1"),
    form.watch("option2"),
    form.watch("option3"),
    form.watch("option4"),
  ];

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
          option1: data.option1,
          option2: data.option2,
          option3: data.option3,
          option4: data.option4,
          correctAnswer: data.correctAnswer,
          explanation: data.explanation || undefined,
        };
        
        if (!exams[examIndex].questions) {
          exams[examIndex].questions = [];
        }
        exams[examIndex].questions!.push(newQuestion);
        exams[examIndex].questionCount = exams[examIndex].questions!.length;

        localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(exams));
        toast({
          title: "Question Added",
          description: `The question has been added to "${examTitle}".`,
        });
        form.reset(); 
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="option1">Option 1</Label>
              <Input id="option1" {...form.register("option1")} disabled={isLoading} className="mt-1" />
              {form.formState.errors.option1 && <p className="text-sm text-destructive mt-1">{form.formState.errors.option1.message}</p>}
            </div>
            <div>
              <Label htmlFor="option2">Option 2</Label>
              <Input id="option2" {...form.register("option2")} disabled={isLoading} className="mt-1" />
              {form.formState.errors.option2 && <p className="text-sm text-destructive mt-1">{form.formState.errors.option2.message}</p>}
            </div>
            <div>
              <Label htmlFor="option3">Option 3</Label>
              <Input id="option3" {...form.register("option3")} disabled={isLoading} className="mt-1" />
              {form.formState.errors.option3 && <p className="text-sm text-destructive mt-1">{form.formState.errors.option3.message}</p>}
            </div>
            <div>
              <Label htmlFor="option4">Option 4</Label>
              <Input id="option4" {...form.register("option4")} disabled={isLoading} className="mt-1" />
              {form.formState.errors.option4 && <p className="text-sm text-destructive mt-1">{form.formState.errors.option4.message}</p>}
            </div>
          </div>
        
          <div>
            <Label htmlFor="correctAnswer">Correct Answer</Label>
            <Controller
              name="correctAnswer"
              control={form.control}
              render={({ field }) => (
                <Select 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    disabled={isLoading || watchedOptions.some(opt => !opt?.trim())}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select the correct answer from options above" />
                  </SelectTrigger>
                  <SelectContent>
                    {watchedOptions.map((option, index) => (
                      option?.trim() && <SelectItem key={index} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.correctAnswer && <p className="text-sm text-destructive mt-1">{form.formState.errors.correctAnswer.message}</p>}
             <p className="text-xs text-muted-foreground mt-1">Ensure options are filled above before selecting.</p>
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
