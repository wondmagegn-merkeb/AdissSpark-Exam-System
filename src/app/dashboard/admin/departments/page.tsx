"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

export default function ManageDepartmentsPage() {
  // Mock data for departments
  const items = [
    { id: "dept1", name: "Computer Science", type: "University Department", relatedTo: "Addis Ababa University" },
    { id: "dept2", name: "Marketing Management", type: "College Department", relatedTo: "Admas University College" },
    { id: "dept3", name: "Electrical Engineering", type: "University Department", relatedTo: "Bahir Dar University" },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage University/College Departments</CardTitle>
        <CardDescription>
          Add, edit, or remove university or college departments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Department
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Related Institution</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.relatedTo}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No departments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
