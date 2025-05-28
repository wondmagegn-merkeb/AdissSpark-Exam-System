
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, FileText, Clock, AlertTriangle, CheckCircle2, Target, Info, Flag, BarChart3, ListChecks } from 'lucide-react';
import type { Exam, Question, ExamHistoryEntry } from '@/lib/types';
import { PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { ADMIN_GLOBAL_QUESTIONS_STORAGE_KEY, ADMIN_EXAMS_STORAGE_KEY } from '@/lib/constants'; // Import storage keys

// Mock student-facing exam definitions - these now primarily list question IDs from the global bank
const mockStudentExams: Exam[] = [
  {
    id: 'model-1',
    title: 'Model Exam 1: General Knowledge',
    description: 'A comprehensive test covering various general knowledge topics.',
    durationMinutes: 5, 
    isPremium: false,
    questionIds: ["gq1", "gq2", "gq3"], 
  },
  {
    id: 'model-2',
    title: 'Model Exam 2: Verbal Reasoning',
    description: 'Focuses on verbal reasoning, comprehension, and analytical skills.',
    durationMinutes: 12, 
    isPremium: false,
    questionIds: Array.from({ length: 100 }, (_, i) => `gq2_${i + 1}_placeholder`), // Placeholder for 100 questions
  },
  {
    id: 'model-3',
    title: 'Model Exam 3: Quantitative Aptitude (Premium)',
    description: 'Challenging questions on quantitative aptitude.',
    durationMinutes: 1, 
    isPremium: true,
    questionIds: ["gq6", "gq4"], 
  },
   {
    id: 'model-4',
    title: 'Model Exam 4: Logical Reasoning',
    description: 'Test your logical thinking and problem-solving abilities.',
    durationMinutes: 1,
    isPremium: false,
    questionIds: ["gq1", "gq5"], // Use some existing global questions
  },
  {
    id: 'model-5',
    title: 'Model Exam 5: Specialized Subject (Premium)',
    description: 'An in-depth exam for a specialized subject, designed by experts.',
    durationMinutes: 1, 
    isPremium: true,
    questionIds: ["gq2", "gq6"], // Use some existing global questions
  },
];


const chartConfig = {
  correct: {
    label: "Correct",
    color: "hsl(var(--chart-1))", 
  },
  incorrect: {
    label: "Incorrect",
    color: "hsl(var(--destructive))",
  },
  unanswered: {
    label: "Unanswered",
    color: "hsl(var(--muted))",
  },
} satisfies ChartConfig;

const MAX_EXAM_HISTORY_ITEMS = 5;

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.examId as string;

  const [examDefinition, setExamDefinition] = useState<Exam | undefined>(undefined);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  
  const [examStarted, setExamStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [examFinished, setExamFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [confusedQuestions, setConfusedQuestions] = useState<Record<string, boolean>>({});
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  useEffect(() => {
    // Load exam definition (could be from student-facing mock, or admin-created exams in localStorage)
    const adminExamsString = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
    let foundExam: Exam | undefined;
    if (adminExamsString) {
        const adminExams: Exam[] = JSON.parse(adminExamsString);
        foundExam = adminExams.find(e => e.id === examId);
    }
    if (!foundExam) {
        foundExam = mockStudentExams.find(e => e.id === examId);
    }
    setExamDefinition(foundExam);

    if (foundExam && foundExam.questionIds) {
      const globalQuestionsString = localStorage.getItem(ADMIN_GLOBAL_QUESTIONS_STORAGE_KEY);
      if (globalQuestionsString) {
        const allGlobalQuestions: Question[] = JSON.parse(globalQuestionsString);
        const questionsForThisExam = allGlobalQuestions.filter(q => foundExam!.questionIds.includes(q.id));
        
        // Ensure the order of questions matches the order in questionIds
        const orderedQuestions = foundExam.questionIds.map(id => questionsForThisExam.find(q => q.id === id)).filter(q => q !== undefined) as Question[];
        setExamQuestions(orderedQuestions);
      } else {
        console.warn("Global question bank not found in localStorage. Using empty questions for exam.");
        setExamQuestions([]);
      }
    } else if (foundExam && !foundExam.questionIds) {
         console.warn(`Exam ${examId} has no questionIds defined. Using empty questions.`);
         setExamQuestions([]);
    }

  }, [examId]);


  useEffect(() => {
    if (examDefinition && examQuestions.length > 0 && !examStarted) { 
      setTimeLeft(examDefinition.durationMinutes * 60);
    } else if (examDefinition && examQuestions.length === 0 && !examStarted) {
        // If no questions are loaded for the exam, prevent timer start.
        setTimeLeft(0); 
    }
  }, [examDefinition, examQuestions, examStarted]);

  const handleSubmitExam = useCallback(() => {
    if (!examDefinition || examQuestions.length === 0) return;
    let correctAnswers = 0;
    examQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const totalAnswered = Object.keys(userAnswers).length;
    const localUnansweredCount = examQuestions.length - totalAnswered;
    const localIncorrectCount = totalAnswered - correctAnswers;
    const percentageScore = examQuestions.length > 0 ? (correctAnswers / examQuestions.length) * 100 : 0;


    setScore(correctAnswers);
    setUnansweredCount(localUnansweredCount);
    setIncorrectCount(localIncorrectCount);

    setExamFinished(true);
    setExamStarted(false); 
    setShowSubmitConfirm(false);

    try {
      // Reconstruct a minimal Exam object for localStorage results page if needed
      const examForResults: Exam = {
        id: examDefinition.id,
        title: examDefinition.title,
        description: examDefinition.description,
        durationMinutes: examDefinition.durationMinutes,
        isPremium: examDefinition.isPremium,
        questionIds: examDefinition.questionIds, // Keep IDs for reference
        // Add questions that were part of this attempt for the results page
        // This ensures the results page shows the exact questions taken
        // (Though the Question type now is slightly different in how options are stored)
        // For simplicity, we'll rely on the results page re-fetching questions by ID if needed
        // Or, we can pass the examQuestions array here. Let's pass the resolved questions.
      };

      localStorage.setItem(`completedExam_${examDefinition.id}`, JSON.stringify({ 
        exam: {...examForResults, questions: examQuestions}, // Store the actual questions taken
        userAnswers, 
        score: correctAnswers, 
        incorrectCount: localIncorrectCount, 
        unansweredCount: localUnansweredCount 
      }));

      const newHistoryEntry: ExamHistoryEntry = {
        examId: examDefinition.id,
        examTitle: examDefinition.title,
        dateCompleted: new Date().toISOString(),
        score: correctAnswers,
        totalQuestions: examQuestions.length,
        percentageScore: parseFloat(percentageScore.toFixed(1)),
      };

      const existingHistoryString = localStorage.getItem('examHistory');
      let examHistory: ExamHistoryEntry[] = [];
      if (existingHistoryString) {
        try {
          examHistory = JSON.parse(existingHistoryString);
          if (!Array.isArray(examHistory)) examHistory = [];
        } catch (e) {
          console.error("Error parsing existing exam history:", e);
          examHistory = [];
        }
      }
      
      examHistory.unshift(newHistoryEntry); 
      if (examHistory.length > MAX_EXAM_HISTORY_ITEMS) {
        examHistory = examHistory.slice(0, MAX_EXAM_HISTORY_ITEMS); 
      }
      localStorage.setItem('examHistory', JSON.stringify(examHistory));

    } catch (error) {
      console.error("Error saving exam results or history to localStorage:", error);
    }

  }, [examDefinition, examQuestions, userAnswers]);

  useEffect(() => {
    if (examStarted && !examFinished && timeLeft > 0 && examQuestions.length > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (examStarted && !examFinished && timeLeft === 0 && examQuestions.length > 0) {
      handleSubmitExam(); 
    }
  }, [examStarted, examFinished, timeLeft, handleSubmitExam, examQuestions.length]);

  const handleToggleConfused = (questionId: string) => {
    setConfusedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (!examDefinition) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive flex items-center justify-center"><AlertTriangle className="mr-2 h-6 w-6" />Exam Not Found</CardTitle>
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
  
  if (examDefinition && examQuestions.length === 0 && !examStarted) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-destructive flex items-center justify-center"><AlertTriangle className="mr-2 h-6 w-6" />Error Loading Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Could not load questions for exam: "{examDefinition.title}". Please ensure questions are available in the global bank and linked correctly.
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


  const currentQuestion = examQuestions[currentQuestionIndex];

  const handleStartExam = () => {
    if(examQuestions.length === 0) {
        alert("No questions loaded for this exam. Cannot start."); // Or use toast
        return;
    }
    setExamStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setConfusedQuestions({});
    setTimeLeft(examDefinition.durationMinutes * 60);
    setExamFinished(false);
    setScore(0);
    setUnansweredCount(0);
    setIncorrectCount(0);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < examQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    if (!examFinished) {
      setCurrentQuestionIndex(index);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (examFinished) {
    const pieData = [
      { name: 'Correct', value: score, fill: chartConfig.correct.color },
      { name: 'Incorrect', value: incorrectCount, fill: chartConfig.incorrect.color },
      { name: 'Unanswered', value: unansweredCount, fill: chartConfig.unanswered.color },
    ].filter(item => item.value > 0); 

    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-lg mx-auto shadow-xl text-center">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground flex items-center justify-center">
              <CheckCircle2 className="mr-3 h-8 w-8 text-green-500" /> Exam Completed!
            </CardTitle>
            <CardDescription className="text-md text-muted-foreground pt-1">
              You have completed: {examDefinition.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-muted/50 rounded-lg">
              <p className="text-xl text-muted-foreground">Your Score:</p>
              <p className="text-5xl font-bold text-primary">
                {score} <span className="text-3xl text-muted-foreground">/ {examQuestions.length}</span>
              </p>
            </div>

            {pieData.length > 0 && (
              <Card className="p-4">
                <CardHeader>
                    <CardTitle className="text-xl flex items-center justify-center">
                        <BarChart3 className="mr-2 h-6 w-6 text-primary" />
                        Results Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} labelLine={false} 
                           label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                              const RADIAN = Math.PI / 180;
                              const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                              const x = cx + radius * Math.cos(-midAngle * RADIAN);
                              const y = cy + radius * Math.sin(-midAngle * RADIAN);
                              return (
                                <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                                  {`${(percent * 100).toFixed(0)}%`}
                                </text>
                              );
                            }}
                      >
                        {pieData.map((entry, index_cell) => (
                          <Cell key={`cell-${index_cell}`} fill={entry.fill} 
                                className="stroke-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                   <div className="mt-4 flex justify-center space-x-4 text-sm text-muted-foreground">
                    {pieData.map((entry) => (
                      <div key={entry.name} className="flex items-center">
                        <span style={{ backgroundColor: entry.fill }} className="w-3 h-3 rounded-full mr-2"></span>
                        {entry.name}: {entry.value}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 justify-center">
              <Button 
                size="lg" 
                onClick={() => router.push(`/dashboard/exams/${examDefinition.id}/results`)}
              >
                <ListChecks className="mr-2 h-4 w-4" />
                View Detailed Results
              </Button>
              <Button size="lg" variant="outline" onClick={() => router.push('/dashboard/exams')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Exams List
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="pb-4">
            <Button variant="outline" size="sm" className="mb-6 w-fit" onClick={() => router.push('/dashboard/exams')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Exams List
            </Button>
            <CardTitle className="text-3xl font-bold text-foreground">{examDefinition.title}</CardTitle>
            <CardDescription className="text-md text-muted-foreground pt-1">
              {examDefinition.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <div className="flex items-center p-3 bg-muted/50 rounded-md">
                <FileText className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{examQuestions.length} Questions</p>
                  <p className="text-xs text-muted-foreground">Total questions in this exam.</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-muted/50 rounded-md">
                <Clock className="mr-3 h-5 w-5 text-primary" />
                <div>
                  <p className="font-semibold">{examDefinition.durationMinutes} Minutes</p>
                  <p className="text-xs text-muted-foreground">Allocated time for this exam.</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6 p-4 border rounded-md bg-background">
              <h3 className="text-lg font-semibold mb-2 text-foreground flex items-center"><Info className="mr-2 h-5 w-5 text-primary"/>Instructions:</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Read each question carefully before answering.</li>
                <li>Ensure you have a stable internet connection.</li>
                <li>The timer will start once you click "Start Exam Now".</li>
                <li>Do not refresh the page or navigate away during the exam.</li>
                <li>You can navigate between questions using the panel on the right.</li>
                <li>The exam will auto-submit if the timer runs out.</li>
              </ul>
            </div>

            <Button size="lg" className="w-full font-semibold text-lg py-6" onClick={handleStartExam} disabled={examQuestions.length === 0}>
              {examQuestions.length === 0 ? "Loading Questions..." : "Start Exam Now"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure currentQuestion is available before rendering exam taking UI
  if (!currentQuestion) {
     return (
      <div className="flex flex-col min-h-screen bg-muted/40 p-4 space-y-4 items-center justify-center">
        <Card><CardContent className="p-4">Loading question data...</CardContent></Card>
      </div>
     )
  }

  const optionsForCurrentQuestion = [
    currentQuestion.option1,
    currentQuestion.option2,
    currentQuestion.option3,
    currentQuestion.option4,
  ];


  return (
    <div className="flex flex-col min-h-screen bg-muted/40 p-4 space-y-4">
      <Card className="w-full shadow-md">
        <CardHeader className="py-3">
          <CardTitle className="text-xl text-center font-semibold text-primary">ADDISSPARK Online Exam Center</CardTitle>
        </CardHeader>
      </Card>

      <div className="flex flex-1 gap-4 overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Card className="w-full shadow-xl flex-1 flex flex-col">
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-foreground">{examDefinition.title}</h2>
                <div className="flex items-center text-lg font-medium text-primary">
                  <Clock className="mr-2 h-5 w-5" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="py-6 flex-1">
              <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-lg font-medium text-foreground">Question {currentQuestionIndex + 1}:</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleConfused(currentQuestion.id)}
                    className={`
                      ${confusedQuestions[currentQuestion.id] ? 'text-destructive hover:bg-destructive/10 hover:text-destructive' : 'text-muted-foreground hover:text-foreground'}
                      p-1 h-auto items-center
                    `}
                    aria-pressed={confusedQuestions[currentQuestion.id]}
                    title={confusedQuestions[currentQuestion.id] ? "Unmark from review" : "Mark for review"}
                  >
                    <Flag className={`h-4 w-4 mr-1 ${confusedQuestions[currentQuestion.id] ? 'fill-destructive text-destructive' : ''}`} />
                    <span className="text-xs">{confusedQuestions[currentQuestion.id] ? 'Marked' : 'Review'}</span>
                  </Button>
                </div>
                <p className="text-xl text-foreground/90">{currentQuestion.text}</p>
              </div>
              
              <RadioGroup
                value={userAnswers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                className="space-y-3 mb-8"
              >
                {optionsForCurrentQuestion.map((option, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value={option} id={`${currentQuestion.id}-option-${index}`} />
                    <Label htmlFor={`${currentQuestion.id}-option-${index}`} className="text-md flex-1 cursor-pointer">{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between items-center">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Quit Exam
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to quit?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Your progress will not be saved and you will have to start over.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => router.push('/dashboard/exams')} className="bg-destructive hover:bg-destructive/90">
                        Quit Exam
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              
              <div className="flex items-center space-x-2">
                {currentQuestionIndex > 0 && (
                  <Button onClick={handlePreviousQuestion} variant="outline" size="lg">
                    Previous Question
                  </Button>
                )}
                {currentQuestionIndex < examQuestions.length - 1 ? (
                  <Button onClick={handleNextQuestion} size="lg">
                    Next Question
                  </Button>
                ) : (
                  <AlertDialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white" 
                        onClick={() => setShowSubmitConfirm(true)}
                      >
                        <Target className="mr-2 h-5 w-5" />
                        Submit Exam
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirm Submission</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to submit your answers? You cannot change them after submission.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleSubmitExam}>Submit</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>

        <aside className="w-80 border-l bg-background p-0 hidden md:flex md:flex-col max-h-[calc(100vh-8rem)]"> 
          <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
              <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="text-lg text-center font-semibold text-foreground">Questions</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-6 gap-1.5"> 
                  {examQuestions.map((q, index) => {
                      const qId = q.id;
                      const isCurrent = index === currentQuestionIndex;
                      const isAnswered = !!userAnswers[qId];
                      const isConfused = !!confusedQuestions[qId];

                      let combinedClassName = "aspect-square h-9 w-9 p-0 transition-all duration-150 ease-in-out text-xs"; 
                      let variantStyle: "default" | "secondary" | "outline" | "destructive" = "outline";

                      if (isCurrent) {
                          variantStyle = "default";
                          combinedClassName += " ring-2 ring-offset-background ring-primary focus:ring-primary";
                          if (isConfused) {
                              combinedClassName += " border-2 border-destructive";
                          }
                      } else if (isConfused) {
                          variantStyle = "outline";
                          combinedClassName += ` border-destructive text-destructive hover:bg-destructive/10 ${isAnswered ? 'bg-destructive/5' : ''}`;
                      } else if (isAnswered) {
                          variantStyle = "default"; 
                          combinedClassName += " bg-green-500 hover:bg-green-600 text-primary-foreground border-green-600";
                      } else { 
                          variantStyle = "outline";
                          combinedClassName += " border-border hover:bg-muted/50";
                      }

                      return (
                      <Button
                          key={qId}
                          variant={variantStyle}
                          className={combinedClassName}
                          onClick={() => handleQuestionNavigation(index)}
                          disabled={examFinished}
                      >
                          {index + 1}
                      </Button>
                      );
                  })}
                  </div>
              </CardContent>
              <CardFooter className="py-3 px-4 border-t">
                  <div className="w-full space-y-1">
                      <p className="text-xs text-muted-foreground flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full bg-primary mr-2 align-middle"></span> Current
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2 align-middle"></span> Answered
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full border border-destructive mr-2 align-middle"></span> Marked for Review
                      </p>
                       <p className="text-xs text-muted-foreground flex items-center">
                          <span className="inline-block w-3 h-3 rounded-full border bg-card mr-2 align-middle"></span> Unanswered
                      </p>
                  </div>
              </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}
