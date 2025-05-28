
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/shared/Logo';
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import type { NavItem } from '@/lib/types';
import { LayoutDashboard, Library, FileText as FileTextIconLucide, Brain, User, Settings, LogOut, CreditCard, MessageSquare, Building, BookCopy, ListChecks, Edit as EditIconLucide, ShieldCheck, Users, MessageSquarePlus, Bot, Cpu, Archive, UserCog, UserRound } from 'lucide-react'; // Removed HelpCircle

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Resources', href: '/dashboard/resources', icon: Library },
  { title: 'Exams', href: '/dashboard/exams', icon: FileTextIconLucide },
  { title: 'AI Study Plan', href: '/dashboard/study-plan', icon: Brain, requiresSubscription: true },
  { title: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
  { title: 'Submit Feedback', href: '/dashboard/feedback', icon: MessageSquarePlus },
  { title: 'AI Agent', href: '/dashboard/agent', icon: Bot },
];

const userNavItems: NavItem[] = [
  { title: 'Profile', href: '/dashboard/profile', icon: User },
  { title: 'Settings', href: '/dashboard/settings', icon: Settings },
];

const adminNavItems: NavItem[] = [
  { title: 'Manage Staff', href: '/dashboard/admin/users', icon: UserCog }, 
  { title: 'Manage Students', href: '/dashboard/admin/students', icon: UserRound }, 
  { title: 'Manage Institutions', href: '/dashboard/admin/universities', icon: Building },
  { title: 'Manage Departments & Grades', href: '/dashboard/admin/departments', icon: BookCopy },
  { title: 'Manage Courses & Subjects', href: '/dashboard/admin/courses', icon: ListChecks },
  { title: 'Manage Exams', href: '/dashboard/admin/exams', icon: EditIconLucide },
  // { title: 'Manage Global Questions', href: '/dashboard/admin/questions', icon: HelpCircle }, // Removed global questions link
  { title: 'Manage Resources', href: '/dashboard/admin/resources', icon: Library },
  { title: 'Manage Agents', href: '/dashboard/admin/agents', icon: Cpu },
  { title: 'Manage Feedback', href: '/dashboard/admin/feedback', icon: Archive },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout, isSubscribed, toggleSubscription } = useAuth();

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {mainNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
                disabled={item.requiresSubscription && !isSubscribed}
              >
                <Link href={item.href}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                  {item.requiresSubscription && !isSubscribed && (
                     <span className="ml-auto text-xs text-primary">(Premium)</span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <SidebarSeparator />
        
        <SidebarMenu>
            <SidebarMenuItem>
                 <div className="px-2 py-1 text-xs font-semibold text-sidebar-foreground/70 flex items-center">
                    <ShieldCheck className="mr-2 h-4 w-4" />
                    Admin Panel
                </div>
            </SidebarMenuItem>
          {adminNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)} 
                tooltip={item.title}
              >
                <Link href={item.href}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <SidebarSeparator />


        {!isSubscribed && (
          <Card className="m-2 mt-4 bg-primary/10 border-primary/30">
            <CardHeader className="p-4">
              <CardTitle className="text-base text-primary-foreground">Unlock All Features</CardTitle>
              <CardDescription className="text-sm text-primary-foreground/80">
                Upgrade to premium to access AI Study Plans and more.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" asChild>
                <Link href="/dashboard/payment">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade to Premium
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
         {isSubscribed && (
          <Card className="m-2 mt-4 bg-green-500/10 border-green-500/30">
            <CardHeader className="p-4">
              <CardTitle className="text-base text-green-700 dark:text-green-300">Premium Active</CardTitle>
              <CardDescription className="text-sm text-green-600 dark:text-green-400">
                You have access to all premium features.
              </CardDescription>
            </CardHeader>
             <CardContent className="p-4 pt-0">
                <Button size="sm" variant="outline" className="w-full" onClick={toggleSubscription}>
                    Cancel Subscription
                </Button>
            </CardContent>
          </Card>
        )}


      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          {userNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={item.title}
              >
                <Link href={item.href}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Logout">
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}

// Re-adding Card components locally as they are used here.
const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-lg border shadow-sm ${className}`}
    {...props}
  />
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`flex flex-col space-y-1.5 ${className}`} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={`text-lg font-semibold leading-none tracking-tight ${className}`}
    {...props}
  />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={`text-sm ${className}`} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`${className}`} {...props} />
);
