
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Exam, Question } from '@/lib/types'; // Import Question
import { useAuth } from '@/hooks/useAuth';
import { FileText, Clock, Lock, Sparkles } from 'lucide-react';
import Image from 'next/image';

// Sample questions - these should now follow the new Question structure
const sampleGlobalQuestions: Question[] = [
  { id: "gq1", text: "What is the capital of Ethiopia?", option1: "Nairobi", option2: "Addis Ababa", option3: "Cairo", option4: "Lagos", correctAnswer: "Addis Ababa", explanation: "Addis Ababa is the capital and largest city of Ethiopia." },
  { id: "gq2", text: "Which river is the longest in the world?", option1: "Amazon", option2: "Nile", option3: "Yangtze", option4: "Mississippi", correctAnswer: "Nile", explanation: "The Nile River is traditionally considered the longest river in the world." },
  { id: "gq3", text: "Who painted the Mona Lisa?", option1: "Vincent van Gogh", option2: "Pablo Picasso", option3: "Leonardo da Vinci", option4: "Claude Monet", correctAnswer: "Leonardo da Vinci", explanation: "The Mona Lisa was painted by the Italian Renaissance artist Leonardo da Vinci." },
  { id: "gq4", text: "What is 2 + 2?", option1: "3", option2: "4", option3: "5", option4: "6", correctAnswer: "4", explanation: "Basic arithmetic." },
  { id: "gq5", text: "In which continent is Ethiopia located?", option1: "Asia", option2: "Europe", option3: "Africa", option4: "South America", correctAnswer: "Africa" },
  { id: "gq6", text: "What is the chemical symbol for water?", option1: "O2", option2: "CO2", option3: "H2O", option4: "NaCl", correctAnswer: "H2O"},
];


const mockStudentExams: Exam[] = [
  {
    id: 'model-1',
    title: 'Model Exam 1: General Knowledge',
    description: 'A comprehensive test covering various general knowledge topics. Ideal for baseline assessment.',
    durationMinutes: 60,
    isPremium: false,
    questions: [sampleGlobalQuestions[0], sampleGlobalQuestions[1], sampleGlobalQuestions[2]], 
  },
  {
    id: 'model-2',
    title: 'Model Exam 2: Verbal Reasoning',
    description: 'Focuses on verbal reasoning, comprehension, and analytical skills. Prepare for aptitude tests.',
    durationMinutes: 45,
    isPremium: false,
    questions: [sampleGlobalQuestions[3], sampleGlobalQuestions[4]], 
  },
  {
    id: 'model-3',
    title: 'Model Exam 3: Quantitative Aptitude (Premium)',
    description: 'Challenging questions on quantitative aptitude. Requires a premium subscription.',
    durationMinutes: 90,
    isPremium: true,
    questions: [sampleGlobalQuestions[5], sampleGlobalQuestions[0], sampleGlobalQuestions[3]], 
  },
  {
    id: 'model-4',
    title: 'Model Exam 4: Logical Reasoning',
    description: 'Test your logical thinking and problem-solving abilities with these tricky puzzles.',
    durationMinutes: 60,
    isPremium: false,
    questions: [sampleGlobalQuestions[1], sampleGlobalQuestions[4], sampleGlobalQuestions[5]], 
  },
  {
    id: 'model-5',
    title: 'Model Exam 5: Specialized Subject (Premium)',
    description: 'An in-depth exam for a specialized subject, designed by experts. Premium access only.',
    durationMinutes: 120,
    isPremium: true,
    questions: [sampleGlobalQuestions[0], sampleGlobalQuestions[2], sampleGlobalQuestions[4], sampleGlobalQuestions[5]], 
  },
];

export default function ExamsPage() {
  const { isSubscribed } = useAuth();

  const getShortTitle = (title: string) => {
    return title.split(':')[0];
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Available Practice Exams
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Choose an exam to test your knowledge and prepare for success.
        </p>
      </div>

      {!isSubscribed && (
        <Alert className="mb-8 border-primary/50 bg-primary/5 text-primary-foreground">
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary">Unlock Premium Exams!</AlertTitle>
          <AlertDescription>
            Upgrade to a premium subscription to access all exams and maximize your preparation.
            <Button variant="link" className="p-0 h-auto ml-1 text-primary hover:underline" asChild>
              <Link href="/dashboard/payment">Upgrade Now</Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {mockStudentExams.length === 0 ? (
        <p className="text-center text-muted-foreground">No exams available at the moment. Please check back later.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockStudentExams.map((exam) => {
            const canAccess = !exam.isPremium || (exam.isPremium && isSubscribed);
            const shortTitle = getShortTitle(exam.title);
            return (
              <Card key={exam.id} className={`flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 ${!canAccess ? 'opacity-70 bg-muted/30' : ''}`}>
                <CardHeader>
                  <div className="flex items-center gap-3 mb-1">
                    {exam.isPremium ? <Lock className="h-7 w-7 text-primary" /> : <FileText className="h-7 w-7 text-primary" />}
                    <CardTitle className="text-xl">{shortTitle}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <Image
                    src={`https://placehold.co/600x300.png`}
                    alt={shortTitle} 
                    width={600}
                    height={300}
                    className="rounded-md mb-4 w-full object-cover aspect-[2/1]"
                    data-ai-hint={exam.isPremium ? "premium test" : "study exam"}
                  />
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      <span>{exam.questions?.length || 0} Questions</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>{exam.durationMinutes} Minutes</span>
                    </div>
                    {exam.isPremium && (
                      <div className="flex items-center pt-1 text-primary font-medium">
                        <Sparkles className="mr-2 h-4 w-4" />
                        <span>Premium Exam</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  {canAccess ? (
                    <Button asChild className="w-full">
                      <Link href={`/dashboard/exams/${exam.id}/take`}>Start Exam</Link>
                    </Button>
                  ) : (
                    <Button className="w-full" asChild>
                      <Link href="/dashboard/payment">
                        <Lock className="mr-2 h-4 w-4" />
                        Upgrade to Access
                      </Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
