
"use client";

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ArrowLeft, FileText, Clock } from 'lucide-react';
import type { Exam } from '@/lib/types'; // Assuming Exam type is defined here

// Mock exam data - in a real app, you would fetch this based on examId
const mockExams: Exam[] = [
  {
    id: 'model-1',
    title: 'Model Exam 1: General Knowledge',
    description: 'A comprehensive test covering various general knowledge topics.',
    questionCount: 50,
    durationMinutes: 60,
    isPremium: false,
  },
  {
    id: 'model-2',
    title: 'Model Exam 2: Verbal Reasoning',
    description: 'Focuses on verbal reasoning, comprehension, and analytical skills.',
    questionCount: 40,
    durationMinutes: 45,
    isPremium: false,
  },
  {
    id: 'model-3',
    title: 'Model Exam 3: Quantitative Aptitude (Premium)',
    description: 'Challenging questions on quantitative aptitude.',
    questionCount: 60,
    durationMinutes: 90,
    isPremium: true,
  },
  {
    id: 'model-4',
    title: 'Model Exam 4: Logical Reasoning',
    description: 'Test your logical thinking and problem-solving abilities.',
    questionCount: 30,
    durationMinutes: 60,
    isPremium: false,
  },
  {
    id: 'model-5',
    title: 'Model Exam 5: Specialized Subject (Premium)',
    description: 'An in-depth exam for a specialized subject, designed by experts.',
    questionCount: 75,
    durationMinutes: 120,
    isPremium: true,
  },
];


export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  // Find the exam from mock data. In a real app, fetch from a DB or API.
  const exam = mockExams.find(e => e.id === examId);

  if (!exam) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Exam Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              The exam you are looking for (ID: {examId}) does not exist or could not be loaded.
            </p>
            <Button onClick={() => router.push('/dashboard/exams')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams List
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For now, Start Now button is a placeholder
  const handleStartExam = () => {
    alert(`Starting exam: ${exam.title}`);
    // Future: Navigate to the actual exam interface or begin the exam process
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto shadow-xl">
        <CardHeader className="pb-4">
          <Button variant="outline" size="sm" className="mb-6 w-fit" onClick={() => router.push('/dashboard/exams')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams List
          </Button>
          <CardTitle className="text-3xl font-bold text-foreground">{exam.title}</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-1">
            {exam.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
            <div className="flex items-center p-3 bg-muted/50 rounded-md">
              <FileText className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{exam.questionCount} Questions</p>
                <p className="text-xs text-muted-foreground">Total number of questions in this exam.</p>
              </div>
            </div>
            <div className="flex items-center p-3 bg-muted/50 rounded-md">
              <Clock className="mr-3 h-5 w-5 text-primary" />
              <div>
                <p className="font-semibold">{exam.durationMinutes} Minutes</p>
                <p className="text-xs text-muted-foreground">Allocated time for this exam.</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6 p-4 border rounded-md bg-background">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Instructions:</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Read each question carefully before answering.</li>
              <li>Ensure you have a stable internet connection.</li>
              <li>The timer will start once you click "Start Now".</li>
              <li>Do not refresh the page or navigate away during the exam.</li>
              <li>All questions must be answered to complete the exam.</li>
            </ul>
          </div>

          <Button size="lg" className="w-full font-semibold text-lg py-6" onClick={handleStartExam}>
            Start Exam Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
