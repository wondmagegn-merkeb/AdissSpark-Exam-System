
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, ShieldCheck, UserCog } from "lucide-react";
import type { User } from "@/lib/types"; 

// Mock staff data (admins/instructors)
const mockStaff: (User & { role: 'admin' | 'instructor', lastLogin?: Date })[] = [
  { id: "usr1", name: "Abebe Kebede (Admin)", email: "abebe.admin@example.com", image: "https://placehold.co/100x100.png?text=AK", role: "admin", studentType: undefined, lastLogin: new Date(2024, 6, 20) },
  { id: "usr3", name: "Instructor John Doe", email: "john.instructor@example.com", image: "https://placehold.co/100x100.png?text=JD", role: "instructor", studentType: undefined, lastLogin: new Date(2024, 6, 19) },
  { id: "usr7", name: "Dr. Almaz Lemma (Admin)", email: "almaz.admin@example.com", image: "https://placehold.co/100x100.png?text=AL", role: "admin", studentType: undefined, lastLogin: new Date(2024, 5, 15) },
  { id: "usr8", name: "Prof. Bekele Girma (Instructor)", email: "bekele.instructor@example.com", image: "https://placehold.co/100x100.png?text=BG", role: "instructor", studentType: undefined, lastLogin: new Date(2024, 6, 1) },
];

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

export default function ManageStaffPage() { // Renamed component
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
              <TableHead>Staff Member</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockStaff.map((staff) => (
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
                  <Badge variant={getRoleVariant(staff.role)} className="capitalize">
                    {getRoleIcon(staff.role)}
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
            {mockStaff.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
