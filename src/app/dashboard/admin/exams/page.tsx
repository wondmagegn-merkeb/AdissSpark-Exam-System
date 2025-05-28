
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, ArrowUpDown, Search, Lock, FileText as FileTextIcon, Clock, ListChecks } from "lucide-react";
import type { Exam } from '@/lib/types';
import { ADMIN_EXAMS_STORAGE_KEY } from '@/lib/constants';

// Mock exam data to seed localStorage if empty
const initialSeedExams: Exam[] = [
  {
    id: 'model-1',
    title: 'Model Exam 1: General Knowledge',
    description: 'A comprehensive test covering various general knowledge topics.',
    questionCount: 3,
    durationMinutes: 5,
    isPremium: false,
    questions: [
      { id: 'q1_1', text: 'What is the capital of Ethiopia?', options: ['Nairobi', 'Addis Ababa', 'Cairo', 'Lagos'], correctAnswer: 'Addis Ababa', explanation: 'Addis Ababa is the capital and largest city of Ethiopia.' },
      { id: 'q1_2', text: 'Which river is the longest in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], correctAnswer: 'Nile', explanation: 'The Nile River is traditionally considered the longest river in the world.' },
      { id: 'q1_3', text: 'Who painted the Mona Lisa?', options: ['Vincent van Gogh', 'Pablo Picasso', 'Leonardo da Vinci', 'Claude Monet'], correctAnswer: 'Leonardo da Vinci', explanation: 'The Mona Lisa was painted by the Italian Renaissance artist Leonardo da Vinci.' },
    ],
  },
  {
    id: 'model-2',
    title: 'Model Exam 2: Verbal Reasoning',
    description: 'Focuses on verbal reasoning, comprehension, and analytical skills.',
    questionCount: 2, // Adjusted for manageability in mock data
    durationMinutes: 10,
    isPremium: false,
    questions: [
      { id: 'q2_1', text: 'Synonym for "ephemeral"?', options: ['Lasting', 'Temporary', 'Beautiful', 'Strong'], correctAnswer: 'Temporary', explanation: 'Ephemeral means lasting for a short time.' },
      { id: 'q2_2', text: 'Antonym for "ubiquitous"?', options: ['Common', 'Everywhere', 'Rare', 'Popular'], correctAnswer: 'Rare', explanation: 'Ubiquitous means present everywhere.' }
    ],
  },
  {
    id: 'model-3',
    title: 'Model Exam 3: Quantitative Aptitude (Premium)',
    description: 'Challenging questions on quantitative aptitude.',
    questionCount: 2,
    durationMinutes: 30,
    isPremium: true,
    questions: [
        { id: 'q3_1', text: 'If a car travels at 60 km/h, how far will it travel in 2.5 hours?', options: ['120 km', '150 km', '180 km', '200 km'], correctAnswer: '150 km', explanation: 'Distance = Speed × Time. So, 60 km/h × 2.5 h = 150 km.' },
        { id: 'q3_2', text: 'What is 20% of 200?', options: ['20', '40', '60', '80'], correctAnswer: '40', explanation: '20% of 200 is (20/100) * 200 = 0.20 * 200 = 40.' },
    ]
  },
];

const ITEMS_PER_PAGE = 5;

export default function ManageAdminExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Exam | null; direction: 'ascending' | 'descending' }>({ key: 'title', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadExams = () => {
      const storedExams = localStorage.getItem(ADMIN_EXAMS_STORAGE_KEY);
      if (storedExams) {
        try {
          const parsedExams = JSON.parse(storedExams);
           if (Array.isArray(parsedExams) && parsedExams.every(exam => typeof exam.id === 'string' && typeof exam.title === 'string')) {
            setExams(parsedExams.map(exam => ({ ...exam, questions: exam.questions || [] }))); // Ensure questions array exists
          } else {
            localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(initialSeedExams.map(exam => ({ ...exam, questions: exam.questions || [] }))));
            setExams(initialSeedExams.map(exam => ({ ...exam, questions: exam.questions || [] })));
          }
        } catch (error) {
          console.error("Error parsing exams from localStorage:", error);
          localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(initialSeedExams.map(exam => ({ ...exam, questions: exam.questions || [] }))));
          setExams(initialSeedExams.map(exam => ({ ...exam, questions: exam.questions || [] })));
        }
      } else {
        localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(initialSeedExams.map(exam => ({ ...exam, questions: exam.questions || [] }))));
        setExams(initialSeedExams.map(exam => ({ ...exam, questions: exam.questions || [] })));
      }
    };
    loadExams();
    window.addEventListener('storage', loadExams);
    window.addEventListener('focus', loadExams);

    return () => {
      window.removeEventListener('storage', loadExams);
      window.removeEventListener('focus', loadExams);
    };
  }, []);

  const filteredExams = useMemo(() => {
    return exams.filter(exam =>
      exam.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [exams, searchTerm]);

  const sortedExams = useMemo(() => {
    let sortableItems = [...filteredExams];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];
        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
            return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'boolean' && typeof valB === 'boolean') {
            return sortConfig.direction === 'ascending' ? (valA === valB ? 0 : valA ? -1 : 1) : (valA === valB ? 0 : valA ? 1 : -1);
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredExams, sortConfig]);

  const paginatedExams = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedExams.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedExams, currentPage]);

  const totalPages = Math.ceil(sortedExams.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof Exam) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleDelete = (examId: string) => {
    const updatedExams = exams.filter(exam => exam.id !== examId);
    setExams(updatedExams);
    localStorage.setItem(ADMIN_EXAMS_STORAGE_KEY, JSON.stringify(updatedExams));
    
    if (paginatedExams.length === 1 && currentPage > 1 && (sortedExams.length - 1) % ITEMS_PER_PAGE === 0) {
        setCurrentPage(currentPage - 1);
    }
  };

  const renderSortIcon = (columnKey: keyof Exam) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-0" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Exams</CardTitle>
        <CardDescription>
          Add, edit, or delete practice exams available on the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search exams by title..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/admin/exams/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Exam
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead onClick={() => requestSort('title')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Title {renderSortIcon('title')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('questionCount')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center"><FileTextIcon className="inline-block mr-1 h-4 w-4" />Questions {renderSortIcon('questionCount')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('durationMinutes')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center"><Clock className="inline-block mr-1 h-4 w-4" />Duration (min) {renderSortIcon('durationMinutes')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('isPremium')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center"><Lock className="inline-block mr-1 h-4 w-4" />Premium {renderSortIcon('isPremium')}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedExams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell className="text-xs text-muted-foreground">{exam.id}</TableCell>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>{exam.questionCount}</TableCell>
                <TableCell>{exam.durationMinutes}</TableCell>
                <TableCell>
                  <Badge variant={exam.isPremium ? "default" : "secondary"}>
                    {exam.isPremium ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/exams/${exam.id}/questions`}>
                      <ListChecks className="mr-1 h-3 w-3" /> Questions
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/exams/edit/${exam.id}`}>
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
                          This action cannot be undone. This will permanently delete the exam:
                          <br /><strong>{exam.title}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(exam.id)}>
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {paginatedExams.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No exams found matching your criteria.
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

    