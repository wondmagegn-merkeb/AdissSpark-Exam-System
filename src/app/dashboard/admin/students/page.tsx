
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PlusCircle, Edit, Trash2, UserRound, ArrowUpDown, Search } from "lucide-react";
import type { User, StudentTypeFromRegistrationFormKey } from "@/lib/types"; 
import { withAdminAuth } from "@/components/auth/withAdminAuth";

const mockStudents: (User & { role: 'student' })[] = [
  { id: "usr2", name: "Fatuma Ali", email: "fatuma@example.com", image: "https://placehold.co/100x100.png?text=FA", role: "student", studentType: "high_school", gradeLevel: "Grade 11" },
  { id: "usr4", name: "Jane Smith", email: "jane.smith@example.com", role: "student", studentType: "primary_school", gradeLevel: "Grade 5" },
  { id: "usr5", name: "Carlos Rodriguez", email: "carlos@example.com", image: "https://placehold.co/100x100.png?text=CR", role: "student", studentType: "university", department: "Computer Science", institutionName: "Addis Ababa University" },
  { id: "usr6", name: "Aisha Ahmed", email: "aisha@example.com", role: "student", studentType: "college", department: "Marketing", institutionName: "Unity College" },
  { id: "usr9", name: "Bereket T.", email: "bereket@example.com", role: "student", studentType: "preparatory_school", gradeLevel: "Grade 12" },
  { id: "usr10", name: "Sofia D.", email: "sofia@example.com", role: "student", studentType: "secondary_school", gradeLevel: "Grade 10" },
  { id: "usr11", name: "Michael B.", email: "michael@example.com", image: "https://placehold.co/100x100.png?text=MB", role: "student", studentType: "university", department: "Electrical Engineering", institutionName: "Bahir Dar University" },
  { id: "usr14", name: "Liya Getachew", email: "liya.g@example.com", role: "student", studentType: "university", department: "Medicine", institutionName: "Gondar University" },
  { id: "usr15", name: "Samuel Hailu", email: "samuel.h@example.com", image: "https://placehold.co/100x100.png?text=SH", role: "student", studentType: "college", department: "Accounting", institutionName: "Admas University" },
  { id: "usr16", name: "Hana Tesfaye", email: "hana.t@example.com", role: "student", studentType: "high_school", gradeLevel: "Grade 12" },
  { id: "usr17", name: "Yosef Lemma", email: "yosef.l@example.com", role: "student", studentType: "preparatory_school", gradeLevel: "Grade 11" },
];

type SortableStudentKeys = keyof User;
const ITEMS_PER_PAGE = 5;

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

const studentTypeToString = (studentType?: StudentTypeFromRegistrationFormKey | null) => {
  if (!studentType) return 'N/A';
  return studentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

function ManageStudentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableStudentKeys | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  
  const filteredStudents = useMemo(() => {
    return mockStudents.filter(student =>
      (student.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.institutionName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (student.gradeLevel?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const sortedStudents = useMemo(() => {
    let sortableItems = [...filteredStudents];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof typeof a];
        const valB = b[sortConfig.key as keyof typeof b];

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
  }, [filteredStudents, sortConfig]);
  
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedStudents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedStudents, currentPage]);

  const totalPages = Math.ceil(sortedStudents.length / ITEMS_PER_PAGE);

  const requestSort = (key: SortableStudentKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const renderSortIcon = (columnKey: SortableStudentKeys) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-0" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Students</CardTitle>
        <CardDescription>
          View, edit, or remove student accounts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search students..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
          </Button>
        </div>

        {/* Table for larger screens */}
        <div className="hidden md:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead onClick={() => requestSort('name')} className="cursor-pointer group hover:bg-muted/50">
                    <div className="flex items-center">Student {renderSortIcon('name')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('email')} className="cursor-pointer group hover:bg-muted/50">
                    <div className="flex items-center">Email {renderSortIcon('email')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('studentType')} className="cursor-pointer group hover:bg-muted/50">
                    <div className="flex items-center">Student Type {renderSortIcon('studentType')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('department')} className="cursor-pointer group hover:bg-muted/50">
                    <div className="flex items-center">Details (Dept/Grade) {renderSortIcon('department')}</div>
                </TableHead>
                <TableHead onClick={() => requestSort('institutionName')} className="cursor-pointer group hover:bg-muted/50">
                    <div className="flex items-center">Institution {renderSortIcon('institutionName')}</div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {paginatedStudents.map((student) => (
                <TableRow key={student.id}>
                    <TableCell>
                    <div className="flex items-center space-x-3">
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={student.image || `https://avatar.vercel.sh/${student.email}.png`} alt={student.name || "User"} data-ai-hint="user avatar"/>
                        <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{student.name || 'N/A'}</span>
                    </div>
                    </TableCell>
                    <TableCell>{student.email}</TableCell>
                    <TableCell>
                    <Badge variant="outline" className="capitalize">
                        <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
                        {studentTypeToString(student.studentType)}
                    </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                    {student.department || student.gradeLevel || 'N/A'}
                    </TableCell>
                    <TableCell>
                    {student.institutionName || 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="mr-2">
                        <Edit className="mr-1 h-3 w-3" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                    </Button>
                    </TableCell>
                </TableRow>
                ))}
                {paginatedStudents.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No students found matching your criteria.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>

        {/* Cards for smaller screens */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
            {paginatedStudents.map((student) => (
                <Card key={student.id} className="p-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={student.image || `https://avatar.vercel.sh/${student.email}.png`} alt={student.name || "User"} data-ai-hint="user avatar" />
                                <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{student.name || 'N/A'}</p>
                                <p className="text-sm text-muted-foreground">{student.email}</p>
                            </div>
                        </div>
                         <Badge variant="outline" className="capitalize shrink-0">
                            <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
                            {studentTypeToString(student.studentType)}
                        </Badge>
                    </div>
                    <div className="mt-4 pt-4 border-t text-sm text-muted-foreground space-y-1">
                        <p><strong>Institution:</strong> {student.institutionName || 'N/A'}</p>
                        <p className="capitalize"><strong>Details:</strong> {student.department || student.gradeLevel || 'N/A'}</p>
                    </div>
                    <div className="mt-4 flex justify-end gap-2">
                        <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm">
                            <Trash2 className="mr-1 h-3 w-3" /> Delete
                        </Button>
                    </div>
                </Card>
            ))}
             {paginatedStudents.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No students found matching your criteria.
              </p>
            )}
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
             <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
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

export default withAdminAuth(ManageStudentsPage);
