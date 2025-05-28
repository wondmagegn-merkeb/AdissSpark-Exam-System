
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { CourseOrSubjectEntry, DepartmentOrGradeEntry, StudentTypeFromRegistrationForm } from '@/lib/types';
import { ADMIN_COURSES_SUBJECTS_STORAGE_KEY, STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM, DEPARTMENTS_GRADES_STORAGE_KEY } from '@/lib/constants';

const itemSchema = z.object({
  name: z.string().min(2, { message: "Course/Subject name must be at least 2 characters." }),
  educationalLevel: z.enum(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM, { required_error: "Please select an educational level." }),
  departmentOrGradeName: z.string().optional(),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export default function EditCourseOrSubjectPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const itemId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [itemNotFound, setItemNotFound] = useState(false);
  const [fetchedDeptGrades, setFetchedDeptGrades] = useState<string[]>([]);

  const { control, register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
  });

  const watchedEducationalLevel = watch("educationalLevel");

  useEffect(() => {
    if (itemId) {
      const storedItems = localStorage.getItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY);
      if (storedItems) {
        const items: CourseOrSubjectEntry[] = JSON.parse(storedItems);
        const itemToEdit = items.find(item => item.id === itemId);
        if (itemToEdit) {
          setValue('name', itemToEdit.name);
          setValue('educationalLevel', itemToEdit.educationalLevel);
          // The departmentOrGradeName will be set after fetching relevant options
          // based on the initial educationalLevel.
        } else {
          setItemNotFound(true);
          toast({
            title: "Error",
            description: "Course/Subject not found in storage.",
            variant: "destructive",
          });
        }
      } else {
        setItemNotFound(true);
         toast({
            title: "Error",
            description: "No course/subject data found in storage.",
            variant: "destructive",
          });
      }
    }
  }, [itemId, setValue, toast]);

  useEffect(() => {
    if (watchedEducationalLevel) {
      const storedDeptGrades = localStorage.getItem(DEPARTMENTS_GRADES_STORAGE_KEY);
      let relevantNames: string[] = [];
      if (storedDeptGrades) {
        const allDeptGrades: DepartmentOrGradeEntry[] = JSON.parse(storedDeptGrades);
        relevantNames = allDeptGrades
          .filter(item => item.type === watchedEducationalLevel)
          .map(item => item.name)
          .sort();
      }
      setFetchedDeptGrades(relevantNames);

      // If this is the initial load (or educationalLevel changed by user),
      // pre-select departmentOrGradeName if it's in the new list
      const storedItems = localStorage.getItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY);
      if (storedItems) {
          const items: CourseOrSubjectEntry[] = JSON.parse(storedItems);
          const itemToEdit = items.find(item => item.id === itemId);
          if (itemToEdit && itemToEdit.educationalLevel === watchedEducationalLevel) {
            if(itemToEdit.departmentOrGradeName && relevantNames.includes(itemToEdit.departmentOrGradeName)){
                 setValue('departmentOrGradeName', itemToEdit.departmentOrGradeName);
            } else {
                // If the previously saved department/grade is not in the new list, reset it
                setValue('departmentOrGradeName', undefined);
            }
          } else if (itemToEdit && itemToEdit.educationalLevel !== watchedEducationalLevel) {
             // If educational level was changed by user, reset department/grade
             setValue('departmentOrGradeName', undefined);
          }
      }

    } else {
      setFetchedDeptGrades([]);
      setValue('departmentOrGradeName', undefined);
    }
  }, [watchedEducationalLevel, setValue, itemId]);


  const onSubmit = async (data: ItemFormValues) => {
    setIsLoading(true);
    try {
      const storedItems = localStorage.getItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY);
      let items: CourseOrSubjectEntry[] = storedItems ? JSON.parse(storedItems) : [];
      
      const itemIndex = items.findIndex(item => item.id === itemId);
      if (itemIndex > -1) {
        items[itemIndex] = { 
            ...items[itemIndex], 
            ...data,
            departmentOrGradeName: data.departmentOrGradeName || undefined, 
        };
        localStorage.setItem(ADMIN_COURSES_SUBJECTS_STORAGE_KEY, JSON.stringify(items));
        toast({
          title: "Item Updated",
          description: `${data.name} (Level: ${data.educationalLevel}${data.departmentOrGradeName ? `, Dept/Grade: ${data.departmentOrGradeName}` : ''}) has been updated.`,
        });
        router.push('/dashboard/admin/courses');
      } else {
         toast({
          title: "Error",
          description: "Could not find item to update.",
          variant: "destructive",
        });
        setItemNotFound(true);
      }
    } catch (error) {
      console.error("Error updating item in localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to update item. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const getDeptGradeLabel = () => {
    if (!watchedEducationalLevel) return "Department / Grade";
    if (["University", "College"].includes(watchedEducationalLevel)) return "Department";
    return "Grade";
  };

  if (itemNotFound) {
    return (
      <Card className="shadow-lg max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" /> Item Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The course/subject you are trying to edit does not exist or could not be loaded.</p>
          <Button onClick={() => router.push('/dashboard/admin/courses')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader>
         <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Edit Course or Subject</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/courses')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
        <CardDescription>
          Modify the details for the course or subject.
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
                <Select 
                    onValueChange={(value) => {
                        field.onChange(value);
                        // When educationalLevel changes, the useEffect for watchedEducationalLevel will trigger
                        // to update fetchedDeptGrades and potentially reset departmentOrGradeName.
                    }} 
                    value={field.value} 
                    disabled={isLoading}
                >
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

          {watchedEducationalLevel && fetchedDeptGrades.length > 0 && (
            <div>
              <Label htmlFor="departmentOrGradeName">{getDeptGradeLabel()}</Label>
              <Controller
                name="departmentOrGradeName"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value} disabled={isLoading || fetchedDeptGrades.length === 0}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Select ${getDeptGradeLabel().toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {fetchedDeptGrades.map(name => (
                         <SelectItem key={name} value={name}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.departmentOrGradeName && <p className="text-sm text-destructive mt-1">{errors.departmentOrGradeName.message}</p>}
            </div>
          )}
          {watchedEducationalLevel && fetchedDeptGrades.length === 0 && (
             <p className="text-sm text-muted-foreground mt-1">
                No specific {getDeptGradeLabel().toLowerCase()}s found for {watchedEducationalLevel}. You can add them in 'Manage Departments & Grades'.
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-4">
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
