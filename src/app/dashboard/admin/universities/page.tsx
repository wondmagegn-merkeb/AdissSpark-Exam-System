
"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { PlusCircle, Edit, Trash2, ArrowUpDown, Search } from "lucide-react";

// Updated type to match registration form options
export type InstitutionType = 
  | "Primary School" 
  | "Secondary School" 
  | "High School" 
  | "Preparatory School" 
  | "College" 
  | "University";

interface Institution {
  id: string;
  name: string;
  type: InstitutionType;
  context: string; // e.g., Location for University/College, Associated School Type for Grade Level
}

// Mock data - updated to reflect new types
const initialItems: Institution[] = [
  { id: "uni1", name: "Addis Ababa University", type: "University", context: "Addis Ababa" },
  { id: "uni2", name: "Bahir Dar University", type: "University", context: "Bahir Dar" },
  { id: "col1", name: "Admas University College", type: "College", context: "Addis Ababa" },
  { id: "sch1", name: "Generic High School Example", type: "High School", context: "National" },
  { id: "sch2", name: "Example Secondary School", type: "Secondary School", context: "Regional" },
  { id: "sch3", name: "Bright Future Preparatory", type: "Preparatory School", context: "City Level" },
  { id: "sch4", name: "Sunshine Primary", type: "Primary School", context: "Local" },
  { id: "uni3", name: "Mekelle University", type: "University", context: "Mekelle" },
  { id: "col2", name: "Unity University", type: "College", context: "Addis Ababa" },
];

const ITEMS_PER_PAGE = 5;

export default function ManageInstitutionsPage() {
  const [items, setItems] = useState<Institution[]>(initialItems);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Institution | null; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  useEffect(() => {
    // In a real app with a backend or global state, you might refetch or update items here.
  }, [router]);


  const filteredItems = useMemo(() => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type.toLowerCase().includes(searchTerm.toLowerCase())
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
    setCurrentPage(1);
  };

  const handleDelete = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
    if (paginatedItems.length === 1 && currentPage > 1 && (sortedItems.length -1) % ITEMS_PER_PAGE === 0) {
        setCurrentPage(currentPage - 1);
    }
  };

  const renderSortIcon = (columnKey: keyof Institution) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-30 group-hover:opacity-100" />;
    return sortConfig.direction === 'ascending' ? <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-0" /> : <ArrowUpDown className="ml-2 h-4 w-4 transform rotate-180" />;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">Manage Institutions</CardTitle>
        <CardDescription>
          Add, edit, or remove educational institutions (universities, colleges, schools of various levels).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-auto sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <Button asChild>
            <Link href="/dashboard/admin/universities/add">
              <PlusCircle className="mr-2 h-4 w-4" /> Add
            </Link>
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Name {renderSortIcon('name')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('type')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Type {renderSortIcon('type')}</div>
              </TableHead>
              <TableHead onClick={() => requestSort('context')} className="cursor-pointer group hover:bg-muted/50">
                <div className="flex items-center">Location/Context {renderSortIcon('context')}</div>
              </TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-xs text-muted-foreground">{item.id}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.context}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/admin/universities/edit/${item.id}`}>
                      <Edit className="mr-1 h-3 w-3" /> Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="mr-1 h-3 w-3" /> Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the item:
                          <br /><strong>{item.name} ({item.type})</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(item.id)}>
                          Yes, delete it
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
            {paginatedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No items found matching your criteria.
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
