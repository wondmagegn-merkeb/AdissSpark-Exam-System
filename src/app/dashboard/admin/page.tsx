
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { withAdminAuth } from "@/components/auth/withAdminAuth";
import { ArrowRight, UserCog, UserRound, Building, BookCopy, ListChecks, Edit as EditIconLucide, Library, Archive, Users, CreditCard, FileText, CheckSquare, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const adminFeatures = [
  { title: 'Manage Staff', href: '/dashboard/admin/users', icon: UserCog, description: "Add, edit, or remove administrators and instructors." },
  { title: 'Manage Students', href: '/dashboard/admin/students', icon: UserRound, description: "View and manage student user accounts." },
  { title: 'Manage Subscriptions', href: '/dashboard/admin/subscriptions', icon: CheckSquare, description: "View and manage user subscription plans." },
  { title: 'Manage Institutions', href: '/dashboard/admin/universities', icon: Building, description: "Control the list of schools and universities." },
  { title: 'Manage Depts & Grades', href: '/dashboard/admin/departments', icon: BookCopy, description: "Organize academic departments and grade levels." },
  { title: 'Manage Courses & Subjects', href: '/dashboard/admin/courses', icon: ListChecks, description: "Define courses and subjects for resources." },
  { title: 'Manage Exams', href: '/dashboard/admin/exams', icon: EditIconLucide, description: "Create, edit, and manage all practice exams." },
  { title: 'Manage Resources', href: '/dashboard/admin/resources', icon: Library, description: "Upload and organize study materials." },
  { title: 'Manage Feedback', href: '/dashboard/admin/feedback', icon: Archive, description: "Review and respond to user feedback." },
];

const chartData = [
  { month: "January", users: 186 },
  { month: "February", users: 305 },
  { month: "March", users: 237 },
  { month: "April", users: 73 },
  { month: "May", users: 209 },
  { month: "June", users: 214 },
]

const chartConfig = {
  users: {
    label: "Users",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome, {user?.name || 'Admin'}. Here is a snapshot of your platform's activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">+180.1% from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+19 from last month</p>
          </CardContent>
        </Card>
        <Card className="shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Library className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250</div>
            <p className="text-xs text-muted-foreground">+52 from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="shadow-lg xl:col-span-2">
          <CardHeader>
            <CardTitle>User Overview</CardTitle>
            <CardDescription>New user registrations over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar dataKey="users" fill="var(--color-users)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              New users who have recently signed up.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8">
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://placehold.co/100x100.png?text=SO" alt="Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>SO</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Sofia Davis</p>
                <p className="text-sm text-muted-foreground">sofia.davis@email.com</p>
              </div>
              <div className="ml-auto font-medium">Student</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://placehold.co/100x100.png?text=JD" alt="Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Jackson Lee</p>
                <p className="text-sm text-muted-foreground">jackson.lee@email.com</p>
              </div>
              <div className="ml-auto font-medium">Student</div>
            </div>
             <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://placehold.co/100x100.png?text=AK" alt="Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>AK</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Abebe Kebede</p>
                <p className="text-sm text-muted-foreground">abebe.admin@example.com</p>
              </div>
              <div className="ml-auto font-medium text-primary">Admin</div>
            </div>
            <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://placehold.co/100x100.png?text=LM" alt="Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>LM</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Liam Martin</p>
                <p className="text-sm text-muted-foreground">liam.martin@email.com</p>
              </div>
              <div className="ml-auto font-medium">Student</div>
            </div>
             <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://placehold.co/100x100.png?text=OW" alt="Avatar" data-ai-hint="user avatar" />
                <AvatarFallback>OW</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Olivia Wilson</p>
                <p className="text-sm text-muted-foreground">olivia.wilson@email.com</p>
              </div>
              <div className="ml-auto font-medium">Student</div>
            </div>
          </CardContent>
        </Card>
      </div>

       <div className="text-left">
        <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Management & Tools
        </h2>
        <p className="mt-2 text-md text-muted-foreground">
          Access all administrative functions and utilities.
        </p>
      </div>

       <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {adminFeatures.map((feature) => (
          <Card key={feature.title} className="shadow-lg hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col">
            <CardHeader className="flex-row items-center gap-4 space-y-0">
              <div className="p-3 rounded-full bg-primary/10">
                 {feature.icon && <feature.icon className="h-8 w-8 text-primary" />}
              </div>
              <div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="line-clamp-2">{feature.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
              <Link href={feature.href} className="w-full">
                <div className="mt-4 flex items-center justify-end text-sm font-medium text-primary hover:underline">
                  Go to {feature.title.split(' ')[1]} <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default withAdminAuth(AdminDashboardPage);
