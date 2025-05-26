
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

// Mock exam data with questions
const mockExams: Exam[] = [
  {
    id: 'model-1',
    title: 'Model Exam 1: General Knowledge',
    description: 'A comprehensive test covering various general knowledge topics.',
    questionCount: 3,
    durationMinutes: 5, // Shortened for testing
    isPremium: false,
    questions: [
      { id: 'q1_1', text: 'What is the capital of Ethiopia?', options: ['Nairobi', 'Addis Ababa', 'Cairo', 'Lagos'], correctAnswer: 'Addis Ababa', explanation: 'Addis Ababa is the capital and largest city of Ethiopia.' },
      { id: 'q1_2', text: 'Which river is the longest in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correctAnswer: 'Nile', explanation: 'The Nile River is traditionally considered the longest river in the world.' },
      { id: 'q1_3', text: 'Who painted the Mona Lisa?', options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'], correctAnswer: 'Leonardo da Vinci', explanation: 'The Mona Lisa was painted by the Italian Renaissance artist Leonardo da Vinci.' },
    ],
  },
  {
    id: 'model-2',
    title: 'Model Exam 2: Verbal Reasoning',
    description: 'Focuses on verbal reasoning, comprehension, and analytical skills.',
    questionCount: 100, 
    durationMinutes: 12, // Adjusted duration for 100 questions (120/10)
    questions: Array.from({ length: 100 }, (_, i) => ({
      id: `q2_${i + 1}`,
      text: `Verbal Reasoning Question ${i + 1}: Choose the correct synonym for "ephemeral". This is a longer question text to see how it wraps and if the layout holds up with more content. The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.`,
      options: [`Lasting Option ${i+1}`, `Temporary Option ${i+1}`, `Beautiful Option ${i+1}`, `Strong Option ${i+1}`],
      correctAnswer: `Temporary Option ${i+1}`,
      explanation: `Ephemeral means lasting for a very short time. So, temporary is the correct synonym. Question index ${i}`
    })),
  },
  {
    id: 'model-3',
    title: 'Model Exam 3: Quantitative Aptitude (Premium)',
    description: 'Challenging questions on quantitative aptitude.',
    questionCount: 2,
    durationMinutes: 1, // Shortened for testing
    isPremium: true,
    questions: [
        { id: 'q3_1', text: 'If a car travels at 60 km/h, how far will it travel in 2.5 hours?', options: ['120 km', '150 km', '180 km', '200 km'], correctAnswer: '150 km', explanation: 'Distance = Speed × Time. So, 60 km/h × 2.5 h = 150 km.' },
        { id: 'q3_2', text: 'What is 20% of 200?', options: ['20', '40', '60', '80'], correctAnswer: '40', explanation: '20% of 200 is (20/100) * 200 = 0.20 * 200 = 40.' },
    ]
  },
   {
    id: 'model-4',
    title: 'Model Exam 4: Logical Reasoning',
    description: 'Test your logical thinking and problem-solving abilities.',
    questionCount: 2,
    durationMinutes: 1, // Shortened for testing
    isPremium: false,
    questions: [
        { id: 'q4_1', text: 'Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?', options: ['(1/3)', '(1/8)', '(2/8)', '(1/16)'], correctAnswer: '(1/8)' },
        { id: 'q4_2', text: 'Statement: All birds lay eggs. Conclusion: Pigeons lay eggs because pigeons are birds. Is the conclusion valid?', options: ['Yes', 'No'], correctAnswer: 'Yes' },
    ]
  },
  {
    id: 'model-5',
    title: 'Model Exam 5: Specialized Subject (Premium)',
    description: 'An in-depth exam for a specialized subject, designed by experts.',
    questionCount: 2,
    durationMinutes: 1, // Shortened for testing
    isPremium: true,
    questions: [
      { id: 'q5_1', text: 'In computer science, what does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Central Program Unit', 'Control Processing Unit'], correctAnswer: 'Central Processing Unit' },
      { id: 'q5_2', text: 'What is the chemical symbol for water?', options: ['O2', 'H2O', 'CO2', 'NaCl'], correctAnswer: 'H2O' },
    ]
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

  const [exam, setExam] = useState<Exam | undefined>(undefined);
  
  useEffect(() => {
    const foundExam = mockExams.find(e => e.id === examId);
    setExam(foundExam);
  }, [examId]);

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
    if (exam && !examStarted) { 
      setTimeLeft(exam.durationMinutes * 60);
    }
  }, [exam, examStarted]);

  const handleSubmitExam = useCallback(() => {
    if (!exam) return;
    let correctAnswers = 0;
    exam.questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctAnswers++;
      }
    });

    const totalAnswered = Object.keys(userAnswers).length;
    const localUnansweredCount = exam.questions.length - totalAnswered;
    const localIncorrectCount = totalAnswered - correctAnswers;
    const percentageScore = exam.questions.length > 0 ? (correctAnswers / exam.questions.length) * 100 : 0;


    setScore(correctAnswers);
    setUnansweredCount(localUnansweredCount);
    setIncorrectCount(localIncorrectCount);

    setExamFinished(true);
    setExamStarted(false); 
    setShowSubmitConfirm(false);

    try {
      // Store detailed results for the current exam
      localStorage.setItem(`completedExam_${exam.id}`, JSON.stringify({ 
        exam, 
        userAnswers, 
        score: correctAnswers, 
        incorrectCount: localIncorrectCount, 
        unansweredCount: localUnansweredCount 
      }));

      // Store summary in exam history
      const newHistoryEntry: ExamHistoryEntry = {
        examId: exam.id,
        examTitle: exam.title,
        dateCompleted: new Date().toISOString(),
        score: correctAnswers,
        totalQuestions: exam.questions.length,
        percentageScore: parseFloat(percentageScore.toFixed(1)),
      };

      const existingHistoryString = localStorage.getItem('examHistory');
      let examHistory: ExamHistoryEntry[] = [];
      if (existingHistoryString) {
        try {
          examHistory = JSON.parse(existingHistoryString);
          if (!Array.isArray(examHistory)) examHistory = []; // Ensure it's an array
        } catch (e) {
          console.error("Error parsing existing exam history:", e);
          examHistory = [];
        }
      }
      
      examHistory.unshift(newHistoryEntry); // Add new entry to the beginning
      if (examHistory.length > MAX_EXAM_HISTORY_ITEMS) {
        examHistory = examHistory.slice(0, MAX_EXAM_HISTORY_ITEMS); // Keep only the most recent items
      }
      localStorage.setItem('examHistory', JSON.stringify(examHistory));

    } catch (error) {
      console.error("Error saving exam results or history to localStorage:", error);
    }

  }, [exam, userAnswers]);

  useEffect(() => {
    if (examStarted && !examFinished && timeLeft > 0) {
      const timerId = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timerId);
    } else if (examStarted && !examFinished && timeLeft === 0) {
      handleSubmitExam(); 
    }
  }, [examStarted, examFinished, timeLeft, handleSubmitExam]);

  const handleToggleConfused = (questionId: string) => {
    setConfusedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  if (!exam) {
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

  const currentQuestion = exam.questions[currentQuestionIndex];

  const handleStartExam = () => {
    setExamStarted(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setConfusedQuestions({});
    setTimeLeft(exam.durationMinutes * 60);
    setExamFinished(false);
    setScore(0);
    setUnansweredCount(0);
    setIncorrectCount(0);
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
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
              You have completed: {exam.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-muted/50 rounded-lg">
              <p className="text-xl text-muted-foreground">Your Score:</p>
              <p className="text-5xl font-bold text-primary">
                {score} <span className="text-3xl text-muted-foreground">/ {exam.questions.length}</span>
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
                onClick={() => router.push(`/dashboard/exams/${exam.id}/results`)}
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
                  <p className="font-semibold">{exam.questions.length} Questions</p>
                  <p className="text-xs text-muted-foreground">Total questions in this exam.</p>
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

            <Button size="lg" className="w-full font-semibold text-lg py-6" onClick={handleStartExam}>
              Start Exam Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/40 p-4 space-y-4">
      <Card className="w-full shadow-md">
        <CardHeader className="py-3">
          <CardTitle className="text-xl text-center font-semibold text-primary">ADDISSPARK Online Exam Center</CardTitle>
        </CardHeader>
      </Card>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Main Exam Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <Card className="w-full shadow-xl flex-1 flex flex-col">
            <CardHeader className="border-b pb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-foreground">{exam.title}</h2>
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
                {currentQuestion.options.map((option, index) => (
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
                {currentQuestionIndex < exam.questions.length - 1 ? (
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

        {/* Question Navigation Panel */}
        <aside className="w-80 border-l bg-background p-0 hidden md:flex md:flex-col max-h-[calc(100vh-8rem)]"> 
          <Card className="flex-1 flex flex-col overflow-hidden shadow-md">
              <CardHeader className="py-3 px-4 border-b">
                  <CardTitle className="text-lg text-center font-semibold text-foreground">Questions</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-3">
                  <div className="grid grid-cols-6 gap-1.5"> 
                  {exam.questions.map((q, index) => {
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
