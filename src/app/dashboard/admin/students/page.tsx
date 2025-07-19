
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, UserRound } from "lucide-react";
import type { User, StudentTypeFromRegistrationFormKey } from "@/lib/types"; 
import { withAdminAuth } from "@/components/auth/withAdminAuth";

const mockStudents: (User & { role: 'student', lastLogin?: Date })[] = [
  { id: "usr2", name: "Fatuma Ali", email: "fatuma@example.com", image: "https://placehold.co/100x100.png?text=FA", role: "student", studentType: "high_school", lastLogin: new Date(2024, 6, 21) },
  { id: "usr4", name: "Jane Smith", email: "jane.smith@example.com", role: "student", studentType: "primary_school", gradeLevel: "Grade 5", lastLogin: new Date(2024, 6, 22) },
  { id: "usr5", name: "Carlos Rodriguez", email: "carlos@example.com", image: "https://placehold.co/100x100.png?text=CR", role: "student", studentType: "university", department: "Computer Science", institutionName: "Addis Ababa University", lastLogin: new Date(2024, 6, 23) },
  { id: "usr6", name: "Aisha Ahmed", email: "aisha@example.com", role: "student", studentType: "college", department: "Marketing", institutionName: "Unity College", lastLogin: new Date(2024, 6, 24) },
];

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
              <TableHead>Student</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Student Type</TableHead>
              <TableHead>Details (Dept/Grade)</TableHead>
              <TableHead>Institution</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStudents.map((student) => (
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
                 <TableCell>
                  {student.lastLogin ? student.lastLogin.toLocaleDateString() : 'N/A'}
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
            {mockStudents.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No students found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default withAdminAuth(ManageStudentsPage);
