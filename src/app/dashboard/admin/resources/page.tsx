
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, BookOpen, Video, FileText as FileTextIcon } from "lucide-react"; // Renamed FileText to FileTextIcon

export default function ManageResourcesPage() {
  // Mock data for resources
  const resources = [
    { id: "res1", title: "Algebra Fundamentals", type: "note", subject: "Mathematics", isPremium: false },
    { id: "res2", title: "Introduction to Ethiopian History", type: "video", subject: "History", isPremium: false },
    { id: "res3", title: "Calculus I Workbook", type: "book", subject: "Calculus I", isPremium: true },
  ];

  const getResourceTypeIcon = (type: string) => {
    if (type === 'video') return <Video className="inline-block mr-1 h-4 w-4" />;
    if (type === 'book') return <BookOpen className="inline-block mr-1 h-4 w-4" />;
    return <FileTextIcon className="inline-block mr-1 h-4 w-4" />; // Default to note icon
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
        <div className="mb-4">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Resource
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject/Course</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>{resource.id}</TableCell>
                <TableCell className="font-medium">{resource.title}</TableCell>
                <TableCell className="capitalize flex items-center">
                  {getResourceTypeIcon(resource.type)} {resource.type}
                </TableCell>
                <TableCell>{resource.subject}</TableCell>
                <TableCell>{resource.isPremium ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {resources.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No resources found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
