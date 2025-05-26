
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle, FileText, Clock } from "lucide-react";

export default function ManageExamsPage() {
  // Mock data for exams
  const exams = [
    { id: "exam1", title: "Model Exam 1: General Knowledge", questions: 50, duration: 60, isPremium: false },
    { id: "exam2", title: "Model Exam 3: Quantitative Aptitude", questions: 60, duration: 90, isPremium: true },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Exams</CardTitle>
        <CardDescription>
          Create, edit, or delete practice exams.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Exam
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead><FileText className="inline-block mr-1 h-4 w-4" />Questions</TableHead>
              <TableHead><Clock className="inline-block mr-1 h-4 w-4" />Duration (min)</TableHead>
              <TableHead>Premium</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {exams.map((exam) => (
              <TableRow key={exam.id}>
                <TableCell>{exam.id}</TableCell>
                <TableCell className="font-medium">{exam.title}</TableCell>
                <TableCell>{exam.questions}</TableCell>
                <TableCell>{exam.duration}</TableCell>
                <TableCell>{exam.isPremium ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
            {exams.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No exams found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
