
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, ArrowUpDown, Search, Lock, BookOpen, Video, FileText as FileTextIcon } from "lucide-react";
import type { Resource } from '@/lib/types';
import { ADMIN_RESOURCES_STORAGE_KEY } from '@/lib/constants';
import { withAdminAuth } from '@/components/auth/withAdminAuth';

// Mock resource data to seed localStorage if empty
const initialSeedResources: Resource[] = [
  { id: 'res1', title: 'Algebra Fundamentals', type: 'note', description: 'Key concepts in basic algebra.', subjectOrCourse: 'Mathematics', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'algebra notes' },
  { id: 'res2', title: 'Introduction to Ethiopian History', type: 'video', description: 'Video series on Ethiopian history.', subjectOrCourse: 'History', isPremium: false, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'ethiopian history' },
  { id: 'res3', title: 'Calculus I Workbook (Premium)', type: 'book', description: 'Workbook for Calculus I.', subjectOrCourse: 'Calculus I', isPremium: true, imageUrl: 'https://placehold.co/600x400.png', contentUrl: '#', dataAiHint: 'calculus workbook' },
];

const ITEMS_PER_PAGE = 5;

function ManageAdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Resource | null; direction: 'ascending' | 'descending' }>({ key: 'title', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const loadResources = () => {
      const storedResources = localStorage.getItem(ADMIN_RESOURCES_STORAGE_KEY);
      if (storedResources) {
        try {
            const parsedResources = JSON.parse(storedResources);
            if (Array.isArray(parsedResources) && parsedResources.every(res => typeof res.id === 'string' && typeof res.title === 'string')) {
                setResources(parsedResources);
            } else {
                localStorage.setItem(ADMIN_RESOURCES_STORAGE_KEY, JSON.stringify(initialSeedResources));
                setResources(initialSeedResources);
            }
        } catch (error) {
            console.error("Error parsing resources from localStorage:", error);
            localStorage.setItem(ADMIN_RESOURCES_STORAGE_KEY, JSON.stringify(initialSeedResources));
            setResources(initialSeedResources);
        }
      } else {
        localStorage.setItem(ADMIN_RESOURCES_STORAGE_KEY, JSON.stringify(initialSeedResources));
        setResources(initialSeedResources);
      }
    };
    loadResources();
    window.addEventListener('storage', loadResources);
    window.addEventListener('focus', loadResources);
    return () => {
        window.removeEventListener('storage', loadResources);
        window.removeEventListener('focus', loadResources);
    };
  }, []);

  const filteredResources = useMemo(() => {
    return resources.filter(resource =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.subjectOrCourse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [resources, searchTerm]);

  const sortedResources = useMemo(() => {
    let sortableItems = [...filteredResources];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];
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
  }, [filteredResources, sortConfig]);

  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedResources.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedResources, currentPage]);

  const totalPages = Math.ceil(sortedResources.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof Resource) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };

  const handleDelete = (resourceId: string) => {
    const updatedResources = resources.filter(res => res.id !== resourceId);
    setResources(updatedResources);
    localStorage.setItem(ADMIN_RESOURCES_STORAGE_KEY, JSON.stringify(updatedResources));
    
    if (paginatedResources.length === 1 && currentPage > 1 && (sortedResources.length - 1) % ITEMS_PER_PAGE === 0) {
        setCurrentPage(currentPage - 1);
    }
  };

  const renderSortIcon = (columnKey: keyof Resource) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-0" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  const getResourceTypeIcon = (type: string) => {
    if (type === 'video') return <Video className="inline-block mr-1 h-4 w-4" />;
    if (type === 'book') return <BookOpen className="inline-block mr-1 h-4 w-4" />;
    return <FileTextIcon className="inline-block mr-1 h-4 w-4" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Resources</CardTitle>
        <CardDescription>
          Add, edit, or remove study resources like notes, videos, and books.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search resources..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/admin/resources/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Resource
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
              <TableHead onClick={() => requestSort('type')} className="cursor-pointer group hover:bg-muted/50">
                 <div className="flex items-center">Type {renderSortIcon('type')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('subjectOrCourse')} className="cursor-pointer group hover:bg-muted/50">
                 <div className="flex items-center">Subject/Course {renderSortIcon('subjectOrCourse')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('isPremium')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center"><Lock className="inline-block mr-1 h-4 w-4" />Premium {renderSortIcon('isPremium')}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedResources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell className="text-xs text-muted-foreground">{resource.id}</TableCell>
                <TableCell className="font-medium">{resource.title}</TableCell>
                <TableCell className="capitalize flex items-center">
                  {getResourceTypeIcon(resource.type)} {resource.type}
                </TableCell>
                <TableCell>{resource.subjectOrCourse}</TableCell>
                <TableCell>
                  <Badge variant={resource.isPremium ? "default" : "secondary"}>
                    {resource.isPremium ? "Yes" : "No"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                   <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/resources/edit/${resource.id}`}>
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
                          This action cannot be undone. This will permanently delete the resource:
                          <br /><strong>{resource.title}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(resource.id)}>
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {paginatedResources.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No resources found matching your criteria.
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

export default withAdminAuth(ManageAdminResourcesPage);
