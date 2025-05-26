
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

// Mock data - in a real app, this would come from a database or global state
// This data should be consistent with the main list page's mock data for editing to make sense.
const initialItems = [
  { id: "uni1", name: "Addis Ababa University", type: "University", context: "Addis Ababa" },
  { id: "uni2", name: "Bahir Dar University", type: "University", context: "Bahir Dar" },
  { id: "col1", name: "Admas University College", type: "College", context: "Addis Ababa" },
  { id: "sch1", name: "Generic High School Example", type: "School", context: "National" },
  { id: "grade1", name: "Grade 9", type: "Grade Level", context: "Secondary School" },
  { id: "grade2", name: "Grade 10", type: "Grade Level", context: "Secondary School" },
  { id: "grade3", name: "Grade 12", type: "Grade Level", context: "Preparatory School" },
  { id: "uni3", name: "Mekelle University", type: "University", context: "Mekelle" },
  { id: "col2", name: "Unity University", type: "College", context: "Addis Ababa" },
  { id: "sch2", name: "ABC Primary School", type: "School", context: "Regional" },
  { id: "grade4", name: "Grade 1", type: "Grade Level", context: "Primary School" },
  { id: "grade5", name: "Grade 11", type: "Grade Level", context: "Preparatory School" },
] as const; // Use 'as const' to infer literal types for 'type' if needed elsewhere, though Zod enum handles it.

type InstitutionType = typeof initialItems[number]['type'];

const institutionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(["University", "College", "School", "Grade Level"], { required_error: "Please select a type." }),
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
      const itemToEdit = initialItems.find(item => item.id === itemId);
      if (itemToEdit) {
        setValue('name', itemToEdit.name);
        setValue('type', itemToEdit.type as InstitutionType); // Cast if necessary for Zod enum
        setValue('context', itemToEdit.context);
      } else {
        setItemNotFound(true);
        toast({
          title: "Error",
          description: "Institution/Level not found.",
          variant: "destructive",
        });
      }
    }
  }, [itemId, setValue, toast]);

  const onSubmit = async (data: InstitutionFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("Updated Institution/Level Data (ID: " + itemId + "):", data);
    // In a real app, you would send this data to your backend.
    // The list on the main page won't update automatically without global state/backend.

    toast({
      title: "Item Updated (Simulated)",
      description: `${data.name} (${data.type}) has been updated.`,
    });
    setIsLoading(false);
    router.push('/dashboard/admin/universities');
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
          <p className="text-muted-foreground">The item you are trying to edit does not exist or could not be loaded.</p>
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
          <CardTitle className="text-2xl">Edit Institution or Level</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
        <CardDescription>
          Modify the details for the item. Click save when you're done.
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
            {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
          </div>

          <div>
            <Label htmlFor="context">Context/Location</Label>
            <Input id="context" {...register("context")} placeholder="e.g. Addis Ababa or Preparatory" disabled={isLoading} className="mt-1" />
            {errors.context && <p className="text-sm text-destructive mt-1">{errors.context.message}</p>}
          </div>

          <div className="flex justify-end space-x-3">
             <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
