
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, UserRound, ArrowUpDown } from "lucide-react";
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
  const [sortConfig, setSortConfig] = useState<{ key: SortableStudentKeys | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);

  const sortedStudents = useMemo(() => {
    let sortableItems = [...mockStudents];
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
  }, [sortConfig]);
  
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
        <div className="mb-6">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Student
          </Button>
        </div>
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
                  No students found.
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

export default withAdminAuth(ManageStudentsPage);

    
