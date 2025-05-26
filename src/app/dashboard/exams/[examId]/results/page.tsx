
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, Info, BarChart3, MessageSquareText } from 'lucide-react';
import type { Exam, Question } from '@/lib/types';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface CompletedExamData {
  exam: Exam;
  userAnswers: Record<string, string>;
  score: number;
  incorrectCount: number;
  unansweredCount: number;
}

const chartConfig = {
  correct: { label: "Correct", color: "hsl(var(--chart-1))" },
  incorrect: { label: "Incorrect", color: "hsl(var(--destructive))" },
  unanswered: { label: "Unanswered", color: "hsl(var(--muted))" },
} satisfies ChartConfig;

export default function ExamResultsPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [completedData, setCompletedData] = useState<CompletedExamData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined' && examId) {
      try {
        const storedData = localStorage.getItem(`completedExam_${examId}`);
        if (storedData) {
          setCompletedData(JSON.parse(storedData));
        }
      } catch (error) {
        console.error("Error loading exam results from localStorage:", error);
      }
      setLoading(false);
    }
  }, [examId]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader><CardTitle>Loading Results...</CardTitle></CardHeader>
          <CardContent><p>Please wait while we fetch your exam results.</p></CardContent>
        </Card>
      </div>
    );
  }

  if (!completedData) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Results Not Found</AlertTitle>
          <AlertDescription>
            We couldn't find the results for this exam (ID: {examId}). It's possible they were not saved correctly or have been cleared.
          </AlertDescription>
        </Alert>
        <Button onClick={() => router.push('/dashboard/exams')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exams List
        </Button>
      </div>
    );
  }

  const { exam, userAnswers, score, incorrectCount, unansweredCount } = completedData;

  const pieData = [
    { name: 'Correct', value: score, fill: chartConfig.correct.color },
    { name: 'Incorrect', value: incorrectCount, fill: chartConfig.incorrect.color },
    { name: 'Unanswered', value: unansweredCount, fill: chartConfig.unanswered.color },
  ].filter(item => item.value > 0);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8 shadow-lg">
        <CardHeader>
          <Button variant="outline" size="sm" className="mb-4 w-fit" onClick={() => router.push('/dashboard/exams')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams List
          </Button>
          <CardTitle className="text-3xl font-bold text-foreground">Detailed Results: {exam.title}</CardTitle>
          <CardDescription className="text-md text-muted-foreground pt-1">
            Review your answers and see the correct solutions.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content: Questions Review */}
        <div className="flex-1 space-y-6">
          {exam.questions.map((question, index) => {
            const userAnswer = userAnswers[question.id];
            const isCorrect = userAnswer === question.correctAnswer;
            const isAnswered = userAnswer !== undefined;

            let questionStatusIcon = <Info className="h-5 w-5 text-blue-500" />;
            let questionStatusText = "Status: Information";
            let questionStatusColor = "text-blue-500";

            if (isAnswered) {
              if (isCorrect) {
                questionStatusIcon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
                questionStatusText = "Correct";
                questionStatusColor = "text-green-500";
              } else {
                questionStatusIcon = <XCircle className="h-5 w-5 text-red-500" />;
                questionStatusText = "Incorrect";
                questionStatusColor = "text-red-500";
              }
            } else {
              questionStatusIcon = <AlertCircle className="h-5 w-5 text-yellow-500" />;
              questionStatusText = "Unanswered";
              questionStatusColor = "text-yellow-600 dark:text-yellow-400";
            }

            return (
              <Card key={question.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">Question {index + 1}</CardTitle>
                    <div className={`flex items-center text-sm font-medium ${questionStatusColor}`}>
                      {questionStatusIcon}
                      <span className="ml-1.5">{questionStatusText}</span>
                    </div>
                  </div>
                  <p className="text-md text-foreground/90 pt-2">{question.text}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="space-y-2">
                    {question.options.map((option, optIndex) => {
                      const isUserSelectedOption = userAnswer === option;
                      const isCorrectOption = question.correctAnswer === option;
                      let optionStyle = "border-muted-foreground/30";
                      let icon = null;

                      if (isAnswered) {
                        if (isUserSelectedOption) {
                          optionStyle = isCorrect ? "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300" : "border-red-500 bg-red-500/10 text-red-700 dark:text-red-300";
                          icon = isCorrect ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5 text-red-500" />;
                        } else if (isCorrectOption) {
                          optionStyle = "border-green-500 bg-green-500/10 text-green-700 dark:text-green-300";
                          icon = <CheckCircle2 className="h-5 w-5 text-green-500 opacity-70" />;
                        }
                      } else { // Unanswered
                        if (isCorrectOption) {
                          optionStyle = "border-yellow-500 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
                           icon = <Info className="h-5 w-5 text-yellow-500 opacity-70" />;
                        }
                      }
                      
                      return (
                        <li key={optIndex} className={`flex items-center justify-between p-3 border rounded-md text-sm ${optionStyle}`}>
                          <span>{option}</span>
                          {icon}
                        </li>
                      );
                    })}
                  </ul>
                  {question.explanation && (
                    <Alert className="bg-blue-500/5 border-blue-500/30">
                       <MessageSquareText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      <AlertTitle className="text-blue-700 dark:text-blue-300">Explanation</AlertTitle>
                      <AlertDescription className="text-blue-600 dark:text-blue-400/90">
                        {question.explanation}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Right Sidebar: Summary */}
        <aside className="w-full lg:w-96 space-y-6">
          <Card className="shadow-md sticky top-8"> {/* Make summary sticky */}
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <BarChart3 className="mr-2 h-6 w-6 text-primary" />
                Your Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-muted-foreground">Total Score:</p>
              <p className="text-4xl font-bold text-primary mb-4">
                {score} <span className="text-2xl text-muted-foreground">/ {exam.questions.length}</span>
              </p>

              {pieData.length > 0 && (
                <>
                <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[200px] mb-2">
                    <PieChart>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} labelLine={false}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                            const RADIAN = Math.PI / 180;
                            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                            const x = cx + radius * Math.cos(-midAngle * RADIAN);
                            const y = cy + radius * Math.sin(-midAngle * RADIAN);
                            return (
                            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-[10px] font-medium">
                                {`${(percent * 100).toFixed(0)}%`}
                            </text>
                            );
                        }}
                    >
                        {pieData.map((entry) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} className="stroke-background focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1" />
                        ))}
                    </Pie>
                    </PieChart>
                </ChartContainer>
                <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {pieData.map((entry) => (
                    <div key={entry.name} className="flex items-center">
                        <span style={{ backgroundColor: entry.fill }} className="w-2.5 h-2.5 rounded-full mr-1.5"></span>
                        {entry.name}: {entry.value}
                    </div>
                    ))}
                </div>
                </>
              )}
            </CardContent>
            <CardFooter className="flex-col space-y-3 pt-4">
                <Button onClick={() => router.push(`/dashboard/exams/${examId}/take`)} className="w-full">
                    Retake Exam
                </Button>
                <Button onClick={() => router.push('/dashboard/exams')} variant="outline" className="w-full">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams List
                </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}
