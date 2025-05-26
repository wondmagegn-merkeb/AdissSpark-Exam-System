
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

const institutionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(["University", "College", "School", "Grade Level"], { required_error: "Please select a type." }),
  context: z.string().min(2, { message: "Context/Location must be at least 2 characters." }),
});

type InstitutionFormValues = z.infer<typeof institutionSchema>;

export default function AddInstitutionPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, reset } = useForm<InstitutionFormValues>({
    resolver: zodResolver(institutionSchema),
    defaultValues: {
      name: '',
      type: undefined,
      context: '',
    },
  });

  const onSubmit = async (data: InstitutionFormValues) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("New Institution/Level Data:", data); 
    // In a real app, you would send this data to your backend.
    
    toast({
      title: "Item Added (Simulated)",
      description: `${data.name} (${data.type}) has been added.`,
    });
    setIsLoading(false);
    reset();
    // router.push('/dashboard/admin/universities'); // Removed redirection
    // To see the new item in the list, you'd need to implement a way to share/update state,
    // or refetch from a backend if this were a real application.
  };

  return (
    <Card className="shadow-lg max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl">Add New Institution or Level</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
        <CardDescription>
          Fill in the details for the new item. Click save when you're done.
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
              Save Item
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
