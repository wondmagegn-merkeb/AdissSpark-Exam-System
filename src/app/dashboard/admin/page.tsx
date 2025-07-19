
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { withAdminAuth } from "@/components/auth/withAdminAuth";
import { ArrowRight, UserCog, UserRound, Building, BookCopy, ListChecks, Edit as EditIconLucide, Library, Cpu, Archive, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

const adminFeatures = [
  { title: 'Manage Staff', href: '/dashboard/admin/users', icon: UserCog, description: "Add, edit, or remove administrators and instructors." },
  { title: 'Manage Students', href: '/dashboard/admin/students', icon: UserRound, description: "View and manage student user accounts." },
  { title: 'Manage Institutions', href: '/dashboard/admin/universities', icon: Building, description: "Control the list of schools and universities." },
  { title: 'Manage Depts & Grades', href: '/dashboard/admin/departments', icon: BookCopy, description: "Organize academic departments and grade levels." },
  { title: 'Manage Courses & Subjects', href: '/dashboard/admin/courses', icon: ListChecks, description: "Define courses and subjects for resources." },
  { title: 'Manage Exams', href: '/dashboard/admin/exams', icon: EditIconLucide, description: "Create, edit, and manage all practice exams." },
  { title: 'Manage Resources', href: '/dashboard/admin/resources', icon: Library, description: "Upload and organize study materials." },
  { title: 'Manage Agents', href: '/dashboard/admin/agents', icon: Cpu, description: "Configure and monitor AI agents." },
  { title: 'Manage Feedback', href: '/dashboard/admin/feedback', icon: Archive, description: "Review and respond to user feedback." },
];

function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome, {user?.name || 'Admin'}. Manage your platform from here.
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
