
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, PlusCircle, Edit, Trash2, Search, ArrowUpDown, HelpCircle } from "lucide-react";
import type { Exam, Question } from '@/lib/types';
import { ADMIN_EXAMS_STORAGE_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const ITEMS_PER_PAGE = 5;

export default function ManageExamQuestionsPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const examId = params.examId as string;

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Question | null; direction: 'ascending' | 'descending' }>({ key: 'text', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (examId) {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      if (storedExams) {
        const exams: Exam[] = JSON.parse(storedExams);
        const currentExam = exams.find(e => e.id === examId);
        if (currentExam) {
          setExam(currentExam);
          setQuestions(currentExam.questions || []);
        }
      }
      setLoading(false);
    }
  }, [examId]);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q =>
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.options.some(opt => opt.toLowerCase().includes(searchTerm.toLowerCase())) ||
      q.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [questions, searchTerm]);

  const sortedQuestions = useMemo(() => {
    let sortableItems = [...filteredQuestions];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Question]; // Type assertion
        const valB = b[sortConfig.key as keyof Question]; // Type assertion
        
        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        // Add other type comparisons if needed
        return 0;
      });
    }
    return sortableItems;
  }, [filteredQuestions, sortConfig]);

  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedQuestions, currentPage]);

  const totalPages = Math.ceil(sortedQuestions.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof Question) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!exam) return;

    const updatedQuestions = questions.filter(q => q.id !== questionId);
    const updatedExam = { ...exam, questions: updatedQuestions, questionCount: updatedQuestions.length };
    
    const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
    let exams: Exam[] = storedExams ? JSON.parse(storedExams) : [];
    const examIndex = exams.findIndex(e => e.id === examId);

    if (examIndex > -1) {
      exams[examIndex] = updatedExam;
      localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(exams));
      setQuestions(updatedQuestions);
      setExam(updatedExam);
      toast({ title: "Question Deleted", description: "The question has been removed from this exam." });
      if (paginatedQuestions.length === 1 && currentPage > 1 && (sortedQuestions.length -1) % ITEMS_PER_PAGE === 0) {
        setCurrentPage(currentPage - 1);
    }
    } else {
      toast({ title: "Error", description: "Could not find exam to update.", variant: "destructive" });
    }
  };
  
  const renderSortIcon = (columnKey: keyof Question) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  if (loading) {
    return <div className="container mx-auto py-8 text-center">Loading exam questions...</div>;
  }

  if (!exam) {
    return (
      <Card className="max-w-lg mx-auto my-8 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive flex items-center">
            <HelpCircle className="mr-2 h-6 w-6" /> Exam Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The exam with ID "{examId}" could not be found. It might have been deleted or the ID is incorrect.
          </p>
          <Button onClick={() => router.push('/dashboard/admin/exams')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Exams List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg max-w-4xl mx-auto my-8">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-2xl">Manage Questions for: {exam.title}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/exams')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Exams List
            </Button>
        </div>
        <CardDescription>
          Add, edit, or remove questions for this specific exam. The exam currently has {exam.questionCount} questions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search questions..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button asChild>
            <Link href={`/dashboard/admin/exams/${examId}/questions/add`}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Question
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('text')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Question Text {renderSortIcon('text')}</div>
              </TableHead>
              <TableHead>Options</TableHead>
              <TableHead onClick={() => requestSort('correctAnswer')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Correct Answer {renderSortIcon('correctAnswer')}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedQuestions.map((q) => (
              <TableRow key={q.id}>
                <TableCell className="font-medium max-w-xs truncate">{q.text}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs truncate">{q.options.join(', ')}</TableCell>
                <TableCell>{q.correctAnswer}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/exams/${examId}/questions/edit/${q.id}`}>
                      <Edit className="mr-1 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the question:
                          <br /><strong className="truncate block max-w-full">{q.text}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteQuestion(q.id)}>
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {paginatedQuestions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No questions found for this exam or matching your criteria.
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

    