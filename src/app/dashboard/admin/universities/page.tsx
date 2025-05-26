
"use client";

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusCircle, Edit, Trash2, ArrowUpDown, Search } from "lucide-react";
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

type InstitutionType = "University" | "College" | "School" | "Grade Level";

interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  context: string; // e.g., Location for University/College, Associated School Type for Grade Level
}

const initialItems: Institution[] = [
  { id: "uni1", name: "Addis Ababa University", type: "University", context: "Addis Ababa" },
  { id: "uni2", name: "Bahir Dar University", type: "University", context: "Bahir Dar" },
  { id: "col1", name: "Admas University College", type: "College", context: "Addis Ababa" },
  { id: "sch1", name: "Generic High School Example", type: "School", context: "National" },
  { id: "grade1", name: "Grade 9", type: "Grade Level", context: "Secondary School" },
  { id: "grade2", name: "Grade 10", type: "Grade Level", context: "Secondary School" },
  { id: "grade3", name: "Grade 12", type: "Grade Level", context: "Preparatory School" },
];

const institutionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(["University", "College", "School", "Grade Level"], { required_error: "Please select a type." }),
  context: z.string().min(2, { message: "Context/Location must be at least 2 characters." }),
});

type InstitutionFormValues = z.infer<typeof institutionSchema>;

const ITEMS_PER_PAGE = 5;

export default function ManageInstitutionsAndLevelsPage() {
  const [items, setItems] = useState<Institution[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Institution | null; direction: 'ascending' | 'descending' }>({ key: null, direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, reset } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema),
    defaultValues: { name: '', type: undefined, context: '' }
  });

  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.context.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  const sortedItems = useMemo(() => {
    let sortableItems = [...filteredItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredItems, sortConfig]);

  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [sortedItems, currentPage]);

  const totalPages = Math.ceil(sortedItems.length / ITEMS_PER_PAGE);

  const requestSort = (key: keyof Institution) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const onSubmit = (data: InstitutionFormValues) => {
    const newItem: Institution = {
      id: `item_${Date.now()}`,
      ...data,
    };
    setItems(prevItems => [newItem, ...prevItems]);
    reset();
    setIsDialogOpen(false);
  };

  const renderSortArrow = (columnKey: keyof Institution) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'ascending' ? '🔼' : '🔽';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Institutions & Levels</CardTitle>
        <CardDescription>
          Add, edit, or remove educational institutions (universities, colleges, schools) or school levels.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by name or context..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new institution or level.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" {...register("name")} className="col-span-3" />
                  </div>
                  {errors.name && <p className="text-sm text-destructive col-start-2 col-span-3">{errors.name.message}</p>}
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="University">University</SelectItem>
                            <SelectItem value="College">College</SelectItem>
                            <SelectItem value="School">School</SelectItem>
                            <SelectItem value="Grade Level">Grade Level</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                   {errors.type && <p className="text-sm text-destructive col-start-2 col-span-3">{errors.type.message}</p>}

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="context" className="text-right">Context/Location</Label>
                    <Input id="context" {...register("context")} className="col-span-3" placeholder="e.g. Addis Ababa or Secondary School"/>
                  </div>
                   {errors.context && <p className="text-sm text-destructive col-start-2 col-span-3">{errors.context.message}</p>}
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Item</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:bg-muted/50">
                Name {renderSortArrow('name')}
              </TableHead>
              <TableHead onClick={() => requestSort('type')} className="cursor-pointer hover:bg-muted/50">
                Type {renderSortArrow('type')}
              </TableHead>
              <TableHead onClick={() => requestSort('context')} className="cursor-pointer hover:bg-muted/50">
                Location/Context {renderSortArrow('context')}
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.id}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.context}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" className="mr-2">
                    <Edit className="mr-1 h-3 w-3" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setItems(prev => prev.filter(i => i.id !== item.id))}>
                    <Trash2 className="mr-1 h-3 w-3" /> Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No items found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-4">
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
