
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Archive, Eye, CheckCircle, MessageCircle, CircleDot, Filter } from "lucide-react";
import type { FeedbackEntry } from "@/lib/types"; 
import { formatDistanceToNow } from 'date-fns';

const mockFeedback: FeedbackEntry[] = [
  { id: "fb1", userId: "usr1", userName: "Abebe K.", userEmail: "abebe@example.com", subject: "Exam timer bug", message: "The timer on Model Exam 2 didn't stop correctly.", submittedAt: new Date(2024, 6, 20, 10, 30), status: "new" },
  { id: "fb2", userId: "usr2", userName: "Fatuma A.", userEmail: "fatuma@example.com", subject: "More resources for Physics", message: "Could you please add more video lectures for advanced Physics topics?", submittedAt: new Date(2024, 6, 21, 14, 0), status: "in_progress" },
  { id: "fb3", userId: "usr3", userName: "John D.", userEmail: "john@example.com", subject: "Typo in Resource RES003", message: "There's a small typo on page 5 of the Calculus I note.", submittedAt: new Date(2024, 6, 19, 9, 0), status: "resolved" },
  { id: "fb4", userId: "usr4", userName: "Jane S.", userEmail: "jane@example.com", subject: "Suggestion: Dark Mode", message: "The platform would be great with a dark mode option.", submittedAt: new Date(2024, 6, 22, 11, 15), status: "new" },
  { id: "fb5", userId: "usr1", userName: "Abebe K.", userEmail: "abebe@example.com", subject: "Old feedback", message: "This is an older feedback entry that has been archived.", submittedAt: new Date(2024, 3, 10), status: "archived" },
];

type FeedbackStatus = FeedbackEntry['status'];

export default function ManageFeedbackPage() {
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
  
  const filteredFeedback = mockFeedback.filter(fb => 
    filterStatus === 'all' || fb.status === filterStatus
  );

  const getStatusVariant = (status: FeedbackStatus) => {
    if (status === 'new') return 'default'; // Primary (Yellow in your theme)
    if (status === 'in_progress') return 'secondary'; // A lighter variant
    if (status === 'resolved') return 'outline'; // Perhaps green-ish if customized, or just outline
    if (status === 'archived') return 'outline'; // Grayed out
    return 'default';
  };
  
  const getStatusIcon = (status: FeedbackStatus) => {
    if (status === 'new') return <CircleDot className="mr-2 h-4 w-4 text-primary" />; // Yellow
    if (status === 'in_progress') return <MessageCircle className="mr-2 h-4 w-4 text-blue-500" />; // Blue
    if (status === 'resolved') return <CheckCircle className="mr-2 h-4 w-4 text-green-500" />; // Green
    if (status === 'archived') return <Archive className="mr-2 h-4 w-4 text-muted-foreground" />;
    return <CircleDot className="mr-2 h-4 w-4 text-primary" />;
  };


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
          <Archive className="mr-3 h-6 w-6 text-primary" /> Manage User Feedback
        </CardTitle>
        <CardDescription>
          Review, prioritize, and manage feedback submitted by users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex items-center gap-4">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FeedbackStatus | 'all')}>
                <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
            </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeedback.map((fb) => (
              <TableRow key={fb.id}>
                <TableCell>{fb.id}</TableCell>
                <TableCell className="font-medium">
                  <div>{fb.userName || 'N/A'}</div>
                  <div className="text-xs text-muted-foreground">{fb.userEmail}</div>
                </TableCell>
                <TableCell className="max-w-xs truncate">{fb.subject}</TableCell>
                <TableCell>
                  {formatDistanceToNow(fb.submittedAt, { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(fb.status)} className="capitalize">
                    {getStatusIcon(fb.status)}
                    {fb.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Eye className="mr-1 h-3 w-3" /> View
                  </Button>
                  {/* Add more actions like 'Mark as Resolved', 'Archive' based on status */}
                </TableCell>
              </TableRow>
            ))}
            {filteredFeedback.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No feedback entries match the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
