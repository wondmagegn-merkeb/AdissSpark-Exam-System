
"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { User, Edit, Save, ShieldCheck } from 'lucide-react';
import { STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM, STUDENT_TYPE_FORM_TO_KEY_MAP } from '@/lib/constants';
import type { StudentTypeFromRegistrationForm, StudentTypeFromRegistrationFormKey } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  email: z.string().email(),
  studentType: z.enum(STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM).optional(),
  institutionName: z.string().optional(),
  department: z.string().optional(),
  gradeLevel: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const studentKeyToFormMap = Object.fromEntries(
  Object.entries(STUDENT_TYPE_FORM_TO_KEY_MAP).map(([key, value]) => [value, key])
) as Record<StudentTypeFromRegistrationFormKey, StudentTypeFromRegistrationForm>;


export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
      studentType: user?.studentType ? studentKeyToFormMap[user.studentType] : undefined,
      institutionName: user?.institutionName || '',
      department: user?.department || '',
      gradeLevel: user?.gradeLevel || '',
    },
  });
  
  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const onSubmit = (data: ProfileFormValues) => {
    console.log("Profile updated (simulated):", data);
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
    setIsEditing(false);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                    <User className="h-8 w-8 text-primary" />
                    <div>
                        <CardTitle className="text-2xl">Your Profile</CardTitle>
                        <CardDescription>View and manage your personal information.</CardDescription>
                    </div>
                </div>
                <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'destructive' : 'default'}>
                    {isEditing ? 'Cancel' : <><Edit className="mr-2 h-4 w-4" /> Edit Profile</>}
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex flex-col items-center space-y-4 mb-8">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.image || `https://avatar.vercel.sh/${user?.email}.png`} alt={user?.name || "User"} />
                    <AvatarFallback className="text-3xl">{getInitials(user?.name)}</AvatarFallback>
                </Avatar>
                {user?.role === 'admin' && (
                    <div className="flex items-center text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Administrator Access
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...form.register("name")} disabled={!isEditing} className="mt-1" />
                {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...form.register("username")} disabled={!isEditing} className="mt-1" />
                {form.formState.errors.username && <p className="text-sm text-destructive mt-1">{form.formState.errors.username.message}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} disabled className="mt-1 bg-muted/50 cursor-not-allowed" />
              </div>
              <div>
                <Label htmlFor="studentType">Student Type</Label>
                 <Controller
                    name="studentType"
                    control={form.control}
                    render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value} disabled={!isEditing}>
                        <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select student type" />
                        </SelectTrigger>
                        <SelectContent>
                        {STUDENT_TYPES_ORDERED_FOR_REGISTRATION_FORM.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    )}
                />
              </div>
               {(user?.studentType === 'university' || user?.studentType === 'college') && (
                <>
                    <div>
                        <Label htmlFor="institutionName">Institution Name</Label>
                        <Input id="institutionName" {...form.register("institutionName")} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="department">Department</Label>
                        <Input id="department" {...form.register("department")} disabled={!isEditing} className="mt-1" />
                    </div>
                </>
               )}
               {(user?.studentType?.includes('school')) && (
                <>
                    <div>
                        <Label htmlFor="institutionName">School Name</Label>
                        <Input id="institutionName" {...form.register("institutionName")} disabled={!isEditing} className="mt-1" />
                    </div>
                    <div>
                        <Label htmlFor="gradeLevel">Grade Level</Label>
                        <Input id="gradeLevel" {...form.register("gradeLevel")} disabled={!isEditing} className="mt-1" />
                    </div>
                </>
               )}
            </div>
            {isEditing && (
              <div className="flex justify-end pt-4">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
