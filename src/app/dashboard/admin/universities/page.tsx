"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PlusCircle } from "lucide-react";

export default function ManageInstitutionsAndLevelsPage() {
  // Mock data for institutions and school levels
  const items = [
    { id: "uni1", name: "Addis Ababa University", type: "University", context: "Addis Ababa" },
    { id: "uni2", name: "Bahir Dar University", type: "University", context: "Bahir Dar" },
    { id: "col1", name: "Admas University College", type: "College", context: "Addis Ababa" },
    { id: "sl1", name: "Grade 10", type: "School Level", context: "High School" },
    { id: "sl2", name: "Grade 12", type: "School Level", context: "Preparatory" },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Institutions & School Levels</CardTitle>
        <CardDescription>
          Add, edit, or remove educational institutions (universities, colleges, schools) and general school grade levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location/Context</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.context}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">Edit</Button>
                  <Button variant="destructive" size="sm">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
             {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
