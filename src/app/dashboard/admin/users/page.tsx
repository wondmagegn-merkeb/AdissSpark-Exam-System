
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, ShieldCheck, UserCog, ArrowUpDown } from "lucide-react";
import type { User } from "@/lib/types"; 
import { withAdminAuth } from "@/components/auth/withAdminAuth";

// Mock staff data (admins/instructors)
const mockStaff: (User & { role: 'admin' | 'instructor', lastLogin?: Date })[] = [
  { id: "usr1", name: "Abebe Kebede (Admin)", email: "abebe.admin@example.com", image: "https://placehold.co/100x100.png?text=AK", role: "admin", studentType: undefined, lastLogin: new Date(2024, 6, 20) },
  { id: "usr3", name: "Instructor John Doe", email: "john.instructor@example.com", image: "https://placehold.co/100x100.png?text=JD", role: "instructor", studentType: undefined, lastLogin: new Date(2024, 6, 19) },
  { id: "usr7", name: "Dr. Almaz Lemma (Admin)", email: "almaz.admin@example.com", image: "https://placehold.co/100x100.png?text=AL", role: "admin", studentType: undefined, lastLogin: new Date(2024, 5, 15) },
  { id: "usr8", name: "Prof. Bekele Girma (Instructor)", email: "bekele.instructor@example.com", image: "https://placehold.co/100x100.png?text=BG", role: "instructor", studentType: undefined, lastLogin: new Date(2024, 6, 1) },
  { id: "usr12", name: "Sara T. (Instructor)", email: "sara.t@example.com", role: "instructor", studentType: undefined, lastLogin: new Date(2024, 6, 25) },
  { id: "usr13", name: "Daniel M. (Admin)", email: "daniel.m@example.com", image: "https://placehold.co/100x100.png?text=DM", role: "admin", studentType: undefined, lastLogin: new Date(2024, 6, 26) },
  { id: "usr18", name: "Helen G. (Instructor)", email: "helen.g@example.com", role: "instructor", studentType: undefined, lastLogin: new Date(2024, 7, 2) },
  { id: "usr19", name: "Tewodros K. (Instructor)", email: "tewodros.k@example.com", image: "https://placehold.co/100x100.png?text=TK", role: "instructor", studentType: undefined, lastLogin: new Date(2024, 7, 3) },
  { id: "usr20", name: "Fikir A. (Admin)", email: "fikir.a@example.com", role: "admin", studentType: undefined, lastLogin: new Date(2024, 7, 4) },
  { id: "usr21", name: "Mekdes B. (Instructor)", email: "mekdes.b@example.com", image: "https://placehold.co/100x100.png?text=MB", role: "instructor", studentType: undefined, lastLogin: new Date(2024, 7, 5) },
];

type SortableStaffKeys = keyof (User & { lastLogin?: Date });
const ITEMS_PER_PAGE = 5;

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

function ManageStaffPage() {
  const [sortConfig, setSortConfig] = useState<{ key: SortableStaffKeys | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);

  const sortedStaff = useMemo(() => {
    let sortableItems = [...mockStaff];
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

  const paginatedStaff = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedStaff.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedStaff, currentPage]);

  const totalPages = Math.ceil(sortedStaff.length / ITEMS_PER_PAGE);

  const requestSort = (key: SortableStaffKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    setCurrentPage(1);
  };
  
  const renderSortIcon = (columnKey: SortableStaffKeys) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-0" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <ShieldCheck className="mr-2 h-4 w-4 text-primary" />;
    return <UserCog className="mr-2 h-4 w-4 text-muted-foreground" />; // Changed icon for instructor
  };
  
  const getRoleVariant = (role: string) => {
    if (role === 'admin') return 'default';
    if (role === 'instructor') return 'secondary';
    return 'outline';
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Staff</CardTitle>
        <CardDescription>
          Add, edit, or remove administrators and instructors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Staff Member
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Staff Member {renderSortIcon('name')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('email')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Email {renderSortIcon('email')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('role')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Role {renderSortIcon('role')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('lastLogin')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Last Login {renderSortIcon('lastLogin')}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedStaff.map((staff) => (
              <TableRow key={staff.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={staff.image || `https://avatar.vercel.sh/${staff.email}.png`} alt={staff.name || "User"} data-ai-hint="user avatar" />
                      <AvatarFallback>{getInitials(staff.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{staff.name || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>{staff.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(staff.role!)} className="capitalize">
                    {getRoleIcon(staff.role!)}
                    {staff.role}
                  </Badge>
                </TableCell>
                 <TableCell>
                  {staff.lastLogin ? staff.lastLogin.toLocaleDateString() : 'N/A'}
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
            {paginatedStaff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No staff members found.
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

export default withAdminAuth(ManageStaffPage);

    