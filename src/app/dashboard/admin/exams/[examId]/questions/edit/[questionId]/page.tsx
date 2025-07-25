
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
import { ArrowLeft, Save, HelpCircle } from "lucide-react"; // Changed AlertTriangle to HelpCircle for variety
import { useToast } from '@/hooks/use-toast';
import type { Exam, Question } from '@/lib/types';
import { ADMIN_EXAMS_STORAGE_KEY } from '@/lib/constants';

const questionSchema = z.object({
  text: z.string().min(5, { message: "Question text must be at least 5 characters." }),
  option1: z.string().min(1, { message: "Option 1 cannot be empty." }),
  option2: z.string().min(1, { message: "Option 2 cannot be empty." }),
  option3: z.string().min(1, { message: "Option 3 cannot be empty." }),
  option4: z.string().min(1, { message: "Option 4 cannot be empty." }),
  correctAnswer: z.string().min(1, { message: "Please select the correct answer." }),
  explanation: z.string().optional(),
}).refine(data => {
    const options = [data.option1, data.option2, data.option3, data.option4];
    return options.includes(data.correctAnswer);
}, {
    message: "Correct answer must match one of the provided options.",
    path: ["correctAnswer"],
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
              option1: questionToEdit.option1,
              option2: questionToEdit.option2,
              option3: questionToEdit.option3,
              option4: questionToEdit.option4,
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
        setNotFound(true); // No exams data
        toast({ title: "Error", description: "No exam data found in storage.", variant: "destructive" });
      }
    }
  }, [examId, questionId, toast, form]);

  const onSubmit = async (data: QuestionFormValues) => {
    setIsLoading(true);
    try {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      let exams: Exam[] = storedExams ? JSON.parse(storedExams) : [];
      const examIndex = exams.findIndex(e => e.id === examId);

      if (examIndex > -1 && exams[examIndex].questions) {
        const questionIndex = (exams[examIndex].questions!).findIndex(q => q.id === questionId);
        if (questionIndex > -1) {
          exams[examIndex].questions![questionIndex] = {
            ...exams[examIndex].questions![questionIndex],
            text: data.text,
            option1: data.option1,
            option2: data.option2,
            option3: data.option3,
            option4: data.option4,
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
        toast({ title: "Error", description: "Exam not found or has no questions to update.", variant: "destructive" });
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
  
  if (!examTitle && !isLoading && !notFound) { // Added !notFound to prevent this showing if error already occurred
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
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
