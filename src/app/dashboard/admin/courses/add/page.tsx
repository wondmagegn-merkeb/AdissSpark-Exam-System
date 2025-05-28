
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
import type { CourseOrSubjectEntry, StudentTypeFromRegistrationForm } from '@/lib/types';
import { ADMIN_COURSES_SUBJECTS_STORAGE_KEY, STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM } from '@/lib/constants';

const itemSchema = z.object({
  name: z.string().min(2, { message: "Course/Subject name must be at least 2 characters." }),
  educationalLevel: z.enum(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM, { required_error: "Please select an educational level." }),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function AddCourseOrSubjectPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      educationalLevel: undefined,
    },
  });

  const onSubmit = async (data: ItemFormValues) => {
    setIsLoading(true);
    try {
      const storedItems = localStorage.getItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY);
      let items: CourseOrSubjectEntry[] = storedItems ? JSON.parse(storedItems) : [];
      
      const newItem: CourseOrSubjectEntry = {
        id: `cs-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
      };
      items.push(newItem);
      localStorage.setItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY, JSON.stringify(items));

      toast({
        title: "Item Added",
        description: `${data.name} (Level: ${data.educationalLevel}) has been successfully added.`,
      });
      reset(); 
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
          <CardTitle className="text-2xl">Add New Course or Subject</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
        <CardDescription>
          Fill in the details for the new course or subject and associate it with an educational level.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Name (Course/Subject)</Label>
            <Input id="name" {...register("name")} disabled={isLoading} className="mt-1" placeholder="e.g., Calculus I or Physics Grade 9" />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="educationalLevel">Educational Level</Label>
            <Controller
              name="educationalLevel"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select educational level" />
                  </SelectTrigger>
                  <SelectContent>
                    {STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM.map(level => (
                       <SelectItem key={level} value={level}>{level}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.educationalLevel && <p className="text-sm text-destructive mt-1">{errors.educationalLevel.message}</p>}
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/courses')} disabled={isLoading}>
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
