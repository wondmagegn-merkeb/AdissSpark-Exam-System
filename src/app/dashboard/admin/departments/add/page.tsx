
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { DepartmentOrGradeEntry, DepartmentOrGradeType } from '@/lib/types';
import { DEPARTMENTS_GRADES_STORAGE_KEY } from '@/lib/constants';

const ITEM_TYPES: DepartmentOrGradeType[] = ["Department", "School Grade"];

const itemSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(ITEM_TYPES, { required_error: "Please select a type." }),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function AddDepartmentOrGradePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      type: undefined,
    },
  });

  const onSubmit = async (data: ItemFormValues) => {
    setIsLoading(true);

    try {
      const storedItems = localStorage.getItem(DEPARTMENTS_GRADES_STORAGE_KEY);
      let items: DepartmentOrGradeEntry[] = storedItems ? JSON.parse(storedItems) : [];
      
      const newItem: DepartmentOrGradeEntry = {
        id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
      };
      items.push(newItem);
      localStorage.setItem(DEPARTMENTS_GRADES_STORAGE_KEY, JSON.stringify(items));

      toast({
        title: "Item Added",
        description: `${data.name} (${data.type}) has been successfully added.`,
      });
      reset(); 
      // router.push('/dashboard/admin/departments'); // Removed auto-redirect
    } catch (error) {
      console.error("Error saving item to localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Add New Department or Grade</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/departments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
        <CardDescription>
          Fill in the details for the new department or grade level. Click save when you're done.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} disabled={isLoading} className="mt-1" placeholder="e.g., Computer Science or Grade 9" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="type">Type</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEM_TYPES.map(type => (
                       <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/departments')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
