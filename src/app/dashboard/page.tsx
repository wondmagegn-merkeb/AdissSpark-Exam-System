
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Edit3, UserCircle, Settings as SettingsIcon, LineChart as LineChartIcon, History, ExternalLink, Activity, CheckCircle, XCircle, Library, FileText as FileTextIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { ExamHistoryEntry, Resource } from '@/lib/types';
import {
  ChartContainer,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

const chartConfig = {
  score: {
    label: "Score (%)",
    color: "hsl(var(--primary))",
  },
};

const PASS_THRESHOLD_PERCENTAGE = 50;

// Mock data for latest resources - in a real app, this would be fetched
const mockLatestResources: Resource[] = [
    { id: 'res11', title: 'Advanced Software Engineering', type: 'book', description: 'Covers advanced topics in software engineering for CS students.', subjectOrCourse: 'Software Engineering', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'software engineering' },
    { id: 'res10', title: 'General Physics I Lectures', type: 'video', description: 'University-level physics lectures covering mechanics.', subjectOrCourse: 'Classical Mechanics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'physics lecture' },
    { id: 'res9', title: 'Microeconomics Principles', type: 'book', description: 'Core principles of microeconomics for university students.', subjectOrCourse: 'Microeconomics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'economics textbook' },
];

const getResourceTypeIcon = (type: Resource['type']) => {
  switch (type) {
    case 'note': return <FileTextIcon className="h-4 w-4 text-muted-foreground" />;
    case 'video': return <FileTextIcon className="h-4 w-4 text-muted-foreground" />; // Using same icon for consistency
    case 'book': return <BookOpen className="h-4 w-4 text-muted-foreground" />;
    default: return <FileTextIcon className="h-4 w-4 text-muted-foreground" />;
  }
};


export default function DashboardPage() {
  const [examHistory, setExamHistory] = useState<ExamHistoryEntry[]>([]);
  const [chartData, setChartData] = useState<Array<{ date: string; score: number }>>([]);
  const [totalExamsTaken, setTotalExamsTaken] = useState(0);
  const [examsPassed, setExamsPassed] = useState(0);
  const [examsFailed, setExamsFailed] = useState(0);

  useEffect(() => {
    const storedHistoryString = localStorage.getItem('examHistory');
    if (storedHistoryString) {
      try {
        const parsedHistory: ExamHistoryEntry[] = JSON.parse(storedHistoryString);
        if (Array.isArray(parsedHistory)) {
          setExamHistory(parsedHistory);
          
          const recentHistory = parsedHistory.slice(0, 5).reverse();
          const formattedChartData = recentHistory.map(entry => ({
            date: format(new Date(entry.dateCompleted), 'MMM d'),
            score: entry.percentageScore,
          }));
          setChartData(formattedChartData);

          setTotalExamsTaken(parsedHistory.length);
          let passedCount = 0;
          let failedCount = 0;
          parsedHistory.forEach(entry => {
            if (entry.percentageScore >= PASS_THRESHOLD_PERCENTAGE) {
              passedCount++;
            } else {
              failedCount++;
            }
          });
          setExamsPassed(passedCount);
          setExamsFailed(failedCount);

        }
      } catch (e) {
        console.error("Error parsing exam history from localStorage:", e);
      }
    }
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Welcome to your <span className="text-primary">ADDISSPARK</span> Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Here you can manage your learning, track progress, and access all features.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams Taken</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalExamsTaken}</div>
            <p className="text-xs text-muted-foreground">
              {totalExamsTaken > 0 ? 'Keep up the great work!' : 'Start taking exams to see your stats.'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examsPassed}</div>
             <p className="text-xs text-muted-foreground">
              {totalExamsTaken > 0 ? `Scored ${PASS_THRESHOLD_PERCENTAGE}% or higher` : 'Your passed exams will show here.'}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exams Failed</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{examsFailed}</div>
             <p className="text-xs text-muted-foreground">
              {totalExamsTaken > 0 ? `Scored below ${PASS_THRESHOLD_PERCENTAGE}%` : 'Your failed exams will show here.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="shadow-lg lg:col-span-3">
          <CardHeader>
            <div className="flex items-center gap-3">
                <LineChartIcon className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Recent Exam Performance</CardTitle>
            </div>
            <CardDescription>Your scores from the last few exams.</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 6)}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8} 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        borderColor: 'hsl(var(--border))',
                      }}
                    />
                    <Line
                      dataKey="score"
                      type="monotone"
                      stroke={chartConfig.score.color}
                      strokeWidth={2}
                      dot={{ fill: chartConfig.score.color }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <LineChartIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No exam performance data yet.</p>
                <p className="text-sm text-muted-foreground">Take an exam to see your progress here.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg lg:col-span-2">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Library className="h-8 w-8 text-primary" />
                        <CardTitle className="text-2xl">Latest Resources</CardTitle>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                        <Link href="/dashboard/resources">View All</Link>
                    </Button>
                </div>
                <CardDescription>Recently added study materials for you.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {mockLatestResources.map(resource => (
                        <div key={resource.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted/50">
                            <div className="p-3 bg-muted rounded-md">
                                {getResourceTypeIcon(resource.type)}
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-sm truncate">{resource.title}</p>
                                <p className="text-xs text-muted-foreground">{resource.subjectOrCourse}</p>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/dashboard/resources">
                                    View <ExternalLink className="ml-1.5 h-3 w-3" />
                                </Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <div className="flex items-center gap-3">
              <History className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl">Exam History</CardTitle>
          </div>
          <CardDescription>Review your past exam attempts.</CardDescription>
        </CardHeader>
        <CardContent>
          {examHistory.length > 0 ? (
            <>
            {/* Table for larger screens */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examHistory.map((entry) => (
                    <TableRow key={entry.examId + entry.dateCompleted}>
                      <TableCell className="font-medium truncate max-w-[200px] sm:max-w-xs">{entry.examTitle}</TableCell>
                      <TableCell>{format(new Date(entry.dateCompleted), 'PPp')}</TableCell>
                      <TableCell className="text-right">{`${entry.score}/${entry.totalQuestions} (${entry.percentageScore}%)`}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/exams/${entry.examId}/results`}>
                            View <ExternalLink className="ml-1.5 h-3 w-3" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {/* Cards for smaller screens */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {examHistory.map((entry) => (
                <Card key={entry.examId + entry.dateCompleted} className="p-4">
                  <div className="flex flex-col space-y-2">
                    <p className="font-medium">{entry.examTitle}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(entry.dateCompleted), 'PPp')}</p>
                    <p className="text-lg font-semibold">{`${entry.score}/${entry.totalQuestions} (${entry.percentageScore}%)`}</p>
                    <Button variant="outline" size="sm" asChild className="mt-2 w-full">
                        <Link href={`/dashboard/exams/${entry.examId}/results`}>
                          View Results <ExternalLink className="ml-1.5 h-3 w-3" />
                        </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[150px] text-center">
              <History className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No exam history found.</p>
              <p className="text-sm text-muted-foreground">Your completed exams will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Edit3 className="h-10 w-10 text-primary" />
              <CardTitle className="text-2xl">Practice Exams</CardTitle>
            </div>
            <CardDescription>
              Test your knowledge with realistic exam simulations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/exams">Browse All Exams</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
           <CardHeader>
            <div className="flex items-center gap-4">
              <UserCircle className="h-10 w-10 text-primary" />
              <CardTitle className="text-2xl">Profile & Settings</CardTitle>
            </div>
            <CardDescription>
              View your profile and manage account settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
                <Button asChild className="w-full">
                <Link href="/dashboard/profile">View Profile</Link>
                </Button>
                <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/settings">Go to Settings</Link>
                </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
