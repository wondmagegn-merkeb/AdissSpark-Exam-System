
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckSquare, Ban, RotateCcw, AlertCircle, Search, Calendar as CalendarIcon, CreditCard } from "lucide-react";
import { withAdminAuth } from '@/components/auth/withAdminAuth';
import type { User, Subscription } from "@/lib/types";
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';


type SubscriptionWithUser = Subscription & { user: User };

const mockUsers: User[] = [
  { id: "usr2", name: "Fatuma Ali", email: "fatuma@example.com", image: "https://placehold.co/100x100.png?text=FA" },
  { id: "usr4", name: "Jane Smith", email: "jane.smith@example.com" },
  { id: "usr5", name: "Carlos Rodriguez", email: "carlos@example.com", image: "https://placehold.co/100x100.png?text=CR" },
  { id: "usr6", name: "Aisha Ahmed", email: "aisha@example.com" },
  { id: "usr8", name: "Prof. Bekele Girma", email: "bekele.instructor@example.com", image: "https://placehold.co/100x100.png?text=BG" },
];

const mockSubscriptions: Subscription[] = [
  { id: "sub1", userId: "usr2", plan: "yearly", status: "active", startDate: new Date(2024, 0, 15), endDate: new Date(2025, 0, 15) },
  { id: "sub2", userId: "usr5", plan: "monthly", status: "active", startDate: new Date(2024, 6, 5), endDate: new Date(2024, 7, 5) },
  { id: "sub3", userId: "usr8", plan: "monthly", status: "canceled", startDate: new Date(2024, 5, 20), endDate: new Date(2024, 6, 20) },
];

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  return names.length > 1 ? (names[0][0] + names[names.length - 1][0]).toUpperCase() : name[0].toUpperCase();
};

const DAILY_RATE = 5; // 5 ETB per day

function ManageSubscriptionsPage() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 30),
  });

  const durationInDays = date?.from && date?.to ? differenceInCalendarDays(date.to, date.from) + 1 : 0;
  const calculatedCost = durationInDays * DAILY_RATE;

  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>(() => {
    return mockUsers.map(user => {
      const sub = mockSubscriptions.find(s => s.userId === user.id);
      return {
        ...(sub || { 
            id: `sub-none-${user.id}`, 
            userId: user.id, 
            plan: 'none', 
            status: 'inactive', 
            startDate: new Date(), 
            endDate: new Date() 
        }),
        user,
      };
    });
  });

  const handleToggleSubscription = (subId: string, currentStatus: Subscription['status']) => {
    setSubscriptions(prevSubs => prevSubs.map(sub => {
      if (sub.id === subId) {
        const newStatus = currentStatus === 'active' ? 'canceled' : 'active';
        return { ...sub, status: newStatus };
      }
      return sub;
    }));
  };

  const getStatusVariant = (status: Subscription['status']) => {
    if (status === 'active') return 'default';
    if (status === 'canceled') return 'destructive';
    return 'secondary';
  };

  const getStatusIcon = (status: Subscription['status']) => {
    if (status === 'active') return <CheckSquare className="mr-2 h-4 w-4" />;
    if (status === 'canceled') return <Ban className="mr-2 h-4 w-4" />;
    if (status === 'expired') return <RotateCcw className="mr-2 h-4 w-4" />;
    return <AlertCircle className="mr-2 h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
           <CardHeader>
             <div className="flex items-center gap-4">
               <CreditCard className="h-8 w-8 text-primary" />
               <div>
                  <CardTitle className="text-xl">Subscription Cost Calculator</CardTitle>
                  <CardDescription>Quickly calculate subscription cost for a given date range.</CardDescription>
               </div>
             </div>
           </CardHeader>
           <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[300px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <div className="text-center pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-dashed w-full sm:w-auto sm:pl-8">
                 <p className="text-sm text-muted-foreground">{durationInDays} days @ {DAILY_RATE} ETB/day</p>
                 <p className="text-4xl font-bold text-primary">{calculatedCost.toLocaleString()} ETB</p>
              </div>
           </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Manage User Subscriptions</CardTitle>
          <CardDescription>
            View and manage student and staff subscription plans.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-8"
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Subscription Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={sub.user.image || `https://avatar.vercel.sh/${sub.user.email}.png`} alt={sub.user.name || "User"} data-ai-hint="user avatar"/>
                        <AvatarFallback>{getInitials(sub.user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{sub.user.name || 'N/A'}</div>
                        <div className="text-xs text-muted-foreground">{sub.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">{sub.plan === 'none' ? 'No Plan' : sub.plan}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(sub.status)} className="capitalize">
                      {getStatusIcon(sub.status)}
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {sub.plan !== 'none' ? format(sub.endDate, 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.plan !== 'none' && (
                      <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm text-muted-foreground">{sub.status === 'active' ? 'Active' : 'Inactive'}</span>
                          <Switch
                              checked={sub.status === 'active'}
                              onCheckedChange={() => handleToggleSubscription(sub.id, sub.status)}
                              aria-label={`Toggle subscription for ${sub.user.name}`}
                          />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {subscriptions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No subscriptions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default withAdminAuth(ManageSubscriptionsPage);
