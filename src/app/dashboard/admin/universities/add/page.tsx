
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
import type { Institution, InstitutionType, InstitutionStatus } from '@/lib/types';
import { INSTITUTIONS_STORAGE_KEY, STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM } from '@/lib/constants';

const INSTITUTION_STATUSES: InstitutionStatus[] = ["active", "inactive"];

const institutionSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  type: z.enum(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM, { required_error: "Please select a type." }),
  context: z.string().min(2, { message: "Context/Location must be at least 2 characters." }),
  status: z.enum(INSTITUTION_STATUSES, { required_error: "Please select a status." }),
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
      status: 'active',
    },
  });

  const onSubmit = async (data: InstitutionFormValues) => {
    setIsLoading(true);

    try {
      const storedItems = localStorage.getItem(INSTITUTIONS_STORAGE_KEY);
      let institutions: Institution[] = storedItems ? JSON.parse(storedItems) : [];
      
      const newInstitution: Institution = {
        id: `inst-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
      };
      institutions.push(newInstitution);
      localStorage.setItem(INSTITUTIONS_STORAGE_KEY, JSON.stringify(institutions));

      toast({
        title: "Institution Added",
        description: `${data.name} (${data.type}) has been successfully added.`,
      });
      reset(); 
    } catch (error) {
      console.error("Error saving institution to localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to add institution. Please try again.",
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
          <CardTitle className="text-2xl">Add New Institution</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/universities')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to List
          </Button>
        </div>
        <CardDescription>
          Fill in the details for the new institution. Click save when you're done.
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
                    {STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM.map(type => (
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
          
          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {INSTITUTION_STATUSES.map(status => (
                       <SelectItem key={status} value={status} className="capitalize">{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-sm text-destructive mt-1">{errors.status.message}</p>}
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
