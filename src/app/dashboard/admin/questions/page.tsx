
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, ArrowUpDown, Search, HelpCircle } from "lucide-react";
import type { Question } from '@/lib/types';
import { ADMIN_GLOBAL_QUESTIONS_STORAGE_KEY } from '@/lib/constants';
import { useToast } from '@/hooks/use-toast';

const initialSeedQuestions: Question[] = [
  { id: "gq1", text: "What is the capital of Ethiopia?", option1: "Nairobi", option2: "Addis Ababa", option3: "Cairo", option4: "Lagos", correctAnswer: "Addis Ababa", explanation: "Addis Ababa is the capital and largest city of Ethiopia." },
  { id: "gq2", text: "Which river is the longest in the world?", option1: "Amazon", option2: "Nile", option3: "Yangtze", option4: "Mississippi", correctAnswer: "Nile", explanation: "The Nile River is traditionally considered the longest river in the world." },
  { id: "gq3", text: "Who painted the Mona Lisa?", option1: "Vincent van Gogh", option2: "Pablo Picasso", option3: "Leonardo da Vinci", option4: "Claude Monet", correctAnswer: "Leonardo da Vinci", explanation: "The Mona Lisa was painted by the Italian Renaissance artist Leonardo da Vinci." },
  { id: "gq4", text: "What is 2 + 2?", option1: "3", option2: "4", option3: "5", option4: "6", correctAnswer: "4", explanation: "Basic arithmetic." },
  { id: "gq5", text: "In which continent is Ethiopia located?", option1: "Asia", option2: "Europe", option3: "Africa", option4: "South America", correctAnswer: "Africa" },
  { id: "gq6", text: "What is the chemical symbol for water?", option1: "O2", option2: "CO2", option3: "H2O", option4: "NaCl", correctAnswer: "H2O"},
];

const ITEMS_PER_PAGE = 10;

export default function ManageGlobalQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Question | null; direction: 'ascending' | 'descending' }>({ key: 'text', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const { toast } = useToast();

  useEffect(() => {
    const loadQuestions = () => {
      const storedQuestions = localStorage.getItem(ADMIN_GLOBAL_QUESTIONS_STORAGE_KEY);
      if (storedQuestions) {
        try {
          const parsedQuestions = JSON.parse(storedQuestions);
          if (Array.isArray(parsedQuestions)) {
            setQuestions(parsedQuestions);
          } else {
            localStorage.setItem(ADMIN_GLOBAL_QUESTIONS_STORAGE_KEY, JSON.stringify(initialSeedQuestions));
            setQuestions(initialSeedQuestions);
          }
        } catch (error) {
          console.error("Error parsing global questions from localStorage:", error);
          localStorage.setItem(ADMIN_GLOBAL_QUESTIONS_STORAGE_KEY, JSON.stringify(initialSeedQuestions));
          setQuestions(initialSeedQuestions);
        }
      } else {
        localStorage.setItem(ADMIN_GLOBAL_QUESTIONS_STORAGE_KEY, JSON.stringify(initialSeedQuestions));
        setQuestions(initialSeedQuestions);
      }
    };
    loadQuestions();
    window.addEventListener('storage', loadQuestions);
    window.addEventListener('focus', loadQuestions);
    return () => {
      window.removeEventListener('storage', loadQuestions);
      window.removeEventListener('focus', loadQuestions);
    };
  }, []);

  const filteredQuestions = useMemo(() => {
    return questions.filter(q =>
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.option1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.option2.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.option3.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.option4.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.explanation && q.explanation.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [questions, searchTerm]);

  const sortedQuestions = useMemo(() => {
    let sortableItems = [...filteredQuestions];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Question] ?? '';
        const valB = b[sortConfig.key as keyof Question] ?? '';
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'ascending' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
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

  const handleDelete = (questionId: string) => {
    const updatedQuestions = questions.filter(q => q.id !== questionId);
    setQuestions(updatedQuestions);
    localStorage.setItem(ADMIN_GLOBAL_QUESTIONS_STORAGE_KEY, JSON.stringify(updatedQuestions));
    toast({ title: "Question Deleted", description: "The question has been removed from the global bank." });
    if (paginatedQuestions.length === 1 && currentPage > 1 && (sortedQuestions.length - 1) % ITEMS_PER_PAGE === 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderSortIcon = (columnKey: keyof Question) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center">
            <HelpCircle className="mr-3 h-6 w-6 text-primary" /> Manage Global Questions
        </CardTitle>
        <CardDescription>
          Add, edit, or delete questions for the entire platform. These questions can be linked to exams.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto sm:max-w-md">
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
            <Link href="/dashboard/admin/questions/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Question
            </Link>
          </Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead onClick={() => requestSort('text')} className="cursor-pointer group hover:bg-muted/50 min-w-[200px]">
                  <div className="flex items-center">Text {renderSortIcon('text')}</div>
                </TableHead>
                <TableHead>Opt 1</TableHead>
                <TableHead>Opt 2</TableHead>
                <TableHead>Opt 3</TableHead>
                <TableHead>Opt 4</TableHead>
                <TableHead onClick={() => requestSort('correctAnswer')} className="cursor-pointer group hover:bg-muted/50">
                  <div className="flex items-center">Correct Ans {renderSortIcon('correctAnswer')}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuestions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell className="text-xs text-muted-foreground">{q.id}</TableCell>
                  <TableCell className="font-medium max-w-xs truncate" title={q.text}>{q.text}</TableCell>
                  <TableCell className="max-w-[100px] truncate" title={q.option1}>{q.option1}</TableCell>
                  <TableCell className="max-w-[100px] truncate" title={q.option2}>{q.option2}</TableCell>
                  <TableCell className="max-w-[100px] truncate" title={q.option3}>{q.option3}</TableCell>
                  <TableCell className="max-w-[100px] truncate" title={q.option4}>{q.option4}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-green-600 font-semibold" title={q.correctAnswer}>{q.correctAnswer}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/admin/questions/edit/${q.id}`}>
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
                          <AlertDialogAction onClick={() => handleDelete(q.id)}>
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
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No questions found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
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
