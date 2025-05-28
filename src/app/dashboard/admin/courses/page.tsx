
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, ArrowUpDown, Search } from "lucide-react";
import type { CourseOrSubjectEntry, StudentTypeFromRegistrationForm } from '@/lib/types';
import { ADMIN_COURSES_SUBJECTS_STORAGE_KEY } from '@/lib/constants';

const initialSeedCoursesSubjects: CourseOrSubjectEntry[] = [
  { id: "cs1", name: "Calculus I", educationalLevel: "University" },
  { id: "cs2", name: "Physics Grade 9", educationalLevel: "High School" },
  { id: "cs3", name: "Introduction to Programming", educationalLevel: "College" },
  { id: "cs4", name: "Amharic Grade 5", educationalLevel: "Primary School" },
  { id: "cs5", name: "Advanced Biology", educationalLevel: "Preparatory School" },
  { id: "cs6", "name": "General Chemistry", "educationalLevel": "Secondary School" },
];

const ITEMS_PER_PAGE = 5;

export default function ManageCoursesAndSubjectsPage() {
  const [items, setItems] = useState<CourseOrSubjectEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CourseOrSubjectEntry | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadItems = () => {
      const storedItems = localStorage.getItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY);
      if (storedItems) {
        try {
          const parsedItems = JSON.parse(storedItems);
          if (Array.isArray(parsedItems) && parsedItems.every(item => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.educationalLevel === 'string')) {
            setItems(parsedItems);
          } else {
            localStorage.setItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY, JSON.stringify(initialSeedCoursesSubjects));
            setItems(initialSeedCoursesSubjects);
          }
        } catch (error) {
          console.error("Error parsing courses/subjects from localStorage:", error);
          localStorage.setItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY, JSON.stringify(initialSeedCoursesSubjects));
          setItems(initialSeedCoursesSubjects);
        }
      } else {
        localStorage.setItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY, JSON.stringify(initialSeedCoursesSubjects));
        setItems(initialSeedCoursesSubjects);
      }
    };
    loadItems();
    window.addEventListener('storage', loadItems);
    window.addEventListener('focus', loadItems);
    return () => {
      window.removeEventListener('storage', loadItems);
      window.removeEventListener('focus', loadItems);
    };
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.educationalLevel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof CourseOrSubjectEntry) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleDelete = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    localStorage.setItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY, JSON.stringify(updatedItems));
    if (paginatedItems.length === 1 && currentPage > 1 && (sortedItems.length - 1) % ITEMS_PER_PAGE === 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const renderSortIcon = (columnKey: keyof CourseOrSubjectEntry) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-0" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Courses & Subjects</CardTitle>
        <CardDescription>
          Add, edit, or remove courses and subjects, associating them with specific educational levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search items..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/admin/courses/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Name (Course/Subject) {renderSortIcon('name')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('educationalLevel')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Educational Level {renderSortIcon('educationalLevel')}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.educationalLevel}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/courses/edit/${item.id}`}>
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
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the item:
                          <br /><strong>{item.name} (Level: {item.educationalLevel})</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No courses or subjects found matching your criteria.
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
