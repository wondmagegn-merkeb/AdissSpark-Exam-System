
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import type { Resource } from '@/lib/types';
import { ADMIN_RESOURCES_STORAGE_KEY, RESOURCE_ADMIN_TYPES } from '@/lib/constants';

const resourceSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  type: z.enum(RESOURCE_ADMIN_TYPES, { required_error: "Please select a resource type." }),
  subjectOrCourse: z.string().min(2, { message: "Subject/Course must be at least 2 characters." }),
  isPremium: z.boolean().default(false),
  imageUrl: z.string().url({ message: "Please enter a valid URL for the image." }).optional().or(z.literal('')),
  contentUrl: z.string().url({ message: "Please enter a valid URL for the content." }).optional().or(z.literal('')),
});

type ResourceFormValues = z.infer<typeof resourceSchema>;

export default function AddAdminResourcePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const { control, register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema),
    defaultValues: {
      title: '',
      description: '',
      type: undefined,
      subjectOrCourse: '',
      isPremium: false,
      imageUrl: '',
      contentUrl: '',
    },
  });

  const isPremium = watch('isPremium');

  const onSubmit = async (data: ResourceFormValues) => {
    setIsLoading(true);
    try {
      const storedResources = localStorage.getItem(ADMIN_RESOURCES_STORAGE_KEY);
      let resources: Resource[] = storedResources ? JSON.parse(storedResources) : [];
      
      const newResource: Resource = {
        id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...data,
        imageUrl: data.imageUrl || 'https://placehold.co/600x400.png', // Default placeholder
        dataAiHint: data.type, // Simple AI hint
      };
      resources.push(newResource);
      localStorage.setItem(ADMIN_RESOURCES_STORAGE_KEY, JSON.stringify(resources));

      toast({
        title: "Resource Added",
        description: `${data.title} has been successfully added.`,
      });
      reset(); 
      // router.push('/dashboard/admin/resources'); // Optionally redirect
    } catch (error) {
      console.error("Error saving resource to localStorage:", error);
      toast({
        title: "Error",
        description: "Failed to add resource. Please try again.",
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
          <CardTitle className="text-2xl">Add New Resource</CardTitle>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/resources')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resources List
          </Button>
        </div>
        <CardDescription>
          Fill in the details for the new study resource.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} disabled={isLoading} className="mt-1" />
            {errors.title && <p className="text-sm text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} disabled={isLoading} className="mt-1" rows={4} />
            {errors.description && <p className="text-sm text-destructive mt-1">{errors.description.message}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <Label htmlFor="type">Resource Type</Label>
                <Controller
                name="type"
                control={control}
                render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                    <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                        {RESOURCE_ADMIN_TYPES.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
                        ))}
                    </SelectContent>
                    </Select>
                )}
                />
                {errors.type && <p className="text-sm text-destructive mt-1">{errors.type.message}</p>}
            </div>
            <div>
                <Label htmlFor="subjectOrCourse">Subject / Course</Label>
                <Input id="subjectOrCourse" {...register("subjectOrCourse")} disabled={isLoading} className="mt-1" placeholder="e.g., Mathematics or Calculus I" />
                {errors.subjectOrCourse && <p className="text-sm text-destructive mt-1">{errors.subjectOrCourse.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL (Optional)</Label>
            <Input id="imageUrl" {...register("imageUrl")} disabled={isLoading} className="mt-1" placeholder="https://example.com/image.png" />
            {errors.imageUrl && <p className="text-sm text-destructive mt-1">{errors.imageUrl.message}</p>}
          </div>
           <div>
            <Label htmlFor="contentUrl">Content URL (Optional)</Label>
            <Input id="contentUrl" {...register("contentUrl")} disabled={isLoading} className="mt-1" placeholder="https://example.com/document.pdf or youtube.com/..." />
            {errors.contentUrl && <p className="text-sm text-destructive mt-1">{errors.contentUrl.message}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
                id="isPremium"
                checked={isPremium}
                onCheckedChange={(checked) => setValue('isPremium', checked)}
                disabled={isLoading}
            />
            <Label htmlFor="isPremium" className="cursor-pointer">
                Is this a Premium Resource?
            </Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push('/dashboard/admin/resources')} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Resource
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
