
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Edit, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import type { User } from "@/lib/types"; // Assuming User type is defined elsewhere

// Mock user data for demonstration
const mockUsers: (User & { role: 'admin' | 'student' | 'instructor', lastLogin?: Date })[] = [
  { id: "usr1", name: "Abebe Kebede", email: "abebe@example.com", image: "https://placehold.co/100x100.png?text=AK", role: "admin", studentType: "university", lastLogin: new Date(2024, 6, 20) },
  { id: "usr2", name: "Fatuma Ali", email: "fatuma@example.com", image: "https://placehold.co/100x100.png?text=FA", role: "student", studentType: "high_school", lastLogin: new Date(2024, 6, 21) },
  { id: "usr3", name: "John Doe", email: "john.doe@example.com", image: "https://placehold.co/100x100.png?text=JD", role: "instructor", studentType: "college", lastLogin: new Date(2024, 6, 19) },
  { id: "usr4", name: "Jane Smith", email: "jane.smith@example.com", role: "student", studentType: "primary_school", lastLogin: new Date(2024, 6, 22) },
];

const getInitials = (name?: string | null) => {
  if (!name) return "U";
  const names = name.split(' ');
  if (names.length > 1) {
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

export default function ManageUsersPage() {
  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <ShieldCheck className="mr-2 h-4 w-4 text-primary" />;
    return <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />;
  };
  
  const getRoleVariant = (role: string) => {
    if (role === 'admin') return 'default';
    if (role === 'instructor') return 'secondary';
    return 'outline';
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Users</CardTitle>
        <CardDescription>
          Add, edit, or remove users and manage their roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Student Type</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.image || `https://avatar.vercel.sh/${user.email}.png`} alt={user.name || "User"} data-ai-hint="user avatar" />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={getRoleVariant(user.role)} className="capitalize">
                    {getRoleIcon(user.role)}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">
                  {user.studentType ? user.studentType.replace(/_/g, ' ') : 'N/A'}
                </TableCell>
                 <TableCell>
                  {user.lastLogin ? user.lastLogin.toLocaleDateString() : 'N/A'}
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
            {mockUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
