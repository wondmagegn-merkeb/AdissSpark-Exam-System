
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
import type { Institution, InstitutionType } from './../page'; // Import types from list page

const INSTITUTIONS_STORAGE_KEY = 'admin_institutions_list';

const INSTITUTION_TYPES_EDIT: InstitutionType[] = [
  "Primary School",
  "Secondary School",
  "High School",
  "Preparatory School",
  "College",
  "University"
];

const institutionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(INSTITUTION_TYPES_EDIT, { required_error: "Please select a type." }),
  context: z.string().min(2, { message: "Context/Location must be at least 2 characters." }),
});

type InstitutionFormValues = z.infer<typeof institutionSchema>;

export default function EditInstitutionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const itemId = params.id as string;

  const [isLoading, setIsLoading] = useState(false);
  const [itemNotFound, setItemNotFound] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, reset, setValue } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema),
  });

  useEffect(() => {
    if (itemId) {
      const storedItems = localStorage.getItem(INSTITUTIONS_STORAGE_KEY);
      if (storedItems) {
        const institutions: Institution[] = JSON.parse(storedItems);
        const itemToEdit = institutions.find(item => item.id === itemId);
        if (itemToEdit) {
          setValue('name', itemToEdit.name);
          setValue('type', itemToEdit.type);
          setValue('context', itemToEdit.context);
        } else {
          setItemNotFound(true);
          toast({
            title: "Error",
            description: "Institution not found in storage.",
            variant: "destructive",
          });
        }
      } else {
        setItemNotFound(true); // Or handle as no data available yet
         toast({
            title: "Error",
            description: "No institution data found in storage.",
            variant: "destructive",
          });
      }
    }
  }, [itemId, setValue, toast]);

  const onSubmit = async (data: InstitutionFormValues) => {
    setIsLoading(true);
    try {
      const storedItems = localStorage.getItem(INSTITUTIONS_STORAGE_KEY);
      let institutions: Institution[] = storedItems ? JSON.parse(storedItems) : [];
      
      const itemIndex = institutions.findIndex(item => item.id === itemId);
      if (itemIndex > -1) {
        institutions[itemIndex] = { ...institutions[itemIndex], ...data };
        localStorage.setItem(INSTITUTIONS_STORAGE_KEY, JSON.stringify(institutions));
        toast({
          title: "Institution Updated",
          description: `${data.name} (${data.type}) has been updated.`,
        });
        router.push('/dashboard/admin/universities');
      } else {
         toast({
          title: "Error",
          description: "Could not find institution to update.",
          variant: "destructive",
        });
        setItemNotFound(true);
      }
    } catch (error) {
      console.error("Error updating institution in localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to update institution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (itemNotFound) {
    return (
      <Card className="shadow-lg max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-6 w-6" /> Institution Not Found
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">The institution you are trying to edit does not exist or could not be loaded.</p>
          <Button onClick={() => router.push('/dashboard/admin/universities')} className="mt-4">
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
          <CardTitle className="text-2xl">Edit Institution</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/universities')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
        <CardDescription>
          Modify the details for the institution. Click save when you're done.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} disabled={isLoading} className="mt-1" />
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
                    <SelectValue placeholder="Select institution type" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_TYPES_EDIT.map(type => (
                       <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="context">Context/Location</Label>
            <Input id="context" {...register("context")} placeholder="e.g. Addis Ababa or National" disabled={isLoading} className="mt-1" />
            {errors.context && <p className="text-sm text-destructive mt-1">{errors.context.message}</p>}
          </div>

          <div className="flex justify-end space-x-3">
             <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/universities')} disabled={isLoading}>
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

    