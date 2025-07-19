
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Archive, Eye, CheckCircle, MessageCircle, CircleDot, Filter, ArrowUpDown, Search } from "lucide-react";
import type { FeedbackEntry } from "@/lib/types"; 
import { formatDistanceToNow } from 'date-fns';
import { withAdminAuth } from '@/components/auth/withAdminAuth';

const mockFeedback: FeedbackEntry[] = [
  { id: "fb1", userId: "usr1", userName: "Abebe K.", userEmail: "abebe@example.com", subject: "Exam timer bug", message: "The timer on Model Exam 2 didn't stop correctly.", submittedAt: new Date(2024, 6, 20, 10, 30), status: "new" },
  { id: "fb2", userId: "usr2", userName: "Fatuma A.", userEmail: "fatuma@example.com", subject: "More resources for Physics", message: "Could you please add more video lectures for advanced Physics topics?", submittedAt: new Date(2024, 6, 21, 14, 0), status: "in_progress" },
  { id: "fb3", userId: "usr3", userName: "John D.", userEmail: "john@example.com", subject: "Typo in Resource RES003", message: "There's a small typo on page 5 of the Calculus I note.", submittedAt: new Date(2024, 6, 19, 9, 0), status: "resolved" },
  { id: "fb4", userId: "usr4", userName: "Jane S.", userEmail: "jane@example.com", subject: "Suggestion: Dark Mode", message: "The platform would be great with a dark mode option.", submittedAt: new Date(2024, 6, 22, 11, 15), status: "new" },
  { id: "fb5", userId: "usr1", userName: "Abebe K.", userEmail: "abebe@example.com", subject: "Old feedback", message: "This is an older feedback entry that has been archived.", submittedAt: new Date(2024, 3, 10), status: "archived" },
  { id: "fb6", userId: "usr5", userName: "Carlos R.", userEmail: "carlos@example.com", subject: "Login Issue", message: "I was unable to log in this morning.", submittedAt: new Date(2024, 6, 23, 8, 0), status: "new" },
  { id: "fb7", userId: "usr6", userName: "Aisha A.", userEmail: "aisha@example.com", subject: "Payment Question", message: "Do you accept Telebirr for payments?", submittedAt: new Date(2024, 6, 23, 12, 45), status: "in_progress" },
  { id: "fb8", userId: "usr2", userName: "Fatuma A.", userEmail: "fatuma@example.com", subject: "Positive Feedback", message: "The new resources are fantastic! Thank you!", submittedAt: new Date(2024, 6, 23, 15, 20), status: "resolved" },

];

type FeedbackStatus = FeedbackEntry['status'];
type SortableFeedbackKeys = keyof FeedbackEntry;
const ITEMS_PER_PAGE = 5;

function ManageFeedbackPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FeedbackStatus | 'all'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortableFeedbackKeys | null; direction: 'ascending' | 'descending' }>({ key: 'submittedAt', direction: 'descending' });
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredFeedback = useMemo(() => {
    return mockFeedback.filter(fb => {
      const statusMatch = filterStatus === 'all' || fb.status === filterStatus;
      const searchMatch = searchTerm === '' ||
        fb.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fb.message.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [filterStatus, searchTerm]);

  const sortedFeedback = useMemo(() => {
    let sortableItems = [...filteredFeedback];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (valA! < valB!) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (valA! > valB!) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredFeedback, sortConfig]);

  const paginatedFeedback = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedFeedback.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedFeedback, currentPage]);

  const totalPages = Math.ceil(sortedFeedback.length / ITEMS_PER_PAGE);


  const requestSort = (key: SortableFeedbackKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const renderSortIcon = (columnKey: SortableFeedbackKeys) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-0" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

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
        <div className="mb-6 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search feedback..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={(value) => { setFilterStatus(value as FeedbackStatus | 'all'); setCurrentPage(1); }}>
                  <SelectTrigger className="w-full sm:w-[200px]">
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
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('id')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">ID {renderSortIcon('id')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('userName')} className="cursor-pointer group hover:bg-muted/50">
                 <div className="flex items-center">User {renderSortIcon('userName')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('subject')} className="cursor-pointer group hover:bg-muted/50">
                 <div className="flex items-center">Subject {renderSortIcon('subject')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('submittedAt')} className="cursor-pointer group hover:bg-muted/50">
                 <div className="flex items-center">Submitted {renderSortIcon('submittedAt')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('status')} className="cursor-pointer group hover:bg-muted/50">
                 <div className="flex items-center">Status {renderSortIcon('status')}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedFeedback.map((fb) => (
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
            {paginatedFeedback.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No feedback entries match the current filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
              <Button
                key={pageNumber}
                variant={currentPage === pageNumber ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(pageNumber)}
              >
                {pageNumber}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default withAdminAuth(ManageFeedbackPage);
