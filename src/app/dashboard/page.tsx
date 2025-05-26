
"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Edit3, Brain, UserCircle, Settings as SettingsIcon, LineChart as LineChartIcon, History, ExternalLink, Activity, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { ExamHistoryEntry } from '@/lib/types';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from 'recharts';

const chartConfig = {
  score: {
    label: "Score (%)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

const PASS_THRESHOLD_PERCENTAGE = 50;

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
          
          // Prepare data for chart - use last 5 entries, formatted
          const recentHistory = parsedHistory.slice(0, 5).reverse(); // Oldest first for chart
          const formattedChartData = recentHistory.map(entry => ({
            date: format(new Date(entry.dateCompleted), 'MMM d'),
            score: entry.percentageScore,
          }));
          setChartData(formattedChartData);

          // Calculate summary statistics
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

      {/* Summary Statistics Row */}
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


      {/* Progress Graph and Exam History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
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
                    margin={{
                      top: 5,
                      right: 10,
                      left: -20, // Adjust to show Y-axis labels
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 6)} // Shorten date display
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tickMargin={8} 
                      domain={[0, 100]}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" nameKey="score" />}
                    />
                    <Legend />
                    <Line
                      dataKey="score"
                      type="monotone"
                      stroke={chartConfig.score.color}
                      strokeWidth={2}
                      dot={{
                        fill: chartConfig.score.color,
                      }}
                      activeDot={{
                        r: 6,
                      }}
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
            ) : (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <History className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No exam history found.</p>
                <p className="text-sm text-muted-foreground">Your completed exams will appear here.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Existing Dashboard Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <BookOpen className="h-10 w-10 text-primary" />
              <CardTitle className="text-2xl">Study Resources</CardTitle>
            </div>
            <CardDescription>
              Access curated notes, video lectures, and other materials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Study Resources" 
              width={600} 
              height={400} 
              className="rounded-md mb-4"
              data-ai-hint="books library" 
            />
            <Button asChild className="w-full">
              <Link href="/dashboard/resources">Explore Resources</Link>
            </Button>
          </CardContent>
        </Card>

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
             <Image 
              src="https://placehold.co/600x400.png" 
              alt="Practice Exams" 
              width={600} 
              height={400} 
              className="rounded-md mb-4"
              data-ai-hint="test exam"
            />
            <Button asChild className="w-full">
              <Link href="/dashboard/exams">Take an Exam</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Brain className="h-10 w-10 text-primary" />
              <CardTitle className="text-2xl">AI Study Plan</CardTitle>
            </div>
            <CardDescription>
              Get a personalized study plan generated by AI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="AI Study Plan" 
              width={600} 
              height={400} 
              className="rounded-md mb-4"
              data-ai-hint="ai schedule"
            />
            <Button asChild className="w-full">
              <Link href="/dashboard/study-plan">Generate Plan</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-1 lg:col-span-1">
           <CardHeader>
            <div className="flex items-center gap-4">
              <UserCircle className="h-10 w-10 text-primary" />
              <CardTitle className="text-2xl">Profile</CardTitle>
            </div>
            <CardDescription>
              View and manage your account details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Profile" 
              width={600} 
              height={400} 
              className="rounded-md mb-4"
              data-ai-hint="user avatar"
            />
            <Button asChild className="w-full">
              <Link href="/dashboard/profile">View Profile</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-1 lg:col-span-2">
           <CardHeader>
            <div className="flex items-center gap-4">
              <SettingsIcon className="h-10 w-10 text-primary" />
              <CardTitle className="text-2xl">Settings</CardTitle>
            </div>
            <CardDescription>
              Configure your application preferences and settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Settings" 
              width={600} 
              height={400} 
              className="rounded-md mb-4"
              data-ai-hint="gears settings"
            />
            <Button asChild className="w-full">
              <Link href="/dashboard/settings">Go to Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    