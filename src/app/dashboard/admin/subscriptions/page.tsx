
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { CheckSquare, Ban, RotateCcw, AlertCircle, Search, Calendar as CalendarIcon, CreditCard, User, Tag, Percent, Save, ArrowUpDown } from "lucide-react";
import { withAdminAuth } from '@/components/auth/withAdminAuth';
import type { User as UserType, Subscription } from "@/lib/types"; // Renamed to avoid conflict
import { format, addDays, differenceInCalendarDays } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';


type SubscriptionWithUser = Subscription & { user: UserType };
type SortableSubscriptionKeys = keyof SubscriptionWithUser | 'userName';

const mockUsers: UserType[] = [
  { id: "usr2", name: "Fatuma Ali", email: "fatuma@example.com", image: "https://placehold.co/100x100.png?text=FA" },
  { id: "usr4", name: "Jane Smith", email: "jane.smith@example.com" },
  { id: "usr5", name: "Carlos Rodriguez", email: "carlos@example.com", image: "https://placehold.co/100x100.png?text=CR" },
  { id: "usr6", name: "Aisha Ahmed", email: "aisha@example.com" },
  { id: "usr8", name: "Prof. Bekele Girma", email: "bekele.instructor@example.com", image: "https://placehold.co/100x100.png?text=BG" },
];

const mockSubscriptions: Subscription[] = [
  { id: "sub1", userId: "usr2", plan: "Yearly", status: "active", startDate: new Date(2024, 0, 15), endDate: new Date(2025, 0, 15) },
  { id: "sub2", userId: "usr5", plan: "Monthly", status: "active", startDate: new Date(2024, 6, 5), endDate: new Date(2024, 7, 5) },
  { id: "sub3", userId: "usr8", plan: "Monthly", status: "canceled", startDate: new Date(2024, 5, 20), endDate: new Date(2024, 6, 20) },
];

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  return names.length > 1 ? (names[0][0] + names[names.length - 1][0]).toUpperCase() : name[0].toUpperCase();
};

