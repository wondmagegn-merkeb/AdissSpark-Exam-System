
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { Exam } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { FileText, Clock, Lock, Sparkles } from 'lucide-react';
import Image from 'next/image';

const mockExams: Exam[] = [
  {
    id: 'model-1',
    title: 'Model Exam 1: General Knowledge',
    description: 'A comprehensive test covering various general knowledge topics. Ideal for baseline assessment.',
    questionCount: 50,
    durationMinutes: 60,
    isPremium: false,
  },
  {
    id: 'model-2',
    title: 'Model Exam 2: Verbal Reasoning',
    description: 'Focuses on verbal reasoning, comprehension, and analytical skills. Prepare for aptitude tests.',
    questionCount: 40,
    durationMinutes: 45,
    isPremium: false,
  },
  {
    id: 'model-3',
    title: 'Model Exam 3: Quantitative Aptitude (Premium)',
    description: 'Challenging questions on quantitative aptitude. Requires a premium subscription.',
    questionCount: 60,
    durationMinutes: 90,
    isPremium: true,
  },
  {
    id: 'model-4',
    title: 'Model Exam 4: Logical Reasoning',
    description: 'Test your logical thinking and problem-solving abilities with these tricky puzzles.',
    questionCount: 30,
    durationMinutes: 60,
    isPremium: false,
  },
  {
    id: 'model-5',
    title: 'Model Exam 5: Specialized Subject (Premium)',
    description: 'An in-depth exam for a specialized subject, designed by experts. Premium access only.',
    questionCount: 75,
    durationMinutes: 120,
    isPremium: true,
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

      {mockExams.length === 0 ? (
        <p className="text-center text-muted-foreground">No exams available at the moment. Please check back later.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockExams.map((exam) => {
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
                      <span>{exam.questionCount} Questions</span>
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