function ManageSubscriptionsPage() {
  const { toast } = useToast();
  const [durationDays, setDurationDays] = useState<number>(30);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [dailyRate, setDailyRate] = useState<number>(5);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableSubscriptionKeys | null; direction: 'ascending' | 'descending' }>({ key: 'userName', direction: 'ascending' });

  const { finalPrice, discountAmount } = useMemo(() => {
    const days = isNaN(durationDays) || durationDays < 0 ? 0 : durationDays;
    const discount = isNaN(discountPercent) || discountPercent < 0 ? 0 : discountPercent > 100 ? 100 : discountPercent;
    const rate = isNaN(dailyRate) || dailyRate < 0 ? 0 : dailyRate;
    
    const original = days * rate;
    const discountAmt = (original * discount) / 100;
    const final = original - discountAmt;

    return {
      finalPrice: final,
      discountAmount: discountAmt,
    };
  }, [durationDays, discountPercent, dailyRate]);

  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>(() => {
    return mockUsers.map(user => {
      const sub = mockSubscriptions.find(s => s.userId === user.id);
      return {
        ...(sub || { 
            id: `sub-none-${user.id}`, 
            userId: user.id, 
            plan: 'None', 
            status: 'inactive', 
            startDate: new Date(), 
            endDate: new Date() 
        }),
        user,
      };
    });
  });
  
  const filteredSubscriptions = useMemo(() => {
      return subscriptions.filter(sub => 
        sub.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [subscriptions, searchTerm]);

  const sortedSubscriptions = useMemo(() => {
    let sortableItems = [...filteredSubscriptions];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let valA, valB;
        if (sortConfig.key === 'userName') {
            valA = a.user.name;
            valB = b.user.name;
        } else {
            valA = a[sortConfig.key as keyof Subscription];
            valB = b[sortConfig.key as keyof Subscription];
        }

        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        
        if (valA < valB) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredSubscriptions, sortConfig]);

  const requestSort = (key: SortableSubscriptionKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const renderSortIcon = (columnKey: SortableSubscriptionKeys) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-0" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  const handleApplySubscription = () => {
    if (!selectedUserId) {
      toast({ title: "No User Selected", description: "Please select a user from the table first.", variant: "destructive" });
      return;
    }
    if (durationDays <= 0) {
      toast({ title: "Invalid Duration", description: "Please enter a positive number of days.", variant: "destructive" });
      return;
    }
    if (dailyRate <= 0) {
      toast({ title: "Invalid Price", description: "Price per day must be a positive number.", variant: "destructive" });
      return;
    }

    setSubscriptions(prevSubs => prevSubs.map(sub => {
      if (sub.userId === selectedUserId) {
        const startDate = new Date();
        const endDate = addDays(startDate, durationDays);
        const planName = discountPercent > 15 ? 'Yearly Special' : `${durationDays}-Day Pass`;
        
        toast({
          title: "Subscription Updated!",
          description: `${sub.user.name}'s plan is now '${planName}', ending on ${format(endDate, 'PP')}.`,
        });

        return {
          ...sub,
          plan: planName,
          status: 'active',
          startDate,
          endDate,
        };
      }
      return sub;
    }));
    setSelectedUserId(null); // Deselect user after applying
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
                  <CardTitle className="text-xl">Create & Apply Subscription</CardTitle>
                  <CardDescription>Create a custom plan and apply it to a selected user below.</CardDescription>
               </div>
             </div>
           </CardHeader>
           <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
             <div className="space-y-2">
                <Label htmlFor="duration">Subscription Days</Label>
                <Input 
                    id="duration" 
                    type="number" 
                    value={durationDays}
                    onChange={(e) => setDurationDays(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g., 30"
                />
             </div>
              <div className="space-y-2">
                <Label htmlFor="dailyRate">Price Per Day (ETB)</Label>
                <Input 
                    id="dailyRate" 
                    type="number" 
                    value={dailyRate}
                    onChange={(e) => setDailyRate(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g., 5"
                />
             </div>
             <div className="space-y-2">
                <Label htmlFor="discount">Discount (%)</Label>
                <Input 
                    id="discount" 
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g., 20"
                />
             </div>
             <div className="text-center pt-4 sm:pt-0 border-t sm:border-t-0 sm:border-l border-dashed w-full sm:w-auto sm:pl-4">
                 <p className="text-sm text-muted-foreground">Final Price ({durationDays} days @ {dailyRate} ETB/day)</p>
                 <p className="text-4xl font-bold text-primary">{finalPrice.toLocaleString()} ETB</p>
                 {discountAmount > 0 && <p className="text-xs text-green-600">You saved {discountAmount.toLocaleString()} ETB!</p>}
              </div>
             <Button onClick={handleApplySubscription} disabled={!selectedUserId}>
                <Save className="mr-2 h-4 w-4" />
                Apply to Selected User
             </Button>
           </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Manage User Subscriptions</CardTitle>
          <CardDescription>
            {selectedUserId ? `Selected User: ${subscriptions.find(s => s.userId === selectedUserId)?.user.name}` : "Select a user from the table to apply a custom subscription."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or email..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => requestSort('userName')} className="cursor-pointer group hover:bg-muted/50">
                  <div className="flex items-center">User {renderSortIcon('userName')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('plan')} className="cursor-pointer group hover:bg-muted/50">
                   <div className="flex items-center">Subscription Plan {renderSortIcon('plan')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('status')} className="cursor-pointer group hover:bg-muted/50">
                   <div className="flex items-center">Status {renderSortIcon('status')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('endDate')} className="cursor-pointer group hover:bg-muted/50">
                   <div className="flex items-center">End Date {renderSortIcon('endDate')}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubscriptions.map((sub) => (
                <TableRow 
                  key={sub.id} 
                  onClick={() => setSelectedUserId(sub.userId)}
                  className={cn(
                    "cursor-pointer hover:bg-muted/50",
                    selectedUserId === sub.userId && "bg-primary/10 hover:bg-primary/20"
                  )}
                >
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
                    {sub.plan !== 'None' ? format(sub.endDate, 'PP') : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    {sub.plan !== 'None' && (
                      <div className="flex items-center justify-end space-x-2">
                          <span className="text-sm text-muted-foreground">{sub.status === 'active' ? 'Active' : 'Inactive'}</span>
                          <Switch
                              checked={sub.status === 'active'}
                              onClick={(e) => e.stopPropagation()} // Prevent row click
                              onCheckedChange={(checked) => {
                                setSubscriptions(prevSubs => prevSubs.map(s => s.id === sub.id ? { ...s, status: checked ? 'active' : 'canceled' } : s));
                              }}
                              aria-label={`Toggle subscription for ${sub.user.name}`}
                          />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {sortedSubscriptions.length === 0 && (
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
